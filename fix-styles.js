const fs = require('fs');
const path = require('path');

const srcDir = 'c:/projects/cms/chronos-ui/src/components';
const themeCssPath = 'c:/projects/cms/chronos-ui/src/styles/theme.css';

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.lite.tsx'));
let allCss = '\n/* Component Styles Extracted Automatically */\n';

for (const file of files) {
  const filePath = path.join(srcDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Extract CSS
  const styleRegex = /<style>\{`([\s\S]*?)`\}<\/style>/;
  const match = content.match(styleRegex);
  
  if (match) {
    allCss += `/* ${file} */\n${match[1]}\n`;
    content = content.replace(styleRegex, '');
    fs.writeFileSync(filePath, content, 'utf8');
  }
}

fs.appendFileSync(themeCssPath, allCss, 'utf8');
console.log('Styles extracted and components updated.');
