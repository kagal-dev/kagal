# AGENTS.md

This file provides guidance to AI coding assistants
(Claude Code, GitHub Copilot, Cody, etc.) when working
with code in the Kagal monorepo.

## Project Overview

Kagal (Sumerian for "Great Gate") is a
library/framework for building agent fleet management
platforms on Cloudflare Workers.

## Code Style Guidelines

All packages follow conventions enforced by
.editorconfig and ESLint/golangci-lint:

### TypeScript/JavaScript

- **Indentation**: 2 spaces
- **Line Endings**: Unix (LF)
- **Charset**: UTF-8
- **Quotes**: Single quotes for strings
- **Semicolons**: Always use semicolons
- **Module System**: ES modules (`type: "module"`)
- **Final Newline**: Always insert
- **Trailing Whitespace**: Always trim

### Go

- **Formatting**: gofmt (tabs, standard Go style)
- **Naming**: Follow standard Go conventions
- **Imports**: Grouped (stdlib, external, internal)
- **Error Handling**: Always check errors

## Git Workflow

- Always use `-s` flag for sign-off
- No AI advertising in commit messages
- **NEVER commit without explicitly listing files**
- **NEVER use `git add .` or `git add -A`**
- **NEVER DELETE FILES WITHOUT EXPLICIT PERMISSION**
- Use `git -C` instead of `cd` for operations on
  other paths

```bash
# ALWAYS specify files directly in the commit command
git commit -sF .git/COMMIT_EDITMSG file1.ts file2.ts
```

## Licence

[MIT](LICENCE.txt)
