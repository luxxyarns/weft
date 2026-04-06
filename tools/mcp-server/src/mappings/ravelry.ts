// Ravelry → WEFT field mapping
// Derived from weft/01-about-weft/ravelry-mapping.md
// Types generated from WEFT JSON schemas (src/generated/)
// IDs are raw platform IDs — no synthetic prefixes.

import type { Material, Photo as MaterialPhoto, Pack, FiberContent, Quantity } from "../generated/material.js";
import type { Project, PatternRef, MaterialUsed, GaugeAchieved, Photo as ProjectPhoto } from "../generated/project.js";
import type { QueuedProject } from "../generated/queue.js";
import type { Favorite } from "../generated/favorite.js";
import type { Volume } from "../generated/library.js";
import type { Tool } from "../generated/tool.js";
import type { Shop } from "../generated/shop.js";
import type { Designer } from "../generated/designer.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rawId(id: number | string): string { return String(id); }

function parseDateTime(d: unknown): string | undefined {
  if (!d || typeof d !== "string") return undefined;
  const parsed = new Date(d.replace(/\//g, "-"));
  return isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

function parseDateOnly(d: unknown): string | undefined {
  if (!d || typeof d !== "string") return undefined;
  const m = d.match(/(\d{4})[/-](\d{2})[/-](\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : undefined;
}

function toNum(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

const MATERIAL_STATUS: Record<number, Material["status"]> = {
  1: "in-stash", 2: "used-up", 3: "sold", 4: "sold", 5: "in-use",
};

const PROJECT_STATUS: Record<string, Project["status"]> = {
  "In progress": "in-progress", "Finished": "finished",
  "Hibernating": "hibernating", "Frogged": "frogged", "Planning": "planned",
};

const CRAFT_MAP: Record<string, Project["craft"]> = {
  knitting: "knitting", crochet: "crochet", "machine-knitting": "machine-knitting",
  "loom-knitting": "loom-knitting", weaving: "weaving", spinning: "spinning",
  sewing: "sewing", quilting: "quilting", embroidery: "embroidery",
  "cross-stitch": "cross-stitch", macrame: "macrame", dyeing: "dyeing",
  tatting: "tatting", felting: "felting",
};

const FAV_TYPE: Record<string, string> = {
  project: "project", pattern: "pattern", yarn: "yarn", stash: "stash",
  designer: "designer", yarnshop: "shop", bundle: "bundle", forumpost: "forum-post",
};

const VOL_STATUS: Record<number, string> = {
  1: "owned", 2: "for-sale", 3: "for-trade", 4: "for-sale-or-trade",
};

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

function mapPhoto(photo: any, isFirst = false): MaterialPhoto | undefined {
  if (!photo) return undefined;
  const uri = photo.large_url || photo.medium2_url || photo.medium_url || photo.small2_url || photo.small_url;
  if (!uri) return undefined;
  const p: MaterialPhoto = { uri };
  if (photo.id) p.id = rawId(photo.id);
  if (photo.sort_order != null) p.sort_order = photo.sort_order;
  if (isFirst) p.is_primary = true;
  if (photo.caption) p.caption = photo.caption;
  if (photo.copyright_holder) p.copyright_holder = photo.copyright_holder;
  if (photo.aspect_ratio != null) p.aspect_ratio = photo.aspect_ratio;
  return p;
}

function mapPhotos(photos: any[] | undefined, firstPhoto?: any): MaterialPhoto[] {
  if (!photos?.length) {
    const p = firstPhoto ? mapPhoto(firstPhoto, true) : undefined;
    return p ? [p] : [];
  }
  return photos.map((p, i) => mapPhoto(p, i === 0)).filter((p): p is MaterialPhoto => !!p);
}

// ---------------------------------------------------------------------------
// Fiber content
// ---------------------------------------------------------------------------

function mapFiberContent(yarn: any): FiberContent[] | undefined {
  const fibers = yarn?.yarn_fibers || yarn?.fiber_types;
  if (!fibers?.length) return undefined;
  return fibers.map((f: any): FiberContent => {
    const fc: FiberContent = {};
    const name = f.fiber_type?.name || f.name;
    if (name) fc.fiber = name.toLowerCase();
    if (f.percentage != null) fc.percentage = f.percentage;
    if (f.fiber_type?.animal_fiber) fc.fiber_origin = "animal";
    else if (f.fiber_type?.synthetic) fc.fiber_origin = "synthetic";
    else if (f.fiber_type?.vegetable_fiber) fc.fiber_origin = "plant";
    return fc;
  });
}

// ---------------------------------------------------------------------------
// Material (stash) — 02-material
// ---------------------------------------------------------------------------

function mapPack(pack: any): Pack {
  const p: Pack = {};
  if (pack.id) p.id = rawId(pack.id);

  const q: Quantity = {};
  if (pack.skeins) { q.units_count = Number(pack.skeins); q.unit_label = "skein"; }
  if (pack.total_grams != null) q.weight_grams = pack.total_grams;
  if (pack.total_ounces != null) q.weight_ounces = pack.total_ounces;
  if (pack.total_yards != null) {
    q.length_yards = pack.total_yards;
    q.length_meters = Math.round(pack.total_yards * 0.9144 * 100) / 100;
  }
  if (Object.keys(q).length) p.quantity = q;

  const ypu = pack.yards_per_skein || pack.yards_per_unit;
  if (pack.grams_per_skein || pack.grams_per_unit) p.weight_per_unit_grams = pack.grams_per_skein || pack.grams_per_unit;
  if (ypu) { p.length_per_unit_yards = ypu; p.length_per_unit_meters = Math.round(ypu * 0.9144 * 100) / 100; }
  if (pack.colorway) p.colorway = pack.colorway;
  if (pack.dye_lot) p.dye_lot = pack.dye_lot;
  if (pack.yarn_id) p.product_id = rawId(pack.yarn_id);
  if (pack.yarn_name) p.product_name = pack.yarn_name;
  if (pack.personal_name) p.personal_name = pack.personal_name;
  if (pack.purchased_date) p.acquired_date = parseDateOnly(pack.purchased_date);
  if (pack.shop_name) p.acquired_from = pack.shop_name;
  if (pack.total_paid != null) p.acquired_price = { amount: pack.total_paid, currency: pack.total_paid_currency || "USD" };
  if (pack.project_id) p.project_id = rawId(pack.project_id);
  if (pack.primary_pack_id) p.source_pack_id = rawId(pack.primary_pack_id);
  return p;
}

export function mapStashToMaterial(stash: any): Material {
  const yarn = stash.yarn;
  const packs: Pack[] = stash.packs?.map(mapPack) ?? [];
  const totalGrams = packs.reduce((s, p) => s + (p.quantity?.weight_grams ?? 0), 0) || stash.total_grams;
  const totalYards = packs.reduce((s, p) => s + (p.quantity?.length_yards ?? 0), 0) || stash.total_yards;

  const m: Material = {
    id: rawId(stash.id),
    name: stash.name || (yarn ? `${yarn.yarn_company_name ?? ""} ${yarn.name ?? ""}`.trim() : `Stash #${stash.id}`),
    material_type: "yarn",
    status: MATERIAL_STATUS[stash.stash_status?.id] ?? "in-stash",
    external_ids: { ravelry: rawId(stash.id) },
  };

  const qty: Quantity = {};
  const totalUnits = packs.reduce((s, p) => s + (p.quantity?.units_count ?? 0), 0);
  if (totalUnits) { qty.units_count = totalUnits; qty.unit_label = "skein"; }
  if (totalGrams) qty.weight_grams = totalGrams;
  if (totalYards) { qty.length_yards = totalYards; qty.length_meters = Math.round(totalYards * 0.9144 * 100) / 100; }
  if (Object.keys(qty).length) m.quantity = qty;

  if (yarn?.yarn_company_name) m.brand = yarn.yarn_company_name;
  if (yarn?.name) m.product_line = yarn.name;
  if (yarn?.id) m.product_ref = { product_id: rawId(yarn.id) };
  const fc = mapFiberContent(yarn);
  if (fc) m.fiber_content = fc;
  if (stash.color_family_name) m.color_family = stash.color_family_name.toLowerCase();
  if (stash.colorway_name || stash.colorway) m.colorway = stash.colorway_name || stash.colorway;
  if (stash.handspun) m.is_handmade = true;
  if (yarn?.machine_washable) m.care = ["machine-wash"];
  if (stash.notes) m.notes = stash.notes;
  if (stash.tag_names?.length) m.tags = stash.tag_names;
  if (stash.location) m.location = stash.location;
  if (stash.created_at) m.created_at = parseDateTime(stash.created_at);
  if (stash.updated_at) m.updated_at = parseDateTime(stash.updated_at);
  const photos = mapPhotos(stash.photos, stash.first_photo);
  if (photos.length) m.photos = photos;

  // Yarn block
  if (yarn) {
    const yb: NonNullable<Material["yarn"]> = {};
    if (yarn.yarn_weight?.name) yb.weight_category = yarn.yarn_weight.name.toLowerCase();
    if (stash.yarn_weight_name) yb.weight_name = stash.yarn_weight_name;
    if (stash.long_yarn_weight_name) yb.weight_name_long = stash.long_yarn_weight_name;
    if (yarn.yarn_weight?.ply || yarn.ply) yb.ply = yarn.yarn_weight?.ply || yarn.ply;
    if (yarn.wpi) yb.wraps_per_inch = yarn.wpi;
    if (yarn.min_needle_size != null) yb.recommended_needle_mm = [yarn.min_needle_size, yarn.max_needle_size].filter((v: unknown): v is number => v != null) as number[];
    if (yarn.min_hook_size != null) yb.recommended_hook_mm = [yarn.min_hook_size, yarn.max_hook_size].filter((v: unknown): v is number => v != null) as number[];
    if (yarn.min_gauge != null) yb.gauge = { stitches_per_unit: (yarn.min_gauge + (yarn.max_gauge ?? yarn.min_gauge)) / 2, unit: yarn.gauge_divisor ? `${yarn.gauge_divisor}in` : "4in" };
    if (yarn.texture) yb.texture = yarn.texture;
    if (Object.keys(yb).length) m.yarn = yb;
  }

  if (packs.length) m.packs = packs;

  const rav: Record<string, unknown> = {};
  if (stash.permalink) rav.permalink = stash.permalink;
  if (stash.user?.username) rav.username = stash.user.username;
  if (stash.comments_count != null) rav.comments_count = stash.comments_count;
  if (stash.favorites_count != null) rav.favorites_count = stash.favorites_count;
  if (Object.keys(rav).length) (m as any).ravelry = rav;

  return m;
}

// ---------------------------------------------------------------------------
// Fiber Stash → Material (roving)
// ---------------------------------------------------------------------------

export function mapFiberStashToMaterial(fiber: any): Material {
  const m: Material = {
    id: rawId(fiber.id),
    name: fiber.name || fiber.long_name || `Fiber #${fiber.id}`,
    material_type: "roving",
    status: MATERIAL_STATUS[fiber.stash_status?.id] ?? "in-stash",
    external_ids: { ravelry: rawId(fiber.id) },
  };
  if (fiber.fiber_company_name) m.brand = fiber.fiber_company_name;
  if (fiber.notes) m.notes = fiber.notes;
  if (fiber.location) m.location = fiber.location;
  const photos = mapPhotos(fiber.photos, fiber.first_photo);
  if (photos.length) m.photos = photos;
  return m;
}

// ---------------------------------------------------------------------------
// Project — 03-project
// ---------------------------------------------------------------------------

export function mapProjectToWeft(project: any): Project {
  const craftRaw = (project.craft?.permalink || project.craft_name || "").toLowerCase();
  const p: Project = {
    id: rawId(project.id),
    name: project.name,
    craft: CRAFT_MAP[craftRaw] ?? "other",
    status: PROJECT_STATUS[project.status_name] ?? "other",
    external_ids: { ravelry: rawId(project.id) },
  };

  if (project.progress != null) p.progress_percent = project.progress;
  if (project.started) p.started_at = parseDateOnly(project.started);
  if (project.completed) p.completed_at = parseDateOnly(project.completed);
  if (project.project_status_changed) p.status_changed_at = parseDateTime(project.project_status_changed);
  if (project.size) p.size_made = project.size;
  if (project.made_for) p.made_for = project.made_for;

  if (project.pattern_id) {
    const ref: PatternRef = { id: rawId(project.pattern_id) };
    if (project.pattern_name) ref.name = project.pattern_name;
    if (project.pattern?.designer?.name) ref.designer = project.pattern.designer.name;
    p.pattern_ref = ref;
  }

  if (project.notes) p.notes = project.notes;
  if (project.private_notes) p.private_notes = project.private_notes;
  if (project.tag_names?.length) p.tags = project.tag_names;
  if (project.rating != null) p.rating = project.rating;
  if (project.happiness != null) p.happiness = project.happiness;

  const photos = mapPhotos(project.photos, project.first_photo);
  if (photos.length) p.photos = photos as ProjectPhoto[];

  if (project.packs?.length) {
    p.materials_used = project.packs.map((pk: any): MaterialUsed => {
      const mu: MaterialUsed = {};
      if (pk.stash_id) mu.material_id = rawId(pk.stash_id);
      if (pk.id) mu.pack_id = rawId(pk.id);
      if (pk.yarn_name || pk.yarn?.name) mu.name = pk.yarn_name || pk.yarn.name;
      if (pk.yarn?.yarn_company_name) mu.brand = pk.yarn.yarn_company_name;
      if (pk.colorway) mu.colorway = pk.colorway;
      if (pk.yarn?.yarn_weight?.name) mu.weight_category = pk.yarn.yarn_weight.name.toLowerCase();
      const q: any = {};
      if (pk.skeins) { q.value = Number(pk.skeins); q.unit = "skein"; }
      if (pk.total_grams != null) q.weight_grams = pk.total_grams;
      if (pk.total_yards != null) q.length_meters = Math.round(pk.total_yards * 0.9144 * 100) / 100;
      if (Object.keys(q).length) mu.quantity_used = q;
      return mu;
    });
  }

  if (project.gauge != null) {
    const g: GaugeAchieved = {};
    const spu = toNum(project.gauge);
    if (spu != null) g.stitches_per_unit = spu;
    const rpu = toNum(project.row_gauge);
    if (rpu != null) g.rows_per_unit = rpu;
    g.unit = project.gauge_divisor ? `${project.gauge_divisor}in` : "4in";
    if (project.gauge_pattern) g.gauge_pattern = project.gauge_pattern;
    if (Object.keys(g).length > 1) p.gauge = g;
  }

  const rav: Record<string, unknown> = {};
  if (project.permalink) rav.permalink = project.permalink;
  if (project.user?.username) rav.username = project.user.username;
  if (project.comments_count != null) rav.comments_count = project.comments_count;
  if (project.favorites_count != null) rav.favorites_count = project.favorites_count;
  if (Object.keys(rav).length) (p as any).ravelry = rav;

  return p;
}

// ---------------------------------------------------------------------------
// Queue — 08-queue
// ---------------------------------------------------------------------------

export function mapQueueToWeft(q: any): QueuedProject {
  const r: QueuedProject = { id: rawId(q.id), external_ids: { ravelry: rawId(q.id) } };
  if (q.position != null) r.position = q.position;
  if (q.name || q.pattern_name) r.name = q.name || q.pattern_name;
  if (q.pattern_id) {
    const ref: any = { id: rawId(q.pattern_id) };
    if (q.pattern_name || q.pattern?.name) ref.name = q.pattern_name || q.pattern.name;
    r.pattern_ref = ref;
  }
  if (q.notes) r.notes = q.notes;
  if (q.queued_on || q.created_at) r.queued_at = parseDateTime(q.queued_on || q.created_at);
  if (q.start_on) r.start_by = parseDateOnly(q.start_on);
  if (q.finish_by) r.finish_by = parseDateOnly(q.finish_by);
  if (q.tag_names?.length) r.tags = q.tag_names;
  const photos = mapPhotos(q.photos, q.first_photo);
  if (photos.length) r.photos = photos;
  return r;
}

// ---------------------------------------------------------------------------
// Favorite — 09-favorite
// ---------------------------------------------------------------------------

export function mapFavoriteToWeft(bookmark: any): Favorite {
  const type = FAV_TYPE[bookmark.type] || bookmark.type;
  const fav = bookmark.favorited || bookmark.favorited_item;
  const r: Favorite = { id: rawId(bookmark.id), type, external_ids: { ravelry: rawId(bookmark.id) } };
  if (fav?.id) r.item_id = rawId(fav.id);
  if (fav?.name) r.item_name = fav.name;
  if (bookmark.comment) r.comment = bookmark.comment;
  if (bookmark.tag_list) r.tags = bookmark.tag_list.split(/\s+/).filter(Boolean);
  if (bookmark.created_at) r.favorited_at = parseDateTime(bookmark.created_at);
  return r;
}

export function mapBundleToWeft(bundle: any): Favorite {
  const r: Favorite = { id: rawId(bundle.id), type: "bundle", external_ids: { ravelry: rawId(bundle.id) } };
  if (bundle.name) r.name = bundle.name;
  if (bundle.description) r.description = bundle.description;
  if (bundle.privacy) r.privacy = bundle.privacy;
  const cover = mapPhoto(bundle.first_photo, true);
  if (cover) r.cover_photo = cover;
  if (bundle.bundled_items?.length) {
    r.items = bundle.bundled_items.map((item: any) => ({
      ...(item.bookmark?.id ? { favorite_id: rawId(item.bookmark.id) } : {}),
      item_type: FAV_TYPE[item.item_type] || item.item_type,
      ...(item.item_id ? { item_id: rawId(item.item_id) } : {}),
      ...(item.bundled_object?.name ? { item_name: item.bundled_object.name } : {}),
    }));
  }
  return r;
}

// ---------------------------------------------------------------------------
// Library — 11-library
// ---------------------------------------------------------------------------

export function mapVolumeToWeft(volume: any): Volume {
  const src = volume.pattern_source;
  const r: Volume = { id: rawId(volume.id), title: volume.title, external_ids: { ravelry: rawId(volume.id) } };
  if (volume.author_name) r.author_name = volume.author_name;
  if (src?.pattern_source_type?.name) r.source_type = src.pattern_source_type.name.toLowerCase();
  if (volume.cover_image_url) r.cover_image = { uri: volume.cover_image_url };
  if (volume.notes) r.notes = volume.notes;
  if (volume.volume_status_id && VOL_STATUS[volume.volume_status_id]) r.status = VOL_STATUS[volume.volume_status_id] as any;
  if (src?.isbn_13) r.isbn = src.isbn_13;
  if (src?.publication_date) r.publication_date = parseDateOnly(src.publication_date);
  if (src?.patterns?.length) r.patterns = src.patterns.map((p: any) => ({ id: rawId(p.id), name: p.name }));
  return r;
}

// ---------------------------------------------------------------------------
// Tool — 05-tool
// ---------------------------------------------------------------------------

export function mapNeedleToWeft(needle: any): Tool {
  const r: Tool = {
    id: rawId(needle.id),
    category: needle.hook ? "hook" : "needle",
    tool_type: needle.hook ? "crochet-hook" : (needle.type_name?.toLowerCase() || "straight"),
    external_ids: { ravelry: rawId(needle.id) },
  };
  if (needle.metric != null) r.metric_size_mm = needle.metric;
  if (needle.us) r.us_size = needle.us;
  if (needle.name) r.name = needle.name;
  return r;
}

// ---------------------------------------------------------------------------
// Pattern — 06-pattern
// ---------------------------------------------------------------------------

export function mapPatternToWeft(pattern: any): any {
  const craftRaw = (pattern.craft?.permalink || "").toLowerCase();
  const r: any = { id: rawId(pattern.id), name: pattern.name, external_ids: { ravelry: rawId(pattern.id) } };
  if (pattern.pattern_author) r.designer = { name: pattern.pattern_author.name, id: rawId(pattern.pattern_author.id) };
  if (CRAFT_MAP[craftRaw]) r.craft = [CRAFT_MAP[craftRaw]];
  if (pattern.difficulty_average) r.difficulty = Math.round(pattern.difficulty_average);
  if (pattern.published) r.published_date = parseDateOnly(pattern.published);
  if (pattern.free != null) r.is_free = pattern.free;
  if (pattern.price) r.price = { amount: parseFloat(pattern.price), currency: pattern.currency || "USD" };
  if (pattern.notes) r.notes = pattern.notes;
  const photos = mapPhotos(pattern.photos, pattern.first_photo);
  if (photos.length) r.photos = photos;
  return r;
}

// ---------------------------------------------------------------------------
// Designer — 13-designer
// ---------------------------------------------------------------------------

export function mapDesignerToWeft(author: any): Designer {
  const r: Designer = { id: rawId(author.id), name: author.name, external_ids: { ravelry: rawId(author.id) } };
  if (author.notes) r.bio = author.notes;
  if (author.permalink) r.url = `https://www.ravelry.com/designers/${author.permalink}`;
  if (author.patterns_count != null) r.patterns_count = author.patterns_count;
  if (author.users?.[0]?.photo_url) r.photos = [{ uri: author.users[0].photo_url, is_primary: true }];
  return r;
}

// ---------------------------------------------------------------------------
// Shop — 12-shop
// ---------------------------------------------------------------------------

export function mapShopToWeft(shop: any): Shop {
  const r: Shop = { id: rawId(shop.id), name: shop.name, external_ids: { ravelry: rawId(shop.id) } };
  if (shop.shop_type_name) r.shop_type = shop.shop_type_name.toLowerCase();
  const addr: any = {};
  if (shop.address) addr.street = shop.address;
  if (shop.city) addr.city = shop.city;
  if (shop.state?.name || shop.state) addr.state = shop.state?.name || shop.state;
  if (shop.postal_code) addr.postal_code = shop.postal_code;
  if (shop.country?.name || shop.country) addr.country = shop.country?.name || shop.country;
  if (Object.keys(addr).length) r.address = addr;
  if (shop.latitude != null) r.geo = { latitude: shop.latitude, longitude: shop.longitude };
  if (shop.phone) r.phone = shop.phone;
  if (shop.url) r.url = shop.url;
  const amenities: string[] = [];
  if (shop.free_wifi) amenities.push("wifi");
  if (shop.parking) amenities.push("parking");
  if (shop.wheelchair_access) amenities.push("wheelchair-access");
  if (amenities.length) r.amenities = amenities;
  const photos = mapPhotos(shop.photos, shop.first_photo);
  if (photos.length) r.photos = photos;
  return r;
}
