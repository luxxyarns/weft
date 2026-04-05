# 02 — Material

> Anything you craft with: yarn, fabric, thread, roving, floss, beads, cord...

## Overview

`Material` is the most fundamental WEFT entity. It represents a physical item in your stash — something you own, plan to use, or have used in a project.

The core schema describes **what any craft material has in common**: a name, a quantity, a status, and metadata. Type-specific details live in a nested block named after the `material_type`.

## Relationship to Product (10-product)

A Material is **your inventory**. A Product is **what the company sells**. They're related but separate:

**With product reference** (preferred — no duplication):
```json
{
  "name": "Malabrigo Rios - Whales Road",
  "material_type": "yarn",
  "quantity": { "value": 3, "unit": "skein" },
  "status": "in-stash",
  "product_ref": { "product_id": "malabrigo-rios" },
  "yarn": { "colorway": "Whales Road", "dye_lot": "B1234" }
}
```
The product specs (weight, fiber, gauge) live in the Product entity. The Material only stores what's unique to your specific item: colorway, dye lot, quantity, status, location.

**Without product reference** (self-contained):
```json
{
  "name": "Malabrigo Rios - Whales Road",
  "material_type": "yarn",
  "quantity": { "value": 3, "unit": "skein" },
  "status": "in-stash",
  "yarn": { "weight_category": "worsted", "fiber_content": [...], "colorway": "Whales Road" }
}
```
All product data is inline. Works without a product catalog. Simpler but duplicates data across stash entries of the same yarn.

Both approaches are valid WEFT. Apps choose based on whether they maintain a product catalog.

## Polymorphism

The `material_type` field determines which nested block carries the type-specific fields. An app that doesn't understand `fabric` simply shows the core fields (name, quantity, status). No crash, no data loss.

## Core Fields

Every material, regardless of type, has these attributes:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `name` | string | yes | Display name |
| `material_type` | string | yes | See `99-taxonomy/material-type.yaml` |
| `status` | string | yes | See `99-taxonomy/status.yaml` |
| `craft` | string[] | no | Intended crafts. See `99-taxonomy/craft.yaml` |
| `quantity` | Quantity | no | Total quantity (aggregate when packs are present) |
| `packs` | Pack[] | no | Individual acquisitions/lots. See Packs below. |
| `acquired_date` | date | no | When acquired (top-level default, packs can override) |
| `acquired_from` | string | no | Source (shop name, gift, etc.) |
| `acquired_price` | Money | no | What you paid |
| `acquired_url` | string | no | URL where purchased (online shop link) |
| `source_url` | string | no | URL of this item on its source platform |
| `product_ref` | ProductRef | no | Reference to a Product entity (10-product) |
| `color_description` | string | no | Freetext color |
| `color_hex` | string | no | Hex color for UI |
| `color_family` | string | no | See `99-taxonomy/color-family.yaml` |
| `brand` | string | no | Manufacturer/brand |
| `product_line` | string | no | Product line within brand |
| `notes` | string | no | Freetext notes |
| `photos` | Photo[] | no | Images |
| `tags` | string[] | no | User tags |
| `location` | string | no | Physical storage location |
| `external_ids` | ExternalIds | no | Platform-specific identifiers (e.g. `{"ravelry": "12345"}`) |
| `created_at` | datetime | no | Record created |
| `updated_at` | datetime | no | Record last modified |

### Packs

A single stash entry may represent multiple acquisitions. For example, you might have 5 skeins of the same yarn bought at 3 different shops over 2 years, with some already allocated to projects. Packs capture this:

```json
{
  "name": "Madelinetosh Tosh Merino Light - Cousteau",
  "material_type": "yarn",
  "quantity": { "value": 5, "unit": "skein", "weight_grams": 500, "length_meters": 1828 },
  "status": "in-stash",
  "packs": [
    {
      "id": "pack-001",
      "quantity": { "value": 2, "unit": "skein", "weight_grams": 200, "length_meters": 731 },
      "dye_lot": "A123",
      "acquired_date": "2025-06-15",
      "acquired_from": "Rhinebeck Sheep & Wool",
      "acquired_price": { "amount": 29.00, "currency": "USD" }
    },
    {
      "id": "pack-002",
      "quantity": { "value": 2, "unit": "skein", "weight_grams": 200, "length_meters": 731 },
      "dye_lot": "B456",
      "acquired_date": "2025-09-01",
      "acquired_from": "Loopy Mango (online)",
      "acquired_url": "https://loopymango.com/...",
      "project_id": "proj-001"
    },
    {
      "id": "pack-003",
      "quantity": { "value": 1, "unit": "skein", "weight_grams": 100, "length_meters": 366 },
      "colorway": "Optic",
      "acquired_date": "2026-01-10",
      "acquired_from": "Gift from Mom"
    }
  ]
}
```

When `packs` is present, `quantity` is the aggregate total. The top-level `acquired_*` fields serve as defaults; per-pack fields override them. Each pack can optionally reference a `project_id` to indicate which project it is allocated to or used by.

When `packs` is absent, the material is a simple single-acquisition entry with `quantity` and top-level `acquired_*` fields.

### Quantity

```json
{ "units_count": 3, "unit_label": "skein", "weight_grams": 300, "weight_ounces": 10.6, "length_meters": 576, "length_yards": 630 }
```

Generic across all material types — yarn uses skeins, fabric uses bolts/meters, thread uses cards, fiber uses bumps/braids. Both metric and imperial are stored to avoid conversion precision loss. `area_sq_meters` is available for fabric/batting. See `99-taxonomy/unit.yaml`.

### Money

```json
{ "amount": 14.50, "currency": "USD" }
```

### Photo

```json
{
  "id": "photo-001",
  "uri": "photos/mat-001.jpg",
  "sort_order": 0,
  "is_primary": true,
  "caption": "Fresh from Rhinebeck",
  "copyright_holder": "Jane Doe",
  "aspect_ratio": 1.33
}
```

Photos support multiple images per entity. `sort_order` determines display sequence (lower first). Exactly one photo should have `is_primary: true` — it serves as the cover/thumbnail. `copyright_holder` is recommended (required by some platforms for upload).

### ProductRef

```json
{ "product_id": "malabrigo-rios" }
```

### ExternalIds

```json
{ "ravelry": "12345", "knitcompanion": "abc-def" }
```

Platform-specific identifiers enable deduplication when importing the same entity from multiple sources. See `01-about-weft/README.md` for conventions.

## Type-Specific Fields

Each `material_type` has its own nested block with type-specific fields. These are documented in subfolders:

| Type | Subfolder | Key fields |
|------|-----------|------------|
| yarn | [types/yarn/](types/yarn/) | weight_category, fiber_content, colorway, ply, gauge, care, thread_size |
| fabric | [types/fabric/](types/fabric/) | fabric_type, width_cm, thread_count, weave_type, print |
| roving | [types/roving/](types/roving/) | fiber_prep, micron_count, fiber_source, dye_method, fiber_content, fiber_attributes, spinning_project_id |
| thread | types/thread/ | thread_type, ply, brand_line |
| floss | types/floss/ | brand_system, brand_number, strand_count |

## Examples

- [yarn-stash.weft](examples/yarn-stash.weft) — Knitter's yarn stash with packs
- [mixed-stash.weft](examples/mixed-stash.weft) — Multi-craft stash: yarn + fabric + floss + roving

## Open Questions

1. **Should `material_type` be extensible?** Current list covers most crafts. What about beadwork, leathercraft? Allow `"other"` with freetext type name?
2. **Fiber content percentages** — must they sum to 100? What about "unknown" composition?
3. **Photo storage** — URIs only, or support `.weft.zip` bundles with embedded photos?
