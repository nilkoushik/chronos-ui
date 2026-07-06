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

    // Fix missing animContext declaration in SlidingBanner.svelte
    if (file === 'SlidingBanner.svelte') {
      content = content.replace(/\s*let animContext = [\s\S]*?;\n/, '\n');
      content = content.replace(
        'export let isLoading: SlidingBannerProps["isLoading"];',
        'export let isLoading: SlidingBannerProps["isLoading"];\n  let animContext = { intervalId: null, animationFrameId: null, resizeHandler: null, dimResizeHandler: null };'
      );
    }

    fs.writeFileSync(filePath, content, 'utf8');
  }
  console.log('Added <svelte:options runes={false} /> to Svelte components and patched missing declarations.');
}
