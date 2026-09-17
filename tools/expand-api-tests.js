const { defineConfig } = require("@playwright/test");

module.exports = defineConfig({
    testDir: "./e2e",

    use: {
        baseURL: "https://real-estate-lead-scoring.vercel.app",
        headless: true,
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        trace: "retain-on-failure"
    },

    reporter: [
        ["list"],
        ["html", { outputFolder: "playwright-report", open: "never" }]
    ],

    timeout: 30000
});