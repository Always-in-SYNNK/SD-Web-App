//PROTECTS SENSITIVE ROUTES FROM UNAUTHORIZED ACCESS & WILL LATER ENABLE ROLE-BASED ACCESS CONTROL
//RUNS BEFORE PROTECTED ROUTES TO CHECK IF THE USER IS AUTHENTICATED, BY VERIFYING THE JWT TOKEN SENT IN THE AUTHORIZATION HEADER

const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if(!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; //extract JWT token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); //verify token and decode payload
    req.user = decoded; // { id, email, role }
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = authMiddleware;