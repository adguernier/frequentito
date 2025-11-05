import { test, expect } from "@playwright/test";

test.describe("Current Date Display", () => {
  test.describe("Date is visible on homepage", () => {
    test("should display date element on homepage", async ({ page }) => {
      await page.goto("/");

      // Navigate to homepage and check date element exists
      const dateElement = page.locator("time");
      await expect(dateElement).toBeVisible();
    });

    test("should display date above presence form", async ({ page }) => {
      await page.goto("/");

      const dateElement = page.locator("time");
      const presenceForm = page.locator("form").first();

      // Get bounding boxes to verify DOM order
      const dateBox = await dateElement.boundingBox();
      const formBox = await presenceForm.boundingBox();

      expect(dateBox).not.toBeNull();
      expect(formBox).not.toBeNull();

      // Date should be above form (smaller Y coordinate)
      expect(dateBox!.y).toBeLessThan(formBox!.y);
    });

    test("should display date in correct format", async ({ page }) => {
      await page.goto("/");

      const dateElement = page.locator("time");
      const dateText = await dateElement.textContent();

      // Verify format matches "Tuesday, November 5, 2025" pattern
      // Pattern: Weekday, Month Day, Year
      expect(dateText).toMatch(/\w+,\s\w+\s\d{1,2},\s\d{4}/);
    });
  });

  test.describe("Semantic HTML and accessibility", () => {
    test("should have time element with datetime attribute", async ({
      page,
    }) => {
      await page.goto("/");

      const timeElement = page.locator("time");
      await expect(timeElement).toBeVisible();

      const datetimeAttr = await timeElement.getAttribute("datetime");
      expect(datetimeAttr).not.toBeNull();
    });

    test("should have valid ISO 8601 datetime attribute", async ({ page }) => {
      await page.goto("/");

      const timeElement = page.locator("time");
      const datetimeAttr = await timeElement.getAttribute("datetime");

      // Verify ISO 8601 format (e.g., "2025-11-05T00:00:00.000Z")
      expect(datetimeAttr).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    test("should have human-readable text content", async ({ page }) => {
      await page.goto("/");

      const timeElement = page.locator("time");
      const textContent = await timeElement.textContent();

      // Should have meaningful text (not empty, not just numbers)
      expect(textContent).toBeTruthy();
      expect(textContent!.length).toBeGreaterThan(10);
      // Should contain at least one letter (month or weekday name)
      expect(textContent).toMatch(/[a-zA-Z]/);
    });
  });

  test.describe("Theme support", () => {
    test("should be visible in light theme", async ({ page }) => {
      await page.goto("/");

      // Set light theme (add data-theme or class based on your theme implementation)
      await page.evaluate(() => {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      });

      const timeElement = page.locator("time");
      await expect(timeElement).toBeVisible();

      // Verify element has text
      const text = await timeElement.textContent();
      expect(text).toBeTruthy();
    });

    test("should be visible in dark theme", async ({ page }) => {
      await page.goto("/");

      // Set dark theme
      await page.evaluate(() => {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
      });

      const timeElement = page.locator("time");
      await expect(timeElement).toBeVisible();

      // Verify element has text
      const text = await timeElement.textContent();
      expect(text).toBeTruthy();
    });

    test("should have sufficient contrast in both themes", async ({ page }) => {
      await page.goto("/");

      const timeElement = page.locator("time");

      // Light theme contrast check
      await page.evaluate(() => {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      });

      const lightColor = await timeElement.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      expect(lightColor).toBeTruthy();

      // Dark theme contrast check
      await page.evaluate(() => {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
      });

      const darkColor = await timeElement.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });
      expect(darkColor).toBeTruthy();

      // Colors should be different in light vs dark theme
      expect(lightColor).not.toBe(darkColor);
    });
  });

  test.describe("Date updates at midnight", () => {
    test("should update date when day changes", async ({ page }) => {
      // Mock system time to 11:59 PM
      const testDate = new Date("2025-11-05T23:59:00");
      await page.clock.install({ time: testDate });

      await page.goto("/");

      const timeElement = page.locator("time");
      const initialText = await timeElement.textContent();

      // Fast-forward 70 seconds (past midnight + interval check)
      await page.clock.fastForward(70000);

      // Wait for potential update
      await page.waitForTimeout(100);

      const updatedText = await timeElement.textContent();

      // Text should have changed (day changed from 5th to 6th)
      expect(updatedText).not.toBe(initialText);
      expect(updatedText).toContain("6"); // Should now show 6th
    });

    test("should auto-update without page reload", async ({ page }) => {
      // Mock system time close to midnight
      const testDate = new Date("2025-11-05T23:59:30");
      await page.clock.install({ time: testDate });

      await page.goto("/");

      const timeElement = page.locator("time");
      const initialDatetime = await timeElement.getAttribute("datetime");

      // Fast-forward past midnight
      await page.clock.fastForward(70000);

      // Wait for update
      await page.waitForTimeout(100);

      const updatedDatetime = await timeElement.getAttribute("datetime");

      // Datetime attribute should have updated
      expect(updatedDatetime).not.toBe(initialDatetime);
      expect(updatedDatetime).toContain("2025-11-06"); // Next day
    });
  });

  test.describe("Locale-specific formats", () => {
    test("should display date in English (US) format", async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "language", {
          get: () => "en-US",
          configurable: true,
        });
      });

      await page.goto("/");

      const timeElement = page.locator("time");
      const dateText = await timeElement.textContent();

      // English format: "Tuesday, November 5, 2025"
      expect(dateText).toMatch(/\w+,\s\w+\s\d{1,2},\s\d{4}/);
      expect(dateText).toContain("November");
    });

    test("should display date in French format", async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "language", {
          get: () => "fr-FR",
          configurable: true,
        });
      });

      await page.goto("/");

      const timeElement = page.locator("time");
      const dateText = await timeElement.textContent();

      // French format: "mardi 5 novembre 2025"
      expect(dateText).toMatch(/\w+\s\d{1,2}\s\w+\s\d{4}/);
      expect(dateText).toContain("novembre");
    });

    test("should display date in German format", async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "language", {
          get: () => "de-DE",
          configurable: true,
        });
      });

      await page.goto("/");

      const timeElement = page.locator("time");
      const dateText = await timeElement.textContent();

      // German format: "Dienstag, 5. November 2025"
      expect(dateText).toMatch(/\w+,\s\d{1,2}\.\s\w+\s\d{4}/);
      expect(dateText).toContain("November");
    });

    test("should display date in Spanish format", async ({ page }) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "language", {
          get: () => "es-ES",
          configurable: true,
        });
      });

      await page.goto("/");

      const timeElement = page.locator("time");
      const dateText = await timeElement.textContent();

      // Spanish format: "martes, 5 de noviembre de 2025"
      expect(dateText).toMatch(/\w+,\s\d{1,2}\sde\s\w+\sde\s\d{4}/);
      expect(dateText).toContain("noviembre");
    });
  });
});
