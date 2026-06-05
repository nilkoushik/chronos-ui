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
    
    // Nuke all lines before the first actual CSS rule
    const firstRuleIndex = Math.min(
      cssContent.indexOf('.') !== -1 ? cssContent.indexOf('.') : Infinity,
      cssContent.indexOf('@') !== -1 ? cssContent.indexOf('@') : Infinity
    );
    
    if (firstRuleIndex !== Infinity) {
      cssContent = cssContent.substring(firstRuleIndex);
    }
    
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add useStyle to imports if not present
    if (!content.includes('useStyle')) {
      content = content.replace(/import\s*\{([^}]*)\}\s*from\s*['"]@builder.io\/mitosis['"];/, (match, p1) => {
        return `import { ${p1.trim()}, useStyle } from '@builder.io/mitosis';`;
      });
    }
    
    // Remove old useStyle if it exists (so we can safely re-inject)
    content = content.replace(/\s*useStyle\(`[\s\S]*?`\);\s*/g, '\n  ');
    
    // Inject useStyle right before the return statement inside the component function
    const returnIndex = content.indexOf('return (');
    if (returnIndex !== -1) {
      const injectedCss = cssContent.replace(/`/g, '\\`');
      const injection = `useStyle(\`${injectedCss}\`);\n\n  `;
      content = content.substring(0, returnIndex) + injection + content.substring(returnIndex);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Injected useStyle cleanly into ${componentName}`);
    }
  }
}
