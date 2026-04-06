# WEFT MCP Server

MCP server providing full CRUD access to [WEFT format](https://github.com/luxxyarns/weft) data backed by Ravelry. All inputs and outputs are WEFT — Ravelry is the storage layer.

Works with Claude Desktop, Claude.ai, Claude Code, and any MCP client.

## Architecture

```
MCP Client (Claude, etc.)
  → Bearer token: base64(accessToken:tokenSecret)
    → WEFT MCP Server (your server)
      → OAuth 1.0a signed requests to Ravelry API
        → Response mapped to WEFT format
```

- **Single Ravelry app** configured on the server via env vars
- **Per-user auth** via Bearer token containing the user's OAuth 1.0a access token
- All responses are WEFT-enveloped JSON

## Quick Start

```bash
cd tools/mcp-server
npm install
npm run build
```

### 1. Set your Ravelry app credentials

Get credentials from [Ravelry Pro Developer](https://www.ravelry.com/pro/developer):

```bash
cp .env.example .env
# Edit .env with your RAVELRY_CONSUMER_KEY and RAVELRY_CONSUMER_SECRET
```

### 2a. HTTP Mode (self-hosted, multi-user)

```bash
RAVELRY_CONSUMER_KEY=xxx RAVELRY_CONSUMER_SECRET=yyy npm start
# → mcp-weft HTTP server listening on port 3000
# → Endpoint: http://localhost:3000/mcp
```

Clients pass per-user auth via `Authorization: Bearer <base64(accessToken:tokenSecret)>`.

### 2b. Stdio Mode (local, single user)

For local Claude Desktop / Claude Code use:

```bash
RAVELRY_CONSUMER_KEY=xxx RAVELRY_CONSUMER_SECRET=yyy \
RAVELRY_ACCESS_TOKEN=aaa RAVELRY_TOKEN_SECRET=bbb \
npm run start:stdio
```

### 3. Add to Claude Desktop

```json
{
  "mcpServers": {
    "weft": {
      "command": "node",
      "args": ["/path/to/weft/tools/mcp-server/dist/index.js"],
      "env": {
        "RAVELRY_CONSUMER_KEY": "xxx",
        "RAVELRY_CONSUMER_SECRET": "yyy",
        "RAVELRY_ACCESS_TOKEN": "aaa",
        "RAVELRY_TOKEN_SECRET": "bbb"
      }
    }
  }
}
```

### 4. Add to Claude Code

Add to `.claude/.mcp.json`:
```json
{
  "mcpServers": {
    "weft": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/weft/tools/mcp-server/dist/index.js"],
      "env": {
        "RAVELRY_CONSUMER_KEY": "xxx",
        "RAVELRY_CONSUMER_SECRET": "yyy",
        "RAVELRY_ACCESS_TOKEN": "aaa",
        "RAVELRY_TOKEN_SECRET": "bbb"
      }
    }
  }
}
```

## Docker

```bash
# From the weft repo root:
docker compose -f tools/mcp-server/docker-compose.yml up --build

# Or with env vars:
RAVELRY_CONSUMER_KEY=xxx RAVELRY_CONSUMER_SECRET=yyy \
  docker compose -f tools/mcp-server/docker-compose.yml up --build
```

## Bearer Token Format

The per-user bearer token is `base64(accessToken:tokenSecret)`. Generate it from a user's OAuth 1.0a tokens:

```bash
echo -n "ACCESS_TOKEN:TOKEN_SECRET" | base64
```

Use the authorize script to get tokens interactively:
```bash
RAVELRY_CONSUMER_KEY=xxx RAVELRY_CONSUMER_SECRET=yyy node scripts/authorize.js
```

## Available Tools

### Materials (Yarn Stash)

| Tool | Description |
|------|-------------|
| `list_materials` | List yarn stash as WEFT materials (paginated) |
| `get_material` | Get a single stash item by ID |
| `create_material` | Create a stash item from WEFT material JSON |
| `update_material` | Update a stash item from WEFT material JSON |
| `delete_material` | Delete a stash item |

### Projects

| Tool | Description |
|------|-------------|
| `list_projects` | List projects (optional status filter, paginated) |
| `get_project` | Get a single project by ID |
| `create_project` | Create a project from WEFT project JSON |
| `update_project` | Update a project from WEFT project JSON |
| `delete_project` | Delete a project |

### Queue

| Tool | Description |
|------|-------------|
| `list_queue` | List queued projects (paginated) |
| `get_queue_item` | Get a single queue item by ID |
| `create_queue_item` | Add to queue from WEFT queue JSON |
| `update_queue_item` | Update a queue item |
| `delete_queue_item` | Remove from queue |

### Favorites & Bundles

| Tool | Description |
|------|-------------|
| `list_favorites` | List favorites/bookmarks (optional type filter) |
| `get_favorite` | Get a single favorite by ID |
| `create_favorite` | Favorite/bookmark an item |
| `delete_favorite` | Remove a favorite |
| `list_bundles` | List bundles as WEFT favorites |
| `get_bundle` | Get a single bundle |

### Library

| Tool | Description |
|------|-------------|
| `list_library` | List pattern library volumes |
| `get_volume` | Get a single volume by ID |
| `create_volume` | Add a pattern source to library |
| `delete_volume` | Remove from library |

### Tools (Needles/Hooks)

| Tool | Description |
|------|-------------|
| `list_tools` | List needle/hook inventory |
| `create_tool` | Add a needle/hook from WEFT tool JSON |
| `delete_tool` | Remove a needle/hook |

### Search (read-only)

| Tool | Description |
|------|-------------|
| `search_patterns` | Search patterns (query, craft, weight, availability, designer, fit) |
| `get_pattern` | Get a single pattern by ID |
| `search_designers` | Search designers |
| `get_designer` | Get a single designer by ID |
| `search_yarns` | Search yarn database |
| `get_yarn` | Get a single yarn product by ID |
| `search_shops` | Search yarn shops (with geo search) |
| `get_shop` | Get a single shop by ID |

### Other

| Tool | Description |
|------|-------------|
| `get_current_user` | Get authenticated user profile |
| `export_universe` | Export everything as a WEFT bundle |

## Type Safety

TypeScript types are generated from WEFT JSON schemas:

```bash
npm run generate-types   # reads ../../*/*.schema.json
npm run build            # generates types, then compiles
```

All output conforms to the WEFT spec: raw IDs, ISO 8601 dates, `$schema` references.
