//GENERATE JWT TOKEN AFTER GOOGLE AUTHENTICATION

const jwt = require("jsonwebtoken"); //dependancy to generate JWT tokens

function generateJWT(user) { //own token so we don't have to ask Google every time
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET, //signed proof that the token is valid and can be trusted
    { expiresIn: "1d" }
  );
}

module.exports = generateJWT; //file used in authController.js