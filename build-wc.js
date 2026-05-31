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
  fs.writeFileSync(outPath, result.outputText);
}
console.log('Successfully compiled Web Components.');
