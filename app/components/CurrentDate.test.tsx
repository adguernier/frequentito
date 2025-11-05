import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CurrentDate } from "./CurrentDate";

describe("CurrentDate Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("Component rendering", () => {
    it("should render with initialDate prop", () => {
      const testDate = new Date("2025-11-05T12:00:00");
      render(<CurrentDate initialDate={testDate} />);

      const timeElement = screen.getByRole("time");
      expect(timeElement).toBeInTheDocument();
    });

    it("should render without initialDate (defaults to new Date())", () => {
      render(<CurrentDate />);

      const timeElement = screen.getByRole("time");
      expect(timeElement).toBeInTheDocument();
    });

    it("should apply custom className prop", () => {
      const customClass = "custom-date-class";
      render(<CurrentDate className={customClass} />);

      const timeElement = screen.getByRole("time");
      expect(timeElement).toHaveClass(customClass);
    });

    it("should render <time> element with correct structure", () => {
      const testDate = new Date("2025-11-05T12:00:00");
      render(<CurrentDate initialDate={testDate} />);

      const timeElement = screen.getByRole("time");
      expect(timeElement.tagName).toBe("TIME");
      expect(timeElement).toHaveAttribute("datetime");
    });
  });

  describe("Date formatting", () => {
    it("should format date using Intl.DateTimeFormat with weekday/month/day/year", () => {
      const testDate = new Date("2025-11-05T12:00:00");
      render(<CurrentDate initialDate={testDate} locale="en-US" />);

      const timeElement = screen.getByRole("time");
      const textContent = timeElement.textContent;

      // Should contain weekday, month name, day, and year
      expect(textContent).toMatch(/Tuesday.*November.*5.*2025/);
    });

    it("should use navigator.language when locale prop not provided", () => {
      // Mock navigator.language
      const originalLanguage = navigator.language;
      Object.defineProperty(navigator, "language", {
        get: () => "fr-FR",
        configurable: true,
      });

      const testDate = new Date("2025-11-05T12:00:00");
      render(<CurrentDate initialDate={testDate} />);

      const timeElement = screen.getByRole("time");
      const textContent = timeElement.textContent;

      // Should use French format
      expect(textContent).toMatch(/mardi.*novembre.*2025/i);

      // Restore original
      Object.defineProperty(navigator, "language", {
        get: () => originalLanguage,
        configurable: true,
      });
    });

    it("should respect locale prop when provided", () => {
      const testDate = new Date("2025-11-05T12:00:00");
      render(<CurrentDate initialDate={testDate} locale="de-DE" />);

      const timeElement = screen.getByRole("time");
      const textContent = timeElement.textContent;

      // Should use German format
      expect(textContent).toMatch(/Dienstag.*November.*2025/);
    });

    it("should handle invalid dates gracefully", () => {
      const invalidDate = new Date("invalid");
      render(<CurrentDate initialDate={invalidDate} />);

      // Should not crash, should render something
      const timeElement = screen.getByRole("time");
      expect(timeElement).toBeInTheDocument();
    });
  });

  describe("Midnight update logic", () => {
    it("should set up setInterval on mount", () => {
      const setIntervalSpy = vi.spyOn(global, "setInterval");

      render(<CurrentDate initialDate={new Date("2025-11-05T23:59:00")} />);

      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60000);
    });

    it("should check date every 60 seconds", () => {
      render(<CurrentDate initialDate={new Date("2025-11-05T23:59:00")} />);

      const setIntervalSpy = vi.spyOn(global, "setInterval");
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 60000);
    });

    it("should update state when date changes (different day)", async () => {
      const initialDate = new Date("2025-11-05T23:59:00");
      vi.setSystemTime(initialDate);

      render(<CurrentDate initialDate={initialDate} />);

      const timeElement = screen.getByRole("time");
      const initialText = timeElement.textContent;

      // Fast-forward to next day
      vi.setSystemTime(new Date("2025-11-06T00:01:00"));
      vi.advanceTimersByTime(60000); // Trigger interval

      await waitFor(() => {
        const updatedText = timeElement.textContent;
        expect(updatedText).not.toBe(initialText);
        expect(updatedText).toContain("6"); // Should show 6th
      });
    });

    it("should NOT update when date is same day", async () => {
      const initialDate = new Date("2025-11-05T10:00:00");
      vi.setSystemTime(initialDate);

      render(<CurrentDate initialDate={initialDate} />);

      const timeElement = screen.getByRole("time");
      const initialText = timeElement.textContent;

      // Fast-forward 60 seconds but stay on same day
      vi.setSystemTime(new Date("2025-11-05T10:01:00"));
      vi.advanceTimersByTime(60000);

      await waitFor(() => {
        const updatedText = timeElement.textContent;
        expect(updatedText).toBe(initialText); // Should NOT change
      });
    });

    it("should clean up interval on unmount (no memory leaks)", () => {
      const clearIntervalSpy = vi.spyOn(global, "clearInterval");

      const { unmount } = render(
        <CurrentDate initialDate={new Date("2025-11-05T12:00:00")} />
      );

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });
});
