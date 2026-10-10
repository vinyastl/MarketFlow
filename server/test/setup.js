// Test bootstrap: must be imported BEFORE any module that reads process.env.
// Forces isolated in-memory database mode and deterministic secrets so tests
// never touch a real MongoDB instance.

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-at-least-16-characters-long";
process.env.MONGODB_URI = "";