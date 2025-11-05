# Implementation Plan: Display Current Date on Homepage

**Branch**: `002-display-current-date` | **Date**: 2025-11-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-display-current-date/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add a date display component to the homepage that shows users the current date for which they are submitting their presence. The date will be positioned above the presence form with left alignment, formatted in a locale-aware manner, and automatically update at midnight using a client-side interval check. The component must support both light and dark themes, meet WCAG 2.1 AA accessibility standards, and provide a server-side rendering fallback when JavaScript is disabled.

## Technical Context

**Language/Version**: TypeScript 5.6+ (strict mode enabled)  
**Primary Dependencies**: Next.js 15+ (App Router), React 18+, HeroUI v2, next-themes  
**Storage**: N/A (no database changes required - component displays client-side date)  
**Testing**: Playwright 1.56+ (E2E), Vitest 3.2+ (Component), Storybook 9.1+ (Visual/Accessibility)  
**Target Platform**: Web (desktop and mobile browsers), PWA support
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**:

- Date component renders in < 100ms
- No impact on Core Web Vitals (LCP < 2.5s, CLS < 0.1)
- Client-side interval check (1 minute) with minimal CPU impact

**Constraints**:

- Must work with existing homepage layout and presence form
- Must support server-side rendering for no-JS fallback
- Must integrate with existing next-themes for dark/light mode
- Must use HeroUI typography components
- 4.5:1 contrast ratio minimum (WCAG 2.1 AA)

**Scale/Scope**:

- Single UI component on homepage
- Affects all authenticated users viewing homepage
- No backend API changes required
- Minimal bundle size impact (date formatting is built-in to JavaScript Intl API)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

This feature MUST comply with all 5 constitution principles. Check each gate:

- [x] **Gate 1 - Code Quality**: TypeScript strict mode confirmed, component interface will be defined, zero ESLint errors required, no validation needed (display-only component)
- [x] **Gate 2 - Testing Standards**: E2E test planned for date display on homepage, Storybook story planned for component with theme variants, test-first approach per spec
- [x] **Gate 3 - UX Consistency**: HeroUI typography components specified, next-themes integration confirmed, WCAG 2.1 AA (4.5:1 contrast) documented, responsive design required
- [x] **Gate 4 - Performance**: < 100ms render target specified, Core Web Vitals (LCP < 2.5s, CLS < 0.1) documented, minimal CPU impact for 1-minute interval
- [x] **Gate 5 - Simplicity**: Simple display component, no database changes, uses browser Intl API (no new dependencies), pragmatic approach (SSR fallback for no-JS)
- [x] **Gate 6 - Tech Stack Compliance**: Using approved stack (Next.js 15+, TypeScript 5.6+, HeroUI v2, React 18+, next-themes, Playwright, Vitest, Storybook)
- [x] **Gate 7 - Independent Testability**: US1 (basic display) independently testable, US2 (localization) independently testable, MVP = US1 only

**Result**: ✅ ALL GATES PASSED - No violations, no complexity tracking required

**Pass Criteria**: All gates MUST pass OR violations MUST be documented in Complexity Tracking with justification.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── page.tsx                      # Homepage - integrate CurrentDate component above PresenceForm
├── components/
│   └── CurrentDate.tsx           # NEW: Date display component with auto-update logic
└── components/
    └── CurrentDate.stories.tsx   # NEW: Storybook story for CurrentDate with theme variants

components/                        # Shared components (if CurrentDate is reusable)
└── CurrentDate.tsx               # Alternative location if component shared across pages

utils/
└── dateUtils.ts                  # EXISTING: Date utilities (may need formatDate helper)

tests/
└── e2e/
    └── homepage-date.spec.ts     # NEW: E2E test for date display on homepage

types/
└── index.ts                      # EXISTING: May add CurrentDateProps interface
```

**Structure Decision**: Next.js 15 App Router web application. New `CurrentDate` component will be created in `app/components/` directory (co-located with homepage) or in `components/` if determined to be reusable. The component will integrate into the existing `app/page.tsx` homepage above the presence form. No backend API changes required since this is a client-side display component using browser's native date functionality.

## Complexity Tracking

✅ **No violations** - All constitution gates passed. No complexity tracking required.

**Simplicity Assessment**:

- ✅ Single-purpose component (displays date)
- ✅ Zero new dependencies (uses browser Intl API)
- ✅ No database changes
- ✅ Minimal state management (React useState)
- ✅ Standard Next.js patterns (SSR + client hydration)

---

## Phase 0: Research (Complete)

**Objective**: Resolve all technical unknowns and validate approach before design phase.

**Status**: ✅ Complete - See [research.md](./research.md)

**Key Findings**:

1. **Date Formatting**: Browser's `Intl.DateTimeFormat` API provides locale-aware formatting with zero dependencies
2. **Auto-Update Mechanism**: `setInterval` with 60-second intervals provides best balance of accuracy and resource efficiency
3. **SSR Approach**: Next.js 15 Server Components with client-side hydration for progressive enhancement
4. **HeroUI Typography**: Use Tailwind classes with HeroUI theme variables (`text-foreground`, etc.)
5. **Accessibility**: Semantic `<time>` element with `datetime` attribute meets WCAG 2.1 AA
6. **Localization**: Browser's `navigator.language` provides automatic locale detection
7. **Testing Strategy**: Playwright E2E + Storybook component + a11y addon

**Research Artifacts**:

- [research.md](./research.md) - 7 research areas with decisions and rationale

---

## Phase 1: Design (Complete)

**Objective**: Design interfaces, data models, and contracts before implementation.

**Status**: ✅ Complete - See design artifacts below

**Design Artifacts**:

1. **[data-model.md](./data-model.md)** - Component state model (no DB changes)
   - `CurrentDateProps` interface defined
   - Client-side state management with React useState
   - Performance metrics: < 1 KB memory, < 0.01% CPU, < 20ms render
2. **[contracts/README.md](./contracts/README.md)** - No API contracts (client-side only)
   - Confirmed no backend endpoints required
   - Date sourced from browser's `new Date()`
3. **[quickstart.md](./quickstart.md)** - Developer guide for testing and debugging
   - E2E test commands (Playwright)
   - Storybook commands with accessibility testing
   - Manual testing scenarios (theme switching, locale, midnight update)
   - Debugging guide and validation checklist

**Key Design Decisions**:

- Component props: `initialDate?: Date`, `locale?: string`, `className?: string`
- State management: React useState (no global state needed)
- Styling: Tailwind classes with HeroUI theme (`text-foreground`)
- Accessibility: Semantic `<time datetime="...">` element
- Performance: < 100ms render, < 1 KB memory footprint

**Agent Context Updated**: ✅ Technology decisions added to `.github/copilot-instructions.md`

---

## Phase 2: Implementation Planning

**Objective**: Generate task breakdown with `/speckit.tasks` command (NOT done by `/speckit.plan`).

**Status**: ⏸️ Not started - Requires separate command

**Next Action**: User must run `/speckit.tasks` to generate `tasks.md` with test-first task breakdown.

---

## Summary of Planning Phase

**Completed**:

- ✅ Technical context defined (TypeScript 5.6+, Next.js 15+, HeroUI v2)
- ✅ Constitution check passed (7/7 gates)
- ✅ Project structure mapped (CurrentDate component in app/components/)
- ✅ Phase 0 research complete (7 technical areas resolved)
- ✅ Phase 1 design complete (data-model, contracts, quickstart)
- ✅ Agent context updated with design decisions

**Ready for Implementation**:

- ✅ All technical unknowns resolved
- ✅ Component interface designed
- ✅ Testing strategy defined
- ✅ Performance targets established
- ✅ Accessibility requirements documented

**Next Steps**:

1. Run `/speckit.tasks` to generate test-first task breakdown
2. Implement tasks in order (tests FIRST per constitution)
3. Verify all quality gates pass
4. Submit pull request

**Constitution Compliance**: ✅ Test-first approach enforced, all 5 principles satisfied
