import { Router } from "express";
import { supabase } from "../config/supabaseClient.js";

const router = Router();

// Get all industries
router.get('/', async (req, res) => {
    try {
        const { data: industries, error } = await supabase
            .from('industries')
            .select('id, name, category')
            .eq('is_active', true)
            .order('name');

        if (error) throw error;

        res.json({ success: true, data: industries });
    } catch (error) {
        console.error('Error fetching industries:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get industry analytics (for admin dashboard)
router.get('/analytics', async (req, res) => {
    try {
        const { data: analytics, error } = await supabase
            .rpc('get_industry_analytics');

        if (error) throw error;

        // Calculate totals
        const totals = {
            totalProviders: analytics.reduce((sum, item) => sum + (item.provider_count || 0), 0),
            totalOpportunities: analytics.reduce((sum, item) => sum + (item.opportunity_count || 0), 0),
            totalApplications: analytics.reduce((sum, item) => sum + (item.total_applications || 0), 0),
            activeIndustries: analytics.filter(i => i.provider_count > 0 || i.opportunity_count > 0).length
        };

        res.json({ success: true, data: analytics, totals });
    } catch (error) {
        console.error('Error fetching industry analytics:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;