# Routine Executions Pagination

**Goal:** Load Telegram routine executions in bounded server-side pages and release the fix to production.
**Scope:** frontend
**Context:** Legacy Vue 2/Vuetify frontend served from the backend repository's committed `public/` build.
**Created:** 2026-07-30 18:15
**Orchestrator:** feat

## Research
- WORKS — `src/utils/utils.js:202-217` provides `buildQueryWithPagination()`, which converts a caller-provided page into the configured store page size and API `page`/`limit` parameters.
- WORKS — `src/views/TemplateMessagesLogs.vue:11-20,247-251,411-452` uses `server-items-length`, store-backed `totalPages`, and page-driven loading.
- WORKS — `src/store/modules/templateMessagesLogsModule.js:1-31` applies `buildQueryWithPagination()` before the API request.
- MISSING — `src/store/modules/routineExecutionsModule.js:1-29` sends the raw query, so no `limit` reaches the backend.
- MISSING — `src/views/TelegramRoutineExecutions.vue:59-68,235-238,480-508` treats pagination as client-side and reports only the current array length.
- WORKS — the backend already accepts `page` and `limit` through `helpers/db.js:listInitOptions`; no API change is required.
- PRODUCTION — `todofull.club` is proxied to the backend, which serves committed assets from `/root/todo-mujeron/public`.

## Open Questions
None — Victor explicitly requested matching the established pagination pattern and deploying to production.

## Decisions
- Reuse `buildQueryWithPagination()` instead of adding another pagination helper.
- Reset to page 1 when search, status, or routine filters change.
- Keep the existing API response and store shape; only connect the already-populated totals to the table.
- Build the merged frontend source into a clean backend worktree, commit the generated `public/` artifact, merge it to backend `master`, then deploy that merged backend revision.

## Approach
Connect the routine-executions store and view to the same server-pagination path used by sibling log views. The frontend will request only the configured page size, while Vuetify renders the server total and the custom paginator drives subsequent requests.

## Requirements

### What it must do
- Send `page` and the configured `itemsPerPage` as API `page`/`limit`.
- Display the API total and total pages.
- Request the selected page when the paginator changes.
- Return to page 1 when a filter changes.

### What it must NOT do
- Fetch all routine executions into the browser.
- Introduce a new hardcoded page-size limit.
- Modify or delete execution records.
- Deploy an uncommitted or unmerged build.

### Acceptance Criteria
- [x] Initial request contains `page=1` and `limit=30`.
- [x] The table renders at most 30 executions while showing the full server total.
- [x] Selecting page 2 sends `page=2` and renders the second result set.
- [x] Changing search, status, or routine returns to page 1.
- [x] Lint and production build pass.
- [ ] Production no longer returns the MongoDB `$facet` size error for this view.

## Commands
- install: `pnpm install --no-lockfile`
- lint: `pnpm run lint`
- build: `pnpm run build`

## Stage Queue
- [x] Stage 1: Wire the routine execution store into the shared pagination query builder.
- [x] Stage 2: Convert the routine execution table and filters to the established server-pagination pattern.
- [x] Quality Gate: lint + production build.
- [x] Stage 3: Verify page navigation and filter reset through the real UI.
- [x] Final Gate: mechanical checks + acceptance.

## Confidence: 9
The repository already contains the exact helper, store pattern, and Vuetify pattern required. The only deployment-specific step is rebuilding the backend's tracked `public/` artifact from merged source.

## Current Stage: Release

## Pipeline Status
- Current phase: commit and PR
- Mechanical gates: passed
- Review gates: passed
- E2E evidence: passed locally
- PR/CI: pending
- Production decision: confirmed by Victor on 2026-07-30
- Production verification: requested

## Progress Log
- 2026-07-30 18:15 — Plan created (3 stages).
- 2026-07-30 18:15 — Victor authorized implementation, merge, and production deployment.
- 2026-07-30 18:23 — Stages 1-2 completed using the shared pagination helper and sibling table pattern.
- 2026-07-30 18:28 — Lint passed; build exposed undeclared `sweetalert2`, fixed by declaring the already-locked runtime dependency explicitly.
- 2026-07-30 18:32 — `check-patterns --audit-only` passed; `simplify` found no unnecessary abstraction, duplication, dead code, or naming issue.
- 2026-07-30 18:41 — `/artesano` returned WORLD-CLASS with no blocking findings.
- 2026-07-30 18:55 — Local CDP E2E passed: page 1 and 2 requests used `limit=30`, search from page 2 reset to page 1, totals/paginator matched 65 mocked records, console had no errors, and the 375px layout kept document width bounded with horizontal overflow owned by the table.

## Exit Criteria
- [ ] All stages complete
- [ ] All quality gates pass
- [ ] `/check-patterns --audit-only` passes
- [ ] `/artesano` returns WORLD-CLASS
- [ ] Frontend and generated backend build PRs merge to their production branches
- [ ] Live production flow verified
