import verifyGoogleToken from "../config/googleAuth.js";
import generateJWT from "../utils/generateJWT.js";
import { supabase } from "../config/supabaseClient.js";

export const googleAuth = async (req, res) => {
  try {
    const { token, selectedRole } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Google token required" });
    }

    let payload;
    try {
      payload = await verifyGoogleToken(token);
    } catch (verifyError) {
      console.error("Google token verification failed:", verifyError.message);
      return res.status(401).json({ error: "Invalid Google token" });
    }

    const { email, name } = payload;

    // ── Check if profile already exists ──────────────────────────────────────
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (existingProfile) {
      // Existing user — just issue a JWT
      const jwtToken = generateJWT({
        id: existingProfile.user_id,
        email: existingProfile.email,
        role: existingProfile.role,
      });
      return res.json({ user: existingProfile, token: jwtToken });
    }

    // ── New user ──────────────────────────────────────────────────────────────
    if (!selectedRole) {
      return res.status(400).json({ error: "Role required for new users" });
    }

    // Step 1: Check if auth user already exists (e.g., from a previous signup)
    let supabaseUserId;
    const { data: existingAuthUser } = await supabase.auth.admin.listUsers();
    const authUserExists = existingAuthUser?.users?.some(u => u.email === email);

    if (authUserExists) {
      // Use existing auth user
      const foundUser = existingAuthUser.users.find(u => u.email === email);
      supabaseUserId = foundUser.id;
    } else {
      // Create a new Supabase Auth user so user_id FK is valid
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,         // skip confirmation email, Google already verified them
        user_metadata: { full_name: name },
      });

      if (authError) {
        console.error("Auth user creation failed:", authError);
        return res.status(500).json({ error: "Failed to create auth user" });
      }

      supabaseUserId = authData.user.id; // real UUID from auth.users
    }

    // Step 2: Insert into profiles using the Supabase Auth UUID
    const { data: newProfile, error: profileError } = await supabase
      .from("profiles")
      .insert([{
        user_id: supabaseUserId,   // valid FK → auth.users(id)
        role: selectedRole,
        full_name: name,
        email,
        // id is omitted — let Postgres generate it via gen_random_uuid()
      }])
      .select()
      .single();

    if (profileError) {
      console.error("Profile insert failed:", profileError);
      return res.status(500).json({ error: "Failed to create profile" });
    }

    // Step 3: Create role-specific profile using profiles.id (the generated UUID)
    if (selectedRole === "applicant") {
      const { error: applicantError } = await supabase
        .from("applicant_profiles")
        .insert([{ profile_id: newProfile.id }]);

      if (applicantError) {
        console.error("Applicant profile insert failed:", applicantError);
        return res.status(500).json({ error: "Failed to create applicant profile" });
      }
    }
/* I probably shouldn't be handling this logic
    if (selectedRole === "provider") {
      const { error: providerError } = await supabase
        .from("provider_profiles")
        .insert([{ profile_id: newProfile.id }]);  // note: organisation_name & type are NOT NULL — see below

      if (providerError) {
        console.error("Provider profile insert failed:", providerError);
        return res.status(500).json({ error: "Failed to create provider profile" });
      }
    }
*/
    const jwtToken = generateJWT({
      id: newProfile.user_id,
      email: newProfile.email,
      role: newProfile.role,
    });

    res.json({ user: newProfile, token: jwtToken });

  } catch (err) {
    console.error("Auth error:", err);
    res.status(500).json({ error: "Authentication failed" });
  }
};