#!/usr/bin/env node

// Create a pre-registered OAuth 2.0 client for the MCP server.
// Usage: DATABASE_URL=... node scripts/create-client.js [name]
//
// Outputs the client_id and client_secret to give to users.

import pg from "pg";
import { randomUUID, randomBytes } from "crypto";

const name = process.argv[2] || "claude-connector";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const clientId = randomUUID();
const clientSecret = randomBytes(32).toString("hex");

await pool.query(
  `INSERT INTO mcp_oauth_client (
    client_id, client_secret, client_id_issued_at,
    redirect_uris, client_name, grant_types, response_types,
    token_endpoint_auth_method
  ) VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7)`,
  [
    clientId, clientSecret,
    ["https://claude.ai/oauth/callback", "http://localhost/oauth/callback"],
    name,
    ["authorization_code", "refresh_token"],
    ["code"],
    "client_secret_post",
  ]
);

await pool.end();

console.log("OAuth 2.0 Client created:");
console.log(`  Client ID:     ${clientId}`);
console.log(`  Client Secret: ${clientSecret}`);
console.log(`  Name:          ${name}`);
console.log("");
console.log("Give these to users for the Claude.ai connector dialog.");
