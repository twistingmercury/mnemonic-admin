# Product Requirements Document: Mnemonic Admin Phase 2 API Contract Alignment

*Gralph processes cycles in this document from top to bottom. Checklist markers are significant: `- [ ]` (open), `- [x]` (complete), `- [~]` (abandoned). Each cycle must be small, independently verifiable, and assigned to exactly one agent.*

## Objective

Correct mismatches between the frontend API client (`src/features/patterns/api/types.ts` and `src/features/patterns/api/client.ts`) and the real Mnemonic API contract exposed at `http://localhost:8080/swagger/doc.json`. Phase 1 built a working UI without consulting the actual API specification; phase 2 aligns the frontend to the real API so requests and responses are correct.

## Problem Statement

Phase 1 implemented browse, search, detail, and import flows with a frontend API layer written without referencing the real Swagger specification. The API client uses incorrect parameter shapes (offset-based pagination instead of cursor-based, wrong parameter names), incorrect response shapes (missing fields, wrong field types), and incorrect field mappings. These mismatches cause the UI to fail against the real API or silently drop critical data.

The second release must correct all contract mismatches so the frontend correctly calls and consumes the API without data loss or request failures.

## Success Criteria

- All API client functions send parameters in the correct shape and field names as specified in the Swagger contract.
- All response types match the real API response structures.
- The UI correctly renders data from the real API without null-reference errors or type assertion failures.
- Pagination works correctly with cursor-based navigation instead of offset-based.
- Search results render chunk-level matches with correct metadata.
- Pattern metadata, related patterns, and graph structures render correctly.
- All automated tests pass with updated fixtures and assertions.

## Scope

### In scope

- Correct `PatternListItem`, `PatternDetail`, `RelatedPattern`, `AgentAssociation`, `ChunkSummary`, pagination, and search response types.
- Update `listPatterns` and `searchPatterns` client functions to send correct parameters and unwrap correct response structures.
- Adapt browse and search result lists to render the correct fields from the real API responses.
- Adapt the pattern detail view to read from the correct nested structures (especially `graph.related_patterns`).
- Update all component and integration tests to use fixtures that match the real API contract.
- Document the Vite dev proxy and `.env.local` configuration for local development.

### Out of scope

- New UI features or visual polish.
- Architectural changes or refactoring unrelated to API contract alignment.
- Changes to the import flow beyond updating type shapes if they affect payload building.
- Backend API changes.

## Constraints and Decisions

- The Swagger spec at `http://localhost:8080/swagger/doc.json` is the source of truth for all API shapes.
- The Vite dev proxy in `vite.config.ts` (already in place) forwards `/v1/api` to `http://localhost:8080`; this is not part of the phase-02 scope.
- The `getPatternChunks` client function already unwraps and normalizes chunks correctly; do not modify it.
- `PatternDetailPane` already has null-coalescing for `agent_associations`; do not modify it unless related-pattern changes require it.
- Every cycle that touches `src/` must include test updates. Do not defer test changes.
- Agent names are the same as phase-01: `react software engineer`, `devops engineer`, and `technical writer`.
- The progress log path is `docs/plans/phase-02/progress.txt`.

## Implementation Plan

- [x] **Cycle 1 - Realign API types with the Swagger specification**: Update type definitions to match the real API contract.
- Agent: `react software engineer`
- Files: `src/features/patterns/api/types.ts`
- Steps:
  - Update `PatternListItem` to remove `version`, `enriched`, `language`, `domain`, `entity_type` and add `enrichment_status: string`.
  - Update `PatternDetail` to add `enrichment_status: string`, `enriched_at?: string`, `enrichment_error?: string | null`, and `graph: { related_patterns: RelatedPattern[], concepts: { name: string }[] }`.
  - Update `PatternDetail` to move `language`, `domain`, `entity_type`, `version` from list item to detail (optional/nullable in detail).
  - Update `RelatedPattern` to remove `description` and `similarity_score?`, add `relationship: string` and `strength: number`.
  - Update `AgentAssociation` to make `agent_name: string` required, make `agent_id` optional (or remove it).
  - Add new `SearchResultItem` type with fields: `pattern_id`, `pattern_name`, `section_title`, `similarity`, `content`, `chunk_index`, `language`, `domain`, `entity_type`, `tags`.
  - Update `PaginatedResponse` to use cursor-based pagination: drop `page`/`page_size`, add `limit`, `cursor`, `has_more`, `next_cursor`.
  - Update `BrowseParams` to drop `page`/`page_size`, add `limit?: number`, `cursor?: string`, `search?: string`, `entity_type?: string`.
  - Update `SearchParams` to drop `page`/`page_size`, add `limit?: number`, `threshold?: number`, rename `agent_id` to `agent`.
  - Replace `SearchResponse` with new shape: `{ metadata: { query: string, search_duration_ms: number, total_candidates: number }, results: SearchResultItem[] }`.
  - Remove `token_count?` from `ChunkSummary` if present.
  - Update or add test fixtures in `src/features/patterns/api/` to match all type changes.
- Verify: `npm run build && npm run test`
- Done: Types match the real API contract, fixtures are updated, and build and test pass.

- [x] **Cycle 2 - Update API client functions to use correct parameters and response shapes**: Fix `listPatterns` and `searchPatterns` to send and consume real API shapes.
- Agent: `react software engineer`
- Files: `src/features/patterns/api/client.ts`, `src/features/patterns/api/client.test.ts`
- Steps:
  - Fix `listPatterns` to send `limit`, `cursor`, `search`, `entity_type` (from `BrowseParams`) instead of `page`/`page_size`.
  - Fix `listPatterns` response handling to unwrap cursor-based pagination: read `pagination: { cursor, has_more, limit, next_cursor }` from response.
  - Fix `searchPatterns` to send `agent` (string name) instead of `agent_id`.
  - Fix `searchPatterns` to send `limit` and `threshold` instead of `page`/`page_size`.
  - Fix `searchPatterns` response handling to unwrap metadata wrapper: read `{ metadata: {...}, results: SearchResultItem[] }` from response.
  - Ensure all client functions throw or normalize API error responses consistently.
  - Update client test fixtures to match real API response shapes.
- Verify: `npm run build && npm run test`
- Done: Client functions send correct parameters and handle real API response shapes, and all client tests pass.

- [x] **Cycle 3 - Adapt the browse list for cursor-based pagination and trimmed list item shape**: Update `PatternResultsList` and `PatternResultRow` to work with the real list response.
- Agent: `react software engineer`
- Files: `src/features/patterns/components/PatternResultsList.tsx`, `src/features/patterns/components/PatternResultRow.tsx`, `src/features/patterns/components/PatternResultsList.test.tsx`
- Steps:
  - Update `PatternResultsList` to handle cursor-based `PaginatedResponse` (no `total`/`page` fields).
  - Update pagination UI to show "Load More" or cursor-based navigation if `has_more` is true instead of calculating pages.
  - Update `PatternResultRow` to no longer render `version`, `language`, `domain` fields (not in list response).
  - Update component and integration test fixtures to use list responses matching the real API shape.
- Verify: `npm run build && npm run test`
- Done: The browse list correctly handles cursor-based pagination and renders only fields present in `PatternListItem`, and component tests pass.

- [x] **Cycle 4 - Adapt search results for the chunk-level search response**: Update `PatternResultsList` and `PatternResultRow` to render search results correctly.
- Agent: `react software engineer`
- Files: `src/features/patterns/components/PatternResultsList.tsx`, `src/features/patterns/components/PatternResultRow.tsx`, `src/features/patterns/components/PatternResultsList.test.tsx`
- Steps:
  - Update `PatternResultsList` to detect search mode (when results are `SearchResultItem[]` instead of `PatternListItem[]`).
  - Update `PatternResultRow` to render `pattern_name`, `section_title`, and `similarity` when in search mode.
  - Keep browse and search rendering branches separate and clear.
  - Update test fixtures to include search result responses with real search metadata.
- Verify: `npm run build && npm run test`
- Done: Search results render chunk-level matches with `pattern_name`, `section_title`, and `similarity`, and component tests pass.

- [x] **Cycle 5 - Correct the pattern detail view for real field names and graph structure**: Update detail rendering to read from the correct nested API structures.
- Agent: `react software engineer`
- Files: `src/features/patterns/components/PatternMetadata.tsx`, `src/features/patterns/components/PatternMetadata.test.tsx`, `src/features/patterns/components/PatternDetailPane.tsx`, `src/features/patterns/components/PatternDetailPane.test.tsx`
- Steps:
  - Update `PatternMetadata` to render `enrichment_status` (string) instead of `enriched` (boolean).
  - Update `PatternMetadata` to handle nullable/optional `version`, `language`, `domain` (may be null or undefined in API response).
  - Update `PatternDetailPane` to read `related_patterns` from `data.graph.related_patterns` instead of `data.related_patterns`.
  - Update related-pattern rendering to show `relationship` and `strength` instead of `description` and `similarity_score`.
  - Update component test fixtures for detail responses to include the `graph` structure.
- Verify: `npm run build && npm run test`
- Done: Pattern detail and metadata render correct field names and read from the correct nested structures, and component tests pass.

- [x] **Cycle 6 - Update the agent filter parameter and PatternFilters component**: Correct agent filter to send `agent` (name) instead of `agent_id`.
- Agent: `react software engineer`
- Files: `src/features/patterns/components/PatternFilters.tsx`, `src/features/patterns/components/filterTypes.ts`, `src/features/patterns/components/PatternFilters.test.tsx`, `src/features/workspace/PatternWorkspace.tsx`
- Steps:
  - Update `FilterState` to use `agent` (string name) instead of `agent_id`.
  - Update `PatternFilters` component to pass `agent` (not `agent_id`) to the search API.
  - Update all references to `FilterState.agent_id` in `PatternWorkspace` to use `agent`.
  - Update component test fixtures and assertions for filter state.
- Verify: `npm run build && npm run test`
- Done: The agent filter sends the correct parameter name (`agent`) to the API, and component tests pass.

- [ ] **Cycle 7 - Add a Vite dev proxy entry to the README and document the .env.local pattern**: Document dev-time configuration.
- Agent: `technical writer`
- Files: `README.md`
- Steps:
  - Document that the dev server proxies `/v1/api` to `http://localhost:8080` via `vite.config.ts`.
  - Document that the default `VITE_API_BASE_URL` must be set to `/v1/api` in `.env.local` during development to avoid CORS errors.
  - Add a brief troubleshooting note about API connectivity during local development.
- Verify: `test -f README.md`
- Done: The README documents the dev proxy setup and `.env.local` pattern for local development.

## Risks and Mitigations

- Risk: Type changes in one cycle cause cascading failures in components not yet updated in the cycle sequence.
- Mitigation: Organize cycles to update types first, then client functions, then components, so changes propagate in dependency order.
- Risk: Test fixtures decay or become inconsistent with real API shapes.
- Mitigation: Every cycle that touches types or client functions includes fixture updates and test verification.
- Risk: Search result handling breaks existing browse logic.
- Mitigation: Keep search and browse rendering branches clearly separated with conditional logic based on result type or mode flag.

## Definition of Done

- `./build/build.sh` exits 0.
- `npx tsc --noEmit` exits 0 with no type errors.
- `npx eslint src/` exits 0 with no lint errors.
- `npx prettier --check .` exits 0 with no formatting violations.
- `npm audit --audit-level=high` exits 0 with no high or critical vulnerabilities.
- `npm run test` exits 0.
- `npm run e2e` exits 0.
- All API client functions send parameters in the correct shape as specified in the Swagger contract.
- All response types match the real API contract.
- The UI correctly renders data from the real API without errors.
- `README.md` documents the dev proxy and `.env.local` configuration.
