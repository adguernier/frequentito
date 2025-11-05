# API Contracts

**Feature**: Display Current Date on Homepage  
**Branch**: `002-display-current-date`

## No API Contracts Required

This feature is **purely client-side** and requires no backend API endpoints.

**Rationale**:

- Date is retrieved from browser's `new Date()`
- Formatting uses browser's `Intl.DateTimeFormat` API
- No server-side data fetching required
- No Supabase queries needed
- No REST or GraphQL endpoints

**Data Sources**:

- ✅ Browser: `new Date()` for current date
- ✅ Browser: `navigator.language` for locale
- ✅ Browser: `Intl.DateTimeFormat` for formatting

**Server-Side Rendering**:

- Initial date is server-rendered in `app/page.tsx` using `new Date()`
- This is NOT an API contract - it's standard Next.js SSR behavior
- No endpoint exposed, no request/response cycle

---

## If API Contracts Were Needed (N/A)

This section would contain:

- REST endpoint definitions
- Request/response schemas
- Authentication requirements
- Error response formats
- Rate limiting rules

**Status**: ✅ Not applicable for this feature
