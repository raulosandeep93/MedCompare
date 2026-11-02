# Current State — MedCompare India

> **Persistent handoff context for AI coding sessions.**
> Update this file at the end of every significant session. Keep it short and factual.

---

## 📅 Last Updated
**2026-11-02**

---

## 📊 Current Project Status
MedCompare is a fully functioning, responsive web application comparing 8 pharmacy platforms in India. It includes live search autocomplete, 1-click condition category bubbles, chronic refill annual rupee savings calculator, prominent generic substitution callouts, smartphone camera strip scanning, automatic browser geolocation with Indian PIN code reverse-geocoding, side-by-side card/table comparison, and verified email issue reporting.

---

## ✅ Recently Completed
1. **Chrome Extension Medicine Detection & "Currently Comparing" Header (`v1.8.1`)**:
   - Fixed bug where pharmacy platform SEO boilerplate slogans (such as Truemeds' `"Order Medicines Online with Truemeds, India's Trusted E-Pharmacy"`) were erroneously matched by generic `h1` selectors and sent to search instead of the real product title (`Neurobion Forte Tablet 30`).
   - Implemented intelligent anti-boilerplate rejection filter (`isBoilerplateOrGenericText`) screening out e-commerce slogans, marketing copy, and site taglines.
   - Built resilient 4-layer extraction pipeline across all 8 platforms: non-header DOM traversal, breadcrumb inspection, URL slug decoding with SKU stripping, and OpenGraph/meta tag normalization.
   - Designed prominent `"CURRENTLY COMPARING"` banner in the extension sidebar and popup featuring a pulsing live green dot, explicit source platform tag (`From Truemeds`), and bold medicine title.
   - Fixed stale closure bug in floating trigger button click handler where navigating between medicines in SPAs (e.g. from Neurobion Forte to Ondet 4) updated the button text but retained the old medicine in the click event closure.
   - Dynamically re-runs search when navigating between products while the sidebar is open.
   - Built inline `"✏️ Change"` toggle and search form directly inside the sidebar to let users refine dosage or search any alternative medicine without leaving the page.
   - Enhanced floating page trigger button to display detected medicine name badge (`Compare on 8 Stores: Neurobion Forte...`).
2. **Interactive 3-Card Result Hub (`v1.8.0`)**:
   - Replaced long vertical scrolling with an interactive 3-card hub ([`ResultHubNav.jsx`](file:///home/anisha/Desktop/Sandeep/MedCompare/client/src/components/ResultHubNav.jsx)) allowing users to tap between Store Comparison, Generic Substitutes, and Medicine Info & Safety.
   - Built physical visual bridge with downward connector notches (`▼`), ordinal tab labels (`TAB 1`, `TAB 2`, `TAB 3`), animated live pulse badges (`● VIEWING THIS SECTION`), and explicit action button pills (`Switch to Generics →`).
   - Added in-situ visual connector banner directly underneath the tab cards highlighting the active section with a click hint.
   - Live preview micro-stats on each card showing lowest price, fastest SLA, generic savings %, and clinical salt information.
   - Built a view mode toggle letting users choose between single-section focused view and all-in-one stacked view.
   - Linked generic callout banner directly to the Generics & Savings tab with automatic smooth focus.
2. **Live Community Feature Suggestions & Real-Time Upvoting Roadmap (`v1.7.0`)**:
   - Cleaned mock / placeholder ideas (`COMMUNITY_IDEAS`) and fake vote numbers from `SuggestFeatureModal.jsx`.
   - Built server-side persistent storage in `server/src/services/suggestionService.js` writing to `server/data/feature_suggestions.json`.
   - Exposed API endpoints: `GET /api/feature-suggestions`, `POST /api/feature-suggestions`, and `POST /api/feature-suggestions/:id/vote`.
   - Added client API methods in `client/src/utils/api.js` for fetching, submitting, and voting.
   - Built real upvoting/unvoting support with instant optimistic UI and `localStorage` vote tracking.
   - Built privacy-conscious submission handling (optional submitter email preserved server-side, not leaked to client).
   - Designed a friendly empty state card encouraging users to propose the first feature.
   - Upgraded modal dialogs (`WelcomeGuideModal`, `SuggestFeatureModal`, `ReportIssueModal`) to dynamically adapt to screen size: expanded on desktop monitors (up to 1060px) to utilize screen real-estate, converted benefits and sample search buttons to 3-column and 4-column balanced layouts, and eliminated cramped vertical scrolling on large screens.
   - Fixed auto-suggestion popup re-trigger bug: choosing an autocomplete suggestion or clicking quick condition bubbles previously triggered a secondary debounced fetch for the chosen term that reopened the dropdown; added `skipNameSuggestionsRef` suppression and unified `executeNameSearch` to close and clear suggestions instantly upon selection.
2. **Full Responsive Overhaul & UI/UX Uplift (`v1.6.0`)**:
   - **Mobile Navigation Drawer**: Added sleek slide-up drawer sheet for small screens (<768px) with quick access to "How It Works", "Suggest Feature", "Report Issue", "Changelog", and theme switcher, overcoming cramped header issues.
   - **Windows & Mobile Viewport Compatibility**: Added `100dvh` dynamic viewport unit support for mobile address bar collapse (Safari/Chrome on iOS/Android), custom high-polish Windows overlay scrollbars with smooth scrolling and color transitions.
   - **Touch & Accessibility Standards**: 44px minimum touch targets, `env(safe-area-inset-*)` padding for notched devices, `prefers-reduced-motion` compliance, `:focus-visible` accessible keyboard rings, and fluid typography using CSS `clamp()`.
   - **Cross-Browser & Device Polish**: Tested across small screens (320px–480px), tablets (768px), and ultra-wide desktops (1440px+).
2. **First-Time User Welcome & Onboarding Guide Modal (`WelcomeGuideModal.jsx`)**:
   - Automatic onboarding modal appearing on first landing explaining what MedCompare is, why pharmacies charge different prices, 3-step usage workflow, key benefits (10-min fast delivery, up to 70% generic savings, unit prices, 100% free/neutral), and 1-tap sample searches.
   - Includes "Do not show this further" preference checkbox persisted to `localStorage` (`medcompare_onboarding_dismissed`).
   - Added permanent "How it works" button in `Header.jsx` to let users reopen the guide at any time.
2. **Chronic Condition Annual Savings Calculator (`SubstituteSection.jsx`)**:
   - Interactive 1-tab/day vs 2-tabs/day dosage toggle calculating yearly family savings (₹/year) when switching from expensive brand medicines to bio-equivalent generics.
   - Breakdown of Branded annual cost vs Generic annual cost vs Net annual savings in your pocket.
   - Comprehensive WHO-GMP & CDSCO bioequivalence reassurance trust badges.
2. **High-Impact Generic Substitute Callout Banner (`ComparisonMatrix.jsx`)**:
   - Prominent banner rendered directly above the pharmacy comparison results highlighting exact generic alternatives, savings percentage, and 1-click smooth scrolling to the generic section.
3. **1-Click Quick-Select Health Condition Bubbles (`SearchSection.jsx`)**:
   - Beautiful, scrollable category bubbles under the search bar for top Indian conditions: Blood Pressure (Telma 40), Diabetes (Glycomet GP 2), Acidity/GERD (Pan 40), Fever & Pain (Dolo 650), Cholesterol (Rosuvas 10), Bones & Calcium (Shelcal 500), Allergy & Cold (Montair LC), and Antibiotics (Augmentin 625 Duo).
4. **Native Mobile Camera Photo Capture (`StripScannerModal.jsx`)**:
   - Added `capture="environment"` camera input alongside file picker, allowing smartphones to immediately launch the native camera viewfinder with 1 tap.
5. **Removed Standalone Platform Availability Bar; Moved Status Inline to Carousel Cards**:
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
