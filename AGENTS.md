<!-- cSpell:words gofmt godoc itty kagalctl npmjs stdlib -->

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
├── cmd/
│   ├── kagal/                 # Reference agent (Go, cobra)
│   ├── kagalctl/              # Fleet management CLI (Go, cobra)
│   └── kagal-ssh-proxy/       # SSH ProxyCommand helper (Go)
├── packages/
│   ├── @kagal-worker/         # Durable Object library
│   │   └── sql/               # SQLite schema
│   ├── @kagal-proto/          # Generated protobuf-es types
│   ├── @kagal-server/         # Server/frontend library
│   ├── @kagal-agent/          # Agent CLI + library (citty)
│   └── @kagal-test-utils/     # Shared test utilities (private)
├── proto/                     # Protobuf schema (buf.build/kagal/agent)
│   └── kagal/v1/              # Package kagal.v1
├── pkg/
│   ├── agent/                 # Agent library (Go)
│   └── proto/                 # Generated Go protobuf types
│       └── kagal/v1/          # import kagal.dev/pkg/proto/kagal/v1
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

### Hybrid Go + npm

- **Go code** lives at root (`cmd/`, `pkg/`) under
  module `kagal.dev`
- **npm packages** live under `packages/` with scope
  `@kagal/`
- **Demo apps** live under `apps/`

### npm Packages

- `@kagal/proto` — Generated protobuf-es wire types
- `@kagal/worker` — Durable Object library (Agent DO,
  Supervisor DO)
- `@kagal/server` — Server library for frontends
- `@kagal/agent` — TypeScript agent CLI and library
  (citty)
- `@kagal/test-utils` — Shared test utilities (private,
  not published)
- **Demo apps** live under `apps/`

### Go Module

- `pkg/agent` — Go agent library (extensible)
- `cmd/kagal` — Reference agent binary (cobra)
- `cmd/kagalctl` — Fleet management CLI (cobra)
- `cmd/kagal-ssh-proxy` — SSH ProxyCommand helper

Developed after the TypeScript packages stabilise.

## Common Commands

**npm (pnpm workspace):**

```bash
pnpm build        # Build all npm packages
pnpm clean        # Clean all npm packages
pnpm generate     # Regenerate proto (TS + Go)
pnpm lint         # Lint all (root + proto + packages)
pnpm lint:proto   # Format and lint proto files
pnpm test         # Test all npm packages
pnpm precommit    # lint, type-check, build, test
pnpm dev:demo-vanilla  # wrangler dev (vanilla + DO worker)
pnpm dev:demo-hono     # wrangler dev (Hono + DO worker)
pnpm dev:demo-itty     # wrangler dev (itty-router + DO worker)
```

**Go:**

```bash
go build ./...    # Build all Go packages
go test ./...     # Test all Go packages
go vet ./...      # Vet all Go packages
```

## Code Style Guidelines

All packages follow these conventions (enforced by
.editorconfig and ESLint/golangci-lint):

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

### Go

- **Formatting**: gofmt (tabs, standard Go style)
- **Indentation**: Tabs (indent_size 4 for display)
- **Naming**: Follow standard Go conventions
- **Comments**: Godoc format
- **Imports**: Grouped (stdlib, external, internal)
- **Error Handling**: Always check errors, no blank
  identifiers for errors
- **CLI**: cobra for all Go commands

## Development Practices

### Pre-commit Checklist (MANDATORY)

Before committing any changes, ALWAYS run:

1. `pnpm precommit` (if any source changed)

2. `go vet ./...` and `go test ./...` for Go code
   (if changed)

3. Fix any issues found

4. Update AGENTS.md if guidelines change

### DO

- Use workspace protocol (`workspace:^`) for internal
  npm dependencies
- Write tests for all new functionality
- Use `git -C <path>` instead of `cd <path> && git`
- Check existing code patterns before creating new ones
- Keep packages focused on their specific purpose
- Follow strict TypeScript practices

### DON'T

- Create files unless necessary — prefer editing
  existing ones
- Add external dependencies without careful
  consideration
- Ignore TypeScript errors, ESLint warnings, or Go vet
  issues
- Mix concerns between packages
- Use relative imports between npm packages (use
  workspace deps)
- **NEVER commit without explicitly listing files**
- **NEVER use `git add .` or `git add -A`**
- **NEVER rely on the staging area — always list files
  explicitly**
- **NEVER DELETE FILES WITHOUT EXPLICIT PERMISSION**

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
- Go packages use the standard `testing` package
- Test files: `*.test.ts` / `*.spec.ts` (npm) or
  `*_test.go` (Go)

## Build Systems

- **unbuild**: Used by all npm packages
- **buf**: Proto linting, formatting, and BSR publishing
- **go build**: Used for Go binaries in cmd/

## Common Dependencies

- **TypeScript**: strict mode enabled
- **Vitest**: for npm testing
- **ESLint**: Via @poupe/eslint-config
- **buf**: Proto schema tooling (`@bufbuild/buf`)
- **Go**: 1.24+ (see go.mod)
- **Node.js**: >= 20.19.2
- **pnpm**: >= 10.10.0

## TypeScript Configuration

Each package has two tsconfig files:

- `tsconfig.json` — source code only (no Node types)
- `tsconfig.tools.json` — extends tsconfig.json, adds
  Node types for build/test tooling (build.config.ts,
  vitest.config.ts)

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

5. **Go Module Issues**: Run `go mod tidy`

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
- Use `git -C` instead of `cd` for git operations on
  other paths
