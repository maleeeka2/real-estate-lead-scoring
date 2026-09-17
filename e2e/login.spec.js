const { test, expect } = require("@playwright/test");

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL;
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;

test.describe("Authentication Tests", () => {

    test("Login page validates required fields", async ({ page }) => {
        await page.goto("/login");

        await expect(
            page.getByRole("heading", { name: "Agency Login" })
        ).toBeVisible();

        await page.getByRole("button", { name: "Log In" }).click();

        await expect(
            page.getByText("Email is required")
        ).toBeVisible();

        await expect(
            page.getByText("Password is required")
        ).toBeVisible();
    });


    test("Invalid login shows error message", async ({ page }) => {
        await page.goto("/login");

        await page.getByLabel("Email").fill("invalid@example.com");
        await page.getByLabel("Password").fill("WrongPassword123!");

        await page.getByRole("button", { name: "Log In" }).click();

        await expect(
            page.locator('[role="status"]').filter({
                hasText: /invalid|incorrect|failed|credentials/i
            })
        ).toBeVisible({
            timeout: 15000
        });
    });


    test("Super Admin login page validates required fields", async ({ page }) => {
        await page.goto("/platform/login");

        await expect(
            page.getByRole("heading", { name: "Super Admin Login" })
        ).toBeVisible();

        await page.getByRole("button", { name: "Sign In" }).click();

        await expect(
            page.getByText("Email is required")
        ).toBeVisible();

        await expect(
            page.getByText("Password is required")
        ).toBeVisible();
    });


    test("Super Admin can login successfully", async ({ page }) => {
        await page.goto("/platform/login");

        await page.getByLabel("Email").fill(SUPER_ADMIN_EMAIL);
        await page.getByLabel("Password").fill(SUPER_ADMIN_PASSWORD);

        await page.getByRole("button", { name: "Sign In" }).click();

        await expect(page).toHaveURL(/\/platform/, {
            timeout: 15000
        });

        await expect(
            page.getByText(/Platform|Dashboard|Agency/i).first()
        ).toBeVisible({
            timeout: 15000
        });
    });

});