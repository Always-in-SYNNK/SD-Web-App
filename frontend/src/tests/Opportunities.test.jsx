import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Qualifications from '../pages/Qualifications';

vi.mock('../context/useAuth', async () => ({
  useAuth: vi.fn(() => ({ token: 'mock-token', user: { email: 'test@test.com' } }))
}));

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    rpc: vi.fn().mockResolvedValue({ data: [], error: null })
  }
}));

vi.mock('../components/opportunities/QualificationCard', () => ({ QualificationCard: () => <article>Qualification</article> }));
vi.mock('../components/dashboard/Sidebar', () => ({ Sidebar: () => <aside>Sidebar</aside> }));
vi.mock('../components/opportunities/OpportunityFilters', () => ({ OpportunityFilters: () => <aside>Filters</aside> }));
vi.mock('../components/notifications/notificationDropdown', () => ({ NotificationDropdown: () => <div>Notifications</div> }));

describe('Qualifications', () => {
  it('should render qualifications page', () => {
    render(<Qualifications />);
    expect(screen.getByText('Accredited Qualifications')).toBeDefined();
  });
});