const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('node:assert/strict');
const AxeBuilder = require('@axe-core/playwright').default;

Given('I mount the {string} component as {string} with:', async function (tag, pascalName, dataTable) {
  const rows = dataTable.rowsHash();
  await this.mountComponent(tag, pascalName, rows);
});

Given('I mount the {string} component as {string} with no attributes', async function (tag, pascalName) {
  await this.mountComponent(tag, pascalName, {});
});

Given('I mount the {string} React component with:', async function (pascalName, dataTable) {
  await this.mountReactComponent(pascalName, dataTable.rowsHash());
});

Given('I mount the {string} Svelte component with:', async function (pascalName, dataTable) {
  await this.mountSvelteComponent(pascalName, dataTable.rowsHash());
});

When('I wait {int} ms', async function (ms) {
  await this.page.waitForTimeout(ms);
});

Then('it should render without any page errors', function () {
  assert.deepEqual(this.pageErrors, [], `Expected no page errors, got:\n${this.pageErrors.join('\n')}`);
});

Then('the component should contain a visible {string} element', async function (selector) {
  const el = this.subject().locator(selector).first();
  await assert.doesNotReject(el.waitFor({ state: 'visible', timeout: 5000 }));
});

Then('the component should not contain a {string} element', async function (selector) {
  const count = await this.subject().locator(selector).count();
  assert.equal(count, 0, `Expected no "${selector}" elements, found ${count}`);
});

Then('it should contain {int} elements matching {string}', async function (expectedCount, selector) {
  const count = await this.subject().locator(selector).count();
  assert.equal(count, expectedCount, `Expected ${expectedCount} "${selector}" elements, found ${count}`);
});

Then('the canvas should be actively animating', async function () {
  const canvas = this.subject().locator('canvas').first();
  await canvas.waitFor({ state: 'attached', timeout: 5000 });
  const frame1 = await canvas.evaluate((c) => c.toDataURL());
  await this.page.waitForTimeout(700);
  const frame2 = await canvas.evaluate((c) => c.toDataURL());
  assert.notEqual(frame1, frame2, 'Expected the canvas background effect to redraw over time, but two frames 700ms apart were identical');
});

Then('it should contain an element matching {string} with alt text {string}', async function (selector, expectedAlt) {
  const alt = await this.subject().locator(selector).first().getAttribute('alt');
  assert.equal(alt, expectedAlt);
});

Then('the component text should include {string}', async function (expected) {
  const text = await this.subject().innerText();
  assert.ok(text.includes(expected), `Expected component text to include "${expected}", got:\n${text}`);
});

Then('attribute {string} on the component should equal {string}', async function (attr, expected) {
  const value = await this.subject().getAttribute(attr);
  assert.equal(value, expected);
});

// Target conformance level. The project targets WCAG 2.1 AAA, so AAA rule tags
// are included alongside A and AA. Override with A11Y_LEVEL=aa to fall back to
// the A+AA gate (useful when triaging AAA-only failures separately).
const A11Y_TAGS = process.env.A11Y_LEVEL === 'aa'
  ? ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
  : ['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21a', 'wcag21aa', 'wcag21aaa'];

// Contrast rules are the two that separate AA from AAA: `color-contrast` is the
// 4.5:1 AA threshold, `color-contrast-enhanced` the 7:1 AAA one. Both are on by
// default now that AAA is the target. Set A11Y_SKIP_CONTRAST=1 to silence them
// while working on non-palette fixes -- do not commit that as the default, or
// AAA conformance stops being measured at all.
const A11Y_DISABLED = process.env.A11Y_SKIP_CONTRAST === '1'
  ? ['color-contrast', 'color-contrast-enhanced']
  : [];

Then('the component should have no serious accessibility violations', async function () {
  let builder = new AxeBuilder({ page: this.page })
    .include(this.mountTarget === 'webcomponent' ? '#subject' : '#mount')
    .withTags(A11Y_TAGS);
  if (A11Y_DISABLED.length) builder = builder.disableRules(A11Y_DISABLED);
  const results = await builder.analyze();

  const serious = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');

  // Attach the audit to the Cucumber report. Without this the Allure report
  // shows accessibility only as a step that passed -- no record of which
  // conformance level was targeted, how many rules actually ran, or what the
  // measured contrast ratios were. A passing a11y check that carries no
  // evidence is indistinguishable from one that never ran.
  const level = process.env.A11Y_LEVEL === 'aa' ? 'WCAG 2.1 AA' : 'WCAG 2.1 AAA';
  const audit = {
    target: level,
    ruleTags: A11Y_TAGS,
    disabledRules: A11Y_DISABLED,
    mountTarget: this.mountTarget,
    rulesPassed: results.passes.length,
    rulesViolated: results.violations.length,
    seriousOrCritical: serious.length,
    incomplete: results.incomplete.length,
    violations: results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.map((n) => {
        const d = (n.any || []).map((c) => c.data).find((x) => x && x.contrastRatio);
        return d
          ? { target: n.target.join(' '), fg: d.fgColor, bg: d.bgColor, ratio: d.contrastRatio, required: d.expectedContrastRatio }
          : { target: n.target.join(' ') };
      })
    }))
  };
  await this.attach(JSON.stringify(audit, null, 2), 'application/json');
  if (serious.length) {
    const details = serious
      .map((v) => {
        // Include the per-node diagnostic data axe already computed. For the
        // contrast rules that means the actual fg/bg pair and the measured vs
        // required ratio, which is what you need to pick a replacement colour --
        // without it a failure only tells you *that* something is too light.
        const nodes = v.nodes.slice(0, 4).map((n) => {
          const d = (n.any || []).map((c) => c.data).find((x) => x && x.contrastRatio) || {};
          const bits = d.contrastRatio
            ? ` fg=${d.fgColor} bg=${d.bgColor} ratio=${d.contrastRatio} needs=${d.expectedContrastRatio}` +
              (d.fontSize ? ` (${d.fontSize}, weight ${d.fontWeight})` : '')
            : '';
          return `    · ${n.target.join(' ')}${bits}`;
        }).join('\n');
        const more = v.nodes.length > 4 ? `\n    … and ${v.nodes.length - 4} more node(s)` : '';
        return `- [${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))\n  ${v.helpUrl}\n${nodes}${more}`;
      })
      .join('\n');
    assert.fail(`Found ${serious.length} serious/critical accessibility violation(s):\n${details}`);
  }
});
