---
trigger: always_on
description: "Git and workspace preservation rules"
---

# Git Safety Rules

- **Check Status First**: Always run `git status` before starting modifications to inspect uncommitted user work.
- **Never Discard Working Changes**: Do not execute destructive commands:
  - `git reset --hard`
  - `git clean -fd`
  - `git checkout -- .`
  - `git restore .`
- **No Force Operations**: Never force-push (`git push --force`) or rewrite shared commit history.
- **Small Commits / Diffs**: Make focused, atomic changes. Do not reformat unrelated files or reorder existing imports unnecessarily.
- **Preserve Configuration**: Never overwrite existing user credentials in `.env`.
