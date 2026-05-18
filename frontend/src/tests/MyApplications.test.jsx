import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";

const { mockFetch, mockAccept, mockUnapply, mockNavigate } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  mockAccept: vi.fn(),
  mockUnapply: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock("../services/myApplicationService", () => ({
  fetchMyApplications: mockFetch,
  acceptOffer: mockAccept,
  unapplyFromApplication: mockUnapply,
}));

vi.mock("../context/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../components/dashboard/Sidebar", () => ({
  Sidebar: () => null,
}));

vi.mock("../components/applications/myApplicationList", () => ({
  ApplicationList: ({ applications, onUnapply, onAccept }) => (
    <section data-testid="application-list">
      {applications.map((app) => (
        <article key={app.id} data-testid={`application-${app.id}`}>
          <h3>{app.title}</h3>
          <p>{app.status}</p>
          <p>{app.meta}</p>
          {app.status === "Offered" && (
            <button onClick={() => onAccept(app.id)}>Accept</button>
          )}
          {(app.status === "Received" || app.status === "Shortlisted") && (
            <button onClick={() => onUnapply(app.id)}>Unapply</button>
          )}
        </article>
      ))}
    </section>
  ),
}));

vi.mock("../components/notifications/notificationDropdown", () => ({
  NotificationDropdown: () => null,
}));

import { useAuth } from "../context/useAuth";

const { default: MyApplications } = await import("../pages/MyApplications");

describe("MyApplications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ token: "mock-token", user: { email: "jane@example.com" } });
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ profile: { full_name: "Jane Doe" } }),
      })
    );
  });

  // =========================
  // LOAD + RENDER
  // =========================
  test("loads and displays applications", async () => {
    mockFetch.mockResolvedValue([
      {
        id: 1,
        status: "received",
        created_at: new Date().toISOString(),
        opportunities: {
          title: "Intern",
          location: "Joburg",
          provider_profiles: { organisation_name: "ABC" },
        },
      },
    ]);

    render(<MyApplications />);

    const appList = await screen.findByTestId("application-list");

    await waitFor(() => {
      expect(within(appList).getByText("Intern")).toBeInTheDocument();
      expect(within(appList).getByText("Received")).toBeInTheDocument();
    });
  });

  // =========================
  // TAB NAVIGATION
  // =========================
  test("switches between Ongoing, Accepted, and Rejected tabs", async () => {
    const now = new Date().toISOString();
    mockFetch.mockResolvedValue([
      { id: 1, status: "received", created_at: now, opportunities: { title: "Job 1", provider_profiles: {} } },
      { id: 2, status: "accepted", created_at: now, opportunities: { title: "Job 2", provider_profiles: {} } },
      { id: 3, status: "rejected", created_at: now, opportunities: { title: "Job 3", provider_profiles: {} } },
    ]);

    render(<MyApplications />);

    const appList = await screen.findByTestId('application-list');

    await waitFor(() => {
      expect(within(appList).getAllByText("Job 1").length).toBeGreaterThan(0);
    });

    // Click Accepted tab (select the button explicitly)
    const acceptedTab = screen.getByRole('button', { name: /Accepted/i });
    fireEvent.click(acceptedTab);

    await waitFor(() => {
      expect(within(appList).getAllByText("Job 2").length).toBeGreaterThan(0);
      expect(within(appList).queryAllByText("Job 1").length).toBe(0);
    });

    // Click Rejected tab (select the button explicitly)
    const rejectedTab = screen.getByRole('button', { name: /Rejected/i });
    fireEvent.click(rejectedTab);

    await waitFor(() => {
      expect(within(appList).getAllByText("Job 3").length).toBeGreaterThan(0);
      expect(within(appList).queryAllByText("Job 2").length).toBe(0);
    });

    // Click Ongoing tab (select the button explicitly)
    const ongoingTab = screen.getByRole('button', { name: /Ongoing/i });
    fireEvent.click(ongoingTab);

    await waitFor(() => {
      expect(within(appList).getAllByText("Job 1").length).toBeGreaterThan(0);
    });
  });

  // =========================
  // TAB COUNTS
  // =========================
  test("displays correct counts on tabs", async () => {
    const now = new Date().toISOString();
    mockFetch.mockResolvedValue([
      { id: 1, status: "received", created_at: now, opportunities: { title: "Job 1", provider_profiles: {} } },
      { id: 2, status: "shortlisted", created_at: now, opportunities: { title: "Job 2", provider_profiles: {} } },
      { id: 3, status: "offered", created_at: now, opportunities: { title: "Job 3", provider_profiles: {} } },
      { id: 4, status: "accepted", created_at: now, opportunities: { title: "Job 4", provider_profiles: {} } },
      { id: 5, status: "rejected", created_at: now, opportunities: { title: "Job 5", provider_profiles: {} } },
    ]);

    render(<MyApplications />);

    await waitFor(() => {
      // Ongoing count: received, shortlisted, offered = 3
      const ongoingTabBtn = screen.getByRole('button', { name: /Ongoing/i });
      expect(ongoingTabBtn).toHaveTextContent(/Ongoing\s*3/);

      const acceptedTabBtn = screen.getByRole('button', { name: /Accepted/i });
      expect(acceptedTabBtn).toHaveTextContent(/Accepted\s*1/);

      const rejectedTabBtn = screen.getByRole('button', { name: /Rejected/i });
      expect(rejectedTabBtn).toHaveTextContent(/Rejected\s*1/);
    });
  });

  // =========================
  // STATS CARDS
  // =========================
  test("displays correct stats cards values", async () => {
    const now = new Date().toISOString();
    mockFetch.mockResolvedValue([
      { id: 1, status: "received", created_at: now, opportunities: { title: "Job 1", provider_profiles: {} } },
      { id: 2, status: "shortlisted", created_at: now, opportunities: { title: "Job 2", provider_profiles: {} } },
      { id: 3, status: "accepted", created_at: now, opportunities: { title: "Job 3", provider_profiles: {} } },
      { id: 4, status: "rejected", created_at: now, opportunities: { title: "Job 4", provider_profiles: {} } },
    ]);

    render(<MyApplications />);

    await waitFor(() => {
      // Verify Total Applications stat
      expect(screen.getByText("Total Applications")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument(); // total

      // Stats titles may appear in multiple places (tabs and cards). Find the card instances
      const ongoingCandidates = screen.getAllByText("Ongoing");
      const ongoingCardTitle = ongoingCandidates.find((el) => el.nextElementSibling && /\d+/.test(el.nextElementSibling.textContent));
      expect(ongoingCardTitle).toBeDefined();
      expect(ongoingCardTitle.nextElementSibling.textContent).toContain("2");

      const acceptedCandidates = screen.getAllByText("Accepted");
      const acceptedCardTitle = acceptedCandidates.find((el) => el.nextElementSibling && /\d+/.test(el.nextElementSibling.textContent));
      expect(acceptedCardTitle).toBeDefined();
      expect(acceptedCardTitle.nextElementSibling.textContent).toContain("1");

      const rejectedCandidates = screen.getAllByText("Rejected");
      const rejectedCardTitle = rejectedCandidates.find((el) => el.nextElementSibling && /\d+/.test(el.nextElementSibling.textContent));
      expect(rejectedCardTitle).toBeDefined();
      expect(rejectedCardTitle.nextElementSibling.textContent).toContain("1");
    });
  });

  // =========================
  // SUCCESS RATE DISPLAY
  // =========================
  test("displays success rate in welcome banner", async () => {
    const now = new Date().toISOString();
    mockFetch.mockResolvedValue([
      { id: 1, status: "accepted", created_at: now, opportunities: { title: "Job 1", provider_profiles: {} } },
      { id: 2, status: "accepted", created_at: now, opportunities: { title: "Job 2", provider_profiles: {} } },
      { id: 3, status: "rejected", created_at: now, opportunities: { title: "Job 3", provider_profiles: {} } },
      { id: 4, status: "rejected", created_at: now, opportunities: { title: "Job 4", provider_profiles: {} } },
    ]);

    render(<MyApplications />);

    await waitFor(() => {
      // Success rate = 2/4 = 50%
      expect(screen.getByText("50%")).toBeInTheDocument();
      expect(screen.getByText("Success Rate")).toBeInTheDocument();
    });
  });

  // =========================
  // STATUS DISTRIBUTION CHART
  // =========================
  test("renders status distribution chart", async () => {
    const now = new Date().toISOString();
    mockFetch.mockResolvedValue([
      { id: 1, status: "received", created_at: now, opportunities: { title: "Job 1", provider_profiles: {} } },
      { id: 2, status: "shortlisted", created_at: now, opportunities: { title: "Job 2", provider_profiles: {} } },
      { id: 3, status: "accepted", created_at: now, opportunities: { title: "Job 3", provider_profiles: {} } },
    ]);

    render(<MyApplications />);

    await waitFor(() => {
      expect(screen.getByText("Application Status Distribution")).toBeInTheDocument();
      expect(screen.getByText("received")).toBeInTheDocument();
      expect(screen.getByText("shortlisted")).toBeInTheDocument();
      expect(screen.getByText("accepted")).toBeInTheDocument();
    });
  });

  // =========================
  // RECENT ACTIVITY TIMELINE
  // =========================
  test("renders recent activity timeline", async () => {
    const now = new Date().toISOString();
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    mockFetch.mockResolvedValue([
      { id: 1, status: "received", created_at: now, opportunities: { title: "Recent Job", provider_profiles: {} } },
      { id: 2, status: "accepted", created_at: lastWeek, opportunities: { title: "Old Job", provider_profiles: {} } },
    ]);

    render(<MyApplications />);

    await waitFor(() => {
      expect(screen.getByText("Recent Activity")).toBeInTheDocument();
      // multiple elements may contain the Recent Job text (title + meta),
      // ensure at least one instance is present
      expect(screen.getAllByText("Recent Job").length).toBeGreaterThan(0);
    });
  });

  // =========================
  // EMPTY STATE FOR EACH TAB
  // =========================
  test("shows empty state message for Ongoing tab with no applications", async () => {
    mockFetch.mockResolvedValue([
      { id: 1, status: "accepted", created_at: new Date().toISOString(), opportunities: { title: "Accepted Job", provider_profiles: {} } },
      { id: 2, status: "rejected", created_at: new Date().toISOString(), opportunities: { title: "Rejected Job", provider_profiles: {} } },
    ]);

    render(<MyApplications />);

    await waitFor(() => {
      // Ongoing tab should show empty message
      expect(screen.getByText(/You haven't submitted any applications yet/)).toBeInTheDocument();
    });
  });

  test("shows empty state message for Accepted tab with no accepted applications", async () => {
    mockFetch.mockResolvedValue([
      { id: 1, status: "received", created_at: new Date().toISOString(), opportunities: { title: "Job 1", provider_profiles: {} } },
    ]);

    render(<MyApplications />);

    // Click Accepted tab (select the button explicitly)
    const acceptedTab = await screen.findByRole('button', { name: /Accepted/i });
    fireEvent.click(acceptedTab);

    await waitFor(() => {
      expect(screen.getByText(/You don't have any accepted applications yet/)).toBeInTheDocument();
    });
  });

  test("shows empty state message for Rejected tab with no rejected applications", async () => {
    mockFetch.mockResolvedValue([
      { id: 1, status: "received", created_at: new Date().toISOString(), opportunities: { title: "Job 1", provider_profiles: {} } },
    ]);

    render(<MyApplications />);

    // Click Rejected tab (select the button explicitly)
    const rejectedTab = await screen.findByRole('button', { name: /Rejected/i });
    fireEvent.click(rejectedTab);

    await waitFor(() => {
      expect(screen.getByText(/You don't have any rejected applications yet/)).toBeInTheDocument();
    });
  });

  // =========================
  // ERROR STATE
  // =========================
  test("shows error if fetch fails", async () => {
    mockFetch.mockRejectedValue(new Error("Failed to load"));

    render(<MyApplications />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load/)).toBeInTheDocument();
    });
  });

  // =========================
  // ACCEPT OFFER FLOW
  // =========================
  test("accepts an offered application", async () => {
    const now = new Date().toISOString();
    mockFetch.mockResolvedValue([
      {
        id: 1,
        status: "offered",
        created_at: now,
        opportunities: {
          title: "Graduate Role",
          location: "Cape Town",
          closing_date: now,
          provider_profiles: { organisation_name: "XYZ" },
        },
      },
    ]);

    render(<MyApplications />);

    const acceptBtn = await screen.findByText("Accept");
    fireEvent.click(acceptBtn);

    await waitFor(() => {
      expect(mockAccept).toHaveBeenCalledWith(1);
    });
  });

  // =========================
  // UNAPPLY FLOW
  // =========================
  test("unapplies from an application", async () => {
    const now = new Date().toISOString();
    mockFetch.mockResolvedValue([
      {
        id: 1,
        status: "received",
        created_at: now,
        opportunities: {
          title: "Intern",
          location: "Joburg",
          provider_profiles: { organisation_name: "ABC" },
        },
      },
    ]);

    render(<MyApplications />);

    const unapplyBtn = await screen.findByText("Unapply");
    fireEvent.click(unapplyBtn);

    await waitFor(() => {
      expect(mockUnapply).toHaveBeenCalledWith(1);
    });
  });

  // =========================
  // STATUS MAPPING EDGE CASE
  // =========================
  test("maps unknown status to default", async () => {
    const now = new Date().toISOString();
    mockFetch.mockResolvedValue([
      {
        id: 1,
        status: "weird_status",
        created_at: now,
        opportunities: {
          title: "Mystery Job",
          location: "Nowhere",
          provider_profiles: {},
        },
      },
    ]);

    render(<MyApplications />);

    await waitFor(() => {
      expect(screen.getByText("Received")).toBeInTheDocument();
    });
  });

  // =========================
  // META FORMATTING
  // =========================
  test("shows offer closing meta when offered", async () => {
    const now = new Date().toISOString();
    mockFetch.mockResolvedValue([
      {
        id: 1,
        status: "offered",
        created_at: now,
        opportunities: {
          title: "Offer Job",
          location: "Durban",
          closing_date: now,
          provider_profiles: {},
        },
      },
    ]);

    render(<MyApplications />);

    const appList2 = await screen.findByTestId("application-list");

    await waitFor(() => {
      expect(within(appList2).getByText(/offer closes/i)).toBeInTheDocument();
    });
  });

  // =========================
  // PRO TIP CARD
  // =========================
  test("displays pro tip card", async () => {
    mockFetch.mockResolvedValue([]);

    render(<MyApplications />);

    await waitFor(() => {
      expect(screen.getByText("Pro Tip")).toBeInTheDocument();
      expect(screen.getByText(/apply within the first week/i)).toBeInTheDocument();
    });
  });

  // =========================
  // LOADING STATE
  // =========================
  test("shows loading spinner while fetching", async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<MyApplications />);

    expect(screen.getByText("Loading your applications...")).toBeInTheDocument();
  });
});