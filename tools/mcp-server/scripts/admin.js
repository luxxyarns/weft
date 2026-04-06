#!/usr/bin/env node

// MCP Admin CLI
// Usage: DATABASE_URL=... node scripts/admin.js <command> [args]
//
// Commands:
//   app:list                         List registered Ravelry apps
//   app:add <slug> <name> <key> <secret>  Register a Ravelry app
//   app:remove <slug>                Disable a Ravelry app
//   app:enable <slug>                Re-enable a Ravelry app
//
//   client:list                      List OAuth 2.0 clients
//   client:create [name]             Create a client (outputs id + secret)
//   client:revoke <client_id>        Delete a client and its sessions
//
//   session:list [username]          List active sessions
//   session:revoke <session_id>      Revoke a session
//   session:revoke-user <username>   Revoke all sessions for a user
//   session:cleanup [days]           Remove expired/revoked sessions older than N days (default 30)
//
//   stats                            Show usage statistics

import pg from "pg";
import { randomUUID, randomBytes } from "crypto";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const [cmd, ...args] = process.argv.slice(2);

if (!cmd) {
  console.log(`Usage: DATABASE_URL=... node scripts/admin.js <command> [args]

Apps:
  app:list                              List registered Ravelry apps
  app:add <slug> <name> <key> <secret>  Register a Ravelry app
  app:remove <slug>                     Disable a Ravelry app
  app:enable <slug>                     Re-enable a Ravelry app

Clients:
  client:list                           List OAuth 2.0 clients
  client:create [name]                  Create a client (outputs id + secret)
  client:revoke <client_id>             Delete a client and revoke its sessions

Sessions:
  session:list [username]               List active sessions
  session:revoke <session_id>           Revoke a session
  session:revoke-user <username>        Revoke all sessions for a user
  session:cleanup [days]                Remove old revoked/expired sessions (default 30 days)

Stats:
  stats                                 Show usage statistics`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// Apps
// ---------------------------------------------------------------------------

if (cmd === "app:list") {
  const r = await pool.query(`SELECT slug, name, ravelry_consumer_key, enabled, created_at FROM mcp_ravelry_app ORDER BY name`);
  if (!r.rows.length) { console.log("No apps registered."); }
  else {
    console.log("Registered Ravelry apps:\n");
    for (const a of r.rows) {
      const status = a.enabled ? "✓" : "✗";
      console.log(`  ${status} ${a.slug.padEnd(25)} ${a.name.padEnd(30)} key: ${a.ravelry_consumer_key.substring(0, 12)}...  (${a.created_at.toISOString().slice(0, 10)})`);
    }
  }
}

else if (cmd === "app:add") {
  const [slug, name, key, secret] = args;
  if (!slug || !name || !key || !secret) { console.error("Usage: app:add <slug> <name> <consumer_key> <consumer_secret>"); process.exit(1); }
  await pool.query(
    `INSERT INTO mcp_ravelry_app (slug, name, ravelry_consumer_key, ravelry_consumer_secret) VALUES ($1,$2,$3,$4)
     ON CONFLICT (slug) DO UPDATE SET name=$2, ravelry_consumer_key=$3, ravelry_consumer_secret=$4, enabled=TRUE`,
    [slug, name, key, secret]
  );
  console.log(`App registered: ${slug} (${name})`);
}

else if (cmd === "app:remove") {
  const [slug] = args;
  if (!slug) { console.error("Usage: app:remove <slug>"); process.exit(1); }
  const r = await pool.query(`UPDATE mcp_ravelry_app SET enabled=FALSE WHERE slug=$1 RETURNING slug`, [slug]);
  console.log(r.rowCount ? `App disabled: ${slug}` : `App not found: ${slug}`);
}

else if (cmd === "app:enable") {
  const [slug] = args;
  if (!slug) { console.error("Usage: app:enable <slug>"); process.exit(1); }
  const r = await pool.query(`UPDATE mcp_ravelry_app SET enabled=TRUE WHERE slug=$1 RETURNING slug`, [slug]);
  console.log(r.rowCount ? `App enabled: ${slug}` : `App not found: ${slug}`);
}

// ---------------------------------------------------------------------------
// Clients
// ---------------------------------------------------------------------------

else if (cmd === "client:list") {
  const r = await pool.query(`SELECT c.client_id, c.client_name, c.client_id_issued_at,
    (SELECT COUNT(*) FROM mcp_session s WHERE s.client_id = c.client_id AND NOT s.revoked) as active_sessions
    FROM mcp_oauth_client c ORDER BY c.client_id_issued_at DESC`);
  if (!r.rows.length) { console.log("No clients registered."); }
  else {
    console.log("OAuth 2.0 clients:\n");
    for (const c of r.rows) {
      console.log(`  ${c.client_id}  ${(c.client_name || "(unnamed)").padEnd(20)}  sessions: ${c.active_sessions}  (${c.client_id_issued_at.toISOString().slice(0, 10)})`);
    }
  }
}

else if (cmd === "client:create") {
  const name = args[0] || "claude-connector";
  const clientId = randomUUID();
  const clientSecret = randomBytes(32).toString("hex");
  await pool.query(
    `INSERT INTO mcp_oauth_client (client_id, client_secret, client_id_issued_at, redirect_uris, client_name, grant_types, response_types, token_endpoint_auth_method)
     VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7)`,
    [clientId, clientSecret, ["https://claude.ai/oauth/callback", "http://localhost/oauth/callback"],
     name, ["authorization_code", "refresh_token"], ["code"], "client_secret_post"]
  );
  console.log(`\nOAuth 2.0 client created:\n`);
  console.log(`  Client ID:     ${clientId}`);
  console.log(`  Client Secret: ${clientSecret}`);
  console.log(`  Name:          ${name}`);
  console.log(`\nGive these to users for the Claude.ai connector dialog.`);
}

else if (cmd === "client:revoke") {
  const [clientId] = args;
  if (!clientId) { console.error("Usage: client:revoke <client_id>"); process.exit(1); }
  const sr = await pool.query(`UPDATE mcp_session SET revoked=TRUE WHERE client_id=$1 AND NOT revoked`, [clientId]);
  const cr = await pool.query(`DELETE FROM mcp_oauth_client WHERE client_id=$1`, [clientId]);
  console.log(cr.rowCount ? `Client deleted: ${clientId} (${sr.rowCount} sessions revoked)` : `Client not found: ${clientId}`);
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

else if (cmd === "session:list") {
  const [username] = args;
  const where = username ? `AND s.ravelry_username = $1` : "";
  const params = username ? [username] : [];
  const r = await pool.query(
    `SELECT s.id, s.ravelry_username, s.app_slug, s.client_id, s.created_at, s.last_used_at, s.revoked
     FROM mcp_session s WHERE NOT s.revoked ${where} ORDER BY s.last_used_at DESC LIMIT 50`, params
  );
  if (!r.rows.length) { console.log(username ? `No active sessions for ${username}.` : "No active sessions."); }
  else {
    console.log(`Active sessions${username ? ` for ${username}` : ""}:\n`);
    for (const s of r.rows) {
      console.log(`  ${s.id}  user: ${(s.ravelry_username || "?").padEnd(15)}  app: ${(s.app_slug || "?").padEnd(20)}  last: ${s.last_used_at.toISOString().slice(0, 16)}`);
    }
  }
}

else if (cmd === "session:revoke") {
  const [id] = args;
  if (!id) { console.error("Usage: session:revoke <session_id>"); process.exit(1); }
  const r = await pool.query(`UPDATE mcp_session SET revoked=TRUE WHERE id=$1 AND NOT revoked RETURNING ravelry_username`, [id]);
  console.log(r.rowCount ? `Session revoked: ${id} (user: ${r.rows[0].ravelry_username})` : `Session not found or already revoked: ${id}`);
}

else if (cmd === "session:revoke-user") {
  const [username] = args;
  if (!username) { console.error("Usage: session:revoke-user <username>"); process.exit(1); }
  const r = await pool.query(`UPDATE mcp_session SET revoked=TRUE WHERE ravelry_username=$1 AND NOT revoked`, [username]);
  console.log(`Revoked ${r.rowCount} session(s) for ${username}`);
}

else if (cmd === "session:cleanup") {
  const days = parseInt(args[0] || "30", 10);
  const r = await pool.query(`DELETE FROM mcp_session WHERE revoked=TRUE AND last_used_at < NOW() - INTERVAL '${days} days'`);
  const rc = await pool.query(`DELETE FROM mcp_auth_code WHERE used=TRUE OR expires_at < NOW()`);
  console.log(`Cleaned up ${r.rowCount} revoked sessions and ${rc.rowCount} expired auth codes (older than ${days} days)`);
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

else if (cmd === "stats") {
  const apps = await pool.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE enabled) as active FROM mcp_ravelry_app`);
  const clients = await pool.query(`SELECT COUNT(*) as total FROM mcp_oauth_client`);
  const sessions = await pool.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE NOT revoked) as active FROM mcp_session`);
  const users = await pool.query(`SELECT COUNT(DISTINCT ravelry_username) as total FROM mcp_session WHERE NOT revoked`);
  const recent = await pool.query(`SELECT COUNT(*) as total FROM mcp_session WHERE last_used_at > NOW() - INTERVAL '24 hours' AND NOT revoked`);

  console.log(`MCP Server Stats:\n`);
  console.log(`  Apps:              ${apps.rows[0].active} active / ${apps.rows[0].total} total`);
  console.log(`  OAuth Clients:     ${clients.rows[0].total}`);
  console.log(`  Sessions:          ${sessions.rows[0].active} active / ${sessions.rows[0].total} total`);
  console.log(`  Unique Users:      ${users.rows[0].total}`);
  console.log(`  Active (24h):      ${recent.rows[0].total} sessions`);
}

else {
  console.error(`Unknown command: ${cmd}`);
  process.exit(1);
}

await pool.end();
