const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'components');
const stylesComponentsDir = path.join(__dirname, 'src', 'styles', 'components');

// 3. Inject CSS from styles/components into .lite.tsx components
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.lite.tsx'));

for (const file of files) {
  const componentName = file.replace('.lite.tsx', '');
  const cssFilePath = path.join(stylesComponentsDir, `${componentName}.css`);
  
  if (fs.existsSync(cssFilePath)) {
    const cssContent = fs.readFileSync(cssFilePath, 'utf8');
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Safety check: don't inject twice
    if (content.includes('<style>{`/* Styles for')) {
      console.log(`Already injected styles into ${componentName}.lite.tsx`);
      continue;
    }
    
    // Inject the new style tag before the last closing tag
    // The last closing tag is right before `);`
    const lastClosingIndex = content.lastIndexOf('</');
    
    if (lastClosingIndex !== -1) {
      // Escape backticks and backslashes for template literal
      const injectedCss = cssContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
      
      const injection = `\n      <style>{\`/* Styles for ${componentName} */\\n${injectedCss}\`}</style>\n    `;
      
      content = content.substring(0, lastClosingIndex) + injection + content.substring(lastClosingIndex);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Injected styles into ${componentName}.lite.tsx`);
    } else {
      console.warn(`Could not find closing tag in ${componentName}`);
    }
  }
}
