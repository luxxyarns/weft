# 11 — Library

> Pattern books, magazines, and digital downloads you own. Your personal craft library.

## Overview

A `Volume` is an item in your pattern library — a book, magazine, PDF, or digital download that contains one or more patterns. It tracks what you own, whether it's for sale/trade, and links to the patterns inside.

### Library vs Pattern

| | Library Volume (11) | Pattern (06) |
|---|---|---|
| **What it is** | A physical/digital item you own | Instructions for making something |
| **Contains** | One or more patterns | One set of instructions |
| **Has condition** | Yes (for sale, for trade) | No |
| **Has attachments** | Yes (PDFs, downloads) | No (WEFT describes, not contains) |

## Volume

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `title` | string | no | Volume title (book name, magazine issue) |
| `author_name` | string | no | Author or editor |
| `source_type` | string | no | `book`, `magazine`, `ebook`, `pamphlet`, `digital_download` |
| `isbn` | string | no | ISBN-13 if applicable |
| `publisher` | string | no | Publisher name |
| `publication_date` | date | no | When published |
| `issue` | string | no | Magazine issue number |
| `cover_image` | Photo | no | Cover image |
| `patterns` | PatternRef[] | no | Patterns contained in this volume |
| `attachments` | Attachment[] | no | PDF/digital files |
| `notes` | string | no | Personal notes |
| `status` | string | no | `owned`, `for-sale`, `for-trade`, `for-sale-or-trade`, `wishlist` |
| `asking_price` | Money | no | Price if for sale |
| `location` | string | no | Where it's stored |
| `tags` | string[] | no | User tags |
| `external_ids` | ExternalIds | no | Platform-specific identifiers |
| `created_at` | datetime | no | Record created |
| `updated_at` | datetime | no | Record last modified |

### Attachment

A downloadable file attached to a library volume (typically a PDF pattern).

```json
{
  "filename": "carbeth-pattern-v2.pdf",
  "content_type": "application/pdf",
  "size_bytes": 2450000,
  "language": "en",
  "notes": "Updated version with corrected charts"
}
```

### PatternRef

```json
{
  "id": "pat-001",
  "name": "Carbeth Cardigan",
  "designer": "Kate Davies"
}
```

## Example

```json
{
  "weft_version": "1.0",
  "type": "library",
  "items": [
    {
      "id": "vol-001",
      "title": "Yarnstorm",
      "author_name": "Kate Davies",
      "source_type": "book",
      "isbn": "978-0-9935-9190-8",
      "publication_date": "2019-03-15",
      "cover_image": {
        "uri": "photos/yarnstorm-cover.jpg",
        "is_primary": true,
        "copyright_holder": "Kate Davies Designs"
      },
      "patterns": [
        { "id": "pat-001", "name": "Carbeth", "designer": "Kate Davies" },
        { "id": "pat-002", "name": "Peerie Flooers", "designer": "Kate Davies" }
      ],
      "notes": "Signed copy from Edinburgh Yarn Festival",
      "status": "owned",
      "location": "Bookshelf, craft room",
      "external_ids": { "ravelry": "44556677" }
    },
    {
      "id": "vol-002",
      "title": "Carbeth Cardigan",
      "author_name": "Kate Davies",
      "source_type": "digital_download",
      "attachments": [
        {
          "filename": "carbeth-v2.pdf",
          "content_type": "application/pdf",
          "size_bytes": 2450000,
          "language": "en"
        }
      ],
      "patterns": [
        { "id": "pat-001", "name": "Carbeth", "designer": "Kate Davies" }
      ],
      "status": "owned",
      "external_ids": { "ravelry": "44556688" }
    }
  ]
}
```
