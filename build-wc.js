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
  // Using a robust brace-matching parser to avoid breaking nested object/function braces (e.g. Object.assign)
  const queryRegex = /this\._root\s*\.querySelectorAll\("\[data-el='(.*?)'\]"\)\s*\.forEach\(\(el\)\s*=>\s*\{/g;
  let match;
  while ((match = queryRegex.exec(finalCode)) !== null) {
    const startIdx = match.index;
    const matchStr = match[0];
    const dataElValue = match[1];
    
    const searchStart = startIdx + matchStr.length;
    let braceCount = 1;
    let endIdx = -1;
    for (let i = searchStart; i < finalCode.length; i++) {
      if (finalCode[i] === '{') {
        braceCount++;
      } else if (finalCode[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          if (finalCode.substring(i, i + 3) === '});') {
            endIdx = i + 3;
            break;
          }
        }
      }
    }
    
    if (endIdx !== -1) {
      const innerContent = finalCode.substring(searchStart, endIdx - 3);
      
      const varsToInject = [];
      if (!/const\s+colIndex\b|let\s+colIndex\b|var\s+colIndex\b/.test(innerContent)) {
        varsToInject.push('let colIndex = this.getScope ? this.getScope(el, "colIndex") : 0;');
      }
      if (!/const\s+slideIndex\b|let\s+slideIndex\b|var\s+slideIndex\b/.test(innerContent)) {
        varsToInject.push('let slideIndex = this.getScope ? this.getScope(el, "slideIndex") : 0;');
      }
      if (!/const\s+slideRow\b|let\s+slideRow\b|var\s+slideRow\b/.test(innerContent)) {
        varsToInject.push('let slideRow = this.getScope ? this.getScope(el, "slideRow") : null;');
      }
      if (!/const\s+index\b|let\s+index\b|var\s+index\b/.test(innerContent)) {
        varsToInject.push('let index = this.getScope ? this.getScope(el, "index") : 0;');
      }
      if (!/const\s+rowIndex\b|let\s+rowIndex\b|var\s+rowIndex\b/.test(innerContent)) {
        varsToInject.push('let rowIndex = this.getScope ? this.getScope(el, "rowIndex") : 0;');
      }
      if (!/const\s+mediaIndex\b|let\s+mediaIndex\b|var\s+mediaIndex\b/.test(innerContent)) {
        varsToInject.push('let mediaIndex = this.getScope ? this.getScope(el, "mediaIndex") : 0;');
      }
      
      const injectedVars = varsToInject.join(' ');
      const newInnerContent = ` try { ${injectedVars} ${innerContent} } catch(e) {} `;
      const replacement = `this._root.querySelectorAll("[data-el='${dataElValue}']").forEach((el) => {${newInnerContent}});`;
      
      finalCode = finalCode.substring(0, startIdx) + replacement + finalCode.substring(endIdx);
      queryRegex.lastIndex = startIdx + replacement.length;
    }
  }

  fs.writeFileSync(outPath, finalCode);
}
console.log('Successfully compiled Web Components.');
