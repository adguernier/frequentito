import { test, expect } from "./fixtures/testWithDb";
import { login } from "./helpers/login";

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
});
