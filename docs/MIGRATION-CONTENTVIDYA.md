# Migration Plan: `@chronos-ui/core` → `@contentvidya/ui`

> **Status:** Release 1 shipped (`@contentvidya/ui@1.4.2` + `@chronos-ui/core@1.4.2` compat wrapper both live on npm) and the GitHub repo has been renamed to `nilkoushik/contentvidya-ui`. The "Current state" section below describes the repo as it was *before* this plan started executing — kept as-is for history; see the Release 1/2/3 status markers further down for what's actually done.

## Current state (verified in repo, at time this plan was written)

- Single npm package, not a multi-package scope: `@chronos-ui/core`, currently `v1.4.1`.
- Repo: `github.com/nilkoushik/chronos-ui`, published from this repo's `dist/`.
- `homepage`/`repository`/`bugs` fields in `package.json` point at `nilkoushik/chronos-ui`.
- Consumer: `chronos-cms-admin` depends on it two ways:
  - `package.json`: `"@chronos-ui/core": "^1.4.1"` (real npm dependency, used for types/React import resolution).
  - `svelte.config.js` local alias, **not** npm resolution, for Svelte components:
    ```
    '@chronos/ui/svelte/utils': '../chronos-ui/dist/svelte/src/utils',
    '@chronos/ui/svelte':       '../chronos-ui/dist/svelte/src/components',
    '@chronos/ui/theme.css':    '../chronos-ui/src/styles/theme.css',
    '@chronos/ui/styles':       '../chronos-ui/src/styles',
    ```
    (Note the existing inconsistency: import specifier is `@chronos/ui/...` but the published package is `@chronos-ui/core` — the alias in svelte.config.js is what actually resolves it locally; npm scope is irrelevant to that path.)
  - `vite.config.ts` has `fs.allow: ['../chronos-ui']` for dev-server file access to the sibling repo.
- `chronos-cms-backend` has no code dependency — only doc/knowledge-base mentions.

This plan does **not** assume a multi-package monorepo (`@chronos-ui/icons`, `/themes`, `/react` etc.) — those don't exist yet in this repo. If/when the library is split into multiple packages, treat that as a separate restructuring project layered on top of this rename.

## Scope of this migration

1. npm package rename: `@chronos-ui/core` → `@contentvidya/ui`
2. GitHub repo rename: `nilkoushik/chronos-ui` → `nilkoushik/contentvidya-ui` (optional/deferred — see below)
3. Consumer updates in `chronos-cms-admin` (local alias + real dependency)
4. Backward-compatibility shim so existing `@chronos-ui/core` imports keep working

## Should the git repo be renamed?

GitHub repo renames are low-risk (GitHub auto-redirects the old URL, including `git clone`/`git remote` and `npm install git+...` if ever used), but they do invalidate:
- Any hardcoded `nilkoushik/chronos-ui` links in docs, CI badges, `homepage`/`repository` package.json fields
- Local clones' `origin` remote (still works via redirect, but `git remote -v` shows stale URL until updated)
- GitHub Pages URL if `homepage` docs site is published from this repo (currently `nilkoushik.github.io/chronos-ui`)

**Recommendation:** rename the repo in Release 2 (see below), after the npm package rename has shipped and stabilized in Release 1, since the repo rename is purely cosmetic/URL-hygiene and safest once the higher-risk package rename is proven. GitHub's redirect makes this low-blast-radius; do it deliberately rather than reactively.

---

## Release plan (3 releases)

Versions kept on the existing `1.4.x`/`1.5.x` line rather than jumping to `2.0.0` for Releases 1–2, since neither is an API-breaking change for consumers — only Release 3 is allowed to bump major.

### Release 1 — `v1.4.2`: dual-publish, deprecation warning — ✅ done

Goal: publish the new name, keep the old name fully functional, start warning.

- ✅ Published **`@contentvidya/ui@1.4.2`** as the real package (source of truth going forward).
- ✅ Published **`@chronos-ui/core@1.4.2`** as a thin **compatibility wrapper**: every subpath forwards directly into `@contentvidya/ui`'s files (no duplicated component code — see `compat/chronos-ui-core/`).
  - ✅ Root-entry import emits a one-time console deprecation warning; `postinstall` prints an install-time notice too.
  - Full ESM + CJS + typed re-exports were the original ambition, but `@contentvidya/ui` itself doesn't ship CJS or `.d.ts` yet — the wrapper only forwards what actually exists (see `compat/chronos-ui-core/README.md`).
- ⬜ `chronos-cms-admin`: switch dependency to `@contentvidya/ui`, update `svelte.config.js` aliases, codemod all import specifiers — not yet done.

### Release 2 — `v1.5.0`: repo rename, hard npm deprecation — repo rename ✅ done, rest pending

Goal: finish the rename cleanup, mark the old name deprecated in the registry.

- ✅ Renamed GitHub repo `nilkoushik/chronos-ui` → `nilkoushik/contentvidya-ui`. GitHub redirects old clone/remote URLs automatically.
- ✅ Updated `package.json` `repository`/`homepage`/`bugs` in both `@contentvidya/ui` and `@chronos-ui/core` to the new repo URL; updated local `git remote`, README, CONTRIBUTING.md.
- ⬜ Run `npm deprecate @chronos-ui/core@">=0.0.0" "Renamed to @contentvidya/ui. See MIGRATION-CONTENTVIDYA.md"` — registry-level deprecation notice, on top of the runtime/install-time warnings already live. Not yet run (currently relying on the `"deprecated"` field set at publish time, which already surfaces in `npm install` output — `npm deprecate` is for retroactively marking *other* already-published versions too).
- ⬜ `@chronos-ui/core` wrapper bump to `v1.5.0` alongside `@contentvidya/ui@1.5.0` — not yet released.
- ⬜ Update internal repos (chronos-cms-admin, any others) to reference the new repo URL in docs/READMEs.
- No breaking API changes in either package — this release is entirely about naming/URLs.

### Release 3 — `v2.0.0`: sunset window opens

Goal: give consumers a hard signal that the old name's shelf life is ending, without pulling it yet.

- `@contentvidya/ui@2.0.0` may now carry real API changes (first release where `@chronos-ui/core` compat wrapper is allowed to lag behind or be capped).
- `@chronos-ui/core` wrapper is **capped at the last compatible version** (e.g. stays on `v1.5.x`, gets one final patch adding a stronger deprecation message with a removal date), and is not updated further.
- README of `@chronos-ui/core` on npm updated to state end-of-support date (recommend: 6 months from Release 2's `npm deprecate`).
- Internal repos (chronos-cms-admin) must be fully migrated to `@contentvidya/ui` by this point — no internal consumer should still resolve through the compat wrapper.

---

## Backward compatibility mechanism

`@chronos-ui/core` becomes a **compatibility wrapper package**, not a git branch or version pin:
- ESM: `export * from '@contentvidya/ui'` per subpath (`./react/*`, `./svelte/*`, `./webcomponent/*`, `./styles/*`, `./theme.css` re-exported/re-pathed).
- CJS: `module.exports = require('@contentvidya/ui')` equivalent per subpath, generated by the same build.
- Types: `export * from '@contentvidya/ui'` `.d.ts` re-export files, one per subpath, so TS consumers get zero type errors switching the dependency but keeping the old import.
- Tree-shaking: since it's re-export-only (no wrapper logic in the module body besides the one-time dev-console warning gated behind `if (process.env.NODE_ENV !== 'production')`), bundlers should still tree-shake unused named exports through the re-export.

(Full generated package structure/source for this wrapper is a separate, focused task — flag when ready and I'll generate it.)

## npm deprecation message text (Release 2)

```
npm deprecate @chronos-ui/core@">=0.0.0" "Chronos UI has been rebranded to ContentVidya UI. This package now only re-exports @contentvidya/ui for backward compatibility and will not receive new features. Please migrate: npm install @contentvidya/ui. See https://github.com/nilkoushik/contentvidya-ui/blob/master/docs/MIGRATION-CONTENTVIDYA.md"
```

Console runtime warning (dev-mode only, printed once per process):

```
[@chronos-ui/core] This package has been renamed to @contentvidya/ui. @chronos-ui/core is now a compatibility shim and will stop receiving updates after v3.x. Migrate at your convenience — see the migration guide.
```

## package.json examples

**New primary package** (`@contentvidya/ui/package.json`, actual, as published):
```json
{
  "name": "@contentvidya/ui",
  "version": "1.4.2",
  "description": "A universal, framework-agnostic UI component library. Write once, compile to React, Svelte, and Web Components.",
  "homepage": "https://nilkoushik.github.io/contentvidya-ui",
  "repository": { "type": "git", "url": "git+https://github.com/nilkoushik/contentvidya-ui.git" },
  "bugs": { "url": "https://github.com/nilkoushik/contentvidya-ui/issues" },
  "publishConfig": { "access": "public" }
}
```

**Compat wrapper** (`@chronos-ui/core/package.json`, actual, as published — see `compat/chronos-ui-core/package.json`):
```json
{
  "name": "@chronos-ui/core",
  "version": "1.4.2",
  "description": "DEPRECATED: renamed to @contentvidya/ui. This package re-exports @contentvidya/ui for backward compatibility.",
  "homepage": "https://github.com/nilkoushik/contentvidya-ui/blob/master/docs/MIGRATION-CONTENTVIDYA.md",
  "repository": { "type": "git", "url": "git+https://github.com/nilkoushik/contentvidya-ui.git", "directory": "compat/chronos-ui-core" },
  "dependencies": { "@contentvidya/ui": "1.4.2" },
  "deprecated": "Renamed to @contentvidya/ui — see README"
}
```

**Consumer** (`chronos-cms-admin/package.json`, target — not yet applied):
```json
"dependencies": {
  "@contentvidya/ui": "^1.4.2"
}
```

---

## Open items

- ✅ npm scope: `@contentvidya` org exists and both packages are published under it.
- ⬜ `chronos-cms-admin`'s local dev alias (`../chronos-ui` folder path in `svelte.config.js`/`vite.config.ts`) — the local folder on disk is still named `chronos-ui`; decide whether to rename that folder to `contentvidya-ui` to match the GitHub repo, or leave the local path as-is since it's just a dev-time alias, unrelated to the published package name.
- ⬜ `chronos-cms-admin` hasn't been switched over to `@contentvidya/ui` yet (dependency, aliases, import specifiers) — next task.
- ⬜ Release 2's `npm deprecate` command and the `v1.5.0` wrapper bump haven't run yet.
