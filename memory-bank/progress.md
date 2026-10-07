# Skills and quality improvements

Last updated: 2026-10-07

## Skills discovered and loaded

- `accessibility` — discovered with `npx skills find accessibility`; loaded from `addyosmani/web-quality-skills`. Reviewed its evidence-led WCAG 2.2 guidance before changing dashboard components.
- `vercel-react-best-practices` — discovered with `npx skills find vercel-react-best-practices`; loaded from `vercel-labs/agent-skills`. The repo is React + TypeScript + Vite, not Next.js; Next-only APIs such as `next/image`, `next/font`, and `next/dynamic` were not introduced. Applied the React guidance to existing React state and to Vite-native document metadata.
- Ecosystem searches: `npx skills find testing` and `npx skills find performance`. The `webapp-testing` skill was explored but not selected/applied because its browser automation setup was unavailable; its unneeded downloaded files are not included in the repository.
- Additional skill chosen: `performance` from `addyosmani/web-quality-skills`. The Vite baseline emitted a >500 kB minified chunk warning (586.32 kB, 175.58 kB gzip), and the dashboard's Recharts charts were imported statically in `frontend/src/App.tsx`. This is a concrete bundle-size issue that the performance skill's code-splitting and measurement guidance covers. The browser performance tooling/Playwright dependency was not available, so no LCP/INP/CLS or field performance gain is claimed.

## Applied changes

### Accessibility (`12e47fb`)

- `frontend/src/App.tsx`: semantic named sections for KPI and chart areas; error message uses `role="alert"`.
- `frontend/src/components/ui/card.tsx`: card titles render as level-2 headings.
- Chart components expose accessible group names and visually hidden equivalent data tables while hiding decorative chart visuals from the accessibility tree; empty-data messages are status content.
- Decorative dashboard/KPI icons and loading skeletons are hidden from assistive technology; loading KPI state indicates `aria-busy`.
- `frontend/src/index.css`: a visible `:focus-visible` outline and reduced-motion accommodation.
- Contrast tokens were checked using their CSS OKLCH values: dark-theme muted/foreground and chart lines against card backgrounds were above 4.5:1; KPI badge foreground/background combinations were above 6:1. This is a token-level calculation, not a full rendered WCAG audit.
- `frontend/index.html` already had `lang="en"`, consistent with the dashboard's English content.

### Vite-compatible React/deployment practice (`4593d88`)

- `frontend/index.html`: meaningful title, description and theme color. These are ordinary static Vite document metadata; no Next.js runtime or deployment platform was added.
- `frontend/src/App.tsx`: React performance guidance against maintaining state derived from other state was reviewed. (The final implementation instead focuses the measured chunk concern below; calculated values continue to be set from fetched movements in the same effect.)

### Additional performance skill (`0add2bb`)

- `frontend/src/App.tsx`: lazy-load both Recharts components through React `lazy`/`Suspense`, with a dimensionally similar accessible skeleton fallback.
- `frontend/src/lib/financial-utils.test.ts`: added a loss/negative-margin case to protect the financial series used by the chart.
- Build comparison: before code splitting, Vite warned that the 586.32 kB minified main chunk exceeded 500 kB (175.58 kB gzip). After splitting, `index` is 188.43 kB (60.03 kB gzip) and `LineChart` is a separate 342.29 kB (100.53 kB gzip) chunk; the oversized-main-chunk warning no longer appears. This is an observed build-output change, not a claim of measured Core Web Vitals improvement.

## Internal project skill

- Added `.skills/dashboard-qa/SKILL.md`, a repo-specific pre-merge QA skill. Inputs are the diff, changed files, project rules/memory, and runtime availability; output is a QA report of exact checks, warnings, manual checks and limitations. Acceptance criteria insist on evidence-based claims, tests/build/lint for frontend changes, preservation of local environment files, and distinction between UI-consumed API routes and backend-only routes.
- Linked it as `.agents/skills/dashboard-qa` so the repository's documented skill discovery location can load the single source of truth from `.skills/`.
- Trial application: reviewed this feature using its guidance. It identified and recorded that lint, 8 Vitest tests and production build pass in the running frontend container, that browser automation/keyboard traversal was not run because no browser-testing package/tool was available, and that `/api/metrics` responds directly at the backend despite an intermittent Vite proxy timeout during one request.

## Verification evidence

- Baseline local `cd frontend && npm test` could not run because `vitest` was not installed locally. `npm install` was blocked by permissions on existing `frontend/node_modules`; no permission workaround or environment file modification was made.
- The documented container toolchain was used instead: `docker compose exec -T frontend npm run lint` passed; `docker compose exec -T frontend npm test -- --run` passed (8 tests); `docker compose exec -T frontend npm run build` passed.
- Final build output: Vite 8.0.8, 2291 modules transformed; split chunks listed above; no large-chunk warning.
- Runtime smoke checks: frontend `/` returned HTTP 200 with the updated metadata; backend `http://localhost:8000/api/metrics` returned HTTP 200. One request through `http://localhost:5173/api/metrics` returned HTTP 502; Compose frontend logs reported `ETIMEDOUT` connecting to the backend container. Direct backend request subsequently returned 200. Treat the proxy incident as intermittent/unresolved rather than as a persistent app failure or as fully verified integration.
- No manual tab-through, assistive technology, rendered accessibility tree, axe/Lighthouse accessibility, browser screenshot, or performance trace was available in this environment. The static implementation and token contrast calculations do not substitute for those checks.
- No backend source changed, so backend tests were not rerun for this work.

## Scope and limitations

- Confirmed application facts remain as recorded in `current-state.md` and `tech-stack.md`: UI uses `GET /api/metrics`, calculates dashboard metrics in the browser, and stack is React/TypeScript/Vite + FastAPI/Compose. Do not infer persistence, Vercel deployment, CI, or consumption of other backend routes.
- This work intentionally did not migrate the app to Next.js, add a browser-test framework, adjust build warning thresholds, or modify user-specific `.env` configuration.