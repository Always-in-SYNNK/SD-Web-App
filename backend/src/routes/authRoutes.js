//DEFINING WHICH ROUTES TRIGGER WHICH CONTROLLER FUNCTION, IN THIS CASE THE GOOGLE AUTHENTICATION ROUTE

const express = require("express");
const router = express.Router();
const { googleAuth } = require("../controllers/authController");

router.post("/google", googleAuth);

module.exports = router;