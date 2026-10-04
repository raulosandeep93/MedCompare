---
trigger: glob
globs: "server/**"
description: "Rules for backend Express API and platform adapters in MedCompare"
---

# Backend (Server) Rules

- **Module System**: Node.js 20 native ES Modules (`"type": "module"`). Use `import/export`, not `require()`.
- **Platform Adapters (`server/src/adapters/`)**:
  - Each platform must remain isolated in its own file.
  - Adapters must implement `search(query, pincode)` returning an array of items.
  - Never throw unhandled rejections from an adapter. Catch external HTTP errors and return an empty array `[]` or fallback object so the rest of the aggregator can proceed.
- **Aggregation Resilience**:
  - Parallel calls to adapters must use `Promise.allSettled`.
  - Cache results in `node-cache` with an appropriate TTL (default 5 minutes).
- **Price Normalization**:
  - All items must be processed through `normalizer.js` to compute uniform `unitPrice` (₹/tablet or ₹/ml) and `discountPercent`.
- **Issue Reporting & Email**:
  - Always append reports to `server/data/issues.json` before attempting email dispatch.
  - Prioritize authenticated Gmail SMTP over Resend sandbox.
  - Reload environment variables dynamically via `dotenv.config({ path: ENV_FILE, override: true })` so runtime config updates take effect immediately.
- **Verification**:
  - Run `cd server && npm run dev` to launch the server with `--watch`.
  - Validate endpoints using `curl http://localhost:5001/api/...`.
