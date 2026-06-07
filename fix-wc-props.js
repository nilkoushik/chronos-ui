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
    }

    // Fix missing componentProps initialization in constructor
    if (content.includes('this.componentProps') && !content.includes('this.componentProps =')) {
      const interfaceMatch = content.match(/interface\s+\w+Props\s*\{([\s\S]*?)\}/);
      if (interfaceMatch) {
        const propsBlock = interfaceMatch[1];
        const propNames = [];
        const lines = propsBlock.split('\n');
        for (const line of lines) {
          const propMatch = line.match(/^\s*([a-zA-Z0-9_]+)\s*\??\s*:/);
          if (propMatch) {
            propNames.push(propMatch[1]);
          }
        }
        console.log(`Injecting componentProps for ${file}:`, propNames);
        const constructorStr = 'constructor() {';
        const injectStr = `constructor() {
    this.componentProps = ${JSON.stringify(propNames)};`;
        content = content.replace(constructorStr, injectStr);
      }
    }

    fs.writeFileSync(filePath, content, 'utf8');
  }
  console.log('Patched Web Component output to support JSON parsing of attributes.');
}
