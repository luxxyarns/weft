# 10 — Product

> The universal product catalog: what yarn companies sell, what fabric mills produce, what thread brands offer.

## Overview

A `Product` represents a commercially available craft material — a yarn base, a fabric line, a thread brand. It describes **what something is**, not what you own. Your stash (02-material) is inventory; this is the catalog.

### Product vs Material (Inventory)

| | Product (10-product) | Material (02-material) |
|---|---|---|
| **What it is** | "Malabrigo Rios — worsted, 100% merino, 210yd/100g" | "I have 3 skeins of Rios in Whales Road on shelf 2" |
| **Who defines it** | Yarn company / manufacturer | You (the crafter) |
| **Quantity** | No — it's a catalog entry | Yes — how much you own |
| **Colorway** | Lists all available colorways | Your specific colorway |
| **Status** | Available / discontinued | in-stash / allocated / used-up |
| **Unique per** | Product + colorway | Your personal stash entry |

### How They Link

A Material (inventory) can reference a Product:

```json
{
  "id": "mat-001",
  "name": "Malabrigo Rios - Whales Road",
  "material_type": "yarn",
  "quantity": { "value": 3, "unit": "skein" },
  "status": "in-stash",
  "product_ref": { "product_id": "malabrigo-rios" },
  "yarn": {
    "weight_category": "worsted",
    "colorway": "Whales Road",
    "dye_lot": "B1234"
  }
}
```

The `product_ref` is optional. Materials work fine without it — the `yarn: {}` block carries all needed data inline. But referencing a product enables:
- Shared product data across multiple stash entries (5 colorways of the same yarn)
- Community-maintained product catalog (corrections, updates)
- Less duplication in large stashes

## Core Fields

Every product, regardless of type:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier (permalink-style: `malabrigo-rios`) |
| `name` | string | yes | Product name ("Rios") |
| `brand` | string | yes | Manufacturer/company ("Malabrigo") |
| `product_type` | string | yes | See `09-taxonomy/material-type.yaml` — same values as `material_type` |
| `craft` | string[] | no | Intended crafts |
| `discontinued` | boolean | no | Whether still in production |
| `url` | string | no | Product page URL |
| `description` | string | no | Manufacturer's description |
| `photos` | Photo[] | no | Product images |
| `colorways` | Colorway[] | no | Available colorways |
| `created_at` | datetime | no | Record created |
| `updated_at` | datetime | no | Record last modified |

### Colorway

```json
{
  "name": "Whales Road",
  "color_hex": "#2A4B6F",
  "color_family": "blue",
  "discontinued": false,
  "photo": { "uri": "photos/rios-whales-road.jpg" }
}
```

## Type-Specific Fields

Same polymorphic pattern as Material — `product_type` determines which nested block applies:

### yarn (Product)

Describes the yarn base — constant across all colorways:

```json
{
  "id": "malabrigo-rios",
  "name": "Rios",
  "brand": "Malabrigo",
  "product_type": "yarn",
  "yarn": {
    "weight_category": "worsted",
    "fiber_content": [
      { "fiber": "merino", "percentage": 100 }
    ],
    "ply": 4,
    "skein_weight_grams": 100,
    "skein_length_meters": 192,
    "recommended_needle_mm": [4.5, 5.5],
    "recommended_hook_mm": [5.5, 6.0],
    "gauge": {
      "stitches_per_unit": 18,
      "rows_per_unit": 24,
      "unit": "4in"
    },
    "care": ["machine-wash-cold", "tumble-dry-low"],
    "texture": "plied, soft, slight halo",
    "origin_country": "Uruguay"
  },
  "colorways": [
    { "name": "Whales Road", "color_hex": "#2A4B6F", "color_family": "blue" },
    { "name": "Ravelry Red", "color_hex": "#CC0000", "color_family": "red" },
    { "name": "Natural", "color_hex": "#F5F0E8", "color_family": "white" }
  ]
}
```

### fabric (Product)

```json
{
  "id": "liberty-tana-lawn",
  "name": "Tana Lawn",
  "brand": "Liberty of London",
  "product_type": "fabric",
  "fabric": {
    "fabric_type": "lawn",
    "width_cm": 136,
    "fiber_content": [{ "fiber": "cotton", "percentage": 100 }],
    "thread_count": 300,
    "weave_type": "plain",
    "weight_gsm": 80,
    "origin_country": "United Kingdom"
  },
  "colorways": [
    { "name": "Betsy S - Blue", "color_family": "blue" },
    { "name": "Wiltshire - Red", "color_family": "red" }
  ]
}
```

## File Format

```json
{
  "weft_version": "1.0",
  "type": "product",
  "exported_at": "2026-04-04T22:00:00Z",
  "exported_from": { "app": "stash2go", "version": "1.23" },
  "items": [
    { "id": "malabrigo-rios", "name": "Rios", "brand": "Malabrigo", ... },
    { "id": "liberty-tana-lawn", "name": "Tana Lawn", "brand": "Liberty of London", ... }
  ]
}
```

## Open Questions

1. **Who maintains the product catalog?** Community-contributed? Company-submitted? App-specific? Could be all three — products are identified by `id` and merged from multiple sources.
2. **Colorway as separate entity?** Some yarns have 200+ colorways. Should colorways be their own entity type, or stay embedded?
3. **Ravelry yarn database mapping** — Ravelry has 200K+ yarns. Should WEFT define a mapping or just use `product_ref` with platform-specific IDs?
4. **Versioning of product data** — yarn specs change (reformulations). Track version history or just latest?
