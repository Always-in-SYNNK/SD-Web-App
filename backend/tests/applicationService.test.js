// ============================================
// TEST FILE: applicationService.test.js
// Location: backend/tests/
// Tests the business logic for applications
// ============================================

import { jest } from '@jest/globals';

// Mock Supabase client
const mockSupabase = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis()
};

// Mock the supabase module
jest.unstable_mockModule('../src/config/supabaseClient.js', () => ({
    supabase: mockSupabase
}));

// Import the actual service (after mocking)
const { getApplicationsByOpportunity, updateApplicationStatus } = 
    await import('../src/services/applicationService.js');

describe('Application Service Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // TEST 1: Get applications - Success
    test('UAT 1: Should return applications when provider owns opportunity', async () => {
        const mockOpportunityId = 'opp-123';
        const mockProviderId = 'provider-456';
        
        // Mock: Provider owns this opportunity
        mockSupabase.single.mockResolvedValueOnce({
            data: { provider_id: mockProviderId },
            error: null
        });
        
        // Mock: Applications exist
        mockSupabase.order.mockResolvedValue({
            data: [{
                id: 'app-1',
                status: 'received',
                created_at: '2024-01-15T10:00:00Z',
                applicant_profiles: {
                    profiles: {
                        full_name: 'John Doe',
                        email: 'john@example.com'
                    }
                }
            }],
            error: null
        });
        
        const result = await getApplicationsByOpportunity(mockOpportunityId, mockProviderId);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(1);
    });

    // TEST 2: Get applications - Unauthorized
    test('UAT 1: Should throw error when provider does NOT own opportunity', async () => {
        const mockOpportunityId = 'opp-123';
        const mockProviderId = 'provider-456';
        
        mockSupabase.single.mockResolvedValueOnce({
            data: { provider_id: 'different-provider' },
            error: null
        });
        
        await expect(getApplicationsByOpportunity(mockOpportunityId, mockProviderId))
            .rejects.toThrow('Unauthorized');
    });

    // TEST 3: Get applications - Opportunity not found
    test('UAT 1: Should throw error when opportunity not found', async () => {
        const mockOpportunityId = 'opp-123';
        const mockProviderId = 'provider-456';
        
        mockSupabase.single.mockResolvedValueOnce({
            data: null,
            error: new Error('Not found')
        });
        
        await expect(getApplicationsByOpportunity(mockOpportunityId, mockProviderId))
            .rejects.toThrow('Opportunity not found');
    });

    // TEST 4: Update status - Shortlist success
    test('UAT 2: Should update application status to shortlisted', async () => {
        const mockApplicationId = 'app-123';
        const mockProviderId = 'provider-456';
        
        mockSupabase.single
            .mockResolvedValueOnce({
                data: {
                    id: mockApplicationId,
                    status: 'received',
                    opportunity_id: 'opp-123',
                    opportunities: { provider_id: mockProviderId }
                },
                error: null
            })
            .mockResolvedValueOnce({
                data: { id: mockApplicationId, status: 'shortlisted' },
                error: null
            });
        
        const result = await updateApplicationStatus(mockApplicationId, 'shortlisted', mockProviderId);
        
        expect(result.status).toBe('shortlisted');
        expect(result.applicationId).toBe(mockApplicationId);
    });

    // TEST 5: Update status - Reject success
    test('UAT 2: Should update application status to rejected', async () => {
        const mockApplicationId = 'app-123';
        const mockProviderId = 'provider-456';
        
        mockSupabase.single
            .mockResolvedValueOnce({
                data: {
                    id: mockApplicationId,
                    status: 'received',
                    opportunity_id: 'opp-123',
                    opportunities: { provider_id: mockProviderId }
                },
                error: null
            })
            .mockResolvedValueOnce({
                data: { id: mockApplicationId, status: 'rejected' },
                error: null
            });
        
        const result = await updateApplicationStatus(mockApplicationId, 'rejected', mockProviderId);
        
        expect(result.status).toBe('rejected');
    });

    // TEST 6: Update status - Invalid status
    test('UAT 2: Should reject invalid status values', async () => {
        const mockApplicationId = 'app-123';
        const mockProviderId = 'provider-456';
        
        await expect(updateApplicationStatus(mockApplicationId, 'invalid-status', mockProviderId))
            .rejects.toThrow('Invalid status');
    });

    // TEST 7: Update status - Application not found
    test('UAT 2: Should throw error when application not found', async () => {
        const mockApplicationId = 'app-123';
        const mockProviderId = 'provider-456';
        
        mockSupabase.single.mockResolvedValueOnce({
            data: null,
            error: new Error('Not found')
        });
        
        await expect(updateApplicationStatus(mockApplicationId, 'shortlisted', mockProviderId))
            .rejects.toThrow('Application not found');
    });
});