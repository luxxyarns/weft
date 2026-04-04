# 02 — Material

> Anything you craft with: yarn, fabric, thread, roving, floss, beads, wire, leather...

## Overview

`Material` is the most fundamental WEFT entity. It represents a physical item in your stash — something you own, plan to use, or have used in a project.

The core schema describes **what any craft material has in common**: a name, a quantity, a status, and metadata. Craft-specific details live in typed extensions.

## Core Schema

Every material, regardless of craft, has these attributes:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier (app-generated) |
| `name` | string | yes | Display name ("Malabrigo Rios - Whales Road") |
| `material_type` | enum | yes | `yarn` `fabric` `thread` `roving` `floss` `bead` `wire` `other` |
| `craft` | enum[] | no | Intended crafts: `knitting` `crochet` `weaving` `spinning` `sewing` `quilting` `embroidery` `cross_stitch` `macrame` `dyeing` `other` |
| `quantity` | Quantity | yes | How much you have |
| `status` | enum | yes | `in_stash` `allocated` `in_use` `used_up` `gifted` `sold` `frogged` `other` |
| `acquired_date` | date | no | When you got it |
| `acquired_from` | string | no | Where you got it ("LYS", "online", "gift") |
| `acquired_price` | Money | no | What you paid |
| `color_description` | string | no | Freetext color ("teal with blue speckles") |
| `color_hex` | string | no | Hex color for UI display |
| `brand` | string | no | Manufacturer/brand name |
| `product_line` | string | no | Product/line name within brand |
| `notes` | string | no | Freetext notes |
| `photos` | Photo[] | no | Images |
| `tags` | string[] | no | User tags |
| `location` | string | no | Physical storage location ("bin 3", "closet shelf") |
| `created_at` | datetime | no | When this record was created |
| `updated_at` | datetime | no | When this record was last modified |
| `ext` | object | no | Extensions (see below) |

### Quantity

```json
{
  "value": 3,
  "unit": "skein",
  "weight_grams": 300,
  "length_meters": 576
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `value` | number | yes | Count of units |
| `unit` | string | yes | `skein` `ball` `hank` `cone` `meter` `yard` `gram` `kg` `oz` `pound` `fat_quarter` `yard_fabric` `meter_fabric` `spool` `bobbin` `card` `piece` `other` |
| `weight_grams` | number | no | Total weight in grams |
| `length_meters` | number | no | Total length in meters |

### Money

```json
{ "amount": 14.50, "currency": "USD" }
```

### Photo

```json
{ "uri": "photos/mat-001.jpg", "is_primary": true, "caption": "Fresh from Rhinebeck" }
```

## Craft Extensions

The `material_type` field determines which craft extension applies. An app reads the type and looks for the matching `ext.*` block.

### ext.yarn — For knitters, crocheters, weavers

```json
"ext": {
  "yarn": {
    "weight_category": "worsted",
    "fiber_content": [
      { "fiber": "merino", "percentage": 80 },
      { "fiber": "nylon", "percentage": 20 }
    ],
    "ply": 4,
    "colorway": "Whales Road",
    "dye_lot": "B1234",
    "yarn_weight_name": "Rios",
    "recommended_needle_mm": [4.5, 5.0],
    "recommended_hook_mm": [5.0, 5.5],
    "gauge": {
      "stitches_per_unit": 18,
      "rows_per_unit": 24,
      "unit": "4in"
    },
    "care": ["machine_wash_cold", "tumble_dry_low"],
    "texture": "plied, slightly fuzzy",
    "held_together": "single"
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `weight_category` | enum | `lace` `fingering` `sport` `dk` `worsted` `aran` `bulky` `super_bulky` `jumbo` `thread` `cobweb` |
| `fiber_content` | FiberContent[] | Fiber composition with percentages |
| `ply` | number | Number of plies |
| `colorway` | string | Colorway name |
| `dye_lot` | string | Dye lot identifier |
| `recommended_needle_mm` | number[] | Suggested needle sizes |
| `recommended_hook_mm` | number[] | Suggested hook sizes |
| `gauge` | Gauge | Manufacturer's suggested gauge |
| `care` | string[] | Care instructions |
| `texture` | string | Freetext texture description |
| `held_together` | enum | `single` `2_together` `3_together` |

### ext.fabric — For sewists, quilters

```json
"ext": {
  "fabric": {
    "fabric_type": "quilting_cotton",
    "width_cm": 112,
    "thread_count": 200,
    "weave_type": "plain",
    "print": "floral",
    "collection": "Liberty Tana Lawn",
    "care": ["machine_wash_warm", "iron_medium"],
    "pre_washed": true,
    "grain_direction_marked": true
  }
}
```

### ext.thread — For embroiderers, cross-stitchers

```json
"ext": {
  "thread": {
    "thread_type": "stranded_cotton",
    "strand_count": 6,
    "brand_number": "DMC 3761",
    "color_family": "blue",
    "finish": "matte"
  }
}
```

### ext.roving — For spinners

```json
"ext": {
  "roving": {
    "fiber_prep": "combed_top",
    "micron_count": 21.5,
    "staple_length_cm": 10,
    "fiber_source": "Rambouillet",
    "dye_method": "hand_painted",
    "intended_yarn_weight": "fingering",
    "wpi_target": 14
  }
}
```

### ext.floss — For embroiderers, cross-stitchers

```json
"ext": {
  "floss": {
    "brand_system": "dmc",
    "brand_number": "3761",
    "strand_count": 6,
    "material": "cotton",
    "finish": "mercerized"
  }
}
```

## Platform Extensions

These link a material to external platforms:

### ext.ravelry

```json
"ext": {
  "ravelry": {
    "stash_id": 12345678,
    "yarn_id": 87654,
    "yarn_company_id": 321,
    "yarn_permalink": "malabrigo-rios",
    "company_permalink": "malabrigo"
  }
}
```

### ext.stash2go

```json
"ext": {
  "stash2go": {
    "matchmaker_score": 0.85,
    "last_matched_at": "2026-03-15T10:00:00Z"
  }
}
```

## Complete Example

```json
{
  "weft_version": "1.0",
  "type": "material",
  "exported_at": "2026-04-04T18:00:00Z",
  "exported_from": { "app": "stash2go", "version": "1.23" },
  "items": [
    {
      "id": "mat-001",
      "name": "Malabrigo Rios - Whales Road",
      "material_type": "yarn",
      "craft": ["knitting", "crochet"],
      "quantity": {
        "value": 3,
        "unit": "skein",
        "weight_grams": 300,
        "length_meters": 576
      },
      "status": "in_stash",
      "acquired_date": "2025-06-15",
      "acquired_from": "Rhinebeck Sheep & Wool",
      "acquired_price": { "amount": 43.50, "currency": "USD" },
      "color_description": "Deep teal blue",
      "color_hex": "#2A4B6F",
      "brand": "Malabrigo",
      "product_line": "Rios",
      "notes": "Enough for a sweater. Thinking about the Carbeth cardigan.",
      "photos": [
        { "uri": "photos/mat-001-1.jpg", "is_primary": true }
      ],
      "tags": ["superwash", "merino", "rhinebeck-2025", "sweater-quantity"],
      "location": "Yarn closet, shelf 2",
      "created_at": "2025-06-15T14:30:00Z",
      "updated_at": "2026-04-04T18:00:00Z",
      "ext": {
        "yarn": {
          "weight_category": "worsted",
          "fiber_content": [
            { "fiber": "superwash merino", "percentage": 100 }
          ],
          "ply": 4,
          "colorway": "Whales Road",
          "dye_lot": "B1234",
          "recommended_needle_mm": [4.5, 5.5],
          "gauge": {
            "stitches_per_unit": 18,
            "rows_per_unit": 24,
            "unit": "4in"
          },
          "care": ["machine_wash_cold", "tumble_dry_low"]
        },
        "ravelry": {
          "stash_id": 12345678,
          "yarn_id": 87654
        }
      }
    },
    {
      "id": "mat-002",
      "name": "Liberty Tana Lawn - Betsy",
      "material_type": "fabric",
      "craft": ["sewing", "quilting"],
      "quantity": {
        "value": 2.5,
        "unit": "meter_fabric"
      },
      "status": "in_stash",
      "brand": "Liberty of London",
      "product_line": "Tana Lawn",
      "color_description": "Blue floral on white",
      "tags": ["liberty", "cotton", "dress-project"],
      "ext": {
        "fabric": {
          "fabric_type": "lawn",
          "width_cm": 136,
          "thread_count": 300,
          "weave_type": "plain",
          "print": "Betsy S",
          "collection": "Tana Lawn Classics",
          "pre_washed": false
        }
      }
    },
    {
      "id": "mat-003",
      "name": "Corriedale Roving - Sunset",
      "material_type": "roving",
      "craft": ["spinning"],
      "quantity": {
        "value": 1,
        "unit": "piece",
        "weight_grams": 200
      },
      "status": "in_stash",
      "acquired_from": "Indie dyer on Etsy",
      "tags": ["hand-dyed", "corriedale"],
      "ext": {
        "roving": {
          "fiber_prep": "combed_top",
          "micron_count": 27,
          "fiber_source": "Corriedale",
          "dye_method": "hand_painted",
          "intended_yarn_weight": "dk"
        }
      }
    }
  ]
}
```

## Open Questions

1. **Should `material_type` be extensible?** Current enum covers most crafts. But what about beadwork, leathercraft, wire jewelry? Option: allow `other` + `ext.custom_material { type_name: "leather" }`.

2. **Quantity units**: Is the current list complete? Do we need `fat_eighth`, `jelly_roll`, `charm_pack` for quilters? These are composite units (a fat quarter is 18"x22"). Proposal: support composite quantities or keep it simple with `piece` + notes.

3. **Fiber content percentages**: Should they be required to sum to 100? What about "unknown" fiber content?

4. **Photo storage**: URIs only (lightweight) or allow embedded base64 for small thumbnails? Proposal: URI-only in `.weft`, optional `.weft.zip` bundle for files + photos.

## Compatibility Mapping

| App / Platform | Maps to core | Maps to ext |
|---------------|-------------|-------------|
| Ravelry Stash API | name, quantity, status, tags, notes, photos | ext.yarn (weight, fiber, colorway, gauge), ext.ravelry (IDs) |
| YarnBuddy | name, quantity, status, brand, product_line | ext.yarn (weight, fiber, colorway) |
| Baa | name, quantity, status, photos | ext.yarn (weight, fiber) |
| Sewing Pattern Database | name, quantity, status, brand | ext.fabric (width, type, collection) |
| Stitchly (cross-stitch) | name, quantity, status | ext.floss (brand_number, strand_count) |
