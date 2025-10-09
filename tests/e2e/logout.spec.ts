import { login } from "./helpers/login";
import { test, expect } from "@playwright/test";
import { supabase } from "./helpers/supabaseClient";

test.beforeEach(async () => {
  // Clean up test data
  await supabase.from("presences").delete().not("id", "is", null);
  await supabase.from("push_subscriptions").delete().not("id", "is", null);
});

test.describe("User logout", () => {
  test("user can log out from profile page", async ({ page }) => {
    // Log in first
    await login(page);

    // Navigate to profile page
    await page.goto("/profile");

    // Verify we're on the profile page by checking for profile-specific content
    await expect(page.getByText("Your profile")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();

    // Click the logout button
    await page.getByRole("button", { name: "Log Out" }).click();

    // Should be redirected to login page
    await expect(page).toHaveURL("/login");

    // Verify we're actually logged out by checking for login form elements
    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();

    // Try to access a protected page (private) - should redirect to login
    await page.goto("/private");
    await expect(page).toHaveURL("/login");
  });
});
