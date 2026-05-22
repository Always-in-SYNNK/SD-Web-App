// src/tests/PersonalInfoSection.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PersonalInfoSection } from "../components/studentProfile/personalInfo";

const DEFAULT_FORM = {
  full_name: "",
  surname: "",
  bio: "",
  location: "",
  nqf_level: "",
  email: "",
};

function renderSection(formData = DEFAULT_FORM, setFormData = vi.fn()) {
  return render(<PersonalInfoSection formData={formData} setFormData={setFormData} />);
}

describe("PersonalInfoSection", () => {
  //Rendering

  it("renders the section title", () => {
    renderSection();
    expect(screen.getByText("Personal Identity")).toBeDefined();
  });

  it("renders location placeholder text", () => {
    renderSection();
    expect(screen.getByRole("combobox")).toBeDefined();
  });

  it("renders the subtitle", () => {
    renderSection();
    expect(screen.getByText("Set the tone of your professional narrative.")).toBeDefined();
  });

  it("renders First Name label", () => {
    renderSection();
    expect(screen.getByText("First Name")).toBeDefined();
  });

  it("renders Surname label", () => {
    renderSection();
    expect(screen.getByText("Surname")).toBeDefined();
  });

  it("renders Personal Bio label", () => {
    renderSection();
    expect(screen.getByText("Personal Bio")).toBeDefined();
  });

  it("renders Location label", () => {
    renderSection();
    expect(screen.getByText("Location")).toBeDefined();
  });

  it("renders bio placeholder text", () => {
    renderSection();
    expect(screen.getByPlaceholderText("Tell us about your journey...")).toBeDefined();
  });



  // ── Pre-populated values ───────────────────────────────────────────────────

  it("displays existing full_name value", () => {
    renderSection({ ...DEFAULT_FORM, full_name: "Kirsten" });
    const input = screen.getByDisplayValue("Kirsten");
    expect(input).toBeDefined();
  });

  it("displays existing surname value", () => {
    renderSection({ ...DEFAULT_FORM, surname: "Strydom" });
    expect(screen.getByDisplayValue("Strydom")).toBeDefined();
  });

  it("displays existing bio value", () => {
    renderSection({ ...DEFAULT_FORM, bio: "I am a developer" });
    expect(screen.getByDisplayValue("I am a developer")).toBeDefined();
  });

  it("displays existing location value", () => {
    renderSection({ ...DEFAULT_FORM, location: "Western Cape" });
    const select = screen.getByRole("combobox");
    expect(select.value).toBe("Western Cape");
  });

  // ── User input ─────────────────────────────────────────────────────────────

  it("calls setFormData when first name is changed", () => {
    const setFormData = vi.fn();
    renderSection(DEFAULT_FORM, setFormData);
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "Kirsten" } });
    expect(setFormData).toHaveBeenCalled();
  });

  it("calls setFormData with correct full_name update", () => {
    let formData = { ...DEFAULT_FORM };
    const setFormData = vi.fn((updater) => {
      formData = updater(formData);
    });
    renderSection(formData, setFormData);
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "Kirsten" } });
    expect(formData.full_name).toBe("Kirsten");
  });

  it("calls setFormData with correct surname update", () => {
    let formData = { ...DEFAULT_FORM };
    const setFormData = vi.fn((updater) => {
      formData = updater(formData);
    });
    renderSection(formData, setFormData);
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[1], { target: { value: "Strydom" } });
    expect(formData.surname).toBe("Strydom");
  });

  it("calls setFormData with correct bio update", () => {
    let formData = { ...DEFAULT_FORM };
    const setFormData = vi.fn((updater) => {
      formData = updater(formData);
    });
    renderSection(formData, setFormData);
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[2], { target: { value: "I love coding" } });
    expect(formData.bio).toBe("I love coding");
  });

  it("calls setFormData with correct location update", () => {
    let formData = { ...DEFAULT_FORM };
    const setFormData = vi.fn((updater) => {
      formData = updater(formData);
    });
    renderSection(formData, setFormData);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "Gauteng" } });
    expect(formData.location).toBe("Gauteng");
  });

  it("does not mutate previous formData state", () => {
    const original = { ...DEFAULT_FORM };
    let captured;
    const setFormData = vi.fn((updater) => {
      captured = updater(original);
    });
    renderSection(original, setFormData);
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "Test" } });
    // Original object should not be mutated
    expect(original.full_name).toBe("");
    expect(captured.full_name).toBe("Test");
  });

  // ── Input types ────────────────────────────────────────────────────────────

  it("renders a textarea for bio", () => {
    renderSection();
    const textarea = screen.getByPlaceholderText("Tell us about your journey...");
    expect(textarea.tagName.toLowerCase()).toBe("textarea");
  });

  it("renders text inputs for name fields", () => {
    renderSection({ ...DEFAULT_FORM, full_name: "Kirsten" });
    const input = screen.getByDisplayValue("Kirsten");
    expect(input.type).toBe("text");
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────

  it("handles empty string values without crashing", () => {
    renderSection(DEFAULT_FORM);
    expect(screen.getByText("Personal Identity")).toBeDefined();
  });

  it("handles special characters in inputs", () => {
    let formData = { ...DEFAULT_FORM };
    const setFormData = vi.fn((updater) => {
      formData = updater(formData);
    });
    renderSection(formData, setFormData);
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(inputs[0], { target: { value: "Ané-Marie" } });
    expect(formData.full_name).toBe("Ané-Marie");
  });

  it("handles long bio text", () => {
    const longBio = "A".repeat(1000);
    renderSection({ ...DEFAULT_FORM, bio: longBio });
    expect(screen.getByDisplayValue(longBio)).toBeDefined();
  });
});