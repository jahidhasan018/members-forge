const defaultConfig = require('@wordpress/scripts/config/jest-unit.config');

module.exports = {
    ...defaultConfig,
    // Setup file that runs after Jest is initialized
    setupFilesAfterEnv: [
        '<rootDir>/jest.setup.js',
    ],
    // Use jsdom for browser-like environment
    testEnvironment: 'jsdom',
};
