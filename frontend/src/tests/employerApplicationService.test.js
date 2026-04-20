import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getApplicationsForOpportunity, updateApplicationStatus } from '../services/employerApplicationService';

describe('Employer Application Service', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
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
        method: 'GET',
        headers: {
          'Authorization': 'Bearer fake-token',
          'Content-Type': 'application/json'
        }
      }
    );
    expect(result.success).toBe(true);
  });

  it('should throw error when no token exists', async () => {
    await expect(getApplicationsForOpportunity('opp-123')).rejects.toThrow('No token found');
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
});