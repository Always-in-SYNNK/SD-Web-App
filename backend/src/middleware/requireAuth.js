import jwt from "jsonwebtoken";
import { supabase } from "../config/supabaseClient.js";

/**
 * Unified auth middleware for split auth flows.
 *
 * Supported inputs:
 * - Bearer JWT in Authorization header (applicant/provider API calls)
 * - Session user in req.session.user (provider session flow)
 *
 * Output contract:
 * - Attaches req.user with normalized fields used by protected routes:
 *   { id, profileId, email, role, isAdmin, ...decoded }
 *
 * Why this exists:
 * - Some legacy tokens used different id shapes; profile lookup handles both.
 * - Downstream middleware/controllers can rely on one consistent user object.
 */

async function getProfileByTokenId(tokenUserId) {
  // Handle legacy token shapes: some tokens use profiles.user_id, others profiles.id.
  const { data: byUserId } = await supabase
    .from("profiles")
    .select("id, user_id, email, role, isAdmin")
    .eq("user_id", tokenUserId)
    .maybeSingle();

  if (byUserId) return byUserId;

  const { data: byProfileId } = await supabase
    .from("profiles")
    .select("id, user_id, email, role, isAdmin")
    .eq("id", tokenUserId)
    .maybeSingle();

  return byProfileId || null;
}

async function getProfileBySessionUser(sessionUser) {
  const { data } = await supabase
    .from("profiles")
    .select("id, user_id, email, role, isAdmin")
    .eq("email", sessionUser.email)
    .maybeSingle();

  return data || null;
}

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const profile = await getProfileByTokenId(decoded.id);

      if (!profile) {
        return res.status(401).json({ error: "Profile not found" });
      }

      req.user = {
        ...decoded,
        id: profile.user_id,
        profileId: profile.id,
        email: profile.email,
        role: profile.role,
        isAdmin: Boolean(profile.isAdmin),
      };

      return next();
    }

    if (req.session?.user?.email) {
      const profile = await getProfileBySessionUser(req.session.user);

      if (!profile) {
        return res.status(401).json({ error: "Profile not found" });
      }

      req.user = {
        id: profile.user_id,
        profileId: profile.id,
        email: profile.email,
        role: profile.role,
        isAdmin: Boolean(profile.isAdmin),
      };

      return next();
    }

    return res.status(401).json({ error: "No token or session provided" });
  } catch {
    return res.status(401).json({ error: "Invalid or expired authentication" });
  }
}