console.log('puppeter/jest.config');

module.exports = {
  preset: 'jest-puppeteer',
  rootDir: '../../',
  roots: [
    '<rootDir>/test/puppeteer',
  ],
  setupFilesAfterEnv: [
    'expect-puppeteer',
  ],
};
