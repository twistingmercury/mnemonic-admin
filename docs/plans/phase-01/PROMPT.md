# Ralph Loop Prompt for Mnemonic Admin

You are executing one Ralph loop cycle for the `mnemonic-admin` repository.
Follow the repository-specific rules below.

## Objective

Complete exactly one unchecked cycle from the active PRD, verify it, update the
PRD state, append a progress entry, and stop.

## Inputs

You will be given:

- the active PRD
- the current progress log, if one exists
- the repository working tree

The active PRD for this project is expected to be:

- `docs/plans/phase-01/PRD.md`

The primary supporting documents are:

- `docs/adr/0001-frontend-stack.md`
- `docs/design/tech-stack-justification.md`
- `docs/design/pattern-ui-usecase-diagram.md`
- `docs/design/pattern-ui-screen-map.md`

The canonical progress log path for this repository is:

- `docs/plans/phase-01/progress.txt`

If `docs/plans/phase-01/progress.txt` does not exist, create it when completing
the first cycle.

## Non-Negotiable Rules

1. Execute exactly one PRD cycle.
2. Work only on the first unchecked `- [ ]` cycle in the PRD.
3. Do not skip ahead.
4. Do not combine multiple cycles into one run.
5. Search the repository before editing. Do not assume code or files are
   missing.
6. Respect the cycle’s `Agent`, `Files`, `Steps`, and `Verify` fields.
7. Keep changes scoped to the selected cycle.
8. Run verification before marking the cycle complete.
9. Update the PRD and progress log only after the cycle passes verification.
10. Stop after finishing that one cycle.

## Repo-Specific Build and Test Rules

This project is Docker-first.

- The canonical build path is `./build/build.sh`.
- CI must stay thin and call repository scripts instead of embedding business
  logic directly in workflow YAML.
- Prefer verification that matches the cycle exactly.
- Use `npm run build`, `npm run test`, and `npm run e2e` when the selected cycle
  calls for them or when they are the smallest useful checks.
- When the Docker-first build path is relevant to the cycle, run
  `./build/build.sh`.

Do not introduce host-only workflow assumptions as the primary build contract.

## Frontend-Specific Engineering Rules

- All application source code must be placed under `src/`. Do not create source
  files outside of `src/` unless the cycle explicitly lists a file at the repo
  root (e.g., `index.html`, `vite.config.ts`, `package.json`).
- Treat this repository as a React 19 + TypeScript + Vite application.
- Prefer small, typed modules over large files.
- Keep API access centralized.
- Keep remote data behavior explicit and predictable.
- Add or update tests for changed behavior when the cycle touches parser logic,
  payload translation, API behavior, or user-visible flows.
- Do not add unrelated abstractions, state libraries, or framework changes.
- Do not rewrite the approved architecture during implementation.

## Ralph Loop Procedure

### Step 1: Read the PRD and select the cycle

- Open `docs/plans/phase-01/PRD.md`.
- Find the first unchecked `- [ ]` cycle under `## Implementation Plan`.
- Extract:
  - cycle title
  - cycle description
  - `Agent`
  - `Files`
  - `Steps`
  - `Verify`

If no unchecked cycle exists, stop and report that the PRD is complete.

### Step 2: Read supporting context

- Read the design and stack documents relevant to the selected cycle.
- Read the progress log if it exists.
- Search the codebase before editing anything.

### Step 3: Plan narrowly

- Form a minimal plan that completes only the selected cycle.
- Do not plan future cycles.
- Do not expand scope beyond the listed files and directly necessary support
  files.

### Step 4: Delegate or execute

- If your runtime supports subagents, delegate to the cycle’s named `Agent`.
- If not, execute the cycle directly while still honoring the assigned role.
- Keep the implementation bounded to the selected cycle.

### Step 5: Verify

Run the cycle’s `Verify` command exactly as written unless it is impossible in
the current environment. In addition, run the following baseline checks after
every cycle that produces or modifies source files under `src/`:

**Baseline verification (run after every applicable cycle):**

1. `npx tsc --noEmit` — type check must pass with zero errors
2. `npx eslint src/` — lint must pass with zero errors
3. `npx prettier --check .` — formatting must be clean
4. `npm run test` — all existing unit and component tests must pass
   (skip this check only if no test files exist yet in the repository)
5. `npm audit --audit-level=high` — no high or critical vulnerabilities

These baseline checks are in addition to, not instead of, the cycle’s declared
`Verify` command.

Verification order:

1. targeted checks for the touched code
2. the cycle’s declared `Verify`
3. baseline checks above
4. broader checks only if required by the change

If any check fails:

- fix the problem if it is within the cycle scope
- rerun verification
- do not mark the cycle complete until all checks pass

### Step 6: Update project records

After verification passes:

- change the selected PRD cycle from `- [ ]` to `- [x]`
- append a concise entry to `docs/plans/phase-01/progress.txt`

Each progress entry should include:

- cycle number and title
- date
- summary of work completed
- verification performed
- important follow-up notes, if any

### Step 7: Report and stop

At the end of the loop:

- report what changed
- report what verification passed
- report the next unchecked cycle
- stop

Do not continue into the next cycle.

## Failure Modes to Avoid

- completing more than one cycle in one run
- editing files unrelated to the selected cycle
- skipping repository search and duplicating existing code
- marking a cycle complete before verification passes
- replacing Docker-first verification with host-only assumptions
- embedding complex build logic directly in GitHub Actions YAML
- refactoring architecture that the PRD did not ask to change

## Output Contract

Your final response for a completed loop should contain:

- the completed cycle number and title
- the files changed
- the verification that passed
- the next unchecked cycle

If you could not complete the cycle, state exactly why and do not mark it done.
