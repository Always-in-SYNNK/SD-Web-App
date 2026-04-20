import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Opportunities from '../pages/Opportunities';

// Remove unused 'beforeEach' import

vi.mock('../lib/api', () => ({
  getLocations: vi.fn().mockResolvedValue({ data: ['Cape Town', 'Johannesburg'] }),
  getFields: vi.fn().mockResolvedValue({ data: ['IT', 'Finance'] }),
  getNqfLevels: vi.fn().mockResolvedValue({ data: ['4', '5', '6'] }),
  getOpportunities: vi.fn().mockResolvedValue({ data: [], pagination: {}, summary: {} })
}));

vi.mock('../components/dashboard/Sidebar', () => ({ Sidebar: () => <aside>Sidebar</aside> }));
vi.mock('../components/opportunities/OpportunityFilters', () => ({ OpportunityFilters: () => <aside>Filters</aside> }));
vi.mock('../components/opportunities/OpportunityList', () => ({ OpportunityList: () => <section>OpportunityList</section> }));

describe('Opportunities', () => {
  it('should render the page', () => {
    render(<Opportunities />);
    expect(screen.getByText('Accredited Opportunities')).toBeDefined();
  });
});