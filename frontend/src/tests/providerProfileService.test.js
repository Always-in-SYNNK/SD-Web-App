// frontend/src/tests/providerProfileService.test.js

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";

import {
  fetchProviderProfileByUserId,
  fetchProviderProfile,
  editProviderProfile,
} from "../services/providerProfileService";

describe("providerProfileService", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    globalThis.fetch = vi.fn();

    localStorage.setItem("token", "mock-token");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it("uses the default me path when no provider profile id is supplied", async () => {
    const mockResponse = {
      data: {
        id: "provider-123",
        organisation_name: "Tech Corp",
      },
    };

    fetch.mockResolvedValue({
      ok: true,
      headers: {
        get: () => "application/json",
      },
      json: async () => mockResponse,
    });

    const result = await fetchProviderProfile();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/profile/provider/me"),
      expect.objectContaining({
        credentials: "include",
      })
    );

    expect(result).toEqual(mockResponse.data);
  });

  it("omits the auth header when window is unavailable", async () => {
    vi.stubGlobal("window", undefined);

    fetch.mockResolvedValue({
      ok: true,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({
        data: {
          id: "provider-123",
        },
      }),
    });

    await editProviderProfile("provider-123", {
      organisation_name: "Updated Tech Corp",
    });

    const [, options] = fetch.mock.calls[0];

    expect(options.headers.Authorization).toBeUndefined();
  });

  it("updates provider profile successfully with auth token and payload", async () => {
    const mockResponse = {
      profile: {
        id: "provider-123",
        organisation_name: "Updated Tech Corp",
      },
    };

    fetch.mockResolvedValue({
      ok: true,
      headers: {
        get: () => "application/json",
      },
      json: async () => mockResponse,
    });

    const updates = {
      organisation_name: "Updated Tech Corp",
    };

    const result = await editProviderProfile(
      "provider-123",
      updates
    );

    expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
        "/api/profile/provider/me"
        ),
        expect.objectContaining({
            credentials: "include",
        })
    );

    const [, options] = fetch.mock.calls[0];

    expect(options.method).toBe("PUT");

    expect(options.body).toBe(
    JSON.stringify(updates)
    );

    expect(options.headers.Authorization).toBe(
    "Bearer mock-token"
    );

    expect(result).toEqual(mockResponse.profile);
  });

  it("throws an error when the API request fails", async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({
        error: "Server error",
      }),
    });

    await expect(fetchProviderProfile()).rejects.toThrow("Server error");
  });

  it("fetches provider profile by user id successfully", async () => {
    const mockProfile = {
      data: {
        id: "provider-123",
        full_name: "John Doe",
      },
    };

    fetch.mockResolvedValue({
      ok: true,
      headers: {
        get: () => "application/json",
      },
      json: async () => mockProfile,
    });

    const result =
      await fetchProviderProfileByUserId(
        "provider-123"
      );

    expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
        "/api/profile/provider/me"
        ),
        expect.objectContaining({
            credentials: "include",
        })
    );

    expect(result).toEqual(mockProfile.data);
  });
});