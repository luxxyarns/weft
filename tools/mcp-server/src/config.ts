// Configuration: single Ravelry app via environment variables.
// Loads .env (app credentials) and .env.token (user tokens for stdio mode).
// Bearer token format: base64(accessToken:tokenSecret) — per end-user.

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile(filename: string): void {
  try {
    const path = resolve(__dirname, "..", filename);
    const content = readFileSync(path, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      // Don't override existing env vars
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // File not found — that's fine, env vars may be set directly
  }
}

// Load .env and .env.token on import
loadEnvFile(".env");
loadEnvFile(".env.token");

export interface AppCredentials {
  consumerKey: string;
  consumerSecret: string;
}

export interface UserCredentials {
  accessToken: string;
  tokenSecret: string;
}

export function getAppCredentials(): AppCredentials {
  const consumerKey = process.env.RAVELRY_CONSUMER_KEY;
  const consumerSecret = process.env.RAVELRY_CONSUMER_SECRET;
  if (!consumerKey || !consumerSecret) {
    throw new Error("RAVELRY_CONSUMER_KEY and RAVELRY_CONSUMER_SECRET must be set (in .env or environment)");
  }
  return { consumerKey, consumerSecret };
}

/**
 * Get user credentials from env vars (.env.token or environment).
 * Used in stdio/local mode.
 */
export function getUserCredentials(): UserCredentials {
  const accessToken = process.env.RAVELRY_ACCESS_TOKEN;
  const tokenSecret = process.env.RAVELRY_TOKEN_SECRET;
  if (!accessToken || !tokenSecret) {
    throw new Error("RAVELRY_ACCESS_TOKEN and RAVELRY_TOKEN_SECRET must be set (in .env.token or environment)");
  }
  return { accessToken, tokenSecret };
}

/**
 * Decode a bearer token into user credentials.
 * Token format: base64(accessToken:tokenSecret)
 */
export function decodeBearer(token: string): UserCredentials {
  const decoded = Buffer.from(token, "base64").toString("utf-8");
  const sep = decoded.indexOf(":");
  if (sep < 1) throw new Error("Invalid bearer token format. Expected base64(accessToken:tokenSecret)");
  return {
    accessToken: decoded.slice(0, sep),
    tokenSecret: decoded.slice(sep + 1),
  };
}
