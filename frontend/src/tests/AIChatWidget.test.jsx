// frontend/src/tests/AIChatWidget.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach, beforeAll } from "vitest";

// Mock fetch
const mockFetch = vi.fn();

// Mock useAuth hook
const mockUseAuth = vi.fn();

vi.mock("../context/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock material symbols (icons only)
vi.mock("material-symbols", () => ({}));

import AIChatWidget from "../components/chat/AIChatWidget";

// Mock scrollIntoView globally
beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
});

describe("AIChatWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.fetch = mockFetch;

    // Default mock for authenticated user
    mockUseAuth.mockReturnValue({
      user: { email: "test@example.com", name: "Test User" },
      token: "mock-token-123",
    });
  });

  // =========================
  // RENDERING TESTS
  // =========================
  describe("Rendering", () => {
    test("renders chat button when closed", () => {
      render(<AIChatWidget />);
      expect(screen.getByText("Ask AI")).toBeInTheDocument();
      expect(screen.queryByText("GrowthStageSA Assistant")).not.toBeInTheDocument();
    });

    test("opens chat window when button is clicked", async () => {
      render(<AIChatWidget />);
      fireEvent.click(screen.getByText("Ask AI"));
      
      await waitFor(() => {
        expect(screen.getByText("GrowthStageSA Assistant")).toBeInTheDocument();
      });
      
      // Check for partial match of the greeting message
      expect(screen.getByText(/Hi there! I'm GrowthStageSA's AI assistant/i)).toBeInTheDocument();
    });

    test("closes chat window when close button is clicked", async () => {
      render(<AIChatWidget />);
      fireEvent.click(screen.getByText("Ask AI"));
      
      await waitFor(() => {
        expect(screen.getByText("GrowthStageSA Assistant")).toBeInTheDocument();
      });
      
      // Find and click the close button (it has the text "close" from the material icon)
      const closeButton = screen.getByText("close");
      fireEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByText("GrowthStageSA Assistant")).not.toBeInTheDocument();
        expect(screen.getByText("Ask AI")).toBeInTheDocument();
      });
    });
  });

  // =========================
  // MESSAGE SENDING TESTS
  // =========================
  describe("Message Sending", () => {
    test("sends message and displays user message", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, answer: "This is a test response from AI." }),
      });

      render(<AIChatWidget />);
      fireEvent.click(screen.getByText("Ask AI"));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Ask me anything...")).toBeInTheDocument();
      });
      
      const input = screen.getByPlaceholderText("Ask me anything...");
      fireEvent.change(input, { target: { value: "Hello, how do I apply?" } });
      
      const sendButton = screen.getByRole("button", { name: /send/i });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText("Hello, how do I apply?")).toBeInTheDocument();
      });
    });

    test("displays AI response after sending message", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, answer: "You can apply by clicking the Apply button on any opportunity." }),
      });

      render(<AIChatWidget />);
      fireEvent.click(screen.getByText("Ask AI"));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Ask me anything...")).toBeInTheDocument();
      });
      
      const input = screen.getByPlaceholderText("Ask me anything...");
      fireEvent.change(input, { target: { value: "How do I apply?" } });
      fireEvent.click(screen.getByRole("button", { name: /send/i }));

      await waitFor(() => {
        expect(screen.getByText("You can apply by clicking the Apply button on any opportunity.")).toBeInTheDocument();
      });
    });

    test("sends message on Enter key press", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, answer: "Response from Enter key." }),
      });

      render(<AIChatWidget />);
      fireEvent.click(screen.getByText("Ask AI"));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Ask me anything...")).toBeInTheDocument();
      });
      
      const input = screen.getByPlaceholderText("Ask me anything...");
      fireEvent.change(input, { target: { value: "Test Enter key" } });
      fireEvent.keyPress(input, { key: "Enter", code: "Enter", charCode: 13 });

      await waitFor(() => {
        expect(screen.getByText("Test Enter key")).toBeInTheDocument();
      });
    });

    test("does not send empty messages", async () => {
      render(<AIChatWidget />);
      fireEvent.click(screen.getByText("Ask AI"));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Ask me anything...")).toBeInTheDocument();
      });
      
      const input = screen.getByPlaceholderText("Ask me anything...");
      fireEvent.change(input, { target: { value: "   " } });
      const sendButton = screen.getByRole("button", { name: /send/i });
      expect(sendButton).toBeDisabled();
    });

    test("disables input and shows loading state while waiting for response", async () => {
      let resolveResponse;
      const responsePromise = new Promise((resolve) => {
        resolveResponse = resolve;
      });
      mockFetch.mockImplementationOnce(() => responsePromise);

      render(<AIChatWidget />);
      fireEvent.click(screen.getByText("Ask AI"));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Ask me anything...")).toBeInTheDocument();
      });
      
      const input = screen.getByPlaceholderText("Ask me anything...");
      fireEvent.change(input, { target: { value: "Testing loading" } });
      fireEvent.click(screen.getByRole("button", { name: /send/i }));

      await waitFor(() => {
        expect(input).toBeDisabled();
      });

      resolveResponse({
        ok: true,
        json: async () => ({ success: true, answer: "Response after loading." }),
      });

      await waitFor(() => {
        expect(input).not.toBeDisabled();
      });
    });
  });

  // =========================
  // ERROR HANDLING TESTS
  // =========================
  describe("Error Handling", () => {
    test("displays error message when API returns error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: false, error: "API rate limit exceeded" }),
      });

      render(<AIChatWidget />);
      fireEvent.click(screen.getByText("Ask AI"));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Ask me anything...")).toBeInTheDocument();
      });
      
      const input = screen.getByPlaceholderText("Ask me anything...");
      fireEvent.change(input, { target: { value: "Test error" } });
      fireEvent.click(screen.getByRole("button", { name: /send/i }));

      await waitFor(() => {
        expect(screen.getByText(/Sorry, I'm having trouble right now/)).toBeInTheDocument();
        expect(screen.getByText(/API rate limit exceeded/)).toBeInTheDocument();
      });
    });

    test("displays error message when fetch fails (network error)", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      render(<AIChatWidget />);
      fireEvent.click(screen.getByText("Ask AI"));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Ask me anything...")).toBeInTheDocument();
      });
      
      const input = screen.getByPlaceholderText("Ask me anything...");
      fireEvent.change(input, { target: { value: "Test network error" } });
      fireEvent.click(screen.getByRole("button", { name: /send/i }));

      await waitFor(() => {
        expect(screen.getByText(/Sorry, something went wrong/)).toBeInTheDocument();
      });
    });
  });

  // =========================
  // AUTHENTICATION TESTS
  // =========================
  describe("Authentication", () => {
    test("sends authorization header with token", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, answer: "Auth works!" }),
      });

      render(<AIChatWidget />);
      fireEvent.click(screen.getByText("Ask AI"));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Ask me anything...")).toBeInTheDocument();
      });
      
      const input = screen.getByPlaceholderText("Ask me anything...");
      fireEvent.change(input, { target: { value: "Test auth" } });
      fireEvent.click(screen.getByRole("button", { name: /send/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/chat/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer mock-token-123",
          },
          body: JSON.stringify({ question: "Test auth" }),
        });
      });
    });

    test("falls back to localStorage token if useAuth token is missing", async () => {
      mockUseAuth.mockReturnValue({
        user: { email: "test@example.com" },
        token: null,
      });

      const localStorageMock = {
        getItem: vi.fn((key) => (key === "token" ? "local-storage-token" : null)),
      };
      Object.defineProperty(window, "localStorage", { value: localStorageMock });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, answer: "Fallback token works!" }),
      });

      render(<AIChatWidget />);
      fireEvent.click(screen.getByText("Ask AI"));
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Ask me anything...")).toBeInTheDocument();
      });
      
      const input = screen.getByPlaceholderText("Ask me anything...");
      fireEvent.change(input, { target: { value: "Test fallback" } });
      fireEvent.click(screen.getByRole("button", { name: /send/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/chat/ask", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer local-storage-token",
          },
          body: JSON.stringify({ question: "Test fallback" }),
        });
      });
    });
  });
});