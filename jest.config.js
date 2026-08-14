import nextJest from 'next/jest.js'; 
import { createRequire } from 'module'; 

const require = createRequire(import.meta.url); 
const createJestConfig = nextJest({ dir: './', }); 

/** @type {import('jest').Config} */ 
const config = { 
  coverageProvider: 'v8', 
  testEnvironment: 'node', 
  // Adding this property to exclude Playwright end-to-end tests
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/'
  ],
  moduleNameMapper: { 
    '^@/(.*)$': '<rootDir>/src/$1', 
    '^bson$': require.resolve('bson'), 
  }, 
}; 

export default createJestConfig(config);
