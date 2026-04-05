# Ravelry → WEFT Field Mapping

> Complete mapping of Ravelry API data models to WEFT entities. This is the reference for building Ravelry import/export.

## Material (02-material) ← Ravelry Stash + Yarn

### Core Fields

| Ravelry Source | WEFT Field | Conversion |
|---|---|---|
| `stash.id` | `id` | `"rav-stash-{id}"` (string) |
| `stash.id` | `external_ids.ravelry` | `"{id}"` (string) |
| `stash.name` or `yarn.yarn_company_name + " " + yarn.name + " - " + colorway_name` | `name` | Derive display name |
| always `"yarn"` | `material_type` | Hardcode for yarn stash |
| `stash.color_family_name` | `color_family` | Direct map, lowercase |
| `stash.location` | `location` | Direct |
| `stash.stash_status.id` | `status` | 1→`in-stash`, 2→`used-up`, 3→`sold`, 4→`sold`, 5→`in-use` |
| `stash.notes` | `notes` | Direct (plain text, not notes_html) |
| `stash.tag_names` | `tags` | Direct |
| `stash.created_at` | `created_at` | Use `parseDate()` for Ravelry date format |
| `stash.updated_at` | `updated_at` | Use `parseDate()` |
| `stash.photos[]` | `photos[]` | Map photo objects (see Photo Mapping below) |
| `yarn.yarn_company_name` | `brand` | Direct |
| `yarn.name` | `product_line` | Direct |
| `yarn.id` | `product_ref.product_id` | `"rav-yarn-{id}"` |
| Sum of `packs[].total_grams` | `quantity.weight_grams` | Aggregate across all packs |
| Sum of `packs[].total_yards * 0.9144` | `quantity.length_meters` | Convert yards→meters, aggregate |
| Sum of `packs[].total_yards` | `quantity.length_yards` | Aggregate (keep imperial too) |
| Sum of `packs[].total_ounces` | `quantity.weight_ounces` | Aggregate imperial weight |
| Sum of `packs[].skeins` | `quantity.units_count` + `unit_label: "skein"` | Aggregate |

### Pack Mapping

Each Ravelry `stash.packs[]` entry maps to a WEFT `packs[]` entry:

| Ravelry Source | WEFT `packs[].` Field | Conversion |
|---|---|---|
| `pack.id` | `id` | `"rav-pack-{id}"` |
| `pack.skeins` | `quantity.units_count` + `unit_label: "skein"` | Parse string to number |
| `pack.total_grams` | `quantity.weight_grams` | Direct |
| `pack.total_ounces` | `quantity.weight_ounces` | Direct |
| `pack.total_yards` | `quantity.length_yards` | Direct |
| `pack.total_yards * 0.9144` | `quantity.length_meters` | Convert yards→meters |
| `pack.grams_per_skein` | `weight_per_unit_grams` | Direct |
| `pack.ounces_per_skein` | `weight_per_unit_ounces` | Direct |
| `pack.yards_per_skein` | `length_per_unit_yards` | Direct |
| `pack.yards_per_skein * 0.9144` | `length_per_unit_meters` | Convert |
| `pack.colorway` | `colorway` | Direct |
| `pack.dye_lot` | `dye_lot` | Direct |
| `pack.purchased_date` | `acquired_date` | Direct |
| `pack.shop_name` | `acquired_from` | Direct |
| `pack.total_paid` | `acquired_price.amount` | Owner-only field (per-pack price) |
| `pack.total_paid_currency` | `acquired_price.currency` | Owner-only field |
| `pack.purchased_url` | `acquired_url` | Direct |
| `pack.purchased_state_id` | `acquired_state` | Resolve state name |
| `pack.primary_pack_id` | `source_pack_id` | `"rav-pack-{id}"` (stash→project provenance) |
| `pack.prefer_metric_length` | `prefer_metric` | Direct |
| `pack.yarn_id` | `product_id` | `"rav-yarn-{id}"` |
| `pack.yarn_name` | `product_name` | Direct |
| `pack.personal_name` | `personal_name` | Direct |
| `pack.quantity_description` | `quantity_description` | Direct |
| `pack.project_id` | `project_id` | `"rav-project-{id}"` |

### Yarn Block Fields

| Ravelry Source | WEFT `yarn.` Field | Conversion |
|---|---|---|
| `yarn.yarn_weight.name` | `yarn.weight_category` | Normalize to taxonomy key |
| `yarn.yarn_fibers[]` | `fiber_content[]` | `{fiber: fiber_type.name, percentage, fiber_origin, fiber_category}` (top-level on Material) |
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
| `yarn.thread_size` | `thread_size` | Direct |
| `stash.personal_yarn_weight.name` | `personal_weight_override` | Direct |
| `stash.long_yarn_weight_name` | `yarn_weight_name` | Direct |

### Photo Mapping

Each Ravelry photo object maps to a WEFT Photo:

| Ravelry Source | WEFT `photos[].` Field | Conversion |
|---|---|---|
| `photo.id` | `id` | `"rav-photo-{id}"` |
| `photo.large_url` or `photo.medium2_url` | `uri` | Use highest quality available |
| `photo.sort_order` | `sort_order` | Direct |
| `photo == first_photo` | `is_primary` | `true` if this is the entity's `first_photo` |
| `photo.caption` | `caption` | Direct (plain text, not caption_html) |
| `photo.copyright_holder` | `copyright_holder` | Direct |
| `photo.aspect_ratio` | `aspect_ratio` | Direct |

### Fields NOT mapped (Ravelry → dropped)

| Field | Reason |
|---|---|
| `comments_count`, `favorites_count`, `rating_*` | Social metrics, not material data |
| `notes_html` | HTML rendering, apps render their own |
| `permalink` | Platform-specific URL slug |
| `certified_organic`, `organic` | Belongs in Product entity |
| `discontinued` | Belongs in Product entity |
| `fiber_type.animal_fiber/synthetic/vegetable_fiber` | Derivable from fiber name via taxonomy hierarchy |
| `photo.square_url/thumbnail_url/small_url/small2_url/medium_url` | Size variants — apps generate their own from the URI |
| `photo.x_offset/y_offset` | Crop positioning — platform-specific |
| `photo.status_token` | Upload tracking — transient |
| `photo.caption_html` | Use plain `caption` instead |

---

## Fiber Stash ← Ravelry Fiber Stash

Ravelry's fiber stash maps to Material with `material_type: "roving"`:

| Ravelry Source | WEFT Field | Conversion |
|---|---|---|
| `fiber_stash.id` | `id` | `"rav-fiber-{id}"` |
| `fiber_stash.id` | `external_ids.ravelry` | `"{id}"` |
| `fiber_stash.name` or `fiber_stash.long_name` | `name` | Direct |
| always `"roving"` | `material_type` | Use roving for all fiber stash entries |
| `fiber_stash.fiber_types[]` | `roving.fiber_content[]` | `{fiber: name, percentage}` |
| `fiber_stash.fiber_attributes[]` | `roving.fiber_attributes[]` | Map attribute names |
| `fiber_stash.fiber_company_name` | `brand` | Direct |
| `fiber_stash.stash_status.id` | `status` | Same mapping as yarn stash |
| `fiber_stash.location` | `location` | Direct |
| `fiber_stash.notes_html` | `notes` | Strip HTML or use plain text |
| `fiber_stash.photos[]` | `photos[]` | Same photo mapping as above |
| `fiber_stash.fiber_packs[]` | `packs[]` | Map pack fields |

### Fiber Pack Mapping

| Ravelry Source | WEFT `packs[].` Field | Conversion |
|---|---|---|
| `fiber_pack.id` | `id` | `"rav-fiberpack-{id}"` |
| `fiber_pack.total_grams` | `quantity.weight_grams` | Direct |
| `fiber_pack.total_ounces * 28.3495` | `quantity.weight_grams` | Convert oz→g (fallback) |
| `fiber_pack.units` + `fiber_pack.unit_label` | `quantity.value` + `quantity.unit` | Direct |
| `fiber_pack.colorway` | `colorway` | Direct |
| `fiber_pack.personal_brand` | `notes` | Append to notes if present |
| `fiber_pack.purchased_at` | `acquired_date` | Direct |
| `fiber_pack.shop_id` | `acquired_from` | Resolve shop name |
| `fiber_pack.spinning_project_id` | — | Map to `roving.spinning_project_id`: `"rav-project-{id}"` |
| `fiber_pack.project_id` | `project_id` | `"rav-project-{id}"` |

---

## Project (03-project) ← Ravelry Project

### Core Fields

| Ravelry Source | WEFT Field | Conversion |
|---|---|---|
| `project.id` | `id` | `"rav-project-{id}"` |
| `project.id` | `external_ids.ravelry` | `"{id}"` |
| `project.name` | `name` | Direct |
| `project.craft.permalink` or `craft_name` | `craft` | Normalize: `"Knitting"` → `"knitting"` |
| `project.status_name` | `status` | `"In progress"` → `"in-progress"` |
| `project.progress` | `progress_percent` | Direct (0-100) |
| `project.started` | `started_at` | Use `parseDate()` |
| `project.started_day_set` | `started_date_precise` | Direct boolean |
| `project.completed` | `completed_at` | Use `parseDate()` |
| `project.completed_day_set` | `completed_date_precise` | Direct boolean |
| `project.project_status_changed` | `status_changed_at` | Use `parseDate()` |
| `project.size` | `size_made` | Direct |
| `project.made_for` | `made_for` | Direct |
| `project.pattern_name` | `pattern_ref.name` | Direct |
| `project.pattern.designer.name` | `pattern_ref.designer` | Direct |
| `project.pattern.permalink` | `pattern_ref.url` | Construct full Ravelry URL |
| `project.pattern_id` | `pattern_ref.id` | `"rav-pattern-{id}"` |
| `project.notes` | `notes` | Direct |
| `project.private_notes` | `private_notes` | Direct (owner-only field) |
| `project.photos[]` | `photos[]` | Map photo objects (see Photo Mapping above) |
| `project.tag_names` or `tags` | `tags` | Direct |
| `project.rating` | `rating` | Direct |
| `project.happiness` | `happiness` | Direct (1-10) |
| `project.gauge` + `gauge_divisor` | `gauge.stitches_per_unit` + `gauge.unit` | Parse numeric + unit |
| `project.row_gauge` | `gauge.rows_per_unit` | Parse numeric |
| `project.gauge_pattern` | `gauge.gauge_pattern` | Direct |
| `project.ends_per_inch` | `ext.weaving.sett_epi` | Direct (weaving projects) |
| `project.picks_per_inch` | `ext.weaving.picks_per_inch` | Direct (weaving projects) |

### Materials Used Mapping

Each Ravelry `project.packs[]` entry maps to a WEFT `materials_used[]` entry:

| Ravelry Source | WEFT `materials_used[].` Field | Conversion |
|---|---|---|
| `pack.stash_id` | `material_id` | `"rav-stash-{id}"` (if linked to stash) |
| `pack.id` | `pack_id` | `"rav-pack-{id}"` |
| `pack.yarn.name` or `pack.yarn_name` | `name` | Direct |
| `pack.yarn.yarn_company_name` | `brand` | Direct |
| `pack.yarn.name` | `product_line` | Direct |
| `pack.colorway` | `colorway` | Direct |
| `pack.yarn.yarn_weight.name` | `weight_category` | Normalize to taxonomy key |
| `pack.skeins` | `quantity_used.value` + `unit: "skein"` | Direct |
| `pack.total_yards * 0.9144` | `quantity_used.length_meters` | Convert yards→meters |
| `pack.total_grams` | `quantity_used.weight_grams` | Direct |

### Tools Used Mapping

| Ravelry Source | WEFT `tools_used[].` Field | Conversion |
|---|---|---|
| `needle.id` | `tool_id` | `"rav-needle-{id}"` |
| `needle.name` | `description` | Direct |
| `needle.metric` | `size_mm` | Direct |
| `needle.hook` ? `"hook"` : `"needle"` | `tool_type` | Derive from needle properties |

### Fields NOT mapped

| Field | Reason |
|---|---|
| `gauge_repeats` | `gauge.gauge_repeats` | Direct |
| Social metrics | Platform-specific |

---

## Pattern (06-pattern) ← Ravelry PatternFull

### Core Fields

| Ravelry Source | WEFT Field | Conversion |
|---|---|---|
| `pattern.id` | `id` | `"rav-pattern-{id}"` |
| `pattern.id` | `external_ids.ravelry` | `"{id}"` |
| `pattern.name` | `name` | Direct |
| `pattern.pattern_author` | `designer` | `{name: author.name, id: "rav-designer-{id}", url: author.permalink}` |
| `pattern.craft.permalink` | `craft[]` | Wrap in array |
| `pattern.pattern_type.permalink` | `category.name` | Direct |
| `pattern.pattern_categories[]` | `category.path` | Build path from category hierarchy |
| `pattern.pattern_attributes[]` | `pattern_attributes` | Map attribute names |
| `pattern.difficulty_average` | `difficulty` | Round to nearest integer |
| `pattern.published` | `published_date` | Parse date |
| `pattern.free` | `is_free` | Direct |
| `pattern.price` + `currency` | `price` | `{amount: parseFloat(price), currency}` |
| `pattern.downloadable` | `downloadable` | Direct |
| `pattern.sizes_available` | `sizes[]` | Parse freetext |
| `pattern.languages[].code` | `language[]` | Direct |
| `pattern.notes` | `notes` | Direct |
| `pattern.photos[]` | `photos[]` | Map photo objects (see Photo Mapping above) |
| `pattern.personal_attributes.tag_names` | `tags` | User's bookmark tags |
| `pattern.yardage` | `yardage_min` | Direct |
| `pattern.yardage_max` | `yardage_max` | Direct |
| `pattern.meterage` | `meterage_min` | Direct |
| `pattern.meterage_max` | `meterage_max` | Direct |
| `pattern.packs[]` | `suggested_materials[]` | Map yarn packs to SuggestedMaterial |
| `pattern.pattern_sources[]` | `sources[]` | Map to PatternSource objects |

### Community Metrics

| Ravelry Source | WEFT `community.` Field | Conversion |
|---|---|---|
| `pattern.rating_average` | `rating_average` | Direct |
| `pattern.rating_count` | `rating_count` | Direct |
| `pattern.difficulty_average` | `difficulty_average` | Direct |
| `pattern.difficulty_count` | `difficulty_count` | Direct |
| `pattern.favorites_count` | `favorites_count` | Direct |
| `pattern.projects_count` | `projects_count` | Direct |
| `pattern.queued_projects_count` | `queued_count` | Direct |

### Knitting Block

| Ravelry Source | WEFT `knitting.` Field | Conversion |
|---|---|---|
| `pattern.yarn_weight.permalink` | `yarn_weight` | Direct |
| `pattern.pattern_needle_sizes` | `needle_sizes_mm[]` | Parse mm values |
| `pattern.gauge` + `gauge_divisor` | `gauge` | Parse |
| `pattern.row_gauge` | `gauge.rows_per_unit` | Parse |
| `pattern.gauge_description` | `gauge_description` | Direct |
| `pattern.pattern_attributes[]` | Split into `techniques` + `construction` | Classify per attribute group |

### Crochet Block

| Ravelry Source | WEFT `crochet.` Field | Conversion |
|---|---|---|
| `pattern.yarn_weight.permalink` | `yarn_weight` | Direct |
| `pattern.pattern_needle_sizes` | `hook_sizes_mm[]` | Parse mm values (for hooks) |
| `pattern.gauge` + `gauge_divisor` | `gauge` | Parse |
| `pattern.has_us_terminology` | `has_us_terminology` | Direct |
| `pattern.has_uk_terminology` | `has_uk_terminology` | Direct |

### Source Mapping

| Ravelry `pattern_sources[].type` | WEFT `sources[].type` |
|---|---|
| book | `book` |
| magazine | `magazine` |
| pamphlet-booklet | `pamphlet` |
| website | `website` |
| webzine | `website` |
| ebook | `ebook` |

### Fields NOT mapped

| Field | Reason |
|---|---|
| `pdf_in_library`, `pdf_url`, `volumes_in_library` | User-specific library state, not pattern data |
| `product_id`, `unlisted_product_ids` | Ravelry commerce IDs |
| `download_location` | Platform-specific download mechanics |
| `printings[]` | Print edition tracking, rarely used |
| `currency_symbol` | Derivable from currency code |
| `generally_available` | `generally_available` | Direct (date) |
| `personal_attributes` | User-specific bookmark/favorite state |

---

## Queue (08-queue) ← Ravelry QueuedProject

| Ravelry Source | WEFT Field | Conversion |
|---|---|---|
| `queued.id` | `id` | `"rav-queue-{id}"` |
| `queued.id` | `external_ids.ravelry` | `"{id}"` |
| `queued.position` or `sort_order` | `position` | Direct |
| `queued.name` | `name` | Direct |
| `queued.pattern_name` | `pattern_ref.name` | Direct |
| `queued.pattern.designer.name` | `pattern_ref.designer` | Direct |
| `queued.pattern_id` | `pattern_ref.id` | `"rav-pattern-{id}"` |
| `queued.notes` | `notes` | Direct (plain text) |
| `queued.yarn_notes` | `yarn_notes` | Direct |
| `queued.needle_notes` | `needle_notes` | Direct |
| `queued.make_for` | `make_for` | Direct |
| `queued.queued_on` | `queued_at` | Use `parseDate()` |
| `queued.start_on` | `start_by` | Direct (YYYY-MM-DD) |
| `queued.finish_by` | `finish_by` | Direct (YYYY-MM-DD) |
| `queued.tag_names` | `tags` | Direct |
| `queued.photos[]` | `photos[]` | Map photo objects |
| `queued.queued_stashes[]` | `planned_materials[]` | Map stash refs to PlannedMaterial |
| `queued.yarn` | `planned_materials[0]` | Map yarn to PlannedMaterial |

### Queue → PlannedMaterial Mapping

| Ravelry Source | WEFT `planned_materials[].` Field |
|---|---|
| `queued_stash.stash_id` | `material_id` → `"rav-stash-{id}"` |
| `queued_stash.stash.name` | `name` |
| `queued.yarn_name` or `queued.yarn.name` | `name` (fallback) |
| `queued.yarn.yarn_company_name` | `brand` |
| `queued.skeins` | `skeins_needed` |

---

## Favorite (09-favorite) ← Ravelry Bookmark + Bundle

### Bookmark → Favorite

| Ravelry Source | WEFT Field | Conversion |
|---|---|---|
| `bookmark.id` | `id` | `"rav-fav-{id}"` |
| `bookmark.id` | `external_ids.ravelry` | `"{id}"` |
| `bookmark.type` | `type` | Direct mapping: `project`→`project`, `pattern`→`pattern`, `yarn`→`yarn`, `stash`→`stash`, `designer`→`designer`, `yarnshop`→`shop`, `bundle`→`bundle`, `forumpost`→`forum-post` |
| `bookmark.favorited.id` | `item_id` | `"rav-{type}-{id}"` |
| `bookmark.favorited.name` | `item_name` | Direct |
| `bookmark.comment` | `comment` | Direct |
| `bookmark.tag_list` | `tags` | Split on spaces |
| `bookmark.created_at` | `favorited_at` | Use `parseDate()` |

### Bundle → Bundle

| Ravelry Source | WEFT Field | Conversion |
|---|---|---|
| `bundle.id` | `id` | `"rav-bundle-{id}"` |
| `bundle.id` | `external_ids.ravelry` | `"{id}"` |
| `bundle.name` | `name` | Direct |
| `bundle.description` | `description` | Direct |
| `bundle.privacy` | `privacy` | Direct (`public`, `private`, `friends`) |
| `bundle.notes` | — | Append to description |
| `bundle.first_photo` | `cover_photo` | Map photo |
| `bundle.bundled_items[]` | `items[]` | Map BundledItemFull to BundleItem |

### BundledItemFull → BundleItem

| Ravelry Source | WEFT `items[].` Field |
|---|---|
| `item.bookmark.id` | `favorite_id` → `"rav-fav-{id}"` |
| `item.item_type` | `item_type` | Direct |
| `item.item_id` | `item_id` → `"rav-{type}-{id}"` |
| `item.bundled_object.name` | `item_name` |
| `item.notes` | `notes` |
| `item.added_at` or `item.created_at` | `added_at` |

---

## Library (11-library) ← Ravelry Volume + PatternSource

### Volume → Library Volume

| Ravelry Source | WEFT Field | Conversion |
|---|---|---|
| `volume.id` | `id` | `"rav-vol-{id}"` |
| `volume.id` | `external_ids.ravelry` | `"{id}"` |
| `volume.title` | `title` | Direct |
| `volume.author_name` | `author_name` | Direct |
| `volume.pattern_source.pattern_source_type.name` | `source_type` | Map type name |
| `volume.cover_image_url` | `cover_image.uri` | Direct |
| `volume.notes` | `notes` | Direct (plain text) |
| `volume.volume_status_id` | `status` | 1→`owned`, 2→`for-sale`, 3→`for-trade`, 4→`for-sale-or-trade` |
| `volume.asking_price_cents / 100` | `asking_price.amount` | Convert cents to amount |
| `volume.asking_price_currency` | `asking_price.currency` | Direct |
| `volume.volume_attachments[]` | `attachments[]` | Map attachment fields |

### PatternSource → Library enrichment

| Ravelry Source | WEFT Field |
|---|---|
| `source.isbn_13` | `isbn` |
| `source.publication_date` | `publication_date` |
| `source.issue` | `issue` |
| `source.patterns[]` | `patterns[]` → map to PatternRef |

---

## Shop (12-shop) ← Ravelry Shop

| Ravelry Source | WEFT Field | Conversion |
|---|---|---|
| `shop.id` | `id` | `"rav-shop-{id}"` |
| `shop.id` | `external_ids.ravelry` | `"{id}"` |
| `shop.name` | `name` | Direct |
| `shop.shop_type_name` | `shop_type` | Normalize to enum |
| `shop.address` | `address.street` | Direct |
| `shop.city` | `address.city` | Direct |
| `shop.state.name` or `shop.state` | `address.state` | Extract name |
| `shop.postal_code` or `shop.zip` | `address.postal_code` | Direct |
| `shop.country.name` or `shop.country` | `address.country` | Extract name or code |
| `shop.latitude` | `geo.latitude` | Direct |
| `shop.longitude` | `geo.longitude` | Direct |
| `shop.phone` | `phone` | Direct |
| `shop.shop_email` or `shop.email` | `email` | Direct |
| `shop.url` or `shop.website` | `url` | Direct |
| `shop.description` | `description` | Direct |
| `shop.hours` | `hours` | Direct |
| `shop.closed` | `closed` | Direct |
| `shop.free_wifi/parking/seating/wheelchair_access` | `amenities[]` | Convert booleans to string array |
| `shop.brands[].name` | `brands[]` | Extract brand names |
| `shop.facebook_page` | `social.facebook` | Direct |
| `shop.twitter_id` | `social.twitter` | Direct |
| `shop.photos[]` | `photos[]` | Map photo objects |
| `shop.notes` | `notes` | Direct (plain text) |

---

## Designer (13-designer) ← Ravelry PatternAuthor

| Ravelry Source | WEFT Field | Conversion |
|---|---|---|
| `author.id` | `id` | `"rav-designer-{id}"` |
| `author.id` | `external_ids.ravelry` | `"{id}"` |
| `author.name` | `name` | Direct |
| `author.notes` | `bio` | Direct (full variant only) |
| `author.permalink` | `url` | Construct `https://www.ravelry.com/designers/{permalink}` |
| `author.patterns_count` | `patterns_count` | Direct |
| `author.knitting_pattern_count` | `knitting_pattern_count` | Direct |
| `author.crochet_pattern_count` | `crochet_pattern_count` | Direct |
| `author.favorites_count` | `favorites_count` | Direct |
| `author.users[0].photo_url` | `photos[0].uri` | Map first user photo |

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
