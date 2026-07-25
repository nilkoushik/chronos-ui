module.exports = {
  default: {
    requireModule: [],
    require: ['tests/bdd/support/**/*.js', 'tests/bdd/steps/**/*.js'],
    paths: ['tests/bdd/features/**/*.feature'],
    format: ['progress-bar'],
    publishQuiet: true
  }
};
