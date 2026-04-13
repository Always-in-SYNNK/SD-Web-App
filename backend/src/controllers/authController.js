//CORE GOOGLE AUTHENTICATION LOGIC, GENERATES JWT TOKEN AFTER SUCCESSFUL AUTHENTICATION

const verifyGoogleToken = require("../config/googleAuth");
const generateJWT = require("../utils/generateJWT");
const supabase = require("../config/supabaseClient");

// TEMP: replace with DB later
//const users = []; 

exports.googleAuth = async (req, res) => {
  try {
    const { token, role: selectedRole } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Google token required" });
    }

    const payload = await verifyGoogleToken(token);
    const { sub, email, name } = payload;

    /*
    let user = users.find((u) => u.email === email);

    if (user) {
      console.log("Existing user login:", email);
    } else {
      if (!selectedRole) {
        return res.status(400).json({ error: "Role required for new users" });
      }

      user = {
        id: sub,
        email,
        name,
        role: selectedRole,
      };

      users.push(user);

      console.log("New user created:", user);
    } */

    // Check if user exists in DB
    const { data: existingProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    let profile;

    if (existingProfile){
      profile = existingProfile;
      console.log("Existing user login:", email);
    } else {

      if (!selectedRole) {
        return res.status(400).json({ error: "Role required for new users" });
      }
      const { data: newProfile, error} = await supabase //move functionality to userService later
        .from("profiles")
        .insert([{ id: sub, user_id: null, role: selectedRole, full_name: name, email }]) // Ignore supabase authentication for now, delete later
        .select()
        .single();

      profile = newProfile;

      //Create role-specific profile
      if (selectedRole === "applicant") {
        await supabase.from("applicant_profiles").insert([
          { profile_id: profile.id }  //as in sub
        ]);
      }

      if (selectedRole === "provider") {
        await supabase.from("provider_profiles").insert([
          { profile_id: profile.id }
        ]);
      }
    }

    const jwtToken = generateJWT({ //session token
      id: profile.id,
      email: profile.email,
      role: profile.role,
    });

    res.json({
      user: profile,
      token: jwtToken,
    });

  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Invalid Google token" });
  }
};