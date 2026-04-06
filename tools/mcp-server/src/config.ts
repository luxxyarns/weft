// Load app config from apps.json
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export interface AppConfig {
  slug: string;
  name: string;
  consumerKey: string;
  consumerSecret: string;
}

export interface TokenConfig {
  accessToken: string;
  tokenSecret: string;
  username?: string;
}

interface AppsFile {
  apps: AppConfig[];
  tokens: Record<string, TokenConfig>;
}

let cached: AppsFile | null = null;

function load(): AppsFile {
  if (cached) return cached;
  const path = resolve(__dirname, "../apps.json");
  cached = JSON.parse(readFileSync(path, "utf-8")) as AppsFile;
  return cached;
}

export function getApp(slug: string): AppConfig {
  const app = load().apps.find((a) => a.slug === slug);
  if (!app) {
    const available = load().apps.map((a) => a.slug).join(", ");
    throw new Error(`Unknown app "${slug}". Available: ${available}`);
  }
  return app;
}

export function getTokens(slug: string): TokenConfig {
  const tokens = load().tokens[slug];
  if (!tokens) throw new Error(`No tokens configured for app "${slug}"`);
  return tokens;
}

export function listApps(): AppConfig[] {
  return load().apps;
}

export function getDefaultApp(): AppConfig {
  const apps = load().apps;
  if (apps.length === 0) throw new Error("No apps configured in apps.json");
  return apps[0];
}
