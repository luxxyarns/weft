# WEFT — Widely Exchangeable Format for Textiles

> Your craft data belongs to you.

WEFT is an open, portable data format for the textile and fiber craft community. It covers knitting, crochet, weaving, spinning, sewing, quilting, embroidery, macrame, dyeing, and any craft that works with fiber, thread, or fabric.

## Why WEFT?

The weft is the thread that crosses the warp to create fabric — it's what **binds things together**. WEFT binds craft ecosystems together so your data moves freely between apps, platforms, and communities.

**The problem today:**
- Your projects, stash, counters, and patterns are locked inside whichever app you use
- Switch apps? Start over. App shuts down? Everything gone.
- Every craft app invents its own data model — nothing talks to anything

**WEFT solves this** with a simple JSON-based format that any app can read and write.

## Design Principles

1. **Simple core, extensible edges** — shared attributes everyone agrees on + namespaced extensions for app-specific needs
2. **Polymorphic by design** — a `Material` can be yarn, fabric, thread, roving, or floss. Same core shape, different extensions.
3. **Non-prescriptive** — WEFT describes data, not workflow. Your app decides how to use it.
4. **Human-readable** — JSON you can open in a text editor and understand
5. **Craft-agnostic** — no craft is privileged over another
6. **Offline-first** — self-contained files, no server required
7. **Versioned** — every document declares its schema version

## Data Models

| # | Model | Description | Status |
|---|-------|-------------|--------|
| [02](02-material/) | **Material** | Your stash inventory — yarn, fabric, thread, roving, floss you own | Draft |
| [03](03-project/) | **Project** | A thing you're making — sweater, quilt, tapestry, garment | Draft |
| [04](04-progress/) | **Progress** | Row counters, step trackers, completion state | Planned |
| [05](05-tool/) | **Tool** | Needles, hooks, looms, machines, wheels, hoops | Planned |
| [06](06-pattern/) | **Pattern** | Instructions/recipes by designers — what you follow to make something | Draft |
| [07](07-annotation/) | **Annotation** | PDF highlights, chart markers, notes on patterns | Planned |
| [10](10-product/) | **Product** | The catalog — what companies sell (yarn bases, fabric lines) | Draft |

## Architecture

Every WEFT entity has **core attributes** (universal, non-disputable) plus **type-specific fields** driven by polymorphism. A `Material` with `material_type: "yarn"` has yarn-specific fields; one with `material_type: "fabric"` has fabric-specific fields. Apps that don't understand a type simply show the core fields.

All enum values (crafts, fibers, weights, statuses) are defined in shared **taxonomies** with translations — see `09-taxonomy/`.

## File Format

- Extension: `.weft`
- MIME type: `application/vnd.weft+json`
- Encoding: UTF-8
- Structure: single JSON object with `weft_version`, `type`, and `items` array

```json
{
  "weft_version": "1.0",
  "type": "material",
  "exported_at": "2026-04-04T18:00:00Z",
  "exported_from": { "app": "stash2go", "version": "1.23" },
  "items": [ ... ]
}
```

## How to Participate

Each data model is developed in its own folder with a `README.md` describing the schema, examples, and open questions. Discussions happen via GitHub Issues and Discussions.

- **Propose a change**: Open an issue or discussion
- **Implement WEFT**: Read the schemas and build import/export in your app

## Folder Structure

```
01-about-weft/     Core concepts and principles
02-material/       Your stash inventory (+ type subfolders: yarn, fabric, roving)
03-project/        Projects across all crafts (+ craft subfolders)
04-progress/       Row counters, step trackers
05-tool/           Needles, hooks, looms, machines
06-pattern/        Instructions/recipes by designers
07-annotation/     PDF annotations, chart markers
09-taxonomy/       Shared vocabularies with translations
10-product/        Product catalog — what companies sell (+ type subfolders)
```

## License

Creative Commons Attribution 4.0 International (CC-BY-4.0)

---

*WEFT is initiated by [Stash2Go](https://www.stash2go.com) and open to all craft apps, platforms, and communities.*
