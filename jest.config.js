/** @type {import('jest').Config} */
module.exports = {
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    moduleFileExtensions: ['ts', 'js', 'json'],
    testEnvironment: 'node',
    transform: {
      '^.+\\.ts$': 'ts-jest',
    },
  };
  