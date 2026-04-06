// WEFT → Ravelry reverse mappings for create/update operations.
// Accepts WEFT-format objects and produces Ravelry API payloads.

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function metersToYards(m: number): number {
  return Math.round((m / 0.9144) * 100) / 100;
}

const REVERSE_PROJECT_STATUS: Record<string, number> = {
  "in-progress": 1, finished: 2, hibernating: 3, frogged: 4, planned: 5,
};

const REVERSE_CRAFT: Record<string, number> = {
  knitting: 1, crochet: 2, "machine-knitting": 3, "loom-knitting": 4,
  weaving: 5, spinning: 6,
};

const REVERSE_MATERIAL_STATUS: Record<string, number> = {
  "in-stash": 1, "used-up": 2, sold: 3, "in-use": 5,
};

// ---------------------------------------------------------------------------
// Stash (Material) — create/update
// ---------------------------------------------------------------------------

export function reverseMapMaterial(weft: any): Record<string, any> {
  const stash: Record<string, any> = {};

  if (weft.name) stash.name = weft.name;
  if (weft.status && REVERSE_MATERIAL_STATUS[weft.status]) {
    stash.stash_status_id = REVERSE_MATERIAL_STATUS[weft.status];
  }
  if (weft.notes) stash.notes = weft.notes;
  if (weft.location) stash.location = weft.location;
  if (weft.colorway) stash.colorway_name = weft.colorway;
  if (weft.color_family) stash.color_family_name = weft.color_family;
  if (weft.is_handmade != null) stash.handspun = weft.is_handmade;
  if (weft.tags?.length) stash.tag_names = weft.tags.join(" ");

  // Product reference
  if (weft.product_ref?.product_id) stash.yarn_id = Number(weft.product_ref.product_id);

  // Packs
  if (weft.packs?.length) {
    stash.packs = weft.packs.map(reverseMapPack);
  }

  return { stash };
}

function reverseMapPack(pack: any): Record<string, any> {
  const p: Record<string, any> = {};
  if (pack.colorway) p.colorway = pack.colorway;
  if (pack.dye_lot) p.dye_lot = pack.dye_lot;
  if (pack.personal_name) p.personal_name = pack.personal_name;
  if (pack.acquired_date) p.purchased_date = pack.acquired_date;
  if (pack.acquired_from) p.shop_name = pack.acquired_from;
  if (pack.product_id) p.yarn_id = Number(pack.product_id);

  if (pack.quantity) {
    if (pack.quantity.units_count != null) p.skeins = pack.quantity.units_count;
    if (pack.quantity.weight_grams != null) p.total_grams = pack.quantity.weight_grams;
    if (pack.quantity.length_yards != null) {
      p.total_yards = pack.quantity.length_yards;
    } else if (pack.quantity.length_meters != null) {
      p.total_yards = metersToYards(pack.quantity.length_meters);
    }
  }
  if (pack.weight_per_unit_grams) p.grams_per_skein = pack.weight_per_unit_grams;
  if (pack.length_per_unit_yards) p.yards_per_skein = pack.length_per_unit_yards;
  else if (pack.length_per_unit_meters) p.yards_per_skein = metersToYards(pack.length_per_unit_meters);

  if (pack.acquired_price) {
    p.total_paid = pack.acquired_price.amount;
    if (pack.acquired_price.currency) p.total_paid_currency = pack.acquired_price.currency;
  }

  return p;
}

// ---------------------------------------------------------------------------
// Project — create/update
// ---------------------------------------------------------------------------

export function reverseMapProject(weft: any): Record<string, any> {
  const project: Record<string, any> = {};

  if (weft.name) project.name = weft.name;
  if (weft.status && REVERSE_PROJECT_STATUS[weft.status]) {
    project.project_status_id = REVERSE_PROJECT_STATUS[weft.status];
  }
  if (weft.craft && REVERSE_CRAFT[weft.craft]) {
    project.craft_id = REVERSE_CRAFT[weft.craft];
  }
  if (weft.progress_percent != null) project.progress = weft.progress_percent;
  if (weft.started_at) project.started = weft.started_at;
  if (weft.completed_at) project.completed = weft.completed_at;
  if (weft.size_made) project.size = weft.size_made;
  if (weft.made_for) project.made_for = weft.made_for;
  if (weft.notes) project.notes = weft.notes;
  if (weft.private_notes) project.private_notes = weft.private_notes;
  if (weft.rating != null) project.rating = weft.rating;
  if (weft.happiness != null) project.happiness = weft.happiness;
  if (weft.tags?.length) project.tag_names = weft.tags.join(" ");

  if (weft.pattern_ref?.id) project.pattern_id = Number(weft.pattern_ref.id);

  // Gauge
  if (weft.gauge) {
    if (weft.gauge.stitches_per_unit != null) project.gauge = weft.gauge.stitches_per_unit;
    if (weft.gauge.rows_per_unit != null) project.row_gauge = weft.gauge.rows_per_unit;
    if (weft.gauge.gauge_pattern) project.gauge_pattern = weft.gauge.gauge_pattern;
  }

  return { project };
}

// ---------------------------------------------------------------------------
// Queue — create/update
// ---------------------------------------------------------------------------

export function reverseMapQueueItem(weft: any): Record<string, any> {
  const queued: Record<string, any> = {};

  if (weft.pattern_ref?.id) queued.pattern_id = Number(weft.pattern_ref.id);
  if (weft.name) queued.name = weft.name;
  if (weft.notes) queued.notes = weft.notes;
  if (weft.position != null) queued.position = weft.position;
  if (weft.start_by) queued.start_on = weft.start_by;
  if (weft.finish_by) queued.finish_by = weft.finish_by;
  if (weft.tags?.length) queued.tag_names = weft.tags.join(" ");

  return { queued_project: queued };
}

// ---------------------------------------------------------------------------
// Needle/Tool — create
// ---------------------------------------------------------------------------

export function reverseMapTool(weft: any): Record<string, any> {
  const needle: Record<string, any> = {};

  if (weft.category === "hook") needle.hook = true;
  if (weft.metric_size_mm != null) needle.metric = weft.metric_size_mm;
  if (weft.us_size) needle.us = weft.us_size;
  if (weft.name) needle.name = weft.name;
  if (weft.tool_type) needle.type_name = weft.tool_type;

  return { needle };
}
