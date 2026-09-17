const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "https://real-estate-lead-scoring.vercel.app",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    retries: {
      runMode: 1,
      openMode: 0,
    },
    setupNodeEvents(on, config) {
      return config;
    },
  },
});
