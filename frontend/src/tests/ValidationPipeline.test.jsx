import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ValidationPipeline from '../pages/ValidationPipeline';
import { useAuth } from '../context/useAuth';

// Mock dependencies
vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

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
    vi.mocked(useAuth).mockReturnValue({ user: null });
  });

  it('should render the empty state when no auth user exists', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: null });

    render(<ValidationPipeline />);
    
    await waitFor(() => {
      expect(screen.getByText('Validation Pipeline')).toBeDefined();
    });

    expect(screen.getByText('No opportunities found')).toBeDefined();
  });

  it('renders the page header', () => {
    render(<ValidationPipeline />);
    expect(screen.getByText('Validation Pipeline')).toBeInTheDocument();
  });

  it('renders jobs when authenticated and counts update', async () => {
    // Provide authenticated user for this test
    vi.mocked(useAuth).mockReturnValue({ user: { id: 'provider-user-1' } });

    const supabase = await import('../lib/supabaseClient');

    supabase.supabase.from.mockImplementation((table) => {
      if (table === 'provider_profiles') {
        return {
          select: () => ({
            eq: () => ({
              single: async () => ({ data: { id: 'prov-1' }, error: null }),
            }),
          }),
        };
      }

      if (table === 'opportunities') {
        return {
          select: () => ({
            eq: () => ({
              order: async () => ({
                data: [
                  { id: '1', title: 'Frontend Dev', status: 'pending', location: 'CT', duration: '6m', stipend: 'R10k', closing_date: '2026-06-01' },
                  { id: '2', title: 'Backend Dev', status: 'approved', location: 'JHB', duration: '12m', stipend: 'R12k', closing_date: '2026-07-01' },
                ],
                error: null,
              }),
            }),
          }),
        };
      }

      return {
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
      };
    });

    render(<ValidationPipeline />);

    // Wait for the mocked jobs to render
    expect(await screen.findByText(/Job:\s*Frontend Dev/i)).toBeInTheDocument();
    expect(screen.getByText(/Job:\s*Backend Dev/i)).toBeInTheDocument();

    // Stats should reflect total = 2, pending =1, approved =1
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(2);
  });
});