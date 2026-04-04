# 02 — Material

> Anything you craft with: yarn, fabric, thread, roving, floss, beads, cord...

## Overview

`Material` is the most fundamental WEFT entity. It represents a physical item in your stash — something you own, plan to use, or have used in a project.

The core schema describes **what any craft material has in common**: a name, a quantity, a status, and metadata. Type-specific details live in a nested block named after the `material_type`.

## Polymorphism

The `material_type` field determines which nested block carries the type-specific fields:

```json
{
  "name": "Malabrigo Rios",
  "material_type": "yarn",
  "quantity": { "value": 3, "unit": "skein" },
  "yarn": { "weight_category": "worsted", "fiber_content": [...] }
}
```

```json
{
  "name": "Liberty Tana Lawn",
  "material_type": "fabric",
  "quantity": { "value": 2.5, "unit": "meter-fabric" },
  "fabric": { "fabric_type": "lawn", "width_cm": 136 }
}
```

An app that doesn't understand `fabric` simply shows the core fields (name, quantity, status). No crash, no data loss.

## Core Fields

Every material, regardless of type, has these attributes:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `name` | string | yes | Display name |
| `material_type` | string | yes | See `09-taxonomy/material-type.yaml` |
| `craft` | string[] | no | Intended crafts. See `09-taxonomy/craft.yaml` |
| `quantity` | Quantity | yes | How much you have |
| `status` | string | yes | See `09-taxonomy/status.yaml` |
| `acquired_date` | date | no | When acquired |
| `acquired_from` | string | no | Source (shop name, gift, etc.) |
| `acquired_price` | Money | no | What you paid |
| `color_description` | string | no | Freetext color |
| `color_hex` | string | no | Hex color for UI |
| `color_family` | string | no | See `09-taxonomy/color-family.yaml` |
| `brand` | string | no | Manufacturer/brand |
| `product_line` | string | no | Product line within brand |
| `notes` | string | no | Freetext notes |
| `photos` | Photo[] | no | Images |
| `tags` | string[] | no | User tags |
| `location` | string | no | Physical storage location |
| `created_at` | datetime | no | Record created |
| `updated_at` | datetime | no | Record last modified |

### Quantity

```json
{ "value": 3, "unit": "skein", "weight_grams": 300, "length_meters": 576 }
```

Units: see `09-taxonomy/unit.yaml`

### Money

```json
{ "amount": 14.50, "currency": "USD" }
```

### Photo

```json
{ "uri": "photos/mat-001.jpg", "is_primary": true, "caption": "Fresh from Rhinebeck" }
```

## Type-Specific Fields

Each `material_type` has its own nested block with type-specific fields. These are documented in subfolders:

| Type | Subfolder | Key fields |
|------|-----------|------------|
| yarn | [types/yarn/](types/yarn/) | weight_category, fiber_content, colorway, ply, gauge, care |
| fabric | [types/fabric/](types/fabric/) | fabric_type, width_cm, thread_count, weave_type, print |
| roving | [types/roving/](types/roving/) | fiber_prep, micron_count, fiber_source, dye_method |
| thread | types/thread/ | thread_type, ply, brand_line |
| floss | types/floss/ | brand_system, brand_number, strand_count |

## Examples

- [yarn-stash.weft](examples/yarn-stash.weft) — Knitter's yarn stash (2 items)
- [mixed-stash.weft](examples/mixed-stash.weft) — Multi-craft stash: yarn + fabric + floss + roving

## Open Questions

1. **Should `material_type` be extensible?** Current list covers most crafts. What about beadwork, leathercraft? Allow `"other"` with freetext type name?
2. **Fiber content percentages** — must they sum to 100? What about "unknown" composition?
3. **Photo storage** — URIs only, or support `.weft.zip` bundles with embedded photos?
