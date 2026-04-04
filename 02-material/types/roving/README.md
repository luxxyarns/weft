# Material Type: Roving

> Extension for `material_type: "roving"` — covers combed top, roving, batts, rolags, and other unspun fiber preparations.

## When to Use

Apply `ext.roving` when `material_type` is `"roving"`. This covers fiber preparations used in handspinning and felting.

## Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fiber_prep` | enum | no | `combed_top` `roving` `batt` `rolag` `cloud` `lock` `raw_fleece` `other` |
| `micron_count` | number | no | Fiber diameter in microns |
| `staple_length_cm` | number | no | Average staple length |
| `fiber_source` | string | no | Breed or plant source ("Merino", "BFL", "Flax") |
| `dye_method` | string | no | `undyed` `hand_painted` `kettle_dyed` `solid` `gradient` `natural_color` `other` |
| `intended_yarn_weight` | string | no | Target yarn weight after spinning |
| `wpi_target` | number | no | Target wraps per inch |

## Example

```json
{
  "id": "rov-001",
  "name": "Polwarth Top - Northern Lights",
  "material_type": "roving",
  "quantity": { "value": 1, "unit": "piece", "weight_grams": 113 },
  "status": "in_stash",
  "brand": "Three Waters Farm",
  "ext": {
    "roving": {
      "fiber_prep": "combed_top",
      "micron_count": 23,
      "fiber_source": "Polwarth",
      "dye_method": "hand_painted",
      "intended_yarn_weight": "sport",
      "wpi_target": 12
    }
  }
}
```
