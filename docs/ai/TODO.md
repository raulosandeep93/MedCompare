# Backlog & Technical Debt — MedCompare India

> **Known future tasks, roadmap items, and technical debt established from the codebase and documentation.**

---

## 🔴 High Priority

- [ ] **Automated Test Suite for Price Normalizer**:
  - Add test coverage (e.g., using Vitest or Node's native test runner) for [`server/src/services/normalizer.js`](file:///home/hrishi/Desktop/Sandeep/MedCompare/server/src/services/normalizer.js) covering edge cases in pack size regex matching (e.g., `"Strip of 10 tablets"`, `"Bottle of 200ml"`, `"Combipack"`, `"Pack of 3 x 10"`).
- [ ] **Express API Rate Limiting**:
  - Implement IP-based rate limiting (`express-rate-limit`) on compute-heavy routes, particularly `POST /api/scan-strip` (Tesseract OCR execution) and `POST /api/report-issue` (email dispatch).
- [ ] **Production Backend Deployment**:
  - Deploy `server/` to a hosted Node.js environment (Render, Railway, Heroku, or AWS) and configure the `VITE_API_BASE_URL` GitHub Actions secret so the live GitHub Pages site (`https://raulosandeep93.github.io/MedCompare/`) can query live prices.

---

## 🟡 Medium Priority

- [ ] **Expanded Offline Indian PIN Code Pre-Cache**:
  - Add more Tier-1 and Tier-2 Indian city postal codes to the internal lookup table in [`server/src/services/pincodeService.js`](file:///home/hrishi/Desktop/Sandeep/MedCompare/server/src/services/pincodeService.js) to avoid roundtrip latency to OpenStreetMap Nominatim under high load.
- [ ] **URL Shareable Query State**:
  - Sync active search query and PIN code to browser URL search parameters (`?q=dolo+650&pin=560001`) so users can bookmark and share live comparison links directly.
- [ ] **Out-of-Stock Filter Toggle**:
  - Add a quick filter chip in `ComparisonMatrix.jsx` to allow users to toggle visibility of out-of-stock merchant options.

---

## 🟢 Low Priority

- [ ] **Regional Language Localizations**:
  - Provide translated warnings, uses, and side effects in Hindi and regional Indian languages in `MedicineInfoPanel.jsx`.
- [ ] **Dark Mode Preference Memory**:
  - Ensure system OS `prefers-color-scheme` media query is read on initial first-visit before defaulting to light mode.

---

## 🧹 Technical Debt

- [ ] **Duplicate Documentation Cleanup**:
  - In `docs/`, remove case-redundant duplicates (`implementation_plan.md` vs `IMPLEMENTATION_PLAN.md` and `walkthrough.md` vs `WALKTHROUGH.md`) once verified.
- [ ] **Partner / Affiliate API Upgrades for Quick Commerce**:
  - Zepto and Amazon Pharmacy adapters currently utilize calibrated pricing models with direct deep links because neither merchant provides public search APIs. Monitor for official affiliate or merchant catalog endpoints.
- [ ] **Process Signal Handling**:
  - Add `SIGINT` and `SIGTERM` listeners in `server/src/index.js` to ensure graceful cleanup of active network sockets and cache timers on server restart.
