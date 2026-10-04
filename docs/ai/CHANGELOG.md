# AI Development Changelog — MedCompare India

> **A concise, high-level history of architectural and feature milestones in MedCompare.**

---

## 2026-10-04 (session end)

### Fixed
- **Blank Screen / React Rules-of-Hooks Crash**: `ComparisonMatrix.jsx` had an early `return null` guard placed *before* `useCallback` and two `useEffect` calls. Moved the guard to after all hooks and made derived vars (`platforms`, `platformKeys`, etc.) compute safely via optional chaining regardless of whether `data` is null.
- **Missing `useEffect` Import**: `ReportIssueModal.jsx` used `useEffect` (added in previous session) but had not imported it — caused a silent runtime crash. Added `useEffect` to the React import.

### Added
- **ChangelogModal Update Protocol**: As of v1.4.0, every substantive code change session must also add a new versioned entry to `client/src/components/ChangelogModal.jsx` so users can see the live change history in the UI. The `isLatest` flag should be flipped to the new entry and removed from the previous one.

### Changed
- Added `v1.4.0` entry to `ChangelogModal.jsx` covering the hooks fix, Gmail SMTP delivery, smart issue pre-fill, and AI context system.

---

## 2026-10-04

### Added
- **Auto-Fill Searched Medicine in Report Issue**: When a user searches for a medicine and opens the issue report modal (from the header, comparison matrix footer, or individual store cards), the searched product name is automatically pre-filled with an "Auto-filled from search" badge.
- **Store-Specific Discrepancy Reporting**: Added quick-action "Report issue for this store" buttons on each platform comparison card to pre-populate both the medicine name and the target platform.
- **AI Context & Operating System**: Established `AGENTS.md`, `docs/ai/*`, and `.agents/rules/*` to streamline future AI coding workflows and eliminate repetitive codebase re-discovery.

### Fixed
- **Issue Report Email Delivery**: Fixed failed email delivery by configuring direct Gmail SMTP (SSL on port 465) with Google App Password authentication for `raulosandeep93@gmail.com`. Replaced reliance on Resend sandbox domain (`onboarding@resend.dev`), which restricted delivery.
- **Dynamic Environment Reloading**: Updated `emailService.js` to dynamically reload `.env` configurations on dispatch to avoid requiring server restarts.

### Architecture
- Established Gmail SMTP as primary notification transport with Resend API preserved as secondary fallback.

---

## 2026-09-27

### Added
- **Instant Search Autocomplete**: Debounced search dropdown supporting both brand names and active chemical salts with keyboard navigation (`ArrowUp`, `ArrowDown`, `Enter`).
- **Interactive Multi-Card Carousel**: Replaced long vertical list of store cards with a horizontal sliding carousel (3 on desktop, 2 on tablet, 1 on mobile).
- **Auto-Geolocation with Reverse Geocoding**: Browser GPS permission prompt on load with OpenStreetMap Nominatim reverse geocoding to Indian PIN codes and cities.
- **Issue Reporting Flow**: Modal allowing users to report price mismatches, broken links, or missing formulations, with local logging in `server/data/issues.json`.
- **GitHub Pages Frontend CI**: Added GitHub Actions workflow `.github/workflows/deploy-pages.yml` to automatically build and publish `client/dist` to GitHub Pages.

### Changed
- Removed duplicate camera scan icon from inside the search input box, keeping the top "Scan Strip" tab as the single entry point.

### Architecture
- Added client-side dynamic base URL resolution (`apiUrl()` in `client/src/utils/api.js`) to support both local proxying and static GitHub Pages hosting.

---

## 2026-09-26

### Added
- **8-Platform Parallel Price Aggregator**: Simultaneous real-time query engine across Apollo Pharmacy, PharmEasy, Tata 1mg, Netmeds, Truemeds, PlatinumRx, Zepto, and Amazon Pharmacy.
- **Unit Pricing Normalization**: Automated calculation of ₹/tablet, ₹/capsule, and ₹/ml costs.
- **Medicine Strip OCR Scanner**: Image upload OCR analysis using Tesseract.js to detect brand and composition from packaging photos.
- **Generic Substitution Recommendations**: CDSCO-approved salt alternatives offering 50%–80% savings.
- **Dual Theme Support**: Light and dark mode support using CSS custom properties.

### Architecture
- Monorepo structure with `client/` (React + Vite) and `server/` (Node + Express).
- Platform adapter architecture with `Promise.allSettled` parallelization and in-memory TTL caching.
