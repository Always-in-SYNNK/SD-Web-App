import express from "express";
import request from "supertest";
import { uploadCV } from "../src/middleware/uploadMiddleware.js";

describe("uploadMiddleware", () => {
  let app;

  beforeEach(() => {
    app = express();

    app.post("/upload", (req, res, next) => {
      uploadCV.single("cv")(req, res, (err) => {
        if (err) return next(err);
        res.json({
          success: true,
          file: req.file
            ? {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
              }
            : null,
        });
      });
    });

    app.use((err, req, res, next) => {
      res.status(400).json({
        success: false,
        error: err.message,
      });
    });
  });

  test("accepts a valid PDF upload", async () => {
    const res = await request(app)
      .post("/upload")
      .attach("cv", Buffer.from("%PDF-1.4 test"), {
        filename: "cv.pdf",
        contentType: "application/pdf",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.file.originalname).toBe("cv.pdf");
    expect(res.body.file.mimetype).toBe("application/pdf");
  });

  test("rejects a non-PDF file by mime type", async () => {
    const res = await request(app)
      .post("/upload")
      .attach("cv", Buffer.from("not a pdf"), {
        filename: "cv.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Only PDF CV uploads are allowed.");
  });

  test("rejects a file with wrong extension even if mime type is wrong", async () => {
    const res = await request(app)
      .post("/upload")
      .attach("cv", Buffer.from("fake"), {
        filename: "cv.docx",
        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe("Only PDF CV uploads are allowed.");
  });
});