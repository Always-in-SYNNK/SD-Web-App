//CORE GOOGLE AUTHENTICATION LOGIC, GENERATES JWT TOKEN AFTER SUCCESSFUL AUTHENTICATION

const verifyGoogleToken = require("../config/googleAuth");
const generateJWT = require("../utils/generateJWT");

exports.googleAuth = async (req, res) => {
  try {
    const { token, role } = req.body;

    if (!role) {
      return res.status(400).json({ error: "Role required" });
    }

    const payload = await verifyGoogleToken(token);

    //temporary for now, will check DB later to see if the user exists and get their role
    const userData = { 
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: role,
    };

    const jwtToken = generateJWT(userData); //session token

    res.json({
      user: userData,
      token: jwtToken,
    });

  } catch (err) {
    res.status(401).json({ error: "Invalid Google token" });
  }
};