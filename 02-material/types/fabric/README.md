# Material Type: Fabric

> Fields for `material_type: "fabric"` — covers quilting cotton, linen, silk, knit fabric, and any woven/knit textile.

## When to Use

Set `material_type: "fabric"` and populate the `fabric` block directly on the Material object (not inside `ext`).

Note: `fiber_content` and `care` are top-level Material fields (shared across all material types).

## Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fabric_type` | string | no | `quilting-cotton` `linen` `silk` `wool` `denim` `knit` `jersey` `lawn` `voile` `canvas` `fleece` `flannel` `other` |
| `width_cm` | number | no | Fabric width (bolt width) |
| `weight_gsm` | number | no | Fabric weight in grams per square meter |
| `thread_count` | number | no | Threads per inch |
| `weave_type` | string | no | `plain` `twill` `satin` `jacquard` `other` |
| `print` | string | no | Print/pattern name |
| `collection` | string | no | Fabric collection name |
| `stretch` | enum | no | `none` `2-way` `4-way` |
| `drape` | enum | no | `crisp` `medium` `drapey` `fluid` |
| `opacity` | enum | no | `opaque` `semi-opaque` `sheer` |
| `pre_washed` | boolean | no | Whether pre-washed/pre-shrunk |
| `grain_direction_marked` | boolean | no | Whether grain is marked |

## Example

```json
{
  "id": "fab-001",
  "name": "Liberty Tana Lawn - Betsy",
  "material_type": "fabric",
  "status": "in-stash",
  "quantity": { "units_count": 2.5, "unit_label": "meter", "area_sq_meters": 3.4 },
  "brand": "Liberty of London",
  "fiber_content": [
    { "fiber": "cotton", "percentage": 100, "fiber_origin": "plant" }
  ],
  "care": ["machine-wash-cold", "iron-low"],
  "fabric": {
    "fabric_type": "lawn",
    "width_cm": 136,
    "thread_count": 300,
    "weave_type": "plain",
    "print": "Betsy S",
    "collection": "Tana Lawn Classics",
    "pre_washed": false,
    "stretch": "none"
  }
}
```
