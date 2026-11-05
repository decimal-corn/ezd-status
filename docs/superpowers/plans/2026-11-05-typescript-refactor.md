# TypeScript refactor

Goal: preserve existing behavior while replacing JavaScript with strict TypeScript and separating UI, domain rules, persistence, and request lifecycle.

- [x] Introduce explicit case, response, check, and history types; migrate domain functions and tests.
- [x] Separate history persistence/export from pure comparison and history operations.
- [x] Extract check lifecycle, history state, comparison selection, and form state into focused hooks.
- [x] Extract check settings, main case, status groups, changes, errors, and history records into typed components.
- [x] Add recommended ESLint/TypeScript/React rules, Prettier defaults, and runnable checks.
- [x] Verify formatting, lint, strict type checking, regression tests, and production build.

Preserve the existing storage key and history format, English UI, manual checking, cancellation, comparison selection, deletion, and undo. Avoid adding UI features or runtime dependencies beyond React.
