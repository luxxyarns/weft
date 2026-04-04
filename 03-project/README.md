# 03 — Project

> A thing you're making: a sweater, a quilt, a tapestry, a garment, a scarf, a sampler.

## Overview

A `Project` represents a work — in progress, completed, or planned. It links to materials, tools, patterns, and progress tracking. The core describes what every craft project has in common; extensions add craft-specific details.

## Core Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `name` | string | yes | Project name |
| `craft` | enum | yes | `knitting` `crochet` `weaving` `spinning` `sewing` `quilting` `embroidery` `cross_stitch` `macrame` `dyeing` `other` |
| `status` | enum | yes | `planned` `in_progress` `finished` `hibernating` `frogged` `gifted` `other` |
| `progress_percent` | number | no | 0-100 completion |
| `started_at` | date | no | Start date |
| `completed_at` | date | no | Completion date |
| `size_made` | string | no | Size ("M", "42", "queen", "custom") |
| `made_for` | string | no | Recipient ("myself", "gift for Mom") |
| `pattern_ref` | PatternRef | no | Reference to the pattern/instructions used |
| `materials_used` | MaterialRef[] | no | References to materials from stash |
| `tools_used` | ToolRef[] | no | References to tools used |
| `notes` | string | no | Freetext notes |
| `photos` | Photo[] | no | Project images |
| `tags` | string[] | no | User tags |
| `rating` | number | no | 1-5 star rating |
| `created_at` | datetime | no | Record creation |
| `updated_at` | datetime | no | Record last modified |
| `ext` | object | no | Extensions |

### PatternRef

```json
{
  "name": "Carbeth Cardigan",
  "designer": "Kate Davies",
  "url": "https://www.ravelry.com/patterns/library/carbeth",
  "source": "digital_download"
}
```

### MaterialRef

```json
{
  "material_id": "mat-001",
  "quantity_used": { "value": 2, "unit": "skein", "length_meters": 384 }
}
```

### ToolRef

```json
{
  "tool_id": "tool-001",
  "description": "5mm circular, 80cm"
}
```

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

1. **Should projects link to progress trackers?** A `progress_id` field referencing a Progress entity, or should progress be embedded?
2. **Multiple crafts per project?** A knitted blanket with crocheted edging — array of crafts or primary/secondary?
3. **Pattern modifications**: How to record "I changed X from the pattern"? Freetext in notes, or structured modification list?
