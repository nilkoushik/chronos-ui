module.exports = {
  branches: ['main'],
  plugins: [
    // Determine the version bump (major/minor/patch) from Conventional Commit
    // messages since the last release tag.
    ['@semantic-release/commit-analyzer', {
      preset: 'conventionalcommits'
    }],
    // Build the release notes body from those same commits.
    ['@semantic-release/release-notes-generator', {
      preset: 'conventionalcommits'
    }],
    // Prepend the generated notes into CHANGELOG.md.
    '@semantic-release/changelog',
    // Bump package.json's version and `npm publish` (build runs first via
    // this repo's own "prepublishOnly" script).
    '@semantic-release/npm',
    // NOTE: releases used to also publish @chronos-ui/core, a compat wrapper
    // forwarding to this package, via an @semantic-release/exec step. That
    // stopped at 1.4.2: the rename has landed and consumers have had a
    // forwarding version to migrate from, so 1.4.3 onward ships under the new
    // brand only. @chronos-ui/core stays on npm frozen at 1.4.2 (already
    // marked deprecated) and simply receives no further versions.
    //
    // Create the GitHub Release for the new tag, with the generated notes
    // attached, at the same time the tag itself is created.
    '@semantic-release/github',
    // Commit the updated package.json/package-lock.json/CHANGELOG.md back
    // to the release branch and create the git tag.
    ['@semantic-release/git', {
      assets: ['package.json', 'package-lock.json', 'CHANGELOG.md'],
      message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
    }]
  ]
};
