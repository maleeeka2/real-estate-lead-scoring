const { test, expect } = require("@playwright/test");

test.describe("Real Estate Application - Smoke Tests", () => {

    test("Homepage loads successfully", async ({ page }) => {
        const response = await page.goto("/");

        expect(response.status()).toBeLessThan(500);

        await expect(page.locator("body")).toBeVisible();
    });

    test("Application does not show server error", async ({ page }) => {
        const response = await page.goto("/");

        expect(response.status()).toBeLessThan(500);

        await expect(page.locator("body")).not.toContainText(
            "Internal Server Error"
        );
    });

    test("Login page loads", async ({ page }) => {
        const response = await page.goto("/login");

        expect(response.status()).toBeLessThan(500);

        await expect(page.locator("body")).toBeVisible();
    });

    test("Platform login page loads", async ({ page }) => {
        const response = await page.goto("/platform/login");

        expect(response.status()).toBeLessThan(500);

        await expect(page.locator("body")).toBeVisible();
    });

});