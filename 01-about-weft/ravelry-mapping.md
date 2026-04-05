# Ravelry → WEFT Field Mapping

> Complete mapping of Ravelry API data models to WEFT entities. This is the reference for building Ravelry import/export.

## Material (02-material) ← Ravelry Stash + Yarn

### Core Fields

| Ravelry Source | WEFT Field | Conversion |
|---|---|---|
| `stash.id` | `id` | `"rav-stash-{id}"` (string) |
| `stash.name` or `yarn.yarn_company_name + " " + yarn.name + " - " + colorway_name` | `name` | Derive display name |
| always `"yarn"` | `material_type` | Hardcode for yarn stash |
| `stash.color_family_name` | `color_family` | Direct map, lowercase |
| `stash.location` | `location` | Direct |
| `stash.stash_status.id` | `status` | 1→`in-stash`, 2→`used-up`, 3→`sold`, 4→`sold`, 5→`in-use` |
| `stash.notes` | `notes` | Direct (plain text, not notes_html) |
| `stash.tag_names` | `tags` | Direct |
| `stash.created_at` | `created_at` | Use `parseDate()` for Ravelry date format |
| `stash.updated_at` | `updated_at` | Use `parseDate()` |
| `stash.photos[].medium_url` | `photos[].uri` | Map photo URLs |
| `yarn.yarn_company_name` | `brand` | Direct |
| `yarn.name` | `product_line` | Direct |
| `pack.total_grams` | `quantity.weight_grams` | Direct |
| `pack.total_yards * 0.9144` | `quantity.length_meters` | Convert yards→meters |
| `pack.skeins` | `quantity.value` + `unit: "skein"` | Parse string to number |
| `pack.total_paid` | `acquired_price.amount` | Owner-only field |
| `pack.total_paid_currency` | `acquired_price.currency` | Owner-only field |
| `pack.shop_name` | `acquired_from` | Direct |
| `pack.purchased_date` | `acquired_date` | Direct |

### Yarn Block Fields

| Ravelry Source | WEFT `yarn.` Field | Conversion |
|---|---|---|
| `yarn.yarn_weight.name` | `weight_category` | Normalize to taxonomy key |
| `yarn.yarn_fibers[]` | `fiber_content[]` | `{fiber: fiber_type.name, percentage}` |
| `yarn.yarn_weight.ply` | `ply` | Direct |
| `stash.colorway_name` or `pack.colorway` | `colorway` | Direct |
| `stash.dye_lot` or `pack.dye_lot` | `dye_lot` | Direct |
| `yarn.yarn_weight.wpi` or `yarn.wpi` | `wraps_per_inch` | Direct |
| `yarn.min_needle_size` / `max_needle_size` | `recommended_needle_mm` | `[min, max]` array |
| `yarn.min_hook_size` / `max_hook_size` | `recommended_hook_mm` | `[min, max]` array |
| `yarn.min_gauge` / `max_gauge` + `gauge_divisor` | `gauge` | `{stitches_per_unit: avg, unit: divisor+"in"}` |
| `yarn.machine_washable` | `care` | If true: `["machine-wash"]` |
| `yarn.texture` | `texture` | Direct |
| `stash.handspun` | `is_handspun` | Direct |

### Fields NOT mapped (Ravelry → lost)

| Field | Reason |
|---|---|
| `comments_count`, `favorites_count`, `rating_*` | Social metrics, not material data |
| `notes_html` | HTML rendering, apps render their own |
| `permalink` | Platform-specific URL slug |
| `certified_organic`, `organic` | Belongs in Product entity |
| `discontinued` | Belongs in Product entity |
| `fiber_type.animal_fiber/synthetic/vegetable_fiber` | Derivable from fiber name via taxonomy hierarchy |

---

## Project (03-project) ← Ravelry Project

### Core Fields

| Ravelry Source | WEFT Field | Conversion |
|---|---|---|
| `project.id` | `id` | `"rav-project-{id}"` |
| `project.name` | `name` | Direct |
| `project.craft.permalink` or `craft_name` | `craft` | Normalize: `"Knitting"` → `"knitting"` |
| `project.status` or `status_name` | `status` | `"in-progress"` → `"in-progress"` (same keys) |
| `project.progress` | `progress_percent` | Direct (0-100) |
| `project.started` | `started_at` | Use `parseDate()` |
| `project.completed` | `completed_at` | Use `parseDate()` |
| `project.size` | `size_made` | Direct |
| `project.made_for` | `made_for` | Direct |
| `project.pattern_name` | `pattern_ref.name` | Direct |
| `project.pattern.designer.name` | `pattern_ref.designer` | Direct |
| `project.pattern.permalink` | `pattern_ref.url` | Construct full Ravelry URL |
| `project.packs[]` | `materials_used[]` | Map pack→MaterialRef with quantity |
| `project.needle_sizes[].metric` | `knitting.needle_sizes_mm` | Extract mm values |
| `project.tools[]` | `tools_used[]` | `{tool_id, description: make + model}` |
| `project.notes` | `notes` | Direct |
| `project.photos[]` | `photos[]` | Map photo URLs |
| `project.tag_names` or `tags` | `tags` | Direct |
| `project.rating` | `rating` | Direct |
| `project.gauge` + `gauge_divisor` | `knitting.gauge_achieved` | Parse numeric + unit |
| `project.row_gauge` | `knitting.gauge_achieved.rows_per_unit` | Parse numeric |
| `project.ends_per_inch` | `weaving.sett_epi` | Direct (weaving projects) |

### Fields NOT mapped

| Field | Reason |
|---|---|
| `happiness` | Stash2Go-specific satisfaction scale (1-10), distinct from rating |
| `private_notes` | WEFT has single notes field |
| `completed_day_set` / `started_day_set` | Date precision flags, Ravelry-specific |
| `gauge_pattern`, `gauge_repeats` | Gauge metadata, no WEFT equivalent |
| `picks_per_inch` | GAP — should be added to WEFT weaving block |
| Social metrics | Platform-specific |

---

## Pattern (06-pattern) ← Ravelry PatternFull

### Core Fields

| Ravelry Source | WEFT Field | Conversion |
|---|---|---|
| `pattern.id` | `id` | `"rav-pattern-{id}"` |
| `pattern.name` | `name` | Direct |
| `pattern.pattern_author.name` | `designer` | Direct |
| `pattern.craft.permalink` | `craft[]` | Wrap in array |
| `pattern.pattern_type.permalink` | `category` | Direct |
| `pattern.difficulty_average` | `difficulty` | Round to nearest integer |
| `pattern.published` | `published_date` | Parse date |
| `pattern.free` | `is_free` | Direct |
| `pattern.price` + `currency` | `price` | `{amount: parseFloat(price), currency}` |
| `pattern.sizes_available` | `sizes[]` | Parse freetext |
| `pattern.languages[].code` | `language[]` | Direct |
| `pattern.notes` | `notes` | Note: this is designer's description, not personal notes |
| `pattern.photos[]` | `photos[]` | Map URLs |
| `pattern.personal_attributes.tag_names` | `tags` | User's bookmark tags |
| `pattern.yarn_weight.permalink` | `knitting.yarn_weight` | Direct |
| `pattern.yardage` / `yardage_max` | `knitting.yardage_min/max` | Direct |
| `pattern.gauge` + `gauge_divisor` | `knitting.gauge` | Parse |
| `pattern.row_gauge` | `knitting.gauge.rows_per_unit` | Parse |
| `pattern.pattern_attributes[]` | Split into `tags` + craft block | Classification needed per attribute group |

### Source mapping

| Ravelry `pattern_sources[].type` | WEFT `source_type` |
|---|---|
| book | `book` |
| magazine | `magazine` |
| pamphlet-booklet | `pamphlet` |
| website | `website` |
| webzine | `website` |
| ebook | `ebook` |

---

## Stash2Go-Only Data (not from Ravelry)

These data models exist only in Stash2Go and inform future WEFT specs:

| WEFT Spec | Stash2Go Source | Key Fields |
|---|---|---|
| **04-progress** | `CounterItem`, `CounterHistory`, `CounterRepeatConfig`, `ShapingTracker` | counter value/max, cascade triggers, history log, shaping steps |
| **05-tool** | `UserTool`, `ToolSet` | Enhanced tool inventory with sets, loans, assignments |
| **07-annotation** | `PDFMarker`, `MagicMarker`, `SpatialPdfNote`, `ReferenceImage` | 15+ marker types, semantic kinds, page coordinates, freehand strokes |
| Future | `ManagedPdfState` (v2.0) | Smart reader state: managed pieces, chart links, row repeats, shaping plans |
| Future | `Stash2GoSavedSearch` | Saved/pinned searches with filters |
| Future | `PrivatePdf` | User-uploaded PDF management |
