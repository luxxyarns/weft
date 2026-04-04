# 01 — About WEFT

## What is WEFT?

WEFT (Widely Exchangeable Format for Textiles) is an open data format for textile and fiber crafts. It defines a common language for craft data — materials, projects, progress, tools, patterns — so that any app can export it and any app can import it.

## The Core + Extension Model

The textile craft world is incredibly fragmented: hundreds of apps, dozens of crafts, thousands of local conventions. No single data model can capture everything. WEFT doesn't try. Instead, it uses a **core + extension** architecture inspired by real-world standards (TMForum, JSON-LD, OpenAPI).

### Core: The Non-Disputable Attributes

Every entity in WEFT has a set of **core attributes** that are:

- Universal across all crafts
- Non-controversial (everyone agrees a material has a name and a quantity)
- Required for basic interoperability
- Defined by the WEFT specification

Example: A `Material` always has:
```json
{
  "id": "mat-001",
  "name": "Malabrigo Rios",
  "material_type": "yarn",
  "quantity": { "value": 3, "unit": "skein" },
  "status": "in_stash",
  "tags": ["merino", "superwash"],
  "notes": "Bought at Rhinebeck",
  "created_at": "2025-06-15T00:00:00Z",
  "updated_at": "2026-04-04T18:00:00Z"
}
```

These fields work whether you're a knitter tracking yarn, a quilter tracking fabric, or a spinner tracking roving.

### Extensions: The Craft-Specific, App-Specific Details

Everything beyond the core lives in a namespaced `ext` block:

```json
{
  "id": "mat-001",
  "name": "Malabrigo Rios",
  "material_type": "yarn",
  "quantity": { "value": 3, "unit": "skein" },
  "ext": {
    "yarn": {
      "weight_category": "worsted",
      "fiber_content": [
        { "fiber": "superwash merino", "percentage": 100 }
      ],
      "weight_grams": 100,
      "length_meters": 192,
      "colorway": "Whales Road",
      "dye_lot": "B1234",
      "gauge": {
        "stitches_per_unit": 18,
        "rows_per_unit": 24,
        "unit": "4in",
        "needle_size_mm": 5.0
      }
    },
    "ravelry": {
      "stash_id": 12345678,
      "yarn_id": 87654,
      "yarn_company_id": 321
    },
    "stash2go": {
      "matchmaker_score": 0.85,
      "color_hex": "#2A4B6F"
    }
  }
}
```

### Extension Namespaces

Extensions are organized by namespace:

| Namespace Type | Example | Purpose |
|---------------|---------|---------|
| **Craft** | `yarn`, `fabric`, `thread`, `roving`, `floss` | Craft-specific attributes (weight, fiber, thread count) |
| **Platform** | `ravelry`, `loveknitting`, `etsy` | Platform IDs, links, sync metadata |
| **App** | `stash2go`, `yarnbuddy`, `knitcompanion` | App-specific features (matchmaker scores, custom fields) |
| **Community** | `guild`, `kal` (knit-along) | Community-specific metadata |

### Rules for Extensions

1. **Unknown extensions MUST be preserved** — if an app reads a `.weft` file with extensions it doesn't understand, it MUST keep them intact on re-export. Never drop data.
2. **Extensions MUST NOT duplicate core** — if a field exists in core, use it. Don't redefine `name` inside an extension.
3. **Extensions are optional** — an app can write and read `.weft` files with zero extensions. Core alone is a valid, useful document.
4. **Namespace registration** — apps/platforms register their namespace in `/08-extensions/` to avoid collisions.

## Polymorphism: One Shape, Many Crafts

WEFT uses `material_type`, `craft`, and `tool_type` fields to enable polymorphism:

```
Material
├── material_type: "yarn"    → ext.yarn { weight, fiber, colorway, gauge }
├── material_type: "fabric"  → ext.fabric { width_cm, thread_count, weave_type }
├── material_type: "thread"  → ext.thread { ply, strand_count, brand_line }
├── material_type: "roving"  → ext.roving { fiber, prep_method, micron_count }
└── material_type: "floss"   → ext.floss { strand_count, brand_number }
```

An app that only knows about yarn can read a `.weft` file containing fabric entries — it just shows the core fields (name, quantity, status, tags) and ignores the `ext.fabric` block. No crash, no data loss, graceful degradation.

## Versioning

- `weft_version` is a semver string in every document: `"1.0"`, `"1.1"`, `"2.0"`
- **Minor versions** (1.0 → 1.1): new optional core fields. Old readers ignore them.
- **Major versions** (1.x → 2.0): breaking changes to core. Apps should check version before parsing.
- Extensions have their own version: `"ext": { "yarn@1.2": { ... } }`

## File Structure

A `.weft` file is a single JSON object:

```json
{
  "weft_version": "1.0",
  "type": "material",
  "exported_at": "2026-04-04T18:00:00Z",
  "exported_from": {
    "app": "stash2go",
    "version": "1.23",
    "platform": "ios"
  },
  "items": [
    { ... },
    { ... }
  ]
}
```

Multiple entity types can be combined in a bundle:

```json
{
  "weft_version": "1.0",
  "type": "bundle",
  "exported_at": "2026-04-04T18:00:00Z",
  "exported_from": { "app": "stash2go", "version": "1.23" },
  "materials": [ ... ],
  "projects": [ ... ],
  "progress": [ ... ],
  "tools": [ ... ]
}
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| JSON over binary | Human-readable, debuggable, universally supported |
| Flat file over database | Portable, offline-first, no server dependency |
| Core + extensions over one big schema | Fragmented ecosystem needs flexibility without chaos |
| Namespaced extensions over free-form | Prevents collisions, enables discovery, maintains order |
| Preserve unknown fields | Data portability means never losing information |
| Craft-agnostic core | No craft should feel excluded or privileged |
