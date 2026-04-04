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
| `designer` | string | no | Designer/author name |
| `craft` | string[] | no | Crafts this pattern is for. See `09-taxonomy/craft.yaml` |
| `category` | string | no | What it makes: `sweater`, `hat`, `scarf`, `blanket`, `quilt`, `bag`, etc. |
| `difficulty` | number | no | 1-10 scale |
| `published_date` | date | no | Publication date |
| `source_type` | string | no | `book`, `magazine`, `digital_download`, `website`, `ebook`, `pamphlet`, `free` |
| `source_name` | string | no | Book/magazine title, website name |
| `url` | string | no | Where to find/buy the pattern |
| `language` | string[] | no | Available languages (ISO 639-1) |
| `sizes` | string[] | no | Available sizes ("XS", "S", "M", "L", "XL") |
| `is_free` | boolean | no | Whether freely available |
| `price` | Money | no | Purchase price |
| `notes` | string | no | Your personal notes about this pattern |
| `photos` | Photo[] | no | Pattern/project photos |
| `tags` | string[] | no | User tags |
| `created_at` | datetime | no | Record created |
| `updated_at` | datetime | no | Record last modified |

## Type-Specific Fields

### knitting / crochet

```json
"knitting": {
  "yarn_weight": "worsted",
  "yardage_min": 800,
  "yardage_max": 1200,
  "needle_sizes_mm": [5.0, 4.0],
  "gauge": { "stitches_per_unit": 18, "rows_per_unit": 24, "unit": "4in" },
  "construction": "top_down",
  "techniques": ["cables", "short_rows", "colorwork"]
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
  "warp_yardage": 500,
  "weft_yardage": 400
}
```

## Open Questions

1. **PDF content** — should WEFT store pattern text/instructions, or just metadata (name, designer, where to find it)? Patterns are copyrighted; the format should describe them, not contain them.
2. **Modifications** — how to record "I changed the neckline" — in the Pattern or the Project?
3. **Errata** — should the format support recording corrections to published patterns?
