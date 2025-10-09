import { login } from "./helpers/login";
import { createPresenceForUser } from "./fixtures/createPresenceForUser";
import { test, expect } from "@playwright/test";
import { supabase } from "./helpers/supabaseClient";
import { getUserId } from "./helpers/user";

test.beforeEach(async () => {
  // Use a broad filter to match all rows; PostgREST requires a filter on delete.
  await supabase.from("presences").delete().not("id", "is", null);
  await supabase.from("push_subscriptions").delete().not("id", "is", null);
});

// disable parallel execution to avoid conflicts on test data
test.describe.configure({ mode: "serial" });

test.describe("Presence submission", () => {
  test("user can submit presence and view locked state", async ({ page }) => {
    // Use login helper instead of inline code
    await login(page);

    // Choose a presence option and save
    const morning = page.getByRole("button", { name: "In morning" });
    await morning.click();
    await expect(morning).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "Save" }).click();

    // Locked view should appear, and Save should disappear
    await expect(
      page.getByRole("button", { name: "Update my presence" })
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: "Save" })).toHaveCount(0);

    // Buttons remain visible in locked state but disabled
    await expect(morning).toBeVisible();
  });

  test("form is locked when user has already sent presence for today", async ({
    page,
  }) => {
    // Get the user ID for user1@marmelab.com from seeded data
    const userId = await getUserId("user1@marmelab.com");

    if (!userId) {
      throw new Error("Test user user1@marmelab.com not found in seeded data");
    }

    // Pre-insert a presence record for today (morning only)
    await createPresenceForUser(userId, true, false);

    // Log in and navigate to presence page
    await login(page);

    // Form should be locked - Update button should be visible, Save should not
    await expect(
      page.getByRole("button", { name: "Update my presence" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Save" })).toHaveCount(0);

    // Morning button should be selected and disabled
    const morning = page.getByRole("button", { name: "In morning" });
    await expect(morning).toHaveAttribute("aria-pressed", "true");
    await expect(morning).toBeDisabled();

    // Other buttons should be unselected and disabled
    const afternoon = page.getByRole("button", { name: "In afternoon" });
    const notComing = page.getByRole("button", { name: "Not coming" });
    await expect(afternoon).toHaveAttribute("aria-pressed", "false");
    await expect(afternoon).toBeDisabled();
    await expect(notComing).toHaveAttribute("aria-pressed", "false");
    await expect(notComing).toBeDisabled();
  });

  test("user can update presence after sending it for the day", async ({
    page,
  }) => {
    // Get the user ID for user1@marmelab.com from seeded data
    const userId = await getUserId("user1@marmelab.com");

    if (!userId) {
      throw new Error("Test user user1@marmelab.com not found in seeded data");
    }

    // Pre-insert a presence record for today (morning only)
    await createPresenceForUser(userId, true, false);

    // Log in and navigate to presence page
    await login(page);

    // Verify we start in locked state with morning selected
    await expect(
      page.getByRole("button", { name: "Update my presence" })
    ).toBeVisible();
    const morning = page.getByRole("button", { name: "In morning" });
    await expect(morning).toHaveAttribute("aria-pressed", "true");
    await expect(morning).toBeDisabled();

    // Click "Update my presence" to unlock the form
    await page.getByRole("button", { name: "Update my presence" }).click();

    // Form should now be unlocked - Save button should appear, Update should disappear
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Update my presence" })
    ).toHaveCount(0);

    // Buttons should now be enabled and interactive
    await expect(morning).not.toBeDisabled();
    const afternoon = page.getByRole("button", { name: "In afternoon" });
    await expect(afternoon).not.toBeDisabled();

    // Change selection - add afternoon to the existing morning selection
    await afternoon.click();
    await expect(afternoon).toHaveAttribute("aria-pressed", "true");

    // Morning should still be selected
    await expect(morning).toHaveAttribute("aria-pressed", "true");

    // Save the updated presence
    await page.getByRole("button", { name: "Save" }).click();

    // Should return to locked state with both morning and afternoon selected
    await expect(
      page.getByRole("button", { name: "Update my presence" })
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: "Save" })).toHaveCount(0);

    // Both morning and afternoon should be selected and disabled
    await expect(morning).toHaveAttribute("aria-pressed", "true");
    await expect(morning).toBeDisabled();
    await expect(afternoon).toHaveAttribute("aria-pressed", "true");
    await expect(afternoon).toBeDisabled();

    // Not coming should be unselected and disabled
    const notComing = page.getByRole("button", { name: "Not coming" });
    await expect(notComing).toHaveAttribute("aria-pressed", "false");
    await expect(notComing).toBeDisabled();
  });
});

test.describe("Presence list", () => {
  test("presence list is updated after user submits presence", async ({
    page,
  }) => {
    // Log in as user1@marmelab.com
    await login(page);

    // Submit morning presence
    const morning = page.getByRole("button", { name: "In morning" });
    await morning.click();
    await expect(morning).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "Save" }).click();

    // Wait for the form to be locked (indicating save completed)
    await expect(
      page.getByRole("button", { name: "Update my presence" })
    ).toBeVisible({ timeout: 10000 });

    // Verify the presence list appears using the specific test ID
    const presenceList = page.getByTestId("presence-list");
    await expect(presenceList).toBeVisible();

    // Find the user in the list by their name
    const userListItem = page
      .getByRole("listitem")
      .filter({ hasText: "User1 Demo" });
    await expect(userListItem).toBeVisible();

    // Check for AM chip within the user's list item using getByText
    await expect(userListItem.getByText("AM")).toBeVisible();

    // Ensure PM chip is not present for this user
    await expect(userListItem.getByText("PM")).toHaveCount(0);

    // Ensure the user is not greyed out (since they are coming)
    await expect(userListItem).not.toHaveClass(/opacity-50/);
  });

  test("presence list shows user as 'not coming' with greyed out styling", async ({
    page,
  }) => {
    // Log in as user1@marmelab.com
    await login(page);

    // Submit "not coming" presence
    const notComing = page.getByRole("button", { name: "Not coming" });

    // Initially, when no presence is set, "Not coming" should be selected by default
    await expect(notComing).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: "Save" }).click();

    // Wait for the form to be locked
    await expect(
      page.getByRole("button", { name: "Update my presence" })
    ).toBeVisible({ timeout: 10000 });

    // Verify the presence list appears using the specific test ID
    const presenceList = page.getByTestId("presence-list");
    await expect(presenceList).toBeVisible();

    // Find the user in the list by their name
    const userListItem = page
      .getByRole("listitem")
      .filter({ hasText: "User1 Demo" });
    await expect(userListItem).toBeVisible();

    // Check for "Not coming" chip
    await expect(userListItem.getByText("Not coming")).toBeVisible();

    // Ensure AM and PM chips are not present
    await expect(userListItem.getByText("AM")).toHaveCount(0);
    await expect(userListItem.getByText("PM")).toHaveCount(0);

    // Verify the user is greyed out (opacity-50 class)
    await expect(userListItem).toHaveClass(/opacity-50/);
  });
});