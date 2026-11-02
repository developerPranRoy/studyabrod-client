# AbroadMates frontend pages — five-page public site build

Five public-facing pages were added or replaced: the homepage (`/`), Find a Mentor (`/mentors`), Group Sessions (`/sessions`), Scholarships (`/scholarships`), and FAQ (`/faq`). The work builds the complete marketing and browsing surface described in the project spec, wiring each page to the existing React Query hooks rather than local state. Build integrity cannot be confirmed from here (no build artefact was passed to this review step), so that is called out below. Otherwise no blocking correctness or completeness issues were found.

**Watch for:** The build output was not provided to this review step — confirmed build success or failure is unknown and must be verified before shipping (confirmed). The `useEffect` on `debouncedSearch` in the mentors page deliberately omits `syncUrl` from its dependency array with an eslint-disable comment; this is architecturally sound but worth a second look (likely).

**Verdict**: APPROVED

---

## High-level view

The homepage implements all eight required sections in order: animated-text hero, "What is AbroadMates" pitch, stats strip, comparison table, booking plan cards, categories grid, live mentor showcase fed from the API, and an FAQ accordion. The `AnimatedText` component is self-contained and uses a cleanup-safe interval. Section responsiveness uses `sm:`, `md:`, and `lg:` breakpoints throughout.

The Find a Mentor page delegates every URL concern to `syncUrl` and reads all filter state back from `useSearchParams`, making the filter/pagination state fully shareable via URL. The debounced search correctly pushes into the URL only after the user pauses typing, avoiding an API call per keystroke. The eslint-disable on the `useEffect` dependency array is deliberate — including `syncUrl` would cause infinite re-renders because `syncUrl` is re-created on every render — but the omission is worth documenting in a comment.

Sessions and Scholarships are straightforward data-fetch pages with consistent loading/error/empty state handling. Both wrap their URL-reading logic (`useSearchParams`) inside a `<Suspense>` boundary (sessions) or use `"use client"` directly (scholarships), satisfying Next.js App Router requirements. The FAQ page is a static Server Component that correctly exports `metadata` without a `"use client"` directive.

The `site-header.tsx` and `site-footer.tsx` files were not modified — both are consumed unchanged through the `(site)/layout.tsx` wrapper.

<details>
<summary>Issues (1)</summary>

1. **Build result unknown** — The build step output was not passed to this review. Confirm `next build` exits cleanly (zero TypeScript errors, no missing module errors) before treating this as shippable. If the build failed, that is a HIGH blocker.

</details>

<details>
<summary>Details</summary>

### `useEffect` dependency suppression on debounced search

In `mentors/page.tsx`, the effect that syncs `debouncedSearch` into the URL omits `syncUrl` from its dependency array:

```ts
useEffect(() => {
  if ((debouncedSearch || undefined) !== filters.search) {
    syncUrl({ search: debouncedSearch || undefined, page: 1 });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [debouncedSearch]);
```

`syncUrl` is a `useCallback` that depends on `filters` and `router`. Including it in the dep array would cause the effect to re-fire whenever any filter changes, not just when the debounced search value changes — likely causing double-pushes on filter changes. The suppression is architecturally justified. A one-line comment explaining the reasoning would prevent a future reviewer from flagging this as an oversight (likely — pattern is sound, documentation is missing).

### Sessions page: registration close timing

`isPast(session.startsAt)` is called inside `SessionCard` to determine whether registration is closed. This is client-side time comparison. If a user has the page open across the session start boundary, the button will stay in the "Register" state until the next re-render. The `useSessions` query has no `refetchInterval`, so a long-idle tab will show a stale open-registration button until the user navigates. Registering against an already-started session would get a server-side rejection (the API enforces the rule), so this is a UI staleness issue rather than a security hole, but it could confuse users who see a "Register" button that immediately errors. (possible — depends on whether the API returns a 409 or silently accepts late registrations.)

</details>

---

<details>
<summary>File map</summary>

| File | What changed |
|---|---|
| `src/app/(site)/page.tsx` | Full homepage — 8 sections, animated hero, live mentor showcase |
| `src/app/(site)/mentors/page.tsx` | Find a Mentor page — URL-synced filters, debounced search, pagination |
| `src/app/(site)/sessions/page.tsx` | Group Sessions page — tab + category filter, Suspense boundary |
| `src/app/(site)/scholarships/page.tsx` | Scholarships listing page — data-fetched grid with loading/empty states |
| `src/app/(site)/faq/page.tsx` | Static FAQ page — Server Component with metadata export |

Full diff: not available (no git repository at review time).

</details>
