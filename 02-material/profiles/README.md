# Material Profiles

> Platform-specific schemas that extend the base Material model. Apps export their own profile for full fidelity, and can target foreign profiles for interop.

## How Profiles Work

```
                    ┌──────────────────────┐
                    │  material.schema.json │  ← generic, all apps understand this
                    │     (base WEFT)       │
                    └──────────┬───────────┘
                               │ allOf extends
              ┌────────────────┼────────────────┐
              ▼                ▼                 ▼
   ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
   │   ravelry    │  │   stash2go   │  │  {other apps}    │  ← platform profiles
   │  .schema.json│  │  .schema.json│  │   .schema.json   │
   └──────────────┘  └──────────────┘  └──────────────────┘
```

**Base WEFT** — the universal contract. Every app MUST be able to read and write this. No platform-specific fields.

**Platform profiles** — extend base WEFT with a platform-specific `{platform}` extension block. Apps SHOULD export their own profile for maximum data fidelity, and MAY export foreign profiles for targeted interop.

## Export Modes

An app declares which profile it exported via the envelope:

```json
{
  "weft_version": "1.0",
  "type": "material",
  "profile": "stash2go",
  "exported_at": "2026-04-05T12:00:00Z",
  "exported_from": { "app": "stash2go", "version": "1.23", "platform": "ios" },
  "items": [ ... ]
}
```

| `profile` value | Meaning |
|-----------------|---------|
| _(absent)_ | Generic WEFT — no platform-specific fields |
| `"ravelry"` | Ravelry profile — includes `ravelry{}` extension blocks |
| `"stash2go"` | Stash2Go profile — includes `stash2go{}` extension blocks |

### What an app exports

| Scenario | `exported_from.app` | `profile` | What's in the file |
|----------|--------------------|-----------|--------------------|
| Stash2Go full backup | `stash2go` | `stash2go` | Base WEFT + `stash2go{}` blocks (migration status, matchmaker, device) |
| Stash2Go → generic export | `stash2go` | _(absent)_ | Base WEFT only — maximum compatibility |
| Stash2Go → Ravelry-shaped export | `stash2go` | `ravelry` | Base WEFT + `ravelry{}` blocks (Ravelry IDs, permalink, social counts) |

### What an app imports

1. Read `weft_version` — reject if major version unsupported
2. Read `profile` — if it's YOUR profile, parse your extension blocks; otherwise ignore them
3. **Always** read the base WEFT fields (they're guaranteed present)
4. **Preserve** unknown extension blocks on re-export (don't strip `ravelry{}` if you're Stash2Go)

## Profile Rules

1. **Extension blocks are namespaced** — each profile puts its platform-specific data in a block named after itself: `ravelry{}`, `stash2go{}`, `{your-app}{}`. No collisions.
2. **Base fields are canonical** — the base WEFT fields are the source of truth. Extension blocks carry supplementary/platform-specific data. If `stash2go.ravelry_stash_id` conflicts with `external_ids.ravelry`, the base field wins.
3. **Profiles compose** — a file CAN have multiple extension blocks (e.g., `ravelry{}` + `stash2go{}` if Stash2Go exports a Ravelry-linked item). This is just `additionalProperties: true` at work.
4. **Profiles are optional** — apps that only understand base WEFT ignore all extension blocks. Zero data loss on the base fields.

## Available Profiles

| Profile | Schema | Description |
|---------|--------|-------------|
| `ravelry` | [`ravelry.schema.json`](ravelry.schema.json) | Ravelry yarn stash + fiber stash. ID patterns, pack models, social counts. |
| `stash2go` | [`stash2go.schema.json`](stash2go.schema.json) | Stash2Go native/migrated/synced stash. Migration tracking, matchmaker, device sync. |

## Adding a New Profile

To add a profile for your app:

1. Create `{your-app}.schema.json` in this folder
2. Use `allOf` to extend `../../material.schema.json#/$defs/Material`
3. Put all your platform-specific fields inside a `{your-app}` extension block
4. Define sub-types in `$defs` for your specific data variants
5. Submit a PR
