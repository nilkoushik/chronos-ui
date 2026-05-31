# Contributing to Chronos UI

Thank you for your interest in contributing! This document outlines the process for submitting changes.

## Development Setup

```bash
git clone https://github.com/nilkoushik/chronos-ui.git
cd chronos-ui
npm install
```

## Project Structure

```
src/
  components/   # Mitosis source files (.lite.tsx)
  styles/       # Global theme CSS variables
dist/           # Compiled output (auto-generated, not committed)
docs/           # GitHub Pages documentation site
```

## Making Changes

### Adding or Modifying a Component

1. Edit or create a file in `src/components/` using Mitosis JSX syntax (`.lite.tsx`).
2. Add or update corresponding styles in `src/styles/theme.css` using the `--chronos-*` CSS variable naming convention.
3. Run `npm run build` to compile to all targets and verify the output.
4. Update the component's documentation page in `docs/components/`.

### Mitosis Constraints

Mitosis imposes some limitations compared to standard React:
- No default exports of non-component values
- State must use `useStore()`; no raw `useState`
- Lifecycle hooks: `onMount`, `onUnMount` (not `useEffect`)
- Avoid complex TypeScript generics in component props

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(banner): add isLoading shimmer prop
fix(timer): clear interval on unmount
docs(readme): add svelte usage example
chore: bump mitosis to 0.14.0
```

## Pull Request Process

1. Fork the repository and create a branch from `main`.
2. Make your changes and ensure `npm run build` succeeds.
3. Update `CHANGELOG.md` under the `[Unreleased]` section.
4. Open a Pull Request with a clear description of the change.

## Releasing (Maintainers Only)

```bash
# Bump version (patch | minor | major)
npm version patch

# This auto-runs: build → git tag → git push → npm publish
```

The GitHub Actions `publish.yml` workflow handles npm publishing on tagged commits.
