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

```json
{
  "weft_version": "1.0",
  "type": "material",
  "exported_at": "2026-04-04T18:00:00Z",
  "exported_from": { "app": "stash2go", "version": "1.23" },
  "items": [ ... ]
}
```

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
