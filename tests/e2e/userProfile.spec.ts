import { login } from "./helpers/login";
import { test, expect } from "@playwright/test";
import { supabase } from "./helpers/supabaseClient";
import { getUserData } from "./helpers/user";

// Store original user data globally for restoration
let originalUserData: any = null;

test.beforeAll(async () => {
  // Capture original user data before any tests run
  originalUserData = await getUserData("user1@yourdomain.com");
  if (!originalUserData) {
    throw new Error("Test user not found for profile restoration");
  }
});

test.beforeEach(async () => {
  // Ensure profile is in original state before each test
  if (originalUserData) {
    await supabase
      .from("profiles")
      .update({
        first_name: originalUserData.first_name,
        last_name: originalUserData.last_name,
      })
      .eq("id", originalUserData.id);
  }
});

test.afterEach(async () => {
  // Restore original profile data after each test
  if (originalUserData) {
    await supabase
      .from("profiles")
      .update({
        first_name: originalUserData.first_name,
        last_name: originalUserData.last_name,
      })
      .eq("id", originalUserData.id);
  }
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
    await firstNameInput.fill("John");

    await lastNameInput.clear();
    await lastNameInput.fill("Doe");

    // Submit the form
    await page.getByRole("button", { name: "Save" }).click();
    // Wait for success message
    await expect(page.getByText("Saved!")).toBeVisible();

    // Verify the form still shows the updated values
    await expect(firstNameInput).toHaveValue("John");
    await expect(lastNameInput).toHaveValue("Doe");

    // Refresh the page to verify the data persisted
    await page.reload();
    await expect(page.getByLabel("First name")).toHaveValue("John");
    await expect(page.getByLabel("Last name")).toHaveValue("Doe");
  });
});
