# Chronos UI Component Library

Chronos UI is a universal, framework-agnostic component library designed to power both the Chronos CMS visual editor and the end-user storefronts. Built with [Mitosis](https://mitosis.builder.io/), this single codebase cross-compiles natively into **React**, **Svelte**, and **Web Components** to ensure 100% feature parity and native SSR support across all our ecosystems.

---

## 🛠️ Development & Build Guide

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Initial Setup
```bash
cd chronos-ui
npm install
```

### Development Workflow
All source components are written in a JSX-like syntax (`.lite.tsx`) inside the `src/components/` directory.

1. **Create/Edit a Component**: Add or modify files in `src/components/`. For example, `src/components/Banner.lite.tsx`.
2. **Update Global Styles**: Modify CSS variables in `src/styles/theme.css` to adjust the design system.

### Compiling the Library
To compile your Mitosis components into the native frameworks, run:
```bash
npx mitosis build
```
This command processes the `mitosis.config.js` rules and generates the output files into the `dist/` directory:
- `dist/react/`
- `dist/svelte/`
- `dist/webcomponent/`

---

## 🚀 Publishing the Library

To distribute the component library so that other tenant projects can install it via npm, follow these steps:

### 1. Versioning
Update the version number in your `package.json` following semantic versioning:
```bash
npm version patch # or minor, major
```

### 2. Export Configuration
Ensure your `package.json` correctly points to the output targets so consumers get the right files. Add the following to `package.json`:
```json
{
  "name": "@chronos/ui",
  "version": "1.0.1",
  "main": "dist/react/index.js",
  "exports": {
    "./react": "./dist/react/src/components",
    "./svelte": "./dist/svelte/src/components",
    "./webcomponents": "./dist/webcomponent/src/components",
    "./theme": "./src/styles/theme.css"
  }
}
```

### 3. Publish to NPM (or Private Registry)
Authenticate with your registry and publish:
```bash
# If publishing publicly
npm publish --access public

# If using a private Github/Gitlab package registry
npm publish
```

---

## 💻 Implementation Guide (Usage)

Once the library is published (or linked locally via `npm link`), you can consume it in your applications. 

### Step 1: Import the Theme
Regardless of the framework, you must import the core CSS variables.
In your global CSS or main entry file (e.g., `_app.tsx`, `+layout.svelte`), import the theme:
```css
@import '@chronos/ui/theme';
```
*You can easily override any variable directly in your app's CSS to customize the look and feel (e.g., redefining `--chronos-color-primary`).*

### Step 2: Framework Integration

#### ⚛️ Using in React (Next.js, Vite, CRA)
Because Mitosis compiles to native React, these components are fully SSR compatible and hydrate perfectly.

```tsx
// pages/index.tsx
import { Banner, TimerWidget } from '@chronos/ui/react';

export default function Home() {
  return (
    <main>
      <Banner 
        title="Summer Sale" 
        subtitle="Up to 50% off everything!" 
        ctaText="Shop Now" 
        align="center"
      />
      
      <TimerWidget 
        title="Sale ends in:" 
        targetDate="2026-12-31T23:59:59Z" 
      />
    </main>
  );
}
```

#### 🟠 Using in Svelte 5 (SvelteKit)
Mitosis outputs native `.svelte` files. You import them just like any local component.

```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { Banner, TimerWidget } from '@chronos/ui/svelte';
</script>

<main>
  <Banner 
    title="Summer Sale" 
    subtitle="Up to 50% off everything!" 
    ctaText="Shop Now" 
    align="center"
  />
  
  <TimerWidget 
    title="Sale ends in:" 
    targetDate="2026-12-31T23:59:59Z" 
  />
</main>
```

#### 🌐 Using Web Components (Vanilla HTML / CMS Visual Editor)
For non-framework environments or inside the raw visual editor renderer, you can use the custom elements directly.

```html
<head>
  <link rel="stylesheet" href="node_modules/@chronos/ui/theme.css">
  <script type="module" src="node_modules/@chronos/ui/webcomponents/Banner.js"></script>
</head>
<body>
  <banner-element 
    title="Summer Sale" 
    subtitle="Up to 50% off everything!" 
    cta-text="Shop Now">
  </banner-element>
</body>
```
