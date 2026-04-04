# Material Type: Fabric

> Extension for `material_type: "fabric"` — covers quilting cotton, linen, silk, knit fabric, and any woven/knit textile.

## When to Use

Apply `ext.fabric` when `material_type` is `"fabric"`. This covers flat goods used in sewing, quilting, and garment making.

## Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `fabric_type` | string | no | `quilting_cotton` `linen` `silk` `wool` `denim` `knit` `jersey` `lawn` `voile` `canvas` `fleece` `flannel` `other` |
| `width_cm` | number | no | Fabric width (bolt width) |
| `thread_count` | number | no | Threads per inch |
| `weave_type` | string | no | `plain` `twill` `satin` `jacquard` `other` |
| `print` | string | no | Print/pattern name |
| `collection` | string | no | Fabric collection name |
| `care` | string[] | no | Care instructions |
| `pre_washed` | boolean | no | Whether pre-washed/pre-shrunk |
| `grain_direction_marked` | boolean | no | Whether grain is marked |
| `stretch` | string | no | `none` `2_way` `4_way` |

## Example

```json
{
  "id": "fab-001",
  "name": "Liberty Tana Lawn - Betsy",
  "material_type": "fabric",
  "quantity": { "value": 2.5, "unit": "meter_fabric" },
  "status": "in_stash",
  "brand": "Liberty of London",
  "ext": {
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
}
```
