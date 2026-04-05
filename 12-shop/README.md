# 12 — Shop

> Yarn shops, fabric stores, and craft supply retailers. Where crafters buy their materials.

## Overview

A `Shop` describes a craft supply retailer — a local yarn shop, an online store, or a fiber arts market vendor. Shops connect the material supply chain: they carry Products (10-product), and crafters acquire Materials (02-material) from them.

### Why shops in WEFT?

Shops are referenced throughout craft data: where you bought your yarn (Material.packs[].acquired_from), where a yarn is available (Product availability), and as community gathering places. Having a structured shop entity enables shop finders, purchase history, and community features.

## Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `name` | string | yes | Shop name |
| `shop_type` | string | no | `local-yarn-shop`, `online`, `big-box`, `market-vendor`, `mill`, `other` |
| `address` | Address | no | Physical address |
| `geo` | GeoPoint | no | GPS coordinates |
| `phone` | string | no | Phone number |
| `email` | string | no | Contact email |
| `url` | string | no | Website URL |
| `description` | string | no | Shop description |
| `hours` | string | no | Opening hours (freetext) |
| `closed` | boolean | no | Whether permanently closed |
| `amenities` | string[] | no | `free-wifi`, `parking`, `seating`, `wheelchair-access`, `classes`, `events` |
| `brands` | string[] | no | Yarn/fabric brands carried |
| `social` | SocialLinks | no | Social media links |
| `photos` | Photo[] | no | Shop images |
| `notes` | string | no | Personal notes |
| `tags` | string[] | no | User tags |
| `external_ids` | ExternalIds | no | Platform-specific identifiers |
| `created_at` | datetime | no | Record created |
| `updated_at` | datetime | no | Record last modified |

### Address

```json
{
  "street": "123 Fiber Lane",
  "city": "Portland",
  "state": "OR",
  "postal_code": "97201",
  "country": "US"
}
```

### GeoPoint

```json
{ "latitude": 45.5231, "longitude": -122.6765 }
```

### SocialLinks

```json
{
  "facebook": "https://facebook.com/yarnshop",
  "instagram": "@yarnshop"
}
```

## Example

```json
{
  "weft_version": "1.0",
  "type": "shop",
  "items": [
    {
      "id": "shop-001",
      "name": "Knit Purl",
      "shop_type": "local-yarn-shop",
      "address": {
        "street": "1101 SW Alder St",
        "city": "Portland",
        "state": "OR",
        "postal_code": "97205",
        "country": "US"
      },
      "geo": { "latitude": 45.5211, "longitude": -122.6838 },
      "url": "https://www.knitpurl.com",
      "description": "Portland's premier yarn shop since 2002",
      "hours": "Mon-Sat 10am-6pm, Sun 11am-5pm",
      "amenities": ["seating", "classes", "events"],
      "brands": ["Malabrigo", "Brooklyn Tweed", "Shibui"],
      "external_ids": { "ravelry": "1234" }
    }
  ]
}
```
