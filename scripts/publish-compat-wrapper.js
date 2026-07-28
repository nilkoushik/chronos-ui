// Runs as a semantic-release "success"/"publish" step, after @contentvidya/ui
// itself has just been published at `${nextRelease.version}`. Keeps the
// @chronos-ui/core compat wrapper's version and its dependency pin on
// @contentvidya/ui in exact lockstep with the package it forwards to, then
// publishes it the same way (same OIDC/Trusted Publisher auth context).
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const version = process.env.NEXT_RELEASE_VERSION;
if (!version) {
  throw new Error('publish-compat-wrapper: NEXT_RELEASE_VERSION env var is required');
}

const wrapperDir = path.join(__dirname, '..', 'compat', 'chronos-ui-core');
const pkgPath = path.join(wrapperDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

pkg.version = version;
pkg.dependencies['@contentvidya/ui'] = version;

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

console.log(`[publish-compat-wrapper] @chronos-ui/core -> ${version} (forwarding to @contentvidya/ui@${version})`);

execSync('npm publish --provenance --access public', {
  cwd: wrapperDir,
  stdio: 'inherit'
});
