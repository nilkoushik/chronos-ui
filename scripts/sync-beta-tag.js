#!/usr/bin/env node
'use strict';

// Runs as the npm `postpublish` lifecycle hook, so it fires after every
// `npm publish` — whether triggered by CI or run by hand from a local machine.
//
// A stable (non-prerelease) publish only advances the `latest` dist-tag.
// Without this, `beta` stays pinned to whatever prerelease was last published
// under --tag beta and never catches up — anything pinned to @beta (CDN
// links, early adopters) silently drifts further behind with every release.

const { execSync } = require('child_process');
const pkg = require('../package.json');

if (pkg.version.includes('-beta')) {
  console.log(`[postpublish] ${pkg.version} is itself a beta prerelease, already published under the beta tag — nothing to sync.`);
  process.exit(0);
}

const spec = `${pkg.name}@${pkg.version}`;
console.log(`[postpublish] syncing beta dist-tag -> ${spec}`);
execSync(`npm dist-tag add ${spec} beta`, { stdio: 'inherit' });
