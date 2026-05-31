const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'dist', 'svelte', 'src', 'components');

if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.svelte'));

  for (const file of files) {
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('<svelte:options runes={false} />')) {
      content = '<svelte:options runes={false} />\n' + content;
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
  console.log('Added <svelte:options runes={false} /> to all generated Svelte components.');
}
