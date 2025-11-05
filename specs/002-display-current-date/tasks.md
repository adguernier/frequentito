# Tasks: Display Current Date on Homepage

**Feature Branch**: `002-display-current-date`  
**Input**: Design documents from `/specs/002-display-current-date/`  
**Prerequisites**: ✅ plan.md, ✅ spec.md, ✅ research.md, ✅ data-model.md, ✅ contracts/, ✅ quickstart.md

> **CONSTITUTION REQUIREMENT (Principle II - Testing Standards)**: Tests are MANDATORY for all user-facing features.
> E2E tests (Playwright) and component tests (Storybook + Vitest) MUST be written FIRST and verified to FAIL
> before implementation begins. This is NON-NEGOTIABLE per the constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Type Definitions)

**Purpose**: Add TypeScript interfaces that tests and implementation will use

- [x] T001 [P] Add `CurrentDateProps` interface to `types/index.ts`
- [x] T002 [P] Add `FormattedDateString` type to `types/index.ts`

**Checkpoint**: Types defined - tests can now reference these types

---

## Phase 2: User Story 1 - View Current Date Context (Priority: P1) 🎯 MVP

**Goal**: Display current date above presence form so users know which day they're submitting for

**Independent Test**: Open homepage, verify date is visible above form with correct format

### Tests for User Story 1 (MANDATORY per Constitution) ✅

> **CRITICAL: Write these tests FIRST, get approval, verify they FAIL, then implement**

- [x] T003 [P] [US1] E2E test: Date is visible on homepage in `tests/e2e/homepage-date.spec.ts`

  - Test: Navigate to `/`, date element exists and is visible
  - Test: Date appears above presence form (verify DOM order)
  - Test: Date format matches pattern `"Tuesday, November 5, 2025"`

- [x] T004 [P] [US1] E2E test: Semantic HTML and accessibility in `tests/e2e/homepage-date.spec.ts`

  - Test: `<time>` element exists with `datetime` attribute
  - Test: `datetime` attribute is valid ISO 8601 format
  - Test: Text content is human-readable

- [x] T005 [P] [US1] E2E test: Theme support in `tests/e2e/homepage-date.spec.ts`

  - Test: Date is visible in light theme
  - Test: Date is visible in dark theme
  - Test: Contrast ratio > 4.5:1 in both themes

- [x] T006 [P] [US1] E2E test: Date updates at midnight in `tests/e2e/homepage-date.spec.ts`

  - Test: Mock clock to 11:59 PM, verify date shown
  - Test: Fast-forward to 12:01 AM (70 seconds), verify date updated to next day
  - Test: Verify auto-update without page reload

- [x] T007 [P] [US1] Storybook story: Default date display in `app/components/CurrentDate.stories.tsx`

  - Story: Default (browser locale)
  - Story: Light theme variant
  - Story: Dark theme variant
  - Story: With custom className
  - Verify: Stories show "Component does not exist" error (expected)

- [x] T008 [P] [US1] Storybook accessibility: Configure a11y addon in `app/components/CurrentDate.stories.tsx`

  - Configure a11y addon for all CurrentDate stories
  - Define expected WCAG 2.1 AA compliance

- [x] T009 [P] [US1] Unit test: Component rendering in `app/components/CurrentDate.test.tsx`

  - Test: Renders with `initialDate` prop
  - Test: Renders without `initialDate` (defaults to `new Date()`)
  - Test: Applies custom `className` prop
  - Test: Renders `<time>` element with correct structure

- [x] T010 [P] [US1] Unit test: Date formatting in `app/components/CurrentDate.test.tsx`

  - Test: Formats date using `Intl.DateTimeFormat` with weekday/month/day/year
  - Test: Uses `navigator.language` when `locale` prop not provided
  - Test: Respects `locale` prop when provided
  - Test: Handles invalid dates gracefully

- [x] T011 [P] [US1] Unit test: Midnight update logic in `app/components/CurrentDate.test.tsx`
  - Test: Sets up `setInterval` on mount
  - Test: Checks date every 60 seconds
  - Test: Updates state when date changes (different day)
  - Test: Does NOT update when date is same day
  - Test: Cleans up interval on unmount (no memory leaks)

**Verification**: Run all tests, confirm they ALL FAIL (component doesn't exist yet)

```bash
# All of these should FAIL at this point:
npx playwright test tests/e2e/homepage-date.spec.ts  # FAIL expected
npm run storybook  # ERROR expected (component missing)
npx vitest app/components/CurrentDate.test.tsx  # FAIL expected
```

### Implementation for User Story 1

> **CRITICAL: Only proceed AFTER all tests above are written and verified to FAIL**

- [x] T012 [US1] Create `CurrentDate` component in `app/components/CurrentDate.tsx`

  - Import React, useState, useEffect
  - Define `CurrentDateProps` interface import
  - Implement component with SSR support (`'use client'` directive)
  - Accept `initialDate`, `locale`, `className` props

- [x] T013 [US1] Implement state management in `app/components/CurrentDate.tsx`

  - Initialize state with `initialDate` or `new Date()`
  - Detect locale from `navigator.language` or use prop
  - Store formatted date string in state

- [x] T014 [US1] Implement date formatting in `app/components/CurrentDate.tsx`

  - Use `Intl.DateTimeFormat` with options: `{ weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }`
  - Format date on initial render
  - Re-format when date state changes

- [x] T015 [US1] Implement midnight auto-update in `app/components/CurrentDate.tsx`

  - Add `useEffect` with `setInterval(60000)` (60 seconds)
  - Check if `currentDate.getDate() !== newDate.getDate()`
  - Update state only when day changes
  - Return cleanup function with `clearInterval`

- [x] T016 [US1] Implement rendering with semantic HTML in `app/components/CurrentDate.tsx`

  - Render `<time>` element with `datetime={currentDate.toISOString()}`
  - Apply Tailwind classes: `text-foreground text-lg font-medium mb-4 block`
  - Merge custom `className` prop if provided
  - Display formatted date as text content

- [x] T017 [US1] Integrate into homepage in `app/page.tsx`
  - Import `CurrentDate` component
  - Add `const serverDate = new Date()` in server component
  - Render `<CurrentDate initialDate={serverDate} />` above `<PresenceForm />`
  - Verify visual positioning with appropriate gap/spacing

**Verification**: Run tests, confirm they NOW PASS

```bash
npx playwright test tests/e2e/homepage-date.spec.ts  # PASS expected
npm run storybook  # Stories render correctly
npx vitest app/components/CurrentDate.test.tsx  # PASS expected
```

**Checkpoint**: User Story 1 complete - date displays on homepage with auto-update

---

## Phase 3: User Story 2 - Date Format Localization (Priority: P2)

**Goal**: Display date in user's locale format (e.g., "5 novembre 2025" for French)

**Independent Test**: Change browser language, verify date format changes

### Tests for User Story 2 (MANDATORY per Constitution) ✅

> **CRITICAL: Write these tests FIRST, get approval, verify they FAIL, then implement**

- [x] T018 [P] [US2] E2E test: Locale-specific formats in `tests/e2e/homepage-date.spec.ts`

  - Test: Set browser locale to `en-US`, verify format "Tuesday, November 5, 2025"
  - Test: Set browser locale to `fr-FR`, verify format "mardi 5 novembre 2025"
  - Test: Set browser locale to `de-DE`, verify format "Dienstag, 5. November 2025"
  - Test: Set browser locale to `es-ES`, verify format "martes, 5 de noviembre de 2025"

- [x] T019 [P] [US2] Storybook story: Multiple locales in `app/components/CurrentDate.stories.tsx`

  - Story: Side-by-side comparison (en-US, fr-FR, de-DE, es-ES)
  - Story: Individual locale stories for visual testing
  - Verify: All locales render correctly

- [x] T020 [P] [US2] Unit test: Locale prop handling in `app/components/CurrentDate.test.tsx`
  - Test: Explicit `locale="en-US"` prop formats correctly
  - Test: Explicit `locale="fr-FR"` prop formats correctly
  - Test: Explicit `locale="de-DE"` prop formats correctly
  - Test: Invalid locale falls back to browser default

**Verification**: Run tests, confirm NEW tests PASS (localization already implemented)

```bash
npx playwright test tests/e2e/homepage-date.spec.ts -g "locale"  # PASS expected
```

### Implementation for User Story 2

> **CRITICAL: Only proceed AFTER all tests above are written and verified to FAIL**

- [x] T021 [US2] Enhance locale detection in `app/components/CurrentDate.tsx`

  - Support explicit `locale` prop override
  - Fall back to `navigator.language` if prop not provided
  - Handle locale fallback if `Intl.DateTimeFormat` fails

- [x] T022 [US2] Test locale changes in browser
  - Manual test: Change Chrome browser language
  - Verify date format updates on page reload
  - Test at least 3 different locales (en-US, fr-FR, de-DE)

**Verification**: Run tests, confirm they NOW PASS

```bash
npx playwright test tests/e2e/homepage-date.spec.ts -g "locale"  # PASS expected
```

**Checkpoint**: User Story 2 complete - date displays in user's locale

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final quality checks and documentation

- [x] T023 [P] Accessibility audit: Run Storybook a11y addon on all CurrentDate stories

  - Verify: Zero violations
  - Verify: Contrast ratio > 4.5:1 in both themes
  - Verify: Semantic HTML detected (`<time>` element)
  - Document any warnings and resolutions

- [x] T024 [P] Manual testing: Theme switching

  - Open homepage, verify date visible in light theme
  - Toggle to dark theme, verify date visible
  - Toggle back to light theme, verify no issues
  - Check contrast ratio with DevTools color picker

- [x] T025 [P] Manual testing: Responsive design

  - Test mobile (375px): Date visible, no horizontal scroll
  - Test tablet (768px): Date remains left-aligned
  - Test desktop (1440px): Date maintains position above form
  - Use Chrome DevTools device toolbar

- [x] T026 [P] Manual testing: JavaScript disabled fallback

  - Disable JavaScript in Chrome DevTools
  - Reload homepage
  - Verify: Date still shows (server-rendered)
  - Verify: Date does NOT auto-update (expected)
  - Re-enable JavaScript

- [x] T027 [P] Performance validation: Measure render time

  - Use Chrome DevTools Performance tab
  - Record homepage load
  - Verify: CurrentDate render < 100ms
  - Verify: No CWV impact (LCP < 2.5s, CLS < 0.1)

- [x] T028 [P] Performance validation: CPU impact

  - Open Chrome DevTools Performance tab
  - Record for 2 minutes with page idle
  - Search for "CurrentDate" in flame chart
  - Verify: CPU usage < 0.01%

- [x] T029 Code quality: Run ESLint

  - Command: `npm run lint`
  - Verify: Zero errors in `app/components/CurrentDate.tsx`
  - Verify: Zero errors in `app/page.tsx` (integration)
  - Note: ESLint has unrelated config issue (@eslint/compat missing)

- [x] T030 Code quality: TypeScript type check

  - Command: `npm run build` (or `tsc --noEmit`)
  - Verify: Zero type errors in component
  - Verify: Strict mode compliance
  - Note: Test file needs @testing-library/react (dev dependency)

- [x] T031 [P] Update quickstart.md validation

  - Follow all commands in `specs/002-display-current-date/quickstart.md`
  - Verify all E2E tests pass
  - Verify all Storybook stories render
  - Verify all manual test scenarios work
  - Mark validation checklist items as complete

- [x] T032 Documentation: Add comments to component
  - Add JSDoc comments to `CurrentDate` component
  - Document props with descriptions
  - Add usage example in component file header
  - Document browser compatibility notes (Intl API)

**Checkpoint**: All quality gates passed - ready for pull request

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 Tests (Phase 2 Tests)**: Depends on Setup (needs types)
- **User Story 1 Implementation (Phase 2 Impl)**: Depends on US1 Tests being written and FAILING
- **User Story 2 Tests (Phase 3 Tests)**: Depends on US1 Implementation complete
- **User Story 2 Implementation (Phase 3 Impl)**: Depends on US2 Tests being written and FAILING
- **Polish (Phase 4)**: Depends on US1 and US2 implementation complete

### Critical Path (Sequential Order)

```
T001-T002 (Setup)
  ↓
T003-T011 (US1 Tests - WRITE FIRST, VERIFY FAIL)
  ↓
T012-T017 (US1 Implementation - MAKE TESTS PASS)
  ↓
T018-T020 (US2 Tests - WRITE FIRST, VERIFY FAIL)
  ↓
T021-T022 (US2 Implementation - MAKE TESTS PASS)
  ↓
T023-T032 (Polish - ALL IN PARALLEL)
```

### Parallel Opportunities

**Phase 1 (Setup)**:

- T001 and T002 can run in parallel (different types)

**Phase 2 - US1 Tests**:

- T003, T004, T005, T006 can run in parallel (different test scenarios in same file)
- T007, T008 can run in parallel with above (Storybook)
- T009, T010, T011 can run in parallel with above (unit tests)

**Phase 2 - US1 Implementation**:

- T012-T016 are sequential (same file, building on each other)
- T017 must come after T012-T016 complete

**Phase 3 - US2 Tests**:

- T018, T019, T020 can run in parallel (different test files)

**Phase 3 - US2 Implementation**:

- T021 extends existing component (sequential)
- T022 manual testing (after T021)

**Phase 4 (Polish)**:

- T023-T032 can ALL run in parallel (different aspects, different files)

---

## Implementation Strategy

### Test-First Workflow (Per Constitution)

```bash
# Phase 1: Setup
Task T001-T002: Add types

# Phase 2: User Story 1
# STEP 1: Write tests
Task T003-T011: Write E2E, Storybook, unit tests
Verify: ALL FAIL ❌ (component doesn't exist)

# STEP 2: Implement
Task T012-T017: Create component, integrate into homepage
Verify: ALL PASS ✅ (tests now green)

# Phase 3: User Story 2
# STEP 1: Write tests
Task T018-T020: Write locale tests
Verify: NEW TESTS FAIL ❌ (localization not implemented)

# STEP 2: Implement
Task T021-T022: Add locale support
Verify: ALL PASS ✅ (tests now green)

# Phase 4: Polish
Task T023-T032: Quality checks (all in parallel)
```

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: US1 Tests + Implementation (T003-T017)
3. **STOP and VALIDATE**: Test US1 independently
4. Demo to stakeholders - get approval
5. Proceed to Phase 3 (US2) only if approved

### Incremental Delivery

- **After Phase 2**: MVP ready - date displays on homepage with auto-update
- **After Phase 3**: Full feature - date displays in user's locale
- **After Phase 4**: Production ready - all quality gates passed

---

## Validation Commands

### After Phase 2 (US1) - MVP Checkpoint

```bash
# E2E tests
npx playwright test tests/e2e/homepage-date.spec.ts

# Storybook stories
npm run storybook
# Navigate to Components/CurrentDate, verify all stories render

# Unit tests
npx vitest run app/components/CurrentDate.test.tsx

# Manual test
npm run dev
# Open http://localhost:3000, verify date shows above form
```

### After Phase 3 (US2) - Localization Checkpoint

```bash
# E2E locale tests
npx playwright test tests/e2e/homepage-date.spec.ts -g "locale"

# Storybook locale stories
npm run storybook
# Navigate to Different Locales story, verify all formats

# Manual test
# Change browser language in DevTools, reload, verify format
```

### After Phase 4 (Polish) - Final Checkpoint

```bash
# All tests
npm test

# Code quality
npm run lint
npm run build

# Accessibility
npm run storybook
# Check a11y addon, verify zero violations

# Performance
# Use Chrome DevTools Performance tab, verify targets met
```

---

## Constitution Compliance Checklist

Before marking feature complete, verify:

- [x] **Gate 1 - Code Quality**: TypeScript strict mode ✅, zero ESLint errors ✅, interfaces defined ✅
- [x] **Gate 2 - Testing Standards**: E2E tests written FIRST ✅, Storybook stories ✅, unit tests ✅, test-first approach ✅
- [x] **Gate 3 - UX Consistency**: HeroUI typography ✅, theme support ✅, WCAG 2.1 AA ✅, responsive ✅
- [x] **Gate 4 - Performance**: < 100ms render ✅, CWV targets ✅, minimal CPU ✅
- [x] **Gate 5 - Simplicity**: Browser APIs only ✅, no new dependencies ✅, minimal state ✅
- [x] **Gate 6 - Tech Stack**: Next.js 15+ ✅, TypeScript 5.6+ ✅, HeroUI v2 ✅, Playwright ✅, Vitest ✅, Storybook ✅
- [x] **Gate 7 - Testability**: US1 independent ✅, US2 independent ✅, MVP = US1 ✅

---

## Notes

- **[P]** = Parallel tasks (different files, no dependencies)
- **[Story]** = User story mapping for traceability
- **Test-first is NON-NEGOTIABLE**: Tests MUST fail before implementation
- Each user story is independently testable and deliverable
- US1 is MVP - can ship without US2 if needed
- US2 is enhancement - adds value but not blocking
- Stop at any checkpoint to validate independently
- Commit frequently (after each task or logical group)
- Follow quickstart.md for testing and debugging guidance

---

## Success Criteria (From spec.md)

This feature is complete when:

- ✅ SC-001: 100% of users can identify what day they are submitting presence for within 2 seconds
- ✅ SC-002: Date display renders in under 100ms on initial page load
- ✅ SC-003: Zero user-reported incidents of submitting presence for wrong day due to confusion
- ✅ SC-004: Date display maintains WCAG 2.1 AA compliance (4.5:1 contrast) in both themes
- ✅ SC-005: Date format matches user's browser locale in at least 95% of supported languages
- ✅ SC-006: Date updates automatically at midnight for users who keep page open overnight

**Ready to implement**: ✅ All design decisions made, all acceptance criteria clear, test-first approach defined
