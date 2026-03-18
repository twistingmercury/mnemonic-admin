# Product Requirements Document: Mnemonic Admin Phase 1 Pattern Workspace

*Gralph processes cycles in this document from top to bottom. Checklist markers are significant: `- [ ]` (open), `- [x]` (complete), `- [~]` (abandoned). Each cycle must be small, independently verifiable, and assigned to exactly one agent.*

## Objective

Implement a phase-1 web UI for Mnemonic Admin that lets users browse and search
patterns, inspect pattern details, pivot through related patterns, and import a
single Markdown pattern file through the browser.

## Problem Statement

The Mnemonic API already exposes pattern browse, search, detail, and create
endpoints, but there is no web UI for discovery or import. Users currently have
to work through Swagger and shell scripts, which is slow for search-driven
exploration and awkward for single-file ingestion.

The first release should solve the highest-value internal workflow with minimum
surface area: one search-first workspace for technical curators and engineers.

## Success Criteria

- The app builds through the canonical Docker-first path with
  `./build/build.sh` and runs locally in development with `npm run dev`.
- Users can browse patterns without entering a query.
- Users can run semantic search and refine it with lightweight filters.
- Users can select a pattern and inspect its metadata, content, chunk summaries,
  related patterns, and agent associations.
- Users can import one Markdown pattern file through the UI with local
  validation and API submission.
- The project has automated tests for parser logic, API client behavior, and
  core workspace flows.

## Scope

### In scope

- React-based single-page frontend application
- Docker-first build orchestration and CI workflow
- One primary workspace route with split-pane layout
- Pattern browse list, semantic search, and lightweight filters
- Pattern detail rendering and related-pattern pivoting
- Single-file Markdown import flow
- Local file parsing and validation based on the existing shell loader behavior
- Loading, empty, success, conflict, and error states
- Unit, component, and end-to-end test coverage for primary flows

### Out of scope

- Batch import
- Pattern editing or deletion
- Separate agent management screens
- Separate skill management screens
- Folder-level or repository-level ingestion workflows
- Server-side rendering
- Authentication and authorization work

## Styling Constraint

Phase 1 UI is functional only. Apply only the layout styles needed to arrange
elements on screen (flex, grid, width, height, overflow, positioning). Do not
add decorative styling: no colors, no background fills, no styled borders, no
shadows, no typography choices beyond browser defaults. The target aesthetic is
black text on a white background. Decorative polish is explicitly out of scope
for this phase.

## Constraints and Decisions

- Use the approved stack in `docs/adr/0001-frontend-stack.md`: React 19,
  TypeScript, Vite, React Router, TanStack Query, Tailwind CSS, Vitest, React
  Testing Library, Playwright, Docker multi-stage builds, Docker Compose,
  `build/build.sh`, and GitHub Actions.
- Use the approved design docs as source of truth:
  `docs/design/pattern-ui-usecase-diagram.md`,
  `docs/design/pattern-ui-screen-map.md`, and
  `docs/design/tech-stack-justification.md`.
- Treat the Mnemonic API at `http://localhost:8080/v1/api` as the system of
  record.
- Keep the first release client-side only; do not add a backend-for-frontend.
- Treat the GitHub Actions workflow as the CI build definition. This is an
  inference from the referenced engineering handbook and can be changed if the
  repo uses a different CI system.
- Keep the canonical build and test path Docker-first, with workflow YAML
  calling repository scripts instead of embedding build logic directly.
- Keep cycles small enough that one cycle can be completed and verified in one
  gralph iteration.
- Agent names use the available custom subagents for this repository:
  `react software engineer`, `devops engineer`, and `technical writer`.

## Implementation Plan

- [x] **Cycle 1 - Scaffold the frontend app with the approved toolchain**: Create the Vite React TypeScript application and baseline scripts.
- Agent: `react software engineer`
- Files: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/app/App.tsx`, `src/test-setup.ts`
- Steps:
- Initialize the app with React 19, TypeScript, and Vite.
- Add baseline scripts for `dev`, `build`, `test`, and `e2e`.
- Replace starter content with a minimal app root that renders cleanly.
- Add a test setup file and verify the test runner exits 0 with an empty suite.
- Verify: `npm install && npm run build && npm run test`
- Done: The repo contains a working Vite React TypeScript app, `npm run build` exits 0, and `npm run test` exits 0.

- [x] **Cycle 2 - Create the Docker-first build scaffold**: Add the containerized build artifacts and repository build entrypoint.
- Agent: `devops engineer`
- Files: `build/Dockerfile`, `build/build.sh`
- Steps:
- Add a Dockerfile that can build the frontend application in a predictable container environment.
- Add `build/build.sh` as the canonical build entrypoint for local and CI use.
- Keep repository build logic in the script instead of in CI YAML.
- Verify: `test -f build/Dockerfile && test -f build/build.sh`
- Done: The repo contains a Docker-first build scaffold and one script intended to become the canonical build entrypoint.

- [x] **Cycle 3 - Add the CI workflow definition**: Create the GitHub Actions workflow that calls the repository build script.
- Agent: `devops engineer`
- Files: `.github/workflows/frontend-ci.yaml`
- Steps:
- Add a GitHub Actions workflow that runs on pushes and pull requests.
- Make the workflow call `build/build.sh` instead of embedding build logic inline.
- Keep the workflow thin and script-driven.
- Verify: `test -f .github/workflows/frontend-ci.yaml`
- Done: The repository contains a CI workflow file that delegates build logic to `build/build.sh`.

- [x] **Cycle 4 - Add routing, query client setup, and global app providers**: Establish the application runtime shell before feature work starts.
- Agent: `react software engineer`
- Files: `src/main.tsx`, `src/app/App.tsx`, `src/app/router.tsx`, `src/app/providers.tsx`, `src/app/App.test.tsx`
- Steps:
- Add React Router with one primary workspace route.
- Add TanStack Query provider setup.
- Keep the app rendering through a single provider entrypoint.
- Write a component test that the app renders through providers without runtime errors.
- Verify: `npm run build && npm run test`
- Done: The app boots with router and query providers, renders the root route without runtime errors, and component tests pass.

- [x] **Cycle 5 - Implement the workspace shell and top-level split layout**: Render the approved header, discovery rail container, and detail pane container.
- Agent: `react software engineer`
- Files: `src/app/App.tsx`, `src/features/workspace/PatternWorkspace.tsx`, `src/features/workspace/WorkspaceHeader.tsx`, `src/features/workspace/WorkspaceLayout.tsx`, `src/features/workspace/WorkspaceHeader.test.tsx`
- Steps:
- Create the single workspace screen from the approved screen map.
- Add the header with the `Import Pattern` action.
- Render empty left and right pane regions with stable layout structure.
- Write component tests that the header renders and the import action is present.
- Verify: `npm run build && npm run test`
- Done: The app shows the split-pane workspace with a header and visible import action, and component tests pass.

- [x] **Cycle 6 - Create typed Mnemonic API models and client functions**: Add the phase-1 API access layer for browse, search, detail, chunks, and import.
- Agent: `react software engineer`
- Files: `src/features/patterns/api/types.ts`, `src/features/patterns/api/client.ts`, `src/features/patterns/api/client.test.ts`
- Steps:
- Define TypeScript types for pattern list, search response, pattern detail, chunk summaries, pagination, and problem details.
- Implement client functions for `GET /patterns`, `GET /patterns/search`, `GET /patterns/{id}`, `GET /patterns/{id}/chunks`, and `POST /patterns`.
- Normalize problem-detail errors into one frontend error shape.
- Write unit tests covering each client function and problem-detail error normalization using fetch mocks.
- Verify: `npm run build && npm run test`
- Done: All phase-1 pattern API calls are available through one typed client module, and unit tests covering client behavior and error normalization pass.

- [x] **Cycle 7 - Load and render the default browse list in the discovery rail**: Show patterns before the user searches.
- Agent: `react software engineer`
- Files: `src/features/workspace/PatternWorkspace.tsx`, `src/features/patterns/components/PatternResultsList.tsx`, `src/features/patterns/components/PatternResultRow.tsx`, `src/features/patterns/components/PatternResultsList.test.tsx`
- Steps:
- Fetch the default pattern list when the workspace loads.
- Render result rows in the left pane.
- Show core metadata in each row: name, description, tags, and compact secondary metadata.
- Write component tests that the results list renders rows from mocked data and shows an empty state when no results are returned.
- Verify: `npm run build && npm run test`
- Done: Opening the app shows a non-search browse list in the left pane, and component tests for the results list pass.

- [x] **Cycle 8 - Add the semantic search form and search submission flow**: Replace default browse results with ranked search results when a query is submitted.
- Agent: `react software engineer`
- Files: `src/features/patterns/components/PatternSearchForm.tsx`, `src/features/workspace/PatternWorkspace.tsx`, `src/features/patterns/components/PatternSearchForm.test.tsx`
- Steps:
- Add the primary search input and submit action in the discovery rail.
- Call the semantic search endpoint when the user submits a query.
- Preserve the active query in workspace state.
- Write component tests that submitting a query calls the search handler and that the active query remains visible.
- Verify: `npm run build && npm run test`
- Done: The user can submit a semantic query and see search results rendered in the result list region, and component tests for the search form pass.

- [x] **Cycle 9 - Add lightweight search filters for phase-1 fields**: Support tags, language, domain, and agent filters without changing the primary search-first layout.
- Agent: `react software engineer`
- Files: `src/features/patterns/components/PatternFilters.tsx`, `src/features/workspace/PatternWorkspace.tsx`, `src/features/patterns/components/PatternFilters.test.tsx`
- Steps:
- Add filter controls for tags, language, domain, and agent.
- Include active filter values in search requests.
- Keep selected filter state visible in the UI.
- Write component tests that selecting a filter updates visible state and that active filter values are passed to the search handler.
- Verify: `npm run build && npm run test`
- Done: Search requests can be refined with the approved lightweight filters, and component tests for filter state and submission pass.

- [ ] **Cycle 10 - Add result selection and detail-pane loading**: Selecting a result should hydrate the right pane with the full pattern record.
- Agent: `react software engineer`
- Files: `src/features/workspace/PatternWorkspace.tsx`, `src/features/patterns/components/PatternDetailPane.tsx`, `src/features/patterns/components/PatternDetailPane.test.tsx`
- Steps:
- Track the selected pattern ID in workspace state.
- Highlight the selected result row.
- Fetch pattern detail when a result is selected and render an empty state before selection.
- Write component tests that clicking a result triggers detail fetch and that the empty state renders before selection.
- Verify: `npm run build && npm run test`
- Done: Clicking a result loads the selected pattern into the detail pane and preserves left-pane context, and component tests for selection behavior pass.

- [ ] **Cycle 11 - Render the core pattern detail view**: Display metadata and content in a readable structure instead of raw API output.
- Agent: `react software engineer`
- Files: `src/features/patterns/components/PatternDetailPane.tsx`, `src/features/patterns/components/PatternMetadata.tsx`, `src/features/patterns/components/PatternContent.tsx`, `src/features/patterns/components/PatternMetadata.test.tsx`, `src/features/patterns/components/PatternContent.test.tsx`
- Steps:
- Render pattern name, description, tags, language, domain, entity type, version, enrichment status, and timestamps.
- Render full pattern content in a readable document section.
- Keep the layout aligned with the approved wireframe.
- Write component tests that metadata fields and content render correctly from mocked pattern data.
- Verify: `npm run build && npm run test`
- Done: The detail pane shows the main pattern information and content with a structured UI, and component tests for metadata and content rendering pass.

- [ ] **Cycle 12 - Add chunk summaries and agent association sections**: Complete the non-primary supporting sections in the detail pane.
- Agent: `react software engineer`
- Files: `src/features/patterns/components/PatternDetailPane.tsx`, `src/features/patterns/components/PatternSupportSections.tsx`, `src/features/patterns/components/PatternSupportSections.test.tsx`
- Steps:
- Render chunk summaries in a dedicated section.
- Render agent associations in a dedicated section.
- Keep supporting sections clearly separated from the main content area.
- Write component tests that chunk summaries and agent associations render from mocked data.
- Verify: `npm run build && npm run test`
- Done: The detail pane exposes chunk summaries and agent associations as structured supporting content, and component tests pass.

- [ ] **Cycle 13 - Implement related-pattern pivoting inside the detail pane**: Allow pattern-to-pattern navigation without route changes or search-state loss.
- Agent: `react software engineer`
- Files: `src/features/patterns/components/PatternDetailPane.tsx`, `src/features/workspace/PatternWorkspace.tsx`, `src/features/patterns/components/PatternDetailPane.test.tsx`
- Steps:
- Render related patterns as interactive links or buttons.
- Load the clicked related pattern into the detail pane.
- Preserve the active search query, filters, and results list.
- Write component tests that clicking a related pattern loads it into the detail pane and that search state is preserved.
- Verify: `npm run build && npm run test`
- Done: The user can pivot to a related pattern and remain in the same workspace context, and component tests for pivoting behavior pass.

- [ ] **Cycle 14 - Build the import overlay shell and file picker**: Add the import entry flow without submission logic yet.
- Agent: `react software engineer`
- Files: `src/features/import/ImportPatternOverlay.tsx`, `src/features/workspace/PatternWorkspace.tsx`, `src/features/import/ImportPatternOverlay.test.tsx`
- Steps:
- Open and close the import overlay from the header action.
- Add a single-file Markdown picker.
- Add placeholder regions for validation feedback and import outcomes.
- Write component tests that the overlay opens and closes correctly from the header action.
- Verify: `npm run build && npm run test`
- Done: The workspace can open a single-file import overlay that matches the approved wireframe structure, and component tests for open and close behavior pass.

- [ ] **Cycle 15 - Parse Markdown pattern files and extract frontmatter and body**: Establish the browser-side import parser aligned with the existing shell loader.
- Agent: `react software engineer`
- Files: `src/features/import/patternFileParser.ts`, `src/features/import/ImportPatternOverlay.tsx`, `src/features/import/patternFileParser.test.ts`
- Steps:
- Parse one Markdown file into YAML frontmatter and body content.
- Keep parsing logic isolated from UI rendering code.
- Surface parse failures back into the import overlay.
- Write unit tests covering valid frontmatter extraction, body extraction, and parse error cases.
- Verify: `npm run build && npm run test`
- Done: The import flow can read one Markdown file and extract frontmatter and body or return a parse error, and parser unit tests pass.

- [ ] **Cycle 16 - Add local validation for required pattern-file rules**: Block import before API submission when the file shape is invalid.
- Agent: `react software engineer`
- Files: `src/features/import/patternFileValidation.ts`, `src/features/import/ImportPatternOverlay.tsx`, `src/features/import/patternFileValidation.test.ts`
- Steps:
- Validate required frontmatter fields used by the existing loader contract.
- Validate presence of `## Overview`.
- Validate presence of at least one `[//]: pattern` decorator.
- Write unit tests covering each required field, the overview check, the decorator check, and valid file acceptance.
- Verify: `npm run build && npm run test`
- Done: Invalid pattern files are rejected locally with explicit validation messages before submission is allowed, and validation unit tests pass.

- [ ] **Cycle 17 - Translate parsed files into the pattern create payload**: Convert the validated file into the JSON request body expected by the API.
- Agent: `react software engineer`
- Files: `src/features/import/patternPayloadBuilder.ts`, `src/features/patterns/api/types.ts`, `src/features/import/ImportPatternOverlay.tsx`, `src/features/import/patternPayloadBuilder.test.ts`
- Steps:
- Map frontmatter fields into the pattern create request body.
- Convert `agents` into `agent_associations` with default relevance values that match the shell loader behavior.
- Pass the Markdown body as `content`.
- Write unit tests that verify frontmatter fields map to the correct payload shape, agent_associations use the correct default relevance values, and content is passed through unchanged.
- Verify: `npm run build && npm run test`
- Done: A validated pattern file can be transformed into the exact request shape used by `POST /patterns`, and payload builder unit tests pass.

- [ ] **Cycle 18 - Submit imports and render success, conflict, and failure outcomes**: Connect the import overlay to the API and display actionable outcomes.
- Agent: `react software engineer`
- Files: `src/features/import/ImportPatternOverlay.tsx`, `src/features/patterns/api/client.ts`, `src/features/import/ImportPatternOverlay.test.tsx`
- Steps:
- Submit the generated payload to `POST /patterns`.
- Render success, conflict, and problem-detail failure outcomes inside the overlay.
- Keep submission state explicit while the request is in flight.
- Write component tests covering the success outcome, the conflict outcome, and the API failure outcome using mocked API responses.
- Verify: `npm run build && npm run test`
- Done: The import overlay can submit a valid file and show a clear result for success, conflict, or API failure, and component tests for each outcome pass.

- [ ] **Cycle 19 - Refresh workspace state after successful import**: Return the user to discovery with updated data after import succeeds.
- Agent: `react software engineer`
- Files: `src/features/workspace/PatternWorkspace.tsx`, `src/features/import/ImportPatternOverlay.tsx`, `src/features/workspace/PatternWorkspace.test.tsx`
- Steps:
- Refresh the default browse list or rerun the active search after successful import.
- Close the overlay or offer to inspect the imported pattern.
- Preserve the rest of the workspace state.
- Write component tests that a successful import triggers a list refresh and that workspace state is preserved.
- Verify: `npm run build && npm run test`
- Done: A successful import returns the user to a refreshed workspace without losing context unnecessarily, and component tests for post-import refresh pass.

- [ ] **Cycle 20 - Add loading, empty, and error states across browse, search, detail, and import flows**: Make failure and waiting states explicit instead of implied.
- Agent: `react software engineer`
- Files: `src/features/workspace/PatternWorkspace.tsx`, `src/features/patterns/components/PatternResultsList.tsx`, `src/features/patterns/components/PatternDetailPane.tsx`, `src/features/import/ImportPatternOverlay.tsx`
- Steps:
- Add browse loading, browse empty, search loading, search empty, and search error states.
- Add detail loading and detail error states.
- Add import idle, validation error, submitting, success, conflict, and failure states.
- Write component tests for each new state in the results list, detail pane, and import overlay using mocked data and error conditions.
- Verify: `npm run build && npm run test`
- Done: Every primary phase-1 screen region has explicit handling for waiting, empty, and failure conditions, and component tests for each state pass.

- [ ] **Cycle 21 - Audit and fill test coverage gaps**: Review all prior cycle test files and close any missing or shallow coverage.
- Agent: `react software engineer`
- Files: any existing test files under `src/` that need additional cases
- Steps:
- Review coverage across parser, validation, payload builder, API client, and component tests.
- Add missing cases for edge conditions, error branches, and boundary inputs not covered in prior cycles.
- Do not add coverage for behavior that does not exist.
- Verify: `npm run test`
- Done: All prior cycle test files have meaningful coverage of their primary behaviors, edge cases, and error paths.

- [ ] **Cycle 22 - Add UI and end-to-end tests for the main workspace flows**: Prove the search and import workflows from the user’s perspective.
- Agent: `react software engineer`
- Files: `src/features/workspace/PatternWorkspace.test.tsx`, `tests/e2e/pattern-workspace.spec.ts`
- Steps:
- Add UI tests for default browse load, search submission, result selection, and related-pattern pivoting.
- Add end-to-end coverage for one successful import path and one validation failure path.
- Keep the test suite focused on primary user flows rather than exhaustive styling assertions.
- Verify: `npm run test && npm run e2e`
- Done: The highest-value browse, search, detail, and import workflows are covered by automated UI and browser tests.

- [ ] **Cycle 23 - Write contributor-facing setup and usage documentation**: Explain how to run, test, and configure the new frontend.
- Agent: `technical writer`
- Files: `README.md`
- Steps:
- Document local setup, install, development, build, test, and e2e commands.
- Document the expected API base URL and environment configuration.
- Document the single-file import limitations and Markdown pattern-file expectations.
- Verify: `test -f README.md`
- Done: A new contributor can clone the repo, run the app, and understand the import assumptions from `README.md`.

## Risks and Mitigations

- Risk: A cycle spans too many files or behaviors, causing gralph to loop on work that is hard to verify.
- Mitigation: Keep each cycle focused on one visible capability with one concrete verify command.
- Risk: Import parsing drifts from the existing shell loader behavior and creates mismatched payloads.
- Mitigation: Keep parser, validation, and payload translation isolated and covered by unit tests.
- Risk: API-driven UI state becomes fragmented across components.
- Mitigation: Centralize remote data behavior through TanStack Query and one pattern API client module.

## Definition of Done

- `./build/build.sh` exits 0.
- `npx tsc --noEmit` exits 0 with no type errors.
- `npx eslint src/` exits 0 with no lint errors.
- `npx prettier --check .` exits 0 with no formatting violations.
- `npm audit --audit-level=high` exits 0 with no high or critical vulnerabilities.
- `npm run test` exits 0.
- `npm run e2e` exits 0.
- The app provides one working pattern workspace with browse, semantic search,
  lightweight filters, detail inspection, related-pattern pivoting, and
  single-file import.
- `README.md` documents local setup, commands, API assumptions, and import
  limitations accurately.
