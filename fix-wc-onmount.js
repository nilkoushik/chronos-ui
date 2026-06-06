const fs = require('fs');
const path = require('path');

const wcDistDir = path.join(__dirname, 'dist', 'webcomponent', 'dist');

if (fs.existsSync(wcDistDir)) {
  const files = fs.readdirSync(wcDistDir).filter(f => f.endsWith('.js'));
  
  for (const file of files) {
    const filePath = path.join(wcDistDir, file);
    let code = fs.readFileSync(filePath, 'utf8');
    
    // Check if onMount is defined
    if (code.includes('onMount() {')) {
      // Add const self = this; if it's not already there
      if (!code.includes('onMount() {\n        const self = this;')) {
        code = code.replace(/onMount\(\)\s*\{/, 'onMount() {\n        const self = this;');
        fs.writeFileSync(filePath, code, 'utf8');
        console.log(`Patched onMount in ${file}`);
      }
    }
  }
}
