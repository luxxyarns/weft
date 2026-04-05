# 05 — Tool

> Needles, hooks, looms, wheels, accessories — your craft tool inventory.

## Overview

A `Tool` represents a physical craft tool you own. Tools can be organized into sets (e.g., interchangeable needle set), assigned to projects, and tracked when loaned out.

## Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `category` | string | no | `needle`, `hook`, `loom`, `wheel`, `spindle`, `e-spinner`, `sewing-machine`, `hoop`, `frame`, `shuttle`, `ruler`, `rotary-cutter`, `cutting-mat`, `iron`, `accessory`, `notion`, `other` |
| `tool_type` | string | no | Specific type: `circular`, `dpn`, `straight`, `interchangeable`, `fixed`, `crochet_hook`, `tunisian`, `rigid_heddle`, etc. |
| `name` | string | no | Tool name |
| `brand` | string | no | Manufacturer |
| `model` | string | no | Model name |
| `material` | string | no | `bamboo`, `metal`, `wood`, `plastic`, `carbon`, etc. |
| `color` | string | no | Tool color |
| `metric_size_mm` | number | no | Needle/hook size in mm |
| `us_size` | string | no | US needle size designation |
| `hook_size` | string | no | Crochet hook letter |
| `length_cm` | number | no | Length in cm |
| `length_inches` | number | no | Length in inches |
| `quantity` | integer | no | How many (default 1) |
| `notes` | string | no | Personal notes |
| `is_archived` | boolean | no | Retired/no longer used |
| `set_id` | string | no | ToolSet this belongs to |
| `set_role` | string | no | Role within set |
| `loaned_to` | string | no | Who currently has it |
| `loaned_date` | date | no | When loaned out |
| `project_assignments` | string[] | no | Project IDs currently assigned to |
| `external_ids` | ExternalIds | no | Platform-specific identifiers |

## Tool Sets

A set groups tools that belong together:

```json
{
  "id": "set-001",
  "name": "ChiaoGoo Red Lace Interchangeables",
  "brand": "ChiaoGoo",
  "tool_ids": ["tool-001", "tool-002", "tool-003"]
}
```

## Example

```json
{
  "weft_version": "1.0",
  "type": "tool",
  "items": [
    {
      "id": "tool-001",
      "category": "needle",
      "tool_type": "circular",
      "brand": "ChiaoGoo",
      "model": "Red Lace",
      "material": "metal",
      "metric_size_mm": 5.0,
      "us_size": "8",
      "length_cm": 80,
      "set_id": "set-001",
      "project_assignments": ["proj-001"],
      "external_ids": { "ravelry": "12345" }
    }
  ],
  "sets": [
    {
      "id": "set-001",
      "name": "ChiaoGoo Red Lace Set",
      "brand": "ChiaoGoo",
      "tool_ids": ["tool-001", "tool-002", "tool-003"]
    }
  ]
}
```
