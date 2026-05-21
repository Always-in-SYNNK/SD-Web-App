import { render, screen, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import { MatchingOpportunities } from '../components/opportunities/matchingOpportunity.jsx';

// Mock the dependencies
vi.mock('../context/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/matchingService', () => ({
  getMatchingOpportunities: vi.fn(),
}));

vi.mock('../components/opportunities/OpportunityCard', () => ({
  OpportunityCard: ({ title }) => <article data-testid="opportunity-card">{title}</article>,
}));

import { useAuth } from '../context/useAuth';
import { getMatchingOpportunities } from '../services/matchingService';

describe('MatchingOpportunities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading spinner initially', async () => {
    useAuth.mockReturnValue({ token: 'test-token' });
    getMatchingOpportunities.mockReturnValue(new Promise(() => {})); // Never resolves

    await act(async () => render(<MatchingOpportunities />));

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows error message when no token', async () => {
    useAuth.mockReturnValue({ token: null });

    await act(async () => render(<MatchingOpportunities />));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error: Unable to load matches without authentication.');
    });
  });

  it('shows error message when fetch fails', async () => {
    useAuth.mockReturnValue({ token: 'test-token' });
    getMatchingOpportunities.mockRejectedValue(new Error('Fetch error'));

    await act(async () => render(<MatchingOpportunities />));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error: Fetch error');
    });
  });

  it('shows no opportunities message when empty', async () => {
    useAuth.mockReturnValue({ token: 'test-token' });
    getMatchingOpportunities.mockResolvedValue({ data: [] });

    await act(async () => render(<MatchingOpportunities />));

    await waitFor(() => {
      expect(screen.getByText('No matching opportunities found yet.')).toBeInTheDocument();
    });
  });

  it('renders opportunities when data is available', async () => {
    const mockOpportunities = [
      { id: 1, title: 'Job 1', score: 0.85 },
      { id: 2, title: 'Job 2', score: 0.92 },
    ];
    useAuth.mockReturnValue({ token: 'test-token' });
    getMatchingOpportunities.mockResolvedValue({ data: mockOpportunities });

    await act(async () => render(<MatchingOpportunities />));

    // use `findBy`/`findAllByTestId` so assertions wait for async state updates
    expect(await screen.findByText('Your Matched Opportunities')).toBeInTheDocument();
    expect(await screen.findByText('2 matches found')).toBeInTheDocument();
    expect(await screen.findAllByTestId('opportunity-card')).toHaveLength(2);
    expect(await screen.findByText(/85%/)).toBeInTheDocument();
    expect(await screen.findByText(/92%/)).toBeInTheDocument();
  });
});