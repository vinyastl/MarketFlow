import dotenv from "dotenv";
dotenv.config();

const PLACEHOLDER_SECRET = "change_this_to_a_long_random_string";

function resolveJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: JWT_SECRET is required in production. Set a strong random value in the environment.");
    }
    console.warn("⚠️  JWT_SECRET is not set. Using an insecure development-only fallback. Set JWT_SECRET in .env for real deployments.");
    return "dev-only-insecure-secret-change-me";
  }

  if (secret === PLACEHOLDER_SECRET || secret.length < 16) {
    console.warn("⚠️  JWT_SECRET looks weak or is still the placeholder value. Replace it with a long random string before deploying.");
  }

  return secret;
}

export const JWT_SECRET = resolveJwtSecret();