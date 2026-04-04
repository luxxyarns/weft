# 08 — Extensions Registry

## How Extensions Work

Extensions are the mechanism that makes WEFT flexible enough for a fragmented ecosystem. They allow any app, platform, craft, or community to add their own data without breaking the core format.

```json
"ext": {
  "namespace": {
    "field1": "value1",
    "field2": "value2"
  }
}
```

## Namespace Types

| Type | Convention | Example | Who defines it |
|------|-----------|---------|---------------|
| **Craft** | Craft name, lowercase | `yarn`, `fabric`, `thread`, `roving` | WEFT spec (shared) |
| **Platform** | Platform name, lowercase | `ravelry`, `etsy`, `loveknitting` | Platform owner or community |
| **App** | App name, lowercase | `stash2go`, `yarnbuddy`, `knitcompanion` | App developer |
| **Community** | Community/event name | `rhinebeck`, `kal_mystery2026` | Community organizer |

## Rules

1. **Preserve unknown** — If your app reads `ext.yarnbuddy` but doesn't know what it means, keep it exactly as-is when re-exporting. Never drop extensions.
2. **Don't duplicate core** — If WEFT core has `name`, don't add `ext.myapp.name`.
3. **Namespace your fields** — Everything app-specific goes under your namespace. Never add top-level fields.
4. **Version if needed** — Use `ext["yarn@1.2"]` if your extension schema has breaking changes.
5. **Document publicly** — Register your namespace below so other apps can optionally support it.

## Registered Namespaces

### Craft Extensions (defined by WEFT spec)

| Namespace | Entity | Description |
|-----------|--------|-------------|
| `yarn` | Material | Weight, fiber, colorway, gauge, ply, care |
| `fabric` | Material | Width, thread count, weave type, print, collection |
| `thread` | Material | Strand count, brand number, finish |
| `roving` | Material | Fiber prep, micron count, staple length |
| `floss` | Material | Brand system, brand number, strand count |
| `knitting` | Project | Needle sizes, cast-on method, construction |
| `crochet` | Project | Hook sizes, stitch types |
| `weaving` | Project | Loom type, reed, draft notation |
| `sewing` | Project | Pattern pieces, seam allowance, fabric type |
| `spinning` | Project | Wheel/spindle, twist direction, WPI |

### Platform Extensions

| Namespace | Owner | Description |
|-----------|-------|-------------|
| `ravelry` | Community-maintained | Ravelry IDs (stash_id, yarn_id, project_id, pattern_id) |
| `etsy` | Community-maintained | Etsy listing IDs, shop links |

### App Extensions

| Namespace | Owner | Description |
|-----------|-------|-------------|
| `stash2go` | Stash2Go | Matchmaker scores, PDF state, counter sync |

*To register your namespace, open a pull request adding your entry to this table.*

## Extension Design Guide

When designing an extension:

1. **Keep it flat** — avoid deep nesting. One level of objects is ideal.
2. **Use descriptive field names** — `fiber_content` not `fc`.
3. **Include units in field names or as separate fields** — `width_cm` or `{ width: 112, unit: "cm" }`.
4. **Prefer enums over freetext** where a fixed set of values makes sense.
5. **Always allow `other`** in enums — crafts are creative, people will invent new things.
6. **Document every field** — include type, whether required within the extension, and a description.
