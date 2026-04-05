# 06 — Pattern

> Instructions and recipes for making something: a knitting pattern, a sewing pattern, a weaving draft, an embroidery chart.

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
| `designer` | DesignerRef | no | Designer/author (structured object for identity/dedup) |
| `craft` | string[] | no | Crafts this pattern is for. See `99-taxonomy/craft.yaml` |
| `category` | CategoryRef | no | Hierarchical category (e.g. Clothing > Sweater > Pullover) |
| `pattern_attributes` | string[] | no | Structured attributes: construction, garment features, stitch patterns |
| `difficulty` | number | no | 1-10 scale |
| `published_date` | date | no | Publication date |
| `source_type` | string | no | Primary source: `book`, `magazine`, `digital_download`, `website`, `ebook`, `pamphlet`, `free` |
| `source_name` | string | no | Book/magazine title, website name |
| `sources` | PatternSource[] | no | All publication sources (when a pattern appears in multiple places) |
| `url` | string | no | Primary URL where to find/buy the pattern |
| `language` | string[] | no | Available languages (ISO 639-1) |
| `sizes` | string[] | no | Available sizes ("XS", "S", "M", "L", "XL") |
| `is_free` | boolean | no | Whether freely available |
| `price` | Money | no | Purchase price |
| `downloadable` | boolean | no | Whether a digital download is available |
| `notes` | string | no | Designer's description or personal notes |
| `photos` | Photo[] | no | Pattern/project photos |
| `tags` | string[] | no | User tags |
| `suggested_materials` | SuggestedMaterial[] | no | Yarns/materials suggested by the designer |
| `yardage_min` / `yardage_max` | number | no | Yardage required (yards) |
| `meterage_min` / `meterage_max` | number | no | Meterage required (meters) |
| `community` | CommunityMetrics | no | Rating, favorites, project count (snapshot at export time) |
| `external_ids` | ExternalIds | no | Platform-specific identifiers |
| `created_at` | datetime | no | Record created |
| `updated_at` | datetime | no | Record last modified |

### DesignerRef

Structured designer identity for linking and deduplication across patterns.

```json
{
  "name": "Kate Davies",
  "id": "kate-davies",
  "url": "https://www.ravelry.com/designers/kate-davies"
}
```

### CategoryRef

Hierarchical category with full path from root to leaf.

```json
{
  "name": "Pullover",
  "path": ["clothing", "sweater", "pullover"]
}
```

### PatternSource

When a pattern appears in multiple places (a book AND a website AND a Ravelry download):

```json
{
  "name": "Yarnstorm: Knitting Inspiration",
  "type": "book",
  "url": "https://example.com/yarnstorm",
  "published_date": "2024-03-15"
}
```

### SuggestedMaterial

Yarns/materials suggested by the designer, with quantities:

```json
{
  "product_id": "malabrigo-rios",
  "name": "Malabrigo Rios",
  "brand": "Malabrigo",
  "weight_category": "worsted",
  "quantity": { "value": 5, "unit": "skein", "length_meters": 960 },
  "colorway": "Whales Road"
}
```

### CommunityMetrics

Aggregated community data. These are snapshots at export time, not authoritative.

```json
{
  "rating_average": 4.7,
  "rating_count": 1250,
  "difficulty_average": 4.2,
  "difficulty_count": 890,
  "favorites_count": 8500,
  "projects_count": 3200,
  "queued_count": 1500
}
```

### Photo

```json
{
  "id": "photo-001",
  "uri": "photos/pattern-cover.jpg",
  "sort_order": 0,
  "is_primary": true,
  "caption": "Finished garment in Malabrigo Rios",
  "copyright_holder": "Kate Davies Designs",
  "aspect_ratio": 0.75
}
```

### ExternalIds

```json
{ "ravelry": "987654" }
```

## Type-Specific Fields

### knitting

```json
"knitting": {
  "yarn_weight": "worsted",
  "needle_sizes_mm": [5.0, 4.0],
  "gauge": { "stitches_per_unit": 18, "rows_per_unit": 24, "unit": "4in" },
  "gauge_description": "18 sts and 24 rows = 4in/10cm in stockinette stitch",
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
  "gauge_description": "14 sc and 16 rows = 4in in single crochet",
  "has_us_terminology": true,
  "has_uk_terminology": false,
  "stitch_types": ["sc", "dc", "hdc", "tr"],
  "techniques": ["amigurumi", "granny_square"]
}
```

### sewing

```json
"sewing": {
  "fabric_type": "woven",
  "fabric_yardage": 3.5,
  "notions": ["zipper_22in", "buttons_6"],
  "seam_allowance_cm": 1.5,
  "pattern_pieces": 12
}
```

### weaving

```json
"weaving": {
  "draft_type": "twill",
  "shafts_required": 4,
  "width_cm": 60,
  "sett_epi": 12,
  "picks_per_inch": 14,
  "warp_yardage": 500,
  "weft_yardage": 400
}
```

## Open Questions

1. **PDF content** — should WEFT store pattern text/instructions, or just metadata (name, designer, where to find it)? Patterns are copyrighted; the format should describe them, not contain them.
2. **Modifications** — how to record "I changed the neckline" — in the Pattern or the Project?
3. **Errata** — should the format support recording corrections to published patterns?
