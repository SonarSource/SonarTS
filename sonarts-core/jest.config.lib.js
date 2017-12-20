const config = require("./jest.config");

module.exports = {
  ...config,
  moduleDirectories: ["node_modules", "<rootDir>/lib"],
};
