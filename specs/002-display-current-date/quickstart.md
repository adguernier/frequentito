# Quickstart: Display Current Date on Homepage

**Feature**: Display Current Date on Homepage  
**Branch**: `002-display-current-date`  
**Date**: 2025-11-05

## Prerequisites

- Feature branch checked out: `git checkout 002-display-current-date`
- Dependencies installed: `npm install`
- Supabase running: `npx supabase start`
- Environment variables configured: `.env.local`

---

## Running E2E Tests

### View Current Date Display Test

```bash
# Run all homepage E2E tests
npx playwright test tests/e2e/homepage-date.spec.ts

# Run in headed mode (see browser)
npx playwright test tests/e2e/homepage-date.spec.ts --headed

# Run specific test
npx playwright test tests/e2e/homepage-date.spec.ts -g "displays current date"

# Debug mode (pause at breakpoints)
npx playwright test tests/e2e/homepage-date.spec.ts --debug
```

### View Midnight Update Test

```bash
# Test date update at midnight (uses mocked time)
npx playwright test tests/e2e/homepage-date.spec.ts -g "date updates at midnight"
```

### Expected Behavior

✅ **Pass**: Date is visible above presence form  
✅ **Pass**: Date format matches `"Tuesday, November 5, 2025"` pattern  
✅ **Pass**: `<time>` element has `datetime` attribute  
✅ **Pass**: Date updates after midnight transition (mocked time)

---

## Running Storybook Component Tests

### View CurrentDate Component Stories

```bash
# Start Storybook dev server
npm run storybook

# Open browser to http://localhost:6006
# Navigate to: Components/CurrentDate
```

### Available Stories

1. **Default**: CurrentDate with browser locale
2. **Light Theme**: Component in light mode
3. **Dark Theme**: Component in dark mode
4. **Different Locales**: Side-by-side en-US, fr-FR, de-DE
5. **With Custom Class**: Component with custom styling

### Accessibility Testing in Storybook

1. Open any CurrentDate story
2. Click "Accessibility" tab in addons panel
3. Verify:
   - ✅ No violations
   - ✅ Contrast ratio > 4.5:1
   - ✅ `<time>` element present
   - ✅ `datetime` attribute valid

---

## Running Unit Tests

### Test CurrentDate Component Logic

```bash
# Run all unit tests for CurrentDate
npx vitest run app/components/CurrentDate.test.tsx

# Run in watch mode
npx vitest app/components/CurrentDate.test.tsx

# Run with coverage
npx vitest run app/components/CurrentDate.test.tsx --coverage
```

### Test Date Formatting Utility

```bash
# Run date formatting tests
npx vitest run utils/dateUtils.test.ts
```

---

## Manual Testing

### Test in Development Server

```bash
# Start Next.js dev server
npm run dev

# Open http://localhost:3000
# Verify date appears above presence form
```

### Test Scenarios

#### 1. Default Date Display

- Navigate to `/` (homepage)
- Verify date shows: `"{Weekday}, {Month} {Day}, {Year}"`
- Example: `"Tuesday, November 5, 2025"`

#### 2. Theme Switching

- Click theme toggle button (moon/sun icon)
- Verify date text color adapts to theme
- Light mode: Dark text
- Dark mode: Light text
- Contrast ratio: 4.5:1 minimum

#### 3. Locale Testing

- Change browser language in DevTools:
  - Chrome: Settings → Languages → Add language
  - Firefox: about:config → intl.accept_languages
- Reload page
- Verify date format matches locale:
  - `en-US`: "Tuesday, November 5, 2025"
  - `fr-FR`: "mardi 5 novembre 2025"
  - `de-DE`: "Dienstag, 5. November 2025"

#### 4. Midnight Update (Manual)

- Open browser DevTools console
- Fast-forward system time to midnight:
  ```javascript
  // In DevTools console
  const originalDate = Date;
  Date = class extends originalDate {
    constructor() {
      super("2025-11-06T00:01:00Z"); // Next day
    }
  };
  ```
- Wait 60 seconds
- Verify date updates to next day

#### 5. JavaScript Disabled

- Disable JavaScript in browser:
  - Chrome: DevTools → Settings → Debugger → Disable JavaScript
  - Firefox: about:config → javascript.enabled = false
- Reload page
- Verify date still shows (server-rendered)
- Verify date does NOT auto-update (expected behavior)

#### 6. Responsive Design

- Test on different screen sizes:
  - Mobile (375px width): Date should be visible, no horizontal scroll
  - Tablet (768px width): Date should remain left-aligned
  - Desktop (1440px width): Date should maintain position above form

---

## Debugging

### Common Issues

#### Date Not Showing

**Symptoms**: No date visible above presence form

**Debugging**:

```bash
# Check component is imported
grep -r "CurrentDate" app/page.tsx

# Check for React errors
npm run dev
# Open browser console, look for errors
```

**Solution**: Verify `<CurrentDate />` is rendered in `app/page.tsx`

#### Date Not Updating at Midnight

**Symptoms**: Date still shows previous day after midnight

**Debugging**:

```javascript
// In browser console
console.log("Current interval:", window.setInterval.toString());
```

**Solution**: Verify `setInterval` is running and cleanup is working

#### Wrong Locale Format

**Symptoms**: Date shows "11/5/2025" instead of "November 5, 2025"

**Debugging**:

```javascript
// In browser console
console.log(navigator.language); // Check detected locale
console.log(
  new Intl.DateTimeFormat(navigator.language, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date())
);
```

**Solution**: Verify `Intl.DateTimeFormat` options are correct

#### Accessibility Violation

**Symptoms**: Storybook a11y addon shows violations

**Debugging**:

- Open Storybook → CurrentDate story
- Click "Accessibility" tab
- Expand violation details

**Common fixes**:

- Add `datetime` attribute to `<time>` element
- Ensure contrast ratio > 4.5:1 (use HeroUI's `text-foreground`)
- Verify semantic HTML (`<time>` not `<div>`)

---

## Performance Profiling

### Measure Render Time

```javascript
// In browser DevTools console
performance.mark("date-render-start");
// Reload page
performance.mark("date-render-end");
performance.measure("date-render", "date-render-start", "date-render-end");
console.table(performance.getEntriesByType("measure"));
```

**Target**: < 100ms  
**Expected**: < 20ms

### Measure CPU Impact

```bash
# Start dev server with profiling
npm run dev

# Open Chrome DevTools
# Performance tab → Record → Wait 2 minutes → Stop
# Search for "CurrentDate" in bottom-up view
# Verify CPU usage < 0.01%
```

---

## Integration with Existing Features

### Presence Form Integration

**File**: `app/page.tsx`

```typescript
export default function HomePage() {
  const serverDate = new Date();

  return (
    <div className="flex flex-col gap-4">
      <CurrentDate initialDate={serverDate} />
      <PresenceForm />
      <PresenceListContainer />
    </div>
  );
}
```

**Visual Layout**:

```
┌────────────────────────────────┐
│ Tuesday, November 5, 2025      │ ← CurrentDate component
├────────────────────────────────┤
│ [Coming] [Not Coming] [Maybe]  │ ← PresenceForm
├────────────────────────────────┤
│ • Alice (Coming)               │ ← PresenceListContainer
│ • Bob (Not Coming)             │
└────────────────────────────────┘
```

---

## Quick Validation Checklist

Before marking implementation complete, verify:

- [ ] E2E test passes: `npx playwright test tests/e2e/homepage-date.spec.ts`
- [ ] Storybook story renders: `npm run storybook` → Components/CurrentDate
- [ ] No accessibility violations in Storybook a11y addon
- [ ] Date shows on homepage (`npm run dev` → http://localhost:3000)
- [ ] Theme switching works (light/dark mode)
- [ ] Date format matches locale (test with different browser language)
- [ ] Contrast ratio > 4.5:1 (use DevTools color picker)
- [ ] Date updates at midnight (manual test or Playwright test)
- [ ] JavaScript disabled fallback works (shows server-rendered date)
- [ ] No ESLint errors: `npm run lint`
- [ ] TypeScript compiles: `npm run build`
- [ ] Performance target met: < 100ms render

---

## Useful Commands Summary

```bash
# Development
npm run dev                 # Start dev server
npm run storybook          # Start Storybook

# Testing
npx playwright test tests/e2e/homepage-date.spec.ts  # E2E tests
npx vitest app/components/CurrentDate.test.tsx       # Unit tests
npm run test              # All tests

# Quality
npm run lint              # ESLint check
npm run type-check        # TypeScript check
npm run build             # Production build

# Debugging
npx playwright test --headed --debug  # Visual debugging
npm run storybook -- --debug-webpack  # Storybook debug mode
```

---

## Next Steps After Implementation

1. ✅ Verify all tests pass
2. ✅ Run `npm run lint` and `npm run build` with zero errors
3. ✅ Commit changes: `git commit -m "feat: display current date on homepage"`
4. ✅ Push branch: `git push origin 002-display-current-date`
5. ✅ Open pull request
6. ✅ Deploy to staging/preview environment
7. ✅ Verify in staging
8. ✅ Merge to main

**Constitution Compliance**: ✅ All tests written FIRST, all quality gates passed
