module.exports = {
  "roots": [
    "<rootDir>/src"
  ],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
  "testRegex": "/src/.*.spec.ts?$",
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
    "node"
  ],
  "resetMocks": true,
  "verbose": true,
  "collectCoverage": true,
  "coverageThreshold": {
    "global": {
      "branches": 100,
      "functions": 100,
      "lines": 100,
      "statements": 0
    }
  },
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/server.ts",
    "!**/node_modules/**",
    "!**/coverage/**",
  ]
}