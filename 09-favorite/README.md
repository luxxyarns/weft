# 09 — Favorite

> Things you've bookmarked: patterns, projects, yarns, designers, shops — organized with tags and bundles.

## Overview

A `Favorite` is a bookmark — something you've saved for later. Favorites can be organized with tags and grouped into **Bundles** (curated collections).

WEFT separates favorites from the items they reference. A favorite is metadata (comment, tags, date) pointing at an entity. The entity itself (pattern, project, yarn) lives in its own spec.

### Favorite vs Queue

| | Favorite (09) | Queue (08) |
|---|---|---|
| **Intent** | "I like this" / "Save for later" | "I want to make this" |
| **Has yarn plans** | No | Yes |
| **Has timeline** | No | Yes |
| **Organized by** | Tags, bundles | Position/priority |

## Favorite

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `type` | string | yes | What was favorited: `pattern`, `project`, `yarn`, `stash`, `designer`, `shop`, `bundle`, `forum-post` |
| `item_id` | string | no | ID of the favorited entity (within this WEFT file or external) |
| `item_name` | string | no | Display name of the favorited item (for when item_id is unresolvable) |
| `comment` | string | no | Personal note about why you saved this |
| `tags` | string[] | no | Tags for organizing favorites |
| `bundles` | string[] | no | Bundle IDs this favorite belongs to |
| `favorited_at` | datetime | no | When this was bookmarked |
| `external_ids` | ExternalIds | no | Platform-specific identifiers |

## Bundle

A curated collection of favorites. Like a playlist, but for craft items.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `name` | string | yes | Bundle name |
| `description` | string | no | Bundle description |
| `privacy` | string | no | `public`, `private`, `friends` |
| `items` | BundleItem[] | no | Items in this bundle |
| `cover_photo` | Photo | no | Bundle cover image |
| `tags` | string[] | no | Tags |
| `external_ids` | ExternalIds | no | Platform-specific identifiers |
| `created_at` | datetime | no | Record created |
| `updated_at` | datetime | no | Record last modified |

### BundleItem

```json
{
  "favorite_id": "fav-001",
  "item_type": "pattern",
  "item_id": "pat-001",
  "item_name": "Carbeth Cardigan",
  "notes": "Perfect for the Rios in my stash",
  "added_at": "2026-03-15T10:00:00Z"
}
```

## File Format

Favorites and bundles are exported together:

```json
{
  "weft_version": "1.0",
  "type": "favorite",
  "exported_at": "2026-04-05T12:00:00Z",
  "exported_from": { "app": "stash2go", "version": "1.23" },
  "items": [
    {
      "id": "fav-001",
      "type": "pattern",
      "item_id": "pat-001",
      "item_name": "Carbeth Cardigan",
      "comment": "Love the yoke pattern",
      "tags": ["sweaters", "colorwork"],
      "bundles": ["bundle-001"],
      "favorited_at": "2026-03-10T14:30:00Z",
      "external_ids": { "ravelry": "55443322" }
    }
  ],
  "bundles": [
    {
      "id": "bundle-001",
      "name": "Winter Sweater Inspiration",
      "description": "Patterns for next winter",
      "privacy": "public",
      "items": [
        {
          "favorite_id": "fav-001",
          "item_type": "pattern",
          "item_id": "pat-001",
          "item_name": "Carbeth Cardigan",
          "added_at": "2026-03-10T14:30:00Z"
        }
      ],
      "external_ids": { "ravelry": "112233" }
    }
  ]
}
```

## Open Questions

1. **Should bundles be a separate entity type?** Currently embedded in the favorite file. Could be standalone for large collections.
2. **Item type coverage** — Ravelry allows favoriting forum posts, yarn brands, shops. Should WEFT support all these, or limit to craft entities?
