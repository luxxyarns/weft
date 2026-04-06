#!/usr/bin/env node

// WEFT MCP Server — local mode (stdio)
// Reads app configs from apps.json. Select app via MCP_APP env var.
// Usage: MCP_APP=stash2go-ii-apple node dist/index.js

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getApp, getTokens, getDefaultApp } from "./config.js";
import { RavelryClient } from "./ravelry-client.js";
import type { OAuthCredentials } from "./oauth.js";
import { registerTools } from "./tools.js";

const appSlug = process.env.MCP_APP || getDefaultApp().slug;
const app = getApp(appSlug);
const tokens = getTokens(appSlug);

const credentials: OAuthCredentials = {
  consumerKey: app.consumerKey,
  consumerSecret: app.consumerSecret,
  accessToken: tokens.accessToken,
  tokenSecret: tokens.tokenSecret,
};

let cachedUsername = tokens.username || "";

const server = new McpServer({ name: "mcp-weft", version: "1.0.0" });

registerTools(
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
  console.error(`mcp-weft local [app: ${app.slug}, user: ${cachedUsername || "(auto-detect)"}]`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
