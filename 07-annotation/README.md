# 07 — Annotation

> PDF markers, chart detection, magic markers, spatial notes, reference images, scribble notes, and smart pattern analysis.

## Overview

An `AnnotationSet` contains all visual annotations and smart analysis for one PDF/pattern. This is the annotation layer — what you see and draw on the PDF. Runtime state (counters, progress) lives in Progress (04).

### Annotation vs Progress

| | Annotation (07) | Progress (04) |
|---|---|---|
| **What it stores** | Visual marks on PDF pages | Row counts, piece state, shaping |
| **Persistent?** | Yes — survives counter resets | Yes |
| **Changes during knitting?** | Rarely (add markers, notes) | Every row |
| **Examples** | Arrows, highlights, chart regions, notes | Counter=47, piece repeat 2 of 3 |

## Annotation Types

### PDF Markers
Visual markers placed on PDF pages. 14 types: arrows (4 directions), lines (horizontal, vertical), circles (outline, filled), pointer, crosshair, brackets (left, right), highlight rectangles, and freehand drawing.

Coordinates are percentages (0-100) of page dimensions — platform-independent.

Each marker has a `semantic_kind` describing its purpose: `row_line`, `section_start`, `section_end`, `repeat_block`, `instruction`, `warning`, `measurement`, or `custom`.

### Magic Markers
Chart symbol highlighting. Select a symbol in one chart cell (e.g., "k2tog") and all matching cells across all rows are highlighted automatically.

Match modes: `symbol` (match by chart glyph), `instruction` (match by text), `manual` (user-selected cells).

### Spatial Notes
Text notes positioned at specific locations on PDF pages with bounding boxes. Can be collapsed/expanded.

### Reference Images
Pinned screenshots or photos at specific PDF locations. Used as visual reference during knitting — e.g., a close-up of a stitch technique.

### Scribble Notes
Freehand drawing layers on PDF pages. Each scribble has multiple strokes with color, width, and opacity.

### Smart Pattern Data
Auto-detected and manually defined chart/table regions with row-level bounding boxes. Includes:
- **Detected tables**: knitting charts, size tables, abbreviation tables, row instructions
- **Chart configuration**: row count, direction (bottom-up/top-down), count-by, knitting type
- **Row progress**: which rows have been completed (checked off)

### Design Choices
Recorded design decisions: size selection, technique choices, yarn substitutions.

## Example

```json
{
  "weft_version": "1.0",
  "type": "annotation",
  "items": [
    {
      "id": "ann-001",
      "pattern_id": "pat-001",
      "project_id": "proj-001",
      "pdf_url": "https://example.com/carbeth.pdf",
      "pdf_title": "Carbeth Cardigan",
      "knitting_mode": "smart",
      "selected_size": "M",
      "markers": [
        {
          "id": "m-001",
          "type": "full_horizontal_line",
          "x": 50.0,
          "y": 42.5,
          "page": 3,
          "color": "#FF0000",
          "semantic_kind": "row_line"
        }
      ],
      "spatial_notes": [
        {
          "id": "sn-001",
          "page_number": 5,
          "text": "Modified neckline: cast off 6 instead of 4",
          "color": "#FFB800",
          "bounding_box": { "x": 0.1, "y": 0.3, "width": 0.4, "height": 0.08 }
        }
      ],
      "design_choices": [
        {
          "id": "dc-001",
          "type": "size",
          "label": "Size",
          "value": "M",
          "auto_inserted": true,
          "timestamp": "2026-03-15T10:00:00Z"
        }
      ],
      "smart_data": {
        "version": "1.0",
        "page_data": {
          "3": {
            "tables": [
              {
                "id": "chart-001",
                "page_number": 3,
                "type": "knitting-chart",
                "bounding_box": { "x": 0.1, "y": 0.2, "width": 0.8, "height": 0.5 },
                "confidence": 0.95,
                "rows": [
                  { "id": "r-001", "row_index": 0, "label": "Row 1", "bounding_box": { "x": 0.1, "y": 0.65, "width": 0.8, "height": 0.05 } }
                ],
                "config": {
                  "row_count": 10,
                  "direction": "bottom-up",
                  "first_row_number": 1,
                  "count_by": 1,
                  "knitting_type": "flat",
                  "first_row_direction": "rs",
                  "piece_repeat_limit": 0,
                  "has_one_tap_marker": true
                }
              }
            ],
            "row_progress": {}
          }
        }
      }
    }
  ]
}
```
