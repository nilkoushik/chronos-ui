const g = typeof globalThis !== 'undefined' ? globalThis : {};

if (!g.__CHRONOS_UI_CORE_DEPRECATION_WARNED__) {
  g.__CHRONOS_UI_CORE_DEPRECATION_WARNED__ = true;
  // eslint-disable-next-line no-console
  console.warn(
    '[@chronos-ui/core] This package has been renamed to @contentvidya/ui. ' +
    '@chronos-ui/core is now a compatibility forwarder and will not receive new features. ' +
    'Migrate at your convenience: npm install @contentvidya/ui — see ' +
    'https://github.com/nilkoushik/chronos-ui/blob/main/docs/MIGRATION-CONTENTVIDYA.md'
  );
}

export * from '@contentvidya/ui';
