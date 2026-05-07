# Contributing

Thanks for your interest in contributing to this project.

## Development Setup

1. Install dependencies:

```bash
npm ci
```

2. Start the development server:

```bash
npm run dev
```

## Quality Checks

Run these before opening a pull request:

```bash
npm run check
npm test
npm run build
```

## Branching and Commits

1. Create a branch from `main`.
2. Keep commits focused and descriptive.
3. Prefer small pull requests that are easy to review.

## Tests

When expected behavior changes, please add or update tests accordingly. 
Keep tests organized in the `test` directory, and name them after the 
feature or component being verified.

## Pull Requests

1. Describe what changed and why.
2. Include screenshots or gifs for UI changes.
3. Reference related issues when possible.
4. Ensure CI is passing (build and test workflows) before requesting review.

## Code Style

- Follow existing TypeScript and React patterns.
- Keep components and helpers small and focused.
- Avoid unrelated refactors in feature pull requests.

## Reporting Issues

When reporting a bug, please include steps to reproduce, 
expected vs actual behavior, and environment details 
(OS, browser, Node version).
