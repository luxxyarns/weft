# 04 — Progress

> Row counters, piece tracking, shaping plans, linked counters, and row reminders for craft projects.

## Overview

`Progress` tracks where you are in a project — which row, which piece, which shaping step. It's the runtime state of knitting/crocheting a pattern, linked to a Project (03) and optionally to an Annotation (07) for PDF-linked tracking.

This is the most complex WEFT entity because it models the full smart pattern reader: managed pieces with row repeats, shaping plans with auto-generated reminder schedules, linked counter groups, and audio/visual row reminders.

## Core Structure

A `ProgressState` contains everything for one project+PDF combination:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Unique identifier |
| `project_id` | string | yes | Reference to Project entity |
| `pdf_key` | string | no | PDF identifier (URL or upload ID) |
| `version` | string | no | State version (`1.0` or `2.0`) |
| `session_setup` | SessionSetup | no | Session-level defaults |
| `counters` | Counter[] | no | Row counters |
| `pieces` | Piece[] | no | Managed knitting pieces |
| `shaping_plans` | ShapingPlan[] | no | Shaping trackers |
| `linked_counters` | LinkedCounter[] | no | Linked counter groups |
| `row_reminders` | RowReminder[] | no | Row-based reminders |
| `chart_links` | ChartCounterLink[] | no | Chart-to-counter links |
| `chart_row_repeats` | ChartRowRepeat[] | no | Row repeat sections |
| `counter_history` | CounterHistoryEntry[] | no | Undo history |

## Key Concepts

### Counters
Simple row counters with optional maximum, cascade triggers (auto-increment another counter), and switch intervals.

### Pieces
A managed knitting piece (e.g., "Body", "Left Sleeve") with:
- **Setup**: visible rows, count-by (1 or 2), knitting type (flat/round), first row direction (RS/WS), repeat limit
- **Progress**: current row, total rows worked, piece repeat count, row repeat progress, shaping progress
- **Row repeats**: subsets of rows repeated N times before continuing

### Shaping Plans
Shaping trackers with multi-step schedules:
- Steps: "Dec 1 st each side every 4th row, 7 times" → fires at rows 4, 8, 12, 16, 20, 24, 28
- Steps chain: step 2 starts after step 1's last firing
- Each step has: action type, interval, times, side (RS/WS), stitch counts (fixed or progressive)
- Steps can include spoken text, reference images, and audio recordings

### Linked Counters
Counter groups that advance together with each row tap:
- **Repeat counters**: cycle through a range (e.g., rows 1-8, repeat 3 times)
- **Action counters**: fire reminders at intervals (e.g., "decrease every 4th row")

### Row Reminders
Notes attached to specific row numbers:
- Text instruction shown when reaching that row
- Optional spoken text, reference image, or audio recording
- Can block advancement until cleared

## See Also

- **07-annotation** — PDF markers, chart detection, spatial notes (visual annotations on the PDF)
- **03-project** — The project this progress belongs to
