import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ValidationPipeline from '../pages/ValidationPipeline';

// Mock dependencies
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    order: vi.fn().mockReturnThis()
  }
}));

vi.mock('../components/layout/Sidebar', () => ({ default: () => <aside>Sidebar</aside> }));
vi.mock('../components/layout/Topbar', () => ({ default: () => <header>Topbar</header> }));
vi.mock('../components/dashboard/StatsCard', () => ({ default: () => <article>StatsCard</article> }));

// ✅ Fix: Remove unused 'id' parameter, just use 'title'
vi.mock('../components/dashboard/JobCard', () => ({ 
  default: ({ title }) => <article>Job: {title}</article> 
}));

describe('ValidationPipeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // ✅ Use vi.stubGlobal instead of global
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should render the empty state when auth check fails', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ authenticated: false })
    });
    vi.stubGlobal('fetch', mockFetch);

    render(<ValidationPipeline />);
    
    await waitFor(() => {
      expect(screen.getByText('Validation Pipeline')).toBeDefined();
    });

    expect(screen.getByText('No opportunities found.')).toBeDefined();
  });

  it('should display loading state initially', () => {
    render(<ValidationPipeline />);
    expect(screen.getByText('Loading...')).toBeDefined();
  });
});