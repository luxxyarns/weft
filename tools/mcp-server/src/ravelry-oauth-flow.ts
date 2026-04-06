// Ravelry OAuth 1.0a server-side flow: request_token → authorize → access_token

import { createHmac, randomBytes } from "node:crypto";

const RAVELRY_BASE = "https://www.ravelry.com";
const RAVELRY_API = "https://api.ravelry.com";

function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, "%21").replace(/'/g, "%27")
    .replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A");
}

function oauthSign(
  method: string, url: string, params: Record<string, string>,
  consumerSecret: string, tokenSecret = ""
): string {
  const sorted = Object.keys(params).sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(params[k])}`).join("&");
  const base = `${method}&${percentEncode(url)}&${percentEncode(sorted)}`;
  const key = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
  return createHmac("sha1", key).update(base).digest("base64");
}

function oauthHeader(params: Record<string, string>): string {
  return "OAuth " + Object.keys(params).filter((k) => k.startsWith("oauth_")).sort()
    .map((k) => `${percentEncode(k)}="${percentEncode(params[k])}"`).join(", ");
}

export interface RavelryAppCredentials {
  consumerKey: string;
  consumerSecret: string;
}

export interface RequestTokenResult {
  oauthToken: string;
  oauthTokenSecret: string;
  authorizeUrl: string;
}

export interface AccessTokenResult {
  accessToken: string;
  tokenSecret: string;
}

export interface RavelryUser {
  username: string;
  id: number;
}

export async function getRequestToken(
  app: RavelryAppCredentials, callbackUrl: string
): Promise<RequestTokenResult> {
  const url = `${RAVELRY_BASE}/oauth/request_token`;
  const params: Record<string, string> = {
    oauth_consumer_key: app.consumerKey,
    oauth_nonce: randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
    oauth_callback: callbackUrl,
  };
  params.oauth_signature = oauthSign("POST", url, params, app.consumerSecret);

  const res = await fetch(url, { method: "POST", headers: { Authorization: oauthHeader(params) } });
  if (!res.ok) throw new Error(`Ravelry request_token ${res.status}: ${await res.text()}`);

  const parsed = new URLSearchParams(await res.text());
  const oauthToken = parsed.get("oauth_token")!;
  const oauthTokenSecret = parsed.get("oauth_token_secret")!;
  if (!oauthToken || !oauthTokenSecret) throw new Error("Missing oauth_token in response");

  return { oauthToken, oauthTokenSecret, authorizeUrl: `${RAVELRY_BASE}/oauth/authorize?oauth_token=${oauthToken}` };
}

export async function getAccessToken(
  app: RavelryAppCredentials, oauthToken: string, oauthTokenSecret: string, oauthVerifier: string
): Promise<AccessTokenResult> {
  const url = `${RAVELRY_BASE}/oauth/access_token`;
  const params: Record<string, string> = {
    oauth_consumer_key: app.consumerKey,
    oauth_nonce: randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
    oauth_token: oauthToken,
    oauth_verifier: oauthVerifier,
  };
  params.oauth_signature = oauthSign("POST", url, params, app.consumerSecret, oauthTokenSecret);

  const res = await fetch(url, { method: "POST", headers: { Authorization: oauthHeader(params) } });
  if (!res.ok) throw new Error(`Ravelry access_token ${res.status}: ${await res.text()}`);

  const parsed = new URLSearchParams(await res.text());
  return { accessToken: parsed.get("oauth_token")!, tokenSecret: parsed.get("oauth_token_secret")! };
}

export async function getCurrentUser(
  app: RavelryAppCredentials, accessToken: string, tokenSecret: string
): Promise<RavelryUser> {
  const url = `${RAVELRY_API}/current_user.json`;
  const params: Record<string, string> = {
    oauth_consumer_key: app.consumerKey,
    oauth_nonce: randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
    oauth_token: accessToken,
  };
  params.oauth_signature = oauthSign("GET", url, params, app.consumerSecret, tokenSecret);

  const res = await fetch(url, { method: "GET", headers: { Authorization: oauthHeader(params), Accept: "application/json" } });
  if (!res.ok) throw new Error(`Ravelry current_user ${res.status}: ${await res.text()}`);

  const data = (await res.json()) as { user: { username: string; id: number } };
  return { username: data.user.username, id: data.user.id };
}
