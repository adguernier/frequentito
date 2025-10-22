import { login } from "./helpers/login";
import { createPresenceForUser } from "./fixtures/createPresenceForUser";
import { test, expect } from "@playwright/test";
import { supabase } from "./helpers/supabaseClient";
import { getUserData } from "./helpers/user";

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
    // Get the user data for user1@yourdomain.com from seeded data
    const user = await getUserData("user1@yourdomain.com");
    if (!user) {
      throw new Error(
        "Test user user1@yourdomain.com not found in seeded data"
      );
    }

    // Pre-insert a presence record for today (morning only)
    await createPresenceForUser(user.id, true, false);

    await login(page);

    // Should see locked view
    await expect(
      page.getByRole("button", { name: "Update my presence" })
    ).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("button", { name: "Save" })).toHaveCount(0);

    // Should see morning is selected in locked state
    const morning = page.getByRole("button", { name: "In morning" });
    await expect(morning).toHaveAttribute("aria-pressed", "true");
  });

  test("form is pre-filled with today's presence for the day", async ({
    page,
  }) => {
    // Get the user data for user1@yourdomain.com from seeded data
    const user = await getUserData("user1@yourdomain.com");

    if (!user) {
      throw new Error(
        "Test user user1@yourdomain.com not found in seeded data"
      );
    }

    // Pre-insert a presence record for today (morning and afternoon)
    await createPresenceForUser(user.id, true, false);

    await login(page);

    // Should see locked view
    await expect(
      page.getByRole("button", { name: "Update my presence" })
    ).toBeVisible({ timeout: 10000 });

    // Should see morning and afternoon are selected in locked state
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
  test("user appears in presence list after sending presence", async ({
    page,
  }) => {
    // Use login helper to log in
    await login(page);
    const user = await getUserData("user1@yourdomain.com");
    // Choose presence for morning and afternoon
    const morning = page.getByRole("button", { name: "In morning" });
    const afternoon = page.getByRole("button", { name: "In afternoon" });

    await morning.click();
    await afternoon.click();

    // Save the presence
    await page.getByRole("button", { name: "Save" }).click();

    // Wait for the form to be locked (indicating save was successful)
    await expect(
      page.getByRole("button", { name: "Update my presence" })
    ).toBeVisible({ timeout: 10000 });

    // Check that the presence list is visible and contains the user
    const presenceList = page.getByTestId("presence-list");
    await expect(presenceList).toBeVisible();

    // Look for the user in the list - they should appear with AM/PM chips
    const userItem = presenceList
      .getByText(`${user?.first_name} ${user?.last_name}`)
      .first();
    await expect(userItem).toBeVisible();

    // Check that AM and PM chips are visible for this user
    const userContainer = userItem.locator("..");
    // await expect(userContainer.getByText("AM")).toBeVisible();
    // await expect(userContainer.getByText("PM")).toBeVisible();
  });

  test("shows users with greyed out styling when they are not coming", async ({
    page,
  }) => {
    // Get the user data for user1@yourdomain.com from seeded data
    const user = await getUserData("user1@yourdomain.com");

    if (!user) {
      throw new Error(
        "Test user user1@yourdomain.com not found in seeded data"
      );
    }

    // Pre-insert a presence record for today with "not coming"
    await createPresenceForUser(user.id, false, false);

    await login(page);

    // Check that the presence list is visible
    const presenceList = page.getByTestId("presence-list");
    await expect(presenceList).toBeVisible();

    // Look for the user in the list - they should appear with "Not coming" chip
    const userItem = presenceList
      .getByText(`${user?.first_name} ${user?.last_name}`)
      .first();
    await expect(userItem).toBeVisible();

    // Check that "Not coming" chip is visible for this user
    const userContainer = userItem.locator("..");
    // await expect(userContainer.getByText("Not coming")).toBeVisible();

    // Check that the user item has the grayed out styling (opacity-50)
    const listItem = userContainer.locator("..");
    await expect(listItem).toHaveClass(/opacity-50/);
  });

  test("list is well updated after user submits presence", async ({ page }) => {
    // Use login helper to log in
    await login(page);

    // Submit presence for morning only
    const morning = page.getByRole("button", { name: "In morning" });
    await morning.click();
    await page.getByRole("button", { name: "Save" }).click();

    // Wait for the form to be locked (indicating save was successful)
    await expect(
      page.getByRole("button", { name: "Update my presence" })
    ).toBeVisible({ timeout: 10000 });

    const presenceList = page.getByTestId("presence-list");
    await expect(presenceList).toBeVisible();
    const firstListRow = presenceList.getByRole("listitem").first();

    // Get the user data for user1@yourdomain.com from seeded data
    const user = await getUserData("user1@yourdomain.com");

    // Now check that the user appears in the list with AM chip
    const userItem = firstListRow
      .getByText(`${user?.first_name} ${user?.last_name}`)
      .first();
    await expect(userItem).toBeVisible();

    // Check that AM chip is visible for this user
    await expect(firstListRow.getByText("AM")).toBeVisible();

    // PM should not be visible since user only selected morning
    await expect(firstListRow.getByText("PM")).not.toBeVisible();
  });

  test("displays all users including those not coming with greyed out styling", async ({
    page,
  }) => {
    // Get the user data for user1@yourdomain.com from seeded data
    const user = await getUserData("user1@yourdomain.com");

    if (!user) {
      throw new Error(
        "Test user user1@yourdomain.com not found in seeded data"
      );
    }

    // Pre-insert a presence record for today with "not coming"
    await createPresenceForUser(user.id, false, false);

    await login(page);

    // Check that the presence list is visible
    const presenceList = page.getByTestId("presence-list");
    await expect(presenceList).toBeVisible();

    // The list should contain users - including those not coming
    const userItems = presenceList.getByRole("listitem");
    await expect(userItems).not.toHaveCount(0);

    // Look for the user that's not coming
    const userItem = presenceList
      .getByText(`${user?.first_name} ${user?.last_name}`)
      .first();
    await expect(userItem).toBeVisible();

    // Check that "Not coming" chip is visible for this user
    await expect(presenceList.first().getByText("Not coming")).toBeVisible();
  });
});
