import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

/**
 * Props for the CurrentDate component.
 * Displays locale-aware current date with automatic midnight updates.
 */
export interface CurrentDateProps {
  /** Initial date from SSR (optional, defaults to new Date()) */
  initialDate?: Date;
  /** Browser locale (optional, defaults to navigator.language) */
  locale?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Formatted date string with full weekday, month, day, and year.
 * Example: "Tuesday, November 5, 2025"
 */
export type FormattedDateString = string;
