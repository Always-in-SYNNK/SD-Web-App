// ============================================
// TEST FILE: applicationController.test.js
// Location: backend/tests/
// Tests HTTP request handling
// ============================================

import { jest } from '@jest/globals';

// Mock the service
const mockGetApplications = jest.fn();
const mockUpdateStatus = jest.fn();

jest.unstable_mockModule('../src/services/applicationService.js', () => ({
    getApplicationsByOpportunity: mockGetApplications,
    updateApplicationStatus: mockUpdateStatus
}));

const { fetchApplicationsByOpportunity, patchApplicationStatus } = 
    await import('../src/controllers/applicationController.js');

describe('Application Controller Tests', () => {
    let mockRequest;
    let mockResponse;

    beforeEach(() => {
        mockRequest = {
            params: {},
            body: {},
            user: { profileId: 'provider-123' }
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    // TEST 1: Missing opportunity ID
    test('GET - Returns 400 when opportunityId is missing', async () => {
        mockRequest.params = {};
        
        await fetchApplicationsByOpportunity(mockRequest, mockResponse);
        
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: 'Job ID is required'
        });
    });

    // TEST 2: Missing authentication
    test('GET - Returns 401 when user is not authenticated', async () => {
        mockRequest.params = { opportunityId: 'opp-123' };
        mockRequest.user = null;
        
        await fetchApplicationsByOpportunity(mockRequest, mockResponse);
        
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: 'You must be logged in'
        });
    });

    // TEST 3: Successful get applications
    test('GET - Returns 200 with applications on success', async () => {
        mockRequest.params = { opportunityId: 'opp-123' };
        const mockApplications = [
            { applicationId: 'app-1', status: 'received', applicant: { name: 'John Doe' } }
        ];
        mockGetApplications.mockResolvedValue(mockApplications);
        
        await fetchApplicationsByOpportunity(mockRequest, mockResponse);
        
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: true,
            data: mockApplications,
            count: 1
        });
    });

    // TEST 4: Unauthorized error
    test('GET - Returns 403 for unauthorized access', async () => {
        mockRequest.params = { opportunityId: 'opp-123' };
        mockGetApplications.mockRejectedValue(new Error('Unauthorized: You do not own this opportunity'));
        
        await fetchApplicationsByOpportunity(mockRequest, mockResponse);
        
        expect(mockResponse.status).toHaveBeenCalledWith(403);
    });

    // TEST 5: Missing application ID for update
    test('PATCH - Returns 400 when applicationId missing', async () => {
        mockRequest.params = {};
        mockRequest.body = { status: 'shortlisted' };
        
        await patchApplicationStatus(mockRequest, mockResponse);
        
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: 'Application ID is required'
        });
    });

    // TEST 6: Missing status for update
    test('PATCH - Returns 400 when status missing', async () => {
        mockRequest.params = { applicationId: 'app-123' };
        mockRequest.body = {};
        
        await patchApplicationStatus(mockRequest, mockResponse);
        
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: 'Status is required (shortlisted or rejected)'
        });
    });

    // TEST 7: Successful shortlist
    test('PATCH - Successfully shortlists application', async () => {
        mockRequest.params = { applicationId: 'app-123' };
        mockRequest.body = { status: 'shortlisted' };
        mockUpdateStatus.mockResolvedValue({ 
            applicationId: 'app-123', 
            status: 'shortlisted' 
        });
        
        await patchApplicationStatus(mockRequest, mockResponse);
        
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: true,
            message: 'Candidate shortlisted successfully',
            data: { applicationId: 'app-123', status: 'shortlisted' }
        });
    });

    // TEST 8: Successful reject
    test('PATCH - Successfully rejects application', async () => {
        mockRequest.params = { applicationId: 'app-123' };
        mockRequest.body = { status: 'rejected' };
        mockUpdateStatus.mockResolvedValue({ 
            applicationId: 'app-123', 
            status: 'rejected' 
        });
        
        await patchApplicationStatus(mockRequest, mockResponse);
        
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: true,
            message: 'Candidate rejected successfully',
            data: { applicationId: 'app-123', status: 'rejected' }
        });
    });
});
