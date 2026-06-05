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
    
    if (!content.includes('useStyle')) {
      content = content.replace(/import\s*\{([^}]*)\}\s*from\s*['"]@builder.io\/mitosis['"];/, (match, p1) => {
        return `import { ${p1.trim()}, useStyle } from '@builder.io/mitosis';`;
      });
    }
    
    // Remove old useStyle if it exists
    content = content.replace(/\s*useStyle\(`[\s\S]*?`\);\s*/g, '\n  ');
    
    const functionIndex = content.indexOf('export default function');
    if (functionIndex !== -1) {
      const firstBraceIndex = content.indexOf('{', functionIndex);
      const injectedCss = cssContent.replace(/`/g, '\\`');
      const injection = `\n  useStyle(\`${injectedCss}\`);\n`;
      content = content.substring(0, firstBraceIndex + 1) + injection + content.substring(firstBraceIndex + 1);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Injected useStyle into top of ${componentName}`);
    }
  }
}
