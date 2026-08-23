# mnemonic-admin

> **Maturity Level**: Emerging — prototype, not production-ready; expect breaking changes
> **Version**: 0.1.0

---

## Table of Contents

- [mnemonic-admin](#mnemonic-admin)
  - [Table of Contents](#table-of-contents)
  - [Usage](#usage)
    - [Markdown Pattern Import](#markdown-pattern-import)
  - [How it works](#how-it-works)
  - [Key Considerations](#key-considerations)
    - [API Dependency](#api-dependency)
    - [Client-Side Validation](#client-side-validation)
    - [No Authentication](#no-authentication)
    - [Split-Pane Layout](#split-pane-layout)
  - [Development Considerations](#development-considerations)
    - [Requirements](#requirements)
    - [Quick Start](#quick-start)
    - [Environment Configuration](#environment-configuration)
    - [Troubleshooting](#troubleshooting)
    - [Building \& Running](#building--running)
    - [Testing](#testing)
    - [Stack](#stack)
    - [Versioning](#versioning)
  - [Documentation](#documentation)

---

## Usage

mnemonic-admin is an internal web UI for the Mnemonic pattern library. It provides a search-first workspace for engineers to:

- Browse patterns without entering a query
- Run semantic search and refine results with lightweight filters
- Inspect pattern metadata, content, chunk summaries, related patterns, and agent associations
- Pivot between related patterns
- Import a single Markdown pattern file through the browser

The UI connects to the Mnemonic API. No authentication is required in phase 1.

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

The application requires a reachable Mnemonic API. Vite requires the `MNEMONIC_API_URL` environment variable only when starting its development server, because it configures the development proxy. The browser API client is configured separately by `VITE_API_BASE_URL`.

### Client-Side Validation

File import validation runs in the browser. The application checks that the Markdown file conforms to the required structure before submission. This reduces invalid submissions but does not replace server-side validation.

### No Authentication

Phase 1 assumes all users accessing the admin workspace are trusted. Authentication and authorization are out of scope and may be added in later phases.

### Split-Pane Layout

The primary workspace uses a fixed split-pane design. Users browse patterns on the left and view details on the right. This layout is optimized for search-driven exploration and pattern comparison.

---

## Development Considerations

### Requirements

Before developing locally, install the following:

- Node.js 24 or later (the repository pins Node 24 in `.nvmrc` and requires it in `package.json`); npm is used to install the locked dependencies.
- A reachable Mnemonic API. To run the Vite development server, set `MNEMONIC_API_URL` to its origin. Optionally set `VITE_API_BASE_URL` to control the browser API base URL; use the values shown in [Quick Start](#quick-start) for local proxying.
- Docker Engine with the Docker CLI to run the canonical Docker-first build.

Install [BATS](https://bats-core.readthedocs.io/) to run the build-script tests. To run the Playwright end-to-end tests, install its Chromium browser once after dependencies are installed:

```bash
npx playwright install chromium
```

### Quick Start

With the requirements in place, create an uncommitted `.env.local` file in the repository root:

```dotenv
MNEMONIC_API_URL=http://localhost:8080
VITE_API_BASE_URL=/v1/api
```

Install dependencies and start Vite:

```bash
npm install
npm run dev
```

Open the URL shown in the terminal, usually `http://localhost:5173`. `VITE_API_BASE_URL=/v1/api` sends browser requests through Vite's development proxy.

The development server includes hot module reloading. Changes to component files, styles, and configuration files are reflected immediately.

### Environment Configuration

`MNEMONIC_API_URL` is required only when starting Vite's development server. Set it in the shell that invokes `npm run dev` or in `.env.local`. It must be the API origin, without `/v1/api`:

```dotenv
MNEMONIC_API_URL=http://localhost:8080
```

In development, Vite proxies `/v1/api` to that origin. It fails with setup guidance when this value is missing, empty, or whitespace only. The proxy only exists while Vite is running.

`VITE_API_BASE_URL` is the browser client's API base URL. To use the development proxy, set it to `/v1/api`:

```dotenv
VITE_API_BASE_URL=/v1/api
```

To call an API directly, set it to a full API base URL instead:

```dotenv
VITE_API_BASE_URL=http://localhost:8080/v1/api
```

Direct browser requests require the API to allow the UI origin through CORS. If `VITE_API_BASE_URL` is not supplied, the current client implementation falls back to `http://localhost:8080/v1/api`.

`MNEMONIC_API_URL` is read only when Vite starts the development server. `VITE_API_BASE_URL` is evaluated when Vite starts or builds; it is not a runtime setting for the static production site. The Docker image serves static files with Nginx and has no Vite proxy. Local production builds, Docker builds, and CI builds do not require `MNEMONIC_API_URL`. To point a production build at a non-default API, set `VITE_API_BASE_URL` when building it.

### Troubleshooting

**API is unreachable:**
Verify that `MNEMONIC_API_URL` is set to the API origin, that `VITE_API_BASE_URL` is `/v1/api` when using the proxy, and that the API is running.

**CORS errors in the browser console:**
Check that `VITE_API_BASE_URL` is set to `/v1/api` in `.env.local`. This routes requests through the Vite development proxy.

**Dev server is not running:**
Start the development server with `npm run dev` before opening the browser. The server must be running on `http://localhost:5173` (or the port shown in the terminal) for the proxy to work.

### Building & Running

**Local Vite build:**

```bash
npm install
npm run build
```

This generates a static build in the `dist/` directory.

**Docker-first build (canonical path):**

```bash
./build/build.sh
```

This builds the application inside Docker and is the canonical release and CI build path. It does not require `MNEMONIC_API_URL`; see [Environment Configuration](#environment-configuration) for the static-site API URL limitation.

### Testing

The project has unit/component, end-to-end, and build-script coverage:

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

**Build-script tests (BATS):**

```bash
bats test/build_build.bats
```

These tests verify that the Docker build wrapper works without `MNEMONIC_API_URL` and does not pass that development-only setting to Docker. Install [BATS](https://bats-core.readthedocs.io/) to run them locally.

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

### Versioning

This project follows [Semantic Versioning 2.0.0](https://semver.org/).

Version is determined from git tags:

```bash
git describe --tags --always
```

---

## Documentation

- [**Architecture decisions**](https://github.com/twistingmercury/mnemonic-docs/blob/develop/docs/architecture/admin/0001-frontend-stack.md)
- [**UI design and interactions**](https://github.com/twistingmercury/mnemonic-docs/blob/develop/docs/architecture/admin/screen-map.md)
