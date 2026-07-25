/* ============================================================
   Chronos UI Docs — JavaScript
   Tab switching, copy-to-clipboard, sidebar, live demos
   ============================================================ */

/* ── Sidebar Mobile Toggle ─────────────────────────────── */
function initSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.docs-sidebar');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Close on backdrop click
  document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !toggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

/* ── Active Sidebar Link ───────────────────────────────── */
function initActiveLink() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === current || href.endsWith('/' + current)) {
      link.classList.add('active');
    }
  });
}

/* ── Framework Tabs ────────────────────────────────────── */
function initTabs() {
  document.querySelectorAll('.tabs-bar').forEach(bar => {
    bar.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        const container = btn.closest('.tab-group');
        if (!container) return;

        // Deactivate all
        container.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

        // Activate selected
        btn.classList.add('active');
        const panel = container.querySelector(`[data-panel="${tabId}"]`);
        if (panel) panel.classList.add('active');
      });
    });
  });
}

/* ── Copy to Clipboard ─────────────────────────────────── */
function initCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const codeEl = btn.closest('.code-block')?.querySelector('pre');
      if (!codeEl) return;

      const text = codeEl.innerText;
      navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '✓ Copied';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });
}

/* ── Install Banner Copy ───────────────────────────────── */
function initInstallCopy() {
  document.querySelectorAll('.install-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.closest('.install-banner')?.querySelector('code')?.innerText;
      if (!cmd) return;
      navigator.clipboard.writeText(cmd).then(() => {
        btn.textContent = '✓ Copied';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = '⎘ Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });
}

/* ── Timer Widget Live Demo ────────────────────────────── */
function initTimerDemo() {
  const el = document.getElementById('timer-demo');
  if (!el) return;

  const targetInput = document.getElementById('timer-target');
  let timerId = null;

  function tick() {
    const target = targetInput ? new Date(targetInput.value) : new Date(Date.now() + 86400000);
    const diff = target - new Date();
    const days    = Math.max(0, Math.floor(diff / 86400000));
    const hours   = Math.max(0, Math.floor((diff % 86400000) / 3600000));
    const minutes = Math.max(0, Math.floor((diff % 3600000)  / 60000));
    const seconds = Math.max(0, Math.floor((diff % 60000)    / 1000));

    ['days','hours','minutes','seconds'].forEach(unit => {
      const v = el.querySelector(`[data-unit="${unit}"]`);
      if (v) {
        const val = unit === 'days' ? days : unit === 'hours' ? hours : unit === 'minutes' ? minutes : seconds;
        if (v.textContent !== String(val)) v.textContent = val;
      }
    });
  }

  tick();
  timerId = setInterval(tick, 1000);
  window.addEventListener('beforeunload', () => clearInterval(timerId));

  if (targetInput) {
    targetInput.addEventListener('change', tick);
  }
}

/* ── SlidingBanner Live Demo ───────────────────────────── */
function initSliderDemo(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const slides = el.querySelectorAll('.demo-slide');
  const dots   = el.querySelectorAll('.demo-dot');
  let current = 0;
  let timer = null;

  function goTo(i) {
    slides[current]?.classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (i + slides.length) % slides.length;
    slides[current]?.classList.add('active');
    dots[current]?.classList.add('active');
  }

  function start() {
    timer = setInterval(() => goTo(current + 1), 3500);
  }

  function stop() { clearInterval(timer); }

  goTo(0);
  start();

  el.querySelector('.demo-arrow.prev')?.addEventListener('click', () => { stop(); goTo(current - 1); start(); });
  el.querySelector('.demo-arrow.next')?.addEventListener('click', () => { stop(); goTo(current + 1); start(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { stop(); goTo(i); start(); });
  });

  el.addEventListener('mouseenter', stop);
  el.addEventListener('mouseleave', start);
}

/* ── AlternatingSlider Live Demo ───────────────────────── */
function initAltSliderDemo(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const col1 = el.querySelector('#alt-col-1');
  const col2 = el.querySelector('#alt-col-2');
  const dots = el.querySelectorAll('.demo-dot');
  let currentSet = 0; // 0 or 1
  let timer = null;

  function goTo(i) {
    currentSet = i;
    // Track is 200% tall; each card is 50% of track (= 1 viewport height).
    // Set 0: col1 shows card 1 (Y: 0),   col2 shows card 2 (Y: -50%)
    // Set 1: col1 shows card 2 (Y: -50%), col2 shows card 1 (Y: 0)
    if (col1) col1.style.transform = `translateY(-${currentSet * 50}%)`;
    if (col2) col2.style.transform = `translateY(-${(1 - currentSet) * 50}%)`;

    dots.forEach((d, idx) => {
      d.classList.toggle('active', idx === currentSet);
    });
  }

  function start() {
    timer = setInterval(() => goTo(currentSet === 0 ? 1 : 0), 4000);
  }

  function stop() { clearInterval(timer); }

  start();

  el.querySelector('#alt-prev')?.addEventListener('click', () => { stop(); goTo(currentSet === 0 ? 1 : 0); start(); });
  el.querySelector('#alt-next')?.addEventListener('click', () => { stop(); goTo(currentSet === 0 ? 1 : 0); start(); });

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => { stop(); goTo(i); start(); });
  });

  el.addEventListener('mouseenter', stop);
  el.addEventListener('mouseleave', start);
}

/* ── Shared live-demo code generation (JSFiddle + CodeSandbox) ──────────
   Both "Play in X" buttons need the exact same transform of the active
   tab's source sample into a runnable, CDN-only page — the CSS-import
   crash and the duplicate-React-instance bug (see comments below) apply
   identically to whichever sandbox loads the result, so this is generated
   once and handed to whichever submitter is clicked. */
function generateLiveDemoCode() {
  const activeTab = document.querySelector('.tab-panel.active');
  const framework = activeTab ? activeTab.dataset.panel : 'wc';
  const codeEl = activeTab?.querySelector('pre code');
  if (!codeEl) return null;

  let jsCode = '';
  let htmlCode = '';

  // The code samples use paths relative to the docs site (e.g. "../assets/img/...")
  // for its own placeholder images. Those don't resolve on a different origin
  // (jsfiddle.net, codesandbox.io), so rewrite them to absolute URLs against
  // the published docs site.
  const rawCode = codeEl.innerText.replace(/(["'])(\.\.\/)?assets\//g, '$1https://nilkoushik.github.io/chronos-ui/assets/');

  // `theme.css` only carries shared CSS variables/resets — each component's
  // actual layout/visual styles live in their own `src/styles/components/*.css`
  // file (exposed via the package's "./styles/*" export). The usage samples
  // (and this generator, until now) only ever linked theme.css, so the demo
  // rendered structurally correct but completely unstyled. Pull the PascalCase
  // component name straight out of its import path so we can link its
  // matching stylesheet too, for whichever framework tab is active.
  const componentNameMatch = rawCode.match(/@chronos-ui\/core\/(?:react|webcomponents?)\/([A-Za-z0-9]+)/);
  const componentName = componentNameMatch ? componentNameMatch[1] : null;
  const componentCssLink = componentName
    ? `<link rel="stylesheet" href="https://unpkg.com/@chronos-ui/core@latest/src/styles/components/${componentName}.css">\n`
    : '';

  if (framework === 'react') {
    // Setup Babel Standalone in the HTML pane to preserve native ES Modules
    // Note: the npm 'beta' dist-tag points to a stale pre-release (1.0.0-beta.17)
    // whose package.json#exports has no './react/*' wildcard, so esm.sh rejects
    // deep subpath imports like '/react/AlternatingSlider'. 'latest' has the
    // correct wildcard exports and matches this repo's current published version.
    // A plain `import '@chronos-ui/core/theme.css'` is a *value-less* side-effect
    // import, which the browser fetches expecting a JS/Wasm module. esm.sh (and
    // any static host) serves that file with Content-Type: text/css, and browsers
    // enforce strict MIME checking for module scripts — that single line throws
    // a SyntaxError that aborts the entire module graph, so `root.render(...)`
    // never runs and the sandbox just shows a blank page. Strip it from the JS
    // and load it as a plain <link rel="stylesheet"> in the HTML pane instead,
    // the same way the Web Component tab below already does it.
    // Pin the exact React version via esm.sh's `?deps=` param on the component
    // import. Without it, esm.sh resolves SlidingBanner's own internal
    // `peerDependencies: { react: ">=17" }` reference independently from our
    // own top-level `import React from '.../react@18...'` — landing on a
    // *different* concrete React version (e.g. two copies, 19.x vs 18.x)
    // that don't share a hook dispatcher. Calling any hook (useRef, etc.)
    // then throws "Cannot read properties of null" because the component's
    // React instance has no active render in progress from ITS OWN copy's
    // point of view. `?deps=` forces the component's internal resolution to
    // reuse the exact same pinned version as our own import, so there's
    // only ever one React instance in the whole page.
    const REACT_VERSION = '18.3.1';
    jsCode = rawCode
      .replace(/import\s+['"]@chronos-ui\/core\/theme\.css['"];?\n?/g, '')
      .replace(/from\s+['"]@chronos-ui\/core\/(.*?)['"]/g, `from 'https://esm.sh/@chronos-ui/core@latest/$1?deps=react@${REACT_VERSION},react-dom@${REACT_VERSION}'`)
      .replace(/import\s+['"]@chronos-ui\/core\/(.*?)['"]/g, `import 'https://esm.sh/@chronos-ui/core@latest/$1?deps=react@${REACT_VERSION},react-dom@${REACT_VERSION}'`);

    const jsxMatch = jsCode.match(/<([A-Z][a-zA-Z0-9]*)\b[^>]*(\/>|<\/[A-Z][a-zA-Z0-9]*>)/);
    const jsxComponent = jsxMatch ? jsxMatch[0] : '';

    htmlCode = `<div id="root"></div>

<!-- Load Theme (loaded as a stylesheet, not a JS import — see comment in docs.js) -->
<link rel="stylesheet" href="https://unpkg.com/@chronos-ui/core@latest/src/styles/theme.css">
${componentCssLink}
<!-- Use Babel Standalone to compile JSX natively while preserving ES Modules -->
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel" data-type="module">
import React from 'https://esm.sh/react@${REACT_VERSION}';
import { createRoot } from 'https://esm.sh/react-dom@${REACT_VERSION}/client';

${jsCode.replace(/<([A-Z][a-zA-Z0-9]*)\b[^>]*(\/>|<\/[A-Z][a-zA-Z0-9]*>)/, '')}

const root = createRoot(document.getElementById('root'));
root.render(${jsxComponent || '<div />'});
</script>`;

    jsCode = ''; // Leave JS pane empty because all logic is in the module script
  } else if (framework === 'svelte') {
    return { framework, unsupported: true };
  } else {
    // Web Component
    htmlCode = `<!-- Load Theme -->
<link rel="stylesheet" href="https://unpkg.com/@chronos-ui/core@latest/src/styles/theme.css">
${componentCssLink}
<!-- Load Web Component -->
<script type="module" src="https://unpkg.com/@chronos-ui/core@latest/dist/webcomponent/dist/index.js"></script>

${rawCode.replace(/<link rel="stylesheet" href="node_modules[^>]*>\n?/, '').replace(/<script type="module"[\s\S]*?<\/script>\n*/, '')}`; // strip local script and css tags
  }

  return { framework, htmlCode, jsCode };
}

/* ── JSFiddle Integration ────────────────────────────────── */
function initJsfiddle() {
  const btn = document.getElementById('jsfiddle-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const generated = generateLiveDemoCode();
    if (!generated) return;
    if (generated.unsupported) {
      alert("Svelte components require a compiler/bundler environment (like Vite or Rollup) to run. They cannot be executed natively in JSFiddle.\\n\\nPlease check out the Web Component or React tabs for live JSFiddle demos!");
      return;
    }
    const { htmlCode, jsCode } = generated;

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://jsfiddle.net/api/post/library/pure/';
    form.target = '_blank';

    const inputs = {
      html: htmlCode,
      js: jsCode,
      css: 'body { padding: 20px; font-family: sans-serif; background: #000; color: #fff; }',
      panel_js: 0 // Always plain JS; Babel is handled in HTML for React
    };

    for (const [key, val] of Object.entries(inputs)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = val;
      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  });
}

/* ── CodeSandbox Integration ────────────────────────────────
   CodeSandbox's "define" API accepts a JSON POST (no lz-string compression
   needed, unlike its older query-string form) and returns a sandbox_id to
   redirect to. For both the React and Web Component tabs the whole demo is
   already a single self-contained HTML file (same one JSFiddle's HTML pane
   uses) — CodeSandbox's "static" template runs that directly with no
   bundler needed, so we hand it the same generated file rather than
   duplicating the transform logic a third time. */
function initCodesandbox() {
  const btn = document.getElementById('codesandbox-btn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const generated = generateLiveDemoCode();
    if (!generated) return;
    if (generated.unsupported) {
      alert("Svelte components require a compiler/bundler environment (like Vite or Rollup) to run. They cannot be executed natively in this static CodeSandbox template.\\n\\nPlease check out the Web Component or React tabs for live demos!");
      return;
    }
    const { htmlCode } = generated;

    btn.disabled = true;
    const originalLabel = btn.innerHTML;
    btn.innerHTML = 'Creating sandbox…';

    try {
      const res = await fetch('https://codesandbox.io/api/v1/sandboxes/define?json=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: {
            // Without this, CodeSandbox's newer "Nodebox" runtime treats any
            // package.json as an npm project and looks for a `scripts.start`
            // (or similar) dev-server command to run — since ours has none,
            // it just sits there with an empty preview instead of erroring.
            // sandbox.config.json#template:"static" forces the classic
            // static-file server instead, which serves index.html directly.
            'sandbox.config.json': {
              content: { template: 'static' }
            },
            'package.json': {
              content: { name: 'chronos-ui-demo', version: '1.0.0', main: 'index.html' }
            },
            'index.html': { content: htmlCode }
          }
        })
      });
      const data = await res.json();
      if (data.sandbox_id) {
        window.open(`https://codesandbox.io/s/${data.sandbox_id}`, '_blank');
      } else {
        alert('Could not create CodeSandbox: ' + JSON.stringify(data));
      }
    } catch (e) {
      alert('Could not reach CodeSandbox: ' + e.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalLabel;
    }
  });
}

/* ── Init Everything ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initActiveLink();
  initTabs();
  initCopyButtons();
  initInstallCopy();
  initTimerDemo();
  initSliderDemo('slider-demo');
  initAltSliderDemo('alt-slider-demo');
  initJsfiddle();
  initCodesandbox();
});
