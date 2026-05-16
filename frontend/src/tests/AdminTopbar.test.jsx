import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AdminTopbar from "../components/layout/AdminTopbar";

// ── Mocks ────────────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockSupabaseSignOut = vi.fn().mockResolvedValue({});
vi.mock("../lib/supabaseClient", () => ({
  supabase: {
    auth: { signOut: () => mockSupabaseSignOut() },
  },
}));

let mockAuthUser = null;
vi.mock("../context/useAuth", () => ({
  useAuth: () => ({ user: mockAuthUser }),
}));

// ── Mock global fetch ─────────────────────────────────────────────────────────
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ── Helpers ───────────────────────────────────────────────────────────────────
const renderTopbar = (props = {}) =>
  render(
    <MemoryRouter>
      <AdminTopbar title="Test Page" {...props} />
    </MemoryRouter>
  );

const makeProviderResponse = (overrides = {}) => ({
  authenticated: true,
  user: { name: "Provider User", organisation_name: "ProvOrg", ...overrides },
});

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("AdminTopbar", () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    mockSupabaseSignOut.mockClear();
    mockAuthUser = null;
    mockFetch.mockResolvedValue({
      json: async () => ({ authenticated: false }),
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ── Title rendering ─────────────────────────────────────────────────────
  describe("title", () => {
    it("renders the title prop", async () => {
      renderTopbar({ title: "My Admin Page" });
      expect(screen.getByText("My Admin Page")).toBeInTheDocument();
    });

    it("renders as an h1 element", () => {
      renderTopbar({ title: "Dashboard" });
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Dashboard");
    });

    it("renders an empty string title without crashing", () => {
      expect(() => renderTopbar({ title: "" })).not.toThrow();
    });
  });

  // ── Action buttons ──────────────────────────────────────────────────────
  describe("action buttons", () => {
    it("renders notification bell button", () => {
      renderTopbar();
      expect(screen.getByText("🔔")).toBeInTheDocument();
    });

    it("renders settings button", () => {
      renderTopbar();
      expect(screen.getByText("⚙️")).toBeInTheDocument();
    });
  });

  // ── User resolution: provider source (Priority 1) ───────────────────────
  describe("user resolution – provider source", () => {
    it("fetches /api/auth/provider/me for provider source", async () => {
      mockFetch.mockResolvedValue({
        json: async () => makeProviderResponse(),
      });
      renderTopbar({ source: "provider" });
      await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/auth/provider/me"),
        expect.objectContaining({ credentials: "include" })
      ));
    });

    it("shows provider user name from API", async () => {
      mockFetch.mockResolvedValue({
        json: async () => makeProviderResponse({ name: "Provider Alice" }),
      });
      renderTopbar({ source: "provider" });
      await waitFor(() => expect(screen.getByText("Provider Alice")).toBeInTheDocument());
    });

    it("shows organisation_name as subtitle for provider", async () => {
      mockFetch.mockResolvedValue({
        json: async () => makeProviderResponse({ organisation_name: "TechCorp" }),
      });
      renderTopbar({ source: "provider" });
      await waitFor(() => expect(screen.getByText("TechCorp")).toBeInTheDocument());
    });

    it("falls back to 'Employer' when organisation_name is missing", async () => {
      mockFetch.mockResolvedValue({
        json: async () => ({ authenticated: true, user: { name: "Bob" } }),
      });
      renderTopbar({ source: "provider" });
      await waitFor(() => expect(screen.getByText("Employer")).toBeInTheDocument());
    });

    it("shows avatar initial from provider name", async () => {
      mockFetch.mockResolvedValue({
        json: async () => makeProviderResponse({ name: "Victor Hugo" }),
      });
      renderTopbar({ source: "provider" });
      await waitFor(() => expect(screen.getByText("V")).toBeInTheDocument());
    });

    it("falls back to authUser when provider API returns not authenticated", async () => {
      mockFetch.mockResolvedValue({
        json: async () => ({ authenticated: false }),
      });
      mockAuthUser = { name: "Auth Fallback", role: "admin" };
      renderTopbar({ source: "provider" });
      await waitFor(() => expect(screen.getByText("Auth Fallback")).toBeInTheDocument());
    });

    it("falls back when provider API fetch throws", async () => {
      mockFetch.mockRejectedValue(new Error("Network error"));
      mockAuthUser = { name: "Error Fallback", role: "admin" };
      renderTopbar({ source: "provider" });
      await waitFor(() => expect(screen.getByText("Error Fallback")).toBeInTheDocument());
    });

    it("does NOT fetch provider API when source is 'applicant'", async () => {
      mockFetch.mockClear();
        mockAuthUser = { name: "Applicant User", role: "applicant" };
      renderTopbar({ source: "applicant" });
      await waitFor(() => screen.getByText("Applicant User"));
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  // ── User resolution: authUser context (Priority 2) ──────────────────────
  describe("user resolution – authUser context", () => {
    it("shows name from authUser", async () => {
      mockAuthUser = { name: "Auth User", role: "applicant" };
      renderTopbar();
      await waitFor(() => expect(screen.getByText("Auth User")).toBeInTheDocument());
    });

    it("shows 'Employer' subtitle for provider role in authUser", async () => {
      mockAuthUser = { name: "Provider Auth", role: "provider" };
      renderTopbar();
      await waitFor(() => expect(screen.getByText("Employer")).toBeInTheDocument());
    });

    it("shows role as subtitle for non-provider authUser", async () => {
      mockAuthUser = { name: "Admin Auth", role: "admin" };
      renderTopbar();
      await waitFor(() => expect(screen.getByText("admin")).toBeInTheDocument());
    });

    it("falls back to 'User' when authUser has no name", async () => {
      mockAuthUser = { role: "applicant" };
      renderTopbar();
      await waitFor(() => expect(screen.getByText("User")).toBeInTheDocument());
    });

    it("uses full_name when name is absent in authUser", async () => {
      mockAuthUser = { full_name: "Full Name User", role: "applicant" };
      renderTopbar();
      await waitFor(() => expect(screen.getByText("Full Name User")).toBeInTheDocument());
    });
  });

  // ── User resolution: localStorage (Priority 3) ──────────────────────────
  describe("user resolution – localStorage fallback", () => {
    it("resolves name from localStorage when no authUser", async () => {
      localStorage.setItem("user", JSON.stringify({ name: "Local Admin", role: "admin" }));
      renderTopbar();
      await waitFor(() => expect(screen.getByText("Local Admin")).toBeInTheDocument());
    });

    it("shows role as subtitle from localStorage", async () => {
      localStorage.setItem("user", JSON.stringify({ name: "Local Admin", role: "superadmin" }));
      renderTopbar();
      await waitFor(() => expect(screen.getByText("superadmin")).toBeInTheDocument());
    });

    it("falls back to 'User' when localStorage user has no name", async () => {
      localStorage.setItem("user", JSON.stringify({ role: "admin" }));
      renderTopbar();
      await waitFor(() => expect(screen.getByText("User")).toBeInTheDocument());
    });

    it("handles malformed localStorage JSON without crashing", async () => {
      localStorage.setItem("user", "{{not-json}}");
      expect(() => renderTopbar()).not.toThrow();
    });
  });

  // ── Dropdown menu ────────────────────────────────────────────────────────
  describe("dropdown menu", () => {
    const setupLoggedIn = async () => {
      mockAuthUser = { name: "Dropdown User", role: "admin" };
      renderTopbar();
      await waitFor(() => screen.getByText("Dropdown User"));
    };

    it("does not show dropdown by default", async () => {
      await setupLoggedIn();
      expect(screen.queryByText("Sign Out")).not.toBeInTheDocument();
    });

    it("shows dropdown on avatar/name button click", async () => {
      await setupLoggedIn();
      const avatarBtn = screen.getByText("D"); // initial
      fireEvent.click(avatarBtn.closest("button"));
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });

    it("shows Dashboard option in dropdown", async () => {
      await setupLoggedIn();
      fireEvent.click(screen.getByText("D").closest("button"));
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("navigates to /pipeline when clicking Dashboard in dropdown", async () => {
      await setupLoggedIn();
      fireEvent.click(screen.getByText("D").closest("button"));
      fireEvent.click(screen.getByText("Dashboard"));
      expect(mockNavigate).toHaveBeenCalledWith("/pipeline");
    });

    it("closes dropdown after clicking Dashboard", async () => {
      await setupLoggedIn();
      fireEvent.click(screen.getByText("D").closest("button"));
      fireEvent.click(screen.getByText("Dashboard"));
      await waitFor(() => expect(screen.queryByText("Sign Out")).not.toBeInTheDocument());
    });

    it("closes dropdown on outside click", async () => {
      await setupLoggedIn();
      fireEvent.click(screen.getByText("D").closest("button"));
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
      fireEvent.mouseDown(document.body);
      await waitFor(() => expect(screen.queryByText("Sign Out")).not.toBeInTheDocument());
    });
  });

  // ── Logout ───────────────────────────────────────────────────────────────
  describe("logout", () => {
    const openAndClickSignOut = async (source = "applicant") => {
      mockAuthUser = { name: "Logout User", role: "admin" };
      renderTopbar({ source });
      await waitFor(() => screen.getByText("Logout User"));
      fireEvent.click(screen.getByText("L").closest("button"));
      fireEvent.click(screen.getByText("Sign Out"));
    };

    it("clears user from localStorage on logout", async () => {
      localStorage.setItem("user", "something");
      await openAndClickSignOut();
      await waitFor(() => expect(localStorage.getItem("user")).toBeNull());
    });

    it("clears token from localStorage on logout", async () => {
      localStorage.setItem("token", "tok");
      await openAndClickSignOut();
      await waitFor(() => expect(localStorage.getItem("token")).toBeNull());
    });

    it("clears role from localStorage on logout", async () => {
      localStorage.setItem("role", "admin");
      await openAndClickSignOut();
      await waitFor(() => expect(localStorage.getItem("role")).toBeNull());
    });

    it("calls supabase.auth.signOut", async () => {
      await openAndClickSignOut();
      await waitFor(() => expect(mockSupabaseSignOut).toHaveBeenCalled());
    });

    it("navigates to / after logout", async () => {
      await openAndClickSignOut();
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
    });

    it("calls provider logout endpoint when source is provider", async () => {
      mockFetch
        .mockResolvedValueOnce({ json: async () => ({ authenticated: false }) }) // /me
        .mockResolvedValueOnce({}); // /logout
      await openAndClickSignOut("provider");
      await waitFor(() =>
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("/api/auth/provider/logout"),
          expect.objectContaining({ method: "POST", credentials: "include" })
        )
      );
    });

    it("does NOT call provider logout endpoint when source is applicant", async () => {
        mockFetch.mockClear(); 
      await openAndClickSignOut("applicant");
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
      const logoutCalls = mockFetch.mock.calls.filter((c) =>
        String(c[0]).includes("/api/auth/provider/logout")
      );
      expect(logoutCalls.length).toBe(0);
    });
  });

  // ── Structure / a11y ─────────────────────────────────────────────────────
  describe("structure", () => {
    it("renders a header element", () => {
      const { container } = renderTopbar();
      expect(container.querySelector("header")).toBeInTheDocument();
    });

    it("header is sticky", () => {
      const { container } = renderTopbar();
      expect(container.querySelector("header")).toHaveClass("sticky");
    });

    it("header has top-0 class", () => {
      const { container } = renderTopbar();
      expect(container.querySelector("header")).toHaveClass("top-0");
    });

    it("renders a figure (avatar) for the user", async () => {
      mockAuthUser = { name: "Test User", role: "admin" };
      const { container } = renderTopbar();
      await waitFor(() => screen.getByText("Test User"));
      expect(container.querySelector("figure")).toBeInTheDocument();
    });
  });

  // ── Default props ────────────────────────────────────────────────────────
  describe("default props", () => {
    it("source defaults to 'applicant' and skips provider fetch", async () => {
       mockFetch.mockClear();
      mockAuthUser = { name: "Default Source", role: "admin" };
      renderTopbar({ title: "Page" }); // no source prop
      await waitFor(() => screen.getByText("Default Source"));
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});