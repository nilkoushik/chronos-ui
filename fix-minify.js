const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

// No step in this build pipeline ever minified anything — mitosis just emits
// plain compiled output, and fix-react.js/build-wc.js only transpile (ts ->
// js), so every consumer downloaded full-size, whitespace-and-comments-intact
// JS and CSS. This minifies the two JS targets in place (React's compiled
// .js, and the Web Component bundle + its transpiled utils), and writes a
// minified CSS mirror into dist/styles/ so package.json's exports can point
// there instead of at src/styles/ (kept as-is, human-readable, for anyone
// browsing the repo/source maps).

function minifyJsFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const result = esbuild.transformSync(code, {
    loader: path.extname(filePath) === '.jsx' ? 'jsx' : 'js',
    minify: true,
    target: 'es2020'
  });
  fs.writeFileSync(filePath, result.code, 'utf8');
}

function minifyJsDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      minifyJsDir(full);
    } else if (entry.name.endsWith('.js')) {
      minifyJsFile(full);
    }
  }
}

// 1. React compiled output (dist/react/src/components/*.js + utils/*.js)
minifyJsDir(path.join(__dirname, 'dist', 'react', 'src'));

// 2. Web component bundle (dist/webcomponent/dist/*.js + utils/*.js)
minifyJsDir(path.join(__dirname, 'dist', 'webcomponent', 'dist'));

// 3. CSS: mirror src/styles/** into dist/styles/** with minified content.
// package.json's "./theme.css" and "./styles/*" exports point here so real
// consumers get minified CSS, while src/styles/ stays the readable source.
function minifyCssDir(srcDir, destDir) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      minifyCssDir(srcPath, destPath);
    } else if (entry.name.endsWith('.css')) {
      const css = fs.readFileSync(srcPath, 'utf8');
      const result = esbuild.transformSync(css, { loader: 'css', minify: true });
      fs.writeFileSync(destPath, result.code, 'utf8');
    }
  }
}

minifyCssDir(path.join(__dirname, 'src', 'styles'), path.join(__dirname, 'dist', 'styles'));

console.log('Minified React/WebComponent JS output and mirrored minified CSS into dist/styles/.');
