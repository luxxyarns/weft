# 01 — About WEFT

## What is WEFT?

WEFT (Widely Exchangeable Format for Textiles) is an open data format for textile and fiber crafts. It defines a common language for craft data — materials, projects, progress, tools, patterns — so that any app can export it and any app can import it.

## Core Principles

1. **Simple and human-readable** — JSON you can open in a text editor and understand
2. **Craft-agnostic** — knitting, crochet, weaving, sewing, spinning, embroidery — all equal
3. **Polymorphic** — a Material with `material_type: "yarn"` carries yarn-specific fields; `"fabric"` carries fabric-specific fields. Apps that don't know a type show the core fields.
4. **Shared taxonomies** — enum values (crafts, fibers, weights, statuses) are defined once in `99-taxonomy/` with translations in 12+ languages
5. **Offline-first** — self-contained files, no server needed
6. **Versioned** — every document declares `weft_version` for forward compatibility

## Entity Relationships

```
  Pattern (06)                        Product (10)
  designer instructions               what companies sell
       |                                    |
       | referenced by              referenced by
       v                                    v
  Project (03) ------uses------->  Material (02)
  what you're making               your inventory
       |            |
       | has        | uses
       v            v
  Progress (04)   Tool (05)
  row counters     needles/hooks/looms
       
  Annotation (07)
  PDF highlights ---- linked to ----> Pattern (06)
```

- **Material (02)** — your physical inventory. References a Product for manufacturer data.
- **Product (10)** — what companies sell: yarns, fabrics, notions. Has colorways.
- **Project (03)** — what you're making. References a Pattern, uses Materials and Tools.
- **Pattern (06)** — designer instructions. Referenced by Projects.
- **Progress (04)** — row counters, stitch trackers. Linked to a Project.
- **Tool (05)** — needles, hooks, looms, accessories. Used by Projects.
- **Annotation (07)** — PDF highlights, bookmarks, markers. Linked to a Pattern.

## Polymorphism

WEFT uses a type field to drive which additional attributes apply:

```
Material
├── material_type: "yarn"    → yarn-specific: weight, fiber, colorway, gauge
├── material_type: "fabric"  → fabric-specific: width, thread count, weave type
├── material_type: "thread"  → thread-specific: ply, strand count
├── material_type: "roving"  → roving-specific: fiber prep, micron count
└── material_type: "floss"   → floss-specific: brand number, strand count

Project
├── craft: "knitting"  → knitting-specific: needle sizes, construction, cast-on
├── craft: "crochet"   → crochet-specific: hook sizes, stitch types
├── craft: "weaving"   → weaving-specific: loom type, sett, draft
└── craft: "sewing"    → sewing-specific: pattern pieces, seam allowance
```

An app that only knows yarn can read a `.weft` file containing fabric entries — it shows the core fields (name, quantity, status) and skips the fabric-specific fields. No crash, no data loss.

## File Format

- File extension: `.weft`
- MIME type: `application/vnd.weft+json`
- Encoding: UTF-8

Single entity type:

```json
{
  "weft_version": "1.0",
  "type": "material",
  "exported_at": "2026-04-04T18:00:00Z",
  "exported_from": { "app": "stash2go", "version": "1.23" },
  "items": [ ... ]
}
```

## Bundle Format

A bundle combines multiple entity types in a single file. Use `"type": "bundle"` and include each entity type as a named array:

```json
{
  "weft_version": "1.0",
  "type": "bundle",
  "exported_at": "2026-04-04T18:00:00Z",
  "exported_from": { "app": "stash2go", "version": "1.23" },
  "materials": [ ... ],
  "projects": [ ... ],
  "progress": [ ... ],
  "tools": [ ... ],
  "patterns": [ ... ],
  "annotations": [ ... ],
  "products": [ ... ]
}
```

All arrays are optional. Include only the entity types being exported. Cross-references between entities use `id` fields within the bundle.

## Import/Export Rules

1. **Preserve unknown fields** — when importing and re-exporting, any fields your app does not recognize MUST be kept intact. Never strip data you don't understand.
2. **Preserve unknown type blocks** — if a Material contains `roving: { ... }` and your app only knows yarn, keep the roving block unchanged on re-export.
3. **IDs are app-generated** — IDs are local to the exporting app, not globally unique. The importing app MAY remap IDs and MUST update all internal cross-references when doing so.
4. **Dates use ISO 8601** — date-only fields use `YYYY-MM-DD`; datetime fields use full ISO 8601 with timezone (e.g., `2026-04-04T18:00:00Z`).
5. **Photos are URI references** — images are never embedded in the JSON. Use relative paths (`photos/yarn-001.jpg`) or URLs (`https://...`). The app resolves them.
6. **Encoding is always UTF-8** — no BOM, no exceptions.
7. **Enum values use hyphens** — all taxonomy keys use hyphens as word separators: `in-progress`, `in-stash`, `machine-knitting`, `cross-stitch`. Never underscores for enum values.

## External Platform Identity

Entities can carry an `external_ids` map for platform-specific identifiers:

```json
{
  "external_ids": {
    "ravelry": "12345",
    "knitcompanion": "abc-def"
  }
}
```

**Convention**: keys are lowercase platform names, values are string IDs on that platform. This enables:

- **Deduplication on import**: two apps exporting the same Ravelry project produce different WEFT `id` values, but both carry `external_ids.ravelry: "12345"`. An importer can detect they represent the same real-world entity.
- **Re-import merging**: when re-importing an updated export, match on `external_ids` to update existing records rather than creating duplicates.
- **Cross-platform linking**: a project in Stash2Go and the same project in KnitCompanion can be recognized as the same entity.

`external_ids` is optional. When absent, the entity has no known platform identity — deduplication falls back to heuristics (name matching, etc.).

## Photos

All entities that support photos use the same Photo model:

```json
{
  "id": "photo-001",
  "uri": "photos/project-wip.jpg",
  "sort_order": 0,
  "is_primary": true,
  "caption": "Body complete",
  "copyright_holder": "Jane Doe",
  "aspect_ratio": 0.75
}
```

**Rules**:
- `uri` is required. All other fields are optional.
- `sort_order` determines display sequence (lower numbers first). When absent, array position is the implicit order.
- Exactly one photo per entity should have `is_primary: true`. It serves as the cover/thumbnail photo.
- `copyright_holder` is recommended. Some platforms (e.g., Ravelry) require it for photo upload — a WEFT file without it cannot round-trip photos to those platforms.
- `aspect_ratio` (width/height) enables layout rendering before the image loads.
- `id` enables deduplication — when re-importing, photos with matching IDs can be updated instead of duplicated.

## Bundle Cross-References

In a bundle, entities cross-reference each other by `id`:

- Project `materials_used[].material_id` → Material `id`
- Project `materials_used[].pack_id` → Material `packs[].id`
- Project `pattern_ref.id` → Pattern `id`
- Project `tools_used[].tool_id` → Tool `id`
- Material `product_ref.product_id` → Product `id`
- Material `packs[].project_id` → Project `id`
- Roving `spinning_project_id` → Project `id`

When a referenced entity is not in the bundle (exported separately or from a different source), importers should:
1. Keep the reference intact (don't strip it).
2. Treat it as an unresolved reference — the entity may arrive in a future import.
3. Use inline fields (e.g., `MaterialUsed.name`, `MaterialUsed.brand`) to display the entity even when the reference is unresolved.

## Validation

Apps should validate WEFT files in this order:

1. **Check `weft_version`** — reject if the major version is unsupported. Parse as semver.
2. **Check `type`** — must be a known entity type or `"bundle"`.
3. **Validate required core fields** — each entity spec defines which fields are required (e.g., `name` on Material). Reject items missing required fields.
4. **Skip unknown type blocks** — if a Material has `material_type: "resin"` and your app doesn't support resin, import the core fields and preserve the type-specific block.
5. **Warn on unknown fields, don't reject** — log a warning for fields your app doesn't recognize. Never reject a valid WEFT file because it has extra fields.

## Versioning

- `weft_version` is a semver string: `"1.0"`, `"1.1"`, `"2.0"`
- **Minor** (1.0 → 1.1): new optional fields added. Old readers ignore them.
- **Major** (1.x → 2.0): breaking changes. Apps check version before parsing.

## Taxonomies

All enum values are defined in `99-taxonomy/` as YAML files with:
- **Canonical key** — what goes in JSON: `merino`, `worsted`, `in-stash`
- **Translated labels** — human-readable in 12+ languages
- **Aliases** — alternative names that map to the canonical key (`"8ply"` → `dk`)
- **Hierarchy** — optional parent/child relationships (`merino` → `wool` → `animal-fiber`)

Keys never change once published. New values can be added. Labels can be updated/translated anytime.

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| JSON over binary | Human-readable, debuggable, universally supported |
| Flat file over database | Portable, offline-first, no server dependency |
| Polymorphic types over one-size-fits-all | Different crafts need different fields |
| Shared taxonomies over inline enums | One source of truth, translatable, extensible |
| Unknown fields preserved | Data portability means never losing information |
| URIs for photos over embedded blobs | Keeps files small, allows flexible storage |
| App-local IDs over UUIDs | Simple, no coordination needed, remappable on import |
