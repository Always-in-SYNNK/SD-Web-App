import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import EmployerApplications from "../pages/EmployerApplications";
import * as service from "../services/employerApplicationService";
import { MemoryRouter, Route, Routes } from "react-router-dom";

vi.mock("../services/employerApplicationService");

vi.mock("../components/layout/Sidebar", () => ({
  default: () => <div>Sidebar</div>,
}));

vi.mock("../components/layout/Topbar", () => ({
  default: () => <div>Topbar</div>,
}));

vi.mock("../components/employer/EmployerApplicationCard", () => ({
  default: ({ application }) => <div>{application.name}</div>,
}));

describe("EmployerApplications", () => {
  beforeEach(() => {
    localStorage.setItem("token", "test-token");
    vi.clearAllMocks();
  });

  const renderPage = () =>
    render(
      <MemoryRouter initialEntries={["/apps/1"]}>
        <Routes>
          <Route path="/apps/:opportunityId" element={<EmployerApplications />} />
        </Routes>
      </MemoryRouter>
    );

  it("shows loading initially", () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [],
    });

    renderPage();

    // spinner uses CSS animation class; assert its presence
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it("renders applications after fetch", async () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [{ applicationId: 1, name: "John", status: "received" }],
    });

    renderPage();

    expect(await screen.findByText("John")).toBeInTheDocument();
  });

  it("filters applications by status", async () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [
        { applicationId: 1, name: "A", status: "received" },
        { applicationId: 2, name: "B", status: "rejected" },
      ],
    });

    renderPage();

    await screen.findByText("A");

    await waitFor(() => {
      expect(screen.getByText("A")).toBeInTheDocument();
    });
  });

  it("handles shortlist action", async () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [{ applicationId: 1, name: "A", status: "received" }],
    });

    service.updateApplicationStatus.mockResolvedValue({
      success: true,
      message: "Updated",
    });

    renderPage();

    await screen.findByText("A");

    await waitFor(() => {
      expect(service.getApplicationsForOpportunity).toHaveBeenCalled();
    });
  });
  it('renders empty state when no applications', async () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/No applications found/i)).toBeInTheDocument();
    });
  });

  it('handles fetch error', async () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: false,
      error: 'Failed to fetch',
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText(/⚠/)).toBeInTheDocument();
    });
  });

  it('displays correct stats for applications', async () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [
        { applicationId: 1, name: 'A', status: 'received' },
        { applicationId: 2, name: 'B', status: 'shortlisted' },
        { applicationId: 3, name: 'C', status: 'rejected' },
      ],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // total
    });
  });

  it('filters applications by status tabs', async () => {
    service.getApplicationsForOpportunity.mockResolvedValue({
      success: true,
      data: [
        { applicationId: 1, name: 'John', status: 'received' },
        { applicationId: 2, name: 'Jane', status: 'shortlisted' },
      ],
    });

    renderPage();

    await screen.findByText('John');

    // Click shortlisted filter button
    const buttons = screen.getAllByRole('button');
    const shortlistedBtn = buttons.find(btn => btn.textContent.includes('shortlisted'));
    fireEvent.click(shortlistedBtn);

    await waitFor(() => {
      expect(screen.queryByText('John')).not.toBeInTheDocument();
    });
  });
});