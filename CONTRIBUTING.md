# Contributing to Inkflow

Thanks for your interest in contributing! Here's how to get set up.

## Local Setup

```bash
git clone https://github.com/YOUR_USERNAME/inkflow.git
cd inkflow
pnpm install
cp .env.example .env.local
# fill in your keys
pnpm dev
```

## Branch Naming

- `feat/your-feature` — new features
- `fix/bug-description` — bug fixes
- `chore/task` — config, deps, tooling

## Commit Style

Use conventional commits:
```
feat: add Paystack webhook handler
fix: correct ZeroDev chain ID for Ink mainnet
chore: update dependencies
docs: update README setup steps
```

## Pull Requests

- Open PRs against `main`
- Describe what changed and why
- Link any relevant issues

## Questions?

Open an issue or reach out on Twitter.
