// JSON 404 handler and a central error handler that never leaks stack traces
// or internal details to API clients in production.

export function notFound(req, res) {
  res.status(404).json({ error: "Route not found" });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Malformed JSON body sent to the API.
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON in request body" });
  }

  // Body larger than the configured limit.
  if (err.type === "entity.too.large") {
    return res.status(413).json({ error: "Request body too large" });
  }

  if (process.env.NODE_ENV === "production") {
    console.error("Unhandled error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }

  console.error(err);
  res.status(500).json({ error: err.message });
}