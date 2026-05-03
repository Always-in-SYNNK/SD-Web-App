import { Router } from "express";
import { 
    getApplicationAnalytics, 
    getTrendAnalytics,
    exportAnalytics 
} from "../controllers/analyticsController.js";
import providerAuthMiddleware from "../middleware/providerAuthMiddleware.js";

const router = Router();

// Apply authentication middleware to all analytics routes
router.use(providerAuthMiddleware);

/**
 * @route   GET /api/analytics/applications
 * @desc    Get application volume per opportunity
 * @access  Private (Provider only)
 * @returns Array of objects with opportunityTitle, count, status
 */
router.get("/applications", getApplicationAnalytics);

/**
 * @route   GET /api/analytics/trends
 * @desc    Get monthly application trends
 * @access  Private (Provider only)
 * @returns Array of monthly application counts
 */
router.get("/trends", getTrendAnalytics);

/**
 * @route   GET /api/analytics/export
 * @desc    Export analytics data as CSV-ready format
 * @access  Private (Provider only)
 * @returns Array of exportable data with metadata
 */
router.get("/export", exportAnalytics);

export default router;