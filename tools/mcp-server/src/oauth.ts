import { createHmac, randomBytes } from "node:crypto";

export interface OAuthCredentials {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  tokenSecret: string;
}

function percentEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A");
}

function generateNonce(): string {
  return randomBytes(16).toString("hex");
}

function generateSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${percentEncode(key)}=${percentEncode(params[key])}`)
    .join("&");

  const baseString = `${method}&${percentEncode(url)}&${percentEncode(sortedParams)}`;
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;

  return createHmac("sha1", signingKey).update(baseString).digest("base64");
}

export function createAuthHeader(
  method: string,
  url: string,
  credentials: OAuthCredentials,
  requestParams: Record<string, string> = {}
): string {
  const urlObj = new URL(url);
  const baseUrl = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;

  const queryParams: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: credentials.consumerKey,
    oauth_nonce: generateNonce(),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: "1.0",
    oauth_token: credentials.accessToken,
  };

  const allParams = { ...oauthParams, ...requestParams, ...queryParams };

  oauthParams.oauth_signature = generateSignature(
    method,
    baseUrl,
    allParams,
    credentials.consumerSecret,
    credentials.tokenSecret
  );

  const authParams = Object.keys(oauthParams)
    .filter((key) => key.startsWith("oauth_"))
    .sort()
    .map((key) => `${percentEncode(key)}="${percentEncode(oauthParams[key])}"`)
    .join(", ");

  return `OAuth ${authParams}`;
}
