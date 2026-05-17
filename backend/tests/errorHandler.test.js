import { jest } from "@jest/globals";
import { errorHandler } from "../src/middleware/errorHandler.js";

describe("errorHandler", () => {
  let statusMock;
  let jsonMock;
  let consoleErrorSpy;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test("sends a 500 response with error details", () => {
    const err = {
      message: "Something went wrong",
      code: "ERR_TEST",
      details: "Detailed info",
      hint: "Try again",
      stack: "stack trace",
    };
    const req = {};
    const res = { status: statusMock };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Something went wrong",
      code: "ERR_TEST",
      details: "Detailed info",
      hint: "Try again",
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith("Unhandled error:", expect.objectContaining({ message: "Something went wrong" }));
    expect(next).not.toHaveBeenCalled();
  });

  test("falls back to generic message when err.message is missing", () => {
    const err = {};
    const req = {};
    const res = { status: statusMock };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Internal server error",
      code: null,
      details: null,
      hint: null,
    });
  });
});