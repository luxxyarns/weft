# WEFT — Widely Exchangeable Format for Textiles

> Your craft data belongs to you.

WEFT is an open, portable data format for the textile and fiber craft community. It covers knitting, crochet, weaving, spinning, sewing, quilting, embroidery, cross-stitch, macramé, tatting, dyeing, and any craft that works with fiber, thread, or fabric.

## Why WEFT?

The weft is the thread that crosses the warp to create fabric — it's what **binds things together**. WEFT binds craft ecosystems together so your data moves freely between apps, platforms, and communities.

**The problem today:**
- Your projects, stash, counters, and patterns are locked inside whichever app you use
- Switch apps? Start over. App shuts down? Everything gone.
- Every craft app invents its own data model — nothing talks to anything

**WEFT solves this** with a simple JSON-based format that any app can read and write.

## Design Principles

1. **Simple core, extensible edges** — shared attributes everyone agrees on + namespaced extensions for app-specific needs
2. **Polymorphic by design** — a `Material` can be yarn, fabric, thread, roving, cord, batting, or dye. Same core shape, different type-specific fields.
3. **Non-prescriptive** — WEFT describes data, not workflow. Your app decides how to use it.
4. **Human-readable** — JSON you can open in a text editor and understand
5. **Craft-agnostic** — no craft is privileged over another
6. **Offline-first** — self-contained files, no server required
7. **Versioned** — every document declares its schema version

## Data Models

### Craft Data (what you make and make with)

| # | Model | Description | Schema | Status |
|---|-------|-------------|--------|--------|
| [02](02-material/) | **Material** | Your stash inventory — yarn, fabric, thread, roving, floss, cord, batting, dye | `material.schema.json` | Draft |
| [03](03-project/) | **Project** | A thing you're making — sweater, quilt, tapestry, wall hanging, dyed yarn | `project.schema.json` | Draft |
| [04](04-progress/) | **Progress** | Row counters, step trackers, block tracking, shaping plans, timers | `progress.schema.json` | Draft |
| [05](05-tool/) | **Tool** | Needles, hooks, looms, wheels, spindles, sewing machines, hoops, shuttles | `tool.schema.json` | Draft |
| [06](06-pattern/) | **Pattern** | Instructions/recipes by designers — transformation guides for making something | `pattern.schema.json` | Draft |
| [07](07-annotation/) | **Annotation** | PDF markers, chart detection, spatial notes, scribbles, reference images | `annotation.schema.json` | Draft |

### Organization (how you organize and discover)

| # | Model | Description | Schema | Status |
|---|-------|-------------|--------|--------|
| [08](08-queue/) | **Queue** | Projects you plan to make, with pattern/yarn/timeline | `queue.schema.json` | Draft |
| [09](09-favorite/) | **Favorite** | Bookmarks and curated bundles/collections | `favorite.schema.json` | Draft |

### Reference (products, shops, designers, library)

| # | Model | Description | Schema | Status |
|---|-------|-------------|--------|--------|
| [10](10-product/) | **Product** | What companies sell — yarn bases, fabrics, threads, batting | `product.schema.json` | Draft |
| [11](11-library/) | **Library** | Pattern books, magazines, PDFs you own — with ownership and DRM tracking | `library.schema.json` | Draft |
| [12](12-shop/) | **Shop** | Yarn shops, fabric stores, online retailers | `shop.schema.json` | Draft |
| [13](13-designer/) | **Designer** | Pattern authors, studios, brands — with contributor roles and shop links | `designer.schema.json` | Draft |

### Shared

| Folder | Description |
|--------|-------------|
| [01-about-weft/](01-about-weft/) | Core concepts, entity relationships, import/export rules, Ravelry field mapping |
| [99-taxonomy/](99-taxonomy/) | Shared vocabularies with translations in 10+ languages |

## Architecture

Every WEFT entity has **core attributes** (universal) plus **type-specific fields** driven by polymorphism:

- A `Material` with `material_type: "yarn"` has yarn-specific fields; `"fabric"` has fabric-specific fields
- A `Project` with `craft: "knitting"` has `ext.knitting` fields; `"quilting"` has `ext.quilting`
- A `Pattern` has craft-specific blocks for knitting, crochet, sewing, weaving, quilting, embroidery, cross-stitch, spinning, macramé, tatting, and dyeing

Apps that don't understand a type simply show the core fields and preserve the rest. No crash, no data loss.

All enum values (crafts, fibers, weights, statuses) are defined in shared **taxonomies** with translations — see `99-taxonomy/`.

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

## Folder Structure

```
01-about-weft/     Core concepts, entity relationships, import/export rules
02-material/       Your stash inventory (+ type subfolders: yarn, fabric, roving)
03-project/        Projects across all crafts (+ craft extensions)
04-progress/       Row counters, step trackers, block tracking, shaping
05-tool/           Needles, hooks, looms, wheels, spindles, sewing machines, hoops
06-pattern/        Instructions/recipes by designers (+ craft-specific blocks)
07-annotation/     PDF markers, chart detection, spatial notes, scribbles
08-queue/          Planned projects with materials and timeline
09-favorite/       Bookmarks and curated bundles
10-product/        Product catalog (yarn, fabric, thread, cord, batting)
11-library/        Pattern books, magazines, PDFs — ownership tracking
12-shop/           Craft supply retailers with location and schedule
13-designer/       Pattern authors, studios, brands — contributor model
99-taxonomy/       Shared vocabularies with translations in 10+ languages
```

## How to Participate

Each data model is developed in its own folder with a `README.md`, a JSON Schema, examples, and open questions. Discussions happen via GitHub Issues and Discussions.

- **Propose a change**: Open an issue or discussion
- **Implement WEFT**: Read the schemas and build import/export in your app
- **Contribute translations**: Add your language to taxonomy files in `99-taxonomy/`

## License

Creative Commons Attribution 4.0 International (CC-BY-4.0)

---

*WEFT is initiated by [Stash2Go](https://www.stash2go.com) and open to all craft apps, platforms, and communities.*
