const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'dist', 'svelte', 'src', 'components');
const stylesComponentsDir = path.join(__dirname, 'src', 'styles', 'components');

if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.svelte'));

  for (const file of files) {
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('<svelte:options runes={false} />')) {
      content = '<svelte:options runes={false} />\n' + content;
    }

    // Fix missing animContext declaration in SlidingBanner.svelte (its shape has
    // extra fields -- intervalId/dimResizeHandler -- beyond the generic
    // animationFrameId/resizeHandler pair every other component's animContext uses).
    if (file === 'SlidingBanner.svelte') {
      content = content.replace(/\s*let animContext = [\s\S]*?;\n/, '\n');
      content = content.replace(
        'export let isLoading: SlidingBannerProps["isLoading"];',
        'export let isLoading: SlidingBannerProps["isLoading"];\n  let animContext = { intervalId: null, animationFrameId: null, resizeHandler: null, dimResizeHandler: null };'
      );
    }

    // Mitosis' Svelte generator only auto-declares useRef()s bound via bind:this
    // (e.g. rootRef/canvasRef via bind:this={rootRef}); a plain-object useRef
    // used only for imperative bookkeeping -- not attached to any DOM node --
    // is referenced but never declared, causing a ReferenceError at runtime the
    // first time that code path actually runs (e.g. starting a canvas
    // background effect, or the lazy-mount IntersectionObserver cleanup).
    // This affects every component that carries such a ref, not just one, so
    // patch each undeclared name generically rather than one-off per file.
    const genericRefDefaults = {
      observerBox: '{ disconnect: null }',
      animContext: '{ animationFrameId: null, resizeHandler: null }',
      bgEffectContext: '{ animationFrameId: null, resizeHandler: null }',
      latestNext: '{ fn: () => {} }'
    };
    for (const [refName, defaultValue] of Object.entries(genericRefDefaults)) {
      const usesRef = new RegExp(`\\b${refName}\\b`).test(content);
      const declaresRef = new RegExp(`\\blet ${refName}\\b`).test(content);
      if (usesRef && !declaresRef) {
        content = content.replace(
          /(<script lang="ts">\n)/,
          `$1  let ${refName} = ${defaultValue};\n`
        );
      }
    }

    fs.writeFileSync(filePath, content, 'utf8');
  }
  console.log('Added <svelte:options runes={false} /> to Svelte components and patched missing declarations.');
}
