const { Before, After, BeforeAll, AfterAll, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium } = require('playwright-core');
const { startServer } = require('./server');

setDefaultTimeout(20 * 1000);

let server;
let browser;
let port;

BeforeAll(async function () {
  server = await startServer();
  port = server.address().port;
  browser = await chromium.launch();
});

AfterAll(async function () {
  if (browser) await browser.close();
  if (server) await new Promise((resolve) => server.close(resolve));
});

Before(async function () {
  this.parameters.baseUrl = `http://localhost:${port}`;
  const context = await browser.newContext();
  this.page = await context.newPage();
  this.pageErrors = [];
  this.consoleErrors = [];
  this.page.on('pageerror', (err) => this.pageErrors.push(err.message));
  this.page.on('console', (msg) => {
    if (msg.type() === 'error') this.consoleErrors.push(msg.text());
  });
});

After(async function () {
  await this.page.context().close();
});
