// frontend/src/tests/myApplicationService.test.js
import { describe, test, expect, vi, beforeEach } from "vitest";
import axios from "axios";

import {
  applyToOpportunity,
  fetchMyApplications,
  unapplyFromApplication,
  acceptOffer,
} from "../services/myApplicationService";

vi.mock("axios");

describe("myApplicationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    localStorage.clear();
    localStorage.setItem("token", "mock-token");
  });

  // =========================
  // applyToOpportunity
  // =========================

  test("applyToOpportunity sends POST request with token", async () => {
    axios.post.mockResolvedValue({
      data: { success: true },
    });

    const result = await applyToOpportunity(123);

    expect(axios.post).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_URL}/applications`,
      { opportunityId: 123 },
      {
        headers: {
          Authorization: "Bearer mock-token",
        },
      }
    );

    expect(result).toEqual({ success: true });
  });

  // =========================
  // fetchMyApplications
  // =========================

  test("fetchMyApplications sends GET request with token", async () => {
    axios.get.mockResolvedValue({
      data: {
        data: [
          { id: 1, title: "Developer Internship" },
          { id: 2, title: "Engineering Learnership" },
        ],
      },
    });

    const result = await fetchMyApplications();

    expect(axios.get).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_URL}/applications/my`,
      {
        headers: {
          Authorization: "Bearer mock-token",
        },
      }
    );

    expect(result).toEqual([
      { id: 1, title: "Developer Internship" },
      { id: 2, title: "Engineering Learnership" },
    ]);
  });

  // =========================
  // unapplyFromApplication
  // =========================

  test("unapplyFromApplication sends DELETE request with token", async () => {
    axios.delete.mockResolvedValue({
      data: { success: true },
    });

    const result = await unapplyFromApplication(999);

    expect(axios.delete).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_URL}/applications/999`,
      {
        headers: {
          Authorization: "Bearer mock-token",
        },
      }
    );

    expect(result).toEqual({ success: true });
  });

  // =========================
  // acceptOffer
  // =========================

  test("acceptOffer sends POST request with token", async () => {
    axios.post.mockResolvedValue({
      data: {
        data: {
          accepted: true,
        },
      },
    });

    const result = await acceptOffer(55);

    expect(axios.post).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_URL}/applications/accept`,
      { applicationId: 55 },
      {
        headers: {
          Authorization: "Bearer mock-token",
        },
      }
    );

    expect(result).toEqual({
      accepted: true,
    });
  });

  // =========================
  // TOKEN EDGE CASES
  // =========================

  test("works even when token is missing", async () => {
    localStorage.removeItem("token");

    axios.get.mockResolvedValue({
      data: {
        data: [],
      },
    });

    await fetchMyApplications();

    expect(axios.get).toHaveBeenCalledWith(
      `${import.meta.env.VITE_API_URL}/applications/my`,
      {
        headers: {
          Authorization: "Bearer null",
        },
      }
    );
  });

  // =========================
  // ERROR PROPAGATION
  // =========================

  test("applyToOpportunity propagates API errors", async () => {
    const error = new Error("Request failed");

    axios.post.mockRejectedValue(error);

    await expect(applyToOpportunity(1)).rejects.toThrow(
      "Request failed"
    );
  });

  test("fetchMyApplications propagates API errors", async () => {
    const error = new Error("Network error");

    axios.get.mockRejectedValue(error);

    await expect(fetchMyApplications()).rejects.toThrow(
      "Network error"
    );
  });

  test("unapplyFromApplication propagates API errors", async () => {
    const error = new Error("Delete failed");

    axios.delete.mockRejectedValue(error);

    await expect(unapplyFromApplication(1)).rejects.toThrow(
      "Delete failed"
    );
  });

  test("acceptOffer propagates API errors", async () => {
    const error = new Error("Accept failed");

    axios.post.mockRejectedValue(error);

    await expect(acceptOffer(1)).rejects.toThrow(
      "Accept failed"
    );
  });
});