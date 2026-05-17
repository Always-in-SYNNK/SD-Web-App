import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CVUploadSection } from "../components/studentProfile/cvUpload";

describe("CVUploadSection", () => {
  it("renders heading", () => {
    render(<CVUploadSection onFileSelect={vi.fn()} />);

    expect(
      screen.getByText("CV / Resume")
    ).toBeInTheDocument();
  });

  it("shows upload text initially", () => {
    render(<CVUploadSection onFileSelect={vi.fn()} />);

    expect(
      screen.getByText(/Drop your CV here/)
    ).toBeInTheDocument();
  });

  it("uploads file and updates filename", () => {
    const onFileSelect = vi.fn();

    render(
      <CVUploadSection onFileSelect={onFileSelect} />
    );

    const input = document.querySelector(
      'input[type="file"]'
    );

    const file = new File(
      ["dummy"],
      "resume.pdf",
      {
        type: "application/pdf",
      }
    );

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    expect(
      screen.getByText("resume.pdf")
    ).toBeInTheDocument();

    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it("does nothing when no file selected", () => {
    const onFileSelect = vi.fn();

    render(
      <CVUploadSection onFileSelect={onFileSelect} />
    );

    const input = document.querySelector(
      'input[type="file"]'
    );

    fireEvent.change(input, {
      target: {
        files: [],
      },
    });

    expect(onFileSelect).not.toHaveBeenCalled();
  });
});