#!/usr/bin/env node

// OAuth 1.0a Authorization flow for Ravelry
// Usage: node scripts/authorize.js [app-slug]

import { createServer } from "http";
import { createHmac, randomBytes } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appsPath = resolve(__dirname, "../apps.json");
const config = JSON.parse(readFileSync(appsPath, "utf-8"));

const slug = process.argv[2] || config.apps[0]?.slug;
const app = config.apps.find(a => a.slug === slug);
if (!app) {
  console.error(`App "${slug}" not found. Available: ${config.apps.map(a => a.slug).join(", ")}`);
  process.exit(1);
}

const PORT = 8095;
const CALLBACK_URL = `http://localhost:${PORT}/callback`;

function percentEncode(s) {
  return encodeURIComponent(s).replace(/!/g, "%21").replace(/'/g, "%27")
    .replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/\*/g, "%2A");
}
function sign(method, url, params, consumerSecret, tokenSecret = "") {
  const sorted = Object.keys(params).sort().map(k => `${percentEncode(k)}=${percentEncode(params[k])}`).join("&");
  const base = `${method}&${percentEncode(url)}&${percentEncode(sorted)}`;
  const key = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
  return createHmac("sha1", key).update(base).digest("base64");
}
function authHeader(params) {
  return "OAuth " + Object.keys(params).filter(k => k.startsWith("oauth_")).sort()
    .map(k => `${percentEncode(k)}="${percentEncode(params[k])}"`).join(", ");
}

console.log(`\nAuthorizing: ${app.name} (${app.slug})`);

const rtUrl = "https://www.ravelry.com/oauth/request_token";
const rtParams = {
  oauth_consumer_key: app.consumerKey,
  oauth_nonce: randomBytes(16).toString("hex"),
  oauth_signature_method: "HMAC-SHA1",
  oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
  oauth_version: "1.0",
  oauth_callback: CALLBACK_URL,
};
rtParams.oauth_signature = sign("POST", rtUrl, rtParams, app.consumerSecret);

const rtRes = await fetch(rtUrl, { method: "POST", headers: { Authorization: authHeader(rtParams) } });
if (!rtRes.ok) { console.error(`Request token failed: ${rtRes.status} ${await rtRes.text()}`); process.exit(1); }

const rtData = new URLSearchParams(await rtRes.text());
const requestToken = rtData.get("oauth_token");
const requestTokenSecret = rtData.get("oauth_token_secret");
if (!requestToken) { console.error("Missing oauth_token"); process.exit(1); }

console.log("Got request token\n");

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  if (url.pathname !== "/callback") { res.writeHead(404); res.end(); return; }

  const token = url.searchParams.get("oauth_token");
  const verifier = url.searchParams.get("oauth_verifier");
  if (!token || !verifier) {
    res.writeHead(400, { "Content-Type": "text/html" });
    res.end("<h1>Missing oauth_token or oauth_verifier</h1>");
    server.close(); process.exit(1);
  }

  console.log("Exchanging for access token...");
  const atUrl = "https://www.ravelry.com/oauth/access_token";
  const atParams = {
    oauth_consumer_key: app.consumerKey,
    oauth_nonce: randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
    oauth_token: token,
    oauth_verifier: verifier,
  };
  atParams.oauth_signature = sign("POST", atUrl, atParams, app.consumerSecret, requestTokenSecret);

  const atRes = await fetch(atUrl, { method: "POST", headers: { Authorization: authHeader(atParams) } });
  if (!atRes.ok) {
    const body = await atRes.text();
    res.writeHead(500, { "Content-Type": "text/html" });
    res.end(`<h1>Failed</h1><pre>${atRes.status}: ${body}</pre>`);
    server.close(); process.exit(1);
  }

  const atData = new URLSearchParams(await atRes.text());
  const accessToken = atData.get("oauth_token");
  const tokenSecret = atData.get("oauth_token_secret");
  console.log("Got access token!");

  let username = "";
  try {
    const uUrl = "https://api.ravelry.com/current_user.json";
    const uParams = {
      oauth_consumer_key: app.consumerKey,
      oauth_nonce: randomBytes(16).toString("hex"),
      oauth_signature_method: "HMAC-SHA1",
      oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
      oauth_version: "1.0",
      oauth_token: accessToken,
    };
    uParams.oauth_signature = sign("GET", uUrl, uParams, app.consumerSecret, tokenSecret);
    const uRes = await fetch(uUrl, { headers: { Authorization: authHeader(uParams), Accept: "application/json" } });
    if (uRes.ok) { username = (await uRes.json()).user?.username || ""; console.log(`User: ${username}`); }
  } catch {}

  config.tokens[slug] = { accessToken, tokenSecret, username };
  writeFileSync(appsPath, JSON.stringify(config, null, 2) + "\n", "utf-8");
  console.log(`\nTokens saved to apps.json for "${slug}"`);

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`<h1>Authorized!</h1><p>User: ${username}</p><p>You can close this window.</p>`);
  server.close(); process.exit(0);
});

server.listen(PORT, () => {
  const authorizeUrl = `https://www.ravelry.com/oauth/authorize?oauth_token=${requestToken}`;
  console.log("Opening browser...\n");
  try { execSync(`open "${authorizeUrl}"`); } catch { console.log(`Open: ${authorizeUrl}\n`); }
  console.log("Waiting for callback...");
});
