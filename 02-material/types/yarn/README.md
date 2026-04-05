# Material Type: Yarn

> Fields for `material_type: "yarn"` — covers knitting yarn, crochet yarn, weaving yarn, and handspun.

## When to Use

Set `material_type: "yarn"` and populate the `yarn` block directly on the Material object (not inside `ext`).

Note: `fiber_content` and `care` are top-level Material fields (shared across all material types), not inside the `yarn` block.

## Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `weight_category` | enum | no | `lace` `fingering` `sport` `dk` `worsted` `aran` `bulky` `super-bulky` `jumbo` `thread` `cobweb` |
| `ply` | number | no | Number of plies |
| `colorway` | string | no | Colorway name (top-level Material field, not yarn-specific) |
| `dye_lot` | string | no | Dye lot identifier (top-level Material field) |
| `put_up` | enum | no | Physical form: `hank` `skein` `ball` `cake` `cone` `bobbin` `other` |
| `superwash` | boolean | no | Whether superwash-treated |
| `weight_name` | string | no | Manufacturer's weight name (may differ from category) |
| `weight_name_long` | string | no | Extended weight description (e.g. "Aran / 10 ply") |
| `personal_weight_override` | string | no | User-assigned weight when it differs from the product |
| `thread_size` | string | no | Thread size for lace/thread-weight yarns (e.g. "10", "20") |
| `recommended_needle_mm` | number[] | no | Suggested needle sizes in mm |
| `recommended_hook_mm` | number[] | no | Suggested hook sizes in mm |
| `wraps_per_inch` | number | no | WPI measurement |
| `gauge` | YarnGauge | no | Manufacturer's suggested gauge |
| `texture` | string | no | Freetext texture description |
| `held_together` | enum | no | `single` `2-together` `3-together` |

### FiberContent (top-level Material field)

```json
{ "fiber": "merino", "percentage": 80, "fiber_origin": "animal", "fiber_category": "wool" }
```

### YarnGauge

```json
{
  "stitches_per_unit": 18,
  "rows_per_unit": 24,
  "unit": "4in"
}
```

## Example

```json
{
  "id": "mat-001",
  "name": "Malabrigo Rios - Whales Road",
  "material_type": "yarn",
  "status": "in-stash",
  "quantity": { "units_count": 3, "unit_label": "skein", "weight_grams": 300, "length_meters": 576 },
  "fiber_content": [
    { "fiber": "superwash merino", "percentage": 100, "fiber_origin": "animal" }
  ],
  "colorway": "Whales Road",
  "care": ["machine-wash-cold", "tumble-dry-low"],
  "yarn": {
    "weight_category": "worsted",
    "ply": 4,
    "superwash": true,
    "put_up": "skein",
    "recommended_needle_mm": [4.5, 5.5],
    "gauge": { "stitches_per_unit": 18, "rows_per_unit": 24, "unit": "4in" }
  }
}
```
