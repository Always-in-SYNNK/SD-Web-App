import { vi } from 'vitest';
import { getMatchingOpportunities } from '../services/matchingService.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('getMatchingOpportunities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return matching opportunities on successful fetch', async () => {
    const mockToken = 'test-token';
    const mockData = { opportunities: [{ id: 1, title: 'Job 1' }] };
    const mockResponse = {
      ok: true,
      json: vi.fn().mockResolvedValue(mockData),
    };

    fetch.mockResolvedValue(mockResponse);

    const result = await getMatchingOpportunities(mockToken);

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/opportunities/matches', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mockToken}`,
      },
    });
    expect(result).toEqual(mockData);
  });

  it('should throw an error on fetch failure', async () => {
    const mockToken = 'test-token';
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: vi.fn().mockResolvedValue({ error: 'Server error' }),
    };

    fetch.mockResolvedValue(mockResponse);

    await expect(getMatchingOpportunities(mockToken)).rejects.toThrow('Server error');
  });

  it('should throw an error when response is not ok and no payload message', async () => {
    const mockToken = 'test-token';
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: vi.fn().mockResolvedValue({}),
    };

    fetch.mockResolvedValue(mockResponse);

    await expect(getMatchingOpportunities(mockToken)).rejects.toThrow('HTTP 404 Not Found');
  });

  it('should throw an error when json parsing fails', async () => {
    const mockToken = 'test-token';
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
    };

    fetch.mockResolvedValue(mockResponse);

    await expect(getMatchingOpportunities(mockToken)).rejects.toThrow('HTTP 500 Internal Server Error');
  });
});