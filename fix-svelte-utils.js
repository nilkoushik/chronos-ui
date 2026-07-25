const fs = require('fs');
const path = require('path');

// Mitosis only builds src/components/**, so shared utils (e.g. lazyObserver,
// backgroundEffects, imported as "../utils/X" relative to
// dist/svelte/src/components/) are never emitted for the svelte target.
// Unlike the react/webcomponent targets (see fix-react.js / build-wc.js),
// Svelte consumers preprocess TypeScript themselves (e.g. vitePreprocess),
// so these are copied as-is rather than transpiled to .js.
const utilsSrcDir = path.join(__dirname, 'src', 'utils');
const utilsDistDir = path.join(__dirname, 'dist', 'svelte', 'src', 'utils');

if (fs.existsSync(utilsSrcDir)) {
  fs.mkdirSync(utilsDistDir, { recursive: true });
  for (const utilFile of fs.readdirSync(utilsSrcDir).filter((f) => f.endsWith('.ts'))) {
    fs.copyFileSync(path.join(utilsSrcDir, utilFile), path.join(utilsDistDir, utilFile));
  }
  console.log('Copied src/utils/*.ts into dist/svelte/src/utils/.');
}
