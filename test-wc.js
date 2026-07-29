const { JSDOM } = require('jsdom');
const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;
global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
global.cancelAnimationFrame = clearTimeout;

require('./examples/wc-demo/node_modules/@contentvidya/ui/dist/webcomponent/dist/GridBanner.js');
require('./examples/wc-demo/node_modules/@contentvidya/ui/dist/webcomponent/dist/SlidingBanner.js');

try {
  const el = document.createElement('grid-banner');
  el.setAttribute('columns', '4');
  el.setAttribute('items', JSON.stringify([{id: '1', title: 'Test'}]));
  document.body.appendChild(el);
  console.log('GridBanner HTML:', el.shadowRoot.innerHTML.substring(0, 200));
} catch (e) {
  console.error('GridBanner Error:', e);
}

try {
  const sl = document.createElement('sliding-banner');
  document.body.appendChild(sl);
  console.log('SlidingBanner attached successfully.');
} catch (e) {
  console.error('SlidingBanner Error:', e);
}
