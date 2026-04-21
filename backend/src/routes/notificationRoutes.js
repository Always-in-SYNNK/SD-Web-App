import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
    fetchNotifications,
    updateNotification,
    createNotificationHandler,
    triggerApplicationStatusNotification,
    triggerClosingDateNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

// applicant-facing
router.get("/", authMiddleware, fetchNotifications);
router.patch("/:id", authMiddleware, updateNotification);

// backend/manual trigger routes for development/testing
router.post("/", authMiddleware, createNotificationHandler);
router.post("/trigger/application-status", authMiddleware, triggerApplicationStatusNotification);
router.post("/trigger/closing-soon", authMiddleware, triggerClosingDateNotifications);

export default router;