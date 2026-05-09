import { Router } from "express";
import { 
    getApplicationAnalytics, 
    getTrendAnalytics,
    exportAnalytics 
} from "../controllers/analyticsController.js";
import providerAuthMiddleware from "../middleware/providerAuthMiddleware.js";

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

/**
 * @route   GET /api/analytics/applications
 * @desc    Get application volume per opportunity
 * @access  Private (Provider only)
 * @returns Array of objects with opportunityTitle, count, status
 */
router.get("/applications", providerAuthMiddleware, getApplicationAnalytics);

/**
 * @route   GET /api/analytics/trends
 * @desc    Get monthly application trends
 * @access  Private (Provider only)
 * @returns Array of monthly application counts
 */
router.get("/trends", providerAuthMiddleware, getTrendAnalytics);

/**
 * @route   GET /api/analytics/export
 * @desc    Export analytics data as CSV-ready format
 * @access  Private (Provider only)
 * @returns Array of exportable data with metadata
 */
router.get("/export", providerAuthMiddleware, exportAnalytics);

console.log('✅ Analytics routes registered:');
console.log('   - GET /api/analytics/test (public)');
console.log('   - GET /api/analytics/ping (public)');
console.log('   - GET /api/analytics/applications (protected)');
console.log('   - GET /api/analytics/trends (protected)');
console.log('   - GET /api/analytics/export (protected)');

export default router;