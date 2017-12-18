module.exports = {
  globals: {
    "ts-jest": {
      skipBabel: true,
      tsConfigFile: "tests/tsconfig.empty.json",
    },
  },
  mapCoverage: true,
  moduleFileExtensions: ["js", "ts"],
  transform: {
    "^.+\\.ts$": "<rootDir>/node_modules/ts-jest/preprocessor.js",
  },
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
};
