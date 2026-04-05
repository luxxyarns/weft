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
{ "ravelry": "11223344" }
```

Platform-specific identifiers enable deduplication when importing the same entity from multiple sources.

## Craft Extensions

### ext.knitting

```json
"ext": {
  "knitting": {
    "construction": "top-down",
    "cast_on_method": "long-tail",
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
    "loom_type": "rigid-heddle",
    "shaft_count": 4,
    "treadle_count": 6,
    "structure": "twill",
    "width_on_loom_cm": 60,
    "sett_epi": 12,
    "picks_per_inch": 14,
    "reed_dpi": 12,
    "sleying_order": "1 per dent",
    "warp_length_cm": 300,
    "loom_waste_cm": 60,
    "warp_ends_count": 288,
    "selvedge_type": "floating",
    "warp_color_order": ["navy", "cream", "navy", "cream"],
    "threading_draft": [1, 2, 3, 4, 1, 2, 3, 4],
    "tie_up": [[true, false, false, true], [false, true, true, false]],
    "treadling_sequence": [1, 2, 1, 2],
    "wif_reference": "drafts/twill-sample.wif",
    "warp_material_id": "mat-005",
    "weft_materials": [
      { "material_id": "mat-006", "role": "pattern-weft" },
      { "material_id": "mat-007", "role": "tabby-weft" }
    ],
    "shrinkage_percent": 10,
    "finished_width_cm": 54,
    "finished_length_cm": 200
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
    "singles_twist_direction": "Z",
    "ply_twist_direction": "S",
    "ply_count": 2,
    "ply_structure": "2-ply",
    "drafting_method": "short-draw",
    "tpi": 8,
    "wpi_achieved": 14,
    "resulting_weight": "fingering",
    "total_yardage_spun": 200,
    "total_weight_grams": 100,
    "finishing_method": ["washed", "thwacked", "set-twist"],
    "fiber_source_material_id": "mat-fiber-001",
    "resulting_yarn_id": "mat-yarn-001"
  }
}
```

### ext.quilting

```json
"ext": {
  "quilting": {
    "quilt_size": "throw",
    "block_pattern": "Log Cabin",
    "block_count": 42,
    "block_size_inches": 12,
    "layout": "straight-set",
    "piecing_method": "machine-pieced",
    "quilting_method": "free-motion",
    "quilting_design": "stipple",
    "binding_method": "machine",
    "binding_width_inches": 2.5,
    "binding_grain": "bias",
    "sashing": true,
    "sashing_width_inches": 2,
    "borders": [{ "width_inches": 3, "type": "plain" }]
  }
}
```

### ext.embroidery

```json
"ext": {
  "embroidery": {
    "technique": "surface",
    "fabric_type": "linen",
    "fabric_count": 28,
    "hoop_size_cm": 20,
    "design_width_cm": 15,
    "design_height_cm": 12,
    "stitch_count": 4500,
    "thread_colors_count": 18,
    "stitches_used": ["satin", "stem", "french-knot", "chain"],
    "transfer_method": "traced"
  }
}
```

### ext.cross_stitch

```json
"ext": {
  "cross_stitch": {
    "fabric_type": "aida",
    "fabric_count": 14,
    "fabric_color": "white",
    "design_width_stitches": 200,
    "design_height_stitches": 280,
    "over": 1,
    "thread_brand": "DMC",
    "thread_colors_used": 45,
    "has_backstitch": true,
    "has_fractional_stitches": true,
    "has_blended_threads": false,
    "has_beading": false,
    "strands_used": 2,
    "framing": "framed"
  }
}
```

### ext.macrame

```json
"ext": {
  "macrame": {
    "cord_type": "single-twist cotton",
    "cord_diameter_mm": 4,
    "cord_count": 24,
    "cord_length_per_strand_m": 3.5,
    "knot_types": ["square-knot", "spiral", "larks-head", "gathering"],
    "mounting_method": "larks-head",
    "support_type": "dowel",
    "finished_width_cm": 40,
    "finished_length_cm": 90
  }
}
```

### ext.tatting

```json
"ext": {
  "tatting": {
    "method": "shuttle",
    "shuttle_count": 2,
    "thread_size": "40",
    "thread_brand": "Lizbeth",
    "thread_colors_count": 3,
    "has_split_rings": true,
    "project_type": "doily",
    "finished_diameter_cm": 25
  }
}
```

### ext.dyeing

```json
"ext": {
  "dyeing": {
    "dye_type": "acid",
    "dye_brand": "Jacquard",
    "method": "immersion",
    "color_recipe": [
      { "dye_name": "Sapphire Blue", "percentage_owf": 2.0 }
    ],
    "mordant": "none",
    "water_temperature_c": 85,
    "duration_minutes": 60,
    "base_fiber": "merino",
    "base_weight_grams": 400,
    "colorfast_tested": true,
    "resulting_material_id": "mat-dyed-001"
  }
}
```

## Input → Output Model

Every project transforms input materials into output:

| Craft | Input | Output |
|-------|-------|--------|
| Knitting/Crochet | yarn | garment, accessory, toy |
| Spinning | roving/fiber | yarn |
| Weaving | yarn (warp + weft) | fabric/cloth |
| Sewing | fabric + notions | garment, bag, home-decor |
| Quilting | fabric + batting | quilt |
| Dyeing | dye + undyed material | dyed material |
| Embroidery | thread + ground fabric | embroidered piece |
| Macramé | cord | wall hanging, plant hanger |

Use `materials_used[].role` to distinguish inputs (e.g., `"warp"` vs `"weft"` for weaving, `"background"` vs `"binding"` for quilting).

Use `output.material_id` to link a spinning project to its resulting yarn stash entry, or a dyeing project to the dyed material.

## Resolved Questions

1. **Multiple crafts per project?** Resolved: use primary `craft` field + `secondary_crafts[]` array.
2. **Pattern modifications?** Resolved: dedicated `modifications` field (separate from notes).

## Open Questions

None remaining.
