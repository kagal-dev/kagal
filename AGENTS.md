<!-- cSpell:words itty npmjs -->

# AGENTS.md

This file provides guidance to AI coding assistants
(Claude Code, GitHub Copilot, Cody, etc.) when working
with code in the Kagal monorepo.

## Project Overview

Kagal (Sumerian for "Great Gate") is a
library for building agent fleet management
platforms on Cloudflare Workers. It provides primitives
for connecting thousands of agents behind NAT to a
central control plane: persistent control channels,
on-demand tunnels, task dispatch, mTLS
authentication, and clone detection.

## Monorepo Structure

```bash
kagal/
├── packages/
│   ├── @kagal-worker/         # Durable Object library
│   │   └── sql/               # SQLite schema
│   ├── @kagal-proto/          # Generated protobuf-es types
│   ├── @kagal-server/         # Server/frontend library
│   ├── @kagal-agent/          # Agent CLI + library (citty)
│   └── @kagal-test-utils/     # Shared test utilities (private)
├── proto/                     # Protobuf schema (buf.build/kagal/agent)
│   └── kagal/v1/              # Package kagal.v1
├── pkg/proto/                 # Generated Go protobuf types
│   └── kagal/v1/              # import kagal.dev/pkg/proto/kagal/v1
├── apps/
│   ├── demo-hono/             # Demo: Hono frontend
│   ├── demo-itty/             # Demo: itty-router frontend
│   ├── demo-nuxt/             # Demo: Nuxt 4 (planned)
│   ├── demo-vanilla/          # Demo: minimal frontend (raw fetch)
│   └── demo-worker/           # Demo: DO worker (wrangler)
├── docs/                      # Reference docs (limits, integration)
├── .github/workflows/         # CI/CD
├── go.mod                     # Go module: kagal.dev
├── pnpm-workspace.yaml        # pnpm workspace config
└── vitest.workspace.ts        # Test configuration
```

### npm Packages

- `@kagal/proto` — Generated protobuf-es types (wire
  protocol + registry records, enums, auth result)
- `@kagal/worker` — Durable Object library (Agent DO,
  Supervisor DO)
- `@kagal/server` — Server library for frontends
- `@kagal/agent` — TypeScript agent CLI and library
  (citty)
- `@kagal/test-utils` — Shared test utilities (private,
  not published)
- **Demo apps** live under `apps/`

A Go module (`kagal.dev`) is planned for after the
TypeScript packages stabilise.

## Architecture Notes

### Service Binding Model

Frontend apps and `@kagal/server` must NOT own or bind
Durable Objects directly. DOs live in a dedicated DO
worker (`demo-worker` / the app's own worker). Frontends
communicate with DOs via a `KAGAL_WORKER: Fetcher`
service binding, so DO workers are not restarted on
frontend redeploys.

`KagalServerEnv extends KagalRegistryEnv` (direct KV
read access) and adds `KAGAL_WORKER: Fetcher`.

### Import Boundary

`@kagal/worker` depends on `cloudflare:workers`, which
is only available inside workerd. Do NOT import value
constants from `@kagal/worker` in server or build/test
config contexts — it breaks Node.js tooling
(`vitest.config.ts`, `build.config.ts`). This boundary
is why `KagalGateway` lives in `@kagal/worker` (same
runtime as the DOs) and the server forwards requests
via the `KAGAL_WORKER` service binding instead of
importing DO code directly. `@kagal/server` re-exports
or redefines any shared constants it needs.

## Common Commands

```bash
pnpm build        # Build all npm packages
pnpm clean        # Clean all npm packages
pnpm generate     # Regenerate proto (TS + Go)
pnpm lint         # Lint all (root + proto + packages)
pnpm lint:proto   # Format and lint proto files
pnpm test         # Test all npm packages
pnpm precommit    # build, lint, type-check, test
pnpm dev:demo-vanilla  # wrangler dev (vanilla + DO worker)
pnpm dev:demo-hono     # wrangler dev (Hono + DO worker)
pnpm dev:demo-itty     # wrangler dev (itty-router + DO worker)
pnpm dev:demo-worker   # wrangler dev (DO worker only)
```

## Code Style Guidelines

All packages follow these conventions (enforced by
.editorconfig and ESLint):

### TypeScript/JavaScript

- **Indentation**: 2 spaces
- **Line Endings**: Unix (LF)
- **Charset**: UTF-8
- **Quotes**: Single quotes for strings
- **Semicolons**: Always use semicolons
- **Brace Style**: 1tbs (one true brace style)
- **Arrow Functions**: Always use parentheses
- **Line Length**: Max 78 characters preferred
- **Comments**: Use TSDoc format for documentation
- **Module System**: ES modules (`type: "module"`)
- **Naming**: camelCase for variables/functions,
  PascalCase for types/interfaces
- **Final Newline**: Always insert
- **Trailing Whitespace**: Always trim

## Development Practices

### Pre-commit Checklist (MANDATORY)

Before committing any changes, ALWAYS run:

1. `pnpm precommit` (if any source changed)

2. Fix any issues found

3. Update AGENTS.md if guidelines change

### DO

- Use workspace protocol (`workspace:^`) for internal
  npm dependencies
- Write tests for all new functionality
- Never use `cd`; for git on a subpath use
  `git -C <subpath>`, but not `-C .` at repo root
- Check existing code patterns before creating new ones
- Keep packages focused on their specific purpose
- Follow strict TypeScript practices

### DON'T

- Create files unless necessary — prefer editing
  existing ones
- Add external dependencies without careful
  consideration
- Ignore TypeScript errors or ESLint warnings
- Mix concerns between packages
- Use relative imports between npm packages (use
  workspace deps)
- **NEVER commit without explicitly listing files**
- **NEVER use `git add .` or `git add -A`**
- **NEVER rely on the staging area — always list files
  explicitly**
- **NEVER DELETE FILES WITHOUT EXPLICIT PERMISSION**
- **NEVER use `cd`** — it causes subsequent tool calls
  to lose working directory context

### Git Workflow

#### Commits

- Always use `-s` flag for sign-off
- Write clear messages describing actual changes
- No AI advertising in commit messages
- Focus commit messages on the final result, not the
  iterations
- Prefer `git -C` over `cd` for operations on other
  paths

#### Direct Commits (MANDATORY)

ALWAYS list files explicitly in the commit command.
Use `git add` only for new/untracked files, then pass
all files (new and modified) to `git commit`.

```bash
# Stage new files, then commit with explicit file list
git add src/new-file.ts
git commit -sF .tmp/commit-add-agent-do.txt -- src/new-file.ts src/changed.ts
```

Temporary message files use a shared prefix with a
meaningful slug. The shared prefix allows composing
multiple messages in parallel and easy clean-up.

- Commit messages: `.tmp/commit-<slug>.txt`
- PR descriptions: `.tmp/pr-<slug>.md`

#### Commit Message Guidelines

- First line: type(scope): brief description (50 chars)
- Blank line
- Body: what and why, not how (wrap at 72 chars)
- Use bullet points for multiple changes
- Reference issues/PRs when relevant

## Workspace Dependencies

When referencing other npm packages in the monorepo:

```json
{
  "dependencies": {
    "@kagal/worker": "workspace:^"
  }
}
```

## Testing Guidelines

- npm packages use Vitest for testing
- Test files: `*.test.ts` / `*.spec.ts`
- Packages that need workerd bindings (`@kagal/worker`,
  `@kagal/server`) use `@cloudflare/vitest-pool-workers`
  to run tests inside workerd. Each such package has a
  `wrangler.jsonc` for test bindings and a
  `tsconfig.tests.json` for test type-checking.
- `@kagal/worker` exports DO accessors `getAgent(env, name)`
  and `getSupervisor(env, name)` for obtaining named DO
  stubs, and a recursive `HealthCheck` interface for
  health aggregation.
- `@kagal/test-utils` provides generic test helpers
  (e.g. `expectStatus`) — no Cloudflare-specific deps.

## Build Systems

- **unbuild**: Used by all npm packages
- **buf**: Proto linting, formatting, and BSR publishing

## Common Dependencies

- **TypeScript**: strict mode enabled
- **Vitest**: for npm testing
- **ESLint**: Via @poupe/eslint-config
- **buf**: Proto schema tooling (`@bufbuild/buf`)
- **Node.js**: >= 20.19.2
- **pnpm**: >= 10.10.0

## TypeScript Configuration

Each package has at least two tsconfig files:

- `tsconfig.json` — source code only (no Node types)
- `tsconfig.tools.json` — extends tsconfig.json, adds
  Node types for build/test tooling (build.config.ts,
  vitest.config.ts)
- `tsconfig.tests.json` — (packages with workerd tests)
  extends tsconfig.json, adds
  `@cloudflare/vitest-pool-workers/types` for test
  files under `src/__tests__/`

## Publishing

npm packages are published via GitHub Actions using
npm's trusted publishing (OIDC). No tokens are stored
as secrets.

### How it works

1. Push a version tag (`v*`) to trigger the
   `publish.yml` workflow
2. GitHub Actions authenticates to npm via OIDC
   (`id-token: write`)
3. `pnpm -r publish:maybe` runs in each package:
   - Checks if `$name@$version` already exists on npm
   - Publishes with `--provenance` if it doesn't
4. npm records the provenance attestation linking the
   published package to this repository and workflow

### Setup (per package on npmjs.com)

Each `@kagal/*` package must be configured as a
trusted publisher on npmjs.com:

- **Repository**: `kagal-dev/kagal`
- **Workflow**: `publish.yml`
- **Environment**: (none)

### Versioning

- A `v*` tag triggers publishing across all packages,
  but only packages whose version was bumped since
  the last publish will actually be released
- `publish:maybe` skips already-published versions,
  making it safe to tag without bumping every package

## Debugging Tips

1. **Build Issues**: Run `pnpm clean` then `pnpm build`

2. **Type Errors**: Check `tsconfig.json` references

3. **Test Failures**: Use `--reporter=verbose` (vitest)

4. **Dependency Issues**: Verify workspace links with
   `pnpm list`

## Claude Code Specific Instructions

- **CRITICAL: Always enumerate files explicitly in git
  commit commands**
- **NEVER use bare `git commit` without file
  arguments**
- **Check `git status --porcelain` before every
  commit**
- NEVER apologise or explain why you did something
  wrong
- Fix issues immediately without commentary
- Stay focused on the task at hand
- **NEVER use `cd`** — it loses working directory
  context for all subsequent tool calls; use
  `git -C <subpath>` for git in subdirectories,
  but not `-C .` at repo root
