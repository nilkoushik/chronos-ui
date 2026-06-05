const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'components');
const stylesComponentsDir = path.join(__dirname, 'src', 'styles', 'components');

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.lite.tsx'));

for (const file of files) {
  const componentName = file.replace('.lite.tsx', '');
  const cssFilePath = path.join(stylesComponentsDir, `${componentName}.css`);
  
  if (fs.existsSync(cssFilePath)) {
    let cssContent = fs.readFileSync(cssFilePath, 'utf8');
    
    // Clean up any literal \\n that got written into the CSS files
    cssContent = cssContent.replace(/\\n/g, '\n');
    // Remove duplicate comments
    cssContent = cssContent.replace(/\/\* Styles for .*?\*\/\n/g, '');
    
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Safety check: remove any previously injected <style> tags at the bottom
    content = content.replace(/<style>\{`[\s\S]*?`\}<\/style>/g, '');
    
    const lastClosingIndex = content.lastIndexOf('</');
    
    if (lastClosingIndex !== -1) {
      // Escape backticks correctly for JS template literal
      const injectedCss = cssContent.replace(/`/g, '\\`');
      
      const injection = `\n      <style>{\`${injectedCss}\`}</style>\n    `;
      
      content = content.substring(0, lastClosingIndex) + injection + content.substring(lastClosingIndex);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Cleanly injected styles into ${componentName}`);
    }
  }
}
