const { setWorldConstructor, World } = require('@cucumber/cucumber');
const { bundleReactHarness, bundleSvelteHarness } = require('./bundle');

// Converts Gherkin's kebab-case attribute table (image-url, is-loading, ...)
// into camelCase JS prop values for the React/Svelte targets, parsing
// JSON-looking values (config="{...}", items="[...]") and booleans/numbers
// the same way a real consumer's JSX/template props would be typed.
function attrsToProps(attrs) {
  const props = {};
  for (const [key, raw] of Object.entries(attrs)) {
    const camelKey = key.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
    const trimmed = raw.trim();
    let value = raw;
    if (trimmed === 'true') value = true;
    else if (trimmed === 'false') value = false;
    else if (/^-?\d+(\.\d+)?$/.test(trimmed)) value = Number(trimmed);
    else if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        value = JSON.parse(trimmed);
      } catch {
        // leave as raw string
      }
    }
    props[camelKey] = value;
  }
  return props;
}

class ContentVidyaWorld extends World {
  constructor(options) {
    super(options);
    this.page = null;
    this.pageErrors = [];
    this.consoleErrors = [];
    this.mountTarget = 'webcomponent';
  }

  // Mounts a <tag attr="..."> web component into the harness page by
  // injecting its compiled module script + component-scoped CSS, then
  // creating the element with the given attributes. Waits for the custom
  // element to upgrade (connectedCallback run) before returning.
  async mountComponent(tag, pascalName, attrs) {
    this.mountTarget = 'webcomponent';
    const baseUrl = this.parameters.baseUrl;

    await this.page.goto(`${baseUrl}/tests/bdd/harness.html`, { waitUntil: 'load' });

    await this.page.evaluate(
      async ({ tag, pascalName, attrs, baseUrl }) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `${baseUrl}/dist/styles/components/${pascalName}.css`;
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.type = 'module';
        script.src = `${baseUrl}/dist/webcomponent/dist/${pascalName}.js`;
        document.head.appendChild(script);

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error(`Failed to load ${pascalName}.js`));
        });

        await customElements.whenDefined(tag);

        const el = document.createElement(tag);
        el.id = 'subject';
        for (const [name, value] of Object.entries(attrs)) {
          el.setAttribute(name, value);
        }
        document.getElementById('mount').appendChild(el);
      },
      { tag, pascalName, attrs, baseUrl }
    );

    // Let attributeChangedCallback/connectedCallback settle and any RAF-deferred
    // layout (e.g. the canvas resize follow-up) run at least once.
    await this.page.waitForTimeout(300);
  }

  // Mounts the compiled dist/react component for pascalName with the given
  // attrs (converted to real React props), using an esbuild-bundled harness
  // built with the project's own React/ReactDOM devDependencies.
  async mountReactComponent(pascalName, attrs) {
    this.mountTarget = 'react';
    const baseUrl = this.parameters.baseUrl;
    const props = attrsToProps(attrs);

    await this.page.goto(`${baseUrl}/tests/bdd/harness.html`, { waitUntil: 'load' });

    const bundlePath = await bundleReactHarness(pascalName, props);

    await this.page.evaluate(
      ({ bundlePath, baseUrl, pascalName }) => {
        // The component's visual styles live in its own stylesheet, exposed via
        // the package's "./styles/*" export — theme.css alone only provides the
        // custom properties. Without this the component renders structurally
        // correct but entirely unstyled, so colour-dependent assertions (and
        // axe's contrast rules) would measure browser defaults, not the design.
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `${baseUrl}/dist/styles/components/${pascalName}.css`;
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.type = 'module';
        script.src = `${baseUrl}${bundlePath}`;
        document.head.appendChild(script);
        return new Promise((resolve, reject) => {
          link.onload = () => {};
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load React bundle'));
        });
      },
      { bundlePath, baseUrl, pascalName }
    );

    await this.page.waitForTimeout(300);
  }

  // Mounts the compiled dist/svelte component for pascalName with the given
  // attrs (converted to real Svelte props), compiling the raw .svelte source
  // with svelte/compiler and bundling it with esbuild.
  async mountSvelteComponent(pascalName, attrs) {
    this.mountTarget = 'svelte';
    const baseUrl = this.parameters.baseUrl;
    const props = attrsToProps(attrs);

    await this.page.goto(`${baseUrl}/tests/bdd/harness.html`, { waitUntil: 'load' });

    const bundlePath = await bundleSvelteHarness(pascalName, props);

    await this.page.evaluate(
      ({ bundlePath, baseUrl, pascalName }) => {
        // Same as the React mount: pull in the component-scoped stylesheet, or
        // every colour assertion is made against unstyled browser defaults.
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `${baseUrl}/dist/styles/components/${pascalName}.css`;
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.type = 'module';
        script.src = `${baseUrl}${bundlePath}`;
        document.head.appendChild(script);
        return new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Svelte bundle'));
        });
      },
      { bundlePath, baseUrl, pascalName }
    );

    await this.page.waitForTimeout(300);
  }

  subject() {
    return this.page.locator(this.mountTarget === 'webcomponent' ? '#subject' : '#mount');
  }
}

setWorldConstructor(ContentVidyaWorld);
