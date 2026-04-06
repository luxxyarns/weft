#!/usr/bin/env node

// WEFT MCP Server — HTTP mode (Streamable HTTP, bearer token auth)
// Usage:
//   RAVELRY_CONSUMER_KEY=xxx RAVELRY_CONSUMER_SECRET=yyy node dist/server.js
//   Bearer token per request: base64(accessToken:tokenSecret)

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { getAppCredentials, decodeBearer } from "./config.js";
import { RavelryClient } from "./ravelry-client.js";
import type { OAuthCredentials } from "./oauth.js";
import { registerWeftTools } from "./weft-tools.js";

const PORT = parseInt(process.env.MCP_PORT || "3000", 10);
const app = getAppCredentials();

// Per-session state
const sessions = new Map<string, { transport: StreamableHTTPServerTransport; server: McpServer }>();

function createSession(): { transport: StreamableHTTPServerTransport; server: McpServer } {
  const server = new McpServer({ name: "mcp-weft", version: "2.0.0" });

  registerWeftTools(
    server,
    (authInfo?: any) => {
      const token = authInfo?.token;
      if (!token) throw new Error("No bearer token provided");
      const user = decodeBearer(token);
      return {
        consumerKey: app.consumerKey,
        consumerSecret: app.consumerSecret,
        accessToken: user.accessToken,
        tokenSecret: user.tokenSecret,
      } satisfies OAuthCredentials;
    },
    async (authInfo?: any) => {
      const creds = authInfo?.token ? (() => {
        const user = decodeBearer(authInfo.token);
        return { ...app, ...user } as OAuthCredentials;
      })() : undefined;
      if (!creds) throw new Error("No bearer token provided");
      const data = await new RavelryClient(creds).get<{ user: { username: string } }>("/current_user.json");
      return data.user.username;
    }
  );

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),
  });

  server.connect(transport);
  return { transport, server };
}

function extractBearerToken(req: IncomingMessage): string | undefined {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return undefined;
  return auth.slice(7);
}

async function handler(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  // Health check
  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", server: "mcp-weft", version: "2.0.0" }));
    return;
  }

  // Only handle /mcp path
  if (url.pathname !== "/mcp") {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  // Extract bearer token and pass as authInfo
  const token = extractBearerToken(req);

  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (req.method === "POST") {
    // New session or existing session
    let session: { transport: StreamableHTTPServerTransport; server: McpServer };

    if (sessionId && sessions.has(sessionId)) {
      session = sessions.get(sessionId)!;
    } else if (!sessionId) {
      // New session — will be created on initialization
      session = createSession();
      // Store after transport assigns session ID
      session.transport.onclose = () => {
        if (session.transport.sessionId) {
          sessions.delete(session.transport.sessionId);
        }
      };
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Session not found" }));
      return;
    }

    // Inject auth info into the request
    // The transport will pass this through to tool handlers via authInfo
    (req as any).auth = token ? { token } : undefined;

    await session.transport.handleRequest(req, res);

    // Store session after first request (initialization sets session ID)
    if (session.transport.sessionId && !sessions.has(session.transport.sessionId)) {
      sessions.set(session.transport.sessionId, session);
    }
    return;
  }

  if (req.method === "GET") {
    // SSE stream for existing session
    if (!sessionId || !sessions.has(sessionId)) {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Session not found" }));
      return;
    }
    const session = sessions.get(sessionId)!;
    await session.transport.handleRequest(req, res);
    return;
  }

  if (req.method === "DELETE") {
    // Close session
    if (sessionId && sessions.has(sessionId)) {
      const session = sessions.get(sessionId)!;
      await session.transport.handleRequest(req, res);
      sessions.delete(sessionId);
    } else {
      res.writeHead(404);
      res.end();
    }
    return;
  }

  res.writeHead(405);
  res.end("Method not allowed");
}

const httpServer = createServer(handler);
httpServer.listen(PORT, () => {
  console.error(`mcp-weft HTTP server listening on port ${PORT}`);
  console.error(`Endpoint: http://localhost:${PORT}/mcp`);
});
