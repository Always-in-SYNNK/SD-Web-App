//VERIFYING GOOGLE TOKEN 

const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  return ticket.getPayload(); //returns user info like email, name, sub (Google ID)
}

module.exports = verifyGoogleToken; // file used in authController.js