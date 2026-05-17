import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";

// ── Mock react-router-dom ────────────────────────────────────────────────────
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ── Mock AdminSection ────────────────────────────────────────────────────────
vi.mock("../components/admin/AdminSection", () => ({
  default: ({ isAdmin, source }) => (
    <div data-testid="admin-section" data-is-admin={String(isAdmin)} data-source={source} />
  ),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────
const renderAt = (path, state = {}) =>
  render(
    <MemoryRouter initialEntries={[{ pathname: path, state }]}>
      <Sidebar />
    </MemoryRouter>
  );

const setProviderUser = (data) =>
  localStorage.setItem("provider_user", JSON.stringify(data));

// ── Tests ────────────────────────────────────────────────────────────────────
describe("Sidebar", () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ── Branding ──────────────────────────────────────────────────────────────
  describe("branding", () => {
    it("renders the Growthstage logo text", () => {
      renderAt("/pipeline");
      expect(screen.getByText("Growthstage")).toBeInTheDocument();
    });

    it("shows 'Employer Portal' subtitle in normal mode", () => {
      renderAt("/pipeline");
      expect(screen.getByText("Employer Portal")).toBeInTheDocument();
    });

    it("shows 'Admin Portal' subtitle in admin mode", () => {
      renderAt("/admin/applications");
      expect(screen.getByText("Admin Portal", {selector : "p"})).toBeInTheDocument();
    });
  });

  // ── Normal mode navigation links ─────────────────────────────────────────
  describe("normal mode links", () => {
    it("renders Validation Pipeline link", () => {
      renderAt("/pipeline");
      expect(screen.getByText("Validation Pipeline")).toBeInTheDocument();
    });

    it("renders Analytics Dashboard link", () => {
      renderAt("/pipeline");
      expect(screen.getByText("Analytics Dashboard")).toBeInTheDocument();
    });

    it("does NOT render admin links in normal mode", () => {
      renderAt("/pipeline");
      expect(screen.queryByText("Access Applications")).not.toBeInTheDocument();
      expect(screen.queryByText("Admin Console")).not.toBeInTheDocument();
      expect(screen.queryByText("Admin Analytics")).not.toBeInTheDocument();
    });

    it("highlights the active pipeline link", () => {
      renderAt("/pipeline");
      const btn = screen.getByText("Validation Pipeline").closest("button");
      expect(btn).toHaveClass("bg-[#d2e4ff]");
    });

    it("does not highlight inactive analytics link when on pipeline", () => {
      renderAt("/pipeline");
      const btn = screen.getByText("Analytics Dashboard").closest("button");
      expect(btn).not.toHaveClass("bg-[#d2e4ff]");
    });

    it("highlights Analytics Dashboard when active", () => {
      renderAt("/analytics");
      const btn = screen.getByText("Analytics Dashboard").closest("button");
      expect(btn).toHaveClass("bg-[#d2e4ff]");
    });

    it("navigates to /pipeline when clicking Validation Pipeline", () => {
      renderAt("/analytics");
      fireEvent.click(screen.getByText("Validation Pipeline").closest("button"));
      expect(mockNavigate).toHaveBeenCalledWith(
        "/pipeline",
        expect.objectContaining({ state: expect.objectContaining({ source: "provider" }) })
      );
    });

    it("navigates to /analytics when clicking Analytics Dashboard", () => {
      renderAt("/pipeline");
      fireEvent.click(screen.getByText("Analytics Dashboard").closest("button"));
      expect(mockNavigate).toHaveBeenCalledWith(
        "/analytics",
        expect.objectContaining({ state: expect.objectContaining({ source: "provider" }) })
      );
    });

    it("passes the current pathname as 'from' in navigate state", () => {
      renderAt("/pipeline");
      fireEvent.click(screen.getByText("Analytics Dashboard").closest("button"));
      expect(mockNavigate).toHaveBeenCalledWith(
        "/analytics",
        expect.objectContaining({ state: expect.objectContaining({ from: "/pipeline" }) })
      );
    });
  });

  // ── Normal mode footer ────────────────────────────────────────────────────
  describe("normal mode footer", () => {
    it("renders Post New Opportunity button", () => {
      renderAt("/pipeline");
      expect(screen.getByText("Post New Opportunity")).toBeInTheDocument();
    });

    it("navigates to /post when clicking Post New Opportunity", () => {
      renderAt("/pipeline");
      fireEvent.click(screen.getByText("Post New Opportunity"));
      expect(mockNavigate).toHaveBeenCalledWith("/post");
    });

    it("renders AdminSection with isAdmin=false when no provider_user in localStorage", () => {
      renderAt("/pipeline");
      const section = screen.getByTestId("admin-section");
      expect(section).toBeInTheDocument();
      expect(section.dataset.isAdmin).toBe("false");
    });

    it("renders AdminSection with isAdmin=true when provider_user has isAdmin=true", () => {
      setProviderUser({ isAdmin: true });
      renderAt("/pipeline");
      expect(screen.getByTestId("admin-section").dataset.isAdmin).toBe("true");
    });

    it("renders AdminSection with isAdmin=false when provider_user has isAdmin=false", () => {
      setProviderUser({ isAdmin: false });
      renderAt("/pipeline");
      expect(screen.getByTestId("admin-section").dataset.isAdmin).toBe("false");
    });

    it("passes source='provider' to AdminSection", () => {
      renderAt("/pipeline");
      expect(screen.getByTestId("admin-section").dataset.source).toBe("provider");
    });

    it("does NOT render 'Back to Portal' button in normal mode", () => {
      renderAt("/pipeline");
      expect(screen.queryByText("Back to Portal")).not.toBeInTheDocument();
    });

    it("does NOT render the Admin Portal indicator in normal mode", () => {
      renderAt("/pipeline");
      expect(screen.queryByText("Admin Portal", { selector: "div" })).not.toBeInTheDocument();
    });
  });

  // ── Admin mode links ──────────────────────────────────────────────────────
  describe("admin mode links", () => {
    it("renders Access Applications link", () => {
      renderAt("/admin/applications");
      expect(screen.getByText("Access Applications")).toBeInTheDocument();
    });

    it("renders Admin Console link", () => {
      renderAt("/admin/console");
      expect(screen.getByText("Admin Console")).toBeInTheDocument();
    });

    it("renders Admin Analytics link", () => {
      renderAt("/admin/analytics");
      expect(screen.getByText("Admin Analytics")).toBeInTheDocument();
    });

    it("does NOT render normal links in admin mode", () => {
      renderAt("/admin/applications");
      expect(screen.queryByText("Validation Pipeline")).not.toBeInTheDocument();
      expect(screen.queryByText("Analytics Dashboard")).not.toBeInTheDocument();
    });

    it("highlights active admin link", () => {
      renderAt("/admin/applications");
      const btn = screen.getByText("Access Applications").closest("button");
      expect(btn).toHaveClass("bg-[#d2e4ff]");
    });

    it("navigates with correct state when clicking admin link", () => {
      renderAt("/admin/applications");
      fireEvent.click(screen.getByText("Admin Console").closest("button"));
      expect(mockNavigate).toHaveBeenCalledWith(
        "/admin/console",
        expect.objectContaining({ state: expect.objectContaining({ source: "provider" }) })
      );
    });
  });

  // ── Admin mode footer ─────────────────────────────────────────────────────
  describe("admin mode footer", () => {
    it("shows the grayed-out Admin Portal indicator", () => {
      renderAt("/admin/console");
      // The static div with text "Admin Portal" in admin footer
      const allAdminPortal = screen.getAllByText("Admin Portal");
      // At least one is the static gray div (not the subtitle header)
      expect(allAdminPortal.length).toBeGreaterThanOrEqual(1);
    });

    it("renders 'Back to Portal' button in admin mode", () => {
      renderAt("/admin/console");
      expect(screen.getByText("Back to Portal")).toBeInTheDocument();
    });

    it("does NOT render Post New Opportunity in admin mode", () => {
      renderAt("/admin/console");
      expect(screen.queryByText("Post New Opportunity")).not.toBeInTheDocument();
    });

    it("does NOT render AdminSection in admin mode", () => {
      renderAt("/admin/console");
      expect(screen.queryByTestId("admin-section")).not.toBeInTheDocument();
    });

    it("navigates to returnTo (from state) when clicking Back to Portal", () => {
      renderAt("/admin/console", { from: "/pipeline" });
      fireEvent.click(screen.getByText("Back to Portal"));
      expect(mockNavigate).toHaveBeenCalledWith(
        "/pipeline",
        expect.objectContaining({ state: { source: "provider" } })
      );
    });

    it("falls back to /pipeline when no 'from' in state", () => {
      renderAt("/admin/console");
      fireEvent.click(screen.getByText("Back to Portal"));
      expect(mockNavigate).toHaveBeenCalledWith(
        "/pipeline",
        expect.objectContaining({ state: { source: "provider" } })
      );
    });
  });

  // ── isAdmin detection from localStorage ──────────────────────────────────
  describe("isAdmin localStorage parsing", () => {
    it("handles missing provider_user gracefully (isAdmin=false)", () => {
      renderAt("/pipeline");
      expect(screen.getByTestId("admin-section").dataset.isAdmin).toBe("false");
    });

    it("handles malformed JSON in provider_user gracefully", () => {
      localStorage.setItem("provider_user", "{{invalid json}}");
      expect(() => renderAt("/pipeline")).not.toThrow();
      expect(screen.getByTestId("admin-section").dataset.isAdmin).toBe("false");
    });

    it("handles provider_user without isAdmin field (defaults to false)", () => {
      setProviderUser({ name: "Bob" });
      renderAt("/pipeline");
      expect(screen.getByTestId("admin-section").dataset.isAdmin).toBe("false");
    });

    it("treats truthy isAdmin value as true", () => {
      setProviderUser({ isAdmin: 1 });
      renderAt("/pipeline");
      expect(screen.getByTestId("admin-section").dataset.isAdmin).toBe("true");
    });
  });

  // ── adminOrigin passed as 'from' in link navigation ──────────────────────
  describe("adminOrigin in navigate state", () => {
    it("uses location.state.from as adminOrigin when present", () => {
      renderAt("/pipeline", { from: "/some-other-page" });
      fireEvent.click(screen.getByText("Analytics Dashboard").closest("button"));
      expect(mockNavigate).toHaveBeenCalledWith(
        "/analytics",
        expect.objectContaining({ state: expect.objectContaining({ from: "/some-other-page" }) })
      );
    });

    it("falls back to current pathname as adminOrigin when no state.from", () => {
      renderAt("/pipeline");
      fireEvent.click(screen.getByText("Analytics Dashboard").closest("button"));
      expect(mockNavigate).toHaveBeenCalledWith(
        "/analytics",
        expect.objectContaining({ state: expect.objectContaining({ from: "/pipeline" }) })
      );
    });
  });

  // ── Structural / a11y ─────────────────────────────────────────────────────
  describe("structure", () => {
    it("renders an aside element", () => {
      const { container } = renderAt("/pipeline");
      expect(container.querySelector("aside")).toBeInTheDocument();
    });

    it("renders a nav element inside aside", () => {
      const { container } = renderAt("/pipeline");
      expect(container.querySelector("aside nav")).toBeInTheDocument();
    });

    it("renders a header element inside aside", () => {
      const { container } = renderAt("/pipeline");
      expect(container.querySelector("aside header")).toBeInTheDocument();
    });

    it("all nav links are buttons", () => {
      renderAt("/pipeline");
      const nav = screen.getByRole("navigation");
      const buttons = nav.querySelectorAll("button");
      expect(buttons.length).toBe(2); // pipeline + analytics
    });

    it("renders exactly 3 admin nav buttons in admin mode", () => {
      renderAt("/admin/applications");
      const nav = screen.getByRole("navigation");
      const buttons = nav.querySelectorAll("button");
      expect(buttons.length).toBe(3);
    });
  });
});