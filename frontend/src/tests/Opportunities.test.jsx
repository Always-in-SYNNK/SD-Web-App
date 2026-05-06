import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import Opportunities from '../pages/Opportunities';

vi.mock('../lib/api', () => ({
  getLocations: vi.fn().mockResolvedValue({ data: ['Cape Town', 'Johannesburg'] }),
  getFields: vi.fn().mockResolvedValue({ data: ['IT', 'Finance'] }),
  getNqfLevels: vi.fn().mockResolvedValue({ data: ['4', '5', '6'] }),
  getOpportunities: vi.fn().mockResolvedValue({ data: [], pagination: {}, summary: {} })
}));

vi.mock('../components/dashboard/Sidebar', () => ({ Sidebar: () => <aside>Sidebar</aside> }));
vi.mock('../components/opportunities/OpportunityFilters', () => ({ OpportunityFilters: () => <aside>Filters</aside> }));
vi.mock('../components/opportunities/OpportunityList', () => ({ OpportunityList: () => <section>OpportunityList</section> }));
vi.mock('../components/notifications/notificationDropdown', () => ({ NotificationDropdown: () => <div>Notifications</div> }));

describe('Opportunities', () => {
  it('should render the page', () => {
    render(
      <AuthProvider>
        <Opportunities />
      </AuthProvider>
    );
    expect(screen.getByText('Accredited Opportunities')).toBeDefined();
  });
});