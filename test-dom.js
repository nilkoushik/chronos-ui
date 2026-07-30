const { JSDOM } = require('jsdom');
const dom = new JSDOM(`<!DOCTYPE html><html><body>
  <h2 class="contentvidya-banner-title">
    <template data-el="div-banner-3"><!-- props.title --></template>
  </h2>
</body></html>`);

const el = dom.window.document.querySelector('[data-el="div-banner-3"]');
el.innerText = "Hello World";

console.log('Outer HTML:', dom.window.document.body.innerHTML);
