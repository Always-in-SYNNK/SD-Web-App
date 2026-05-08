import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import * as service from "../services/opportunityService";

vi.mock("axios");

describe("opportunityService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("publishOpportunity success", async () => {
    axios.post.mockResolvedValue({ data: { data: { id: 1 } } });

    const res = await service.publishOpportunity({ title: "Test" });

    expect(res.data).toEqual({ id: 1 });
    expect(res.error).toBeNull();
  });

  it("publishOpportunity handles error", async () => {
    axios.post.mockRejectedValue(new Error("fail"));

    const res = await service.publishOpportunity({});

    expect(res.data).toBeNull();
    expect(res.error).toBeInstanceOf(Error);
  });

  it("getOpportunityById success", async () => {
    axios.get.mockResolvedValue({ data: { data: { id: 1 } } });

    const res = await service.getOpportunityById(1);

    expect(res.data).toEqual({ id: 1 });
  });

  it("saveDraft success", async () => {
    axios.post.mockResolvedValue({ data: { data: { id: 2 } } });

    const res = await service.saveDraft({});

    expect(res.data).toEqual({ id: 2 });
  });

  it("getSkillsByField success", async () => {
    axios.get.mockResolvedValue({ data: { data: [{ id: 1 }] } });

    const res = await service.getSkillsByField("IT");

    expect(res.data.length).toBe(1);
  });

  it("getOpportunitySkills maps data correctly", async () => {
    axios.get.mockResolvedValue({
      data: {
        opportunitySkills: [{ skills_id: 1, skill_name: "React" }],
      },
    });

    const res = await service.getOpportunitySkills(1);

    expect(res.data).toEqual([{ id: 1, name: "React" }]);
  });

  it("deleteOpportunity success", async () => {
    axios.delete.mockResolvedValue({ data: {} });

    const res = await service.deleteOpportunity(1);

    expect(res.error).toBeNull();
  });
  it('updateOpportunity success', async () => {
    axios.patch.mockResolvedValue({ data: { data: { id: 1, title: 'Updated' } } });

    const res = await service.updateOpportunity(1, { title: 'Updated' });

    expect(res.data.id).toBe(1);
    expect(res.error).toBeNull();
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

  it('getApprovedOpportunities success', async () => {
    axios.get.mockResolvedValue({ data: { data: [{ id: 1, status: 'approved' }] } });

    const res = await service.getApprovedOpportunities();

    expect(Array.isArray(res.data)).toBe(true);
  });

  it('approveOpportunity success', async () => {
    axios.patch.mockResolvedValue({ data: { data: { id: 1, status: 'approved' } } });

    const res = await service.approveOpportunity(1);

    expect(res.data.status).toBe('approved');
    expect(res.error).toBeNull();
  });

  it('rejectOpportunity success', async () => {
    axios.patch.mockResolvedValue({ data: { data: { id: 1, status: 'rejected' } } });

    const res = await service.rejectOpportunity(1);

    expect(res.data.status).toBe('rejected');
    expect(res.error).toBeNull();
  });

  it('saveOpportunitySkills success', async () => {
    axios.put.mockResolvedValue({ data: { skills: [{ id: 1, name: 'React' }] } });

    const res = await service.saveOpportunitySkills(1, [1, 2]);

    expect(Array.isArray(res.data)).toBe(true);
    expect(res.error).toBeNull();
  });
});