import { render, screen, fireEvent, within } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
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

// Mock IntersectionObserver
window.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("Home Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderHome = () => {
    return render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
  };

  test("renders navigation bar", () => {
    renderHome();
    const header = screen.getAllByRole('banner')[0];
    expect(within(header).getByText("GrowthStageSA")).toBeInTheDocument();
    expect(within(header).getByText("Opportunities")).toBeInTheDocument();
    expect(within(header).getByText("For Applicants")).toBeInTheDocument();
    expect(within(header).getByText("For Employers")).toBeInTheDocument();
    expect(within(header).getByText("Login")).toBeInTheDocument();
    expect(within(header).getByText("Sign Up")).toBeInTheDocument();
  });

  test("renders hero section with correct heading", () => {
    renderHome();
    expect(screen.getByRole('heading', { name: /Your Gateway to Accredited Learnerships/i })).toBeInTheDocument();
    expect(screen.getAllByText("Find Opportunities").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Post a Learnership").length).toBeGreaterThan(0);
  });

  test("renders SETA accreditation badges", () => {
    renderHome();
    expect(screen.getByText("SETA Accredited")).toBeInTheDocument();
    expect(screen.getByText("Verified Employers")).toBeInTheDocument();
    expect(screen.getByText("Growing Together")).toBeInTheDocument();
  });

  test("renders stat cards with numbers", () => {
    renderHome();
    expect(screen.getAllByText("5,000+").length).toBeGreaterThan(0);
    expect(screen.getAllByText("200+").length).toBeGreaterThan(0);
    expect(screen.getAllByText("50+").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Active Learners").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Employers").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Accredited Partners").length).toBeGreaterThan(0);
  });

  test("renders What We Offer section with 2 cards", () => {
    renderHome();
    expect(screen.getByRole('heading', { name: /Find Your Path to Success/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /For Learners/i, level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /For Employers/i, level: 3 })).toBeInTheDocument();
    expect(screen.queryByText("For Partners")).not.toBeInTheDocument();
  });

  test("renders Browse Opportunities button for Learners card", () => {
    renderHome();
    const browseButtons = screen.getAllByText("Browse Opportunities");
    expect(browseButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(browseButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/opportunities");
  });

  test("renders Post a Learnership button for Employers card", () => {
    renderHome();
    const postButtons = screen.getAllByText("Post a Learnership");
    expect(postButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(postButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/prov-login");
  });

  test("renders testimonials section", () => {
    renderHome();
    expect(screen.getByRole('heading', { name: /What Our Community Says/i })).toBeInTheDocument();
    // Only the active testimonial should be visible initially
    expect(screen.getByText("Thato Moloi")).toBeInTheDocument();
    // Test navigation to next testimonial
    const rightButton = screen.getByText("chevron_right");
    fireEvent.click(rightButton);
    expect(screen.getByText("Josh De Witt")).toBeInTheDocument();
  });

  test("testimonial navigation buttons work", () => {
    renderHome();
    const leftButton = screen.getByText("chevron_left");
    const rightButton = screen.getByText("chevron_right");
    
    expect(leftButton).toBeInTheDocument();
    expect(rightButton).toBeInTheDocument();
    
    fireEvent.click(rightButton);
    fireEvent.click(leftButton);
  });

  test("renders How It Works section", () => {
    renderHome();
    expect(screen.getByRole('heading', { name: /How GrowthStageSA Works/i })).toBeInTheDocument();
    expect(screen.getByText("Create Your Profile")).toBeInTheDocument();
    expect(screen.getByText("Discover Opportunities")).toBeInTheDocument();
    expect(screen.getByText("Apply & Track")).toBeInTheDocument();
  });

  test("renders Trust Banner with organisation badges", () => {
    renderHome();
    expect(screen.getByText("Trusted by Leading Organisations Across South Africa:")).toBeInTheDocument();
    expect(screen.getByText("SETA")).toBeInTheDocument();
    expect(screen.getByText("QCTO")).toBeInTheDocument();
    expect(screen.getByText("DHET")).toBeInTheDocument();
    expect(screen.getByText("MICT")).toBeInTheDocument();
    expect(screen.getByText("Services SETA")).toBeInTheDocument();
    expect(screen.getByText("FP&M SETA")).toBeInTheDocument();
  });

  test("renders Stats Impact section", () => {
    renderHome();
    expect(screen.getByRole('heading', { name: /Making a Difference in South Africa/i })).toBeInTheDocument();
    expect(screen.getAllByText("25,000+").length).toBeGreaterThan(0);
    expect(screen.getAllByText("500+").length).toBeGreaterThan(0);
    expect(screen.getAllByText("85%").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Learners Placed").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Active Learnerships").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Employer Partners").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Learner Satisfaction").length).toBeGreaterThan(0);
  });

  test("renders Final CTA section", () => {
    renderHome();
    expect(screen.getByText("Ready to Start Your Journey?")).toBeInTheDocument();
    const findButtons = screen.getAllByText("Find Opportunities");
    const postButtons = screen.getAllByText("Post a Learnership");
    
    expect(findButtons.length).toBeGreaterThan(0);
    expect(postButtons.length).toBeGreaterThan(0);
  });

  test("renders footer", () => {
    renderHome();
    expect(screen.getByText(/© 2025 GrowthStageSA/)).toBeInTheDocument();
    expect(screen.getByText(/POPIA Compliant/i)).toBeInTheDocument();
    expect(screen.getByText(/Proudly South African/i)).toBeInTheDocument();
  });

  test("Login button navigates to app-login", () => {
    renderHome();
    const loginButton = screen.getByText("Login");
    fireEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith("/app-login");
  });

  test("Sign Up button navigates to app-login", () => {
    renderHome();
    const signUpButton = screen.getByText("Sign Up");
    fireEvent.click(signUpButton);
    expect(mockNavigate).toHaveBeenCalledWith("/app-login");
  });
});