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
    // Publish @chronos-ui/core, the deprecated compat wrapper that forwards
    // to @contentvidya/ui, pinned to the exact version just published above.
    // Kept as its own step (not folded into @semantic-release/npm) because
    // it's a second, separate package living in compat/chronos-ui-core.
    ['@semantic-release/exec', {
      publishCmd: 'NEXT_RELEASE_VERSION=${nextRelease.version} node scripts/publish-compat-wrapper.js'
    }],
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
