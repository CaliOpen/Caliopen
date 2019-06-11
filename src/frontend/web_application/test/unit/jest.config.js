console.log('jest.config');

module.exports = {
  rootDir: '../../',
  roots: [
    '<rootDir>/src/',
    '<rootDir>/server/',
  ],
  setupFilesAfterEnv: [
    '<rootDir>/test/unit/setup.js',
  ],
  moduleNameMapper: {
    '^.+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/__mocks__/fileMock.js',
    '^.+\\.(css|less|scss)$': '<rootDir>/__mocks__/styleMock.js',
  },
  globals: {
    CALIOPEN_ENV: 'test',
    BUILD_TARGET: 'browser',
    CALIOPEN_OPTIONS: {},
  },
};
