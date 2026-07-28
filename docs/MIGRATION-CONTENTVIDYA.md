# Migration Plan: `@chronos-ui/core` → `@contentvidya/ui`

## Current state (verified in repo)

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

### Release 1 — `v2.0.0` of `@chronos-ui/core`: dual-publish, deprecation warning

Goal: publish the new name, keep the old name fully functional, start warning.

- Publish **`@contentvidya/ui@2.0.0`** as the real package (source of truth going forward).
- Publish **`@chronos-ui/core@2.0.0`** as a thin **compatibility wrapper** that:
  - Re-exports 100% of `@contentvidya/ui`'s public API (ESM + CJS + types — see wrapper package plan below).
  - Emits a one-time console deprecation warning on import (Node) / logs to console in browser dev builds only (avoid spamming production).
- `package.json` `repository`/`homepage` in `@contentvidya/ui` point at the (still `chronos-ui`-named) repo for now.
- Update `chronos-cms-admin`:
  - `package.json`: switch dependency to `"@contentvidya/ui": "^2.0.0"`.
  - `svelte.config.js`: update aliases from `@chronos/ui/...` to `@contentvidya/ui/...`, pointing at the same local `../chronos-ui` path (repo folder name unchanged in this release).
  - Do a codemod pass (see Update Source Code Import task) on all `.svelte`/`.ts` import specifiers.
- CHANGELOG + npm deprecation message on `@chronos-ui/core` (see below) — **not `npm deprecate` yet**, since it's still a maintained wrapper, just warn in-console.

### Release 2 — `v3.0.0`: repo rename, hard npm deprecation

Goal: finish the rename cleanup, mark the old name deprecated in the registry.

- Rename GitHub repo `nilkoushik/chronos-ui` → `nilkoushik/contentvidya-ui`. GitHub redirects old clone/remote URLs automatically.
- Update `package.json` `repository`/`homepage`/`bugs` in `@contentvidya/ui` to the new repo URL.
- Run `npm deprecate @chronos-ui/core@">=0.0.0" "Renamed to @contentvidya/ui. See MIGRATION-CONTENTVIDYA.md"` — this makes `npm install` show a registry-level deprecation notice, on top of the runtime console warning.
- `@chronos-ui/core` wrapper bumps to `v3.0.0`, still fully functional, still forwards to `@contentvidya/ui@3.0.0`.
- Update all internal repos (chronos-cms-admin, any others) to reference the new repo URL in docs/READMEs.
- No breaking API changes yet in either package — this release is entirely about naming/URLs.

### Release 3 — `v4.0.0`: sunset window opens

Goal: give consumers a hard signal that the old name's shelf life is ending, without pulling it yet.

- `@contentvidya/ui@4.0.0` may now carry real API changes (first release where `@chronos-ui/core` compat wrapper is allowed to lag behind or be capped).
- `@chronos-ui/core` wrapper is **capped at the last compatible version** (e.g. stays on `v3.x`, gets one final patch adding a stronger deprecation message with a removal date), and is not updated further.
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
npm deprecate @chronos-ui/core@">=0.0.0" "Chronos UI has been rebranded to ContentVidya UI. This package now only re-exports @contentvidya/ui for backward compatibility and will not receive new features. Please migrate: npm install @contentvidya/ui. See https://github.com/nilkoushik/contentvidya-ui/blob/main/docs/MIGRATION-CONTENTVIDYA.md"
```

Console runtime warning (dev-mode only, printed once per process):

```
[@chronos-ui/core] This package has been renamed to @contentvidya/ui. @chronos-ui/core is now a compatibility shim and will stop receiving updates after v3.x. Migrate at your convenience — see the migration guide.
```

## package.json examples

**New primary package** (`@contentvidya/ui/package.json`, abridged):
```json
{
  "name": "@contentvidya/ui",
  "version": "2.0.0",
  "description": "A universal, framework-agnostic UI component library. Write once, compile to React, Svelte, and Web Components.",
  "repository": { "type": "git", "url": "git+https://github.com/nilkoushik/chronos-ui.git" },
  "publishConfig": { "access": "public" }
}
```
(`repository.url` updates to `contentvidya-ui` in Release 2.)

**Compat wrapper** (`@chronos-ui/core/package.json`, abridged):
```json
{
  "name": "@chronos-ui/core",
  "version": "2.0.0",
  "description": "DEPRECATED: renamed to @contentvidya/ui. This package re-exports @contentvidya/ui for backward compatibility.",
  "dependencies": { "@contentvidya/ui": "2.0.0" },
  "deprecated": "Renamed to @contentvidya/ui — see README"
}
```

**Consumer** (`chronos-cms-admin/package.json`, relevant line):
```json
"dependencies": {
  "@contentvidya/ui": "^2.0.0"
}
```

---

## Open items to confirm before executing Release 1

- Confirm target npm scope ownership: is `@contentvidya` an org you already control on npm, or does it need to be created/verified first?
- Confirm whether `chronos-cms-admin`'s local dev alias (`../chronos-ui` folder path) should be renamed to `../contentvidya-ui` in Release 1 or deferred to Release 2 alongside the GitHub repo rename — recommend deferring to keep Release 1 npm-only.
