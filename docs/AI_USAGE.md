# AI usage

## How AI was used

The frontend was built step by step with an AI coding agent (Claude Code), following `../implementation.md`, the relevant `../requirements.md` sections and the rules in `AGENTS.md`. For each step the agent:

- read the step, the `docs/PROGRESS.md` row of the previous step, and only the requirement sections that step listed;
- generated shadcn primitives with the shadcn CLI and wrote the features, pages, routes, slices, tests and (in Step 12) the Playwright spec;
- ran `npx tsc -b && npx eslint . && npm test` (and `npm run build` / `npm run e2e` where required) until they passed;
- wrote the commits and recorded deviations in `docs/PROGRESS.md`.

A human decided scope and order, answered unclear requirements, and reviews and owns the result. Any deviation from the plan is listed in `PROGRESS.md` and was not decided silently.

## What to review

AI output compiles and passes its own tests. That does not make it correct. Give these areas a human review:

- **Auth and session handling**: axios single-flight refresh, logout on refresh failure, and route guards. Authorisation is enforced on the server; check that the UI never relies on hidden buttons for security.
- **Money**: rupee/paise conversion in quote, complete-job and refund forms, and GST/payout display in `InvoiceView`.
- **Payments**: `PayButton`/`startCheckout`, the mock checkout, return-page polling, and the Cashfree SDK injection path. No automated test runs the Cashfree path against the real sandbox.
- **Privacy**: masked leads must never show the street address or contact before acceptance. The E2E checks one lead; the guarantee comes from the API.
- **Tests that mirror the implementation**: component tests use MSW fixtures written by the same agent, so they share its assumptions about API shapes. The Playwright golden path is the main check against the real backend.
- **Accessibility and responsiveness**: Lighthouse a11y on login and request detail, plus a 360 px overflow check on the main pages, were run once in Step 12. Screen-reader and keyboard-only use have not been tested by a person.
- **Copy and UX**: wording, empty states and error messages were written by the agent.
