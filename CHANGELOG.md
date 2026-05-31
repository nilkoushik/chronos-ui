# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
