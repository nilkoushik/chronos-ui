import { chromium } from 'playwright-core';

const browser = await chromium.launch({
  executablePath: 'C:\\Users\\nil_k\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe',
});
const page = await browser.newPage();

const runsResp = await page.goto('https://api.github.com/repos/nilkoushik/contentvidya-ui/actions/runs?per_page=10');
const runsData = await runsResp.json();
const run = runsData.workflow_runs.find(r => r.name === 'Release' && r.head_sha.startsWith('06c4eeb'));
if (!run) {
  console.log('No Release run found for 06c4eeb yet. Recent runs:');
  for (const r of runsData.workflow_runs.slice(0, 6)) {
    console.log(r.name, '|', r.head_sha.slice(0,7), '|', r.status, '|', r.conclusion);
  }
} else {
  console.log('run status:', run.status, 'conclusion:', run.conclusion, 'url:', run.html_url);

  if (run.status === 'completed') {
    if (run.conclusion !== 'success') {
      const crResp = await page.goto('https://api.github.com/repos/nilkoushik/contentvidya-ui/commits/06c4eeb/check-runs');
      const crData = await crResp.json();
      for (const cr of crData.check_runs || []) {
        if (cr.name !== 'release') continue;
        const annResp = await page.goto(cr.url + '/annotations');
        const annData = await annResp.json();
        console.log('===', cr.name, cr.conclusion, '===');
        for (const a of annData) console.log('  annotation:', a.message);
      }
    } else {
      const npmResp = await page.goto('https://registry.npmjs.org/@chronos-ui/core');
      const npmData = await npmResp.json();
      console.log('npm dist-tags:', JSON.stringify(npmData['dist-tags']));

      const relResp = await page.goto('https://api.github.com/repos/nilkoushik/contentvidya-ui/releases?per_page=2');
      const relData = await relResp.json();
      for (const r of relData) {
        console.log('=== release', r.tag_name, '===');
        console.log('url:', r.html_url);
        console.log('body:', r.body);
        console.log();
      }
    }
  }
}

await browser.close();
