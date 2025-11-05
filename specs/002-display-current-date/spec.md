# Feature Specification: Display Current Date on Homepage

**Feature Branch**: `002-display-current-date`  
**Created**: 2025-11-05  
**Status**: Draft  
**Input**: User description: "add the current date in the homepage so the user can see for which day he send its presence"

## Clarifications

### Session 2025-11-05

- Q: Where exactly should the date be positioned relative to the presence form? → A: Above the form with left alignment, acting as a section header
- Q: How should the system detect and trigger the midnight date update for users who keep the page open? → A: Client-side interval check (every 1 minute)
- Q: What should be displayed when JavaScript is disabled or fails to load? → A: Show server-rendered static date (no auto-update)

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Current Date Context (Priority: P1)

Users need to see what day they are submitting their presence for to avoid confusion about whether they're marking attendance for today, tomorrow, or a past date.

**Why this priority**: This is critical for user confidence and preventing errors. Without a clear date indicator, users might accidentally submit presence for the wrong day, especially around midnight or when accessing the app at different times.

**Independent Test**: Can be fully tested by opening the homepage and verifying the current date is prominently displayed. Delivers immediate value by providing date context for presence submission.

**Acceptance Scenarios**:

1. **Given** a user opens the homepage on November 5, 2025 at 10:00 AM, **When** the page loads, **Then** the current date "November 5, 2025" (or localized format) is clearly visible near the presence submission form
2. **Given** a user opens the homepage at 11:59 PM, **When** the clock strikes midnight, **Then** the displayed date automatically updates to the next day without requiring a page refresh
3. **Given** a user in a different timezone opens the homepage, **When** the page loads, **Then** the date displayed matches the user's local timezone
4. **Given** a user has already submitted their presence for today, **When** they view the homepage, **Then** the current date is still displayed so they can confirm which day their submission applies to

---

### User Story 2 - Date Format Localization (Priority: P2)

Users should see the date in a format familiar to their locale (e.g., "5 novembre 2025" for French users, "November 5, 2025" for English users) to improve readability and reduce cognitive load.

**Why this priority**: While not critical for basic functionality, localized date formats significantly improve user experience for international teams. This is a quality-of-life improvement that should be addressed after the basic date display is working.

**Independent Test**: Can be tested by switching browser language settings and verifying the date format changes accordingly. Delivers value by making the interface more intuitive for non-English users.

**Acceptance Scenarios**:

1. **Given** a user with browser language set to English (US), **When** they view the homepage, **Then** the date displays as "November 5, 2025" or "Tuesday, November 5, 2025"
2. **Given** a user with browser language set to French, **When** they view the homepage, **Then** the date displays as "5 novembre 2025" or "mardi 5 novembre 2025"
3. **Given** a user with browser language set to a format that uses DD/MM/YYYY, **When** they view the homepage, **Then** the date displays in their expected format (e.g., "05/11/2025")

---

### Edge Cases

- What happens when the user's system clock is incorrect? The date should still display based on the client's system time, but presence submission validation should occur server-side using UTC.
- What happens at midnight? The date should update automatically without requiring a page refresh (if the page is already open).
- What happens for users in different timezones? The displayed date should match the user's local timezone, but the system should track presence based on a consistent timezone (UTC) server-side.
- What happens if JavaScript fails to load? The date will display as a server-rendered static date (showing the date at page load time) but will not auto-update at midnight.
- What happens on mobile devices with small screens? The date should remain visible and not overlap with the presence submission form.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display the current date above the presence submission form with left alignment, acting as a section header
- **FR-002**: System MUST format the date in a human-readable format including day of week, month name, day number, and year (e.g., "Tuesday, November 5, 2025")
- **FR-003**: System MUST update the displayed date automatically when the date changes (at midnight) using a client-side interval check every 1 minute, without requiring user action
- **FR-004**: System MUST display the date in the user's browser locale format when possible
- **FR-005**: System MUST ensure the date is visible on both mobile and desktop viewports
- **FR-006**: System MUST render the date with sufficient contrast ratio for accessibility (4.5:1 minimum for text)
- **FR-007**: System MUST support both light and dark theme modes without compromising date visibility
- **FR-008**: System MUST provide the date in a semantic HTML element (e.g., `<time>` tag with datetime attribute)
- **FR-009**: System MUST render a server-side static date as fallback when JavaScript is disabled or fails to load (date will not auto-update at midnight in this scenario)

### Assumptions

- The current presence submission system uses UTC date internally for consistency across timezones
- Users expect to see their local date, not UTC date, for context
- The homepage is already responsive and supports mobile devices
- The application already has theme support (light/dark mode)
- Users access the application primarily during business hours (not frequently at midnight)

### Key Entities

**Date Display Component**: Represents the visual presentation of the current date on the homepage

- Current date (derived from browser or server)
- Format preference (locale-based)
- Display position (relative to presence form)
- Theme-aware styling (light/dark mode)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of users can identify what day they are submitting presence for within 2 seconds of viewing the homepage
- **SC-002**: Date display renders in under 100ms on initial page load
- **SC-003**: Zero user-reported incidents of submitting presence for the wrong day due to date confusion
- **SC-004**: Date display maintains WCAG 2.1 AA compliance (4.5:1 contrast ratio) in both light and dark modes
- **SC-005**: Date format matches user's browser locale in at least 95% of supported languages
- **SC-006**: Date updates automatically at midnight for users who keep the page open overnight (measurable via client-side logging if implemented)

### Constitution Compliance Targets

- **Accessibility**: WCAG 2.1 AA compliance verified with Storybook a11y addon (contrast, semantic HTML, screen reader support)
- **Code Quality**: Zero ESLint errors, TypeScript strict mode, component interface clearly defined
- **Testing Coverage**: E2E test for date display on homepage, Storybook story for date component with dark/light theme variants
- **Performance**: Date component renders without impacting Core Web Vitals (LCP < 2.5s, CLS < 0.1)
- **UX Consistency**: Uses HeroUI typography components, supports theme switching, follows existing design patterns
