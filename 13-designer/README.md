# 13 — Designer

> Pattern designers and authors. The people who create the instructions crafters follow.

## Overview

A `Designer` is a pattern author — a person or studio that publishes craft patterns. Designers are referenced by Patterns (06-pattern) and can be favorited (09-favorite). Having designers as a standalone entity enables proper attribution, deduplication, and discovery.

### Why a separate entity?

Pattern (06) has an inline `designer` field (DesignerRef with name, id, url). This standalone entity carries the full profile: bio, pattern counts, linked user accounts, and website links. The inline `designer` in Pattern references this entity by `id`.

## Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `name` | string | yes | Designer/studio name |
| `bio` | string | no | About the designer |
| `url` | string | no | Primary website URL |
| `patterns_count` | integer | no | Total pattern count |
| `knitting_pattern_count` | integer | no | Knitting patterns |
| `crochet_pattern_count` | integer | no | Crochet patterns |
| `favorites_count` | integer | no | Times favorited (snapshot at export) |
| `social` | SocialLinks | no | Social media / website links |
| `photos` | Photo[] | no | Designer photos |
| `external_ids` | ExternalIds | no | Platform-specific identifiers |
| `created_at` | datetime | no | Record created |
| `updated_at` | datetime | no | Record last modified |

### SocialLinks

```json
{
  "website": "https://katedaviesdesigns.com",
  "instagram": "@katedaviesdesigns",
  "ravelry": "https://www.ravelry.com/designers/kate-davies"
}
```

## Example

```json
{
  "weft_version": "1.0",
  "type": "designer",
  "items": [
    {
      "id": "designer-001",
      "name": "Kate Davies",
      "bio": "Scottish knitwear designer inspired by landscape, history, and colour.",
      "url": "https://katedaviesdesigns.com",
      "patterns_count": 85,
      "knitting_pattern_count": 85,
      "crochet_pattern_count": 0,
      "favorites_count": 45000,
      "social": {
        "website": "https://katedaviesdesigns.com",
        "instagram": "@katedaviesdesigns",
        "ravelry": "https://www.ravelry.com/designers/kate-davies"
      },
      "external_ids": { "ravelry": "24680" }
    }
  ]
}
```
