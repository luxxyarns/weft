#!/usr/bin/env node

// WEFT MCP Server — local mode (stdio, OAuth 1.0a)
// Credentials loaded from .env (app) and .env.token (user), or environment.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getAppCredentials, getUserCredentials } from "./config.js";
import { RavelryClient } from "./ravelry-client.js";
import type { OAuthCredentials } from "./oauth.js";
import { registerWeftTools } from "./weft-tools.js";

const app = getAppCredentials();
const user = getUserCredentials();
const credentials: OAuthCredentials = { ...app, ...user };

let cachedUsername = "";

const server = new McpServer({ name: "mcp-weft", version: "2.0.0" });

registerWeftTools(
  server,
  () => credentials,
  async () => {
    if (cachedUsername) return cachedUsername;
    const data = await new RavelryClient(credentials).get<{ user: { username: string } }>("/current_user.json");
    cachedUsername = data.user.username;
    return cachedUsername;
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`mcp-weft local [user: ${cachedUsername || "(auto-detect)"}]`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
