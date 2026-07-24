# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### ⚠️ Contract change
- **`config.backgroundEffect` is now strictly opt-in.** Banner and SlidingBanner no longer carry any bundled canvas-animation code themselves — background effects are rendered entirely through a shared, framework-agnostic plugin engine (`src/utils/backgroundEffects.ts`) that a component only calls into when `config.backgroundEffect` is explicitly set to something other than `'none'`/`undefined`. If you were relying on an effect appearing without setting this prop, or on SlidingBanner's old built-in particles/waves canvas code path, that no longer applies — pass `config.backgroundEffect` explicitly to get an effect. This keeps the core components lite by default with zero animation overhead unless requested.

### Added
- New `config.backgroundEffect` values: `'autumn'`, `'festival'`, `'santa'`, `'sea'` (previously: `'none' | 'particles' | 'waves' | 'rain' | 'thunderstorm' | 'sunrise' | 'sunset' | 'fog'`). Full type is now `'none' | 'particles' | 'waves' | 'rain' | 'thunderstorm' | 'sunrise' | 'sunset' | 'fog' | 'autumn' | 'festival' | 'santa' | 'sea'`.
- `'rain'`/`'thunderstorm'` now include a water band along the bottom edge with landing ripples.
- `'fog'` adds cinematic frost-shard particles flying outward from a vanishing point, in addition to existing wind-drift fog and light snow.
- `'santa'` reworked into a full seasonal scene: twinkling string lights, snowfall, a galloping-reindeer sleigh flyby with a glowing Rudolph nose that drops a candy-cane/peppermint trail and loops back through the lower half of the frame, and a "hide and seek" Santa cap that randomly peeks in from any of the four frame edges.
- `'sea'` renders as a thin, transparent, sea-tinted aerial waterline band (~10% of banner height) with breathing surge motion and drifting foam — designed to sit over a seashore/beach background image rather than fill the whole banner.
- CMS admin RowManager now exposes the full effect list for Hero rows, and the full list (gated to Sliding Banner rows) for Slider/AlternatingSlider rows.

### Changed
- SlidingBanner's background effects now go through the same shared plugin engine as Banner, instead of its own separate inline particles/waves implementation — behavior for `'particles'`/`'waves'` is unchanged, but the two components can no longer drift out of sync on effect support.
- Heavier canvas renderers (`rain`, `thunderstorm`, `sunrise`, `sunset`, `fog`, `festival`, `santa`, `sea`) are throttled to ~25–30fps instead of native display refresh rate, and `rain`/`thunderstorm` batch their per-drop/per-ripple draw calls, to reduce main-thread contention with a parent SlidingBanner's own autoplay transition.
- `santa` trims its particle counts (snowflakes, candy trail cap) relative to earlier iterations, specifically to avoid stalling slide transitions on the Sliding Banner.

### Fixed
- Reindeer/sleigh ordering and reindeer facing direction in the `santa` effect (reindeer previously appeared to trail behind, or fly facing backward, during the sleigh flyby).
- Santa cap hide-and-seek positioning (cap wasn't reaching visible position; left/right edge angles were swapped).

## [1.0.0] — 2026-05-31

### Added
- **Banner** — Full-bleed hero banner with image/video background, title, subtitle, CTA, and configurable text alignment. Supports loading shimmer state.
- **AnnouncementBar** — Slim top-of-page bar with customisable background colour, text colour, and optional link.
- **GridBanner** — Responsive CSS grid of banner cards; configurable column count with mobile breakpoints.
- **MediaGrid** — Editorial 2-column media grid (1 primary + N secondary items) with 21:9 aspect-ratio.
- **RowScrollable** — Horizontally scrollable card row with snap-scrolling and custom scrollbar.
- **SlidingBanner** — Full-featured slider with 13 transition effects (`slide`, `fade`, `zoom`, `flip`, `push-*`, `wipe-*`, `cube`, `door`, `fall`), particles/waves canvas backgrounds, autoplay, arrows, and dots.
- **AlternatingSlider** — Multi-column slider where adjacent columns scroll in opposite vertical directions; configurable column count, autoplay, arrows, and dots.
- **TimerWidget** — Live countdown timer that ticks every second; shows Days / Hours / Minutes / Seconds.
- **WysiwygRenderer** — Thin wrapper that safely renders HTML rich-text content with scoped typography styles.
- Global design token system via `src/styles/theme.css` (CSS custom properties with dark-mode support via `[data-theme="dark"]`).
- Mitosis-based build pipeline compiling to **React**, **Svelte**, and **Web Components** from a single source.
- GitHub Pages documentation site (`docs/`) with live component demos, prop tables, and copy-able code snippets.
- GitHub Actions workflows for automated npm publishing and docs deployment.
