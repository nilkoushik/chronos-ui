const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const srcDir = path.join(__dirname, 'dist', 'react', 'src', 'components');

if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx'));
  const componentNames = [];

  for (const file of files) {
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix: currentIndex++ -> setCurrentIndex(prev => prev + 1);
    content = content.replace(/currentIndex\+\+;/g, 'setCurrentIndex(prev => prev + 1);');
    // Fix: currentIndex-- -> setCurrentIndex(prev => prev - 1);
    content = content.replace(/currentIndex--;/g, 'setCurrentIndex(prev => prev - 1);');

    // Fix: setCurrentIndex((currentIndex + 1) % totalSlides()); -> setCurrentIndex(prev => (prev + 1) % totalSlides());
    content = content.replace(/setCurrentIndex\(\(currentIndex \+ 1\) \% totalSlides\(\)\);/g, 'setCurrentIndex(prev => (prev + 1) % totalSlides());');
    content = content.replace(/setCurrentIndex\(\(currentIndex \- 1 \+ totalSlides\(\)\) \% totalSlides\(\)\);/g, 'setCurrentIndex(prev => (prev - 1 + totalSlides()) % totalSlides());');

    // Also handle setCurrentIndex(currentIndex + 1) if it appears (e.g. without modulo)
    content = content.replace(/setCurrentIndex\(currentIndex \+ 1\);/g, 'setCurrentIndex(prev => prev + 1);');
    content = content.replace(/setCurrentIndex\(currentIndex \- 1\);/g, 'setCurrentIndex(prev => prev - 1);');

    fs.writeFileSync(filePath, content, 'utf8');
  }
  console.log('Patched React components for stale closures and assignment errors.');

  // Publish the components as plain browser-runnable ESM .js alongside the .tsx
  // sources. package.json's exports map ("./react/*") and the JSFiddle/esm.sh
  // demo both need a real, already-compiled file: esm.sh serves published npm
  // packages as-is and does not transpile TypeScript/JSX itself, so shipping
  // only raw .tsx meant "could not resolve build entry" for any deep import
  // like '@contentvidya/ui/react/SlidingBanner'. Classic JSX mode is used
  // (React.createElement calls) to match the existing `import * as React from
  // "react"` in every component instead of the automatic jsx-runtime.
  // Mitosis only builds src/components/**, so shared utils (e.g. lazyObserver,
  // imported as "../utils/lazyObserver" relative to dist/react/src/components/)
  // are never emitted for the react target either. Compile them alongside, into
  // the matching dist/react/src/utils/ location.
  const reactSrcRoot = path.join(__dirname, 'dist', 'react', 'src');
  const utilsSrcDir = path.join(__dirname, 'src', 'utils');
  const utilsDistDir = path.join(reactSrcRoot, 'utils');
  if (fs.existsSync(utilsSrcDir)) {
    fs.mkdirSync(utilsDistDir, { recursive: true });
    for (const utilFile of fs.readdirSync(utilsSrcDir).filter((f) => f.endsWith('.ts'))) {
      const utilContent = fs.readFileSync(path.join(utilsSrcDir, utilFile), 'utf8');
      const utilResult = ts.transpileModule(utilContent, {
        compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
      });
      fs.writeFileSync(path.join(utilsDistDir, utilFile.replace('.ts', '.js')), utilResult.outputText);
    }
  }

  for (const file of files) {
    const filePath = path.join(srcDir, file);
    const componentName = file.replace('.tsx', '');
    const content = fs.readFileSync(filePath, 'utf8');
    const result = ts.transpileModule(content, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.ESNext,
        jsx: ts.JsxEmit.React,
        esModuleInterop: true,
      },
      fileName: file,
    });
    // Browser ESM requires explicit extensions on relative specifiers; TS emits
    // them bare (e.g. `from "../utils/lazyObserver"`), which 404s at runtime.
    const finalCode = result.outputText.replace(
      /(from\s+["'](?:\.\.?\/)[^"']+?)(["'])/g,
      (match, specifier, quote) => (/\.[a-zA-Z0-9]+$/.test(specifier) ? match : `${specifier}.js${quote}`)
    );
    fs.writeFileSync(path.join(srcDir, `${componentName}.js`), finalCode);
    componentNames.push(componentName);
  }

  const indexJs = componentNames
    .map((name) => `export { default as ${name} } from './${name}.js';`)
    .join('\n') + '\n';
  fs.writeFileSync(path.join(srcDir, 'index.js'), indexJs);
  console.log('Compiled React components to plain ESM .js and generated index.js barrel.');
}
