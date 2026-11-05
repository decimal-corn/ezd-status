# EZD Case Status

React + TypeScript + Vite application for checking Małopolska Voivodeship Office EZD case statuses. The interface is in English; service responses retain their original Polish text.

## Development

Requires Node.js 22.14 or newer and npm.

```sh
npm install
npm run dev
```

Enter the numeric portion of a `WO-I.6121.<number>.2026` case. The application checks the main case first, followed by the rest of a 100-case window. Configure 1–10 concurrent requests, a 5–60 second timeout, and an optional random window shift. Stop preserves partial results. In Check history, use “View results” to open any saved check and “Compare against” to select its comparison baseline. Automatic mode uses the last successful statuses before the displayed check; a selected check compares only cases successfully received in both checks. Delete removes one record and rebuilds the latest known statuses from the remaining history. “Undo deletion” restores the most recently deleted record until another deletion or check is started.

```sh
npm test
npm run build
npm run preview
```

The production build is written to `dist/`. Deploy that directory to a static host.

## Checks and formatting

```sh
npm run check          # Format check, ESLint, TypeScript, tests, production build
npm run typecheck      # Strict TypeScript checking, including tests
npm run lint           # Recommended ESLint, TypeScript, React Hooks and Refresh rules
npm run lint:fix       # Apply available lint fixes
npm run format         # Format the project with Prettier defaults
npm run format:check   # Verify formatting without changing files
```

Prettier uses its defaults (`.prettierrc.json` is empty). `eslint-config-prettier` disables formatting rules that conflict with Prettier. ESLint uses the flat configuration in `eslint.config.js` with ESLint's `defineConfig`; TypeScript runs in strict mode. Typed linting rejects APIs marked `@deprecated`, including in the ESLint configuration itself. `eslint.config.js` is included in `tsconfig.json` with JavaScript checking enabled, so typed linting uses the same project regardless of which file the editor checks first.

Imports and exports are sorted by `simple-import-sort` (side effects, Node built-ins, packages, then relative imports). Control-flow statements always require braces (`curly: all`), and blocks must span multiple lines (`@stylistic/brace-style`, `allowSingleLine: false`). ESLint Stylistic requires blank lines after imports and declaration groups, around blocks and declarations, and before `return`/`throw`. Run `npm run lint:fix` followed by `npm run format` to apply both sets of fixes.

The project uses Vite 8 and its matching React plugin. TypeScript is pinned to the 6.0 minor line because the current `typescript-eslint` peer range is `<6.1`; TypeScript 7 is not yet supported by that toolchain. Node types follow the Node 22 runtime rather than the latest Node major. The `minimatch` override selects the patched 11.x release for ESLint's transitive dependency; remove it when upstream dependency ranges include a fixed release. The build includes type checking.

## Structure

- `src/App.tsx`: page layout and coordination between hooks.
- `src/hooks/useCheckForm.ts`: form state, validation, and request settings.
- `src/hooks/useCheckRunner.ts`: check lifecycle, progress, cancellation, and viewing saved results.
- `src/hooks/useHistory.ts`: history persistence, deletion, and undo.
- `src/hooks/useComparison.ts`: comparison selection and the displayed baseline.
- `src/components/`: typed UI components for settings, main case, results, status groups, changes, errors, and history records.
- `src/types/index.ts`: case, service response, check, and history types.
- `src/lib/cases.ts`: case validation, range construction, and response validation.
- `src/lib/comparison.ts`: pure status comparison rules.
- `src/lib/results.ts`: grouping and statistics without mutating original results.
- `src/lib/history.ts`: pure history operations and saved-check conversion.
- `src/lib/storage.ts`: runtime validation, migration, and localStorage access.
- `src/lib/export.ts`: JSON downloads.
- `src/lib/jsonp.ts`: JSONP transport, timeout, and callback cleanup.
- `src/lib/service.ts`: concurrent request scheduling and cancellation.
- `src/styles.css`: responsive styles with automatic light/dark mode.
- `tests/`: TypeScript regression tests and typed fixtures.

## History and service

History uses the original `ezd-status-history-v1` localStorage key and format, retaining the last 100 runs and the latest successful status per case. Browser storage belongs to an origin: a different hostname or port will have separate history. JSON export downloads a backup; importing history is not implemented.

The application calls `https://app.malopolska.uw.gov.pl/ws/ezd/checkstatus` through the service's JSONP callback interface, as the source page did. No backend or API key is required. Live results require access to that external service. Checks run manually; there is no polling. The case prefix and year remain `WO-I.6121.` and `2026`, matching the source.
