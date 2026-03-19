# mnemonic-admin

> **Maturity Level**: Emerging — prototype, not production-ready; expect breaking changes
> **Version**: v0.0.1

---

## Table of Contents

- [Usage](#usage)
- [How it works](#how-it-works)
- [Key Considerations](#key-considerations)
- [Development Considerations](#development-considerations)
- [Versioning](#versioning)

---

## Usage

mnemonic-admin is an internal web UI for the Mnemonic pattern library. It provides a search-first workspace for engineers to:

- Browse patterns without entering a query
- Run semantic search and refine results with lightweight filters
- Inspect pattern metadata, content, chunk summaries, related patterns, and agent associations
- Pivot between related patterns
- Import a single Markdown pattern file through the browser

The UI connects directly to the Mnemonic API at `http://localhost:8080/v1/api`. No authentication is required in phase 1.

### Markdown Pattern Import

To import a pattern, prepare a single Markdown file (`.md` only) with the following required structure:

**Frontmatter:**
- `name` — unique pattern identifier
- `description` — brief summary of the pattern
- Additional optional fields: `domain`, `tags`, `agents` (maps to `agent_name` with default relevance of 0.8)

**Body:**
- `## Overview` section (required)
- At least one `[//]: pattern` decorator

The import overlay in the UI accepts only one file at a time. The application validates the file structure locally in the browser before submitting it to the API. Server-side validation may still reject files that pass client-side checks.

---

## How it works

mnemonic-admin is a client-side React application that:

1. **Queries the Mnemonic API** for pattern metadata, content, and semantic search results
2. **Renders a split-pane workspace** with a pattern list on the left and detail pane on the right
3. **Handles API responses** using TanStack Query for caching, refetching, and state management
4. **Parses Markdown files** locally and translates them into structured JSON for import
5. **Manages workspace state** through React Router and component-level query hooks

When you search for a pattern, the UI sends the search term to the API and displays results ranked by semantic similarity. Selecting a pattern loads its full detail, including related patterns and chunk summaries.

---

## Key Considerations

### API Dependency

The application requires the Mnemonic API to be running at `http://localhost:8080/v1/api`. Without it, the UI cannot function. For development, ensure the API is started before running the UI.

### Client-Side Validation

File import validation runs in the browser. The application checks that the Markdown file conforms to the required structure before submission. This reduces invalid submissions but does not replace server-side validation.

### No Authentication

Phase 1 assumes all users accessing the admin workspace are trusted. Authentication and authorization are out of scope and may be added in later phases.

### Split-Pane Layout

The primary workspace uses a fixed split-pane design. Users browse patterns on the left and view details on the right. This layout is optimized for search-driven exploration and pattern comparison.

---

## Development Considerations

### Quick Start

Ensure Node.js 18+ and Docker are installed.

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the Mnemonic API on `localhost:8080` (if not already running)
4. Start the development server: `npm run dev`
5. Open the browser to the URL shown in the terminal (usually `http://localhost:5173`)

The development server includes hot module reloading. Changes to component files, styles, and configuration files are reflected immediately.

### Environment Configuration

The Vite development server automatically proxies all requests to `/v1/api` to `http://localhost:8080`. This proxy is configured in `vite.config.ts` and prevents CORS errors during development by allowing the browser to make requests that appear to come from the same origin.

The API client reads the API base URL from the `VITE_API_BASE_URL` environment variable. To use the development proxy, create a `.env.local` file in the project root (not committed to version control) and set:

```
VITE_API_BASE_URL=/v1/api
```

This routes all API requests through the Vite proxy to `http://localhost:8080`.

To bypass the proxy and hit the API directly from your local machine, set the full URL instead:

```
VITE_API_BASE_URL=http://localhost:8080/v1/api
```

However, direct requests may trigger CORS errors depending on the API's CORS configuration. The proxy-based approach (using just the path) is recommended for local development.

### Troubleshooting

**API is unreachable:**
Verify that the Mnemonic API is running at `http://localhost:8080`. Start it before running the development server.

**CORS errors in the browser console:**
Check that `VITE_API_BASE_URL` is set to `/v1/api` (not the full URL) in `.env.local`. This ensures requests route through the Vite dev proxy, which avoids CORS issues.

**Dev server is not running:**
Start the development server with `npm run dev` before opening the browser. The server must be running on `http://localhost:5173` (or the port shown in the terminal) for the proxy to work.

### Building & Running

**Local development build:**
```bash
npm install
npm run dev
```

**Production build:**
```bash
npm run build
```

This generates a static build in the `dist/` directory.

**Docker-first build (canonical path):**
```bash
./build/build.sh
```

This builds the application inside a Docker container, ensuring consistency between local and CI environments. It is the authoritative build method for releases and CI/CD.

### Testing

The project uses three levels of testing:

**Unit and component tests (Vitest + React Testing Library):**
```bash
npm run test
```

Tests focus on parser logic, API client behavior, and component interaction. Tests run in watch mode during development and once in CI.

**End-to-end tests (Playwright):**
```bash
npm run e2e
```

E2E tests verify critical user flows: pattern search, selection, related-pattern pivoting, and the import workflow. These tests use Playwright route interception and do not require a running Mnemonic API. The live API is only needed to run the application in development.

### Stack

- **React 19** — UI framework for components and state management
- **TypeScript** — Static type checking for API types and payload translation
- **Vite** — Fast local development server and production bundler
- **React Router** — Client-side routing (one primary route in phase 1, extensible for future screens)
- **TanStack Query** — Server state management, caching, and request orchestration
- **Tailwind CSS** — Utility-first styling with responsive design
- **Vitest** — Fast unit and component test runner
- **React Testing Library** — User-centric component testing
- **Playwright** — End-to-end testing for critical workflows

For rationale and rejected alternatives, see `docs/adr/0001-frontend-stack.md`.

### Versioning <a name="versioning"></a>

This project follows [Semantic Versioning 2.0.0](https://semver.org/).

Version is determined from git tags:

```bash
git describe --tags --always
```

---

## Documentation

- **Architecture decisions** — `docs/adr/0001-frontend-stack.md`
- **UI design and interactions** — `docs/design/pattern-ui-screen-map.md`
- **Implementation plan** — `docs/plans/phase-01/PRD.md`
