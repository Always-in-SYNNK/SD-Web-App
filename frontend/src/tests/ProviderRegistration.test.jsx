import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  waitFor,
  fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';

import ProviderRegistration from '../pages/ProviderRegistration';
import { getAllCountries } from '../services/countryService';

const mockNavigate = vi.fn();

vi.mock('../services/countryService', () => ({
  getAllCountries: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../components/auth/AuthLayout', () => ({
  default: ({ heroPanel, formPanel }) => (
    <main>
      {heroPanel}
      {formPanel}
    </main>
  ),
}));

vi.mock('../components/auth/AuthHeroPanel', () => ({
  default: () => <section>Hero</section>,
}));

vi.mock('../components/auth/AuthFormPanel', () => ({
  default: ({ children }) => <section>{children}</section>,
}));

describe('ProviderRegistration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock scrollIntoView for JSDOM tests
    Element.prototype.scrollIntoView = vi.fn();

    getAllCountries.mockResolvedValue([
      {
        code: 'ZA',
        name: 'South Africa',
        phone_code: '+27',
      },
      {
        code: 'US',
        name: 'United States',
        phone_code: '+1',
      },
    ]);

    vi.stubGlobal('fetch', vi.fn((url) => {
      // pending registration endpoint
      if (url.includes('pending-registration')) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                email: 'provider@test.com',
              },
            }),
        });
      }

      // registration submit endpoint
      if (url.includes('complete-registration')) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              success: true,
              user: {
                id: 1,
                company: 'Test Company',
              },
            }),
        });
      }

      return Promise.reject(new Error('Unknown endpoint'));
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  const renderPage = () =>
    render(
      <BrowserRouter>
        <ProviderRegistration />
      </BrowserRouter>
    );

  it('renders registration form', async () => {
    renderPage();

    expect(
      await screen.findByText('Registration Phase 02')
    ).toBeInTheDocument();

    expect(screen.getByText(/Company Name/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /industry/i })).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    renderPage();

    const submitBtn = await screen.findByRole('button', {
      name: /register and continue/i,
    });

    await userEvent.click(submitBtn);

    expect(
      await screen.findByText(/company name is required/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/contact person name is required/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/phone number is required/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/industry selection is required/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/must agree to the terms/i)
    ).toBeInTheDocument();
  });

  it('validates invalid company name', async () => {
    renderPage();

    const input = await screen.findByRole('textbox', {
      name: /company name/i,
    });

    await userEvent.type(input, '@@@');
    fireEvent.blur(input);

    expect(
      await screen.findByText(/company name can only contain/i)
    ).toBeInTheDocument();
  });

  it('validates invalid contact person', async () => {
    renderPage();

    const input = await screen.findByPlaceholderText('John Doe');

    await userEvent.type(input, '12345');
    fireEvent.blur(input);

    expect(
      await screen.findByText(/contact person name can only contain/i)
    ).toBeInTheDocument();
  });

  it('validates short phone number', async () => {
    renderPage();

    const phoneInput = await screen.findByPlaceholderText(
      /enter phone number/i
    );

    await userEvent.type(phoneInput, '123');
    fireEvent.blur(phoneInput);

    expect(
      await screen.findByText(/must have at least 8 digits/i)
    ).toBeInTheDocument();
  });

  it('formats phone number while typing', async () => {
    renderPage();

    const phoneInput = await screen.findByPlaceholderText(
      /enter phone number/i
    );

    await userEvent.type(phoneInput, '1234567890');

    expect(phoneInput.value).toContain('123');
  });

  it('submits successfully with valid form', async () => {
    renderPage();

    const companyInput = await screen.findByRole('textbox', {
      name: /company name/i,
    });

    const industrySelect = screen.getByRole('combobox', {
      name: /industry/i,
    });

    const contactInput = screen.getByPlaceholderText('John Doe');

    const phoneInput = screen.getByPlaceholderText(
      /enter phone number/i
    );

    const checkbox = screen.getByRole('checkbox');

    await userEvent.type(companyInput, 'Test Company');

    await userEvent.selectOptions(
      industrySelect,
      'Technology & IT'
    );

    await userEvent.type(contactInput, 'John Doe');

    await userEvent.type(phoneInput, '123456789');

    await userEvent.click(checkbox);

    const submitBtn = screen.getByRole('button', {
      name: /register and continue/i,
    });

    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('complete-registration'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith('/pipeline');
  });

  it('shows API error message when registration fails', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url.includes('pending-registration')) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                email: 'provider@test.com',
              },
            }),
        });
      }

      if (url.includes('complete-registration')) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              success: false,
              error: 'Registration failed',
            }),
        });
      }
    }));

    renderPage();

    const companyInput = await screen.findByRole('textbox', {
      name: /company name/i,
    });

    const industrySelect = screen.getByRole('combobox', {
      name: /industry/i,
    });

    const contactInput = screen.getByPlaceholderText('John Doe');

    const phoneInput = screen.getByPlaceholderText(
      /enter phone number/i
    );

    const checkbox = screen.getByRole('checkbox');

    await userEvent.type(companyInput, 'Test Company');

    await userEvent.selectOptions(
      industrySelect,
      'Technology & IT'
    );

    await userEvent.type(contactInput, 'John Doe');

    await userEvent.type(phoneInput, '123456789');

    await userEvent.click(checkbox);

    const submitBtn = screen.getByRole('button', {
      name: /register and continue/i,
    });

    await userEvent.click(submitBtn);

    expect(
      await screen.findByText(/registration failed/i)
    ).toBeInTheDocument();
  });

  it('redirects to login when pending registration fails', async () => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            success: false,
          }),
      })
    ));

    renderPage();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/prov-login');
    });
  });

  it('handles country loading failure gracefully', async () => {
    getAllCountries.mockRejectedValue(
      new Error('Countries failed')
    );

    renderPage();

    await waitFor(() => {
      expect(screen.queryByText(/loading countries/i)).not.toBeInTheDocument();
    });
  });

  it('shows loading state during submit', async () => {
    vi.stubGlobal('fetch', vi.fn((url) => {
      if (url.includes('pending-registration')) {
        return Promise.resolve({
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                email: 'provider@test.com',
              },
            }),
        });
      }

      if (url.includes('complete-registration')) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              json: () =>
                Promise.resolve({
                  success: true,
                  user: {},
                }),
            });
          }, 100);
        });
      }
    }));

    renderPage();

    const companyInput = await screen.findByRole('textbox', {
      name: /company name/i,
    });

    const industrySelect = screen.getByRole('combobox', {
      name: /industry/i,
    });

    const contactInput = screen.getByPlaceholderText('John Doe');

    const phoneInput = screen.getByPlaceholderText(
      /enter phone number/i
    );

    const checkbox = screen.getByRole('checkbox');

    await userEvent.type(companyInput, 'Test Company');

    await userEvent.selectOptions(
      industrySelect,
      'Technology & IT'
    );

    await userEvent.type(contactInput, 'John Doe');

    await userEvent.type(phoneInput, '123456789');

    await userEvent.click(checkbox);

    const submitBtn = screen.getByRole('button', {
      name: /register and continue/i,
    });

    await userEvent.click(submitBtn);

    expect(
      await screen.findByText(/processing/i)
    ).toBeInTheDocument();
  });
});