import nextJest from 'next/jest.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^bson$': require.resolve('bson'),
  },
};

export default createJestConfig(config);

// import nextJest from 'next/jest.js';
// import { createRequire } from 'module';

// const require = createRequire(import.meta.url);

// const createJestConfig = nextJest({
//   // Tells Jest where to load your next.config.js and .env settings
//   dir: './',
// });

// /** @type {import('jest').Config} */
// const config = {
//   coverageProvider: 'v8',
//   testEnvironment: 'node', // ✨ Changed from jsdom to node to support Mongoose
//   moduleNameMapper: {
//     '^@/(.*)$': '<rootDir>/src/$1',
//     '^bson$': require.resolve('bson'),
//   },
// };

// export default createJestConfig(config);
