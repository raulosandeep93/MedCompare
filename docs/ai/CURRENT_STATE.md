# Current State — MedCompare India

> **Persistent handoff context for AI coding sessions.**
> Update this file at the end of every significant session. Keep it short and factual.

---

## 📅 Last Updated
**2026-10-05**

---

## 📊 Current Project Status
MedCompare is a fully functioning, responsive web application comparing 8 pharmacy platforms in India. It includes live search autocomplete, automatic browser geolocation with Indian PIN code reverse-geocoding, packaging photo OCR scanning, generic substitution recommendations, side-by-side card/table comparison, and verified email issue reporting.

---

## ✅ Recently Completed
1. **Removed Standalone Platform Availability Bar; Moved Status Inline to Carousel Cards**:
   - Removed `PlatformAvailabilityBar` component import/render from `App.jsx` and all related CSS from `index.css` to reclaim vertical space.
   - Threaded `platformAvailability` prop through `ComparisonMatrix` → `ComparisonCard`.
   - In `ComparisonCard`, `platformAvailable === false` now renders a "Not available for your location" state (red `MapPin` icon, dashed card border) clearly distinguishing delivery-unavailability from medicine-not-found.
2. **High-Accuracy Geolocation & Pune Pincode Resolution Fix (411014 vs 411011)**:
   - Fixed an OpenStreetMap Nominatim anomaly where an oversized polygon for Ward 6 (`postcode: 411011`) erroneously tagged Eastern Pune neighborhoods (Kalyani Nagar, Nagar Road, Wadgaon Sheri) as `411011`, and returned `411001` for Viman Nagar and Kharadi.
   - Implemented `KNOWN_LOCALITY_PINCODES` and `resolvePuneAnomaly` in `server/src/services/pincodeService.js` and `client/src/utils/api.js` with geographic bounding box checks (`lat 18.535-18.590`, `lng 73.902-73.970`) and locality keyword matching (Viman Nagar, Vadgaon Sheri, Kharadi, Chandan Nagar, Somnath Nagar, Ramwadi) to map to **411014**.
   - Added `getPreciseLocation` helper with `{ enableHighAccuracy: true, timeout: 9000 }` to invoke WiFi BSSID trilateration instead of coarse IP/cell tower geolocation.
   - Updated `client/src/App.jsx` and `PincodeModal.jsx` to respect user's manual PIN selection (`isManual: true`) in `localStorage`, preventing background landing auto-detect from clobbering user choices.
2. **Issue Reporting Email Dispatch via Gmail SMTP**:
   - Resolved email delivery failure by activating direct Gmail SMTP with verified Google App Password (`rduulyvuxcwtsxsc`) for `raulosandeep93@gmail.com`.
   - Updated `server/src/services/emailService.js` to prioritize direct Gmail SMTP over Resend's restricted free trial sandbox (`onboarding@resend.dev`).
   - Added dynamic `dotenv` reloading so configuration changes apply without requiring a hard server restart.
3. **Auto-Populating Searched Medicine in Report Issue Modal**:
   - `client/src/components/ReportIssueModal.jsx` now automatically syncs with the active searched medicine or query whenever opened.
   - Wired up context across `Header.jsx`, `ComparisonMatrix.jsx`, and individual `ComparisonCard.jsx` platform cards with store-specific report buttons.
   - Added an **"Auto-filled from search"** badge in the modal UI.
4. **Instant Search Autocomplete & Salt Categorization**:
   - Added debounced autocomplete dropdowns for both medicine names and active chemical salts.
5. **Card Carousel for Alternative Formulations**:
   - Replaced vertical cards with a responsive horizontal carousel (3 on desktop, 2 on tablet, 1 on mobile).

---

## 🔄 Currently in Progress
- Establishing the repository-native AI Context System (`AGENTS.md`, `docs/ai/*`, `.agents/rules/*`) to prevent repetitive full-codebase scanning.

---

## ⚠️ Known Issues
1. **Third-Party Platform Drift**: E-pharmacy sites (Apollo, PharmEasy, 1mg, Truemeds, PlatinumRx) do not guarantee permanent public API stability. If a platform alters its response schema, its specific adapter in `server/src/adapters/` will require updating.
2. **Zepto & Amazon Public APIs**: Neither Zepto nor Amazon Pharmacy provides an open public API without partner credentials. Their adapters estimate pricing and delivery SLAs based on verified platform reference data and redirect users via direct deep links.

---

## 🚫 Current Blockers
*None currently.* The application builds cleanly and both client and server run without errors.

---

## 📁 Recently Modified Areas
- `server/src/services/pincodeService.js`
- `client/src/App.jsx`
- `client/src/utils/api.js`
- `client/src/components/PincodeModal.jsx`
- `client/src/components/ChangelogModal.jsx`
- `server/src/services/emailService.js`
- `server/.env`
- `server/data/issues.json`

---

## 🎯 Next Recommended Actions
1. **Automated Integration Tests**: Add automated test scripts for `server/src/services/normalizer.js` to ensure pack size parsing regexes remain accurate across edge cases.
2. **Rate Limiting Protection**: Add Express rate limiting on `/api/scan-strip` and `/api/report-issue` to prevent spam.
3. **Pincode Service Fallback Enhancements**: Pre-cache more Indian tier-1 and tier-2 city pincodes in `pincodeService.js` for offline/high-load resilience.

---

## 💡 Important Discoveries
- **Gmail SMTP vs Resend**: Resend's free trial domain (`onboarding@resend.dev`) strictly enforces recipient delivery policies (only allows sending to the single account owner registered on that specific Resend key). Direct Gmail SMTP via port 465 with an App Password delivers immediately and reliably into `raulosandeep93@gmail.com`.
- **Node Watch Flag**: Running `node --watch src/index.js` (configured in `server/package.json` as `npm run dev`) automatically restarts the server when adapters or routes change.

---

## ⛔ Do Not Redo
- **DO NOT replace custom CSS with TailwindCSS**: The styling system is intentionally built in `client/src/index.css` using CSS custom properties, responsive glassmorphism, and curated themes.
- **DO NOT revert to Resend as the primary email provider** without verifying a custom domain in Resend's dashboard.
