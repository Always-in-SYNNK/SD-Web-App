// ============================================
// APPLICATION CONTROLLER
// This file handles HTTP requests and responses
// It receives the request, calls the service, then sends back the response
// ============================================

import { getApplicationsByOpportunity, updateApplicationStatus } from '../services/applicationService.js';

/**
 * GET /api/applications/opportunity/:opportunityId
 * 
 * WHAT IT DOES: Returns all applications for a specific job
 * 
 * EXAMPLE REQUEST: GET http://localhost:3000/api/applications/opportunity/123
 * EXAMPLE RESPONSE: { success: true, data: [...], count: 5 }
 */
export async function fetchApplicationsByOpportunity(req, res) {
    try {
        const { opportunityId } = req.params;
        const providerProfileId = req.user?.profileId;
        
        // Validate: Did they provide a job ID?
        if (!opportunityId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Job ID is required' 
            });
        }
        
        // Validate: Are they logged in?
        if (!providerProfileId) {
            return res.status(401).json({ 
                success: false, 
                error: 'You must be logged in' 
            });
        }
        
        // Get applications from the service
        const applications = await getApplicationsByOpportunity(opportunityId, providerProfileId);
        
        // Send success response
        res.json({
            success: true,
            data: applications,
            count: applications.length
        });
        
    } catch (error) {
        console.error('[Controller] Error:', error.message);
        
        // Send different error codes based on the error type
        if (error.message.includes('Unauthorized')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        
        res.status(500).json({ 
            success: false, 
            error: 'Something went wrong' 
        });
    }
}

/**
 * PATCH /api/applications/:applicationId
 * 
 * WHAT IT DOES: Updates an application's status (shortlist/reject)
 * 
 * EXAMPLE REQUEST: PATCH http://localhost:3000/api/applications/456
 * BODY: { "status": "shortlisted" }
 * EXAMPLE RESPONSE: { success: true, message: "Shortlisted successfully", data: {...} }
 */
export async function patchApplicationStatus(req, res) {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;
        const providerProfileId = req.user?.profileId;
        
        // Validate inputs
        if (!applicationId) {
            return res.status(400).json({ 
                success: false, 
                error: 'Application ID is required' 
            });
        }
        
        if (!status) {
            return res.status(400).json({ 
                success: false, 
                error: 'Status is required (shortlisted or rejected)' 
            });
        }
        
        // Update the status
        const updated = await updateApplicationStatus(applicationId, status, providerProfileId);
        
        const message = status === 'shortlisted' 
            ? 'Candidate shortlisted successfully' 
            : 'Candidate rejected successfully';
        
        res.json({
            success: true,
            message,
            data: updated
        });
        
    } catch (error) {
        console.error('[Controller] Error:', error.message);
        
        if (error.message.includes('Unauthorized')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        if (error.message.includes('Invalid status')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update status' 
        });
    }
}