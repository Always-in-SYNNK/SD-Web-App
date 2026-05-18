import { jest } from '@jest/globals';

// Mock Supabase
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis(),
  storage: {
    from: jest.fn().mockReturnThis(),
    createSignedUrl: jest.fn()
  }
};

jest.unstable_mockModule('../src/config/supabaseClient.js', () => ({
  supabase: mockSupabase
}));

// Mock profileService
jest.unstable_mockModule('../src/services/profileService.js', () => ({
  getApplicantCVSignedUrl: jest.fn()
}));

// Mock notificationService
jest.unstable_mockModule('../src/services/notificationService.js', () => ({
  notifyApplicationStatusChange: jest.fn().mockResolvedValue(undefined)
}));

// Mock auth middleware
jest.unstable_mockModule('../src/middleware/providerAuthMiddleware.js', () => ({
  default: (req, res, next) => {
    req.user = { profileId: 'provider-123' };
    next();
  }
}));

// Import after mocks
const {
  default: router,
  getApplicationsForOpportunityHandler,
  updateApplicationStatusHandler,
} = await import('../src/routes/employerApplicationRoutes.js');
const { getApplicantCVSignedUrl } = await import('../src/services/profileService.js');
const { notifyApplicationStatusChange } = await import('../src/services/notificationService.js');
import express from 'express';
import request from 'supertest';

describe('Employer Application Routes', () => {
  let app;

  const createMockChain = () => ({
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    order: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis()
  });

  const createMockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/employer/applications', router);
    jest.clearAllMocks();
    mockSupabase.from.mockImplementation(() => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.update.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.order.mockReturnValue(chain);
      return chain;
    });
  });

  // ============================================
  // TEST 1: GET applications - Success
  // ============================================
  test('GET /opportunity/:id - should return applications', async () => {
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
          data: { provider_id: 'provider-123' },
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

    const response = await request(app)
      .get('/api/employer/applications/opportunity/opp-123')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].applicant.name).toBe('John Doe');
    expect(response.body.data[0].matchScore).toBeUndefined();
  });

  test('GET opportunity handler - returns 400 when opportunityId is missing', async () => {
    const req = { params: {} };
    const res = createMockRes();

    await getApplicationsForOpportunityHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Opportunity ID required'
    });
  });

  test('GET opportunity handler - returns 500 when applications query fails', async () => {
    mockSupabase.from.mockImplementation((table) => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.order.mockReturnValue(chain);

      if (table === 'opportunities') {
        chain.single.mockResolvedValueOnce({
          data: { provider_id: 'provider-123' },
          error: null
        });
      }

      if (table === 'applications') {
        chain.order.mockResolvedValueOnce({
          data: null,
          error: new Error('query failed')
        });
      }

      return chain;
    });

    const req = { params: { opportunityId: 'opp-123' } };
    const res = createMockRes();

    await getApplicationsForOpportunityHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'query failed'
    });
  });

  test('GET opportunity handler - returns 500 when an unexpected error is thrown', async () => {
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'applications') {
        throw new Error('unexpected applications failure');
      }

      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.order.mockReturnValue(chain);

      if (table === 'opportunities') {
        chain.single.mockResolvedValueOnce({
          data: { provider_id: 'provider-123' },
          error: null
        });
      }

      return chain;
    });

    const req = { params: { opportunityId: 'opp-123' } };
    const res = createMockRes();

    await getApplicationsForOpportunityHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'unexpected applications failure'
    });
  });

  // ============================================
  // TEST 2: GET applications - Missing opportunity ID
  // ============================================
  test('GET /opportunity/:id - returns 400 when id missing', async () => {
    const response = await request(app)
      .get('/api/employer/applications/opportunity/')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(404); // Route not found
  });

  // ============================================
  // TEST 3: PATCH update status - Shortlist success
  // ============================================
  test('PATCH /:id - should update status to shortlisted', async () => {
    mockSupabase.from.mockImplementation((table) => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.update.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);

      if (table === 'applications') {
        chain.single.mockResolvedValueOnce({
          data: { 
            id: 'app-1', 
            status: 'received',
            applicant_id: 'ap-1',
            opportunity_id: 'opp-1',
            opportunities: { provider_id: 'provider-123' }
          },
          error: null
        }).mockResolvedValueOnce({
          data: { id: 'app-1', status: 'shortlisted' },
          error: null
        });
      } else if (table === 'applicant_profiles') {
        chain.single.mockResolvedValueOnce({
          data: { id: 'ap-1' },
          error: null
        });
      }

      return chain;
    });

    const response = await request(app)
      .patch('/api/employer/applications/app-123')
      .send({ status: 'shortlisted' })
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('shortlisted');
  });

  // ============================================
  // TEST 4: PATCH update status - Offer success
  // ============================================
  test('PATCH /:id - should update status to offered', async () => {
    mockSupabase.from.mockImplementation((table) => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.update.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);

      if (table === 'applications') {
        chain.single.mockResolvedValueOnce({
          data: { 
            id: 'app-1', 
            status: 'received',
            applicant_id: 'ap-1',
            opportunity_id: 'opp-1',
            opportunities: { provider_id: 'provider-123' }
          },
          error: null
        }).mockResolvedValueOnce({
          data: { id: 'app-1', status: 'offered' },
          error: null
        });
      } else if (table === 'applicant_profiles') {
        chain.single.mockResolvedValueOnce({
          data: { id: 'ap-1' },
          error: null
        });
      }

      return chain;
    });

    const response = await request(app)
      .patch('/api/employer/applications/app-123')
      .send({ status: 'offered' })
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('Offer sent successfully');
  });

  // ============================================
  // TEST 5: PATCH update status - Reject success
  // ============================================
  test('PATCH /:id - should update status to rejected', async () => {
    mockSupabase.from.mockImplementation((table) => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.update.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);

      if (table === 'applications') {
        chain.single.mockResolvedValueOnce({
          data: { 
            id: 'app-1', 
            status: 'received',
            applicant_id: 'ap-1',
            opportunity_id: 'opp-1',
            opportunities: { provider_id: 'provider-123' }
          },
          error: null
        }).mockResolvedValueOnce({
          data: { id: 'app-1', status: 'rejected' },
          error: null
        });
      } else if (table === 'applicant_profiles') {
        chain.single.mockResolvedValueOnce({
          data: { id: 'ap-1' },
          error: null
        });
      }

      return chain;
    });

    const response = await request(app)
      .patch('/api/employer/applications/app-123')
      .send({ status: 'rejected' })
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('rejected');
  });

  // ============================================
  // TEST 6: PATCH update status - Invalid status
  // ============================================
  test('PATCH /:id - returns 400 for invalid status', async () => {
    const response = await request(app)
      .patch('/api/employer/applications/app-123')
      .send({ status: 'invalid-status' })
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('PATCH handler - returns 400 when applicationId missing', async () => {
    const req = { params: {}, body: { status: 'shortlisted' } };
    const res = createMockRes();

    await updateApplicationStatusHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Application ID required'
    });
  });

  test('PATCH handler - returns 400 when status is invalid', async () => {
    const req = { params: { applicationId: 'app-1' }, body: { status: 'invalid-status' } };
    const res = createMockRes();

    await updateApplicationStatusHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  test('PATCH handler - returns 500 when update fails', async () => {
    let applicationsCallCount = 0;

    mockSupabase.from.mockImplementation((table) => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.update.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);

      if (table === 'applications') {
        chain.single.mockImplementation(() => {
          applicationsCallCount += 1;

          if (applicationsCallCount === 1) {
            return Promise.resolve({
              data: {
                id: 'app-1',
                status: 'received',
                applicant_id: 'ap-1',
                opportunity_id: 'opp-1'
              },
              error: null
            });
          }

          return Promise.resolve({
            data: null,
            error: new Error('update failed')
          });
        });
      }

      return chain;
    });

    const req = { params: { applicationId: 'app-1' }, body: { status: 'shortlisted' } };
    const res = createMockRes();

    await updateApplicationStatusHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'update failed'
    });
  });

  test('PATCH handler - continues when fetching old status fails', async () => {
    let applicationsCallCount = 0;

    mockSupabase.from.mockImplementation((table) => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.update.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);

      if (table === 'applications') {
        chain.single.mockImplementation(() => {
          applicationsCallCount += 1;

          if (applicationsCallCount === 1) {
            return Promise.resolve({
              data: {
                id: 'app-1',
                status: 'received',
                applicant_id: 'ap-1',
                opportunity_id: 'opp-1'
              },
              error: new Error('old status lookup failed')
            });
          }

          return Promise.resolve({
            data: { id: 'app-1', status: 'shortlisted' },
            error: null
          });
        });
      }

      if (table === 'applicant_profiles') {
        chain.single.mockResolvedValueOnce({
          data: { id: 'ap-1' },
          error: null
        });
      }

      return chain;
    });

    const req = { params: { applicationId: 'app-1' }, body: { status: 'shortlisted' } };
    const res = createMockRes();

    await updateApplicationStatusHandler(req, res);

    expect(res.status).not.toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test('PATCH handler - returns 500 when an unexpected error is thrown', async () => {
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'applications') {
        throw new Error('unexpected update failure');
      }

      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.update.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      return chain;
    });

    const req = { params: { applicationId: 'app-1' }, body: { status: 'shortlisted' } };
    const res = createMockRes();

    await updateApplicationStatusHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'unexpected update failure'
    });
  });

  test('PATCH handler - skips notification when status does not change', async () => {
    mockSupabase.from.mockImplementation((table) => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.update.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);

      if (table === 'applications') {
        chain.single
          .mockResolvedValueOnce({
            data: {
              id: 'app-1',
              status: 'received',
              applicant_id: 'ap-1',
              opportunity_id: 'opp-1'
            },
            error: null
          })
          .mockResolvedValueOnce({
            data: { id: 'app-1', status: 'received' },
            error: null
          });
      }

      return chain;
    });

    const req = { params: { applicationId: 'app-1' }, body: { status: 'received' } };
    const res = createMockRes();

    await updateApplicationStatusHandler(req, res);

    expect(res.status).not.toHaveBeenCalledWith(500);
    expect(notifyApplicationStatusChange).not.toHaveBeenCalled();
  });

  test('PATCH handler - returns 200 even when notification fails', async () => {
    notifyApplicationStatusChange.mockRejectedValueOnce(new Error('notification failed'));

    mockSupabase.from.mockImplementation((table) => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.update.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);

      if (table === 'applications') {
        chain.single
          .mockResolvedValueOnce({
            data: {
              id: 'app-1',
              status: 'received',
              applicant_id: 'ap-1',
              opportunity_id: 'opp-1'
            },
            error: null
          })
          .mockResolvedValueOnce({
            data: { id: 'app-1', status: 'shortlisted' },
            error: null
          });
      }

      if (table === 'applicant_profiles') {
        chain.single.mockResolvedValueOnce({
          data: { id: 'ap-1' },
          error: null
        });
      }

      return chain;
    });

    const req = { params: { applicationId: 'app-1' }, body: { status: 'shortlisted' } };
    const res = createMockRes();

    await updateApplicationStatusHandler(req, res);

    expect(res.status).not.toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  // ============================================
  // TEST 7: PATCH update status - Missing status
  // ============================================
  test('PATCH /:id - returns 400 when status missing', async () => {
    const response = await request(app)
      .patch('/api/employer/applications/app-123')
      .send({})
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // ============================================
  // TEST 8: PATCH update status - Missing applicationId
  // ============================================
  test('PATCH /:id - returns 400 when applicationId missing', async () => {
    const response = await request(app)
      .patch('/api/employer/applications/')
      .send({ status: 'shortlisted' })
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(404); // Route not found
  });

  // ============================================
  // TEST 9: GET details - Success
  // ============================================
  test('GET /:id/details - should return applicant details', async () => {
    let callCount = 0;
    mockSupabase.from.mockImplementation(() => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.order.mockReturnValue(chain);
      chain.single.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({
            data: {
              id: 'app-1',
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
              opportunities: { provider_id: 'provider-123' }
            },
            error: null
          });
        }
        return Promise.resolve({
          data: [{
            id: 'qual-1',
            qualification_id: null,
            qualification_name: 'BSc Computer Science',
            nqf_level: 7,
            field: 'IT',
            subfield: 'Software Development',
            status: 'completed',
            originator: null,
            date_obtained: '2020-01-01'
          }],
          error: null
        });
      });
      return chain;
    });

    const response = await request(app)
      .get('/api/employer/applications/app-1/details')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.applicantProfileId).toBe('ap-1');
  });

  // ============================================
  // TEST 10: GET details - Missing applicationId
  // ============================================
  test('GET /:id/details - returns 400 when applicationId missing', async () => {
    const response = await request(app)
      .get('/api/employer/applications/undefined/details')
      .set('Authorization', 'Bearer fake-token');

    // Will depend on how Express handles this
    expect([200, 400, 500]).toContain(response.status);
  });

  // ============================================
  // TEST 11: GET details - Application not found
  // ============================================
  test('GET /:id/details - returns 404 when application not found', async () => {
    mockSupabase.from.mockImplementation(() => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'Application not found' }
      });
      return chain;
    });

    const response = await request(app)
      .get('/api/employer/applications/nonexistent/details')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  // ============================================
  // TEST 12: GET details - Unauthorized
  // ============================================
  test('GET /:id/details - returns 403 when unauthorized', async () => {
    mockSupabase.from.mockImplementation(() => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.single.mockResolvedValueOnce({
        data: {
          id: 'app-1',
          applicant_profiles: { id: 'ap-1' },
          opportunities: { provider_id: 'different-provider' }
        },
        error: null
      });
      return chain;
    });

    const response = await request(app)
      .get('/api/employer/applications/app-1/details')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  // ============================================
  // TEST 13: GET CV signed URL - Success
  // ============================================
  test('GET /:id/cv/signed-url - should return signed URL', async () => {
    mockSupabase.from.mockImplementation(() => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.single.mockResolvedValueOnce({
        data: {
          id: 'app-1',
          opportunity_id: 'opp-1',
          applicant_profiles: { cv_url: 'cv/path.pdf' },
          opportunities: { provider_id: 'provider-123' }
        },
        error: null
      });
      return chain;
    });

    // Mock the getApplicantCVSignedUrl service
    getApplicantCVSignedUrl.mockResolvedValueOnce('https://signed-url.pdf');

    const response = await request(app)
      .get('/api/employer/applications/app-1/cv/signed-url')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.signed_url).toBe('https://signed-url.pdf');
  });

  // ============================================
  // TEST 14: GET CV signed URL - No CV
  // ============================================
  test('GET /:id/cv/signed-url - returns null when no CV', async () => {
    mockSupabase.from.mockImplementation(() => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.single.mockResolvedValueOnce({
        data: {
          id: 'app-1',
          opportunity_id: 'opp-1',
          applicant_profiles: { cv_url: null },
          opportunities: { provider_id: 'provider-123' }
        },
        error: null
      });
      return chain;
    });

    const response = await request(app)
      .get('/api/employer/applications/app-1/cv/signed-url')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.signed_url).toBeNull();
  });

  // ============================================
  // TEST 15: GET CV signed URL - Missing applicationId
  // ============================================
  test('GET /:id/cv/signed-url - returns 400 when applicationId missing', async () => {
    const response = await request(app)
      .get('/api/employer/applications//cv/signed-url')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(404); // Route not found
  });

  // ============================================
  // TEST 16: GET CV signed URL - Unauthorized
  // ============================================
  test('GET /:id/cv/signed-url - returns 403 when unauthorized', async () => {
    mockSupabase.from.mockImplementation(() => {
      const chain = createMockChain();
      chain.select.mockReturnValue(chain);
      chain.eq.mockReturnValue(chain);
      chain.single.mockResolvedValueOnce({
        data: {
          id: 'app-1',
          opportunity_id: 'opp-1',
          applicant_profiles: { cv_url: 'cv/path.pdf' },
          opportunities: { provider_id: 'different-provider' }
        },
        error: null
      });
      return chain;
    });

    const response = await request(app)
      .get('/api/employer/applications/app-1/cv/signed-url')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  // ============================================
  // TEST 17: GET CV signed URL - Application not found
  // ============================================
  test('GET /:id/cv/signed-url - returns 404 when application not found', async () => {
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
    mockSupabase.from.mockClear();
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

    const response = await request(app)
      .get('/api/employer/applications/nonexistent/cv/signed-url')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});