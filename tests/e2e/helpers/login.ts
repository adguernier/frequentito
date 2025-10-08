import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/**
 * Login helper for Playwright tests
 * @param page - Playwright page instance
 * @param email - User email (defaults to user1@marmelab.com)
 * @param password - User password (defaults to testuser)
 */
export async function login(
  page: Page,
  email = "user1@marmelab.com",
  password = "testuser"
) {
  await page.goto("/login");
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.getByRole("button", { name: "Log in" }).click();

  // Wait for successful login by checking we land on the presence page
  await expect(
    page.getByRole("heading", { name: "Today I am coming..." })
  ).toBeVisible();
}
