import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockUseAuth = vi.fn(() => ({ token: 'mock-token', user: { email: 'test@test.com' } }));

vi.mock('../context/useAuth', () => ({
  useAuth: () => mockUseAuth()
}));

import Opportunities from '../pages/Opportunities';

describe('Opportunities', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ token: 'mock-token', user: { email: 'test@test.com' } });
  });

  it('should render the page', () => {
    render(<Opportunities />);
    expect(screen.getByText('Accredited Opportunities')).toBeDefined();
  });
});