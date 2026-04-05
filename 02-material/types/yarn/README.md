# Material Type: Yarn

> Extension for `material_type: "yarn"` — covers knitting yarn, crochet yarn, weaving yarn, and handspun.

## When to Use

Apply `ext.yarn` when `material_type` is `"yarn"`. This covers any spun fiber intended for knitting, crochet, weaving, or other yarn-based crafts.

## Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `weight_category` | enum | no | `lace` `fingering` `sport` `dk` `worsted` `aran` `bulky` `super_bulky` `jumbo` `thread` `cobweb` |
| `fiber_content` | FiberContent[] | no | Fiber composition with percentages |
| `ply` | number | no | Number of plies |
| `colorway` | string | no | Colorway name |
| `dye_lot` | string | no | Dye lot identifier |
| `yarn_weight_name` | string | no | Manufacturer's weight name (may differ from category) |
| `recommended_needle_mm` | number[] | no | Suggested needle sizes in mm |
| `recommended_hook_mm` | number[] | no | Suggested hook sizes in mm |
| `wraps_per_inch` | number | no | WPI measurement |
| `gauge` | YarnGauge | no | Manufacturer's suggested gauge |
| `care` | string[] | no | Care instructions: `machine_wash_cold` `hand_wash` `dry_clean` `tumble_dry_low` `lay_flat_dry` `iron_low` etc. |
| `texture` | string | no | Freetext texture description |
| `held_together` | enum | no | `single` `2-together` `3-together` |
| `is_handspun` | boolean | no | Whether this yarn was handspun |
| `thread_size` | string | no | Thread size for lace/thread-weight yarns (e.g. "10", "20") |
| `personal_weight_override` | string | no | User-assigned weight category when it differs from the product's weight |

### FiberContent

```json
{ "fiber": "merino", "percentage": 80 }
```

Common fiber values: `merino`, `superwash merino`, `wool`, `alpaca`, `silk`, `cotton`, `linen`, `cashmere`, `mohair`, `nylon`, `acrylic`, `bamboo`, `tencel`, `yak`, `camel`, `angora`, `polyester`, `other`

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
  "quantity": { "value": 3, "unit": "skein", "weight_grams": 300, "length_meters": 576 },
  "status": "in_stash",
  "brand": "Malabrigo",
  "product_line": "Rios",
  "yarn": {
    "weight_category": "worsted",
    "fiber_content": [
      { "fiber": "superwash merino", "percentage": 100 }
    ],
    "ply": 4,
    "colorway": "Whales Road",
    "dye_lot": "B1234",
    "recommended_needle_mm": [4.5, 5.5],
    "gauge": { "stitches_per_unit": 18, "rows_per_unit": 24, "unit": "4in" },
    "care": ["machine-wash-cold", "tumble-dry-low"]
  }
}
```
