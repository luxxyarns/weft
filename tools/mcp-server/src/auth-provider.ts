// OAuth 2.0 Server Provider for hosted mode
// Wraps Ravelry OAuth 1.0a behind standard OAuth 2.0 for Claude.ai connectors.
// App credentials loaded from DB (mcp_ravelry_app table).

import { randomBytes, randomUUID } from "node:crypto";
import type { Response } from "express";
import type { OAuthServerProvider, AuthorizationParams } from "@modelcontextprotocol/sdk/server/auth/provider.js";
import type { OAuthRegisteredClientsStore } from "@modelcontextprotocol/sdk/server/auth/clients.js";
import type { OAuthClientInformationFull, OAuthTokens, OAuthTokenRevocationRequest } from "@modelcontextprotocol/sdk/shared/auth.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { query } from "./db.js";
import {
  getRequestToken, getAccessToken, getCurrentUser,
  type RavelryAppCredentials,
} from "./ravelry-oauth-flow.js";

// ---------------------------------------------------------------------------
// App registry (DB-backed)
// ---------------------------------------------------------------------------

async function getAppFromDb(slug: string): Promise<RavelryAppCredentials & { slug: string }> {
  const r = await query(
    `SELECT slug, ravelry_consumer_key, ravelry_consumer_secret FROM mcp_ravelry_app WHERE slug = $1 AND enabled = TRUE`,
    [slug]
  );
  if (r.rows.length === 0) throw new Error(`Unknown app: ${slug}`);
  if (!r.rows[0].ravelry_consumer_secret) throw new Error(`App ${slug} has no secret configured`);
  return { slug: r.rows[0].slug, consumerKey: r.rows[0].ravelry_consumer_key, consumerSecret: r.rows[0].ravelry_consumer_secret };
}

// ---------------------------------------------------------------------------
// Pending flows (in-memory, short-lived)
// ---------------------------------------------------------------------------

const pending = new Map<string, {
  oauthTokenSecret: string; clientId: string; redirectUri: string;
  codeChallenge: string; scopes: string[];
  appSlug: string; appCreds: RavelryAppCredentials; createdAt: number;
}>();

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of pending) { if (now - v.createdAt > 600_000) pending.delete(k); }
}, 300_000);

// ---------------------------------------------------------------------------
// Client store (dynamic registration)
// ---------------------------------------------------------------------------

// When false, clients must be pre-registered via scripts/create-client.js
const ALLOW_REGISTRATION = process.env.MCP_ALLOW_REGISTRATION === "true";

class PgClientsStore implements OAuthRegisteredClientsStore {
  async getClient(clientId: string): Promise<OAuthClientInformationFull | undefined> {
    const r = await query(`SELECT * FROM mcp_oauth_client WHERE client_id = $1`, [clientId]);
    if (!r.rows.length) return undefined;
    const row = r.rows[0];
    return {
      client_id: row.client_id, client_secret: row.client_secret,
      client_id_issued_at: Math.floor(new Date(row.client_id_issued_at).getTime() / 1000),
      client_secret_expires_at: row.client_secret_expires_at ? Math.floor(new Date(row.client_secret_expires_at).getTime() / 1000) : undefined,
      redirect_uris: row.redirect_uris, client_name: row.client_name, client_uri: row.client_uri,
      grant_types: row.grant_types, response_types: row.response_types,
      token_endpoint_auth_method: row.token_endpoint_auth_method, scope: row.scope,
    };
  }

  // Only available when MCP_ALLOW_REGISTRATION=true.
  // In production, use scripts/create-client.js to pre-register clients.
  registerClient = ALLOW_REGISTRATION
    ? async (client: Omit<OAuthClientInformationFull, "client_id" | "client_id_issued_at">): Promise<OAuthClientInformationFull> => {
        const id = randomUUID();
        const secret = client.client_secret ?? randomBytes(32).toString("hex");
        const now = new Date();
        await query(
          `INSERT INTO mcp_oauth_client (client_id,client_secret,client_id_issued_at,redirect_uris,client_name,client_uri,grant_types,response_types,token_endpoint_auth_method,scope)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT DO NOTHING`,
          [id, secret, now, client.redirect_uris||[], client.client_name, client.client_uri,
           client.grant_types||["authorization_code"], client.response_types||["code"],
           client.token_endpoint_auth_method||"client_secret_post", client.scope]
        );
        return {
          client_id: id, client_secret: secret, client_id_issued_at: Math.floor(now.getTime()/1000),
          redirect_uris: client.redirect_uris||[], client_name: client.client_name, client_uri: client.client_uri,
          grant_types: client.grant_types||["authorization_code"], response_types: client.response_types||["code"],
          token_endpoint_auth_method: client.token_endpoint_auth_method||"client_secret_post", scope: client.scope,
        };
      }
    : undefined;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export class WeftOAuthProvider implements OAuthServerProvider {
  private _clients = new PgClientsStore();
  private baseUrl: string;
  /** Set per-request before authorize() — which Ravelry app to use */
  public currentAppSlug = "";

  constructor(baseUrl: string) { this.baseUrl = baseUrl; }
  get clientsStore(): OAuthRegisteredClientsStore { return this._clients; }

  async authorize(client: OAuthClientInformationFull, params: AuthorizationParams, res: Response): Promise<void> {
    const app = await getAppFromDb(this.currentAppSlug);
    const reqToken = await getRequestToken(app, `${this.baseUrl}/ravelry/callback`);
    pending.set(reqToken.oauthToken, {
      oauthTokenSecret: reqToken.oauthTokenSecret,
      clientId: client.client_id, redirectUri: params.redirectUri,
      codeChallenge: params.codeChallenge, scopes: params.scopes || [],
      appSlug: this.currentAppSlug, appCreds: app, createdAt: Date.now(),
    });
    res.redirect(reqToken.authorizeUrl);
  }

  async handleRavelryCallback(oauthToken: string, oauthVerifier: string): Promise<{ redirectUri: string; code: string }> {
    const flow = pending.get(oauthToken);
    if (!flow) throw new Error("Unknown or expired OAuth flow");
    pending.delete(oauthToken);

    const tokens = await getAccessToken(flow.appCreds, oauthToken, flow.oauthTokenSecret, oauthVerifier);
    const user = await getCurrentUser(flow.appCreds, tokens.accessToken, tokens.tokenSecret);

    const code = randomBytes(32).toString("hex");
    await query(
      `INSERT INTO mcp_auth_code (code,client_id,app_slug,redirect_uri,code_challenge,scopes,ravelry_access_token,ravelry_token_secret,ravelry_username,ravelry_user_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [code, flow.clientId, flow.appSlug, flow.redirectUri, flow.codeChallenge, flow.scopes,
       tokens.accessToken, tokens.tokenSecret, user.username, user.id]
    );
    return { redirectUri: flow.redirectUri, code };
  }

  async challengeForAuthorizationCode(_c: OAuthClientInformationFull, code: string): Promise<string> {
    const r = await query(`SELECT code_challenge FROM mcp_auth_code WHERE code=$1 AND NOT used AND expires_at>NOW()`, [code]);
    if (!r.rows.length) throw new Error("Invalid authorization code");
    return r.rows[0].code_challenge;
  }

  async exchangeAuthorizationCode(client: OAuthClientInformationFull, code: string): Promise<OAuthTokens> {
    const r = await query(
      `UPDATE mcp_auth_code SET used=TRUE WHERE code=$1 AND client_id=$2 AND NOT used AND expires_at>NOW() RETURNING *`,
      [code, client.client_id]
    );
    if (!r.rows.length) throw new Error("Invalid authorization code");
    const row = r.rows[0];

    const at = randomBytes(32).toString("hex");
    const rt = randomBytes(32).toString("hex");
    const expiresInSec = parseInt(process.env.MCP_TOKEN_EXPIRY_HOURS || "24", 10) * 3600;
    await query(
      `INSERT INTO mcp_session (access_token,refresh_token,app_slug,ravelry_access_token,ravelry_token_secret,ravelry_username,ravelry_user_id,client_id,scopes,expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW() + INTERVAL '${expiresInSec} seconds')`,
      [at, rt, row.app_slug, row.ravelry_access_token, row.ravelry_token_secret, row.ravelry_username, row.ravelry_user_id, client.client_id, row.scopes]
    );
    return { access_token: at, token_type: "bearer", refresh_token: rt, expires_in: expiresInSec };
  }

  async exchangeRefreshToken(client: OAuthClientInformationFull, refreshToken: string): Promise<OAuthTokens> {
    const r = await query(`SELECT * FROM mcp_session WHERE refresh_token=$1 AND client_id=$2 AND NOT revoked`, [refreshToken, client.client_id]);
    if (!r.rows.length) throw new Error("Invalid refresh token");
    const nat = randomBytes(32).toString("hex");
    const nrt = randomBytes(32).toString("hex");
    const expiresInSec = parseInt(process.env.MCP_TOKEN_EXPIRY_HOURS || "24", 10) * 3600;
    await query(
      `UPDATE mcp_session SET access_token=$1,refresh_token=$2,last_used_at=NOW(),expires_at=NOW()+INTERVAL '${expiresInSec} seconds' WHERE id=$3`,
      [nat, nrt, r.rows[0].id]
    );
    return { access_token: nat, token_type: "bearer", refresh_token: nrt, expires_in: expiresInSec };
  }

  async verifyAccessToken(token: string): Promise<AuthInfo> {
    const r = await query(
      `UPDATE mcp_session SET last_used_at=NOW()
       WHERE access_token=$1 AND NOT revoked AND (expires_at IS NULL OR expires_at > NOW())
       RETURNING *`,
      [token]
    );
    if (!r.rows.length) throw new Error("Invalid token");
    const s = r.rows[0];

    // Load app credentials for Ravelry API calls
    let consumerKey = "", consumerSecret = "";
    if (s.app_slug) {
      try {
        const app = await getAppFromDb(s.app_slug);
        consumerKey = app.consumerKey; consumerSecret = app.consumerSecret;
      } catch { /* app may have been disabled */ }
    }

    return {
      token, clientId: s.client_id, scopes: s.scopes || [],
      extra: {
        ravelryUsername: s.ravelry_username, ravelryUserId: s.ravelry_user_id,
        ravelryAccessToken: s.ravelry_access_token, ravelryTokenSecret: s.ravelry_token_secret,
        ravelryConsumerKey: consumerKey, ravelryConsumerSecret: consumerSecret,
      },
    };
  }

  async revokeToken(_c: OAuthClientInformationFull, req: OAuthTokenRevocationRequest): Promise<void> {
    await query(`UPDATE mcp_session SET revoked=TRUE WHERE (access_token=$1 OR refresh_token=$1) AND NOT revoked`, [req.token]);
  }
}
