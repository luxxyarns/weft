# 03 — Project

> A thing you're making: a sweater, a quilt, a tapestry, a garment, a scarf, a sampler.

## Overview

A `Project` represents a work — in progress, completed, or planned. It links to materials, tools, patterns, and progress tracking. The core describes what every craft project has in common; extensions add craft-specific details.

## Core Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `name` | string | yes | Project name |
| `craft` | enum | yes | Primary craft. See `99-taxonomy/craft.yaml` |
| `status` | enum | yes | `planned` `in-progress` `finished` `hibernating` `frogged` `gifted` `other` |
| `progress_percent` | number | no | 0-100 completion |
| `started_at` | date | no | Start date |
| `started_date_precise` | boolean | no | Default true. When false, only month/year of `started_at` is known. |
| `completed_at` | date | no | Completion date |
| `completed_date_precise` | boolean | no | Default true. When false, only month/year of `completed_at` is known. |
| `status_changed_at` | datetime | no | When the status last changed. Useful for sorting by staleness or recency. |
| `size_made` | string | no | Size ("M", "42", "queen", "custom") |
| `made_for` | string | no | Recipient ("myself", "gift for Mom") |
| `pattern_ref` | PatternRef | no | Reference to the pattern/instructions used |
| `materials_used` | MaterialUsed[] | no | Materials allocated to this project with usage details |
| `tools_used` | ToolRef[] | no | References to tools used |
| `gauge` | GaugeAchieved | no | Gauge measured on this project |
| `notes` | string | no | Freetext notes (public) |
| `private_notes` | string | no | Notes visible only to the owner |
| `photos` | Photo[] | no | Project images |
| `tags` | string[] | no | User tags |
| `rating` | number | no | 1-5 star rating of the pattern/project quality |
| `happiness` | number | no | 1-10 personal satisfaction with the finished object. Distinct from rating. |
| `external_ids` | ExternalIds | no | Platform-specific identifiers (e.g. `{"ravelry": "12345"}`) |
| `created_at` | datetime | no | Record creation |
| `updated_at` | datetime | no | Record last modified |
| `ext` | object | no | Extensions |

### Craft Enum

All values from `99-taxonomy/craft.yaml`:

`knitting` `crochet` `machine-knitting` `loom-knitting` `weaving` `spinning` `sewing` `quilting` `embroidery` `cross-stitch` `macrame` `dyeing` `tatting` `felting` `other`

### PatternRef

```json
{
  "id": "pat-001",
  "name": "Carbeth Cardigan",
  "designer": "Kate Davies",
  "url": "https://www.ravelry.com/patterns/library/carbeth",
  "source": "digital_download"
}
```

The `id` field enables cross-referencing to a Pattern entity in the same bundle.

### MaterialUsed

Describes a yarn/material allocation for this project. Carries enough inline data to be self-contained when the referenced Material is not in the bundle.

```json
{
  "material_id": "mat-001",
  "pack_id": "pack-001",
  "name": "Malabrigo Rios",
  "brand": "Malabrigo",
  "product_line": "Rios",
  "colorway": "Whales Road",
  "weight_category": "worsted",
  "quantity_used": { "value": 2, "unit": "skein", "length_meters": 384 }
}
```

### ToolRef

```json
{
  "tool_id": "tool-001",
  "description": "5mm circular, 80cm",
  "size_mm": 5.0,
  "tool_type": "circular"
}
```

### GaugeAchieved

```json
{
  "stitches_per_unit": 18,
  "rows_per_unit": 24,
  "unit": "4in",
  "gauge_pattern": "stockinette",
  "blocked": true
}
```

### Photo

```json
{
  "id": "photo-001",
  "uri": "photos/proj-001-wip.jpg",
  "sort_order": 0,
  "is_primary": true,
  "caption": "Body complete",
  "copyright_holder": "Jane Doe",
  "aspect_ratio": 0.75
}
```

### ExternalIds

```json
{ "ravelry": "11223344", "knitcompanion": "abc-def" }
```

Platform-specific identifiers enable deduplication when importing the same entity from multiple sources.

## Craft Extensions

### ext.knitting

```json
"ext": {
  "knitting": {
    "construction": "top_down",
    "cast_on_method": "long_tail",
    "bind_off_method": "standard",
    "needle_sizes_mm": [5.0, 4.0],
    "needle_types": ["circular", "dpn"],
    "gauge_achieved": {
      "stitches_per_unit": 18,
      "rows_per_unit": 24,
      "unit": "4in",
      "blocked": true
    }
  }
}
```

### ext.crochet

```json
"ext": {
  "crochet": {
    "hook_sizes_mm": [5.0],
    "stitch_types": ["sc", "dc", "hdc"],
    "gauge_achieved": {
      "stitches_per_unit": 14,
      "rows_per_unit": 16,
      "unit": "4in"
    }
  }
}
```

### ext.weaving

```json
"ext": {
  "weaving": {
    "loom_type": "rigid_heddle",
    "width_on_loom_cm": 60,
    "sett_epi": 12,
    "picks_per_inch": 14,
    "draft_notation": "plain_weave",
    "warp_material_id": "mat-005",
    "weft_material_id": "mat-006"
  }
}
```

### ext.sewing

```json
"ext": {
  "sewing": {
    "garment_type": "dress",
    "pattern_company": "Merchant & Mills",
    "pattern_number": "The Factory Dress",
    "seam_allowance_cm": 1.5,
    "fabric_type": "linen",
    "machine_used": "Bernina 335"
  }
}
```

### ext.spinning

```json
"ext": {
  "spinning": {
    "method": "wheel",
    "wheel_name": "Schacht Ladybug",
    "twist_direction": "Z",
    "ply_count": 2,
    "wpi_achieved": 14,
    "resulting_weight": "fingering",
    "total_yardage_spun": 200
  }
}
```

## Open Questions

1. **Multiple crafts per project?** A knitted blanket with crocheted edging — use primary `craft` field plus additional crafts in ext, or change `craft` to an array?
2. **Pattern modifications**: How to record "I changed X from the pattern"? Freetext in notes, or structured modification list?
