//CHECKS IF THE AUTHENTICATED USER HAS THE REQUIRED ROLE TO ACCESS THE ROUTE, AND RETURNS 403 FORBIDDEN IF NOT

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }

    next();
  };
}

module.exports = requireRole;