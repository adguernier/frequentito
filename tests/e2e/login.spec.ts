import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test("logs in and shows presence page", async ({ page }) => {
    // Navigate to login page using baseURL from Playwright config
    await page.goto("/login");

    // Fill credentials
    await page.fill('input[name="email"]', "user1@marmelab.com");
    await page.fill('input[name="password"]', "testuser");

    // Submit the form
    await page.getByRole("button", { name: "Log in" }).click();

    // Expect to land on presence page
    await expect(
      page.getByRole("heading", { name: "Today I am coming..." })
    ).toBeVisible();
  });
});
