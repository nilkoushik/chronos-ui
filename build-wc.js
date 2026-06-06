const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const wcSrcDir = path.join(__dirname, 'dist', 'webcomponent', 'src', 'components');
const wcDistDir = path.join(__dirname, 'dist', 'webcomponent', 'dist');

if (!fs.existsSync(wcSrcDir)) {
  console.log('Web component source directory not found, skipping compile.');
  process.exit(0);
}

if (!fs.existsSync(wcDistDir)) {
  fs.mkdirSync(wcDistDir, { recursive: true });
}

// 1. Generate index.ts
const files = fs.readdirSync(wcSrcDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
const exportsList = files.map(f => `export * from './${f.replace('.ts', '')}.js';`).join('\n');
fs.writeFileSync(path.join(wcSrcDir, 'index.ts'), exportsList);

// 2. Transpile files individually ignoring type errors
console.log('Compiling Web Components to JavaScript (skipping type checks)...');
const allFiles = [...files, 'index.ts'];

for (const file of allFiles) {
  const code = fs.readFileSync(path.join(wcSrcDir, file), 'utf8');
  const result = ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ES2020
    }
  });
  
  const outPath = path.join(wcDistDir, file.replace('.ts', '.js'));
  let finalCode = result.outputText;
  
  // Fix invalid custom element names that don't have a hyphen (e.g. "banner")
  finalCode = finalCode.replace(/customElements\.define\("([^"-]+)",/g, 'customElements.define("chronos-$1",');
  
  // Fix strict mode TypeError: Cannot set property which has only a getter.
  // Mitosis generates both `get _fooRef()` and `this._fooRef = el` in updateBindings.
  finalCode = finalCode.replace(/get _[a-zA-Z0-9_]+Ref\(\) \{\s*return this\._root\.querySelector\("\[data-ref='[^']+'\]"\);\s*\}/g, '');
  
  // Fix TypeError: Cannot read properties of undefined (reading 'content')
  // Move `this.props = {}` initialization BEFORE `this.state = {}` in the constructor.
  finalCode = finalCode.replace(/const self = this;\s*this\.state = \{/g, 'const self = this;\n        if (!this.props) { this.props = {}; }\n        this.state = {');
  
  // Fix ReferenceError: colIndex is not defined in AlternatingSlider.js
  // Wrap in try-catch because Mitosis querySelectorAll matches un-stamped <template> tags
  finalCode = finalCode.replace(/this\._root\s*\.querySelectorAll\("\[data-el='(.*?)'\]"\)\s*\.forEach\(\(el\) => \{([\s\S]*?)\}\);/g, 'this._root.querySelectorAll("[data-el=\'$1\']").forEach((el) => { try { let colIndex = this.getScope ? this.getScope(el, "colIndex") : 0; let slideIndex = this.getScope ? this.getScope(el, "slideIndex") : 0; let slideRow = this.getScope ? this.getScope(el, "slideRow") : null; let index = this.getScope ? this.getScope(el, "index") : 0; let rowIndex = this.getScope ? this.getScope(el, "rowIndex") : 0; let mediaIndex = this.getScope ? this.getScope(el, "mediaIndex") : 0; $2 } catch(e) {} });');

  fs.writeFileSync(outPath, finalCode);
}
console.log('Successfully compiled Web Components.');
