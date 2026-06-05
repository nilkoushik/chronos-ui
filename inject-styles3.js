const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'components');
const stylesComponentsDir = path.join(__dirname, 'src', 'styles', 'components');

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.lite.tsx'));

for (const file of files) {
  const componentName = file.replace('.lite.tsx', '');
  const cssFilePath = path.join(stylesComponentsDir, `${componentName}.css`);
  
  if (fs.existsSync(cssFilePath)) {
    const cssContent = fs.readFileSync(cssFilePath, 'utf8');
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    const lastClosingIndex = content.lastIndexOf('</');
    
    if (lastClosingIndex !== -1) {
      // Just inject a normal <style> tag without JS expression {}
      const injection = `\n      <style>\n${cssContent}\n      </style>\n    `;
      
      content = content.substring(0, lastClosingIndex) + injection + content.substring(lastClosingIndex);
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
}
