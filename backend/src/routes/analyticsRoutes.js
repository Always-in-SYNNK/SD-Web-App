import { Router } from "express";
import { 
    getApplicationAnalytics, 
    getAdminApplicationAnalytics,
    getTrendAnalytics,
    exportAnalytics 
} from "../controllers/analyticsController.js";
import providerAuthMiddleware from "../middleware/providerAuthMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";  // ← ADD THIS

const router = Router();

console.log('🔧 ANALYTICS ROUTES BEING LOADED...');

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * @route   GET /api/analytics/test
 * @desc    Test endpoint to verify routes are working
 * @access  Public
 */
router.get("/test", (req, res) => {
  console.log("✅ TEST ROUTE WAS HIT!");
  console.log("📋 Authorization header:", req.headers.authorization);
  res.json({ 
    success: true, 
    message: "Test route works!",
    authHeader: req.headers.authorization || "No auth header sent",
    timestamp: new Date().toISOString()
  });
});

/**
 * @route   GET /api/analytics/ping
 * @desc    Simple ping endpoint to check if API is responding
 * @access  Public
 */
router.get("/ping", (req, res) => {
  console.log("🏓 PING ROUTE HIT!");
  res.json({ 
    success: true, 
    message: "pong",
    timestamp: new Date().toISOString()
  });
});

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

// Provider routes (their own opportunities - all statuses)
router.get("/applications", providerAuthMiddleware, getApplicationAnalytics);
router.get("/trends", providerAuthMiddleware, getTrendAnalytics);
router.get("/export", providerAuthMiddleware, exportAnalytics);

// Admin route (ALL approved opportunities)
router.get("/admin/applications", authMiddleware, getAdminApplicationAnalytics);

console.log('✅ Analytics routes registered:');
console.log('   - GET /api/analytics/test (public)');
console.log('   - GET /api/analytics/ping (public)');
console.log('   - GET /api/analytics/applications (provider)');
console.log('   - GET /api/analytics/trends (provider)');
console.log('   - GET /api/analytics/export (provider)');
console.log('   - GET /api/analytics/admin/applications (admin)');

export default router;