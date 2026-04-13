//CORE GOOGLE AUTHENTICATION LOGIC, GENERATES JWT TOKEN AFTER SUCCESSFUL AUTHENTICATION

const verifyGoogleToken = require("../config/googleAuth");
const generateJWT = require("../utils/generateJWT");

// TEMP: replace with DB later
const users = []; 

exports.googleAuth = async (req, res) => {
  try {
    const { token, role: selectedRole } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Google token required" });
    }

    const payload = await verifyGoogleToken(token);

    const { sub, email, name } = payload;

    //Check if user exists (TEMPORARY - REPLACE WITH DB QUERY LATER)
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
    }

    const jwtToken = generateJWT({ //session token
      id: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({
      user,
      token: jwtToken,
    });

  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Invalid Google token" });
  }
};