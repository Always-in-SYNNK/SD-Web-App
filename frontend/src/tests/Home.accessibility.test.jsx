import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Home from "../pages/Home";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Minimal IntersectionObserver stub used by the component
window.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

const renderHome = () => render(
  <BrowserRouter>
    <Home />
  </BrowserRouter>
);

describe("Home accessibility and behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset scroll position
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  });

  it("opens and closes dropdowns via mouse and keyboard and navigates", async () => {
    const { container } = renderHome();

    const learnersButton = screen.getByRole("button", { name: /For Learners/i });
    const learnersMenu = learnersButton.closest("section");

    // Mouse enter opens
    fireEvent.mouseEnter(learnersMenu);
    expect(learnersButton).toHaveAttribute("aria-expanded", "true");

    // Mouse leave closes
    fireEvent.mouseLeave(learnersMenu);
    expect(learnersButton).toHaveAttribute("aria-expanded", "false");

    // Focus opens
    fireEvent.focus(learnersButton);
    expect(learnersButton).toHaveAttribute("aria-expanded", "true");

    // Blur to outside closes
    fireEvent.blur(learnersMenu, { relatedTarget: document.body });
    await waitFor(() => expect(learnersButton).toHaveAttribute("aria-expanded", "false"));

    // Open and click Sign In -> should navigate to app-login
    fireEvent.click(learnersButton);
    fireEvent.click(within(learnersMenu).getByRole("button", { name: "Sign In" }));
    expect(mockNavigate).toHaveBeenCalledWith("/app-login");

    // Employers dropdown behaves similarly
    const employersButton = screen.getByRole("button", { name: /For Employers/i });
    const employersMenu = employersButton.closest("section");

    fireEvent.mouseEnter(employersMenu);
    expect(employersButton).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(within(employersMenu).getByRole("button", { name: "Sign In" }));
    expect(mockNavigate).toHaveBeenCalledWith("/prov-login");
  });

  it("navigates testimonials with left/right buttons and wraps around", () => {
    const { container } = renderHome();

    // Initially the first testimonial is visible
    expect(screen.getByText("Thato Moloi")).toBeInTheDocument();

    // Next
    fireEvent.click(screen.getByText("chevron_right"));
    expect(screen.getByText("Josh De Witt")).toBeInTheDocument();

    // Previous
    fireEvent.click(screen.getByText("chevron_left"));
    expect(screen.getByText("Thato Moloi")).toBeInTheDocument();

    // Wrap backwards from first -> last
    fireEvent.click(screen.getByText("chevron_left"));
    expect(screen.getByText("Naledi Khumalo")).toBeInTheDocument();

    // Click the small pager dot to change testimonial (use container query)
    const tc = container.querySelector('.relative.max-w-3xl');
    const dotButtons = Array.from(tc.querySelectorAll('button')).filter(b => b.className && b.className.includes('w-2'));
    if (dotButtons.length >= 2) {
      fireEvent.click(dotButtons[1]);
      expect(screen.getByText("Josh De Witt")).toBeInTheDocument();
    }
  });

  it("shows scroll-to-top button after scroll and calls window.scrollTo on click", async () => {
    const scrollToMock = vi.fn();
    window.scrollTo = scrollToMock;

    Object.defineProperty(window, "scrollY", { configurable: true, value: 400 });
    renderHome();

    fireEvent.scroll(window);

    // wait for the button to appear
    await waitFor(() => expect(screen.getByText("arrow_upward")).toBeInTheDocument());

    fireEvent.click(screen.getByText("arrow_upward").closest('button'));
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
