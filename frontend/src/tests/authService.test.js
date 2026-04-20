import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginWithGoogle, checkProviderUser, signInProvider, signUpProvider } from '../services/authService';

describe('Auth Service', () => {
  beforeEach(() => {
    // ✅ Use vi.stubGlobal instead of global.fetch
    vi.stubGlobal('fetch', vi.fn());
  });

  describe('loginWithGoogle', () => {
    it('should return user data on success', async () => {
      const mockResponse = { user: { id: '1', email: 'test@test.com' }, token: 'token123' };
      
      // ✅ Get the fetch mock and set its return value
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await loginWithGoogle('google-token', 'applicant');
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failure', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Login failed' })
      });
      vi.stubGlobal('fetch', mockFetch);

      await expect(loginWithGoogle('token', 'applicant')).rejects.toThrow('Login failed');
    });
  });

  describe('checkProviderUser', () => {
    it('should return user existence', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ exists: true })
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await checkProviderUser('credential');
      expect(result.exists).toBe(true);
    });
  });

  describe('signInProvider', () => {
    it('should return sign in data', async () => {
      const mockData = { success: true, user: {}, token: 'token' };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await signInProvider('credential');
      expect(result.success).toBe(true);
    });
  });

  describe('signUpProvider', () => {
    it('should return sign up data', async () => {
      const mockData = { success: true, pending: false, email: 'test@test.com' };
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData
      });
      vi.stubGlobal('fetch', mockFetch);

      const result = await signUpProvider('credential');
      expect(result.success).toBe(true);
    });
  });
});