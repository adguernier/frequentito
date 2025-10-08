import { login } from "./helpers/login";
import { test, expect } from "@playwright/test";
import { supabase } from "./helpers/supabaseClient";

test.beforeEach(async () => {
  // Clean up test data
  await supabase.from("presences").delete().not("id", "is", null);
  await supabase.from("push_subscriptions").delete().not("id", "is", null);
});

test.describe("User profile", () => {
  test("user can update profile information", async ({ page }) => {
    // Log in first
    await login(page);

    // Navigate to profile page
    await page.goto("/profile");

    // Verify we're on the profile page
    await expect(page.getByText("Your profile")).toBeVisible();

    // Get the current input values
    const firstNameInput = page.getByLabel("First name");
    const lastNameInput = page.getByLabel("Last name");

    // Clear and fill with new values
    await firstNameInput.clear();
    await firstNameInput.fill("UpdatedFirst");

    await lastNameInput.clear();
    await lastNameInput.fill("UpdatedLast");

    // Submit the form
    await page.getByRole("button", { name: "Save" }).click();

    // Wait for success message
    await expect(page.getByText("Saved!")).toBeVisible({ timeout: 10000 });

    // Verify the form still shows the updated values
    await expect(firstNameInput).toHaveValue("UpdatedFirst");
    await expect(lastNameInput).toHaveValue("UpdatedLast");

    // Refresh the page to verify the data persisted
    await page.reload();
    await expect(page.getByLabel("First name")).toHaveValue("UpdatedFirst");
    await expect(page.getByLabel("Last name")).toHaveValue("UpdatedLast");
  });
});
