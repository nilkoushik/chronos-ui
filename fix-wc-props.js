const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'dist', 'webcomponent', 'src', 'components');

if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.ts'));

  for (const file of files) {
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Mitosis extracts HTML attributes as raw strings. We want to automatically parse
    // them into objects if they are JSON, so arrays/objects work in Web Components.
    const searchStr = 'const attrValue = this.getAttribute(attr);';
    const replaceStr = `let attrValue: any = this.getAttribute(attr);
          try {
            if (attrValue && (attrValue.trim().startsWith('{') || attrValue.trim().startsWith('['))) {
              attrValue = JSON.parse(attrValue);
            }
          } catch (e) {}`;

    if (content.includes(searchStr)) {
      content = content.replace(searchStr, replaceStr);
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
  console.log('Patched Web Component output to support JSON parsing of attributes.');
}
