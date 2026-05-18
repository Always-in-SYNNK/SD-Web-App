import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConnectivitySection } from "../components/studentProfile/connectivity";

describe("ConnectivitySection", () => {
  it("renders heading", () => {
    render(
      <ConnectivitySection
        formData={{ email: "test@gmail.com" }}
      />
    );

    expect(
      screen.getByText("Connectivity")
    ).toBeInTheDocument();
  });

  it("renders email value", () => {
    render(
      <ConnectivitySection
        formData={{ email: "test@gmail.com" }}
      />
    );

    expect(
      screen.getByDisplayValue("test@gmail.com")
    ).toBeInTheDocument();
  });

  it("renders fallback empty string", () => {
    render(
      <ConnectivitySection formData={{}} />
    );

    expect(
      screen.getByPlaceholderText(
        "Loaded from your Google account"
      )
    ).toHaveValue("");
  });

  it("input is readonly", () => {
    render(
      <ConnectivitySection
        formData={{ email: "abc@gmail.com" }}
      />
    );

    expect(
      screen.getByDisplayValue("abc@gmail.com")
    ).toHaveAttribute("readonly");
  });
});