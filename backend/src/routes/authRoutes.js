//DEFINING WHICH ROUTES TRIGGER WHICH CONTROLLER FUNCTION, IN THIS CASE THE GOOGLE AUTHENTICATION ROUTE

const express = require("express");
const router = express.Router();
const { googleAuth } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/google", googleAuth);

//me endpoint for session testing - returns user info from JWT token if authenticated
router.get("/me", authMiddleware, (req, res) => {
  res.json({
    user: req.user
  });
});

module.exports = router;