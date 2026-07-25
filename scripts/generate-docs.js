#!/usr/bin/env node
/**
 * generate-docs.js
 *
 * Auto-generates docs/v{major}/components/<slug>.html and docs/v{major}/index.html.
 * Data sources:
 *  - scripts/docs-manifest.json  → descriptions, examples, preview HTML/CSS, notes, api metadata
 *  - src/components/*.lite.tsx   → prop names, types, required/optional from the
 *                                  `export interface <Name>Props { … }` block
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// ── Paths ──────────────────────────────────────────────────────────────────
const ROOT          = path.resolve(__dirname, '..');
const SRC_DIR       = path.join(ROOT, 'src', 'components');
const MANIFEST      = require('./docs-manifest.json');
const PROPS_DB      = require('./docs-props.json');   // prop descriptions live here, NOT in .lite.tsx
const GITHUB_USER   = 'nilkoushik';
const REPO          = 'chronos-ui';
const GITHUB_URL    = `https://github.com/${GITHUB_USER}/${REPO}`;
const PACKAGE_JSON  = require('../package.json');
const VERSION       = PACKAGE_JSON.version;
const MAJOR_VERSION = `v${VERSION.split('.')[0]}`; // e.g. "v1"

const DOCS_DIR      = path.join(ROOT, 'docs');
const VERSION_DIR   = path.join(DOCS_DIR, MAJOR_VERSION);
const COMPONENTS_DIR = path.join(VERSION_DIR, 'components');

// ── Recursive Copy Helper ──────────────────────────────────────────────────
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// ── Default Interactive Web Component Elements ─────────────────────────────
const DEFAULT_WC_ELEMENTS = {
  'banner': `<chronos-banner id="interactive-preview" title="Experience Vibrant Colors &amp; Premium Innovation" subtitle="Explore our premium collection of responsive components. Zero dependencies, ultra lightweight." cta-text="Explore Collection" media='{"type":"image","url":"../assets/img/placeholder-01.svg"}' config='{"align":"center","padding":"lg","bgPosition":"center","hotspotMinTargetSize":24,"backgroundEffect":"particles"}'></chronos-banner>`,
  
  'announcement-bar': `<announcement-bar id="interactive-preview" message="🚀 Free shipping on orders over $75 — Shop the sale →" background-color="#8b5cf6" text-color="#ffffff" map-links='[{"url":"#"}]'></announcement-bar>`,
  
  'grid-banner': `<grid-banner id="interactive-preview" columns="3" items='[{"id":"1","title":"Women\\\'s Collection","media":{"type":"image","url":"../assets/img/placeholder-02.svg"}},{"id":"2","title":"Men\\\'s Essentials","media":{"type":"image","url":"../assets/img/placeholder-03.svg"}},{"id":"3","title":"Trending Footwear","media":{"type":"image","url":"../assets/img/placeholder-04.svg"}}]'></grid-banner>`,
  
  'media-grid': `<media-grid id="interactive-preview" primary-media='{"id":"p1","media":{"type":"image","url":"../assets/img/placeholder-05.svg"},"altText":"Primary Accent Banner"}' secondary-media='[{"id":"s1","media":{"type":"image","url":"../assets/img/placeholder-06.svg"}},{"id":"s2","media":{"type":"image","url":"../assets/img/placeholder-07.svg"}}]'></media-grid>`,
  
  'row-scrollable': `<row-scrollable id="interactive-preview" title="Vibrant Modern Accents" items='[{"id":"1","title":"Neon Abstract","subtitle":"Vibrant Colors","media":{"type":"image","url":"../assets/img/placeholder-06.svg"}},{"id":"2","title":"Cyberpunk Glow","subtitle":"Tech Vibes","media":{"type":"image","url":"../assets/img/placeholder-07.svg"}},{"id":"3","title":"Pastel Gradient","subtitle":"Soft Warmth","media":{"type":"image","url":"../assets/img/placeholder-08.svg"}},{"id":"4","title":"Ocean Waves","subtitle":"Cool Tones","media":{"type":"image","url":"../assets/img/placeholder-09.svg"}}]'></row-scrollable>`,
  
  'sliding-banner': `<sliding-banner id="interactive-preview" items='[{"id":"1","title":"Slide 1: Summer Collection","subtitle":"Refresh your look with light layers.","media":{"type":"image","url":"../assets/img/placeholder-10.svg"}},{"id":"2","title":"Slide 2: Minimalist Living","subtitle":"Design your space for peace.","media":{"type":"image","url":"../assets/img/placeholder-11.svg"}},{"id":"3","title":"Slide 3: Urban Explorer","subtitle":"Ready for any adventure.","media":{"type":"image","url":"../assets/img/placeholder-12.svg"}},{"id":"4","title":"Slide 4: Modern Workspace","subtitle":"Tools to elevate your focus.","media":{"type":"image","url":"../assets/img/placeholder-13.svg"}},{"id":"5","title":"Slide 5: Weekend Escape","subtitle":"Travel style curated for you.","media":{"type":"image","url":"../assets/img/placeholder-14.svg"}},{"id":"6","title":"Slide 6: Evening Lounge","subtitle":"Unwind in comfort.","media":{"type":"image","url":"../assets/img/placeholder-01.svg"}}]' config='{"autoStart":true,"rotateAgain":true,"showDots":true,"showArrows":true,"animationEffect":"fade","backgroundEffect":"waves"}'></sliding-banner>`,
  
  'alternating-slider': `<alternating-slider id="interactive-preview" items='[{"id":"1","title":"Slide 1: Summer Collection","subtitle":"Refresh your look with light layers.","media":{"type":"image","url":"../assets/img/placeholder-02.svg"}},{"id":"2","title":"Slide 2: Minimalist Living","subtitle":"Design your space for peace.","media":{"type":"image","url":"../assets/img/placeholder-03.svg"}},{"id":"3","title":"Slide 3: Urban Explorer","subtitle":"Ready for any adventure.","media":{"type":"image","url":"../assets/img/placeholder-04.svg"}},{"id":"4","title":"Slide 4: Modern Workspace","subtitle":"Tools to elevate your focus.","media":{"type":"image","url":"../assets/img/placeholder-05.svg"}},{"id":"5","title":"Slide 5: Weekend Escape","subtitle":"Travel style curated for you.","media":{"type":"image","url":"../assets/img/placeholder-06.svg"}},{"id":"6","title":"Slide 6: Evening Lounge","subtitle":"Unwind in comfort.","media":{"type":"image","url":"../assets/img/placeholder-07.svg"}}]' config='{"columns":2,"autoStart":true,"showDots":true}'></alternating-slider>`,
  
  'timer-widget': `<timer-widget id="interactive-preview" title="Special Sale Ends In:" target-date="2027-12-31T23:59:59Z" variant="dark" background-image-url="../assets/images/summer_sale.png" background-position="center" overlay="rgba(0, 0, 0, 0.45)" background-effect="rain" expired-text="This offer has expired" width="auto" height="auto"></timer-widget>`,
  
  'wysiwyg-renderer': `<wysiwyg-renderer id="interactive-preview" content="<h2>Premium Editorial Layout</h2><p>This component safely renders HTML content and processes external media embeds in real-time:</p><h3>YouTube Media Integration</h3><div class='chronos-social-embed' data-platform='youtube' data-url='https://www.youtube.com/watch?v=dQw4w9WgXcQ'></div><h3>Social X / Twitter Post</h3><div class='chronos-social-embed' data-platform='x' data-url='https://x.com/NASA/status/1684947936109961216'></div><p>All scripts and scoped layouts load dynamically and securely.</p>"></wysiwyg-renderer>`,
  
  'rich-text-editor': `<rich-text-editor id="interactive-preview" initial-content="<p>Welcome to <strong>Chronos Editor Playground</strong>! Configure the toolbar options on the right in real-time to customize my controls.</p>" config='{"toolbar":["fullscreen","source","bold","italic","underline","strikeThrough","code","quote","clear","headings","foreColor","backColor","justifyLeft","justifyCenter","justifyRight","image","link","table","unorderedList","orderedList","horizontalRule","video","social","insertButton","addWidget","save","classInput"]}'></rich-text-editor>`
};

// ── Sidebar HTML (shared across every page) ────────────────────────────────
function buildSidebar(activeSlug, isLandingPage) {
  const prefix = isLandingPage ? '' : '../';
  const compPrefix = isLandingPage ? 'components/' : '';

  const links = MANIFEST.map(c => {
    const active = c.slug === activeSlug ? ' active' : '';
    return `<a href="${compPrefix}${c.slug}.html" class="sidebar-link${active}"><span class="sidebar-link-icon">${c.icon}</span> ${c.name}</a>`;
  }).join('\n      ');

  return `
    <aside class="docs-sidebar">
      <a href="${prefix}index.html" class="sidebar-brand">
        <div class="sidebar-logo">⏱</div>
        <span class="sidebar-brand-name">Chronos<span>UI</span></span>
        <span class="sidebar-version">v${VERSION}</span>
      </a>
      <div class="sidebar-version-picker" style="padding: 0.5rem 1.25rem; border-bottom: 1px solid var(--border);">
        <select class="control-select version-select" style="width: 100%; font-size: 0.8rem; background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text-secondary); padding: 6px 10px; border-radius: var(--radius-sm); outline: none; cursor: pointer;" onchange="window.location.href = this.value">
          <option value="${prefix}index.html" selected>v1.x.x (Latest)</option>
        </select>
      </div>
      <nav class="sidebar-nav">
        <div class="sidebar-section-label">Getting Started</div>
        <a href="${prefix}index.html" class="sidebar-link"><span class="sidebar-link-icon">🏠</span> Home</a>
        <div class="sidebar-section-label" style="margin-top:1rem">Components</div>
        ${links}
        <div class="sidebar-section-label" style="margin-top:1rem">Resources</div>
        <a href="${GITHUB_URL}" target="_blank" rel="noopener" class="sidebar-link"><span class="sidebar-link-icon">⭐</span> GitHub</a>
        <a href="https://www.npmjs.com/package/@chronos-ui/core" target="_blank" rel="noopener" class="sidebar-link"><span class="sidebar-link-icon">📦</span> npm</a>
        <a href="${prefix}dist/" target="_blank" class="sidebar-link"><span class="sidebar-link-icon">📁</span> Compiled Dist</a>
      </nav>
    </aside>`;
}

// ── Prop lookup (from docs-props.json) ────────────────────────────────────
function getProps(componentName) {
  const key = componentName.replace(/\s+/g, '');
  return PROPS_DB[key] || [];
}

// ── Code block renderer ────────────────────────────────────────────────────
function highlight(code, lang) {
  let s = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  s = s.replace(/(`[^`]*`|'[^'\\]*(?:\\.[^'\\]*)*'|"[^"\\]*(?:\\.[^"\\]*)*")/g,
    '\x00STR\x00$1\x00/STR\x00');

  s = s.replace(/(\/\/[^\n]*)/g,
    '\x00CM\x00$1\x00/CM\x00');

  s = s.replace(/\b(import|from|export|default|const|let|var|return|function|async|await|true|false|null|undefined)\b/g,
    '\x00KW\x00$1\x00/KW\x00');

  s = s.replace(/(&lt;\/?)([\w-]+)/g,
    '$1\x00TAG\x00$2\x00/TAG\x00');

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

function buildNotes(notes) {
  if (!notes || notes.length === 0) return '';
  return notes.map(n => `<div class="alert alert-${n.type}">${n.text}</div>`).join('\n');
}

function buildPropsTable(props) {
  if (!props.length) return '<p style="color:var(--text-muted);font-size:.85rem">No props parsed.</p>';

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

// ── Build Interactive Controls Form ────────────────────────────────────────
function buildControlsForm(component) {
  const api = component.api || [];
  if (api.length === 0) {
    if (component.slug === 'rich-text-editor') {
      return `
        <div class="control-group">
          <label class="control-label">Initial HTML Content</label>
          <textarea name="initialContent" class="control-input" style="height:80px;"><p>Welcome to <strong>Chronos Editor Playground</strong>! Configure the toolbar options on the right in real-time to customize my controls.</p></textarea>
        </div>
        <div class="control-group">
          <label class="control-label">Available Classes (JSON Array)</label>
          <textarea name="availableClasses" class="control-input json-textarea" style="height:60px;">["text-pink-500", "font-bold", "tracking-wider"]</textarea>
          <span class="json-error-msg">❌ Invalid JSON Array</span>
        </div>
        <div class="control-group">
          <label class="control-label">Toolbar Config (JSON Object)</label>
          <textarea name="config" class="control-input json-textarea" style="height:120px;">{"toolbar":["fullscreen","source","bold","italic","underline","strikeThrough","code","quote","clear","headings","foreColor","backColor","justifyLeft","justifyCenter","justifyRight","image","link","table","unorderedList","orderedList","horizontalRule","video","social","insertButton","addWidget","save","classInput"]}</textarea>
          <span class="json-error-msg">❌ Invalid JSON Object</span>
        </div>
      `;
    }
    if (component.slug === 'wysiwyg-renderer') {
      return `
        <div class="control-group">
          <label class="control-label">content <span class="control-type-badge">string</span></label>
          <textarea name="content" class="control-input" style="height:140px;"><h2>Premium Editorial Layout</h2><p>This component safely renders HTML content and processes external media embeds in real-time:</p><h3>YouTube Media Integration</h3><div class="chronos-social-embed" data-platform="youtube" data-url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></div><h3>Social X / Twitter Post</h3><div class="chronos-social-embed" data-platform="x" data-url="https://x.com/NASA/status/1684947936109961216"></div><p>All scripts and scoped layouts load dynamically and securely.</p></textarea>
        </div>
      `;
    }
  }

  const filteredApi = api.filter(item => {
    if (item.prop === 'config') {
      return !api.some(x => x.prop.startsWith('config.'));
    }
    // backgroundEffectPlugin is a { start, stop } function pair — it isn't
    // representable as a form control, and a generic text-input fallback
    // would serialize its literal placeholder string into the live
    // preview's config, breaking the plugin resolution (a truthy string
    // isn't `{ start, stop }`) and silently killing every background
    // effect. It stays documented in the API table, just not interactive.
    if (item.prop === 'backgroundEffectPlugin' || item.prop === 'config.backgroundEffectPlugin') {
      return false;
    }
    return true;
  });

  return filteredApi.map(item => {
    const propName = item.prop;
    const type = item.type;
    const defaultValue = item.default;
    const desc = item.desc;
    
    let attrName = propName;
    if (propName.startsWith('config.')) {
      // Keep it config.*
    } else {
      attrName = propName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    let inputHtml = '';
    
    if (type === 'boolean') {
      const checked = defaultValue === 'true' ? 'checked' : '';
      inputHtml = `
        <label class="control-checkbox-label">
          <input type="checkbox" name="${propName}" ${checked}>
          <span class="control-checkbox-custom"></span>
          Enable ${propName.replace('config.', '')}
        </label>
      `;
    } else if (type === 'number' || (type === 'number | string' && propName === 'columns')) {
      let min = 1, max = 10, step = 1;
      if (propName === 'columns') { min = 1; max = 6; }
      if (propName === 'config.columns') { min = 1; max = 4; }
      if (propName.includes('delay') || propName.includes('Delay')) { min = 1000; max = 10000; step = 500; }
      
      const defaultNum = parseFloat(defaultValue) || min;

      inputHtml = `
        <div class="control-slider-wrap">
          <input type="range" name="${propName}" min="${min}" max="${max}" step="${step}" value="${defaultNum}" class="control-slider">
          <span class="control-slider-val">${defaultNum}</span>
        </div>
      `;
    } else if (type === 'string' && propName.toLowerCase().includes('color')) {
      const hex = defaultValue && defaultValue.startsWith('"#') ? defaultValue.replace(/"/g, '') : '#7c3aed';
      inputHtml = `
        <div class="control-color-wrap">
          <input type="color" name="${attrName}" value="${hex}" class="control-color-picker">
          <input type="text" value="${hex}" class="control-input color-text-sync" style="width:120px;flex-shrink:0;">
        </div>
      `;
    } else if (type === 'string' && propName === 'textAlignment') {
      inputHtml = `
        <select name="${attrName}" class="control-select">
          <option value="left">left</option>
          <option value="center" selected>center</option>
          <option value="right">right</option>
        </select>
      `;
    } else if (type === 'string' && propName === 'config.animationEffect') {
      const animOptions = ['slide', 'fade', 'zoom', 'flip', 'push-horizontal', 'push-vertical', 'wipe', 'cube', 'door', 'fall', 'crush', 'peel-off', 'curtain'];
      inputHtml = `
        <select name="${propName}" class="control-select">
          ${animOptions.map(opt => `<option value="${opt}"${opt === 'fade' ? ' selected' : ''}>${opt}</option>`).join('\n          ')}
        </select>
      `;
    } else if (type === 'string' && propName === 'variant') {
      inputHtml = `
        <select name="${attrName}" class="control-select">
          <option value="dark" selected>dark</option>
          <option value="neon">neon</option>
          <option value="gray">gray</option>
        </select>
      `;
    } else if (type === 'string' && propName === 'config.animationQuality') {
      inputHtml = `
        <select name="${propName}" class="control-select">
          <option value="light">light</option>
          <option value="detailed" selected>detailed</option>
        </select>
      `;
    } else if (type === 'string' && (propName === 'config.backgroundEffect' || propName === 'backgroundEffect')) {
      const isConfig = propName.startsWith('config.');
      const selectedEffect = isConfig ? 'waves' : 'rain';
      const effectOptions = ['none', 'particles', 'waves', 'rain', 'thunderstorm', 'sunrise', 'sunset', 'fog', 'autumn', 'festival', 'santa', 'sea'];
      inputHtml = `
        <select name="${isConfig ? propName : attrName}" class="control-select">
          ${effectOptions.map(opt => `<option value="${opt}"${opt === selectedEffect ? ' selected' : ''}>${opt}</option>`).join('\n          ')}
        </select>
      `;
    } else if (type === 'array' || type === 'object') {
      let val = '';
      if (propName === 'items' && component.slug === 'grid-banner') {
        val = `[\n  {"id":"1","title":"Women's Collection","media":{"type":"image","url":"../assets/img/placeholder-08.svg"}},\n  {"id":"2","title":"Men's Essentials","media":{"type":"image","url":"../assets/img/placeholder-09.svg"}},\n  {"id":"3","title":"Trending Footwear","media":{"type":"image","url":"../assets/img/placeholder-10.svg"}}\n]`;
      } else if (propName === 'items' && component.slug === 'row-scrollable') {
        val = `[\n  {"id":"1","title":"Neon Abstract","subtitle":"Vibrant Colors","media":{"type":"image","url":"../assets/img/placeholder-11.svg"}},\n  {"id":"2","title":"Cyberpunk Glow","subtitle":"Tech Vibes","media":{"type":"image","url":"../assets/img/placeholder-12.svg"}},\n  {"id":"3","title":"Pastel Gradient","subtitle":"Soft Warmth","media":{"type":"image","url":"../assets/img/placeholder-13.svg"}},\n  {"id":"4","title":"Ocean Waves","subtitle":"Cool Tones","media":{"type":"image","url":"../assets/img/placeholder-14.svg"}}\n]`;
      } else if (propName === 'items' && component.slug === 'sliding-banner') {
        val = `[\n  {"id":"1","title":"Slide 1: Summer Collection","subtitle":"Refresh your look with light layers.","media":{"type":"image","url":"../assets/img/placeholder-01.svg"}},\n  {"id":"2","title":"Slide 2: Minimalist Living","subtitle":"Design your space for peace.","media":{"type":"image","url":"../assets/img/placeholder-02.svg"}},\n  {"id":"3","title":"Slide 3: Urban Explorer","subtitle":"Ready for any adventure.","media":{"type":"image","url":"../assets/img/placeholder-03.svg"}},\n  {"id":"4","title":"Slide 4: Modern Workspace","subtitle":"Tools to elevate your focus.","media":{"type":"image","url":"../assets/img/placeholder-04.svg"}},\n  {"id":"5","title":"Slide 5: Weekend Escape","subtitle":"Travel style curated for you.","media":{"type":"image","url":"../assets/img/placeholder-05.svg"}},\n  {"id":"6","title":"Slide 6: Evening Lounge","subtitle":"Unwind in comfort.","media":{"type":"image","url":"../assets/img/placeholder-06.svg"}}\n]`;
      } else if (propName === 'items' && component.slug === 'alternating-slider') {
        val = `[\n  {"id":"1","title":"Slide 1: Summer Collection","subtitle":"Refresh your look with light layers.","media":{"type":"image","url":"../assets/img/placeholder-07.svg"}},\n  {"id":"2","title":"Slide 2: Minimalist Living","subtitle":"Design your space for peace.","media":{"type":"image","url":"../assets/img/placeholder-08.svg"}},\n  {"id":"3","title":"Slide 3: Urban Explorer","subtitle":"Ready for any adventure.","media":{"type":"image","url":"../assets/img/placeholder-09.svg"}},\n  {"id":"4","title":"Slide 4: Modern Workspace","subtitle":"Tools to elevate your focus.","media":{"type":"image","url":"../assets/img/placeholder-10.svg"}},\n  {"id":"5","title":"Slide 5: Weekend Escape","subtitle":"Travel style curated for you.","media":{"type":"image","url":"../assets/img/placeholder-11.svg"}},\n  {"id":"6","title":"Slide 6: Evening Lounge","subtitle":"Unwind in comfort.","media":{"type":"image","url":"../assets/img/placeholder-12.svg"}}\n]`;
      } else if (propName === 'primaryMedia') {
        val = `{"id":"p1","media":{"type":"image","url":"../assets/img/placeholder-13.svg"},"altText":"Primary Accent Banner"}`;
      } else if (propName === 'secondaryMedia') {
        val = `[\n  {"id":"s1","media":{"type":"image","url":"../assets/img/placeholder-11.svg"}},\n  {"id":"s2","media":{"type":"image","url":"../assets/img/placeholder-12.svg"}}\n]`;
      } else if (propName === 'media' && component.slug === 'banner') {
        val = `{"type":"image","url":"../assets/img/placeholder-14.svg"}`;
      } else if (propName === 'mapLinks') {
        val = `[{"url":"#"}]`;
      } else if (propName === 'config') {
        val = `{}`;
      }

      inputHtml = `
        <textarea name="${propName}" class="control-input json-textarea">${val}</textarea>
        <span class="json-error-msg">❌ Invalid JSON Formatting</span>
      `;
    } else {
      const defaultText = defaultValue && defaultValue !== 'undefined' ? defaultValue.replace(/"/g, '') : '';
      inputHtml = `
        <input type="text" name="${attrName}" value="${defaultText}" class="control-input">
      `;
    }

    return `
      <div class="control-group">
        <label class="control-label">${propName} <span class="control-type-badge">${type}</span></label>
        ${inputHtml}
        <div class="control-desc">${desc || ''}</div>
      </div>
    `;
  }).join('');
}

// ── Full page template ──────────────────────────────────────────────────────
function buildPage(component) {
  const { name, slug, icon, examples, notes, previewLabel, previewCss, extra } = component;

  const pascalName = name.replace(/\s+(\w)/g, (_, c) => c.toUpperCase()).replace(/^\w/, c => c.toUpperCase());
  const tagName = slug === 'banner' ? 'chronos-banner' : slug;
  
  const props = getProps(name);
  const sidebar = buildSidebar(slug, false);

  const previewBodyClass = (slug === 'sliding-banner' || slug === 'alternating-slider')
    ? 'preview-body-flush'
    : 'preview-body';

  const liveElementHtml = DEFAULT_WC_ELEMENTS[slug] || `<${tagName} id="interactive-preview"></${tagName}>`;
  const controlsHtml = buildControlsForm(component);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${name} — Chronos UI</title>
  <meta name="description" content="${component.cardDesc}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="stylesheet" href="../css/docs.css" />
  <link rel="stylesheet" href="../styles/theme.css" />
  <link rel="stylesheet" href="../styles/components/${pascalName}.css" />
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

      <!-- Interactive Playground -->
      <h2 class="section-heading">Interactive Demo Playground</h2>
      <div class="playground-container">
        <div class="preview-column">
          <div class="preview-card">
            <div class="preview-toolbar">
              <span class="preview-dot red"></span>
              <span class="preview-dot amber"></span>
              <span class="preview-dot green"></span>
              <span class="preview-url">&lt;${tagName}&gt; Playground</span>
            </div>
            <div class="${previewBodyClass}" id="preview-container">
              ${liveElementHtml}
            </div>
          </div>
        </div>

        <div class="controls-column">
          <div class="controls-card">
            <div class="controls-header">
              <span class="controls-icon">⚙️</span>
              <span class="controls-title">Configure Properties</span>
            </div>
            <div class="controls-body">
              <form id="playground-form" onsubmit="event.preventDefault();">
                ${controlsHtml}
              </form>
            </div>
          </div>
        </div>
      </div>


      <!-- Code Tabs -->
      <h2 class="section-heading" style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 1rem;">
        Usage Code Generator
        <span style="display:flex; gap:8px;">
          <button class="jsfiddle-btn" id="jsfiddle-btn" style="background:var(--accent); color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.85rem; font-weight:600; display:flex; align-items:center; gap:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
            Play in JSFiddle
          </button>
          <button class="codesandbox-btn" id="codesandbox-btn" style="background:#151515; color:#fff; border:1px solid #333; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.85rem; font-weight:600; display:flex; align-items:center; gap:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            Open in CodeSandbox
          </button>
        </span>
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
      <h2 class="section-heading">Props API Reference</h2>
      ${buildPropsTable(props)}

      <!-- Notes -->
      ${buildNotes(notes)}
    </div>
  </main>
</div>
<script src="../js/docs.js"></script>
<script type="module" src="../dist/webcomponent/dist/index.js"></script>

<script>
// ── Syntax Highlighter (Client-side mirror of server highlight) ────────────
function clientHighlight(code, lang) {
  let s = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  s = s.replace(/(\`[^\`]*\`|'[^'\\']*(?:\\.[^'\\']*)*'|"[^"\\"]*(?:\\.[^"\\"]*)*")/g, '\\x00STR\\x00$1\\x00/STR\\x00');
  s = s.replace(/(\\x2f\\x2f[^\\n]*)/g, '\\x00CM\\x00$1\\x00/CM\\x00');
  s = s.replace(/\\b(import|from|export|default|const|let|var|return|function|async|await|true|false|null|undefined)\\b/g, '\\x00KW\\x00$1\\x00/KW\\x00');
  s = s.replace(/(&lt;\\/?)([\\w-]+)/g, '$1\\x00TAG\\x00$2\\x00/TAG\\x00');

  s = s
    .replace(/\\x00STR\\x00([\\s\\S]*?)\\x00\\/STR\\x00/g, '<span class="str">$1</span>')
    .replace(/\\x00CM\\x00([\\s\\S]*?)\\x00\\/CM\\x00/g,   '<span class="cm">$1</span>')
    .replace(/\\x00KW\\x00([\\s\\S]*?)\\x00\\/KW\\x00/g,   '<span class="kw">$1</span>')
    .replace(/\\x00TAG\\x00([\\s\\S]*?)\\x00\\/TAG\\x00/g, '<span class="tag">$1</span>');

  return s;
}

document.addEventListener('DOMContentLoaded', () => {
  const preview = document.getElementById('interactive-preview');
  const form = document.getElementById('playground-form');
  if (!preview || !form) return;

  const inputs = form.querySelectorAll('input, select, textarea');

  // Slider val displays
  inputs.forEach(input => {
    if (input.type === 'range') {
      const valLabel = input.nextElementSibling;
      input.addEventListener('input', () => {
        valLabel.textContent = input.value;
      });
    }
  });

  // Color picker sync
  inputs.forEach(input => {
    if (input.classList.contains('control-color-picker')) {
      const textSync = input.nextElementSibling;
      input.addEventListener('input', () => {
        textSync.value = input.value;
        updatePreview();
      });
      textSync.addEventListener('input', () => {
        if (/^#[0-9A-F]{6}$/i.test(textSync.value)) {
          input.value = textSync.value;
          updatePreview();
        }
      });
    }
  });

  function updatePreview() {
    let configObj = {};
    let hasConfig = false;
    const directProps = {};

    // First collect all config.*
    inputs.forEach(input => {
      const name = input.name;
      if (name.startsWith('config.')) {
        hasConfig = true;
        const key = name.split('.')[1];
        let val;
        if (input.type === 'checkbox') {
          val = input.checked;
        } else if (input.type === 'range') {
          val = Number(input.value);
        } else {
          val = input.value;
        }
        configObj[key] = val;
      }
    });

    if (hasConfig) {
      const configJson = JSON.stringify(configObj);
      // Always set props.config directly to bypass oldValue===newValue guard
      if (preview.props) {
        preview.props.config = configObj;
      }
      preview.setAttribute('config', configJson);
      directProps.config = configObj;
    }

    // Now update other attributes
    inputs.forEach(input => {
      const name = input.name;
      if (name.startsWith('config.')) return;

      if (input.type === 'checkbox') {
        if (input.checked) {
          preview.setAttribute(name, 'true');
          directProps[camelCase(name)] = true;
        } else {
          preview.removeAttribute(name);
          directProps[camelCase(name)] = false;
        }
      } else if (input.tagName === 'TEXTAREA' && input.classList.contains('json-textarea')) {
        try {
          const raw = input.value.trim();
          if (raw) {
            const parsed = JSON.parse(raw);
            input.classList.remove('invalid');
            // Assign as property and setAttribute
            preview[camelCase(name)] = parsed;
            preview.setAttribute(name, raw);
          } else {
            preview.removeAttribute(name);
          }
        } catch (e) {
          input.classList.add('invalid');
        }
      } else {
        preview.setAttribute(name, input.value);
      }
    });

    // Update code blocks
    updateCodeBlocks();
  }

  function camelCase(str) {
    return str.replace(/-([a-z])/g, g => g[1].toUpperCase());
  }

  function kebabCase(str) {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  }

  function updateCodeBlocks() {
    // Collect attributes
    const attrs = [];
    for (let i = 0; i < preview.attributes.length; i++) {
      const a = preview.attributes[i];
      if (['id', 'class', 'style'].includes(a.name)) continue;
      attrs.push({ name: a.name, value: a.value });
    }

    // React prop string generator
    const reactProps = attrs.map(a => {
      const camelName = camelCase(a.name);
      const isJson = a.value.trim().startsWith('{') || a.value.trim().startsWith('[');
      const isBoolean = a.value === 'true';
      if (isBoolean) return camelName;
      if (isJson) return \`\${camelName}={\${a.value}}\`;
      return \`\${camelName}="\${a.value.replace(/"/g, '\\\\"')}"\`;
    });

    const pascalName = "${pascalName}";
    const wcTagName = "${tagName}";

    const reactCode = \`import \${pascalName} from '@chronos-ui/core/react/\${pascalName}';
import '@chronos-ui/core/theme.css';

<\${pascalName}
  \${reactProps.join('\\n  ')}
/>\`;

    const svelteProps = attrs.map(a => {
      const camelName = camelCase(a.name);
      const isJson = a.value.trim().startsWith('{') || a.value.trim().startsWith('[');
      const isBoolean = a.value === 'true';
      if (isBoolean) return camelName;
      if (isJson) return \`\${camelName}={\${a.value}}\`;
      return \`\${camelName}="\${a.value.replace(/"/g, '\\\\"')}"\`;
    });

    const svelteCode = \`<script lang="ts">
  import \${pascalName} from '@chronos-ui/core/svelte/\${pascalName}.svelte';
<\\/script>

<\${pascalName}
  \${svelteProps.join('\\n  ')}
/>\`;

    const wcAttrs = attrs.map(a => {
      const isJson = a.value.trim().startsWith('{') || a.value.trim().startsWith('[');
      if (isJson) {
        return \`\${a.name}='\${a.value}'\`;
      }
      return \`\${a.name}="\${a.value.replace(/"/g, '\\\\"')}"\`;
    });

    const wcCode = \`<\` + \`script type="module" src="node_modules/@chronos-ui/core/webcomponents/\${pascalName}.js"></\` + \`script>

<\${wcTagName}
  \${wcAttrs.join('\\n  ')}
></\${wcTagName}>\`;

    // Highlight and set
    const reactPanel = document.querySelector('[data-panel="react"] pre code');
    if (reactPanel) reactPanel.innerHTML = clientHighlight(reactCode, 'tsx');

    const sveltePanel = document.querySelector('[data-panel="svelte"] pre code');
    if (sveltePanel) sveltePanel.innerHTML = clientHighlight(svelteCode, 'svelte');

    const wcPanel = document.querySelector('[data-panel="wc"] pre code');
    if (wcPanel) wcPanel.innerHTML = clientHighlight(wcCode, 'html');
  }

  form.addEventListener('input', updatePreview);
  form.addEventListener('change', updatePreview);

  // Initial update
  setTimeout(updatePreview, 100);
});
</script>

</body>
</html>`;
}

// ── Build Landing Page HTML ────────────────────────────────────────────────
function buildLandingPage() {
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

  const sidebar = buildSidebar('', true);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Chronos UI — Universal Component Library</title>
  <script>
    if (window.location.pathname.endsWith('/' + '${MAJOR_VERSION}')) {
      window.location.replace(window.location.pathname + '/' + window.location.search + window.location.hash);
    }
  </script>
  <meta name="description" content="A universal, framework-agnostic UI component library. Write once in Mitosis and compile to React, Svelte, and Web Components." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="stylesheet" href="css/docs.css" />
  <style>
    .gradient-mesh {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none;
      z-index: 0;
      overflow: hidden;
    }
    .gradient-mesh span {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.12;
    }
    .g1 { width: 600px; height: 600px; background: #7c3aed; top: -200px; left: -100px; }
    .g2 { width: 500px; height: 500px; background: #ec4899; top: 100px; right: -100px; }
    .g3 { width: 400px; height: 400px; background: #3b82f6; bottom: 0; left: 40%; }
    .docs-main { position: relative; z-index: 1; }
  </style>
</head>
<body>
  <div class="gradient-mesh" aria-hidden="true">
    <span class="g1"></span>
    <span class="g2"></span>
    <span class="g3"></span>
  </div>

  <div class="docs-shell">
    ${sidebar}

    <main class="docs-main">
      <div class="docs-topbar">
        <button class="sidebar-toggle" id="sidebar-toggle" aria-label="Toggle navigation">☰</button>
        <div class="topbar-breadcrumb">
          <span class="current">Home</span>
        </div>
        <div class="topbar-actions">
          <a href="${GITHUB_URL}" target="_blank" rel="noopener" class="btn-github">
            Star on GitHub
          </a>
        </div>
      </div>

      <!-- Hero -->
      <section class="landing-hero">
        <div class="hero-eyebrow">
          <span>⚡</span> Open Source · MIT License
        </div>
        <h1 class="hero-title">
          A modern UI kit library to<br>
          <span class="hero-gradient">create beautiful pages</span>
        </h1>
        <p class="hero-subtitle">
          A universal, premium component library to build stunning web experiences
          natively in React, Svelte, and Web Components.
        </p>
        <div class="hero-actions">
          <a href="components/banner.html" class="btn-primary">
            Browse Components →
          </a>
          <a href="${GITHUB_URL}" target="_blank" rel="noopener" class="btn-secondary">
            View on GitHub
          </a>
        </div>
        <div class="feature-pills">
          <span class="feature-pill"><span class="dot dot-react"></span> React / Next.js</span>
          <span class="feature-pill"><span class="dot dot-svelte"></span> Svelte / SvelteKit</span>
          <span class="feature-pill"><span class="dot dot-wc"></span> Web Components</span>
          <span class="feature-pill"><span class="dot dot-ts"></span> TypeScript</span>
          <span class="feature-pill"><span class="dot dot-css"></span> CSS Variables</span>
        </div>

        <!-- Install -->
        <div class="install-banner" style="text-align:left;max-width:480px;margin:0 auto 3rem;">
          <code>npm install @chronos-ui/core</code>
          <button class="copy-btn install-copy" style="position:static;flex-shrink:0">⎘ Copy</button>
        </div>
      </section>

      <!-- Stats -->
      <div class="stats-bar">
        <div class="stat-item">
          <div class="stat-value">${MANIFEST.length}</div>
          <div class="stat-label">Components</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">3</div>
          <div class="stat-label">Frameworks</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">13</div>
          <div class="stat-label">Slide Effects</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">0</div>
          <div class="stat-label">Runtime Deps</div>
        </div>
      </div>

      <!-- Component Grid -->
      <h2 style="text-align:center;font-size:1.5rem;font-weight:700;letter-spacing:-0.03em;margin-bottom:2rem;color:var(--text-secondary)">
        All Components
      </h2>
      <div class="component-grid">
        ${cards}
      </div>
    </main>
  </div>

  <script src="js/docs.js"></script>
</body>
</html>`;
}

// ── Main ────────────────────────────────────────────────────────────────────
function main() {
  // Ensure output directories exist
  if (!fs.existsSync(VERSION_DIR)) {
    fs.mkdirSync(VERSION_DIR, { recursive: true });
  }
  if (!fs.existsSync(COMPONENTS_DIR)) {
    fs.mkdirSync(COMPONENTS_DIR, { recursive: true });
  }

  console.log(`\n📖  Generating Chronos UI docs for ${MAJOR_VERSION}...\n`);

  // 1. Copy static assets, css, and js to versioned folder
  copyDir(path.join(DOCS_DIR, 'css'), path.join(VERSION_DIR, 'css'));
  copyDir(path.join(DOCS_DIR, 'js'), path.join(VERSION_DIR, 'js'));
  copyDir(path.join(DOCS_DIR, 'assets'), path.join(VERSION_DIR, 'assets'));
  copyDir(path.join(ROOT, 'dist'), path.join(VERSION_DIR, 'dist'));
  copyDir(path.join(ROOT, 'src', 'styles'), path.join(VERSION_DIR, 'styles'));

  // 2. Generate component pages
  for (const component of MANIFEST) {
    const html = buildPage(component);
    const outPath = path.join(COMPONENTS_DIR, `${component.slug}.html`);
    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`  ✓  docs/${MAJOR_VERSION}/components/${component.slug}.html`);
  }

  // 3. Generate version landing page docs/v1/index.html
  const landingHtml = buildLandingPage();
  fs.writeFileSync(path.join(VERSION_DIR, 'index.html'), landingHtml, 'utf8');
  console.log(`  ✓  docs/${MAJOR_VERSION}/index.html landing page generated`);

  // 4. Generate root redirect docs/index.html
  const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Redirecting to latest docs...</title>
  <link rel="canonical" href="${MAJOR_VERSION}/index.html">
  <meta http-equiv="refresh" content="0; url=${MAJOR_VERSION}/index.html">
  <script>
    window.location.replace("${MAJOR_VERSION}/index.html");
  </script>
</head>
<body style="background:#0a0a0f; color:#f0f0ff; font-family:sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
  <div style="text-align:center;">
    <p style="margin-bottom:1rem; font-size:1.2rem;">Redirecting to Chronos UI documentation (${MAJOR_VERSION})...</p>
    <p><a href="${MAJOR_VERSION}/index.html" style="color:#a78bfa; text-decoration:underline;">Click here if you are not redirected automatically</a></p>
  </div>
</body>
</html>`;
  fs.writeFileSync(path.join(DOCS_DIR, 'index.html'), redirectHtml, 'utf8');
  console.log(`  ✓  docs/index.html redirect set up targeting ${MAJOR_VERSION}`);

  console.log(`\n✅  Generated ${MANIFEST.length} component pages.\n`);
}

main();
