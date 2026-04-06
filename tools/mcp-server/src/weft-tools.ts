// WEFT MCP tool definitions — full CRUD for all WEFT entities.
// All inputs and outputs are WEFT format. Ravelry is the backing store.

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
import {
  reverseMapMaterial, reverseMapProject,
  reverseMapQueueItem, reverseMapTool,
} from "./reverse-mappings.js";

const SCHEMA_BASE = "https://github.com/luxxyarns/weft/blob/main";

function weftEnvelope(type: string, items: any[]): any {
  return {
    $schema: `${SCHEMA_BASE}/${type}.schema.json`,
    weft_version: "1.0",
    type,
    profile: "ravelry",
    exported_at: new Date().toISOString(),
    exported_from: { app: "mcp-weft", version: "2.0.0" },
    items,
  };
}

function weftSingle(type: string, item: any): any {
  return {
    $schema: `${SCHEMA_BASE}/${type}.schema.json`,
    weft_version: "1.0",
    type,
    profile: "ravelry",
    exported_at: new Date().toISOString(),
    exported_from: { app: "mcp-weft", version: "2.0.0" },
    item,
  };
}

function ok(data: any): any {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function msg(text: string): any {
  return { content: [{ type: "text", text }] };
}

const STATUS_NAMES: Record<string, string> = {
  "in-progress": "In progress", finished: "Finished",
  hibernating: "Hibernating", frogged: "Frogged", planned: "Planning",
};

export type CredentialsResolver = (authInfo?: any) => OAuthCredentials;
export type UsernameResolver = (authInfo?: any) => Promise<string>;

export function registerWeftTools(
  server: McpServer,
  resolveCredentials: CredentialsResolver,
  resolveUsername: UsernameResolver
) {
  function client(authInfo?: any): RavelryClient {
    return new RavelryClient(resolveCredentials(authInfo));
  }

  // =========================================================================
  // MATERIALS (Stash)
  // =========================================================================

  server.tool("list_materials", "List your yarn stash as WEFT materials", {
    page: z.number().optional().describe("Page number (default 1)"),
    page_size: z.number().optional().describe("Items per page (default 100, max 100)"),
  }, async ({ page, page_size }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const params: Record<string, string> = { include: "yarn photos" };
    if (page) params.page = String(page);
    if (page_size) params.page_size = String(page_size);
    const data = await c.get<any>(`/people/${u}/stash/list.json`, params);
    const items = (data.stash || []).map(mapStashToMaterial);
    return ok({ ...weftEnvelope("material", items), paginator: data.paginator });
  });

  server.tool("get_material", "Get a single stash item as WEFT material", {
    id: z.string().describe("Stash item ID"),
  }, async ({ id }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const data = await c.get<any>(`/people/${u}/stash/${id}.json`, { include: "yarn photos" });
    return ok(weftSingle("material", mapStashToMaterial(data.stash)));
  });

  server.tool("create_material", "Create a new stash item from WEFT material", {
    material: z.string().describe("WEFT material JSON"),
  }, async ({ material }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const weft = JSON.parse(material);
    const body = reverseMapMaterial(weft);
    const data = await c.post<any>(`/people/${u}/stash/create.json`, body);
    return ok(weftSingle("material", mapStashToMaterial(data.stash)));
  });

  server.tool("update_material", "Update a stash item from WEFT material", {
    id: z.string().describe("Stash item ID"),
    material: z.string().describe("WEFT material JSON (partial update)"),
  }, async ({ id, material }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const weft = JSON.parse(material);
    const body = reverseMapMaterial(weft);
    const data = await c.post<any>(`/people/${u}/stash/${id}/update.json`, body);
    return ok(weftSingle("material", mapStashToMaterial(data.stash)));
  });

  server.tool("delete_material", "Delete a stash item", {
    id: z.string().describe("Stash item ID"),
  }, async ({ id }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    await c.delete(`/people/${u}/stash/${id}.json`);
    return msg(`Deleted material ${id}`);
  });

  // =========================================================================
  // PROJECTS
  // =========================================================================

  server.tool("list_projects", "List your projects as WEFT", {
    status: z.string().optional().describe("Filter: in-progress, finished, hibernating, frogged, planned"),
    page: z.number().optional().describe("Page number"),
    page_size: z.number().optional().describe("Items per page (max 100)"),
  }, async ({ status, page, page_size }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const params: Record<string, string> = { include: "pattern photos", sort: "status" };
    if (status && STATUS_NAMES[status]) params.status = STATUS_NAMES[status];
    if (page) params.page = String(page);
    if (page_size) params.page_size = String(page_size);
    const data = await c.get<any>(`/people/${u}/projects/list.json`, params);
    const items = (data.projects || []).map(mapProjectToWeft);
    return ok({ ...weftEnvelope("project", items), paginator: data.paginator });
  });

  server.tool("get_project", "Get a single project as WEFT", {
    id: z.string().describe("Project ID"),
  }, async ({ id }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const data = await c.get<any>(`/people/${u}/projects/${id}.json`, { include: "pattern photos" });
    return ok(weftSingle("project", mapProjectToWeft(data.project)));
  });

  server.tool("create_project", "Create a project from WEFT", {
    project: z.string().describe("WEFT project JSON"),
  }, async ({ project }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const weft = JSON.parse(project);
    const body = reverseMapProject(weft);
    const data = await c.post<any>(`/people/${u}/projects/create.json`, body);
    return ok(weftSingle("project", mapProjectToWeft(data.project)));
  });

  server.tool("update_project", "Update a project from WEFT", {
    id: z.string().describe("Project ID"),
    project: z.string().describe("WEFT project JSON (partial update)"),
  }, async ({ id, project }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const weft = JSON.parse(project);
    const body = reverseMapProject(weft);
    const data = await c.post<any>(`/people/${u}/projects/${id}/update.json`, body);
    return ok(weftSingle("project", mapProjectToWeft(data.project)));
  });

  server.tool("delete_project", "Delete a project", {
    id: z.string().describe("Project ID"),
  }, async ({ id }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    await c.delete(`/people/${u}/projects/${id}.json`);
    return msg(`Deleted project ${id}`);
  });

  // =========================================================================
  // QUEUE
  // =========================================================================

  server.tool("list_queue", "List your queue as WEFT", {
    page: z.number().optional().describe("Page number"),
    page_size: z.number().optional().describe("Items per page (max 100)"),
  }, async ({ page, page_size }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const params: Record<string, string> = { include: "pattern photos" };
    if (page) params.page = String(page);
    if (page_size) params.page_size = String(page_size);
    const data = await c.get<any>(`/people/${u}/queue/list.json`, params);
    const items = (data.queued_projects || []).map(mapQueueToWeft);
    return ok({ ...weftEnvelope("queue", items), paginator: data.paginator });
  });

  server.tool("get_queue_item", "Get a single queue item as WEFT", {
    id: z.string().describe("Queue item ID"),
  }, async ({ id }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const data = await c.get<any>(`/people/${u}/queue/${id}.json`, { include: "pattern photos" });
    return ok(weftSingle("queue", mapQueueToWeft(data.queued_project)));
  });

  server.tool("create_queue_item", "Add a pattern to your queue from WEFT", {
    queue_item: z.string().describe("WEFT queue item JSON"),
  }, async ({ queue_item }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const weft = JSON.parse(queue_item);
    const body = reverseMapQueueItem(weft);
    const data = await c.post<any>(`/people/${u}/queue/create.json`, body);
    return ok(weftSingle("queue", mapQueueToWeft(data.queued_project)));
  });

  server.tool("update_queue_item", "Update a queue item from WEFT", {
    id: z.string().describe("Queue item ID"),
    queue_item: z.string().describe("WEFT queue item JSON (partial update)"),
  }, async ({ id, queue_item }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const weft = JSON.parse(queue_item);
    const body = reverseMapQueueItem(weft);
    const data = await c.post<any>(`/people/${u}/queue/${id}/update.json`, body);
    return ok(weftSingle("queue", mapQueueToWeft(data.queued_project)));
  });

  server.tool("delete_queue_item", "Remove item from queue", {
    id: z.string().describe("Queue item ID"),
  }, async ({ id }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    await c.delete(`/people/${u}/queue/${id}.json`);
    return msg(`Deleted queue item ${id}`);
  });

  // =========================================================================
  // FAVORITES
  // =========================================================================

  server.tool("list_favorites", "List your favorites as WEFT", {
    type: z.string().optional().describe("Filter by type: pattern, yarn, project, designer, shop, bundle"),
    page: z.number().optional().describe("Page number"),
    page_size: z.number().optional().describe("Items per page (max 100)"),
  }, async ({ type, page, page_size }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const params: Record<string, string> = { include: "pattern photos" };
    if (type) params.type = type;
    if (page) params.page = String(page);
    if (page_size) params.page_size = String(page_size);
    const data = await c.get<any>(`/people/${u}/favorites/list.json`, params);
    const items = (data.favorites || []).map(mapFavoriteToWeft);
    return ok({ ...weftEnvelope("favorite", items), paginator: data.paginator });
  });

  server.tool("get_favorite", "Get a single favorite as WEFT", {
    id: z.string().describe("Favorite ID"),
  }, async ({ id }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const data = await c.get<any>(`/people/${u}/favorites/${id}.json`);
    return ok(weftSingle("favorite", mapFavoriteToWeft(data.favorite || data.bookmark)));
  });

  server.tool("create_favorite", "Favorite/bookmark an item", {
    type: z.string().describe("Item type: pattern, yarn, project, designer, shop"),
    item_id: z.string().describe("ID of the item to favorite"),
    comment: z.string().optional().describe("Optional comment"),
    tags: z.array(z.string()).optional().describe("Optional tags"),
  }, async ({ type, item_id, comment, tags }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const body: Record<string, any> = {
      bookmark: {
        type,
        favorited_id: Number(item_id),
      },
    };
    if (comment) body.bookmark.comment = comment;
    if (tags?.length) body.bookmark.tag_list = tags.join(" ");
    const data = await c.post<any>(`/people/${u}/favorites/create.json`, body);
    return ok(weftSingle("favorite", mapFavoriteToWeft(data.favorite || data.bookmark)));
  });

  server.tool("delete_favorite", "Remove a favorite/bookmark", {
    id: z.string().describe("Favorite ID"),
  }, async ({ id }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    await c.delete(`/people/${u}/favorites/${id}.json`);
    return msg(`Deleted favorite ${id}`);
  });

  // =========================================================================
  // LIBRARY (Volumes)
  // =========================================================================

  server.tool("list_library", "List your pattern library as WEFT", {
    page: z.number().optional().describe("Page number"),
    page_size: z.number().optional().describe("Items per page (max 100)"),
  }, async ({ page, page_size }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const params: Record<string, string> = {};
    if (page) params.page = String(page);
    if (page_size) params.page_size = String(page_size);
    const data = await c.get<any>(`/people/${u}/volumes/list.json`, params);
    const items = (data.volumes || []).map(mapVolumeToWeft);
    return ok({ ...weftEnvelope("library", items), paginator: data.paginator });
  });

  server.tool("get_volume", "Get a single library volume as WEFT", {
    id: z.string().describe("Volume ID"),
  }, async ({ id }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const data = await c.get<any>(`/people/${u}/volumes/${id}.json`);
    return ok(weftSingle("library", mapVolumeToWeft(data.volume)));
  });

  server.tool("create_volume", "Add a pattern source to your library", {
    pattern_source_id: z.string().describe("Ravelry pattern source ID"),
    notes: z.string().optional().describe("Optional notes"),
  }, async ({ pattern_source_id, notes }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const body: Record<string, any> = { volume: { pattern_source_id: Number(pattern_source_id) } };
    if (notes) body.volume.notes = notes;
    const data = await c.post<any>(`/people/${u}/volumes/create.json`, body);
    return ok(weftSingle("library", mapVolumeToWeft(data.volume)));
  });

  server.tool("delete_volume", "Remove a volume from your library", {
    id: z.string().describe("Volume ID"),
  }, async ({ id }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    await c.delete(`/people/${u}/volumes/${id}.json`);
    return msg(`Deleted volume ${id}`);
  });

  // =========================================================================
  // TOOLS (Needles/Hooks)
  // =========================================================================

  server.tool("list_tools", "List your needle/hook inventory as WEFT", {}, async (_args, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const data = await c.get<any>(`/people/${u}/needles/list.json`);
    const needles = Array.isArray(data.needles) ? data.needles : [];
    return ok(weftEnvelope("tool", needles.map(mapNeedleToWeft)));
  });

  server.tool("create_tool", "Add a needle or hook to your inventory from WEFT", {
    tool: z.string().describe("WEFT tool JSON"),
  }, async ({ tool }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const weft = JSON.parse(tool);
    const body = reverseMapTool(weft);
    const data = await c.post<any>(`/people/${u}/needles/create.json`, body);
    return ok(weftSingle("tool", mapNeedleToWeft(data.needle)));
  });

  server.tool("delete_tool", "Remove a needle/hook from your inventory", {
    id: z.string().describe("Tool ID"),
  }, async ({ id }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    await c.delete(`/people/${u}/needles/${id}.json`);
    return msg(`Deleted tool ${id}`);
  });

  // =========================================================================
  // PATTERNS (read-only — Ravelry patterns are not user-editable)
  // =========================================================================

  server.tool("search_patterns", "Search Ravelry patterns, returns WEFT", {
    query: z.string().optional().describe("Search query text"),
    craft: z.string().optional().describe("Filter: knitting, crochet, etc."),
    weight: z.string().optional().describe("Yarn weight filter: lace, fingering, sport, dk, worsted, aran, bulky, etc."),
    availability: z.string().optional().describe("Filter: free, online, ravelry, inprint"),
    designer: z.string().optional().describe("Designer name filter"),
    fit: z.string().optional().describe("Fit/category: adult, baby, child, etc."),
    page: z.number().optional().describe("Page number (default 1)"),
    page_size: z.number().optional().describe("Items per page (default 24, max 100)"),
    sort: z.string().optional().describe("Sort: best, hot, date, favorites, projects, rating, name"),
  }, async ({ query, craft, weight, availability, designer, fit, page, page_size, sort }, { authInfo }) => {
    const c = client(authInfo);
    const params: Record<string, string> = {};
    if (query) params.query = query;
    if (craft) params.craft = craft;
    if (weight) params.weight = weight;
    if (availability) params.availability = availability;
    if (designer) params.designer = designer;
    if (fit) params.fit = fit;
    if (page) params.page = String(page);
    if (page_size) params.page_size = String(page_size);
    if (sort) params.sort = sort;
    const data = await c.get<any>("/patterns/search.json", params);
    const items = (data.patterns || []).map(mapPatternToWeft);
    return ok({ ...weftEnvelope("pattern", items), paginator: data.paginator });
  });

  server.tool("get_pattern", "Get a single pattern as WEFT", {
    id: z.string().describe("Pattern ID"),
  }, async ({ id }, { authInfo }) => {
    const c = client(authInfo);
    const data = await c.get<any>(`/patterns/${id}.json`);
    return ok(weftSingle("pattern", mapPatternToWeft(data.pattern)));
  });

  // =========================================================================
  // DESIGNERS (read-only)
  // =========================================================================

  server.tool("search_designers", "Search Ravelry designers, returns WEFT", {
    query: z.string().describe("Search query"),
    page: z.number().optional().describe("Page number"),
    page_size: z.number().optional().describe("Items per page"),
  }, async ({ query, page, page_size }, { authInfo }) => {
    const c = client(authInfo);
    const params: Record<string, string> = { q: query };
    if (page) params.page = String(page);
    if (page_size) params.page_size = String(page_size);
    const data = await c.get<any>("/designers/search.json", params);
    const items = (data.designers || []).map(mapDesignerToWeft);
    return ok({ ...weftEnvelope("designer", items), paginator: data.paginator });
  });

  server.tool("get_designer", "Get a single designer as WEFT", {
    id: z.string().describe("Designer ID"),
  }, async ({ id }, { authInfo }) => {
    const c = client(authInfo);
    const data = await c.get<any>(`/designers/${id}.json`);
    return ok(weftSingle("designer", mapDesignerToWeft(data.designer || data.pattern_author)));
  });

  // =========================================================================
  // YARNS (read-only — product catalog)
  // =========================================================================

  server.tool("search_yarns", "Search Ravelry yarn database, returns WEFT materials (product type)", {
    query: z.string().optional().describe("Search query"),
    weight: z.string().optional().describe("Yarn weight: lace, fingering, sport, dk, worsted, aran, bulky"),
    fiber: z.string().optional().describe("Fiber content filter"),
    page: z.number().optional().describe("Page number"),
    page_size: z.number().optional().describe("Items per page"),
    sort: z.string().optional().describe("Sort: best, rating, projects, name"),
  }, async ({ query, weight, fiber, page, page_size, sort }, { authInfo }) => {
    const c = client(authInfo);
    const params: Record<string, string> = {};
    if (query) params.query = query;
    if (weight) params.weight = weight;
    if (fiber) params.fiber = fiber;
    if (page) params.page = String(page);
    if (page_size) params.page_size = String(page_size);
    if (sort) params.sort = sort;
    const data = await c.get<any>("/yarns/search.json", params);
    const items = (data.yarns || []).map(mapYarnToMaterial);
    return ok({ ...weftEnvelope("material", items), paginator: data.paginator });
  });

  server.tool("get_yarn", "Get a single yarn product as WEFT material", {
    id: z.string().describe("Yarn ID"),
  }, async ({ id }, { authInfo }) => {
    const c = client(authInfo);
    const data = await c.get<any>(`/yarns/${id}.json`);
    return ok(weftSingle("material", mapYarnToMaterial(data.yarn)));
  });

  // =========================================================================
  // SHOPS (read-only)
  // =========================================================================

  server.tool("search_shops", "Search yarn shops, returns WEFT", {
    query: z.string().optional().describe("Search query"),
    latitude: z.number().optional().describe("Latitude for geo search"),
    longitude: z.number().optional().describe("Longitude for geo search"),
    radius: z.number().optional().describe("Search radius in miles"),
    page: z.number().optional().describe("Page number"),
    page_size: z.number().optional().describe("Items per page"),
  }, async ({ query, latitude, longitude, radius, page, page_size }, { authInfo }) => {
    const c = client(authInfo);
    const params: Record<string, string> = {};
    if (query) params.query = query;
    if (latitude != null) params.lat = String(latitude);
    if (longitude != null) params.lng = String(longitude);
    if (radius != null) params.radius = String(radius);
    if (page) params.page = String(page);
    if (page_size) params.page_size = String(page_size);
    const data = await c.get<any>("/shops/search.json", params);
    const items = (data.shops || []).map(mapShopToWeft);
    return ok({ ...weftEnvelope("shop", items), paginator: data.paginator });
  });

  server.tool("get_shop", "Get a single shop as WEFT", {
    id: z.string().describe("Shop ID"),
  }, async ({ id }, { authInfo }) => {
    const c = client(authInfo);
    const data = await c.get<any>(`/shops/${id}.json`);
    return ok(weftSingle("shop", mapShopToWeft(data.shop)));
  });

  // =========================================================================
  // BUNDLES
  // =========================================================================

  server.tool("list_bundles", "List your bundles as WEFT favorites", {
    page: z.number().optional().describe("Page number"),
    page_size: z.number().optional().describe("Items per page"),
  }, async ({ page, page_size }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const params: Record<string, string> = {};
    if (page) params.page = String(page);
    if (page_size) params.page_size = String(page_size);
    const data = await c.get<any>(`/people/${u}/bundles/list.json`, params);
    const items = (data.bundles || []).map(mapBundleToWeft);
    return ok({ ...weftEnvelope("favorite", items), paginator: data.paginator });
  });

  server.tool("get_bundle", "Get a single bundle as WEFT", {
    id: z.string().describe("Bundle ID"),
  }, async ({ id }, { authInfo }) => {
    const c = client(authInfo); const u = await resolveUsername(authInfo);
    const data = await c.get<any>(`/people/${u}/bundles/${id}.json`);
    return ok(weftSingle("favorite", mapBundleToWeft(data.bundle)));
  });

  // =========================================================================
  // USER PROFILE
  // =========================================================================

  server.tool("get_current_user", "Get the current authenticated user", {}, async (_args, { authInfo }) => {
    const c = client(authInfo);
    const data = await c.get<any>("/current_user.json");
    const user = data.user;
    return ok({
      username: user.username,
      id: String(user.id),
      name: [user.first_name, user.last_name].filter(Boolean).join(" ") || undefined,
      location: user.location,
      about: user.about_me,
      photo: user.large_photo_url || user.photo_url,
      counts: {
        patterns: user.patterns_count,
        projects: user.projects_count,
        stash: user.stash_count,
        favorites: user.favorites_count,
      },
    });
  });

  // =========================================================================
  // EXPORT (WEFT bundle — legacy export_universe)
  // =========================================================================

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
      exported_from: { app: "mcp-weft", version: "2.0.0" },
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

// ---------------------------------------------------------------------------
// Yarn catalog → WEFT Material (product-style, not stash)
// ---------------------------------------------------------------------------

function mapYarnToMaterial(yarn: any): any {
  const m: any = {
    id: String(yarn.id),
    name: yarn.name ? `${yarn.yarn_company_name ?? ""} ${yarn.name}`.trim() : `Yarn #${yarn.id}`,
    material_type: "yarn",
    external_ids: { ravelry: String(yarn.id) },
  };

  if (yarn.yarn_company_name) m.brand = yarn.yarn_company_name;
  if (yarn.name) m.product_line = yarn.name;

  const yb: any = {};
  if (yarn.yarn_weight?.name) yb.weight_category = yarn.yarn_weight.name.toLowerCase();
  if (yarn.yarn_weight?.ply || yarn.ply) yb.ply = yarn.yarn_weight?.ply || yarn.ply;
  if (yarn.wpi) yb.wraps_per_inch = yarn.wpi;
  if (yarn.min_gauge != null) {
    yb.gauge = {
      stitches_per_unit: (yarn.min_gauge + (yarn.max_gauge ?? yarn.min_gauge)) / 2,
      unit: yarn.gauge_divisor ? `${yarn.gauge_divisor}in` : "4in",
    };
  }
  if (yarn.texture) yb.texture = yarn.texture;
  if (Object.keys(yb).length) m.yarn = yb;

  // Fiber content
  const fibers = yarn.yarn_fibers;
  if (fibers?.length) {
    m.fiber_content = fibers.map((f: any) => {
      const fc: any = {};
      const name = f.fiber_type?.name || f.name;
      if (name) fc.fiber = name.toLowerCase();
      if (f.percentage != null) fc.percentage = f.percentage;
      return fc;
    });
  }

  if (yarn.rating_average != null) m.community_rating = yarn.rating_average;
  if (yarn.rating_count != null) m.community_rating_count = yarn.rating_count;

  const photos: any[] = [];
  if (yarn.first_photo) {
    const uri = yarn.first_photo.large_url || yarn.first_photo.medium2_url || yarn.first_photo.medium_url;
    if (uri) photos.push({ uri, is_primary: true });
  }
  if (photos.length) m.photos = photos;

  return m;
}
