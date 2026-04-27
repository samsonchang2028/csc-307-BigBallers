# Contributing Style Guide

This document outlines the code style and formatting standards for the BigBallers project. All team members must follow these guidelines to maintain consistency across the codebase.

## Automatic Formatting

We use **Prettier** to automatically format code. Before committing, run:

```bash
npm run format
```

This will format all JavaScript, TypeScript, CSS, Markdown, and JSON files according to our standards.

## Linting

We use **ESLint** with Next.js core web vitals rules to catch potential issues. Run:

```bash
npm run lint
```

## Code Style Conventions

### Formatting Rules (Prettier)

| Rule | Setting | Example |
|------|---------|---------|
| **Print Width** | 64 characters | Lines are wrapped at 64 characters for readability |
| **Semicolons** | Required | `const x = 5;` ✅ / `const x = 5` ❌ |
| **Quotes** | Double quotes | `"hello"` ✅ / `'hello'` ❌ |
| **Trailing Commas** | None | `[1, 2, 3]` ✅ / `[1, 2, 3,]` ❌ |
| **Bracket Same Line** | Yes | `const obj = {` (opening brace on same line) |
| **HTML Whitespace** | Ignore | Whitespace in HTML is not significant for formatting |
| **Prose Wrap** | Always | Markdown text wraps at 64 characters |

### ESLint Rules

We enforce **Next.js Core Web Vitals** best practices, which includes:
- React best practices and hooks usage
- Next.js specific rules (optimization, routing, etc.)
- Accessibility standards
- Performance recommendations



## Before You Commit

1. **Format your code**: `npm run format`
2. **Run linter**: `npm run lint`
3. **Fix any errors**: Correct issues flagged by ESLint
4. **Commit**: Once all checks pass

## IDE Setup (Recommended)

For an optimal development experience, install:

- **VS Code Extension**: Prettier - Code formatter
- **VS Code ESLint Extension**

In your VS Code `settings.json`, add:

```json
{
  "editor.defaultFormatter":
    "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

This will automatically format and lint your code each
time you save.

## Questions?

If you're unsure about any style guideline, check
the `.prettierrc` and `eslint.config.mjs` files in
the project root.
