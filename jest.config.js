module.exports = {
  preset: "@vue/cli-plugin-unit-jest",
  setupFiles: ["<rootDir>/tests/unit/setupGlobalMocks.js"],
  moduleNameMapper: {
    ".+\\.svg\\?inline$": require.resolve("jest-transform-stub"),
  },
};
