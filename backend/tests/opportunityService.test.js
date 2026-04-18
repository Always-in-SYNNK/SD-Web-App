import { jest } from '@jest/globals';

const mockRpc = jest.fn();

jest.unstable_mockModule("../src/config/supabaseClient.js", () => ({
  supabase: {
    rpc: mockRpc,
  },
}));

//IMPORTANT: import AFTER mocking
const { getDistinctLocations, getDistinctFields, getDistinctNqfLevels } =
  await import("../src/services/opportunityService.js")

//Looking to test:
// distinct value normalization
// filter query behavior
// successful RPC responses
// thrown errors on Supabase failures
describe("opportunityService distinct value functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //For normalization bugs
  test("getDistinctLocations returns normalized values", async () => {
    mockRpc.mockResolvedValue({
      data: [
        { location: "Gauteng" },
        { location: "Western Cape" },
      ],
      error: null,
    });

    const result = await getDistinctLocations();

    expect(mockRpc).toHaveBeenCalledWith("opportunities_get_location");
    expect(result).toEqual(["Gauteng", "Western Cape"]);
  });
  
  //For bad error handling
  test("getDistinctFields throws when supabase rpc fails", async () => {
    mockRpc.mockResolvedValue({
      data: null,
      error: { message: "RPC failed" },
    });

    await expect(getDistinctFields()).rejects.toThrow("RPC failed");
  });

  
  test("getDistinctNqfLevels handles raw values", async () => {
    mockRpc.mockResolvedValue({
      data: [2, 4, 6],
      error: null,
    });

    const result = await getDistinctNqfLevels();

    expect(result).toEqual(["2", "4", "6"]);
  });
});
