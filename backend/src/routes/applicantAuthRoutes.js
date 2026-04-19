// backend/src/routes/applicantAuthRoutes.js  (session-based — signin/signup)
import express from "express";
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { supabase } from "../config/supabaseClient.js";
import sendVerificationEmail from '../services/emailService.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(idToken) {
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    return {
        googleId: payload.sub,
        email:    payload.email,
        name:     payload.name,
        picture:  payload.picture
    };
}

// ── ENDPOINT 1: Check if User Exists ─────────────────────────────
router.post('/check-user', async (req, res) => {
    try {
        const { token, selectedRole } = req.body;
        const googleUser = await verifyGoogleToken(token);

        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', googleUser.email)
            .single();

        if (existingProfile) {
            return res.json({
                exists:   true,
                email:    googleUser.email,
                name:     googleUser.name,
                picture:  googleUser.picture,
                role:     existingProfile.role
            });
        }

        return res.json({
            exists:  false,
            email:   googleUser.email,
            name:    googleUser.name,
            picture: googleUser.picture
        });

    } catch (error) {
        res.status(401).json({ exists: false, error: 'Invalid token' });
    }
});

// ── ENDPOINT 2: Sign Up ───────────────────────────────────────────
router.post('/signup', async (req, res) => {
    try {
        const { token, selectedRole } = req.body;
        const googleUser = await verifyGoogleToken(token);

        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', googleUser.email)
            .single();

        if (existingProfile) {
            return res.json({
                success: false,
                exists:  true,
                message: 'Account already exists. Please sign in instead.'
            });
        }

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

        const verificationToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date();
        tokenExpires.setHours(tokenExpires.getHours() + 24);

        const { error: insertError } = await supabase
            .from('pending_verifications')
            .insert({
                email:              googleUser.email,
                name:               googleUser.name,
                google_id:          googleUser.googleId,
                picture:            googleUser.picture,
                selected_role:      selectedRole,
                verification_token: verificationToken,
                token_expires:      tokenExpires.toISOString(),
                email_verified:     false
            });

        if (insertError) throw insertError;

        await sendVerificationEmail(googleUser.email, verificationToken, googleUser.name);

        res.json({
            success: true,
            message: 'Verification email sent. Please check your inbox.',
            email:   googleUser.email
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ success: false, error: 'Signup failed' });
    }
});

// ── ENDPOINT 3: Get Pending Registration Data ─────────────────────
router.get('/pending-registration', async (req, res) => {
    try {
        const pendingEmail = req.session.pendingVerificationEmail;

        if (!pendingEmail) {
            return res.json({
                success: false,
                message: 'No pending registration found. Please verify your email first.'
            });
        }

        const { data: pending, error } = await supabase
            .from('pending_verifications')
            .select('*')
            .eq('email', pendingEmail)
            .single();

        if (error || !pending || !pending.email_verified) {
            return res.json({
                success: false,
                message: 'No pending registration found. Please verify your email first.'
            });
        }

        res.json({
            success: true,
            data: {
                email:        pending.email,
                name:         pending.name,
                selectedRole: pending.selected_role
            }
        });

    } catch (error) {
        res.json({ success: false, message: 'Error loading pending data' });
    }
});

// ── ENDPOINT 4: Complete Registration ────────────────────────────
router.post('/complete-registration', async (req, res) => {
    try {
        const { companyName, industry, contactPerson, phoneNumber, bio, location, nqfLevel } = req.body;
        const pendingEmail = req.session.pendingVerificationEmail;

        if (!pendingEmail) {
            return res.status(401).json({
                success: false,
                error: 'No pending registration found. Please verify your email first.'
            });
        }

        const { data: pending, error: pendingError } = await supabase
            .from('pending_verifications')
            .select('*')
            .eq('email', pendingEmail)
            .single();

        if (pendingError || !pending || !pending.email_verified) {
            return res.status(401).json({
                success: false,
                error: 'Please verify your email first.'
            });
        }

        const { data: authUser, error: authError } = await supabase.auth.signUp({
            email:    pending.email,
            password: crypto.randomBytes(16).toString('hex'),
            options:  { data: { full_name: pending.name, avatar_url: pending.picture } }
        });

        if (authError) throw authError;

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert({
                user_id:   authUser.user.id,
                role:      pending.selected_role,
                full_name: pending.name,
                email:     pending.email
            })
            .select()
            .single();

        if (profileError) throw profileError;

        if (pending.selected_role === 'applicant') {
            const { error: applicantError } = await supabase
                .from('applicant_profiles')
                .insert({
                    profile_id: profile.id,
                    bio:        bio || null,
                    location:   location || null,
                    nqf_level:  nqfLevel || null
                });
            if (applicantError) throw applicantError;
        } else {
            const { error: providerError } = await supabase
                .from('provider_profiles')
                .insert({
                    profile_id:        profile.id,
                    organisation_name: companyName,
                    organisation_type: industry,
                    description:       bio || null
                });
            if (providerError) throw providerError;
        }

        await supabase
            .from('pending_verifications')
            .delete()
            .eq('email', pending.email);

        req.session.pendingVerificationEmail = null;

        req.session.user = {
            id:    profile.id,
            email: pending.email,
            name:  pending.name,
            role:  pending.selected_role
        };

        res.json({ success: true, user: req.session.user });

    } catch (error) {
        console.error('Complete registration error:', error);
        res.status(500).json({ success: false, error: 'Registration failed: ' + error.message });
    }
});

// ── ENDPOINT 5: Sign In ───────────────────────────────────────────
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
                exists:  false,
                message: 'Account not found. Please sign up first.'
            });
        }

        // ── FIX: admins can sign in via any login page ──────────────
        // Only block the mismatch if the user is NOT an admin.
        // An admin who was originally a provider can still reach the
        // provider login page; their real role is preserved in the session.
        if (profile.role !== selectedRole && profile.role !== 'admin') {
            return res.json({
                success:      false,
                roleMismatch: true,
                message:      `This account is registered as a ${profile.role}. Please select the correct role.`
            });
        }

        // Always store the live DB role so "admin" is never overwritten
        // with the selectedRole the user clicked
        req.session.user = {
            id:      profile.id,
            email:   profile.email,
            name:    profile.full_name,
            role:    profile.role,           // ← DB value, not selectedRole
            isAdmin: profile.isAdmin ?? false
        };

        res.json({ success: true, user: req.session.user });

    } catch (error) {
        res.status(401).json({ success: false, error: 'Authentication failed' });
    }
});

// ── ENDPOINT 6: Logout ────────────────────────────────────────────
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});

// ── ENDPOINT 7: Get Current User ──────────────────────────────────
// Re-fetches profile from DB on every call so role/isAdmin changes
// (e.g. being granted admin) are reflected without requiring re-login
router.get('/me', async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.json({ authenticated: false, user: null });
    }

    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, role, full_name, email, "isAdmin"')
            .eq('id', req.session.user.id)
            .single();

        if (!profile) {
            return res.json({ authenticated: false, user: null });
        }

        // Keep session in sync with DB
        req.session.user = {
            ...req.session.user,
            role:    profile.role,
            isAdmin: profile.isAdmin ?? false,
            name:    profile.full_name,
        };

        return res.json({
            authenticated: true,
            user:          req.session.user,
        });

    } catch (err) {
        console.error('/me refresh error:', err);
        return res.json({
            authenticated: true,
            user:          req.session.user,
        });
    }
});

export default router;