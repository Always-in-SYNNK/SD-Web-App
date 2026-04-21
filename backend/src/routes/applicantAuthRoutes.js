//DEFINING WHICH ROUTES TRIGGER WHICH CONTROLLER FUNCTION, IN THIS CASE THE GOOGLE AUTHENTICATION ROUTE
import express from "express";

const router = express.Router();
import { googleAuth } from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { supabase } from "../config/supabaseClient.js";


router.post("/google", googleAuth); // POST /api/auth/applicant/google??

//me endpoint for session testing - returns user info from JWT token if authenticated
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;