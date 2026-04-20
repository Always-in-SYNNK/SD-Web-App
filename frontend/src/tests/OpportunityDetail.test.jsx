import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import OpportunityDetail from '../pages/OpportunityDetail';

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null })
  }
}));

vi.mock('../components/dashboard/Sidebar', () => ({ Sidebar: () => <aside>Sidebar</aside> }));

describe('OpportunityDetail', () => {
  it('should render loading state', () => {
    render(
      <BrowserRouter>
        <OpportunityDetail />
      </BrowserRouter>
    );
    expect(document.querySelector('.animate-spin')).toBeDefined();
  });
});