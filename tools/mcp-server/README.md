# WEFT MCP Server

MCP server that exports Ravelry data to [WEFT format](https://github.com/luxxyarns/weft). Works with Claude Desktop, Claude.ai, and Claude Code.

## Quick Start (Local)

```bash
cd tools/mcp-server
npm install
npm run build
```

### 1. Configure your Ravelry app

Copy the example and add your [Ravelry API credentials](https://www.ravelry.com/pro/developer):

```bash
cp apps.json.example apps.json
```

Edit `apps.json`:
```json
{
  "apps": [
    {
      "slug": "my-app",
      "name": "My Ravelry App",
      "consumerKey": "YOUR_CONSUMER_KEY",
      "consumerSecret": "YOUR_CONSUMER_SECRET"
    }
  ],
  "tokens": {
    "my-app": {
      "accessToken": "YOUR_ACCESS_TOKEN",
      "tokenSecret": "YOUR_TOKEN_SECRET",
      "username": "your_ravelry_username"
    }
  }
}
```

Multiple apps are supported — add more entries to the `apps` and `tokens` arrays.

### 2. Add to Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "weft": {
      "command": "node",
      "args": ["/path/to/weft/tools/mcp-server/dist/index.js"]
    }
  }
}
```

To select a specific app (if you have multiple):
```json
{
  "mcpServers": {
    "weft": {
      "command": "node",
      "args": ["/path/to/weft/tools/mcp-server/dist/index.js"],
      "env": { "MCP_APP": "my-app" }
    }
  }
}
```

### 3. Add to Claude Code

Add to `.claude/.mcp.json` in your project:
```json
{
  "mcpServers": {
    "weft": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/weft/tools/mcp-server/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop / Claude Code. Then ask: **"export my in-progress projects to weft"**

## Available Tools

| Tool | Description |
|------|-------------|
| `export_stash` | Export yarn stash to WEFT material format |
| `export_projects` | Export projects (optional status filter: `in-progress`, `finished`, etc.) |
| `export_queue` | Export project queue |
| `export_favorites` | Export favorites/bookmarks |
| `export_library` | Export pattern library |
| `export_needles` | Export needle/hook inventory |
| `export_universe` | Export everything as a single WEFT bundle |

## Hosted Mode (OAuth 2.0)

For multi-user deployments (e.g., `mcp.stash2go.com`), the server supports HTTP transport with OAuth 2.0 authentication that wraps Ravelry's OAuth 1.0a.

### Setup

```bash
# Database (PostgreSQL)
createdb mcp_weft
psql mcp_weft < migrations/001_init.sql

# Register Ravelry app(s)
DATABASE_URL=postgresql://localhost/mcp_weft node scripts/admin.js app:add my-app "My App" CONSUMER_KEY CONSUMER_SECRET

# Create OAuth 2.0 client credentials (give these to users)
DATABASE_URL=postgresql://localhost/mcp_weft node scripts/admin.js client:create "claude-connector"
# → Client ID: abc-123
# → Client Secret: def-456

# Start server
DATABASE_URL=postgresql://localhost/mcp_weft \
  MCP_BASE_URL=https://mcp.example.com \
  MCP_APP=my-app \
  node dist/hosted.js
```

### Connect from Claude.ai

In Claude.ai → Settings → Add custom connector:
- **URL**: `https://mcp.example.com/`
- **OAuth Client ID**: `abc-123` (from `client:create`)
- **OAuth Client Secret**: `def-456`

The browser will open for Ravelry authorization. After approval, tools are available.

### Security

- **Client registration is closed by default** — only pre-registered clients can connect
- **Token expiry** — access tokens expire after 24h (configurable via `MCP_TOKEN_EXPIRY_HOURS`)
- **Rate limiting** — 60 requests/minute per IP
- **PKCE** enforced by the MCP SDK
- **Ravelry tokens stored server-side** — users never see raw OAuth 1.0a tokens

### Admin CLI

```bash
export DATABASE_URL=postgresql://localhost/mcp_weft

# Apps
node scripts/admin.js app:list
node scripts/admin.js app:add <slug> <name> <key> <secret>
node scripts/admin.js app:remove <slug>

# Clients
node scripts/admin.js client:list
node scripts/admin.js client:create [name]
node scripts/admin.js client:revoke <client_id>

# Sessions
node scripts/admin.js session:list [username]
node scripts/admin.js session:revoke <session_id>
node scripts/admin.js session:revoke-user <username>
node scripts/admin.js session:cleanup [days]

# Stats
node scripts/admin.js stats
```

## Type Safety

TypeScript types are generated from the WEFT JSON schemas:

```bash
npm run generate-types   # reads ../../*/*.schema.json
npm run build            # generates types, then compiles
```

Output conforms to the WEFT spec: raw IDs (no synthetic prefixes), correct date formats (`YYYY-MM-DD` for dates, ISO 8601 for timestamps), `$schema` references to the WEFT schema repository.
