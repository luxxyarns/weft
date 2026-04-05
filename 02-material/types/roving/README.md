# Material Type: Roving

> Fields for `material_type: "roving"` — covers combed top, roving, batts, rolags, and other unspun fiber preparations.

## When to Use

Set `material_type: "roving"` and populate the `roving` block directly on the Material object (not inside `ext`).

Note: `fiber_content` is a top-level Material field (shared across all material types), not inside the `roving` block.

## Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fiber_prep` | enum | no | `combed-top` `roving` `batt` `rolag` `cloud` `lock` `raw-fleece` `other` |
| `micron_count` | number | no | Fiber diameter in microns |
| `staple_length_cm` | number | no | Average staple length |
| `fiber_source` | string | no | Breed or plant source ("Merino", "BFL", "Flax") |
| `fiber_attributes` | string[] | no | `superwash`, `hand-dyed`, `organic`, etc. |
| `dye_method` | string | no | `undyed` `hand-painted` `kettle-dyed` `solid` `gradient` `natural-color` `other` |
| `intended_yarn_weight` | string | no | Target yarn weight after spinning |
| `wpi_target` | number | no | Target wraps per inch |
| `fiber_content` | FiberContent[] | no | Fiber composition (top-level Material field) |
| `spinning_project_id` | string | no | Reference to the spinning project using this fiber |

## Example

```json
{
  "id": "rov-001",
  "name": "Polwarth Top - Northern Lights",
  "material_type": "roving",
  "status": "in-stash",
  "quantity": { "units_count": 1, "unit_label": "piece", "weight_grams": 113 },
  "brand": "Three Waters Farm",
  "fiber_content": [
    { "fiber": "polwarth", "percentage": 100, "fiber_origin": "animal" }
  ],
  "roving": {
    "fiber_prep": "combed-top",
    "micron_count": 23,
    "fiber_source": "Polwarth",
    "fiber_attributes": ["hand-dyed"],
    "dye_method": "hand-painted",
    "intended_yarn_weight": "sport",
    "wpi_target": 12,
    "spinning_project_id": "proj-spin-001"
  }
}
```
