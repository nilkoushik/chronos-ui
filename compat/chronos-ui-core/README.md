# @chronos-ui/core (deprecated)

This package has been renamed to **[`@contentvidya/ui`](https://www.npmjs.com/package/@contentvidya/ui)**.

`@chronos-ui/core` is now a zero-logic compatibility forwarder: every import you already have keeps working unchanged, because every subpath resolves straight through to the equivalent file in `@contentvidya/ui` (its only dependency). No components were copied or duplicated here.

```bash
npm uninstall @chronos-ui/core
npm install @contentvidya/ui
```

Then update import specifiers from `@chronos-ui/core/...` to `@contentvidya/ui/...`. See the [migration guide](https://github.com/nilkoushik/chronos-ui/blob/main/docs/MIGRATION-CONTENTVIDYA.md) for the full timeline, a codemod, and package.json examples.

## What this package does and doesn't do

- ✅ Forwards the root entry, `./theme.css`, `./styles/*`, `./react/*`, `./react/utils/*`, `./svelte/*`, `./svelte/utils/*`, `./webcomponent/*`, `./webcomponent/utils/*` — same subpath shape as `@contentvidya/ui`.
- ✅ Prints a one-time deprecation notice on `npm install` (console), so it's visible even to consumers who never look at their terminal during `npm run dev`.
- ✅ Prints a one-time runtime console warning the first time any module is imported through the root entry point (`import ... from '@chronos-ui/core'`).
- ⚠️ Component-level subpaths (`@chronos-ui/core/react/Banner`, `@chronos-ui/core/svelte/Banner.svelte`, etc.) resolve directly into `@contentvidya/ui`'s files and do **not** re-trigger the runtime console warning — only the npm-install-time notice and the root-entry import do. This is a known limitation of doing a pure path-forward for non-JS assets like `.svelte` files; it does not affect functionality, only which of the two warning channels you see.
- ⚠️ Ships exactly what `@contentvidya/ui` ships — if a future `@contentvidya/ui` release adds a CommonJS build or `.d.ts` type declarations, this wrapper inherits them automatically (nothing to regenerate here). As of `v1.4.2`, `@contentvidya/ui` itself is ESM + native `.svelte`/web-component sources only, with no CJS build and no `.d.ts` files, so this wrapper cannot offer more than its dependency does.

## Support timeline

See [`MIGRATION-CONTENTVIDYA.md`](https://github.com/nilkoushik/chronos-ui/blob/main/docs/MIGRATION-CONTENTVIDYA.md) — in short: fully functional now (`v1.4.2`), registry-marked deprecated at `v1.5.0`, capped/frozen at `v2.0.0` with an announced end-of-support date.
