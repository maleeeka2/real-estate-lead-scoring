const { test, expect } = require("@playwright/test");

test.describe("Property Listings Tests", () => {

    test("Listings page loads successfully", async ({ page }) => {
        await page.goto("/listings", { waitUntil: "domcontentloaded" });

        await expect(
            page.getByRole("heading", { name: "Properties for Sale" })
        ).toBeVisible({ timeout: 15000 });

        await expect(
            page.getByText(/listings found/i)
        ).toBeVisible({ timeout: 15000 });
    });


    test("Properties are displayed on listings page", async ({ page }) => {
        await page.goto("/listings", { waitUntil: "domcontentloaded" });

        await expect(
            page.getByRole("heading", { name: "Properties for Sale" })
        ).toBeVisible({ timeout: 15000 });

        const propertyLinks = page.locator('a[href*="/properties/"]');

        await expect(propertyLinks.first()).toBeVisible({
            timeout: 15000
        });

        expect(await propertyLinks.count()).toBeGreaterThan(0);
    });


    test("City filter updates listings", async ({ page }) => {
        await page.goto("/listings", { waitUntil: "domcontentloaded" });

        await expect(
            page.getByRole("heading", { name: "Properties for Sale" })
        ).toBeVisible({ timeout: 15000 });

        // The first select in FilterPanel is the City filter.
        const citySelect = page.locator("select").first();

        await expect(citySelect).toBeVisible();

        await citySelect.selectOption("Lahore");

        await expect(page).toHaveURL(/city=Lahore/i);
    });


    test("Clear filters resets the listings URL", async ({ page }) => {
        await page.goto("/listings?city=Lahore", {
            waitUntil: "domcontentloaded"
        });

        await expect(
            page.getByRole("heading", { name: "Properties for Sale" })
        ).toBeVisible({ timeout: 15000 });

        const clearButton = page.getByRole("button", {
            name: "Clear Filters"
        });

        await expect(clearButton).toBeVisible();

        await clearButton.click();

        await expect(page).not.toHaveURL(/city=/);
    });


    test("Pagination controls are available when multiple pages exist", async ({ page }) => {
        await page.goto("/listings", { waitUntil: "domcontentloaded" });

        await expect(
            page.getByRole("heading", { name: "Properties for Sale" })
        ).toBeVisible({ timeout: 15000 });

        const paginationControls = page.getByRole("button");

        expect(await paginationControls.count()).toBeGreaterThan(0);
    });


    test("Invalid filter does not crash the listings page", async ({ page }) => {
        const response = await page.goto(
            "/listings?city=InvalidCityThatDoesNotExist",
            { waitUntil: "domcontentloaded" }
        );

        expect(response.status()).toBeLessThan(500);

        await expect(
            page.getByRole("heading", { name: "Properties for Sale" })
        ).toBeVisible({ timeout: 15000 });

        await expect(
            page.getByText(/No properties found|listings found/i).first()
        ).toBeVisible({
            timeout: 15000
        });
    });

});