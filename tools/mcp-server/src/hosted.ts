#!/usr/bin/env node

// WEFT MCP Server — hosted mode (HTTP + OAuth 2.0)
// Deployed at e.g. https://mcp.stash2go.com/
// Claude.ai connects via "Add custom connector" dialog.
//
// Env: DATABASE_URL, MCP_PORT, MCP_BASE_URL, MCP_APP (default Ravelry app slug)

import express from "express";
import { randomUUID } from "node:crypto";
import { createRateLimiter } from "./rate-limit.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { mcpAuthRouter } from "@modelcontextprotocol/sdk/server/auth/router.js";
import { requireBearerAuth } from "@modelcontextprotocol/sdk/server/auth/middleware/bearerAuth.js";
import { WeftOAuthProvider } from "./auth-provider.js";
import { registerTools } from "./tools.js";
import type { OAuthCredentials } from "./oauth.js";
import { RavelryClient } from "./ravelry-client.js";

const PORT = parseInt(process.env.MCP_PORT || "8095", 10);
const BASE_URL = process.env.MCP_BASE_URL || `http://localhost:${PORT}`;
const DEFAULT_APP = process.env.MCP_APP || "";

const authProvider = new WeftOAuthProvider(BASE_URL);

// ---------------------------------------------------------------------------
// Express app
// ---------------------------------------------------------------------------

const app = express();

// Rate limiting
app.use(createRateLimiter({ windowMs: 60_000, maxRequests: 60 }));

// OAuth 2.0 endpoints at root (/.well-known/oauth-*, /authorize, /token, /register, /revoke)
// Set the default app slug before the auth router processes /authorize
app.use((req, _res, next) => {
  // Allow per-request app selection via ?app=slug query param
  const appSlug = (req.query.app as string) || DEFAULT_APP;
  if (appSlug) authProvider.currentAppSlug = appSlug;
  next();
});

app.use(
  mcpAuthRouter({
    provider: authProvider,
    issuerUrl: new URL(BASE_URL),
    scopesSupported: ["ravelry:read"],
    serviceDocumentationUrl: new URL("https://weft.dev"),
    resourceName: "WEFT Export",
  })
);

// Ravelry OAuth 1.0a callback (user returns from Ravelry after authorizing)
app.get("/ravelry/callback", async (req, res) => {
  try {
    const oauthToken = req.query.oauth_token as string;
    const oauthVerifier = req.query.oauth_verifier as string;
    if (!oauthToken || !oauthVerifier) return res.status(400).send("Missing oauth_token or oauth_verifier");

    const { redirectUri, code } = await authProvider.handleRavelryCallback(oauthToken, oauthVerifier);
    const url = new URL(redirectUri);
    url.searchParams.set("code", code);
    res.redirect(url.toString());
  } catch (err: any) {
    console.error("Ravelry callback error:", err);
    res.status(500).send(`Authorization failed: ${err.message}`);
  }
});

// MCP endpoint (protected by bearer auth)
const bearerAuth = requireBearerAuth({ verifier: authProvider });
const transports = new Map<string, StreamableHTTPServerTransport>();

app.post("/", bearerAuth, async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  let transport: StreamableHTTPServerTransport;

  if (sessionId && transports.has(sessionId)) {
    transport = transports.get(sessionId)!;
  } else {
    transport = new StreamableHTTPServerTransport({ sessionIdGenerator: () => randomUUID() });

    const server = new McpServer({ name: "mcp-weft", version: "1.0.0" });

    // Register tools with per-request credential resolution from auth info
    registerTools(
      server,
      (authInfo) => ({
        consumerKey: authInfo?.extra?.ravelryConsumerKey || "",
        consumerSecret: authInfo?.extra?.ravelryConsumerSecret || "",
        accessToken: authInfo?.extra?.ravelryAccessToken || "",
        tokenSecret: authInfo?.extra?.ravelryTokenSecret || "",
      }),
      async (authInfo) => {
        if (authInfo?.extra?.ravelryUsername) return authInfo.extra.ravelryUsername as string;
        const creds: OAuthCredentials = {
          consumerKey: authInfo?.extra?.ravelryConsumerKey, consumerSecret: authInfo?.extra?.ravelryConsumerSecret,
          accessToken: authInfo?.extra?.ravelryAccessToken, tokenSecret: authInfo?.extra?.ravelryTokenSecret,
        };
        const data = await new RavelryClient(creds).get<{ user: { username: string } }>("/current_user.json");
        return data.user.username;
      }
    );

    await server.connect(transport);
    transport.onclose = () => { if (transport.sessionId) transports.delete(transport.sessionId); };
  }

  await transport.handleRequest(req, res, req.body);
  if (transport.sessionId && !transports.has(transport.sessionId)) {
    transports.set(transport.sessionId, transport);
  }
});

app.get("/", bearerAuth, async (req, res) => {
  const sid = req.headers["mcp-session-id"] as string | undefined;
  if (!sid || !transports.has(sid)) return res.status(400).send("No active session");
  await transports.get(sid)!.handleRequest(req, res);
});

app.delete("/", bearerAuth, async (req, res) => {
  const sid = req.headers["mcp-session-id"] as string | undefined;
  if (sid && transports.has(sid)) { await transports.get(sid)!.close(); transports.delete(sid); }
  res.status(200).send("OK");
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "mcp-weft", version: "1.0.0" });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`mcp-weft hosted on port ${PORT}`);
  console.log(`URL: ${BASE_URL}`);
  console.log(`Default app: ${DEFAULT_APP || "(none — set MCP_APP or use ?app=slug)"}`);
});
