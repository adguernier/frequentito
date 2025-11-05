# Research: Display Current Date on Homepage

**Feature**: Display Current Date on Homepage  
**Branch**: `002-display-current-date`  
**Date**: 2025-11-05

## Research Areas

### 1. Date Formatting with Intl.DateTimeFormat API

**Decision**: Use JavaScript's built-in `Intl.DateTimeFormat` API for locale-aware date formatting

**Rationale**:

- Native browser API, no additional dependencies required
- Automatic locale detection from browser settings
- Supports all required formats (long date with day of week)
- Battle-tested and consistent across modern browsers
- Zero bundle size impact

**Implementation Pattern**:

```typescript
const formatDate = (date: Date, locale: string): string => {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};
```

**Alternatives Considered**:

- **date-fns**: Popular library with good TypeScript support, but adds ~70KB to bundle for functionality we get for free
- **Day.js**: Lightweight alternative (~2KB), but still unnecessary overhead
- **Luxon**: Modern replacement for Moment.js, but overkill for our needs
- **Moment.js**: Deprecated and large bundle size

**Rejected Because**: Intl API provides everything needed with zero overhead

---

### 2. Client-Side Date Update Mechanism

**Decision**: Use `setInterval` with 60-second intervals to check for date changes

**Rationale**:

- Simple and reliable approach
- 60-second granularity is acceptable (users see update within 1 minute of midnight)
- Minimal CPU/battery impact (1 comparison per minute)
- Easy to test and debug
- Cleanup via `clearInterval` on component unmount prevents memory leaks

**Implementation Pattern**:

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    const newDate = getTodayUTC(); // or new Date()
    if (newDate.getDate() !== currentDate.getDate()) {
      setCurrentDate(newDate);
    }
  }, 60000); // 60 seconds

  return () => clearInterval(interval);
}, [currentDate]);
```

**Alternatives Considered**:

- **setTimeout with exact midnight calculation**: More precise but complex edge cases (DST, timezone changes)
- **10-second interval**: More responsive but unnecessary CPU usage
- **Server push/WebSocket**: Over-engineered for a simple date display
- **requestAnimationFrame**: Designed for animations, wasteful for 1-minute checks

**Rejected Because**: setInterval with 60-second interval provides best balance of simplicity, accuracy, and resource efficiency

---

### 3. Server-Side Rendering (SSR) Approach

**Decision**: Use React Server Components with initial server-rendered date, enhanced with client-side hydration

**Rationale**:

- Next.js 15 App Router defaults to Server Components
- Initial HTML includes date (works without JavaScript)
- Client-side JavaScript enhances with auto-update functionality
- Progressive enhancement pattern
- SEO-friendly (though not relevant for authenticated pages)

**Implementation Pattern**:

```typescript
// Server Component (default in Next.js App Router)
export default function HomePage() {
  const serverDate = new Date(); // Rendered on server

  return (
    <div>
      <CurrentDate initialDate={serverDate} /> {/* Client component */}
      <PresenceForm />
    </div>
  );
}

// Client Component with "use client" directive
'use client';
export function CurrentDate({ initialDate }: { initialDate: Date }) {
  const [currentDate, setCurrentDate] = useState(initialDate);

  useEffect(() => {
    // Client-side auto-update logic
  }, []);

  return <time dateTime={currentDate.toISOString()}>...</time>;
}
```

**Alternatives Considered**:

- **Client-only rendering**: Simpler but breaks without JavaScript
- **Static generation**: Date would be build-time, not request-time
- **getServerSideProps**: Old Pages Router pattern, not applicable to App Router

**Rejected Because**: Server Components with client-side enhancement provides best UX and follows Next.js 15 best practices

---

### 4. HeroUI Typography Component Selection

**Decision**: Use HeroUI's native text components or Tailwind typography classes with HeroUI theming

**Rationale**:

- HeroUI v2 uses Tailwind CSS 4 under the hood
- HeroUI provides consistent typography through Tailwind classes
- Theme variables automatically applied
- No need for specific HeroUI "Typography" component (doesn't exist as standalone)

**Implementation Pattern**:

```typescript
<time
  dateTime={currentDate.toISOString()}
  className="text-foreground text-lg font-medium mb-4 block"
>
  {formattedDate}
</time>
```

**Research Findings**:

- HeroUI v2 uses Tailwind's text color system: `text-foreground`, `text-foreground-500`, etc.
- Theme-aware colors: `text-foreground` adapts to light/dark automatically
- Typography scale: `text-sm`, `text-base`, `text-lg`, `text-xl`, etc.
- Font weights: `font-normal`, `font-medium`, `font-semibold`, `font-bold`

**Alternatives Considered**:

- **Custom styled component**: Unnecessary complexity
- **Plain HTML with inline styles**: Breaks theme support
- **HeroUI Card/Section**: Too heavyweight for a date display

**Rejected Because**: Direct Tailwind classes with HeroUI theme variables provide simplest and most maintainable solution

---

### 5. Accessibility Best Practices for Date Display

**Decision**: Use semantic HTML `<time>` element with `datetime` attribute and adequate contrast

**Rationale**:

- `<time>` is semantic HTML5 element recognized by screen readers
- `datetime` attribute provides machine-readable ISO 8601 format
- Screen readers announce date naturally when using proper semantic markup
- WCAG 2.1 AA requires 4.5:1 contrast for normal text
- HeroUI's `text-foreground` provides sufficient contrast by default

**Implementation Pattern**:

```typescript
<time
  dateTime={currentDate.toISOString()}
  aria-label={`Today's date is ${formattedDate}`}
  className="text-foreground text-lg font-medium"
>
  {formattedDate}
</time>
```

**WCAG 2.1 AA Requirements**:

- **1.3.1 Info and Relationships**: Semantic HTML (`<time>`) provides structure
- **1.4.3 Contrast (Minimum)**: 4.5:1 for normal text (HeroUI default passes)
- **2.1.1 Keyboard**: No interaction required, but component must not trap focus
- **4.1.2 Name, Role, Value**: `<time>` element provides semantic role

**Alternatives Considered**:

- **Plain div with ARIA role**: Less semantic than native `<time>`
- **Visually hidden text for screen readers**: Unnecessary with proper semantic HTML
- **Custom ARIA live region**: Overkill for static display (date change at midnight is not critical announcement)

**Rejected Because**: Native `<time>` element with `datetime` attribute provides best accessibility with minimal code

---

### 6. Localization Strategy

**Decision**: Use browser's `navigator.language` or `navigator.languages[0]` with Intl.DateTimeFormat

**Rationale**:

- Browser automatically provides user's preferred language
- No server-side locale management needed
- Falls back gracefully if locale not supported
- Consistent with user's system preferences
- Works automatically in all modern browsers

**Implementation Pattern**:

```typescript
const userLocale = navigator.language || "en-US";
const formattedDate = new Intl.DateTimeFormat(userLocale, {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
}).format(currentDate);
```

**Examples**:

- `en-US`: "Tuesday, November 5, 2025"
- `fr-FR`: "mardi 5 novembre 2025"
- `de-DE`: "Dienstag, 5. November 2025"
- `es-ES`: "martes, 5 de noviembre de 2025"

**Alternatives Considered**:

- **Next.js i18n router**: Overkill for a single date string
- **User preference in database**: Adds unnecessary complexity
- **Manual locale detection**: Reinventing the wheel
- **react-intl or similar**: Heavy dependency for date formatting only

**Rejected Because**: Browser's native locale detection works perfectly and requires no dependencies

---

### 7. Testing Strategy

**Decision**: Multi-layered testing approach

**E2E Tests (Playwright)**:

```typescript
test("displays current date on homepage", async ({ page }) => {
  await page.goto("/");
  const dateElement = page.locator("time");
  await expect(dateElement).toBeVisible();
  // Verify format matches expected pattern
  const dateText = await dateElement.textContent();
  expect(dateText).toMatch(/\w+,\s\w+\s\d{1,2},\s\d{4}/);
});

test("date updates at midnight", async ({ page }) => {
  // Mock system time to 11:59 PM
  await page.clock.install({ time: new Date("2025-11-05T23:59:00") });
  await page.goto("/");

  const initialDate = await page.locator("time").textContent();

  // Fast-forward to midnight
  await page.clock.fastForward(70000); // 70 seconds

  const updatedDate = await page.locator("time").textContent();
  expect(updatedDate).not.toBe(initialDate);
});
```

**Component Tests (Storybook + Vitest)**:

```typescript
export default {
  title: 'Components/CurrentDate',
  component: CurrentDate,
} as Meta;

export const LightTheme: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
};

export const DarkTheme: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const DifferentLocales: Story = {
  render: () => (
    <>
      <CurrentDate locale="en-US" />
      <CurrentDate locale="fr-FR" />
      <CurrentDate locale="de-DE" />
    </>
  ),
};
```

**Accessibility Tests (Storybook a11y addon)**:

- Automated contrast ratio checking
- Semantic HTML validation
- Screen reader compatibility verification

**Rationale**: Comprehensive testing at all levels ensures component works correctly, is accessible, and maintains quality standards per constitution

---

## Summary

All research areas resolved with pragmatic, simple solutions:

1. **Date Formatting**: Built-in Intl API (zero dependencies)
2. **Auto-Update**: setInterval with 60-second checks
3. **SSR**: Server Components with client enhancement
4. **Styling**: Tailwind classes with HeroUI theme
5. **Accessibility**: Semantic `<time>` element with datetime attribute
6. **Localization**: Browser's navigator.language
7. **Testing**: Playwright E2E + Storybook component + a11y addon

**Key Principle Applied**: Simplicity & Pragmatism - leveraging built-in browser APIs and Next.js capabilities rather than adding external dependencies.

**Next Phase**: Design (data-model.md, contracts/, quickstart.md)
