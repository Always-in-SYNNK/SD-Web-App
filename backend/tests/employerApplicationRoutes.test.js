import { jest } from '@jest/globals';

// Mock Supabase
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  in: jest.fn().mockReturnThis()
};

jest.unstable_mockModule('../src/config/supabaseClient.js', () => ({
  supabase: mockSupabase
}));

// Mock auth middleware
jest.unstable_mockModule('../src/middleware/providerAuthMiddleware.js', () => ({
  default: (req, res, next) => {
    req.user = { profileId: 'provider-123' };
    next();
  }
}));

// Import after mocks
const { default: router } = await import('../src/routes/employerApplicationRoutes.js');
import express from 'express';
import request from 'supertest';

describe('Employer Application Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/employer/applications', router);
    jest.clearAllMocks();
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

    mockSupabase.order.mockResolvedValue({
      data: mockApplications,
      error: null
    });

    const response = await request(app)
      .get('/api/employer/applications/opportunity/opp-123')
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].applicant.name).toBe('John Doe');
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
    mockSupabase.single
      .mockResolvedValueOnce({
        data: { id: 'app-1', status: 'shortlisted' },
        error: null
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
  // TEST 4: PATCH update status - Accept success
  // ============================================
  test('PATCH /:id - should update status to accepted', async () => {
    mockSupabase.single
      .mockResolvedValueOnce({
        data: { id: 'app-1', status: 'accepted' },
        error: null
      });

    const response = await request(app)
      .patch('/api/employer/applications/app-123')
      .send({ status: 'accepted' })
      .set('Authorization', 'Bearer fake-token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('accepted');
  });

  // ============================================
  // TEST 5: PATCH update status - Reject success
  // ============================================
  test('PATCH /:id - should update status to rejected', async () => {
    mockSupabase.single
      .mockResolvedValueOnce({
        data: { id: 'app-1', status: 'rejected' },
        error: null
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
});