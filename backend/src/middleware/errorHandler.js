export function errorHandler(err, req, res, next) {
  console.error("Unhandled error:", {
    message: err?.message,
    details: err?.details,
    hint: err?.hint,
    code: err?.code,
    stack: err?.stack,
  });

  res.status(500).json({
    error: err?.message || "Internal server error",
    code: err?.code || null,
    details: err?.details || null,
    hint: err?.hint || null,
  });
}