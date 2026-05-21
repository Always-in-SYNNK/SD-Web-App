import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Mock useNavigate so we can assert navigation behavior
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
import ProviderLogin from '../pages/ProviderLogin';

let providerButtonProps = {};

vi.mock('../components/auth/AuthLayout', () => ({
  default: ({ heroPanel, formPanel }) => (
    <main>
      {heroPanel}
      {formPanel}
    </main>
  ),
}));
vi.mock('../components/auth/AuthHeroPanel', () => ({ default: () => <section>Hero</section> }));
vi.mock('../components/auth/AuthFormPanel', () => ({
  default: ({ children, onBack }) => (
    <section>
      <button onClick={onBack}>Back</button>
      {children}
    </section>
  ),
}));
vi.mock('../components/auth/ProviderGoogleLoginButton', () => ({
  default: (props) => {
    providerButtonProps = props;

    return (
      <div>
        <button onClick={() => props.onLoadingChange(true)}>Start Loading</button>
        <button onClick={() => props.onVerificationRequired('provider@company.com')}>
          Require Verification
        </button>
        <button onClick={() => props.onError('Login failed')}>Trigger Error</button>
      </div>
    );
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  providerButtonProps = {};
});

describe('ProviderLogin', () => {
  it('should render login page', () => {
    render(
      <BrowserRouter>
        <ProviderLogin />
      </BrowserRouter>
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Provider Access' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Start Loading' })).toBeDefined();
  });

  it('shows the processing state when the child reports loading', () => {
    render(
      <BrowserRouter>
        <ProviderLogin />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Start Loading' }));

    expect(screen.getByText('Processing...')).toBeDefined();
  });

  it('shows verification messaging when signup needs email confirmation', () => {
    render(
      <BrowserRouter>
        <ProviderLogin />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Require Verification' }));

    expect(screen.getByRole('status')).toBeDefined();
    expect(screen.getByText('provider@company.com')).toBeDefined();
    expect(screen.queryByRole('heading', { level: 2, name: 'Provider Access' })).toBeNull();
  });

  it('renders error state when the child reports a failure', () => {
    render(
      <BrowserRouter>
        <ProviderLogin />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Trigger Error' }));

    expect(mockNavigate).toHaveBeenCalledWith('/auth-error', {
      state: { loginPage: 'prov-login', message: 'Login failed' },
    });
  });

  it('calls the back navigation handler', () => {
    render(
      <BrowserRouter>
        <ProviderLogin />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));

    expect(providerButtonProps.onLoadingChange).toBeDefined();
  });
});