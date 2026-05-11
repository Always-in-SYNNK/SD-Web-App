import { Router } from "express";
import { 
    getApplicationAnalytics, 
    getAdminApplicationAnalytics,
    getTrendAnalytics,
    exportAnalytics,
    getPlacementRates,
    getProviderPlacementRates
} from "../controllers/analyticsController.js";
import providerAuthMiddleware from "../middleware/providerAuthMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";  // ← ADD THIS
import { requireAuth } from "../middleware/requireAuth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();
//This router logs multiple messages at module load time (and on every hit for /test and /ping). 
// Unconditional console.log in production server code will add noise and can leak request metadata; 
// please remove these or gate behind an environment-controlled logger level.

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * @route   GET /api/analytics/test
 * @desc    Test endpoint to verify routes are working
 * @access  Public
 */
router.get("/test", (req, res) => {
  //console.log("✅ TEST ROUTE WAS HIT!");
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
  //console.log("🏓 PING ROUTE HIT!");
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
// Provider route (placement rates by sector for their opportunities)
router.get("/provider-placements", providerAuthMiddleware, getProviderPlacementRates);

// Admin route (ALL approved opportunities)
router.get("/admin/applications", requireAuth, requireAdmin, getAdminApplicationAnalytics);
// Admin route (global placement rates by sector)
router.get("/placements", requireAuth, requireAdmin, getPlacementRates);


/*
console.log('✅ Analytics routes registered:');
console.log('   - GET /api/analytics/test (public)');
console.log('   - GET /api/analytics/ping (public)');
console.log('   - GET /api/analytics/applications (provider)');
console.log('   - GET /api/analytics/trends (provider)');
console.log('   - GET /api/analytics/export (provider)');
console.log('   - GET /api/analytics/provider-placements (provider)');
console.log('   - GET /api/analytics/admin/applications (admin)');
console.log('   - GET /api/analytics/placements (admin)');
*/
export default router;