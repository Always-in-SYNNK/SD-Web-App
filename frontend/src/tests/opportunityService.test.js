import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import * as service from "../services/opportunityService";

vi.mock("axios");

describe("opportunityService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("publishOpportunity success", async () => {
      localStorage.setItem("token", "fake-token");
    axios.post.mockResolvedValue({ data: { data: { id: 1 } } });

    const res = await service.publishOpportunity({ title: "Test" });

    expect(res.data).toEqual({ id: 1 });
    expect(res.error).toBeNull();
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining("/publish"),
        { title: "Test" },
        expect.objectContaining({
          withCredentials: true,
          headers: expect.objectContaining({
            Authorization: "Bearer fake-token",
          }),
        })
      );
  });

  it("publishOpportunity handles error", async () => {
    axios.post.mockRejectedValue(new Error("fail"));

    const res = await service.publishOpportunity({});

    expect(res.data).toBeNull();
    expect(res.error).toBeInstanceOf(Error);
  });

  it("publishOpportunity uses response error message when available", async () => {
    axios.post.mockRejectedValue({
      response: { data: { error: "Publish failed on server" } },
    });

    const res = await service.publishOpportunity({});

    expect(res.error.message).toBe("Publish failed on server");
  });

  it("getOpportunityById success", async () => {
    axios.get.mockResolvedValue({ data: { data: { id: 1 } } });

    const res = await service.getOpportunityById(1);

    expect(res.data).toEqual({ id: 1 });
  });

  it("saveDraft success", async () => {
      localStorage.setItem("token", "fake-token");
    axios.post.mockResolvedValue({ data: { data: { id: 2 } } });

    const res = await service.saveDraft({});

    expect(res.data).toEqual({ id: 2 });
  });

  it("saveDraft falls back to null when response data is missing", async () => {
    axios.post.mockResolvedValue({ data: {} });

    const res = await service.saveDraft({});

    expect(res.data).toBeNull();
    expect(res.error).toBeNull();
  });

  it("saveDraft handles error", async () => {
    axios.post.mockRejectedValue(new Error("draft failed"));

    const res = await service.saveDraft({});

    expect(res.data).toBeNull();
    expect(res.error.message).toBe("draft failed");
  });

  it("getSkillsByField success", async () => {
      localStorage.setItem("token", "fake-token");
    axios.get.mockResolvedValue({ data: { data: [{ id: 1 }] } });

    const res = await service.getSkillsByField("IT");

    expect(res.data.length).toBe(1);
  });

  it("getSkillsByField handles error", async () => {
    axios.get.mockRejectedValue(new Error("field failed"));

    const res = await service.getSkillsByField("IT");

    expect(res.data).toEqual([]);
    expect(res.error.message).toBe("field failed");
  });

  it("getOpportunitySkills maps data correctly", async () => {
      localStorage.setItem("token", "fake-token");
    axios.get.mockResolvedValue({
      data: {
        opportunitySkills: [{ skills_id: 1, skill_name: "React" }],
      },
    });

    const res = await service.getOpportunitySkills(1);

    expect(res.data).toEqual([{ id: 1, title: "React" }]);
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/skills/opportunity/1"),
        expect.objectContaining({
          withCredentials: true,
          headers: expect.objectContaining({
            Authorization: "Bearer fake-token",
          }),
        })
      );
  });

    it("getOpportunitySkills handles already-normalized data and errors", async () => {
      localStorage.setItem("token", "fake-token");
      axios.get.mockResolvedValue({
        data: {
          opportunitySkills: [{ id: 2, name: "TypeScript" }],
        },
      });

      const success = await service.getOpportunitySkills(2);

      expect(success.data).toEqual([{ id: 2, title: "TypeScript" }]);

      axios.get.mockRejectedValue(new Error("skills failed"));

      const failure = await service.getOpportunitySkills(2);

      expect(failure.data).toEqual([]);
      expect(failure.error.message).toBe("skills failed");
    });

  it("deleteOpportunity success", async () => {
    axios.delete.mockResolvedValue({ data: {} });

    const res = await service.deleteOpportunity(1);

    expect(res.error).toBeNull();
  });

  it("deleteOpportunity uses fallback payload and handles error", async () => {
    axios.delete.mockResolvedValue({ data: { id: 9, status: "deleted" } });

    const success = await service.deleteOpportunity(9);

    expect(success.data).toEqual({ id: 9, status: "deleted" });

    axios.delete.mockRejectedValue(new Error("delete failed"));

    const failure = await service.deleteOpportunity(9);

    expect(failure.data).toBeNull();
    expect(failure.error.message).toBe("delete failed");
  });
  it('updateOpportunity success', async () => {
    axios.patch.mockResolvedValue({ data: { data: { id: 1, title: 'Updated' } } });

    const res = await service.updateOpportunity(1, { title: 'Updated' });

    expect(res.data.id).toBe(1);
    expect(res.error).toBeNull();
  });

  it('updateOpportunity handles nested server message', async () => {
    axios.patch.mockRejectedValue({
      response: { data: { message: 'Update rejected' } },
    });

    const res = await service.updateOpportunity(1, {});

    expect(res.data).toBeNull();
    expect(res.error.message).toBe('Update rejected');
  });

  it('updateOpportunity handles error', async () => {
    axios.patch.mockRejectedValue(new Error('Update failed'));

    const res = await service.updateOpportunity(1, {});

    expect(res.data).toBeNull();
    expect(res.error).toBeInstanceOf(Error);
  });

  it('getPendingOpportunities success', async () => {
    axios.get.mockResolvedValue({ data: [{ id: 1, status: 'pending' }] });

    const res = await service.getPendingOpportunities();

    expect(Array.isArray(res.data)).toBe(true);
    expect(res.error).toBeNull();
  });

  it('getPendingOpportunities handles object payload and error', async () => {
    axios.get.mockResolvedValue({ data: { data: [{ id: 1, status: 'pending' }] } });

    const success = await service.getPendingOpportunities();

    expect(success.data).toEqual([{ id: 1, status: 'pending' }]);

    axios.get.mockRejectedValue(new Error('Pending failed'));

    const failure = await service.getPendingOpportunities();

    expect(failure.data).toEqual([]);
    expect(failure.error.message).toBe('Pending failed');
  });

  it('getApprovedOpportunities success', async () => {
    axios.get.mockResolvedValue({ data: { data: [{ id: 1, status: 'approved' }] } });

    const res = await service.getApprovedOpportunities();

    expect(Array.isArray(res.data)).toBe(true);
  });

  it('getApprovedOpportunities handles array payload and error', async () => {
    axios.get.mockResolvedValue({ data: [{ id: 2, status: 'approved' }] });

    const success = await service.getApprovedOpportunities();

    expect(success.data).toEqual([{ id: 2, status: 'approved' }]);

    axios.get.mockRejectedValue(new Error('Approved failed'));

    const failure = await service.getApprovedOpportunities();

    expect(failure.data).toEqual([]);
    expect(failure.error.message).toBe('Approved failed');
  });

  it('approveOpportunity success', async () => {
    axios.patch.mockResolvedValue({ data: { data: { id: 1, status: 'approved' } } });

    const res = await service.approveOpportunity(1);

    expect(res.data.status).toBe('approved');
    expect(res.error).toBeNull();
  });

  it('approveOpportunity falls back to plain payload and handles error', async () => {
    axios.patch.mockResolvedValue({ data: { id: 3, status: 'approved' } });

    const success = await service.approveOpportunity(3);

    expect(success.data).toEqual({ id: 3, status: 'approved' });

    axios.patch.mockRejectedValue(new Error('Approve failed'));

    const failure = await service.approveOpportunity(3);

    expect(failure.data).toBeNull();
    expect(failure.error.message).toBe('Approve failed');
  });

  it('rejectOpportunity success', async () => {
    axios.patch.mockResolvedValue({ data: { data: { id: 1, status: 'rejected' } } });

    const res = await service.rejectOpportunity(1);

    expect(res.data.status).toBe('rejected');
    expect(res.error).toBeNull();
  });

  it('rejectOpportunity falls back to plain payload and handles error', async () => {
    axios.patch.mockResolvedValue({ data: { id: 4, status: 'rejected' } });

    const success = await service.rejectOpportunity(4);

    expect(success.data).toEqual({ id: 4, status: 'rejected' });

    axios.patch.mockRejectedValue(new Error('Reject failed'));

    const failure = await service.rejectOpportunity(4);

    expect(failure.data).toBeNull();
    expect(failure.error.message).toBe('Reject failed');
  });

  it('saveOpportunitySkills success', async () => {
    axios.put.mockResolvedValue({ data: { skills: [{ id: 1, name: 'React' }] } });

    const res = await service.saveOpportunitySkills(1, [1, 2]);

    expect(Array.isArray(res.data)).toBe(true);
    expect(res.error).toBeNull();
  });

  it('saveOpportunitySkills handles error', async () => {
    axios.put.mockRejectedValue(new Error('save skills failed'));

    const res = await service.saveOpportunitySkills(1, [1, 2]);

    expect(res.data).toBeNull();
    expect(res.error.message).toBe('save skills failed');
  });
});