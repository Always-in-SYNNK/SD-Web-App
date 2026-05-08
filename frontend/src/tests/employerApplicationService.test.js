import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getApplicationsForOpportunity,
  updateApplicationStatus,
  getApplicationDetails,
  getApplicationCvSignedUrl,
} from '../services/employerApplicationService';

describe('Employer Application Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // ✅ Use vi.fn() instead of global.fetch = vi.fn()
  const mockFetchResponse = (data, ok = true) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok,
      json: async () => data
    }));
  };

  it('should fetch applications successfully', async () => {
    localStorage.setItem('token', 'fake-token');
    mockFetchResponse({ success: true, data: [] });

    const result = await getApplicationsForOpportunity('opp-123');
    
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/employer/applications/opportunity/opp-123',
      {
        credentials: 'include',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer fake-token',
          'Content-Type': 'application/json'
        }
      }
    );
    expect(result.success).toBe(true);
  });

  it('should omit authorization header when no token exists', async () => {
    mockFetchResponse({ success: true, data: [] });

    await getApplicationsForOpportunity('opp-123');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/employer/applications/opportunity/opp-123',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.not.objectContaining({
          Authorization: expect.any(String),
        }),
      })
    );
  });

  it('should shortlist application successfully', async () => {
    localStorage.setItem('token', 'fake-token');
    mockFetchResponse({ success: true, message: 'Shortlisted successfully' });

    const result = await updateApplicationStatus('app-123', 'shortlisted');
    expect(result.success).toBe(true);
  });

  it('should reject application successfully', async () => {
    localStorage.setItem('token', 'fake-token');
    mockFetchResponse({ success: true, message: 'Rejected successfully' });

    const result = await updateApplicationStatus('app-123', 'rejected');
    expect(result.success).toBe(true);
  });

  it('should send PATCH request with correct body and auth config', async () => {
    localStorage.setItem('token', 'fake-token');
    mockFetchResponse({ success: true, message: 'Updated' });

    await updateApplicationStatus('app-123', 'offered');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/employer/applications/app-123',
      {
        credentials: 'include',
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer fake-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'offered' })
      }
    );
  });

  it('should handle fetch error when fetching applications', async () => {
    localStorage.setItem('token', 'fake-token');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

    await expect(getApplicationsForOpportunity('opp-123')).rejects.toThrow('Network error');
  });

  it('should handle unsuccessful fetch response', async () => {
    localStorage.setItem('token', 'fake-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ success: false, error: 'Not found' })
    }));

    await expect(getApplicationsForOpportunity('opp-123')).rejects.toThrow();
  });

  it('should use message fallback when error field is missing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Permission denied' })
    }));

    await expect(getApplicationsForOpportunity('opp-123')).rejects.toThrow('Permission denied');
  });

  it('should use default error when neither error nor message exists', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({})
    }));

    await expect(getApplicationsForOpportunity('opp-123')).rejects.toThrow('Request failed');
  });

  it('should throw HTTP status error when response body is not JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: async () => {
        throw new Error('invalid json');
      }
    }));

    await expect(getApplicationsForOpportunity('opp-123')).rejects.toThrow('HTTP 502 Bad Gateway');
  });

  it('should include authorization header in requests', async () => {
    localStorage.setItem('token', 'test-token-123');
    mockFetchResponse({ success: true, data: [] });

    await getApplicationsForOpportunity('opp-456');

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token-123'
        })
      })
    );
  });

  it('should fetch application details with credentials include', async () => {
    localStorage.setItem('token', 'fake-token');
    mockFetchResponse({ success: true, applicantSkills: [], qualifications: [] });

    const result = await getApplicationDetails('app-123');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/employer/applications/app-123/details',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({
          Authorization: 'Bearer fake-token'
        })
      })
    );
    expect(result.success).toBe(true);
  });

  it('should prioritize explicit token override for application details', async () => {
    localStorage.setItem('token', 'stored-token');
    mockFetchResponse({ success: true, applicantSkills: [], qualifications: [] });

    await getApplicationDetails('app-123', 'override-token');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/employer/applications/app-123/details',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer override-token'
        })
      })
    );
  });

  it('should fetch signed CV url without bearer token when none exists', async () => {
    mockFetchResponse({ success: true, signed_url: 'https://signed-url.pdf' });

    const result = await getApplicationCvSignedUrl('app-123');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/employer/applications/app-123/cv/signed-url',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.not.objectContaining({
          Authorization: expect.any(String),
        }),
      })
    );
    expect(result.signed_url).toBe('https://signed-url.pdf');
  });

  it('should fetch signed CV url with explicit token override', async () => {
    mockFetchResponse({ success: true, signed_url: 'https://signed-url.pdf' });

    await getApplicationCvSignedUrl('app-123', 'override-token');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/employer/applications/app-123/cv/signed-url',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({
          Authorization: 'Bearer override-token'
        }),
      })
    );
  });

  it('should propagate signed CV request failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'CV unavailable' })
    }));

    await expect(getApplicationCvSignedUrl('app-123')).rejects.toThrow('CV unavailable');
  });
});