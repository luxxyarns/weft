// Shared WEFT MCP tool definitions
// Used by both local (stdio) and hosted (HTTP) modes.

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { RavelryClient } from "./ravelry-client.js";
import type { OAuthCredentials } from "./oauth.js";
import {
  mapStashToMaterial, mapFiberStashToMaterial,
  mapProjectToWeft, mapQueueToWeft, mapFavoriteToWeft,
  mapBundleToWeft, mapVolumeToWeft, mapNeedleToWeft,
  mapPatternToWeft, mapDesignerToWeft, mapShopToWeft,
} from "./mappings/ravelry.js";

const SCHEMA_BASE = "https://weft.dev/schemas/v1.0";

function weftEnvelope(type: string, items: any[], profile?: string): any {
  return {
    $schema: profile ? `${SCHEMA_BASE}/profiles/${profile}/${type}.schema.json` : `${SCHEMA_BASE}/${type}.schema.json`,
    weft_version: "1.0",
    type,
    ...(profile ? { profile } : {}),
    exported_at: new Date().toISOString(),
    exported_from: { app: "mcp-weft", version: "1.0.0" },
    items,
  };
}

const STATUS_NAMES: Record<string, string> = {
  "in-progress": "In progress", finished: "Finished",
  hibernating: "Hibernating", frogged: "Frogged", planned: "Planning",
};

export type CredentialsResolver = (authInfo?: any) => OAuthCredentials;
export type UsernameResolver = (authInfo?: any) => Promise<string>;

/**
 * Register all WEFT export tools on an MCP server.
 * `resolveCredentials` and `resolveUsername` are called per-request to get the right user context.
 */
export function registerTools(
  server: McpServer,
  resolveCredentials: CredentialsResolver,
  resolveUsername: UsernameResolver
) {
  function client(authInfo?: any): RavelryClient {
    return new RavelryClient(resolveCredentials(authInfo));
  }

  server.tool("export_stash", "Export your Ravelry yarn stash to WEFT format", {}, async (_args, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const items = await c.getAllPages(`/people/${u}/stash/list.json`, "stash", { include: "yarn photos" });
    return { content: [{ type: "text", text: JSON.stringify(weftEnvelope("material", items.map(mapStashToMaterial), "ravelry"), null, 2) }] };
  });

  server.tool("export_projects", "Export your Ravelry projects to WEFT format", {
    status: z.string().optional().describe("Filter: in-progress, finished, hibernating, frogged, planned"),
  }, async ({ status }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const all = await c.getAllPages(`/people/${u}/projects/list.json`, "projects", { include: "pattern photos", sort: "status" });
    const filtered = status ? all.filter((p: any) => p.status_name === STATUS_NAMES[status]) : all;
    return { content: [{ type: "text", text: JSON.stringify(weftEnvelope("project", filtered.map(mapProjectToWeft), "ravelry"), null, 2) }] };
  });

  server.tool("export_queue", "Export your Ravelry queue to WEFT format", {}, async (_args, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const items = await c.getAllPages(`/people/${u}/queue/list.json`, "queued_projects", { include: "pattern photos" });
    return { content: [{ type: "text", text: JSON.stringify(weftEnvelope("queue", items.map(mapQueueToWeft), "ravelry"), null, 2) }] };
  });

  server.tool("export_favorites", "Export your Ravelry favorites to WEFT format", {}, async (_args, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const items = await c.getAllPages(`/people/${u}/favorites/list.json`, "favorites", { include: "pattern photos" });
    return { content: [{ type: "text", text: JSON.stringify(weftEnvelope("favorite", items.map(mapFavoriteToWeft), "ravelry"), null, 2) }] };
  });

  server.tool("export_library", "Export your Ravelry pattern library to WEFT format", {}, async (_args, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const items = await c.getAllPages(`/people/${u}/volumes/list.json`, "volumes");
    return { content: [{ type: "text", text: JSON.stringify(weftEnvelope("library", items.map(mapVolumeToWeft), "ravelry"), null, 2) }] };
  });

  server.tool("export_needles", "Export your Ravelry needle/hook inventory to WEFT format", {}, async (_args, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const data = await c.get(`/people/${u}/needles/list.json`) as any;
    const needles = data.needles || data.hooks || [];
    return { content: [{ type: "text", text: JSON.stringify(weftEnvelope("tool", (Array.isArray(needles) ? needles : []).map(mapNeedleToWeft), "ravelry"), null, 2) }] };
  });

  server.tool("export_universe", "Export your entire Ravelry universe as a WEFT bundle", {}, async (_args, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const [stash, fiber, projects, queue, favorites, volumes, needlesData] = await Promise.all([
      c.getAllPages(`/people/${u}/stash/list.json`, "stash", { include: "yarn photos" }),
      c.getAllPages(`/people/${u}/fiber/list.json`, "fiber_stash", { include: "photos" }).catch(() => []),
      c.getAllPages(`/people/${u}/projects/list.json`, "projects", { include: "pattern photos" }),
      c.getAllPages(`/people/${u}/queue/list.json`, "queued_projects", { include: "pattern photos" }),
      c.getAllPages(`/people/${u}/favorites/list.json`, "favorites", { include: "pattern photos" }),
      c.getAllPages(`/people/${u}/volumes/list.json`, "volumes").catch(() => []),
      c.get(`/people/${u}/needles/list.json`).catch(() => ({})) as Promise<any>,
    ]);

    const bundle: any = {
      $schema: `${SCHEMA_BASE}/bundle.schema.json`,
      weft_version: "1.0", type: "bundle", profile: "ravelry",
      exported_at: new Date().toISOString(),
      exported_from: { app: "mcp-weft", version: "1.0.0" },
    };

    const materials = [...stash.map(mapStashToMaterial), ...fiber.map(mapFiberStashToMaterial)];
    if (materials.length) bundle.materials = materials;
    if (projects.length) bundle.projects = projects.map(mapProjectToWeft);
    if (queue.length) bundle.queue = queue.map(mapQueueToWeft);
    if (favorites.length) bundle.favorites = favorites.map(mapFavoriteToWeft);
    if (volumes.length) bundle.library = volumes.map(mapVolumeToWeft);
    const needles = Array.isArray(needlesData?.needles) ? needlesData.needles.map(mapNeedleToWeft) : [];
    if (needles.length) bundle.tools = needles;

    const summary = Object.entries(bundle)
      .filter(([, v]) => Array.isArray(v))
      .map(([k, v]) => `${k}: ${(v as any[]).length}`).join(", ");

    return { content: [
      { type: "text", text: `Exported: ${summary}` },
      { type: "text", text: JSON.stringify(bundle, null, 2) },
    ] };
  });
}
