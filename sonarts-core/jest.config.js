module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "<rootDir>/tests/tsconfig.json",
    },
  },
  collectCoverageFrom: ["src/**/*.ts"],
  moduleFileExtensions: ["js", "ts"],
  testResultsProcessor: "jest-sonar-reporter",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  preset: "ts-jest",
};
