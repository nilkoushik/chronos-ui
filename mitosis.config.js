module.exports = {
  files: 'src/components/**',
  targets: ['react', 'svelte', 'webcomponent'],
  dest: 'dist',
  options: {
    react: {
      typescript: true,
      stylesType: 'style-tag'
    },
    svelte: {
      typescript: true
    },
    webcomponent: {
      typescript: true
    }
  }
};
