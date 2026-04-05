# Material Type: Roving

> Extension for `material_type: "roving"` — covers combed top, roving, batts, rolags, and other unspun fiber preparations.

## When to Use

Apply `ext.roving` when `material_type` is `"roving"`. This covers fiber preparations used in handspinning and felting.

## Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fiber_prep` | enum | no | `combed-top` `roving` `batt` `rolag` `cloud` `lock` `raw-fleece` `other` |
| `micron_count` | number | no | Fiber diameter in microns |
| `staple_length_cm` | number | no | Average staple length |
| `fiber_source` | string | no | Breed or plant source ("Merino", "BFL", "Flax") |
| `dye_method` | string | no | `undyed` `hand_painted` `kettle_dyed` `solid` `gradient` `natural_color` `other` |
| `intended_yarn_weight` | string | no | Target yarn weight after spinning |
| `wpi_target` | number | no | Target wraps per inch |
| `fiber_content` | FiberContent[] | no | Fiber composition with percentages (same structure as yarn) |
| `fiber_attributes` | string[] | no | Fiber attributes: `superwash`, `hand-dyed`, `organic`, etc. See `99-taxonomy/fiber-attribute.yaml` |
| `spinning_project_id` | string | no | Reference to the spinning project using this fiber |

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
      "fiber_prep": "combed-top",
      "micron_count": 23,
      "fiber_source": "Polwarth",
      "fiber_content": [{ "fiber": "polwarth", "percentage": 100 }],
      "fiber_attributes": ["hand-dyed"],
      "dye_method": "hand-painted",
      "intended_yarn_weight": "sport",
      "wpi_target": 12,
      "spinning_project_id": "proj-spin-001"
    }
  }
}
```
