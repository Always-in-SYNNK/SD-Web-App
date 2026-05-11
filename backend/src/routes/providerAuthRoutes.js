// ============================================
// IMPORT REQUIRED PACKAGES
// ============================================

// express: Web framework for handling HTTP requests and responses
// Used to create router endpoints (GET, POST, etc.)
import express from "express";


// crypto: Built-in Node.js module for generating secure random strings
// Used to create unique verification tokens that cannot be guessed
import crypto from 'crypto';

// OAuth2Client: Google's library for verifying ID tokens
// Confirms that the user's Google sign-in is legitimate
import { OAuth2Client } from 'google-auth-library';


// supabase: Database client to connect to your Supabase backend
// Stores and retrieves user profiles, pending verifications, etc.
import { supabase } from "../config/supabaseClient.js";

// sendVerificationEmail: Custom function that sends email verification links
// Imported from the email service file
import sendVerificationEmail from '../services/emailService.js';
import generateJWT from '../utils/generateJWT.js';
// ============================================
// CREATE ROUTER
// ============================================
// router: Creates a mini-express app for handling auth routes
// These routes will be mounted at '/api/auth' in server.js
const router = express.Router();

// ============================================
// INITIALIZE GOOGLE OAUTH CLIENT
// ============================================
// googleClient: Used to verify Google ID tokens
// The client ID comes from your .env file (Google Cloud Console)
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ============================================
// HELPER FUNCTION: Verify Google Token
// ============================================
// This function is called whenever a user signs in with Google
// It ensures the token is valid and hasn't been tampered with
async function verifyGoogleToken(idToken) {
    // verifyIdToken: Asks Google to confirm this token is legitimate
    // audience: Ensures the token was created for YOUR app (not someone else's)
    const ticket = await googleClient.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    
    // getPayload: Extracts the user information from the verified token
    // Contains: email, name, profile picture, unique Google ID
    const payload = ticket.getPayload();
    
    // Return only the information we need for our app
    return {
        googleId: payload.sub,      // sub = Google's unique user identifier
        email: payload.email,        // User's email address (e.g., hr@company.co.za)
        name: payload.name,          // User's full name
        picture: payload.picture     // URL to user's profile picture
    };
}

// ============================================
// ENDPOINT 1: Check if User Exists
// POST /api/auth/check-user
// ============================================
// Purpose: Before showing registration form, check if this email is already registered
// Called from frontend after Google sign-in but before showing forms
router.post('/check-user', async (req, res) => {
    try {
        // Extract the Google token and selected role from request body
        // Body comes from frontend: { token: "google_id_token", selectedRole: "provider" }
        const { token, selectedRole } = req.body;
        
        // Verify the Google token and get user information
        const googleUser = await verifyGoogleToken(token);
        
        // Query Supabase to find if this email already exists in profiles table
        // profiles table stores ALL registered users (applicants and providers)
        const { data: existingProfile } = await supabase
            .from('profiles')           // Check the profiles table
            .select('*')                // Get all columns
            .eq('email', googleUser.email)  // Where email matches
            .single();                  // Expect only one result
        
        // If user exists, return their information to the frontend
        if (existingProfile) {
            return res.json({
                exists: true,                           // Tell frontend user exists
                email: googleUser.email,                // Return email
                name: googleUser.name,                  // Return name
                picture: googleUser.picture,            // Return profile picture
                role: existingProfile.role              // Return role (applicant/provider/admin)
            });
        }
        
        // If user does NOT exist, return false so frontend shows registration form
        return res.json({
            exists: false,                              // Tell frontend user is new
            email: googleUser.email,                    // Return email for registration form
            name: googleUser.name,                      // Return name for registration form
            picture: googleUser.picture                 // Return picture for profile
        });
        
    } catch (error) {
        // If anything fails (invalid token, network error), return error
        res.status(401).json({ exists: false, error: 'Invalid token' });
    }
});

// ============================================
// ENDPOINT 2: Sign Up (Start Registration)
// POST /api/auth/signup
// ============================================
// Purpose: Create a pending verification record and send email
// Called after Google sign-in when user is NEW
router.post('/signup', async (req, res) => {
    try {
        // Extract token and role from request body
        const { token, selectedRole } = req.body;
        
        // Verify Google token and get user info
        const googleUser = await verifyGoogleToken(token);
        
        // Check if user already exists in profiles (prevents duplicate signup)
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', googleUser.email)
            .single();
        
        if (existingProfile) {
            return res.json({
                success: false,
                exists: true,
                message: 'Account already exists. Please sign in instead.'
            });
        }
        
        // Check if user already has a pending verification (prevents multiple emails)
        const { data: existingPending } = await supabase
            .from('pending_verifications')
            .select('*')
            .eq('email', googleUser.email)
            .single();
        
        if (existingPending) {
            return res.json({
                success: false,
                pending: true,
                message: 'Verification email already sent. Please check your inbox.'
            });
        }
        
        // Generate a unique verification token
        // crypto.randomBytes(32) creates 32 random bytes (64 characters in hex)
        // This token is impossible to guess, ensuring security
        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        // Set expiration time (24 hours from now)
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 24);
        
        // Store pending verification in Supabase
        // This record exists until user completes registration or token expires
        const { error: insertError } = await supabase
            .from('pending_verifications')
            .insert({
                email: googleUser.email,                    // User's email
                name: googleUser.name,                      // User's name
                google_id: googleUser.googleId,             // Google's unique ID
                picture: googleUser.picture,                // Profile picture URL
                selected_role: selectedRole,                // 'applicant' or 'provider'
                verification_token: verificationToken,     // Random unique token
                token_expires: tokenExpires.toISOString(),  // Expiration timestamp
                email_verified: false                       // Not verified yet
            });
        
        if (insertError) throw insertError;
        
        // Send verification email to user's inbox
        // This email contains a link with the verification token
        await sendVerificationEmail(googleUser.email, verificationToken, googleUser.name);
        
        // Return success response to frontend
        res.json({
            success: true,
            message: 'Verification email sent. Please check your inbox.',
            email: googleUser.email
        });
        
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, error: 'Signup failed' });
    }
});

// ============================================
// ENDPOINT 3: Get Pending Registration Data
// GET /api/auth/pending-registration
// ============================================
// Purpose: Retrieve pending user data for the registration form
// Called when registration.html page loads
router.get('/pending-registration', async (req, res) => {
    try {
        // Get the email from session (set when user clicked verification link)
        // session.pendingVerificationEmail is set in server.js /verify-email route
        const pendingEmail = req.session.pendingVerificationEmail;
        
        // If no email in session, user hasn't verified yet
        if (!pendingEmail) {
            return res.json({
                success: false,
                message: 'No pending registration found. Please verify your email first.'
            });
        }
        
        // Query Supabase for the pending verification record
        const { data: pending, error } = await supabase
            .from('pending_verifications')
            .select('*')
            .eq('email', pendingEmail)
            .single();
        
        // If no record or email not verified, reject
        if (error || !pending || !pending.email_verified) {
            return res.json({
                success: false,
                message: 'No pending registration found. Please verify your email first.'
            });
        }
        
        // Return the pending user data to the registration form
        res.json({
            success: true,
            data: {
                email: pending.email,              // For display
                name: pending.name,                // For display
                selectedRole: pending.selected_role  // 'applicant' or 'provider'
            }
        });
        
    } catch (error) {
        res.json({ success: false, message: 'Error loading pending data' });
    }
});

// ============================================
// ENDPOINT 4: Complete Registration
// POST /api/auth/complete-registration
// ============================================
// Purpose: Save user to database after they submit the registration form
// Creates records in: auth.users, profiles, and applicant_profiles/provider_profiles
router.post('/complete-registration', async (req, res) => {
    try {
        // Extract form data from request body
        // Different fields for applicants vs providers
        const { companyName, industry, contactPerson, phoneNumber, bio, location, nqfLevel } = req.body;
        
        // Get the email from session (set during verification)
        const pendingEmail = req.session.pendingVerificationEmail;
        
        // If no email in session, user hasn't verified
        if (!pendingEmail) {
            return res.status(401).json({
                success: false,
                error: 'No pending registration found. Please verify your email first.'
            });
        }
        
        // Get the pending record from Supabase
        const { data: pending, error: pendingError } = await supabase
            .from('pending_verifications')
            .select('*')
            .eq('email', pendingEmail)
            .single();
        
        // Verify email was confirmed
        if (pendingError || !pending || !pending.email_verified) {
            return res.status(401).json({
                success: false,
                error: 'Please verify your email first.'
            });
        }
        
        // ============================================
        // STEP 1: Create user in Supabase Auth
        // ============================================
        // This creates a secure login record for the user
        // Even though they use Google, Supabase Auth needs a record
        const { data: authUser, error: authError } = await supabase.auth.signUp({
            email: pending.email,
            // Generate random password (user will use Google, not password)
            password: crypto.randomBytes(16).toString('hex'),
            options: {
                data: {
                    full_name: pending.name,
                    avatar_url: pending.picture
                }
            }
        });
        
        if (authError) throw authError;
        
        // ============================================
        // STEP 2: Create record in profiles table
        // ============================================
        // profiles is the main user table that links to all role-specific tables
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert({
                user_id: authUser.user.id,    // Links to Supabase Auth
                role: pending.selected_role,   // 'applicant' or 'provider'
                full_name: pending.name,
                email: pending.email
            })
            .select()
            .single();
        
        if (profileError) throw profileError;
        
        // ============================================
        // STEP 3: Create role-specific profile
        // ============================================
        
        if (pending.selected_role === 'applicant') { //WHY IS THIS HERE TASH???
            // Insert into applicant_profiles table
            const { error: applicantError } = await supabase
                .from('applicant_profiles')
                .insert({
                    profile_id: profile.id,      // Links to profiles table
                    bio: bio || null,            // About the applicant
                    location: location || null,   // City/area
                    nqf_level: nqfLevel || null   // Education level (4-10)
                });
            if (applicantError) throw applicantError;
            
        } else {
            // Insert into provider_profiles table (for employers/SETAs)
            const { error: providerError } = await supabase
                .from('provider_profiles')
                .insert({
                    profile_id: profile.id,               // Links to profiles table
                    organisation_name: companyName,       // Company/SETA name
                    organisation_type: industry,          // Technology, Finance, etc.
                    description: bio || null              // About the organization
                });
            if (providerError) throw providerError;
        }
        
        // ============================================
        // STEP 4: Clean up - Delete pending record
        // ============================================
        // Remove from pending_verifications since registration is complete
        await supabase
            .from('pending_verifications')
            .delete()
            .eq('email', pending.email);
        
        // Clear the session variable
        req.session.pendingVerificationEmail = null;
        
        // ============================================
        // STEP 5: Create user session (log them in)
        // ============================================
        // This creates the session cookie that keeps user logged in
        req.session.user = {
            id: profile.id,
            email: pending.email,
            name: pending.name,
            role: pending.selected_role
        };
        
        // Return success with user data (frontend will redirect to dashboard)
        res.json({ success: true, user: req.session.user });
        
    } catch (error) {
        console.error('Complete registration error:', error);
        res.status(500).json({ success: false, error: 'Registration failed: ' + error.message });
    }
});

// ============================================
// ENDPOINT 5: Sign In (Existing User)
// POST /api/auth/signin
// ============================================
router.post('/signin', async (req, res) => {
    try {
        const { token, selectedRole } = req.body;
        
        const googleUser = await verifyGoogleToken(token);
        
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', googleUser.email)
            .single();
        
        if (!profile) {
            return res.json({
                success: false,
                exists: false,
                message: 'Account not found. Please sign up first.'
            });
        }
        
        if (profile.role !== selectedRole) {
            return res.json({
                success: false,
                roleMismatch: true,
                message: `This account is registered as a ${profile.role}. Please select the correct role.`
            });
        }
        
        // ✅ ADD THIS - Import at the top of the file
        // At the top of providerAuthRoutes.js, add:
        // import generateJWT from '../utils/generateJWT.js';
        
        // ✅ Generate JWT token
        const jwtToken = generateJWT({
            id: profile.id, //profile.user_id is the auth.users id, profile.id is the profiles table id
            email: profile.email,
            role: "provider",
            isAdmin: Boolean(profile.isAdmin)
        });
        
        // Create session
        req.session.user = {
            id: profile.id,
            email: profile.email,
            name: profile.full_name,
            role: profile.role
        };
        
        // ✅ RETURN TOKEN IN RESPONSE
        res.json({ 
            success: true, 
            user: profile,
            token: jwtToken  // ← ADD THIS LINE
        });
        
    } catch (error) {
        res.status(401).json({ success: false, error: 'Authentication failed' });
    }
});

// ============================================
// ENDPOINT 6: Logout
// POST /api/auth/logout
// ============================================
// Purpose: Destroy the user's session (log them out)
// Called when user clicks "Sign Out" button
router.post('/logout', (req, res) => {
    // session.destroy: Completely removes the session from the server
    // This invalidates the cookie and logs the user out
    req.session.destroy(() => {
        // clearCookie: Tells browser to delete the session cookie
        res.clearCookie('connect.sid');
        
        // Return success to frontend
        res.json({ success: true });
    });
});

// ============================================
// ENDPOINT 7: Get Current User
// GET /api/auth/me
// ============================================
// Purpose: Check if user is logged in and get their information
// Called when page loads to verify authentication status
router.get('/me', (req, res) => {
    // Check if session exists and has user data
    if (req.session && req.session.user) {
        // User is logged in - return their info
        res.json({ 
            authenticated: true, 
            user: req.session.user 
        });
    } else {
        // User is not logged in
        res.json({ 
            authenticated: false, 
            user: null 
        });
    }
});

// ============================================
// EXPORT ROUTER
// ============================================
// Makes these routes available to server.js
// server.js uses: app.use('/api/auth', authRoutes)
export default router;