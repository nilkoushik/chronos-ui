# Chronos UI is becoming ContentVidya UI

*Announcement — Release 1 (`v1.4.2`), updated: GitHub repo also now renamed to `nilkoushik/contentvidya-ui`*

## TL;DR

- `@chronos-ui/core` is being renamed to **`@contentvidya/ui`**.
- Your existing `@chronos-ui/core` imports **will keep working** — nothing breaks today.
- New features, fixes, and future releases land in `@contentvidya/ui`. `@chronos-ui/core` becomes a thin compatibility package that re-exports it.
- Migrate whenever it's convenient for you — see the [migration guide](./MIGRATION-CONTENTVIDYA.md) — but do it before the compatibility package's sunset window closes (details below).

## Why we're rebranding

Chronos UI started as a focused component library for one CMS project. It's grown into the shared front-end foundation across the ContentVidya product family — the CMS core, the admin console, and the public content layer all lean on it. "Chronos" no longer describes what the library actually is or who it serves. Renaming it to **ContentVidya UI** aligns the component library's name with the platform it powers, instead of carrying a name tied to its original, narrower origin.

## The vision behind ContentVidya

ContentVidya is the umbrella brand for the whole platform — CMS core, page builder, admin tooling, and (soon) AI-assisted content workflows — built around one design system instead of a patchwork of loosely related tools. Renaming the UI library first, and treating it as the shared design foundation, is the starting point for that: every product surface under the ContentVidya name should feel like it belongs to the same system, not like a component library was bolted on after the fact.

## What actually changes for you

| | Before | After |
|---|---|---|
| Package | `@chronos-ui/core` | `@contentvidya/ui` |
| Import | `import Banner from '@chronos-ui/core/react/Banner'` | `import Banner from '@contentvidya/ui/react/Banner'` |
| Theme import | `@chronos-ui/core/theme.css` | `@contentvidya/ui/theme.css` |
| Component API | unchanged | unchanged |
| CSS variable names | unchanged (`--chronos-color-*` etc. stay as-is in this release) | unchanged |

No component props, behavior, or CSS variable names change in this release — this is a naming/packaging change only.

## Our backward-compatibility promise

We know renames are disruptive when they're forced. So they won't be forced here:

1. **`@chronos-ui/core` keeps working** — it becomes a re-export wrapper around `@contentvidya/ui`, published in lockstep, fully typed (ESM + CJS + `.d.ts`).
2. **No silent breakage.** You'll see a one-time, dev-only console notice pointing at the migration guide — nothing that fails your build or lints.
3. **A real sunset timeline, not an abrupt cutoff.** The old package is supported through Release 2 (`v1.5.0`, includes an `npm deprecate` registry notice) and stays functional — capped at its last compatible version — through Release 3 (`v2.0.0`), with an announced end-of-support date at that point. Full detail in the [migration plan](./MIGRATION-CONTENTVIDYA.md).

## How to migrate

```bash
npm uninstall @chronos-ui/core
npm install @contentvidya/ui
```

Then update imports — a codemod is available so you don't have to do this by hand across a large codebase (see the migration guide's tooling section). At minimum:

```diff
- import Banner from '@chronos-ui/core/react/Banner';
+ import Banner from '@contentvidya/ui/react/Banner';

- @import '@chronos-ui/core/theme.css';
+ @import '@contentvidya/ui/theme.css';
```

Full step-by-step detail, package.json examples, and the 3-release timeline live in [`MIGRATION-CONTENTVIDYA.md`](./MIGRATION-CONTENTVIDYA.md).

## What's next

- **Repo rename** (`chronos-ui` → `contentvidya-ui` on GitHub) is done. GitHub redirects old clone/remote URLs automatically, so this shouldn't require action on your end. The registry-level `npm deprecate` notice for `@chronos-ui/core` is still pending, tracked as the rest of Release 2.
- **Documentation site** moves to the ContentVidya-branded domain/theme in step with the repo rename.
- **New components and API surface** going forward ship under the ContentVidya UI name and design language.

Questions, or something in your setup doesn't migrate cleanly? Open an issue on the repo (linked from the README) — we'd rather hear about friction now than have you stuck on a deprecated package longer than you need to be.

— The ContentVidya UI maintainers
