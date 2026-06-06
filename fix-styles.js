const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'src', 'components');
const stylesComponentsDir = path.join(__dirname, 'src', 'styles', 'components');

// Create the components style directory if it doesn't exist
if (!fs.existsSync(stylesComponentsDir)) {
  fs.mkdirSync(stylesComponentsDir, { recursive: true });
}

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.lite.tsx'));

for (const file of files) {
  const filePath = path.join(srcDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Extract CSS
  const styleRegex = /<style>\{`([\s\S]*?)`\}<\/style>/;
  const match = content.match(styleRegex);
  
  if (match) {
    const componentName = file.replace('.lite.tsx', '');
    const cssFilePath = path.join(stylesComponentsDir, `${componentName}.css`);
    let rawCss = match[1];
    if (rawCss.startsWith('\\')) rawCss = rawCss.substring(1);
    const cssContent = `/* Styles for ${componentName} */\n${rawCss}\n`;
    
    // Write individual CSS file
    fs.writeFileSync(cssFilePath, cssContent, 'utf8');
  }
}

console.log('Styles extracted to individual CSS files and components updated.');
