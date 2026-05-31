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
    // When set is 0: col1 shows item 1 (Y: 0), col2 shows item 2 (Y: -100%)
    // When set is 1: col1 shows item 3 (Y: -100%), col2 shows item 4 (Y: 0)
    if (col1) col1.style.transform = `translateY(-${currentSet * 100}%)`;
    if (col2) col2.style.transform = `translateY(-${(1 - currentSet) * 100}%)`;

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

/* ── JSFiddle Integration ────────────────────────────────── */
function initJsfiddle() {
  const btn = document.getElementById('jsfiddle-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    // Get the active tab's code
    const activeTab = document.querySelector('.tab-panel.active');
    const framework = activeTab ? activeTab.dataset.panel : 'wc';
    const codeEl = activeTab?.querySelector('pre code');
    if (!codeEl) return;

    let jsCode = '';
    let htmlCode = '';

    const rawCode = codeEl.innerText;

    if (framework === 'react') {
      // Setup Babel Standalone in the HTML pane to preserve native ES Modules
      jsCode = rawCode
        .replace(/from\s+['"]@chronos-ui\/core\/(.*?)['"]/g, "from 'https://esm.sh/@chronos-ui/core@latest/$1'")
        .replace(/import\s+['"]@chronos-ui\/core\/(.*?)['"]/g, "import 'https://esm.sh/@chronos-ui/core@latest/$1'");
        
      const jsxMatch = jsCode.match(/<([A-Z][a-zA-Z0-9]*)\b[^>]*(\/>|<\/[A-Z][a-zA-Z0-9]*>)/);
      const jsxComponent = jsxMatch ? jsxMatch[0] : '';
      
      htmlCode = `<div id="root"></div>

<!-- Use Babel Standalone to compile JSX natively while preserving ES Modules -->
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script type="text/babel" data-type="module">
import React from 'https://esm.sh/react@18';
import { createRoot } from 'https://esm.sh/react-dom@18/client';

${jsCode.replace(/<([A-Z][a-zA-Z0-9]*)\b[^>]*(\/>|<\/[A-Z][a-zA-Z0-9]*>)/, '')}

const root = createRoot(document.getElementById('root'));
root.render(${jsxComponent || '<div />'});
</script>`;

      jsCode = ''; // Leave JS pane empty because all logic is in the module script
    } else if (framework === 'svelte') {
      htmlCode = `<!-- Svelte components require a compiler environment. -->\n${rawCode}`;
    } else {
      // Web Component
      htmlCode = `<!-- Load Theme -->
<link rel="stylesheet" href="https://unpkg.com/@chronos-ui/core/src/styles/theme.css">

<!-- Load Web Component -->
<script type="module" src="https://unpkg.com/@chronos-ui/core/dist/webcomponent/dist/index.js"></script>

${rawCode.replace(/<script type="module"[\s\S]*?<\/script>\n*/, '')}`; // strip local script tags
    }

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
});
