// src/tests/SkillsSection.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SkillsSection } from "../components/studentProfile/skills";

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock("../../context/useAuth", () => ({
  useAuth: () => ({ token: "mock-token" }),
}));

// Fix the import path to match your actual file location
vi.mock("../context/useAuth", () => ({
  useAuth: () => ({ token: "mock-token" }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

const MOCK_PROFILE = {
  success: true,
  profile: { applicant_profile_id: "applicant-123" },
};

const MOCK_SKILLS_RESPONSE = {
  success: true,
  applicantSkills: [
    { skills_id: "skill-1", name: "JavaScript" },
    { skills_id: "skill-2", name: "Python" },
  ],
};

const MOCK_FIELD_SKILLS = {
  success: true,
  data: [
    { id: "skill-3", name: "React" },
    { id: "skill-4", name: "Node.js" },
    { id: "skill-1", name: "JavaScript" }, // already selected
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function setupFetchMocks({
  profile = MOCK_PROFILE,
  skills = MOCK_SKILLS_RESPONSE,
  fieldSkills = MOCK_FIELD_SKILLS,
} = {}) {
  mockFetch.mockImplementation((url) => {
    if (url.includes("/api/profile/me")) {
      return Promise.resolve({ json: () => Promise.resolve(profile) });
    }
    if (url.includes("/api/skills/applicant/")) {
      return Promise.resolve({ json: () => Promise.resolve(skills) });
    }
    if (url.includes("/api/skills/field/")) {
      return Promise.resolve({ json: () => Promise.resolve(fieldSkills) });
    }
    if (url.includes("/api/skills/applicant/me")) {
      return Promise.resolve({ json: () => Promise.resolve({ success: true }) });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("SkillsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders the section title", async () => {
    setupFetchMocks();
    render(<SkillsSection />);
    expect(await screen.findByText("Skills Vault")).toBeDefined();
  });

  it("renders the subtitle", async () => {
    setupFetchMocks();
    render(<SkillsSection />);
    expect(await screen.findByText(/Tag your core competencies/i)).toBeDefined();
  });

  it("renders Your Skills label", async () => {
    setupFetchMocks();
    render(<SkillsSection />);
    expect(await screen.findByText("Your Skills")).toBeDefined();
  });

  it("renders Browse by Field label", async () => {
    setupFetchMocks();
    render(<SkillsSection />);
    expect(await screen.findByText("Browse by Field")).toBeDefined();
  });

  it("renders the field dropdown", async () => {
    setupFetchMocks();
    render(<SkillsSection />);
    expect(await screen.findByText("Select a field...")).toBeDefined();
  });

  it("renders the Save Skills button", async () => {
    setupFetchMocks();
    render(<SkillsSection />);
    expect(await screen.findByText("Save Skills")).toBeDefined();
  });

  it("shows empty skills message when no skills loaded", async () => {
    setupFetchMocks({
      skills: { success: true, applicantSkills: [] },
    });
    render(<SkillsSection />);
    await waitFor(() =>
      expect(screen.getByText("No skills added yet.")).toBeDefined()
    );
  });

  // ── Field dropdown ─────────────────────────────────────────────────────────

  it("renders all 12 fields in the dropdown", async () => {
    setupFetchMocks();
    render(<SkillsSection />);
    const select = await screen.findByRole("combobox");
    expect(select.options.length).toBe(13); // 12 fields + placeholder
  });

  it("contains expected fields", async () => {
    setupFetchMocks();
    render(<SkillsSection />);
    expect(await screen.findByText("Services")).toBeDefined();
    expect(await screen.findByText("Culture and Arts")).toBeDefined();
    expect(await screen.findByText("Education, Training and Development")).toBeDefined();
  });

  // ── Pre-populating existing skills ─────────────────────────────────────────

  it("fetches and displays existing skills on mount", async () => {
    setupFetchMocks();
    render(<SkillsSection />);
    await waitFor(() => expect(screen.getByText("JavaScript")).toBeDefined());
    expect(screen.getByText("Python")).toBeDefined();
  });

  it("handles profile fetch failure gracefully", async () => {
    mockFetch.mockRejectedValue(new Error("Network error"));
    render(<SkillsSection />);
    await waitFor(() =>
      expect(screen.getByText("No skills added yet.")).toBeDefined()
    );
  });

  it("handles missing applicant_profile_id gracefully", async () => {
    setupFetchMocks({
      profile: { success: true, profile: {} },
    });
    render(<SkillsSection />);
    await waitFor(() =>
      expect(screen.getByText("No skills added yet.")).toBeDefined()
    );
  });

  it("uses skills_id as id when available", async () => {
    setupFetchMocks();
    render(<SkillsSection />);
    await waitFor(() => expect(screen.getByText("JavaScript")).toBeDefined());
  });

  // ── Field selection & available skills ────────────────────────────────────

  it("fetches available skills when a field is selected", async () => {
    setupFetchMocks();
    render(<SkillsSection />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Services" } });
    await waitFor(() => expect(screen.getByText(/React/i)).toBeDefined());
    expect(screen.getByText(/Node\.js/i)).toBeDefined();
  });

  it("shows loading state while fetching field skills", async () => {
    mockFetch.mockImplementation((url) => {
      if (url.includes("/api/profile/me")) {
        return Promise.resolve({ json: () => Promise.resolve(MOCK_PROFILE) });
      }
      if (url.includes("/api/skills/applicant/")) {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, applicantSkills: [] }) });
      }
      if (url.includes("/api/skills/field/")) {
        return new Promise(() => {}); // never resolves
      }
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    render(<SkillsSection />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Services" } });
    await waitFor(() =>
      expect(screen.getByText("Loading skills...")).toBeDefined()
    );
  });

  it("shows empty message when no skills found for field", async () => {
    setupFetchMocks({ fieldSkills: { success: true, data: [] } });
    render(<SkillsSection />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Services" } });
    await waitFor(() =>
      expect(screen.getByText("No skills found for this field.")).toBeDefined()
    );
  });

  it("clears available skills when field is reset to empty", async () => {
    setupFetchMocks();
    render(<SkillsSection />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Services" } });
    await waitFor(() => expect(screen.getByText(/React/i)).toBeDefined());
    fireEvent.change(select, { target: { value: "" } });
    await waitFor(() => expect(screen.queryByText(/React/i)).toBeNull());
  });

  // ── Adding & removing skills ───────────────────────────────────────────────

  it("adds a skill when + button is clicked", async () => {
    setupFetchMocks({ skills: { success: true, applicantSkills: [] } });
    render(<SkillsSection />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Services" } });
    await waitFor(() => expect(screen.getByText("React +")).toBeDefined());
    fireEvent.click(screen.getByText("React +"));
    await waitFor(() => {
      const badges = screen.getAllByText(/React/);
      expect(badges.length).toBeGreaterThan(1);
    });
  });

  it("does not add duplicate skills", async () => {
    setupFetchMocks();
    render(<SkillsSection />);
    await waitFor(() => expect(screen.getByText("JavaScript")).toBeDefined());
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Services" } });
    await waitFor(() => expect(screen.getByText("JavaScript ✓")).toBeDefined());
    // Button should be disabled
    const jsButton = screen.getByText("JavaScript ✓").closest("button");
    expect(jsButton.disabled).toBe(true);
  });

  it("removes a skill when ✕ is clicked", async () => {
    setupFetchMocks();
    render(<SkillsSection />);
    await waitFor(() => expect(screen.getByText("JavaScript")).toBeDefined());
    const removeButtons = screen.getAllByText("✕");
    fireEvent.click(removeButtons[0]);
    await waitFor(() => expect(screen.queryByText("JavaScript")).toBeNull());
  });

  // ── Saving ─────────────────────────────────────────────────────────────────

  it("shows Saving... while save is in progress", async () => {
    mockFetch.mockImplementation((url) => {
      if (url.includes("/api/profile/me")) {
        return Promise.resolve({ json: () => Promise.resolve(MOCK_PROFILE) });
      }
      if (url.includes("/api/skills/applicant/applicant-123")) {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, applicantSkills: [] }) });
      }
      if (url.includes("/api/skills/applicant/me")) {
        return new Promise(() => {}); // never resolves
      }
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    render(<SkillsSection />);
    fireEvent.click(screen.getByText("Save Skills"));
    await waitFor(() => expect(screen.getByText("Saving...")).toBeDefined());
  });

  it("shows success message after saving", async () => {
    setupFetchMocks();
    render(<SkillsSection />);
    fireEvent.click(screen.getByText("Save Skills"));
    await waitFor(() =>
      expect(screen.getByText("Skills saved successfully!")).toBeDefined()
    );
  });

  it("shows failure message when save API returns success: false", async () => {
    mockFetch.mockImplementation((url) => {
      if (url.includes("/api/profile/me")) {
        return Promise.resolve({ json: () => Promise.resolve(MOCK_PROFILE) });
      }
      if (url.includes("/api/skills/applicant/applicant-123")) {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, applicantSkills: [] }) });
      }
      if (url.includes("/api/skills/applicant/me")) {
        return Promise.resolve({ json: () => Promise.resolve({ success: false }) });
      }
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    render(<SkillsSection />);
    fireEvent.click(screen.getByText("Save Skills"));
    await waitFor(() =>
      expect(screen.getByText("Failed to save skills.")).toBeDefined()
    );
  });

  it("shows error message when save fetch throws", async () => {
    mockFetch.mockImplementation((url) => {
      if (url.includes("/api/profile/me")) {
        return Promise.resolve({ json: () => Promise.resolve(MOCK_PROFILE) });
      }
      if (url.includes("/api/skills/applicant/applicant-123")) {
        return Promise.resolve({ json: () => Promise.resolve({ success: true, applicantSkills: [] }) });
      }
      if (url.includes("/api/skills/applicant/me")) {
        return Promise.reject(new Error("Network error"));
      }
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    render(<SkillsSection />);
    fireEvent.click(screen.getByText("Save Skills"));
    await waitFor(() =>
      expect(screen.getByText("Something went wrong.")).toBeDefined()
    );
  });
});