# 09 — Taxonomy

> Shared vocabularies for all WEFT schemas — canonical keys, translations, aliases, and hierarchies.

## Overview

WEFT schemas use enum fields (`yarn_weight`, `fiber`, `craft`, `status`, etc.) that need consistent, translatable values across all apps. Taxonomies define these values once, in one place.

Every taxonomy file is the **single source of truth** for its domain. Schemas reference these; apps use them for dropdowns, filters, and display labels.

## Structure

Each taxonomy is a YAML file with this format:

```yaml
id: fiber
version: "1.0"
description: Fiber types used in yarn, thread, and roving
values:
  - key: merino                    # Canonical key (what goes in JSON)
    label:                          # Human-readable labels
      en: Merino
      de: Merino
      es: Merino
      fr: Mérinos
      ja: メリノ
    aliases: ["merino wool"]        # Alternative names that map to this key
    parent: wool                    # Hierarchical parent (optional)
    meta:                           # Optional metadata
      animal_fiber: true
```

## Design Principles

1. **Keys are lowercase, hyphenated English**: `super-bulky`, `machine-wash-cold`, `in-stash`
2. **Keys never change** once published — they're in stored `.weft` files forever
3. **Labels are translatable** — apps display the label, store the key
4. **Aliases enable fuzzy matching** — "8ply" maps to `dk`, "worsted weight" maps to `worsted`
5. **Hierarchy is optional** — `merino → wool → animal-fiber` enables filtering at any level
6. **New values can be added** (minor version bump) but existing keys never removed

## Taxonomy Files

| File | Used By | Values |
|------|---------|--------|
| [craft.yaml](craft.yaml) | All entities | 12 craft types |
| [material-type.yaml](material-type.yaml) | Material | 9 material types |
| [yarn-weight.yaml](yarn-weight.yaml) | Material (yarn) | 13 weight categories |
| [fiber.yaml](fiber.yaml) | Material (yarn, roving) | 26 fiber types |
| [status.yaml](status.yaml) | Material, Project | Stash + project statuses |
| [tool-type.yaml](tool-type.yaml) | Tool | 10 tool types |
| [unit.yaml](unit.yaml) | Quantity | 20 measurement units |
| [care.yaml](care.yaml) | Material | 12 care instructions |
| [color-family.yaml](color-family.yaml) | Material | 12 color families |
| [needle-size.yaml](needle-size.yaml) | Tool, Project | Metric/US/hook size mappings |

## How Schemas Reference Taxonomies

In JSON Schema:
```json
"yarn_weight": {
  "type": "string",
  "description": "See 09-taxonomy/yarn-weight.yaml for valid values"
}
```

In a `.weft` file:
```json
{ "weight_category": "worsted" }
```

Apps validate against the taxonomy, display the translated label, and store the canonical key.
