// ============================================
// PROVIDER AUTH MIDDLEWARE
// Specifically for provider/employer routes
// Supports BOTH session auth (Google OAuth) AND JWT tokens
// Does NOT affect existing authMiddleware used by other features
// ============================================

import jwt from "jsonwebtoken";
console.log('🔧 PROVIDER AUTH MIDDLEWARE FILE LOADED');

/**
 * Provider Authentication Middleware
 * Checks if the user is logged in AND is a provider
 * Use this ONLY for provider-specific routes
 */
async function providerAuthMiddleware(req, res, next) {
    console.log('🔐 [ProviderAuth] ===== MIDDLEWARE STARTED =====');
    console.log('🔐 [ProviderAuth] Request path:', req.path);
    console.log('🔐 [ProviderAuth] Request method:', req.method);
    console.log('🔐 [ProviderAuth] Authorization header:', req.headers.authorization);
    
    // ============================================
    // PRIORITY 1: Check JWT token FIRST (for API calls from frontend)
    // ============================================
    const authHeader = req.headers.authorization;

    console.log('[ProviderAuth] ===== JWT DEBUG =====');
    console.log('[ProviderAuth] Authorization header exists:', !!authHeader);
    console.log('[ProviderAuth] Authorization header:', authHeader ? authHeader.substring(0, 50) + '...' : 'none');

    if (authHeader && authHeader.startsWith("Bearer ")) {
        console.log('[ProviderAuth] 🔑 JWT token found, using token auth');
        
        const token = authHeader.split(" ")[1];
        console.log('[ProviderAuth] Token received:', token.substring(0, 50) + '...');
        console.log('[ProviderAuth] Token length:', token.length);
        console.log('[ProviderAuth] JWT_SECRET exists:', !!process.env.JWT_SECRET);

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('[ProviderAuth] ✅ Token verified successfully');
            console.log('[ProviderAuth] Decoded token:', JSON.stringify(decoded, null, 2));
            
            // Check if user has provider role
            if (decoded.role !== 'provider') {
                console.log('[ProviderAuth] Role mismatch. Expected provider, got:', decoded.role);
                return res.status(403).json({ error: "Access denied. Employers only." });
            }

            console.log('[ProviderAuth] ✅ Role check passed');

            const { supabase } = await import("../config/supabaseClient.js");

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', decoded.id)
                .single();

            if (profileError || !profile) {
                console.log('[ProviderAuth] ❌ Profile not found:', profileError);
                return res.status(401).json({ error: "Profile not found" });
            }

            console.log('[ProviderAuth] ✅ Profile found:', profile.id);

            const { data: providerProfile, error: providerError } = await supabase
                .from('provider_profiles')
                .select('id')
                .eq('profile_id', profile.id)
                .single();

            if (providerError || !providerProfile) {
                console.log('[ProviderAuth] ❌ Provider profile not found:', providerError);
                return res.status(403).json({ error: "Provider profile not found" });
            }

            console.log('[ProviderAuth] ✅ Provider profile found:', providerProfile.id);
            console.log('[ProviderAuth] ✅ Authentication successful for user:', decoded.email);

            req.user = {
                ...decoded,
                profileId: providerProfile.id,
            };

            return next();
            
        } catch (error) {
            console.error('[ProviderAuth] ❌ JWT Verification Error:', error.message);
            console.error('[ProviderAuth] Error type:', error.name);
            
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ error: "Invalid token format. Please log in again." });
            }
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: "Token expired. Please log in again." });
            }
            
            return res.status(401).json({ error: "Invalid or expired token. Please log in again." });
        }
    }
    
    // ============================================
    // PRIORITY 2: Session-based auth (from Google OAuth for browser)
    // ============================================
    if (req.session && req.session.user) {
        console.log(`[ProviderAuth] Session user found: ${req.session.user.email}`);
        
        // Check if user has provider role
        if (req.session.user.role !== 'provider') {
            console.log('[ProviderAuth] Session user is not provider');
            return res.status(403).json({ 
                error: "Access denied. This feature is for employers only." 
            });
        }
        
        // Get the provider's profile ID from the database
        const { supabase } = await import("../config/supabaseClient.js");
        
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', req.session.user.email)
            .single();
        
        if (profileError || !profile) {
            console.log('[ProviderAuth] Profile not found for session user');
            return res.status(401).json({ error: "Profile not found" });
        }
        
        const { data: providerProfile, error: providerError } = await supabase
            .from('provider_profiles')
            .select('id')
            .eq('profile_id', profile.id)
            .single();
        
        if (providerError || !providerProfile) {
            console.log('[ProviderAuth] Provider profile not found for session user');
            return res.status(403).json({ error: "Provider profile not found" });
        }
        
        // Attach user info to request
        req.user = {
            id: profile.id,
            email: req.session.user.email,
            role: 'provider',
            profileId: providerProfile.id
        };
        
        console.log('[ProviderAuth] ✅ Session auth successful for:', req.session.user.email);
        return next();
    }
    
    // ============================================
    // No auth found
    // ============================================
    console.log('[ProviderAuth] ❌ No token AND no session');
    return res.status(401).json({ error: "No token provided. Please log in." });
}

export default providerAuthMiddleware;