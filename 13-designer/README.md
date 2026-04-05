# 13 — Designer

> Pattern designers, authors, studios, and brands. The people and entities who create craft patterns.

## Overview

A `Designer` is a pattern creator — an individual, a design studio, or a company brand that publishes craft patterns. Designers are referenced by Patterns (06-pattern) via `ContributorRef` and can be favorited (09-favorite).

### Why a separate entity?

Pattern (06) has inline `ContributorRef` fields (name, id, url, role). This standalone entity carries the full profile: bio, pattern counts, studio members, shop links, and social presence. The inline `designer.id` in Pattern references this entity.

## Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `name` | string | yes | Designer/studio/brand name |
| `entity_type` | string | no | `person`, `studio`, `brand` |
| `bio` | string | no | About the designer |
| `url` | string | no | Primary website URL |
| `country` | string | no | Country code (ISO 3166-1) |
| `languages` | string[] | no | Languages published in (ISO 639-1) |
| `pronouns` | string | no | Preferred pronouns |
| `active_since` | date | no | When the designer started publishing |
| `inactive_since` | date | no | When the designer stopped publishing (if applicable) |
| `aliases` | string[] | no | Alternative names, former names, studio variants (for deduplication) |
| `roles` | string[] | no | What this entity does: `designer`, `tech-editor`, `translator`, `publisher`, etc. |
| `members` | MemberRef[] | no | For studios/brands: individual members within the entity |
| `patterns_count` | integer | no | Total pattern count |
| `knitting_pattern_count` | integer | no | Knitting patterns |
| `crochet_pattern_count` | integer | no | Crochet patterns |
| `favorites_count` | integer | no | Times favorited (snapshot at export) |
| `shop_links` | ShopLink[] | no | Where to buy this designer's patterns (separate from social) |
| `social` | object | no | Social media links (keys: website, instagram, youtube, podcast, blog) |
| `photos` | Photo[] | no | Designer photos |
| `external_ids` | ExternalIds | no | Platform-specific identifiers |

### MemberRef

For studios/brands — individual designers within the entity:

```json
{
  "designer_id": "designer-003",
  "name": "Lydia Gluck",
  "role": "co-founder"
}
```

### ShopLink

```json
{
  "name": "Ravelry Store",
  "url": "https://www.ravelry.com/designers/kate-davies"
}
```

## Examples

```json
{
  "id": "designer-001",
  "name": "Kate Davies",
  "entity_type": "person",
  "bio": "Scottish knitwear designer inspired by landscape, history, and colour.",
  "url": "https://katedaviesdesigns.com",
  "country": "GB",
  "languages": ["en"],
  "active_since": "2010-01-01",
  "roles": ["designer", "author"],
  "aliases": ["Kate Davies Designs"],
  "patterns_count": 85,
  "shop_links": [
    { "name": "Own Website", "url": "https://shop.katedaviesdesigns.com" }
  ],
  "social": { "instagram": "@katedaviesdesigns" },
  "external_ids": { "ravelry": "24680" }
}
```

Studio example:

```json
{
  "id": "designer-002",
  "name": "Pom Pom Publishing",
  "entity_type": "studio",
  "roles": ["publisher"],
  "members": [
    { "designer_id": "designer-003", "name": "Lydia Gluck", "role": "co-founder" },
    { "designer_id": "designer-004", "name": "Meghan Fernandes", "role": "co-founder" }
  ]
}
```

See `examples/designer.weft` for a complete export file.
