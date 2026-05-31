#!/usr/bin/env node
/**
 * generate-docs.js
 *
 * Auto-generates docs/components/<slug>.html for every component defined in
 * scripts/docs-manifest.json.
 *
 * Data sources:
 *  - scripts/docs-manifest.json  → descriptions, examples, preview HTML/CSS, notes
 *  - src/components/*.lite.tsx   → prop names, types, required/optional from the
 *                                  `export interface <Name>Props { … }` block
 *
 * Run:  node scripts/generate-docs.js
 * Hook: npm run docs  (wired into the build and the CI workflow)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Paths ──────────────────────────────────────────────────────────────────
const ROOT        = path.resolve(__dirname, '..');
const SRC_DIR     = path.join(ROOT, 'src', 'components');
const DOCS_DIR    = path.join(ROOT, 'docs', 'components');
const MANIFEST    = require('./docs-manifest.json');
const PROPS_DB    = require('./docs-props.json');   // prop descriptions live here, NOT in .lite.tsx
const GITHUB_USER = 'nilkoushik';
const REPO        = 'chronos-ui';
const GITHUB_URL  = `https://github.com/${GITHUB_USER}/${REPO}`;
const PAGES_URL   = `https://${GITHUB_USER}.github.io/${REPO}`;

// ── Sidebar HTML (shared across every page) ────────────────────────────────
function buildSidebar(activeSlug) {
  const links = MANIFEST.map(c => {
    const active = c.slug === activeSlug ? ' active' : '';
    return `<a href="${c.slug}.html" class="sidebar-link${active}"><span class="sidebar-link-icon">${c.icon}</span> ${c.name}</a>`;
  }).join('\n      ');

  return `
    <aside class="docs-sidebar">
      <a href="../index.html" class="sidebar-brand">
        <div class="sidebar-logo">⏱</div>
        <span class="sidebar-brand-name">Chronos<span>UI</span></span>
        <span class="sidebar-version">v1.0.0-beta.1</span>
      </a>
      <nav class="sidebar-nav">
        <div class="sidebar-section-label">Getting Started</div>
        <a href="../index.html" class="sidebar-link"><span class="sidebar-link-icon">🏠</span> Home</a>
        <div class="sidebar-section-label" style="margin-top:1rem">Components</div>
        ${links}
        <div class="sidebar-section-label" style="margin-top:1rem">Resources</div>
        <a href="${GITHUB_URL}" target="_blank" rel="noopener" class="sidebar-link"><span class="sidebar-link-icon">⭐</span> GitHub</a>
        <a href="https://www.npmjs.com/package/@chronos-ui/core" target="_blank" rel="noopener" class="sidebar-link"><span class="sidebar-link-icon">📦</span> npm</a>
      </nav>
    </aside>`;
}

// ── Prop lookup (from docs-props.json) ────────────────────────────────────
/**
 * Returns the props array for a component by its manifest name.
 * Falls back to an empty array if no entry exists.
 */
function getProps(componentName) {
  // Normalise: strip spaces to match JSON keys (e.g. "Row Scrollable" → "RowScrollable")
  const key = componentName.replace(/\s+/g, '');
  return PROPS_DB[key] || [];
}

// ── Code block renderer ────────────────────────────────────────────────────
/**
 * Light syntax colouring for the code examples.
 * We apply <span class="…"> wrappers using simple regex substitutions.
 * This avoids shipping a full highlighter library to the docs site.
 */
function highlight(code, lang) {
  // Escape HTML first
  let s = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Strings (single, double, template) — must run before keywords
  s = s.replace(/(`[^`]*`|'[^'\\]*(?:\\.[^'\\]*)*'|"[^"\\]*(?:\\.[^"\\]*)*")/g,
    '\x00STR\x00$1\x00/STR\x00');

  // Comments — single-line
  s = s.replace(/(\/\/[^\n]*)/g,
    '\x00CM\x00$1\x00/CM\x00');

  // Keywords (only outside strings/comments)
  s = s.replace(/\b(import|from|export|default|const|let|var|return|function|async|await|true|false|null|undefined)\b/g,
    '\x00KW\x00$1\x00/KW\x00');

  // HTML/JSX tag names  &lt;TagName or &lt;/TagName
  s = s.replace(/(&lt;\/?)([\w-]+)/g,
    '$1\x00TAG\x00$2\x00/TAG\x00');

  // Now swap placeholders for real spans (so they don't interfere with each other)
  s = s
    .replace(/\x00STR\x00([\s\S]*?)\x00\/STR\x00/g, '<span class="str">$1</span>')
    .replace(/\x00CM\x00([\s\S]*?)\x00\/CM\x00/g,   '<span class="cm">$1</span>')
    .replace(/\x00KW\x00([\s\S]*?)\x00\/KW\x00/g,   '<span class="kw">$1</span>')
    .replace(/\x00TAG\x00([\s\S]*?)\x00\/TAG\x00/g, '<span class="tag">$1</span>');

  return s;
}

function codeBlock(code, lang) {
  const highlighted = highlight(code, lang);
  return `
    <div class="code-block">
      <button class="copy-btn">Copy</button>
      <pre><code>${highlighted}</code></pre>
    </div>`;
}

// ── Notes / alerts ─────────────────────────────────────────────────────────
function buildNotes(notes) {
  if (!notes || notes.length === 0) return '';
  return notes.map(n => `<div class="alert alert-${n.type}">${n.text}</div>`).join('\n');
}

// ── Props table ─────────────────────────────────────────────────────────────
function buildPropsTable(props) {
  if (!props.length) return '<p style="color:var(--text-muted);font-size:.85rem">No props parsed — ensure the .lite.tsx interface matches the naming convention.</p>';

  const rows = props.map(p => {
    const req = p.required
      ? `<span class="prop-required">required</span>`
      : '';
    return `
      <tr>
        <td><span class="prop-name">${p.name}</span> ${req}</td>
        <td><span class="prop-type">${p.type.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</span></td>
        <td><span class="prop-default">${p.required ? '—' : 'undefined'}</span></td>
        <td>${p.description || '—'}</td>
      </tr>`;
  }).join('');

  return `
    <div class="props-table-wrap">
      <table class="props-table">
        <thead>
          <tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ── Full page template ──────────────────────────────────────────────────────
function buildPage(component) {
  const { name, slug, icon, examples, notes, previewLabel, previewCss,
          previewHtml, previewScript, extra } = component;

  // Derive the PascalCase name from the manifest name (e.g. "Row Scrollable" → "RowScrollable")
  const pascalName = name.replace(/\s+(\w)/g, (_, c) => c.toUpperCase()).replace(/^\w/, c => c.toUpperCase());

  const props = getProps(name);
  const sidebar = buildSidebar(slug);

  // Preview flush flag: timer + slider demos need padding:0
  const previewBodyClass = (slug === 'sliding-banner' || slug === 'alternating-slider')
    ? 'preview-body-flush'
    : 'preview-body';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} — Chronos UI</title>
  <meta name="description" content="${component.cardDesc}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="stylesheet" href="../css/docs.css" />
  ${previewCss ? `<style>${previewCss}</style>` : ''}
</head>
<body>
<div class="docs-shell">
  ${sidebar}

  <main class="docs-main">
    <div class="docs-topbar">
      <button class="sidebar-toggle" id="sidebar-toggle">☰</button>
      <div class="topbar-breadcrumb">
        <a href="../index.html">Chronos UI</a><span class="sep">/</span>
        <span class="current">${name}</span>
      </div>
      <div class="topbar-actions">
        <a href="${GITHUB_URL}/blob/main/src/components/${pascalName.replace(/\s/g,'')}.lite.tsx"
           target="_blank" rel="noopener" class="btn-github">View Source</a>
      </div>
    </div>

    <div class="docs-content">
      <!-- Page Header -->
      <div class="page-header">
        <div class="page-badge">${icon} Component</div>
        <h1 class="page-title">${name}</h1>
        <p class="page-description">${component.cardDesc}</p>
      </div>

      <!-- Install -->
      <div class="install-banner">
        <code>npm install @chronos-ui/core</code>
        <button class="copy-btn install-copy" style="position:static;flex-shrink:0">⎘ Copy</button>
      </div>

      ${extra ? extra : ''}

      <!-- Preview -->
      <h2 class="section-heading">Live Preview</h2>
      <div class="preview-card">
        <div class="preview-toolbar">
          <span class="preview-dot red"></span>
          <span class="preview-dot amber"></span>
          <span class="preview-dot green"></span>
          <span class="preview-url">${previewLabel}</span>
        </div>
        <div class="${previewBodyClass}">
          ${previewHtml}
        </div>
      </div>

      <!-- Code Tabs -->
      <h2 class="section-heading" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
        Usage
        <button class="jsfiddle-btn" id="jsfiddle-btn" style="background:var(--chronos-color-primary); color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.85rem; font-weight:600; display:flex; align-items:center; gap:6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
          Play in JSFiddle
        </button>
      </h2>
      <div class="tab-group">
        <div class="tabs-bar">
          <button class="tab-btn active" data-tab="react">React</button>
          <button class="tab-btn" data-tab="svelte">Svelte</button>
          <button class="tab-btn" data-tab="wc">Web Component</button>
        </div>
        <div class="tab-panel active" data-panel="react">
          ${codeBlock(examples.react, 'tsx')}
        </div>
        <div class="tab-panel" data-panel="svelte">
          ${codeBlock(examples.svelte, 'svelte')}
        </div>
        <div class="tab-panel" data-panel="wc">
          ${codeBlock(examples.wc, 'html')}
        </div>
      </div>

      <!-- Props Table -->
      <h2 class="section-heading">Props</h2>
      ${buildPropsTable(props)}

      <!-- Notes -->
      ${buildNotes(notes)}
    </div>
  </main>
</div>
<script src="../js/docs.js"></script>
${previewScript ? `<script>${previewScript}</script>` : ''}
</body>
</html>`;
}

// ── Generate landing page component grid section ───────────────────────────
/**
 * Regenerates the component cards block inside docs/index.html.
 * The generator looks for a sentinel comment pair and replaces the content
 * between them, so the rest of the landing page stays static.
 */
function regenerateLandingCards() {
  const indexPath = path.join(ROOT, 'docs', 'index.html');
  if (!fs.existsSync(indexPath)) return;

  const cards = MANIFEST.map(c => `
        <a href="components/${c.slug}.html" class="component-card">
          <div class="card-preview" style="background:${c.cardGradient}">
            <div class="card-preview-icon">${c.icon}</div>
          </div>
          <div class="card-body">
            <div class="card-name">${c.name}</div>
            <p class="card-desc">${c.cardDesc}</p>
          </div>
          <div class="card-footer">
            <span class="card-tag tag-react">React</span>
            <span class="card-tag tag-svelte">Svelte</span>
            <span class="card-tag tag-wc">WC</span>
          </div>
        </a>`).join('\n');

  let html = fs.readFileSync(indexPath, 'utf8');

  // Replace between sentinels:  <!-- COMPONENTS_START --> … <!-- COMPONENTS_END -->
  const updated = html.replace(
    /<!-- COMPONENTS_START -->[\s\S]*?<!-- COMPONENTS_END -->/,
    `<!-- COMPONENTS_START -->\n${cards}\n      <!-- COMPONENTS_END -->`
  );

  if (updated !== html) {
    fs.writeFileSync(indexPath, updated, 'utf8');
    console.log('  ✓  docs/index.html component grid updated');
  }
}

// ── Main ────────────────────────────────────────────────────────────────────
function main() {
  // Ensure output directory exists
  if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
  }

  console.log('\n📖  Generating Chronos UI docs...\n');

  for (const component of MANIFEST) {
    const html = buildPage(component);
    const outPath = path.join(DOCS_DIR, `${component.slug}.html`);
    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`  ✓  docs/components/${component.slug}.html`);
  }

  regenerateLandingCards();

  console.log(`\n✅  Generated ${MANIFEST.length} component pages.\n`);
}

main();
