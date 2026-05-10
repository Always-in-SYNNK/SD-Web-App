import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import EmployerApplications from "../pages/EmployerApplications";
import * as service from "../services/employerApplicationService";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("../services/employerApplicationService", async () => {
  const actual = await vi.importActual("../services/employerApplicationService");
  return {
    ...actual,
    getApplicationsForOpportunity: vi.fn(),
    updateApplicationStatus: vi.fn(),
  };
});

vi.mock("../components/layout/Sidebar", () => ({
  default: () => <div>Sidebar</div>,
}));

vi.mock("../components/layout/Topbar", () => ({
  default: () => <div>Topbar</div>,
}));

vi.mock("../components/employer/EmployerApplicationCard", () => ({
  default: ({ application, onShortlist, onOffer, onReject }) => (
    <div data-testid={`app-${application.applicationId}`}>
      <div>{application.name}</div>
      <button onClick={() => onShortlist(application.applicationId)} data-testid="shortlist-btn">Shortlist</button>
      <button onClick={() => onOffer(application.applicationId)} data-testid="offer-btn">Offer</button>
      <button onClick={() => onReject(application.applicationId)} data-testid="reject-btn">Reject</button>
    </div>
  ),
}));

describe("EmployerApplications", () => {
  beforeEach(() => {
    localStorage.setItem("token", "test-token");
    localStorage.setItem("user", JSON.stringify({ id: "user-1", name: "Test User" }));
    vi.clearAllMocks();
  });

  const renderPage = (opportunityId = "1") =>
    render(
      <MemoryRouter initialEntries={[opportunityId == null ? "/apps" : `/apps/${opportunityId}`]}>
        <Routes>
          <Route path="/apps" element={<EmployerApplications />} />
          <Route path="/apps/:opportunityId" element={<EmployerApplications />} />
          <Route path="/prov-login" element={<div>Login Page</div>} />
          <Route path="/pipeline" element={<div>Pipeline Page</div>} />
        </Routes>
      </MemoryRouter>
    );

  // ===== Token & Auth Tests =====
  it("redirects to login when token is missing", () => {
    localStorage.removeItem("token");
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [],
    });

    renderPage();

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("shows error when token is missing during fetch", async () => {
    localStorage.removeItem("token");
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });
  });

  // ===== Opportunity ID Tests =====
  it("renders error message when no opportunityId", () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [],
    });

    renderPage(null);

    expect(screen.getByText(/No opportunity selected/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Back to Pipeline/i })).toBeInTheDocument();
  });

  it("shows back to pipeline button for no opportunityId", () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [],
    });

    renderPage(null);

    const backBtn = screen.getByRole("button", { name: /Back to Pipeline/i });
    expect(backBtn).toBeInTheDocument();
  });

  // ===== Loading & Render Tests =====
  it("shows loading spinner initially", () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [],
    });

    renderPage();

    expect(document.querySelector(".animate-spin")).toBeTruthy();
  });

  it("renders applications after successful fetch", async () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [
        { applicationId: 1, name: "John Doe", status: "received" },
        { applicationId: 2, name: "Jane Smith", status: "shortlisted" },
      ],
    });

    renderPage();

    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(await screen.findByText("Jane Smith")).toBeInTheDocument();
  });

  // ===== Error Handling Tests =====
  it("handles fetch error gracefully", async () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: false,
      error: "Failed to fetch applications",
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch applications/i)).toBeInTheDocument();
    });
  });

  it("handles fetch exception", async () => {
    service.getApplicationsForOpportunity.mockRejectedValue(
      new Error("Network error")
    );

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  // ===== Empty State Tests =====
  it("renders empty state when no applications", async () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/No applications found/i)).toBeInTheDocument();
    });
  });

  it("shows correct empty message for all filter", async () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [],
    });

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText(/No one has applied to this opportunity yet/i)
      ).toBeInTheDocument();
    });
  });

  // ===== Stats Tests =====
  it("displays correct total stats for applications", async () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [
        { applicationId: 1, name: "A", status: "received" },
        { applicationId: 2, name: "B", status: "shortlisted" },
        { applicationId: 3, name: "C", status: "offered" },
        { applicationId: 4, name: "D", status: "accepted" },
        { applicationId: 5, name: "E", status: "rejected" },
      ],
    });

    renderPage();

    await waitFor(() => {
      const statElements = screen.getAllByText(/5/);
      expect(statElements.length).toBeGreaterThan(0); // Total: 5
    });
  });

  // ===== Filter Tests =====
  it("filters applications by status", async () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [
        { applicationId: 1, name: "John", status: "received" },
        { applicationId: 2, name: "Jane", status: "shortlisted" },
      ],
    });

    renderPage();

    await screen.findByText("John");

    const buttons = screen.getAllByRole("button");
    const shortlistedBtn = buttons.find((btn) =>
      btn.textContent.includes("shortlisted")
    );

    fireEvent.click(shortlistedBtn);

    await waitFor(() => {
      expect(screen.queryByText("John")).not.toBeInTheDocument();
      expect(screen.getByText("Jane")).toBeInTheDocument();
    });
  });

  it("shows all applications when 'all' filter is selected", async () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [
        { applicationId: 1, name: "John", status: "received" },
        { applicationId: 2, name: "Jane", status: "rejected" },
      ],
    });

    renderPage();

    await screen.findByText("John");

    const buttons = screen.getAllByRole("button");
    const allBtn = buttons.find((btn) => btn.textContent.includes("all"));
    fireEvent.click(allBtn);

    await waitFor(() => {
      expect(screen.getByText("John")).toBeInTheDocument();
      expect(screen.getByText("Jane")).toBeInTheDocument();
    });
  });

  it("shows empty message for filtered status with no apps", async () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [{ applicationId: 1, name: "John", status: "received" }],
    });

    renderPage();

    await screen.findByText("John");

    const buttons = screen.getAllByRole("button");
    const offeredBtn = buttons.find((btn) =>
      btn.textContent.includes("offered")
    );
    fireEvent.click(offeredBtn);

    await waitFor(() => {
      expect(screen.getByText(/No offered applications/i)).toBeInTheDocument();
    });
  });

  // ===== Action Handler Tests =====
  it("handles shortlist action successfully", async () => {
    service.getApplicationsForOpportunity
      .mockResolvedValueOnce({
        success: true,
        data: [{ applicationId: 1, name: "John", status: "received" }],
      })
      .mockResolvedValueOnce({
        success: true,
        data: [{ applicationId: 1, name: "John", status: "shortlisted" }],
      });

    service.updateApplicationStatus.mockResolvedValue({
      success: true,
      message: "Application shortlisted",
    });

    renderPage();

    await screen.findByText("John");

    const shortlistBtn = screen.getByTestId("shortlist-btn");
    fireEvent.click(shortlistBtn);

    await waitFor(() => {
      expect(service.updateApplicationStatus).toHaveBeenCalledWith(
        1,
        "shortlisted"
      );
    });
  });

  it("displays success message after shortlist", async () => {
    service.getApplicationsForOpportunity
      .mockResolvedValueOnce({
        success: true,
        data: [{ applicationId: 1, name: "John", status: "received" }],
      })
      .mockResolvedValueOnce({
        success: true,
        data: [{ applicationId: 1, name: "John", status: "shortlisted" }],
      });

    service.updateApplicationStatus.mockResolvedValue({
      success: true,
      message: "Shortlisted successfully",
    });

    renderPage();

    await screen.findByText("John");

    const shortlistBtn = screen.getByTestId("shortlist-btn");
    fireEvent.click(shortlistBtn);

    await waitFor(() => {
      expect(screen.getByText(/Shortlisted successfully/i)).toBeInTheDocument();
    });
  });

  it("handles shortlist action error", async () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [{ applicationId: 1, name: "John", status: "received" }],
    });

    service.updateApplicationStatus.mockRejectedValue(
      new Error("Update failed")
    );

    renderPage();

    await screen.findByText("John");

    const shortlistBtn = screen.getByTestId("shortlist-btn");
    fireEvent.click(shortlistBtn);

    await waitFor(() => {
      expect(screen.getByText(/Update failed/i)).toBeInTheDocument();
    });
  });

  it("handles offer action successfully", async () => {
    service.getApplicationsForOpportunity
      .mockResolvedValueOnce({
        success: true,
        data: [{ applicationId: 1, name: "John", status: "shortlisted" }],
      })
      .mockResolvedValueOnce({
        success: true,
        data: [{ applicationId: 1, name: "John", status: "offered" }],
      });

    service.updateApplicationStatus.mockResolvedValue({
      success: true,
      message: "Offer sent",
    });

    renderPage();

    await screen.findByText("John");

    const offerBtn = screen.getByTestId("offer-btn");
    fireEvent.click(offerBtn);

    await waitFor(() => {
      expect(service.updateApplicationStatus).toHaveBeenCalledWith(1, "offered");
    });
  });

  it("displays success message after offer", async () => {
    service.getApplicationsForOpportunity
      .mockResolvedValueOnce({
        success: true,
        data: [{ applicationId: 1, name: "John", status: "shortlisted" }],
      })
      .mockResolvedValueOnce({
        success: true,
        data: [{ applicationId: 1, name: "John", status: "offered" }],
      });

    service.updateApplicationStatus.mockResolvedValue({
      success: true,
      message: "Offer sent successfully",
    });

    renderPage();

    await screen.findByText("John");

    const offerBtn = screen.getByTestId("offer-btn");
    fireEvent.click(offerBtn);

    await waitFor(() => {
      expect(screen.getByText(/Offer sent successfully/i)).toBeInTheDocument();
    });
  });

  it("handles offer action error", async () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [{ applicationId: 1, name: "John", status: "shortlisted" }],
    });

    service.updateApplicationStatus.mockRejectedValue(
      new Error("Offer failed")
    );

    renderPage();

    await screen.findByText("John");

    const offerBtn = screen.getByTestId("offer-btn");
    fireEvent.click(offerBtn);

    await waitFor(() => {
      expect(screen.getByText(/Offer failed/i)).toBeInTheDocument();
    });
  });

  it("handles reject action successfully", async () => {
    service.getApplicationsForOpportunity
      .mockResolvedValueOnce({
        success: true,
        data: [{ applicationId: 1, name: "John", status: "received" }],
      })
      .mockResolvedValueOnce({
        success: true,
        data: [{ applicationId: 1, name: "John", status: "rejected" }],
      });

    service.updateApplicationStatus.mockResolvedValue({
      success: true,
      message: "Application rejected",
    });

    renderPage();

    await screen.findByText("John");

    const rejectBtn = screen.getByTestId("reject-btn");
    fireEvent.click(rejectBtn);

    await waitFor(() => {
      expect(service.updateApplicationStatus).toHaveBeenCalledWith(
        1,
        "rejected"
      );
    });
  });

  it("displays success message after reject", async () => {
    service.getApplicationsForOpportunity
      .mockResolvedValueOnce({
        success: true,
        data: [{ applicationId: 1, name: "John", status: "received" }],
      })
      .mockResolvedValueOnce({
        success: true,
        data: [{ applicationId: 1, name: "John", status: "rejected" }],
      });

    service.updateApplicationStatus.mockResolvedValue({
      success: true,
      message: "Rejected successfully",
    });

    renderPage();

    await screen.findByText("John");

    const rejectBtn = screen.getByTestId("reject-btn");
    fireEvent.click(rejectBtn);

    await waitFor(() => {
      expect(screen.getByText(/Rejected successfully/i)).toBeInTheDocument();
    });
  });

  it("handles reject action error", async () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [{ applicationId: 1, name: "John", status: "received" }],
    });

    service.updateApplicationStatus.mockRejectedValue(
      new Error("Reject failed")
    );

    renderPage();

    await screen.findByText("John");

    const rejectBtn = screen.getByTestId("reject-btn");
    fireEvent.click(rejectBtn);

    await waitFor(() => {
      expect(screen.getByText(/Reject failed/i)).toBeInTheDocument();
    });
  });

  // ===== Navigation Tests =====
  it("navigates back to pipeline", () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [],
    });

    renderPage();

    const backBtn = screen.getByText(/Back to Pipeline/i);
    fireEvent.click(backBtn);

    expect(screen.getByText("Pipeline Page")).toBeInTheDocument();
  });

});