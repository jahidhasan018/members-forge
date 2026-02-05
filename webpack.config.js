const defaultConfig = require('@wordpress/scripts/config/webpack.config');
const path = require('path');

module.exports = {
    ...defaultConfig,

    entry: {
        index: path.resolve(__dirname, 'assets/src/index.js'),
    },

    output: {
        ...defaultConfig.output,
        path: path.resolve(__dirname, 'assets/build'),
    },

    watchOptions: {
        // Disable polling (uses less RAM on Windows)
        poll: false,
        // Ignore folders that don't need watching
        ignored: [
            '**/node_modules/**',
            '**/vendor/**',
            '**/.git/**',
            '**/assets/build/**',
        ],
        // Wait 300ms before rebuilding after changes
        aggregateTimeout: 300,
    },
};
