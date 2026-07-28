# ContentVidya UI

<p align="center">
  <a href="https://www.npmjs.com/package/@contentvidya/ui"><img src="https://img.shields.io/npm/v/@contentvidya/ui?style=flat-square&color=7c3aed&label=npm" alt="npm version" /></a>
  <a href="https://github.com/nilkoushik/chronos-ui/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="MIT License" /></a>
  <a href="https://github.com/nilkoushik/chronos-ui/actions/workflows/publish.yml"><img src="https://img.shields.io/github/actions/workflow/status/nilkoushik/chronos-ui/publish.yml?style=flat-square&label=publish" alt="Build status" /></a>
  <a href="https://nilkoushik.github.io/chronos-ui"><img src="https://img.shields.io/badge/docs-GitHub%20Pages-ec4899?style=flat-square" alt="Docs" /></a>
</p>

<p align="center">
  A universal, framework-agnostic UI component library built with <a href="https://mitosis.builder.io/">Mitosis</a>.<br>
  Write once — compile natively to <strong>React</strong>, <strong>Svelte</strong>, and <strong>Web Components</strong>.
</p>

<p align="center">
  <a href="https://nilkoushik.github.io/chronos-ui">📖 Documentation</a> ·
  <a href="https://www.npmjs.com/package/@contentvidya/ui">📦 npm Package</a> ·
  <a href="https://github.com/nilkoushik/chronos-ui/issues">🐛 Bug Reports</a>
</p>

> **Formerly Chronos UI.** This package was renamed from `@chronos-ui/core` to `@contentvidya/ui`. Existing `@chronos-ui/core` imports keep working via a compatibility package — see the [announcement](./docs/ANNOUNCEMENT-CONTENTVIDYA.md) and [migration guide](./docs/MIGRATION-CONTENTVIDYA.md).

---

## ✨ Components

| Component | Description |
|---|---|
| **Banner** | Full-bleed hero banner — image/video background, title, CTA |
| **AnnouncementBar** | Slim promotional bar with customisable colours |
| **GridBanner** | Responsive CSS grid of banner cards |
| **MediaGrid** | Editorial 2-column layout at 21:9 aspect ratio |
| **RowScrollable** | Horizontally scrollable card row with snap-scroll |
| **SlidingBanner** | Slider with 13 transition effects & canvas backgrounds |
| **AlternatingSlider** | Multi-column slider with opposing vertical scroll |
| **TimerWidget** | Live countdown timer (days / hours / minutes / seconds) |
| **WysiwygRenderer** | Scoped rich-text HTML renderer for CMS content |
| **RichTextEditor** | Advanced headless WYSIWYG editor with custom inline styles and toolbars |

---

## 🚀 Installation

```bash
npm install @contentvidya/ui
```

<details>
<summary>Migrating from <code>@chronos-ui/core</code>?</summary>

```bash
npm uninstall @chronos-ui/core
npm install @contentvidya/ui
```

`@chronos-ui/core` still works — it now re-exports `@contentvidya/ui` — but new features and fixes only ship under the new name. See the [migration guide](./docs/MIGRATION-CONTENTVIDYA.md) for the full timeline and a codemod for bulk import updates.
</details>

---

## 💻 Usage

### Step 1 — Import the theme

In your app's global stylesheet or entry file:

```css
@import '@contentvidya/ui/theme.css';
```

Override any CSS variable to customise the design system:

```css
:root {
  --chronos-color-primary: #e11d48;   /* your brand colour */
  --chronos-font-family: 'Poppins', sans-serif;
}
```

### Step 2 — Use in your framework

#### ⚛️ React / Next.js

```tsx
import Banner from '@contentvidya/ui/react/Banner';
import TimerWidget from '@contentvidya/ui/react/TimerWidget';

export default function Page() {
  return (
    <main>
      <Banner
        title="Summer Sale"
        subtitle="Up to 50% off"
        ctaText="Shop Now"
        media={{ type: 'image', url: '/hero.jpg' }}
        mapLinks={[{ url: '/sale' }]}
      />
      <TimerWidget title="Ends in:" targetDate="2026-12-31T23:59:59Z" />
    </main>
  );
}
```

#### 🟠 Svelte / SvelteKit

```svelte
<script lang="ts">
  import Banner from '@contentvidya/ui/svelte/Banner.svelte';
  import TimerWidget from '@contentvidya/ui/svelte/TimerWidget.svelte';
</script>

<Banner title="Summer Sale" ctaText="Shop Now" />
<TimerWidget title="Ends in:" targetDate="2026-12-31T23:59:59Z" />
```

#### 🌐 Web Components (Vanilla HTML / CMS Renderer)

```html
<link rel="stylesheet" href="node_modules/@contentvidya/ui/theme.css" />
<script type="module" src="node_modules/@contentvidya/ui/webcomponents/Banner.js"></script>

<banner-element
  title="Summer Sale"
  subtitle="Up to 50% off"
  cta-text="Shop Now"
></banner-element>
```

---



## 📖 Documentation

Full interactive docs are hosted on GitHub Pages:

**[nilkoushik.github.io/chronos-ui](https://nilkoushik.github.io/chronos-ui)**

Each component page includes:
- Live in-browser preview
- Props reference table
- Copy-ready code for React, Svelte, and Web Components

---

## 📁 Repository Structure

```
src/
  components/       Mitosis source (.lite.tsx) — single source of truth
  styles/           theme.css — CSS design token variables
dist/               Compiled output (not committed; built on publish)
  react/
  svelte/
  webcomponent/
docs/               GitHub Pages documentation site
  index.html
  components/       One page per component
  css/docs.css
  js/docs.js
.github/workflows/
  publish.yml       npm publish on git tag
  docs.yml          GitHub Pages deploy on main push
```

---

## 🏗️ Built With

- [Mitosis](https://mitosis.builder.io/) — single-source component compiler
- [TypeScript](https://www.typescriptlang.org/) — typed component props
- Vanilla CSS — zero runtime style dependencies

---

## 📄 License

[MIT](./LICENSE) © ContentVidya UI Contributors (formerly Chronos UI Contributors)
