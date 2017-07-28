module.exports = {
  globals: {
    "ts-jest": {
      skipBabel: true,
    },
  },
  mapCoverage: true,
  moduleFileExtensions: ["js", "ts"],
  transform: {
    "^.+\\.ts$": "<rootDir>/node_modules/ts-jest/preprocessor.js",
  },
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
};
