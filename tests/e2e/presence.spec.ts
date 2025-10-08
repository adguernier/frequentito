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
});
