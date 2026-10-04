# MedCompare — AI Agent Operating Manual

> **Primary operating guide for AI coding assistants working in the MedCompare repository.**
> Follow this manual to maintain consistency, preserve existing functionality, and minimize token usage.

---

## 🧭 Project Orientation & Documentation Map

Do not scan the entire codebase at the start of a session. Review these targeted documents:

| Document | Purpose | When to Read |
| :--- | :--- | :--- |
| [`docs/ai/PROJECT_CONTEXT.md`](file:///home/hrishi/Desktop/Sandeep/MedCompare/docs/ai/PROJECT_CONTEXT.md) | High-level overview, tech stack, directories, commands | First time entering the project |
| [`docs/ai/CURRENT_STATE.md`](file:///home/hrishi/Desktop/Sandeep/MedCompare/docs/ai/CURRENT_STATE.md) | Current implementation state, blockers, recently modified areas | Every session before making changes |
| [`docs/ai/ARCHITECTURE.md`](file:///home/hrishi/Desktop/Sandeep/MedCompare/docs/ai/ARCHITECTURE.md) | Detailed system architecture, data flow, adapter model | When modifying core data flows or adapters |
| [`docs/ai/DECISIONS.md`](file:///home/hrishi/Desktop/Sandeep/MedCompare/docs/ai/DECISIONS.md) | Architectural Decision Records (ADRs) | Before proposing architectural changes |
| [`docs/ai/TODO.md`](file:///home/hrishi/Desktop/Sandeep/MedCompare/docs/ai/TODO.md) | Known tasks, backlog, technical debt | When looking for next tasks or tracking debt |
| [`docs/ai/CHANGELOG.md`](file:///home/hrishi/Desktop/Sandeep/MedCompare/docs/ai/CHANGELOG.md) | AI-focused change history | When checking what changed in previous sessions |

---

## ⚡ Mandatory Startup Procedure

Before writing or editing code in any session:

1. **Read `AGENTS.md`** (this manual).
2. **Read [`docs/ai/PROJECT_CONTEXT.md`](file:///home/hrishi/Desktop/Sandeep/MedCompare/docs/ai/PROJECT_CONTEXT.md)** for orientation.
3. **Read [`docs/ai/CURRENT_STATE.md`](file:///home/hrishi/Desktop/Sandeep/MedCompare/docs/ai/CURRENT_STATE.md)** to understand the active work context.
4. **Run `git status`** to check for any uncommitted changes present in the working tree.
5. **Identify the smallest set of files** relevant to the user's specific request.
6. **Inspect only those target files** using targeted line ranges or symbol queries.
7. **Make the smallest appropriate, safe change**.
8. **Verify the change** using the repository's verification commands (see [Testing Rules](#testing-rules)).

---

## 🔍 Repository Exploration Rules

- **DO NOT** scan or list the entire repository by default.
- **DO NOT** read large files when only a function or line range is needed.
- **DO NOT** rediscover architectural patterns that are already documented in `docs/ai/`.
- **Prefer targeted file viewing**: Read specific line ranges or grep for exact symbols.
- **Use git history**: Run `git log -n 5 -- <file>` or `git diff` when historical rationale is needed.
- **Expand exploration only when strictly required**: E.g., tracing a broken API contract across the client-server boundary.

---

## 🛠️ Repository-Specific Coding Rules

### Frontend (`client/`)
- **React 19 + Vite**: Functional components with React hooks (`useState`, `useEffect`, `useRef`, `useCallback`).
- **Styling**: Use **Vanilla CSS** with existing design tokens in [`client/src/index.css`](file:///home/hrishi/Desktop/Sandeep/MedCompare/client/src/index.css). **DO NOT install or use TailwindCSS** unless explicitly requested by the user.
- **Icons**: Use `lucide-react` icons exclusively.
- **API Communication**: All frontend network calls should go through helper functions in [`client/src/utils/api.js`](file:///home/hrishi/Desktop/Sandeep/MedCompare/client/src/utils/api.js), which respect `VITE_API_BASE_URL` with local `/api` proxy fallback.
- **State Persistence**: Persist lightweight user preferences (theme, location, recent searches) in `localStorage`.

### Backend (`server/`)
- **Node.js (ES Modules)**: Express 4 application using native `import/export`.
- **Adapter Pattern**: Each pharmacy platform is isolated in [`server/src/adapters/`](file:///home/hrishi/Desktop/Sandeep/MedCompare/server/src/adapters/). Adapters must handle network failures gracefully and return empty arrays or normalized structures rather than throwing unhandled exceptions.
- **Resilient Aggregation**: Parallel requests must use `Promise.allSettled` to prevent one failing platform API from breaking the comparison for others.
- **Data Normalization**: All prices and pack sizes must pass through [`server/src/services/normalizer.js`](file:///home/hrishi/Desktop/Sandeep/MedCompare/server/src/services/normalizer.js) to compute unit prices (₹/tablet or ₹/ml).
- **No External Database**: Rely on in-memory TTL caching (`node-cache`) and append-only JSON files (`server/data/issues.json`). Do not invent database models.

---

## 🐛 Debugging Rules

1. **Reproduce or isolate**: Check error messages and verify exact inputs.
2. **Trace the specific path**: Follow data from `client/src/utils/api.js` -> `server/src/routes/api.js` -> `aggregator.js` -> specific adapter.
3. **Determine root cause**: Check external API responses, payload formats, or environment configs before rewriting logic.
4. **Make smallest safe change**: Fix the issue at the right layer without altering unrelated features.
5. **Verify locally**: Test the endpoint with `curl` or inspect frontend in the browser.

---

## 🧪 Testing & Verification Rules

There is currently no automated test runner (Jest/Vitest). Use the repository's actual verification tools:

- **Client Build Validation**:
  ```bash
  cd client && npm run build
  ```
  Validates JSX syntax, imports, and production asset bundling.
- **Client Linting**:
  ```bash
  cd client && npm run lint
  ```
  Runs `oxlint` for fast static analysis.
- **Server Verification**:
  ```bash
  cd server && node -e 'import("./src/routes/api.js")'
  ```
  Or run targeted node verification scripts or `curl http://localhost:5001/api/...`.

Never remove lint checks or weaken checks just to pass verification. Report verification results honestly.

---

## 🛡️ Git & Workspace Safety Rules

- **NEVER** run destructive git commands (`git reset --hard`, `git clean -fd`, `git checkout -- .`) without explicit user instruction.
- **NEVER** force-push (`git push --force`) or rewrite commit history.
- **ALWAYS** run `git status` before touching files to ensure uncommitted work is preserved.
- **Do not commit secrets**: Keep `.env` files untracked and documented only via `.env.example`.

---

## 🔐 Security Rules

- Never hard-code API keys, passwords, or tokens in source files.
- Store sensitive configuration in `server/.env`.
- Clean all user-submitted inputs before storing or embedding in HTML emails to avoid injection attacks.

---

## 🔄 AI Session Handoff Protocol

Before completing any substantial task or ending an agent session:

1. **Review changes**: Check `git status` and `git diff --stat`.
2. **Validate**: Run `npm run build` in `client` and ensure server boots without error.
3. **Update [`docs/ai/CURRENT_STATE.md`](file:///home/hrishi/Desktop/Sandeep/MedCompare/docs/ai/CURRENT_STATE.md)**:
   - Update `Last updated` date.
   - Summarize recently completed work.
   - List any newly discovered blockers, issues, or next recommended actions.
4. **Update [`docs/ai/DECISIONS.md`](file:///home/hrishi/Desktop/Sandeep/MedCompare/docs/ai/DECISIONS.md)** if a new architectural or design decision was made.
5. **Update [`docs/ai/CHANGELOG.md`](file:///home/hrishi/Desktop/Sandeep/MedCompare/docs/ai/CHANGELOG.md)** if user-facing features or system capabilities were added or changed.
6. **Update [`docs/ai/TODO.md`](file:///home/hrishi/Desktop/Sandeep/MedCompare/docs/ai/TODO.md)** to check off completed items or record genuine follow-ups.
7. **Update [`client/src/components/ChangelogModal.jsx`](file:///home/hrishi/Desktop/Sandeep/MedCompare/client/src/components/ChangelogModal.jsx)** whenever user-visible features or bug fixes are shipped:
   - Add a new version entry at the **top** of the `RELEASES` array with `isLatest: true`.
   - Set `isLatest: false` on the previously-latest entry.
   - Use a bumped semver (patch → bug fixes, minor → new features).
   - Choose appropriate `lucide-react` icons that match the nature of each highlight.
