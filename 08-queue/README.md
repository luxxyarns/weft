# 08 — Queue

> Projects you plan to make: patterns you want to knit, with yarn and timeline notes.

## Overview

A `QueuedProject` is a planned project — a pattern you want to make, with optional yarn, timeline, and notes. It's the "someday" list that sits between bookmarking a pattern and starting a project.

### Queue vs Project vs Favorite

| | Queue (08) | Project (03) | Favorite (09) |
|---|---|---|---|
| **What it is** | "I want to make this" | "I'm making this" / "I made this" | "I like this" |
| **Has progress** | No | Yes | No |
| **Has yarn allocation** | Optional (planned) | Yes (actual) | No |
| **Has timeline** | Optional (start_by, finish_by) | Actual dates | No |

## Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `position` | integer | no | Sort order in queue (lower = higher priority) |
| `pattern_ref` | PatternRef | no | Reference to the pattern to be made |
| `name` | string | no | User-assigned name for this queue entry |
| `notes` | string | no | Planning notes |
| `yarn_notes` | string | no | Notes about yarn choices |
| `needle_notes` | string | no | Notes about needle/hook choices |
| `make_for` | string | no | Who this project will be for |
| `planned_materials` | PlannedMaterial[] | no | Planned yarn/material selections |
| `start_by` | date | no | Target start date |
| `finish_by` | date | no | Target completion date |
| `queued_at` | date | no | When this was added to the queue |
| `tags` | string[] | no | User tags |
| `photos` | Photo[] | no | Inspiration photos |
| `external_ids` | ExternalIds | no | Platform-specific identifiers |
| `created_at` | datetime | no | Record created |
| `updated_at` | datetime | no | Record last modified |

### PatternRef

```json
{
  "id": "pat-001",
  "name": "Carbeth Cardigan",
  "designer": "Kate Davies",
  "url": "https://www.ravelry.com/patterns/library/carbeth"
}
```

### PlannedMaterial

Yarn/material you plan to use. May reference a stash entry or just describe the plan.

```json
{
  "material_id": "mat-001",
  "name": "Malabrigo Rios",
  "brand": "Malabrigo",
  "colorway": "Whales Road",
  "skeins_needed": 5
}
```

## Example

```json
{
  "weft_version": "1.0",
  "type": "queue",
  "items": [
    {
      "id": "q-001",
      "position": 1,
      "pattern_ref": {
        "id": "pat-001",
        "name": "Carbeth",
        "designer": "Kate Davies",
        "url": "https://www.ravelry.com/patterns/library/carbeth"
      },
      "notes": "Want to make this in teal. Need to swatch first.",
      "yarn_notes": "Rios or maybe Shelter?",
      "make_for": "myself",
      "planned_materials": [
        {
          "material_id": "mat-001",
          "name": "Malabrigo Rios",
          "colorway": "Whales Road",
          "skeins_needed": 5
        }
      ],
      "start_by": "2026-06-01",
      "queued_at": "2026-03-15",
      "tags": ["cardigan", "next-up"],
      "external_ids": { "ravelry": "99887766" }
    }
  ]
}
```
