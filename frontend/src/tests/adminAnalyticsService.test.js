import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAdminApplicationVolume } from '../services/adminAnalyticsService';

describe('adminAnalyticsService', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('getAdminApplicationVolume', () => {
    it('should work without auth token', async () => {
      const mockResponse = {
        success: true,
        data: [],
        totals: { totalApplications: 0, activeOpportunities: 0, averagePerOpportunity: 0 },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });
      vi.stubGlobal('fetch', mockFetch);

      // Mock no token
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const result = await getAdminApplicationVolume();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/analytics/admin/applications', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      expect(result).toEqual({
        data: [],
        totals: { totalApplications: 0, activeOpportunities: 0, averagePerOpportunity: 0 },
      });
    });

    it('should throw an error if response is not JSON', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'text/html' }),
        text: async () => '<html>Not JSON</html>',
      });
      vi.stubGlobal('fetch', mockFetch);

      vi.mocked(localStorage.getItem).mockReturnValue(null);

      await expect(getAdminApplicationVolume()).rejects.toThrow('Invalid response from server. Expected JSON but got text/html');
    });

    it('should fetch admin application analytics successfully', async () => {
      const mockResponse = {
        success: true,
        data: [],
        totals: { totalApplications: 0, activeOpportunities: 0, averagePerOpportunity: 0 },
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockResponse,
      });
      vi.stubGlobal('fetch', mockFetch);

      // Mock token
      vi.mocked(localStorage.getItem).mockReturnValue('token123');

      const result = await getAdminApplicationVolume();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/analytics/admin/applications', {
        credentials: 'include',
        headers: {
          'Authorization': 'Bearer token123',
          'Content-Type': 'application/json',
        },
      });

      expect(result).toEqual({
        data: [],
        totals: { totalApplications: 0, activeOpportunities: 0, averagePerOpportunity: 0 },
      });
    });
  });
});