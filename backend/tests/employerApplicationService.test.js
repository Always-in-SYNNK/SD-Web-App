import { jest } from '@jest/globals';

// Mock Supabase
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis()
};

jest.unstable_mockModule('../src/config/supabaseClient.js', () => ({
  supabase: mockSupabase
}));

// Import after mock
const { getApplicationsByOpportunity, updateApplicationStatus } = 
  await import('../src/services/employerApplicationService.js');

describe('Employer Application Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // TEST 1: Get applications - Success
  // ============================================
  test('getApplicationsByOpportunity - should return formatted applications', async () => {
    const mockOpportunityId = 'opp-123';
    const mockProviderId = 'provider-456';

    mockSupabase.single.mockResolvedValueOnce({
      data: { provider_id: mockProviderId },
      error: null
    });

    const mockApplications = [{
      id: 'app-1',
      status: 'received',
      created_at: '2024-01-01',
      applicant_profiles: {
        id: 'profile-1',
        bio: 'Experienced developer',
        location: 'Cape Town',
        nqf_level: 7,
        cv_url: 'https://cv.pdf',
        profile_id: 'user-1',
        profiles: {
          full_name: 'John Doe',
          email: 'john@example.com'
        }
      }
    }];

    mockSupabase.order.mockResolvedValue({
      data: mockApplications,
      error: null
    });

    const result = await getApplicationsByOpportunity(mockOpportunityId, mockProviderId);

    expect(result).toHaveLength(1);
    expect(result[0].applicationId).toBe('app-1');
    expect(result[0].status).toBe('received');
    expect(result[0].applicant.name).toBe('John Doe');
    expect(result[0].applicant.email).toBe('john@example.com');
  });

  // ============================================
  // TEST 2: Get applications - Unauthorized
  // ============================================
  test('getApplicationsByOpportunity - throws error when provider does not own opportunity', async () => {
    const mockOpportunityId = 'opp-123';
    const mockProviderId = 'provider-456';

    mockSupabase.single.mockResolvedValueOnce({
      data: { provider_id: 'different-provider' },
      error: null
    });

    await expect(getApplicationsByOpportunity(mockOpportunityId, mockProviderId))
      .rejects.toThrow('Unauthorized');
  });

  // ============================================
  // TEST 3: Get applications - Opportunity not found
  // ============================================
  test('getApplicationsByOpportunity - throws error when opportunity not found', async () => {
    const mockOpportunityId = 'opp-123';
    const mockProviderId = 'provider-456';

    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: new Error('Not found')
    });

    await expect(getApplicationsByOpportunity(mockOpportunityId, mockProviderId))
      .rejects.toThrow('Opportunity not found');
  });

  // ============================================
  // TEST 4: Update status - Shortlist
  // ============================================
  test('updateApplicationStatus - should update to shortlisted', async () => {
    const mockApplicationId = 'app-123';
    const mockProviderId = 'provider-456';

    mockSupabase.single.mockResolvedValueOnce({
      data: {
        id: mockApplicationId,
        status: 'received',
        opportunity_id: 'opp-123',
        opportunities: { provider_id: mockProviderId }
      },
      error: null
    });

    mockSupabase.single.mockResolvedValueOnce({
      data: { id: mockApplicationId, status: 'shortlisted' },
      error: null
    });

    const result = await updateApplicationStatus(mockApplicationId, 'shortlisted', mockProviderId);

    expect(result.status).toBe('shortlisted');
    expect(result.applicationId).toBe(mockApplicationId);
  });

  // ============================================
  // TEST 5: Update status - Reject
  // ============================================
  test('updateApplicationStatus - should update to rejected', async () => {
    const mockApplicationId = 'app-123';
    const mockProviderId = 'provider-456';

    mockSupabase.single.mockResolvedValueOnce({
      data: {
        id: mockApplicationId,
        status: 'received',
        opportunity_id: 'opp-123',
        opportunities: { provider_id: mockProviderId }
      },
      error: null
    });

    mockSupabase.single.mockResolvedValueOnce({
      data: { id: mockApplicationId, status: 'rejected' },
      error: null
    });

    const result = await updateApplicationStatus(mockApplicationId, 'rejected', mockProviderId);

    expect(result.status).toBe('rejected');
  });

  // ============================================
  // TEST 6: Update status - Invalid status
  // ============================================
  test('updateApplicationStatus - throws error for invalid status', async () => {
    const mockApplicationId = 'app-123';
    const mockProviderId = 'provider-456';

    await expect(updateApplicationStatus(mockApplicationId, 'invalid', mockProviderId))
      .rejects.toThrow('Invalid status');
  });

  // ============================================
  // TEST 7: Update status - Application not found
  // ============================================
  test('updateApplicationStatus - throws error when application not found', async () => {
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