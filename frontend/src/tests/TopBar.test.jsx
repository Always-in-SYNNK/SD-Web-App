import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Topbar from "../components/layout/Topbar";

// ── Mocks ────────────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Supabase mock
const mockSupabaseSignOut = vi.fn().mockResolvedValue({});
const mockSupabaseSelect  = vi.fn();

vi.mock("../lib/supabaseClient", () => ({
  supabase: {
    auth: { signOut: () => mockSupabaseSignOut() },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: mockSupabaseSelect,
        }),
      }),
    }),
  },
}));

// useAuth mock – overridable per-test
let mockAuthUser = null;
vi.mock("../context/useAuth", () => ({
  useAuth: () => ({ user: mockAuthUser }),
}));

// ── Helpers ──────────────────────────────────────────────────────────────────
const renderAt = (path = "/pipeline", props = {}) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Topbar {...props} />
    </MemoryRouter>
  );

const makeUser = (overrides = {}) => ({
  id: "user-1",
  name: "Jane Doe",
  role: "applicant",
  ...overrides,
});

// ── Tests ────────────────────────────────────────────────────────────────────
describe("Topbar", () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    mockSupabaseSignOut.mockClear();
    mockSupabaseSelect.mockResolvedValue({ data: null, error: null });
    mockAuthUser = null;
  });

  afterEach(() => {
    localStorage.clear();
  });

  // ── Not logged in ─────────────────────────────────────────────────────────
  describe("not logged in", () => {
    it("renders Sign In button when no user", () => {
      renderAt("/pipeline");
      expect(screen.getByText("Sign In")).toBeInTheDocument();
    });

    it("navigates to /prov-login on Sign In click", () => {
      renderAt("/pipeline");
      fireEvent.click(screen.getByText("Sign In"));
      expect(mockNavigate).toHaveBeenCalledWith("/prov-login");
    });

    it("renders Home nav link", () => {
      renderAt("/pipeline");
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    it("renders Dashboard nav link", () => {
      renderAt("/pipeline");
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });

    it("renders notification bell", () => {
      renderAt("/pipeline");
      expect(screen.getByText("🔔")).toBeInTheDocument();
    });

    it("renders help button", () => {
      renderAt("/pipeline");
      expect(screen.getByText("❓")).toBeInTheDocument();
    });

    it("does NOT render user avatar when not logged in", () => {
      renderAt("/pipeline");
      // No figure with initial
      expect(screen.queryByRole("button", { name: /sign out/i })).not.toBeInTheDocument();
    });
  });

  // ── Logged in via providerUser prop ──────────────────────────────────────
  describe("logged in via providerUser prop", () => {
    it("shows the user's name", async () => {
      renderAt("/pipeline", { user: makeUser({ name: "Alice Smith" }) });
      await waitFor(() => expect(screen.getByText("Alice Smith")).toBeInTheDocument());
    });

    it("shows 'Applicant' subtitle for applicant role", async () => {
      renderAt("/pipeline", { user: makeUser({ role: "applicant" }) });
      await waitFor(() => expect(screen.getByText("Applicant")).toBeInTheDocument());
    });

    it("shows avatar initial from name", async () => {
      renderAt("/pipeline", { user: makeUser({ name: "Bob Test" }) });
      await waitFor(() => expect(screen.getByText("B")).toBeInTheDocument());
    });

    it("does NOT render Sign In button when logged in", async () => {
      renderAt("/pipeline", { user: makeUser() });
      await waitFor(() => expect(screen.queryByText("Sign In")).not.toBeInTheDocument());
    });
  });

  // ── Logged in via authUser (context) ─────────────────────────────────────
  describe("logged in via useAuth context", () => {
    it("shows name from authUser when no providerUser prop", async () => {
      mockAuthUser = makeUser({ name: "Context User" });
      renderAt("/pipeline");
      await waitFor(() => expect(screen.getByText("Context User")).toBeInTheDocument());
    });

    it("providerUser prop takes priority over authUser", async () => {
      mockAuthUser = makeUser({ name: "Context User" });
      renderAt("/pipeline", { user: makeUser({ name: "Prop User" }) });
      await waitFor(() => expect(screen.getByText("Prop User")).toBeInTheDocument());
      expect(screen.queryByText("Context User")).not.toBeInTheDocument();
    });
  });

  // ── Logged in via localStorage ────────────────────────────────────────────
  describe("logged in via localStorage", () => {
    it("resolves user from localStorage when no prop or context user", async () => {
      localStorage.setItem("user", JSON.stringify({ name: "Local User", role: "applicant" }));
      renderAt("/pipeline");
      await waitFor(() => expect(screen.getByText("Local User")).toBeInTheDocument());
    });

    it("handles malformed localStorage JSON gracefully", async () => {
      localStorage.setItem("user", "not-valid-json");
      expect(() => renderAt("/pipeline")).not.toThrow();
    });

    it("falls back to 'User' when name is missing in localStorage user", async () => {
      localStorage.setItem("user", JSON.stringify({ role: "applicant" }));
      renderAt("/pipeline");
      await waitFor(() => expect(screen.getByText("User")).toBeInTheDocument());
    });
  });

  // ── Provider role – org name fetching ────────────────────────────────────
  describe("provider role", () => {
    it("fetches and displays organisation name for provider", async () => {
      mockSupabaseSelect.mockResolvedValue({ data: { organisation_name: "Acme Corp" }, error: null });
      renderAt("/pipeline", { user: makeUser({ role: "provider", id: "prov-1" }) });
      await waitFor(() => expect(screen.getByText("Acme Corp")).toBeInTheDocument());
    });

    it("falls back to 'Employer' when org fetch returns null", async () => {
      mockSupabaseSelect.mockResolvedValue({ data: null, error: null });
      renderAt("/pipeline", { user: makeUser({ role: "provider", id: "prov-1" }) });
      await waitFor(() => expect(screen.getByText("Employer")).toBeInTheDocument());
    });

    it("shows 'Employer' as subtitle for provider role (before org loads)", async () => {
      mockSupabaseSelect.mockResolvedValue({ data: null, error: null });
      renderAt("/pipeline", { user: makeUser({ role: "provider", id: "prov-1" }) });
      await waitFor(() => expect(screen.getByText("Employer")).toBeInTheDocument());
    });
  });

  // ── Active page label & nav highlighting ─────────────────────────────────
  describe("page label and nav highlighting", () => {
    const loggedInProps = { user: makeUser({ name: "Nav User" }) };

    it("highlights Dashboard link when on /pipeline", async () => {
      renderAt("/pipeline", loggedInProps);
      await waitFor(() => {
        const dashBtn = screen.getByText("Dashboard").closest("button");
        expect(dashBtn).toHaveClass("text-[#035b9d]");
        expect(dashBtn).toHaveClass("font-bold");
      });
    });

    it("does NOT show page label pill on /pipeline itself", async () => {
      renderAt("/pipeline", loggedInProps);
      await waitFor(() => {
        // PAGE_LABELS["/pipeline"] = "Validation Pipeline" — but it should NOT show the pill on /pipeline
        const spans = screen.queryAllByText("Validation Pipeline");
        // There should be none rendered as the pill (span element)
        const pills = spans.filter((el) => el.tagName === "SPAN");
        expect(pills.length).toBe(0);
      });
    });

    it("shows 'Validation Pipeline' label pill when on /pipeline (wait — it should NOT render the pill on /pipeline)", async () => {
      // Per code: {activeLabel && currentPath !== "/pipeline" && <span>}
      // So on /pipeline, no pill for Validation Pipeline
      renderAt("/pipeline", loggedInProps);
      await waitFor(() => {
        const pill = screen.queryByText("Validation Pipeline", { selector: "span" });
        expect(pill).not.toBeInTheDocument();
      });
    });

    it("shows 'Post New Opportunity' page label pill on /post-opportunity", async () => {
      renderAt("/post-opportunity", loggedInProps);
      await waitFor(() => {
        const pill = screen.getByText("Post New Opportunity");
        expect(pill.tagName).toBe("SPAN");
      });
    });

    it("shows 'Admin Applications' label on /admin-applications", async () => {
      renderAt("/admin-applications", loggedInProps);
      await waitFor(() => {
        expect(screen.getByText("Admin Applications")).toBeInTheDocument();
      });
    });

    it("shows 'Admin Console' label on /admin-console", async () => {
      renderAt("/admin-console", loggedInProps);
      await waitFor(() => {
        expect(screen.getByText("Admin Console")).toBeInTheDocument();
      });
    });

    it("shows no label on unknown route", async () => {
      renderAt("/some-unknown-route", loggedInProps);
      await waitFor(() => {
        // No span pill at all
        const nav = document.querySelector("nav section:first-child");
        const spans = nav ? nav.querySelectorAll("span") : [];
        expect(spans.length).toBe(0);
      });
    });
  });

  // ── Home and Dashboard navigation ─────────────────────────────────────────
  describe("nav button navigation", () => {
    it("navigates to / when clicking Home", async () => {
      renderAt("/pipeline", { user: makeUser() });
      await waitFor(() => screen.getByText("Home"));
      fireEvent.click(screen.getByText("Home"));
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("navigates to /pipeline when clicking Dashboard", async () => {
      renderAt("/post-opportunity", { user: makeUser() });
      await waitFor(() => screen.getByText("Dashboard"));
      fireEvent.click(screen.getByText("Dashboard"));
      expect(mockNavigate).toHaveBeenCalledWith("/pipeline");
    });
  });

  // ── User dropdown menu ────────────────────────────────────────────────────
  describe("user dropdown menu", () => {
    it("does not show dropdown by default", async () => {
      renderAt("/pipeline", { user: makeUser({ name: "Menu User" }) });
      await waitFor(() => screen.getByText("Menu User"));
      expect(screen.queryByText("Sign Out")).not.toBeInTheDocument();
    });

    it("shows dropdown when clicking avatar/name area", async () => {
      renderAt("/pipeline", { user: makeUser({ name: "Menu User" }) });
      await waitFor(() => screen.getByText("Menu User"));

      // The button wrapping the avatar/name area
      const avatarBtn = screen.getByText("M"); // avatar initial
      fireEvent.click(avatarBtn.closest("button"));
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
    });

    it("shows Dashboard option in dropdown", async () => {
      renderAt("/pipeline", { user: makeUser({ name: "Menu User" }) });
      await waitFor(() => screen.getByText("Menu User"));
      fireEvent.click(screen.getByText("M").closest("button"));
      // There are two "Dashboard" texts: nav link + dropdown
      const dashboards = screen.getAllByText("Dashboard");
      expect(dashboards.length).toBeGreaterThanOrEqual(2);
    });

    it("closes dropdown after clicking Dashboard in menu", async () => {
      renderAt("/pipeline", { user: makeUser({ name: "Menu User" }) });
      await waitFor(() => screen.getByText("Menu User"));
      fireEvent.click(screen.getByText("M").closest("button"));
      const dropdownDashboard = screen.getAllByText("Dashboard").find(
        (el) => el.closest("section.absolute")
      );
      fireEvent.click(dropdownDashboard);
      expect(screen.queryByText("Sign Out")).not.toBeInTheDocument();
    });

    it("navigates to /pipeline when clicking Dashboard in dropdown", async () => {
      renderAt("/post-opportunity", { user: makeUser({ name: "Menu User" }) });
      await waitFor(() => screen.getByText("Menu User"));
      fireEvent.click(screen.getByText("M").closest("button"));
      const dropdownDashboard = screen.getAllByText("Dashboard").find(
        (el) => el.closest("section.absolute")
      );
      fireEvent.click(dropdownDashboard);
      expect(mockNavigate).toHaveBeenCalledWith("/pipeline");
    });

    it("closes dropdown on outside click", async () => {
      renderAt("/pipeline", { user: makeUser({ name: "Menu User" }) });
      await waitFor(() => screen.getByText("Menu User"));
      fireEvent.click(screen.getByText("M").closest("button"));
      expect(screen.getByText("Sign Out")).toBeInTheDocument();
      fireEvent.mouseDown(document.body);
      await waitFor(() => expect(screen.queryByText("Sign Out")).not.toBeInTheDocument());
    });
  });

  // ── Logout ────────────────────────────────────────────────────────────────
  describe("logout", () => {
    it("calls onLogout callback if provided", async () => {
      const onLogout = vi.fn();
      renderAt("/pipeline", { user: makeUser({ name: "Log Out User" }), onLogout });
      await waitFor(() => screen.getByText("L"));
      fireEvent.click(screen.getByText("L").closest("button"));
      fireEvent.click(screen.getByText("Sign Out"));
      expect(onLogout).toHaveBeenCalled();
    });

    it("clears localStorage on logout", async () => {
      localStorage.setItem("user", "something");
      localStorage.setItem("token", "tok");
      localStorage.setItem("role", "provider");
      renderAt("/pipeline", { user: makeUser({ name: "Log Out User" }) });
      await waitFor(() => screen.getByText("L"));
      fireEvent.click(screen.getByText("L").closest("button"));
      fireEvent.click(screen.getByText("Sign Out"));
      await waitFor(() => {
        expect(localStorage.getItem("user")).toBeNull();
        expect(localStorage.getItem("token")).toBeNull();
        expect(localStorage.getItem("role")).toBeNull();
      });
    });

    it("calls supabase.auth.signOut on logout", async () => {
      renderAt("/pipeline", { user: makeUser({ name: "Log Out User" }) });
      await waitFor(() => screen.getByText("L"));
      fireEvent.click(screen.getByText("L").closest("button"));
      fireEvent.click(screen.getByText("Sign Out"));
      await waitFor(() => expect(mockSupabaseSignOut).toHaveBeenCalled());
    });

    it("navigates to / after logout", async () => {
      renderAt("/pipeline", { user: makeUser({ name: "Log Out User" }) });
      await waitFor(() => screen.getByText("L"));
      fireEvent.click(screen.getByText("L").closest("button"));
      fireEvent.click(screen.getByText("Sign Out"));
      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
    });
  });

  // ── Structure ─────────────────────────────────────────────────────────────
  describe("structure", () => {
    it("renders a nav element", () => {
      const { container } = renderAt("/pipeline");
      expect(container.querySelector("nav")).toBeInTheDocument();
    });

    it("nav is sticky and full-width", () => {
      const { container } = renderAt("/pipeline");
      const nav = container.querySelector("nav");
      expect(nav).toHaveClass("sticky");
      expect(nav).toHaveClass("top-0");
      expect(nav).toHaveClass("w-full");
    });
  });
});