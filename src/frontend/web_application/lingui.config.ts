export default {
  catalogs: [
    {
      path: '<rootDir>/locale/{locale}/messages',
      include: ['src'],
      exclude: ['**/node_modules/**'],
    },
  ],
  compileNamespace: 'ts',
  extractBabelOptions: {
    presets: [
      ['@babel/preset-env', { modules: 'auto', targets: { node: 'current' } }],
      '@babel/preset-react',
      '@babel/preset-typescript',
    ],
    plugins: [
      'babel-plugin-dynamic-import-node',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      ['@babel/plugin-proposal-class-properties', { loose: true }],
    ],
  },
  // compilerBabelOptions: {},
  fallbackLocales: {
    default: 'en',
  },
  format: 'minimal',
  locales: ['de', 'en', 'es', 'fr'],
  // extractors: [],
  // orderBy: 'messageId',
  // pseudoLocale: '',
  // rootDir: '.',
  // runtimeConfigModule: ['@lingui/core', 'i18n'],
  sourceLocale: 'en',
};
