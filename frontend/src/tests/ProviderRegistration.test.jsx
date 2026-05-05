import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProviderRegistration from '../pages/ProviderRegistration';

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

describe('ProviderRegistration', () => {
  it('should render registration form', () => {
    render(
      <BrowserRouter>
        <ProviderRegistration />
      </BrowserRouter>
    );
    expect(screen.getByText('Registration Phase 02')).toBeDefined();
    expect(screen.getByText('Company Name')).toBeDefined();
  });
});