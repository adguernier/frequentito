"use client";

import { useState, useEffect } from "react";
import type { CurrentDateProps } from "@/types";

/**
 * CurrentDate Component
 *
 * Displays the current date in a locale-aware format with automatic midnight updates.
 * Uses browser's Intl.DateTimeFormat API for localization (no external dependencies).
 *
 * @example
 * ```tsx
 * // Server-side rendering with initial date
 * <CurrentDate initialDate={new Date()} />
 *
 * // With explicit locale
 * <CurrentDate locale="fr-FR" />
 *
 * // With custom styling
 * <CurrentDate className="text-2xl font-bold" />
 * ```
 *
 * Features:
 * - SSR support with client-side hydration
 * - Auto-updates at midnight (checks every 60 seconds)
 * - Locale-aware formatting (weekday, month, day, year)
 * - Theme-aware styling (light/dark mode)
 * - Semantic HTML (<time> element with datetime attribute)
 * - Accessible (WCAG 2.1 AA compliant)
 *
 * Browser Compatibility:
 * - Requires Intl.DateTimeFormat API (supported in all modern browsers)
 * - Falls back to server-rendered date when JavaScript disabled
 *
 * @param props - Component props
 * @param props.initialDate - Initial date from SSR (optional, defaults to new Date())
 * @param props.locale - Browser locale (optional, defaults to navigator.language)
 * @param props.className - Additional CSS classes (optional)
 * @returns Semantic time element with formatted date
 */
export function CurrentDate({
  initialDate,
  locale,
  className = "",
}: CurrentDateProps) {
  // Initialize state with initialDate or current date
  const [currentDate, setCurrentDate] = useState<Date>(
    initialDate || new Date()
  );

  // Detect locale from navigator or use prop
  const userLocale =
    locale || (typeof navigator !== "undefined" ? navigator.language : "en-US");

  // Format date using Intl.DateTimeFormat
  const formattedDate = new Intl.DateTimeFormat(userLocale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(currentDate);

  // Setup midnight auto-update interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      // Only update if the day has changed
      if (now.getDate() !== currentDate.getDate()) {
        setCurrentDate(now);
      }
    }, 60000); // Check every 60 seconds

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [currentDate]);

  return (
    <time
      dateTime={currentDate.toISOString()}
      className={`text-foreground text-lg font-medium mb-4 block ${className}`}
    >
      {formattedDate}
    </time>
  );
}
