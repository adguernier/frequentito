import { test, expect } from "@playwright/test";
import { login } from "./helpers/login";

test.describe("Login", () => {
  test("logs in and shows presence page", async ({ page }) => {
    await login(page);
  });
});
