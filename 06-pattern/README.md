# 06 — Pattern

> Instructions and recipes for making something: a knitting pattern, a sewing pattern, a weaving draft, an embroidery chart. Transformation guides that turn materials into finished objects.

## Overview

A `Pattern` is a set of instructions that a crafter follows to create a finished item. It's the recipe — written by a designer, published in a book/PDF/website, and followed by crafters who turn materials into projects.

Patterns are NOT the visual motifs (like "cable pattern" or "floral print"). In WEFT, a Pattern is a **document** — something you can buy, download, print, and follow.

### Pattern vs Project

| | Pattern (06-pattern) | Project (03-project) |
|---|---|---|
| **What it is** | Instructions ("Carbeth Cardigan by Kate Davies") | Your execution ("My Carbeth in teal merino") |
| **Who creates it** | Designer | You (the crafter) |
| **How many** | One pattern | Many projects from the same pattern |
| **Contains** | Written instructions, charts, schematics | Your progress, photos, yarn choices, modifications |

## Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `name` | string | yes | Pattern name |
| `designer` | ContributorRef | no | Primary designer (shorthand — also appears in contributors[]) |
| `contributors` | ContributorRef[] | no | All people involved: designer, tech editor, translator, illustrator, etc. |
| `craft` | string[] | no | Crafts this pattern is for. See `99-taxonomy/craft.yaml` |
| `category` | CategoryRef | no | Hierarchical category (e.g. Clothing > Sweater > Pullover) |
| `pattern_attributes` | string[] | no | Structured attributes. See `99-taxonomy/pattern-attribute.yaml` |
| `difficulty` | number | no | 1-10 scale |
| `published_date` | date | no | Publication date |
| `generally_available` | date | no | When publicly available (may differ from published_date) |
| `edition` | string | no | Edition identifier (e.g., "2nd edition", "v2.1") |
| `revision` | string | no | Revision within an edition |
| `revision_notes` | string | no | What changed in this revision |
| `errata` | Erratum[] | no | Known corrections |
| `replaces_pattern_id` | string | no | ID of the pattern this supersedes |
| `superseded_by_pattern_id` | string | no | ID of the pattern that supersedes this |
| `rights` | Rights | no | Copyright and usage information |
| `sources` | PatternSource[] | no | All places this pattern can be found (with roles) |
| `primary_source_id` | string | no | ID of the canonical source within sources[] |
| `language` | string[] | no | Available languages (ISO 639-1) |
| `size_options` | SizeOption[] | no | Structured sizes with measurements per size |
| `sizes` | string[] | no | Simple size labels (when structured options unavailable) |
| `measurements` | Measurements | no | Body measurement reference for the pattern |
| `is_free` | boolean | no | Whether freely available |
| `price` | Money | no | Purchase price |
| `downloadable` | boolean | no | Whether a digital download is available |
| `notes` | string | no | Designer's description or personal notes |
| `photos` | Photo[] | no | Pattern/project photos |
| `tags` | string[] | no | User tags |
| `suggested_materials` | SuggestedMaterial[] | no | Materials suggested by the designer |
| `material_requirements_by_size` | object[] | no | Material requirements broken down by size |
| `yardage_min` / `yardage_max` | number | no | Yardage required (yards) |
| `meterage_min` / `meterage_max` | number | no | Meterage required (meters) |
| `community` | CommunityMetrics | no | Rating, favorites, project count (snapshot at export) |
| `external_ids` | ExternalIds | no | Platform-specific identifiers |

### ContributorRef

All people/entities involved in creating the pattern. Replaces the old flat designer string.

```json
{
  "name": "Kate Davies",
  "id": "designer-001",
  "url": "https://katedaviesdesigns.com",
  "role": "designer",
  "external_ids": { "ravelry": "24680" }
}
```

Roles: `designer`, `tech-editor`, `translator`, `illustrator`, `photographer`, `sample-maker`, `author`, `co-designer`

### CategoryRef

```json
{
  "name": "Pullover",
  "path": ["clothing", "sweater", "pullover"]
}
```

### PatternSource

Each source has a `role` describing its relationship to the pattern:

```json
{
  "id": "src-001",
  "name": "Kate Davies Designs",
  "role": "canonical",
  "type": "digital-download",
  "url": "https://shop.katedaviesdesigns.com/carbeth",
  "published_date": "2018-09-01",
  "available": true
}
```

Roles: `canonical` (original publication), `storefront` (where to buy), `publication` (book/magazine appearance), `owned-copy` (user's copy), `community-listing` (platform listing)

### SizeOption

Structured size with measurements and material requirements per size:

```json
{
  "label": "M",
  "body_measurements": { "bust": 92, "waist": 76, "hip": 98 },
  "finished_measurements": { "bust": 102, "length": 62 },
  "ease": { "bust": 10 },
  "material_requirements": [
    { "name": "Main yarn", "quantity": { "units_count": 5, "unit_label": "skein", "length_meters": 960 } }
  ]
}
```

### Rights

```json
{
  "copyright_holder": "Kate Davies Designs",
  "copyright_year": 2018,
  "license": "personal-use",
  "usage_policy": "Sell finished items with credit to designer"
}
```

### Erratum

```json
{
  "id": "err-001",
  "date": "2019-06-15",
  "description": "Chart row 12 had reversed symbols",
  "affected_sections": ["Yoke chart"],
  "correction": "Swap symbols in columns 5-8 of row 12"
}
```

### SuggestedMaterial

```json
{
  "product_id": "jamieson-spindrift",
  "name": "Jamieson's Spindrift",
  "brand": "Jamieson's of Shetland",
  "weight_category": "fingering",
  "quantity": { "units_count": 5, "unit_label": "skein", "length_meters": 960 }
}
```

## Type-Specific Fields

### knitting

```json
"knitting": {
  "yarn_weight": "worsted",
  "needle_sizes_mm": [5.0, 4.0],
  "gauge": { "stitches_per_unit": 18, "rows_per_unit": 24, "unit": "4in", "gauge_divisor": 4, "gauge_pattern": "stockinette" },
  "construction": "top_down",
  "techniques": ["cables", "short_rows", "colorwork"]
}
```

### crochet

```json
"crochet": {
  "yarn_weight": "dk",
  "hook_sizes_mm": [4.0, 5.0],
  "gauge": { "stitches_per_unit": 14, "rows_per_unit": 16, "unit": "4in" },
  "has_us_terminology": true,
  "has_uk_terminology": false,
  "construction": "in-the-round",
  "stitch_types": ["sc", "dc", "hdc", "tr"],
  "techniques": ["amigurumi", "granny-square"],
  "pieces": [
    { "name": "Body", "count": 1 },
    { "name": "Arm", "count": 2 },
    { "name": "Leg", "count": 2 }
  ]
}
```

### sewing / weaving / quilting / embroidery / cross-stitch / spinning / macramé / tatting / dyeing

See `pattern.schema.json` for complete field definitions for all 12 craft-specific blocks.

## Open Questions

1. **PDF content** — should WEFT store pattern text/instructions, or just metadata? Patterns are copyrighted; the format should describe them, not contain them.
