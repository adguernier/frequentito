<!--
Sync Impact Report - 2025-11-05
================================
Version change: INITIAL → 1.0.0
New principles added:
  - I. Code Quality Standards
  - II. Testing Standards (NON-NEGOTIABLE)
  - III. User Experience Consistency
  - IV. Performance Requirements
  - V. Simplicity & Pragmatism

New sections added:
  - Technology Stack Requirements
  - Development Workflow

Templates status:
  ✅ plan-template.md - Constitution Check section aligns with 5 principles
  ✅ spec-template.md - User scenarios and requirements align with UX/testing principles
  ✅ tasks-template.md - Task organization supports independent testing per principle II

Follow-up TODOs: None - all placeholders filled
-->

# Frequentito Constitution

## Core Principles

### I. Code Quality Standards

All code MUST maintain high quality standards to ensure maintainability and reliability:

- **TypeScript Strict Mode**: Enabled with no implicit `any` types. All function parameters and return types MUST be explicitly typed.
- **Schema Validation**: All user inputs and external data MUST be validated using Zod schemas before processing.
- **Interface-First Design**: Define clear TypeScript interfaces for all data models before implementation.
- **Zero ESLint Errors**: Code MUST pass linting without errors. Warnings should be addressed or explicitly justified.
- **Immutability Patterns**: Data transformations MUST return new objects/arrays rather than mutating existing data.
- **Error Handling**: All server actions MUST return typed results (`ActionResult<T>`) with explicit success/error states.

**Rationale**: Type safety and validation prevent runtime errors. Explicit error handling creates predictable, debuggable systems. Immutability prevents side effects and makes code easier to reason about.

### II. Testing Standards (NON-NEGOTIABLE)

Testing is MANDATORY for all user-facing features. Tests MUST be written FIRST:

- **Test-First Development**: E2E tests (Playwright) and component tests (Storybook + Vitest) MUST be written and verified to FAIL before implementation begins.
- **E2E Tests Required**: Every user story MUST have E2E tests covering the complete user journey from start to finish.
- **Component Tests Required**: All reusable UI components MUST have Storybook stories with interaction tests and visual regression tests.
- **Independent Testability**: Each user story MUST be testable independently without dependencies on other stories.
- **Test Coverage**: Core business logic server actions MUST have unit tests covering success, error, and edge cases.
- **Accessibility Tests**: All components MUST include automated accessibility checks using Storybook a11y addon.

**Rationale**: Test-first development catches bugs early, ensures features work as specified, and creates living documentation. Independent testability enables incremental delivery and parallel development.

### III. User Experience Consistency

All user interfaces MUST provide consistent, accessible, and delightful experiences:

- **Component Library**: Use HeroUI v2 components exclusively. Custom components MUST follow HeroUI design patterns.
- **Theme Support**: All UI MUST support both light and dark themes via next-themes. No hardcoded colors.
- **Loading States**: Every async operation MUST display loading feedback (spinners, skeletons, disabled states).
- **Error Messages**: All errors MUST show user-friendly messages with actionable guidance. No technical jargon.
- **Success Feedback**: Successful actions MUST provide immediate visual confirmation (toasts, status changes, animations).
- **Accessibility**: WCAG 2.1 AA compliance is MANDATORY. This includes keyboard navigation, ARIA labels, color contrast (4.5:1 for text, 3:1 for UI), and screen reader support.
- **Responsive Design**: All interfaces MUST work on mobile and desktop viewports.

**Rationale**: Consistency reduces cognitive load. Accessibility ensures everyone can use the application. Feedback mechanisms build user confidence and trust.

### IV. Performance Requirements

Applications MUST meet strict performance targets to ensure responsive user experiences:

- **Page Load**: Initial page load MUST complete in under 3 seconds on 3G connections.
- **Interaction Response**: User interactions (clicks, form submissions) MUST respond within 500ms.
- **Real-time Updates**: Real-time data synchronization MUST deliver updates within 2 seconds of source changes.
- **Database Queries**: Database queries MUST use indexes and complete in under 100ms for common operations.
- **Image Optimization**: All images MUST use Next.js Image component with lazy loading and responsive srcsets.
- **Bundle Size**: Client JavaScript bundles MUST be code-split and tree-shaken. Monitor bundle size with each build.
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1 on production deployments.

**Rationale**: Performance directly impacts user satisfaction and retention. Real-time systems require predictable latency. Resource optimization reduces costs and environmental impact.

### V. Simplicity & Pragmatism

Favor simple, working solutions over complex abstractions:

- **YAGNI Principle**: Implement only what is needed now. No speculative features or premature abstractions.
- **Justified Complexity**: Any deviation from simple patterns MUST be documented in plan.md Complexity Tracking table with rationale.
- **Database Schema**: Keep schema simple. Start with 4 core tables. Additional tables require justification.
- **Technology Choices**: Use approved stack (Next.js 15+, TypeScript 5.6+, HeroUI v2, Supabase, React 18+). New dependencies require justification.
- **No Over-Engineering**: Avoid design patterns (Repository, Factory, etc.) unless specific need demonstrated. Direct approaches preferred.
- **Pragmatic Decisions**: When existing working code differs from idealized design, document reality rather than forcing refactors unless justified.

**Rationale**: Simple systems are easier to understand, maintain, and debug. Pragmatism delivers value faster. Complexity should solve real problems, not theoretical ones.

## Technology Stack Requirements

**Approved Technologies** (Constitution-Compliant):

- **Framework**: Next.js 15+ (App Router), React 18+
- **Language**: TypeScript 5.6+ with strict mode enabled
- **UI Library**: HeroUI v2 components, Tailwind CSS 4+
- **Database**: Supabase (PostgreSQL with Row Level Security, Auth, Realtime, Storage)
- **Validation**: Zod 4+ for all schema validation
- **Testing**: Playwright 1.56+ (E2E), Vitest 3.2+ (Unit), Storybook 9.1+ (Component)
- **Code Quality**: ESLint 9+ (flat config), Prettier 3.5+
- **Notifications**: Web Push API with service workers
- **Theme**: next-themes for dark/light mode support

**Prohibited Patterns** (Without Justification):

- Class-based components (use function components)
- PropTypes (use TypeScript interfaces)
- Redux or complex state management (use React hooks and server state)
- Mutation libraries (use immutable patterns)
- any type annotations (use explicit types or unknown)

## Development Workflow

**Feature Development Process**:

1. **Specification**: Create feature spec in `/specs/[###-feature-name]/spec.md` with prioritized, independently testable user stories.
2. **Planning**: Generate implementation plan with `/speckit.plan` command including constitution compliance check.
3. **Task Breakdown**: Generate tasks with `/speckit.tasks` command, organized by user story priority.
4. **Test-First Implementation**: For each user story:
   - Write E2E tests that fail
   - Write component tests that fail
   - Get tests reviewed and approved
   - Implement feature to make tests pass
   - Verify accessibility, performance, and constitution compliance
5. **Independent Validation**: Each user story MUST be demonstrable and testable independently before moving to next priority.
6. **Incremental Delivery**: Deploy MVP (P1 stories) first, then add P2, P3 stories incrementally.

**Pull Request Requirements**:

- All E2E tests MUST pass
- All component tests MUST pass
- ESLint MUST report zero errors
- Accessibility audit MUST pass (Storybook a11y addon)
- Performance targets MUST be verified for new features
- Constitution compliance MUST be verified via checklist in PR description

**Code Review Focus**:

- Type safety verification (no any, explicit types)
- Test coverage completeness
- Accessibility compliance
- Performance impact assessment
- Simplicity verification (complexity justified?)
- Error handling completeness

## Governance

**Authority**: This constitution supersedes all other development practices, style guides, and conventions. When conflicts arise, constitution principles take precedence.

**Amendment Process**:

- Amendments require documentation of rationale and impact analysis
- Version MUST increment according to semantic versioning:
  - **MAJOR**: Backward-incompatible principle removals or redefinitions
  - **MINOR**: New principles added or material expansions
  - **PATCH**: Clarifications, wording improvements, typo fixes
- All templates (plan-template.md, spec-template.md, tasks-template.md) MUST be updated to align with amendments
- Amendment changes MUST be documented in Sync Impact Report at top of this file

**Compliance Verification**:

- Constitution check MUST pass in plan.md before research phase begins
- Constitution check MUST be re-verified after design phase
- Each principle violation MUST be justified in plan.md Complexity Tracking table
- Final feature review MUST verify all principles met or violations properly justified

**Continuous Improvement**:

- Constitution SHOULD be reviewed after each major feature completion
- Principles SHOULD be refined based on lessons learned
- Simplicity principle SHOULD guide removal of outdated or unnecessary rules

**Version**: 1.0.0 | **Ratified**: 2025-11-05 | **Last Amended**: 2025-11-05
