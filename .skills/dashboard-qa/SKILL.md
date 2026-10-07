---
name: dashboard-qa
description: Run evidence-based pre-merge QA for this React + Vite financial dashboard and its FastAPI service.
---

# Dashboard pre-merge QA

## Objective

Give reviewers a repeatable, repository-specific verification report for changes to this financial dashboard. Verify the frontend behavior against the API and project documentation without implying that mock data, unconsumed API routes, CI, or production deployment exists when it has not been confirmed.

## When to use

Use before merging a change that affects `frontend/`, dashboard data calculations, the frontend/backend integration, or Docker Compose runtime configuration. Narrow the checks to the changed area, but run the frontend checks for any frontend product change.

## Inputs

- The proposed Git diff and current branch/status.
- Changed file paths and the intended user-visible behavior.
- The current instructions in `AGENTS.md`, `.agents/rules/`, and relevant `memory-bank/` files.
- Runtime availability (`docker compose ps`) if browser/runtime verification is requested or necessary.

## Procedure

1. Inspect `git status --short --branch` and `git diff --check`. Preserve unrelated user changes, especially `.env` files; never stage them as part of the feature.
2. Read the relevant project rules and confirm facts in source. `frontend/src/App.tsx` is the evidence for which API endpoint the UI consumes; `frontend/src/lib/financial-utils.ts` and its test file are the evidence for client-side financial calculations. Do not infer UI support from routes that exist only in `backend/app/routes.py`.
3. For frontend changes, run from `frontend/`:
   - `npm test`
   - `npm run lint`
   - `npm run build`
   If local dependencies are unavailable but the documented Compose frontend is running with its dependencies, use `docker compose exec -T frontend npm test -- --run`, `docker compose exec -T frontend npm run lint`, and `docker compose exec -T frontend npm run build` from the repository root. Record the exact commands and results. Compare build warnings with a known baseline; do not conceal or suppress them just to obtain a clean output.
4. For changes to financial calculation behavior, add or update cases in `frontend/src/lib/financial-utils.test.ts` and run the test suite.
5. For backend/API changes, inspect `backend/app/routes.py` and relevant tests, then run `docker compose exec -T backend pytest -q` when that service and its test dependencies are available. Report pre-existing warnings separately from failures.
6. For changes involving rendering, accessibility, or the API connection, inspect the running app at the actual local/Codespaces URL. Confirm the API route used by the UI responds; in Compose, Vite proxies `/api` to the internal `backend:8000` hostname, which is not a browser URL. Exercise keyboard interactions and inspect accessible names/roles when relevant. State which checks were manual and which tools were unavailable.
7. Review the final diff and ensure claims in docs/memory match checks actually run. Report changed files, command output summaries, warnings, manual checks, limitations, and remaining risks.

## Expected output

A concise QA report containing:

- Scope and files inspected.
- Checks actually run, with pass/fail and relevant warning details.
- Runtime/browser checks actually performed.
- Any pre-existing or newly observed issue, clearly distinguished.
- Unverified claims and remaining risks.
- A merge recommendation only if supported by evidence.

## Acceptance criteria

- The report accurately distinguishes frontend behavior from backend capabilities and mock data from persistence.
- Every stated verification corresponds to an executed command or an explicitly described manual check.
- Relevant tests, lint, and build pass, or their exact failures/blockers are documented without misrepresentation.
- No unrelated local environment configuration is changed or committed.
- The final recommendation follows the recorded evidence and calls out unresolved blockers.

## Constraints

- Do not rewrite the dashboard or migrate its React + Vite architecture as part of QA.
- Do not claim a Vercel/production deployment, CI pipeline, database, authentication, or endpoint consumption without repository evidence.
- Do not bake a Codespaces forwarded hostname into shared configuration or docs.
- Do not suppress warnings by relaxing compiler, lint, or build thresholds unless that change has an independently justified proposal and is documented.
