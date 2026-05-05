import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProviderLogin from '../pages/ProviderLogin';

vi.mock('../components/auth/AuthLayout', () => ({
  default: ({ heroPanel, formPanel }) => (
    <main>
      {heroPanel}
      {formPanel}
    </main>
  ),
}));
vi.mock('../components/auth/AuthHeroPanel', () => ({ default: () => <section>Hero</section> }));
vi.mock('../components/auth/AuthFormPanel', () => ({ default: ({ children }) => <section>{children}</section> }));
vi.mock('../components/auth/ProviderGoogleLoginButton', () => ({ default: () => <button>Google Sign In</button> }));

describe('ProviderLogin', () => {
  it('should render login page', () => {
    render(
      <BrowserRouter>
        <ProviderLogin />
      </BrowserRouter>
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Employer Access' })).toBeDefined();
    expect(screen.getByText('Google Sign In')).toBeDefined();
  });
});