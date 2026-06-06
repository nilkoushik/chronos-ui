const fs = require('fs');
const path = require('path');
const srcDir = path.join(__dirname, 'dist', 'react', 'src', 'components');

if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.tsx'));

  for (const file of files) {
    const filePath = path.join(srcDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Fix: currentIndex++ -> setCurrentIndex(prev => prev + 1);
    content = content.replace(/currentIndex\+\+;/g, 'setCurrentIndex(prev => prev + 1);');
    // Fix: currentIndex-- -> setCurrentIndex(prev => prev - 1);
    content = content.replace(/currentIndex--;/g, 'setCurrentIndex(prev => prev - 1);');
    
    // Fix: setCurrentIndex((currentIndex + 1) % totalSlides()); -> setCurrentIndex(prev => (prev + 1) % totalSlides());
    content = content.replace(/setCurrentIndex\(\(currentIndex \+ 1\) \% totalSlides\(\)\);/g, 'setCurrentIndex(prev => (prev + 1) % totalSlides());');
    content = content.replace(/setCurrentIndex\(\(currentIndex \- 1 \+ totalSlides\(\)\) \% totalSlides\(\)\);/g, 'setCurrentIndex(prev => (prev - 1 + totalSlides()) % totalSlides());');

    // Also handle setCurrentIndex(currentIndex + 1) if it appears (e.g. without modulo)
    content = content.replace(/setCurrentIndex\(currentIndex \+ 1\);/g, 'setCurrentIndex(prev => prev + 1);');
    content = content.replace(/setCurrentIndex\(currentIndex \- 1\);/g, 'setCurrentIndex(prev => prev - 1);');

    fs.writeFileSync(filePath, content, 'utf8');
  }
  console.log('Patched React components for stale closures and assignment errors.');
}
