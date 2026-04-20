export default {
    testEnvironment: 'node',
    transform: {},
    testMatch: [
        '**/tests/**/*.test.js'
    ],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1'
    },
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'src/services/**/*.js',
        'src/controllers/**/*.js',
        'src/middleware/**/*.js',
        '!src/**/*.test.js'
    ],
    coverageThreshold: {
        global: {
            statements: 50,
            branches: 40,
            functions: 50,
            lines: 50
        }
    }
};