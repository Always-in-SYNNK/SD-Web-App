// ============================================
// PROVIDER AUTH MIDDLEWARE
// Specifically for provider/employer routes
// Supports BOTH session auth (Google OAuth) AND JWT tokens
// Does NOT affect existing authMiddleware used by other features
// ============================================

import jwt from "jsonwebtoken";

/**
 * Provider Authentication Middleware
 * Checks if the user is logged in AND is a provider
 * Use this ONLY for provider-specific routes
 */
async function providerAuthMiddleware(req, res, next) {
    console.log('[ProviderAuth] Checking authentication...');
    
    // ============================================
    // METHOD 1: Session-based auth (from Google OAuth)
    // This is what your ProviderLogin uses
    // ============================================
    if (req.session && req.session.user) {
        console.log(`[ProviderAuth] Session user found: ${req.session.user.email}`);
        
        // Check if user has provider role
        if (req.session.user.role !== 'provider') {
            return res.status(403).json({ 
                error: "Access denied. This feature is for employers only." 
            });
        }
        
        // Get the provider's profile ID from the database
        // You need to fetch this since it might not be in the session
        const { supabase } = await import("../config/supabaseClient.js");
        
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', req.session.user.email)
            .single();
        
        if (profileError || !profile) {
            return res.status(401).json({ error: "Profile not found" });
        }
        
        const { data: providerProfile, error: providerError } = await supabase
            .from('provider_profiles')
            .select('id')
            .eq('profile_id', profile.id)
            .single();
        
        if (providerError || !providerProfile) {
            return res.status(403).json({ error: "Provider profile not found" });
        }
        
        // Attach user info to request
        req.user = {
            id: profile.id,
            email: req.session.user.email,
            role: 'provider',
            profileId: providerProfile.id
        };
        
        return next();
    }
    
    // ============================================
    // METHOD 2: JWT token auth (for API calls)
    // ============================================
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided. Please log in." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user has provider role
        if (decoded.role !== 'provider') {
            return res.status(403).json({ error: "Access denied. Employers only." });
        }

        const { supabase } = await import("../config/supabaseClient.js");

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', decoded.id)
            .single();

        if (profileError || !profile) {
            return res.status(401).json({ error: "Profile not found" });
        }

        const { data: providerProfile, error: providerError } = await supabase
            .from('provider_profiles')
            .select('id')
            .eq('profile_id', profile.id)
            .single();

        if (providerError || !providerProfile) {
            return res.status(403).json({ error: "Provider profile not found" });
        }

        req.user = {
            ...decoded,
            profileId: providerProfile.id,
        };

        next();
    } catch {
        return res.status(401).json({ error: "Invalid or expired token. Please log in again." });
    }
}

export default providerAuthMiddleware;