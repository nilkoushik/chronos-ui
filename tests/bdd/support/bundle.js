const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const svelteCompiler = require('svelte/compiler');

const ROOT = path.join(__dirname, '..', '..', '..');
const TMP_DIR = path.join(ROOT, 'tests', 'bdd', '.tmp');

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

let counter = 0;
function tmpFile(ext) {
  counter += 1;
  return path.join(TMP_DIR, `bundle-${process.pid}-${counter}.${ext}`);
}

// Bundles an in-memory ESM entry (plus whatever it imports from node_modules
// or the repo) into a single browser-runnable ESM file, using esbuild --
// already a devDependency, so this stays fully offline/deterministic and
// appropriate for a pre-commit hook (no CDN fetch of React/Svelte at test time).
async function bundleEntry(entryCode) {
  const result = await esbuild.build({
    stdin: {
      contents: entryCode,
      resolveDir: ROOT,
      loader: 'js'
    },
    bundle: true,
    format: 'esm',
    target: 'es2020',
    write: false,
    logLevel: 'silent'
  });
  const outFile = tmpFile('js');
  fs.writeFileSync(outFile, result.outputFiles[0].text);
  return `/tests/bdd/.tmp/${path.basename(outFile)}`;
}

// Mounts a compiled dist/react component with the given props via
// ReactDOM.createRoot, bundled with a real React/ReactDOM (installed as
// devDependencies) rather than relying on an import map or CDN.
async function bundleReactHarness(pascalName, props) {
  const entry = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import Component from '${path.join(ROOT, 'dist', 'react', 'src', 'components', `${pascalName}.js`).replace(/\\/g, '/')}';

const mount = document.getElementById('mount');
const root = createRoot(mount);
window.__reactRoot = root;
root.render(React.createElement(Component, ${JSON.stringify(props)}));
`;
  return bundleEntry(entry);
}

// Strips TypeScript from every <script lang="ts">...</script> block (both
// the module-context and instance-context blocks Svelte components can have)
// via ts.transpileModule -- the same type-stripping-only approach this
// project's own build-wc.js/fix-react.js scripts already use elsewhere.
// svelte-preprocess's typescript() transformer was tried first, but it
// unconditionally discovers and loads the repo's own tsconfig.json even with
// tsconfigFile: false, and that tsconfig's moduleResolution="node10" is a
// hard (non-warning) error on this installed TypeScript version -- unrelated
// to whether the component's own source is valid.
function stripScriptTypes(source) {
  return source.replace(
    /(<script[^>]*\blang=["']ts["'][^>]*>)([\s\S]*?)(<\/script>)/g,
    (_match, openTag, code, closeTag) => {
      const { outputText } = ts.transpileModule(code, {
        compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext }
      });
      const openTagWithoutLang = openTag.replace(/\s+lang=["']ts["']/, '');
      return `${openTagWithoutLang}${outputText}${closeTag}`;
    }
  );
}

// Compiles the raw .svelte source (Svelte 3, legacy client component API)
// with svelte/compiler, then bundles the compiled class + its 'svelte/internal'
// runtime imports together so it can be instantiated directly in the browser.
async function bundleSvelteHarness(pascalName, props) {
  const svelteSrcPath = path.join(ROOT, 'dist', 'svelte', 'src', 'components', `${pascalName}.svelte`);
  const source = fs.readFileSync(svelteSrcPath, 'utf8');
  // <svelte:options runes={false} /> targets Svelte 4/5's opt-out of runes
  // mode; the devDependency installed here for this test suite is Svelte 3,
  // which predates runes entirely (and is legacy-reactivity by default), so
  // the tag is simply unknown syntax to its compiler. Real consumers on
  // Svelte 4/5 (e.g. the SvelteKit admin app) still get it from dist/ as-is.
  const withoutRunesOption = source.replace(/<svelte:options\s+runes=\{false\}\s*\/>\n?/, '');
  const plainJsSource = stripScriptTypes(withoutRunesOption);

  const { js } = svelteCompiler.compile(plainJsSource, {
    generate: 'dom',
    format: 'esm',
    filename: `${pascalName}.svelte`
  });

  // Written as a sibling of the real component under dist/svelte/src/components/
  // (not tests/bdd/.tmp/) so the compiled code's own relative imports --
  // "../utils/lazyObserver", "../utils/backgroundEffects" -- resolve exactly
  // the way they do for the real .svelte file, instead of needing path
  // rewriting. Removed again once esbuild has inlined it into the real bundle.
  const componentsDir = path.join(ROOT, 'dist', 'svelte', 'src', 'components');
  const compiledPath = path.join(componentsDir, `.bdd-compiled-${pascalName}-${process.pid}.mjs`);
  fs.writeFileSync(compiledPath, js.code);

  try {
    const entry = `
import Component from '${compiledPath.replace(/\\/g, '/')}';

const mount = document.getElementById('mount');
window.__svelteInstance = new Component({ target: mount, props: ${JSON.stringify(props)} });
`;
    return await bundleEntry(entry);
  } finally {
    fs.unlinkSync(compiledPath);
  }
}

module.exports = { bundleReactHarness, bundleSvelteHarness };
