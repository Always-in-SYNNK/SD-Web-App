import { jest } from '@jest/globals';

// Mock Supabase with proper chain support
const createMockChain = () => ({
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  order: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis()
});

const mockSupabase = {
  from: jest.fn(() => {
    const chain = createMockChain();
    chain.select.mockReturnValue(chain);
    chain.update.mockReturnValue(chain);
    chain.eq.mockReturnValue(chain);
    return chain;
  })
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

    mockSupabase.from.mockImplementation((table) => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.order.mockReturnValue(chain);
      
      if (table === 'opportunities') {
        chain.single.mockResolvedValueOnce({
          data: { provider_id: mockProviderId },
          error: null
        });
      } else if (table === 'applications') {
        chain.order.mockResolvedValueOnce({
          data: mockApplications,
          error: null
        });
      }
      return chain;
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

    mockSupabase.from.mockImplementation(() => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.single.mockResolvedValueOnce({
        data: { provider_id: 'different-provider' },
        error: null
      });
      return chain;
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

    mockSupabase.from.mockImplementation(() => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.single.mockResolvedValueOnce({
        data: null,
        error: new Error('Not found')
      });
      return chain;
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

    let callCount = 0;
    mockSupabase.from.mockImplementation(() => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.update.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.single.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            data: {
              id: mockApplicationId,
              status: 'received',
              opportunity_id: 'opp-123',
              opportunities: { provider_id: mockProviderId }
            },
            error: null
          });
        }
        return Promise.resolve({
          data: { id: mockApplicationId, status: 'shortlisted' },
          error: null
        });
      });
      return chain;
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

    let callCount = 0;
    mockSupabase.from.mockImplementation(() => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.update.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.single.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            data: {
              id: mockApplicationId,
              status: 'received',
              opportunity_id: 'opp-123',
              opportunities: { provider_id: mockProviderId }
            },
            error: null
          });
        }
        return Promise.resolve({
          data: { id: mockApplicationId, status: 'rejected' },
          error: null
        });
      });
      return chain;
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

    mockSupabase.from.mockImplementation(() => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.single.mockResolvedValueOnce({
        data: null,
        error: new Error('Not found')
      });
      return chain;
    });

    await expect(updateApplicationStatus(mockApplicationId, 'shortlisted', mockProviderId))
      .rejects.toThrow('Application not found');
  });

  // ============================================
  // TEST 8: Get applicant details - Success
  // ============================================
  test('getApplicantDetailsForApplication - returns applicant details', async () => {
    const { getApplicantDetailsForApplication } = await import('../src/services/employerApplicationService.js');
    const mockApplicationId = 'app-123';
    const mockProviderId = 'provider-456';

    let callCount = 0;
    mockSupabase.from.mockImplementation(() => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.single.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            data: {
              id: mockApplicationId,
              applicant_profiles: {
                id: 'ap-1',
                bio: 'Experienced developer',
                location: 'Cape Town',
                nqf_level: 7,
                cv_url: 'https://cv.pdf',
                profiles: {
                  id: 'user-1',
                  full_name: 'John Doe',
                  email: 'john@example.com',
                  role: 'applicant'
                }
              },
              opportunities: { provider_id: mockProviderId }
            },
            error: null
          });
        }
        return Promise.resolve({
          data: [{
            id: 'qual-1',
            qualification_id: null,
            qualification_name: 'BSc CS',
            nqf_level: 7,
            field: 'IT',
            subfield: 'Software'
          }],
          error: null
        });
      });
      return chain;
    });

    const result = await getApplicantDetailsForApplication(mockApplicationId, mockProviderId);

    expect(result.applicantProfileId).toBe('ap-1');
    expect(result.applicant.name).toBe('John Doe');
    expect(result.applicant.email).toBe('john@example.com');
  });

  // ============================================
  // TEST 9: Get applicant details - Missing applicationId
  // ============================================
  test('getApplicantDetailsForApplication - throws error when applicationId missing', async () => {
    const { getApplicantDetailsForApplication } = await import('../src/services/employerApplicationService.js');

    await expect(getApplicantDetailsForApplication(null, 'provider-456'))
      .rejects.toThrow('Application ID is required');
  });

  // ============================================
  // TEST 10: Get applicant details - Missing providerProfileId
  // ============================================
  test('getApplicantDetailsForApplication - throws error when providerProfileId missing', async () => {
    const { getApplicantDetailsForApplication } = await import('../src/services/employerApplicationService.js');

    await expect(getApplicantDetailsForApplication('app-123', null))
      .rejects.toThrow('Unauthorized: Provider not authenticated');
  });

  // ============================================
  // TEST 11: Get applicant details - Application not found
  // ============================================
  test('getApplicantDetailsForApplication - throws error when application not found', async () => {
    const { getApplicantDetailsForApplication } = await import('../src/services/employerApplicationService.js');

    mockSupabase.from.mockImplementation(() => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.single.mockResolvedValueOnce({
        data: null,
        error: new Error('Not found')
      });
      return chain;
    });

    await expect(getApplicantDetailsForApplication('app-123', 'provider-456'))
      .rejects.toThrow('Application not found');
  });

  // ============================================
  // TEST 12: Get applicant details - Unauthorized
  // ============================================
  test('getApplicantDetailsForApplication - throws error when unauthorized', async () => {
    const { getApplicantDetailsForApplication } = await import('../src/services/employerApplicationService.js');

    mockSupabase.from.mockImplementation(() => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.single.mockResolvedValueOnce({
        data: {
          id: 'app-123',
          applicant_profiles: { id: 'ap-1' },
          opportunities: { provider_id: 'different-provider' }
        },
        error: null
      });
      return chain;
    });

    await expect(getApplicantDetailsForApplication('app-123', 'provider-456'))
      .rejects.toThrow('Unauthorized: You do not own this opportunity');
  });

  // ============================================
  // TEST 13: Update status - Offer status
  // ============================================
  test('updateApplicationStatus - throws error for offered status in service', async () => {
    const mockApplicationId = 'app-123';
    const mockProviderId = 'provider-456';

    // The service only allows shortlisted/rejected, so offered should fail
    await expect(updateApplicationStatus(mockApplicationId, 'offered', mockProviderId))
      .rejects.toThrow('Invalid status');
  });

  // ============================================
  // TEST 14: Update status - Unauthorized provider
  // ============================================
  test('updateApplicationStatus - throws error when provider unauthorized', async () => {
    const mockApplicationId = 'app-123';
    const mockProviderId = 'provider-456';

    mockSupabase.from.mockImplementation(() => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.single.mockResolvedValueOnce({
        data: {
          id: mockApplicationId,
          status: 'received',
          opportunity_id: 'opp-123',
          opportunities: { provider_id: 'different-provider' }
        },
        error: null
      });
      return chain;
    });

    await expect(updateApplicationStatus(mockApplicationId, 'shortlisted', mockProviderId))
      .rejects.toThrow('Unauthorized: You do not own this opportunity');
  });
});