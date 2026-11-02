# AI Development Changelog — MedCompare India

> **A concise, high-level history of architectural and feature milestones in MedCompare.**

---

## 2026-11-02

### Added
- **Smart Medicine Detection & "Currently Comparing" Header in Chrome Extension (`v1.8.1`)**:
  - **Fixed Slogan Extraction Bug**: Eliminated bug where generic `h1` selectors on pharmacy sites extracted boilerplate marketing slogans (e.g. Truemeds' `"Order Medicines Online with Truemeds, India's Trusted E-Pharmacy"`) instead of the medicine name (`Neurobion Forte Tablet 30`).
  - **Intelligent Anti-Boilerplate Filtering (`isBoilerplateOrGenericText`)**: Added regex-based screening that rejects site slogans, e-commerce navigation terms, and generic branding across all supported platforms.
  - **4-Layer Resilient Extraction Pipeline**: Added non-header DOM traversal, breadcrumb hierarchy parsing, URL slug extraction with SKU cleaning, and OpenGraph/meta tag fallbacks across all 8 pharmacy platforms.
  - **Prominent "CURRENTLY COMPARING" Header**: Added dedicated status banner with a pulsing live green dot, platform tag (`From Truemeds`), and bold medicine title to make the active medicine immediately identifiable in the sidebar and popup.
  - **Interactive Inline Switcher**: Added an inline `"✏️ Change"` toggle and search form directly inside the sidebar header so users can refine search terms or compare other medicines without leaving the page.
  - **Enhanced Floating Trigger**: Trigger button now displays the detected medicine name (`Compare on 8 Stores: Neurobion Forte...`).
- **Interactive 3-Card Result Hub (`v1.8.0`)**:
  - **3-Card Section Navigation (`ResultHubNav.jsx`)**: Replaced long vertical page stacking with an interactive 3-card hub allowing users to tap between Store Comparison, Generic Substitutes, and Medicine Info & Safety.
  - **Live Preview Badges**: Each card displays summary micro-metrics (e.g. lowest price ₹/tab, fastest SLA, generic savings %, active salt) before clicking.
  - **Focused vs All View Toggle**: Added a toggle switch letting users choose between single-section focused view and traditional all-in-one stacked view.
  - **Cross-Section Links**: Generic callout banner smoothly activates the Generics & Savings tab with automatic focus.
- **Live Community Feature Suggestions & Real-Time Upvoting (`v1.7.0`)**:
  - **Cleaned Mock Data**: Removed hardcoded placeholder suggestions (`COMMUNITY_IDEAS`) and fake vote numbers from `SuggestFeatureModal.jsx`.
  - **Persistent Backend Storage (`suggestionService.js`)**: Added server-side JSON file persistence in `server/data/feature_suggestions.json` with input sanitization, title/description validation, and privacy protection (submitter emails kept confidential).
  - **API Endpoints (`server/src/routes/api.js` & `client/src/utils/api.js`)**: Added `GET /api/feature-suggestions`, `POST /api/feature-suggestions`, and `POST /api/feature-suggestions/:id/vote`.
  - **Interactive Community Roadmap & Upvoting**: Enabled real-time upvoting and unvoting with optimistic UI updates and `localStorage` persistence (`medcompare_voted_features`) across user sessions.
  - **Dedicated Zero-State & Category Styling**: Built an encouraging empty state when no ideas have been submitted yet, with colorful category badges (Platform Integration, Savings, OCR, Alerts, Convenience, Safety).
- **Full Responsive Overhaul & UI/UX Uplift (`v1.6.0`)**:
  - **Mobile Navigation Drawer (`Header.jsx`)**: Built an animated bottom drawer for mobile screens (<768px) housing "How It Works", "Suggest Feature", "Report Issue", "Changelog", and theme switcher to prevent header crowding on small mobile viewports.
  - **Dynamic Viewport (`dvh`) & Safe Area Insets**: Converted modals and viewports to `100dvh` to handle mobile browser collapsible toolbars (Safari/Chrome), and added `safe-area-inset-*` margins for modern notched phones.
  - **Touch & Accessibility**: Enforced 44px minimum tap targets, smooth momentum scrolling (`-webkit-overflow-scrolling: touch`), custom high-contrast focus rings (`:focus-visible`), and `prefers-reduced-motion` settings.
  - **Windows Compatibility & Custom Scrollbars**: Refined custom dark/light mode scrollbars for Windows desktop Chromium/Firefox, improved fluid typography across screen sizes with CSS `clamp()`.
- **First-Time User Welcome & Onboarding Guide Modal (`WelcomeGuideModal.jsx`)**: Automatic first-visit modal explaining platform purpose, 3-step usage guide, core benefits (10-min fast delivery, up to 70% generic savings, true unit prices), sample 1-tap searches, and a "Do not show this further" preference checkbox. Also adds a persistent "How it works" button in `Header.jsx`.
- **Chronic Condition Annual Savings Calculator (`SubstituteSection.jsx`)**: Interactive 1-tab/day vs 2-tabs/day dosage toggle calculating yearly family savings (₹/year) when switching from expensive brand medicines to bio-equivalent generics. Includes side-by-side branded vs generic breakdown and CDSCO/WHO-GMP trust badges.
- **High-Impact Generic Substitute Callout Banner (`ComparisonMatrix.jsx`)**: Prominent green gradient banner placed directly above the store comparison carousel highlighting savings % and providing 1-click smooth jump to generic alternatives.
- **1-Click Quick-Select Category Bubbles (`SearchSection.jsx`)**: Horizontal scrollable bubbles for top Indian chronic & acute conditions (BP, Diabetes, GERD, Fever, Cholesterol, Calcium, Allergy, Antibiotic) with 1-tap instant search execution.
- **Native Smartphone Camera Strip Capture (`StripScannerModal.jsx`)**: Added direct camera capture input (`capture="environment"`) with dual "Take Photo (Camera)" and "Upload File" buttons so mobile users don't need to transfer files to desktop.

---

## 2026-10-05

### Fixed
- **Erroneous 411011 Postal Code Geocoding**: Fixed OpenStreetMap Nominatim anomaly where Ward 6 (`postcode: 411011`) polygon was erroneously tagged across Eastern Pune (Kalyani Nagar, Vadgaon Sheri, Viman Nagar). Added locality matching and geographic bounding box correction (`lat 18.535-18.590`, `lng 73.902-73.970`) in both `server/src/services/pincodeService.js` and `client/src/utils/api.js` to accurately resolve to **411014** (and 411006 for Kalyani Nagar / Yerawada).
- **Desktop/Laptop Coarse Geolocation Fallback**: Replaced `{ enableHighAccuracy: false }` with `getPreciseLocation` using `{ enableHighAccuracy: true, timeout: 9000 }` with coarse retry fallback, enabling WiFi BSSID trilateration instead of ISP exchange IP coordinates.
- **Delivery Pincode Overwriting on Page Reload**: In `client/src/App.jsx`, manually set delivery PIN codes are now flagged with `isManual: true` in `localStorage`, preventing automatic background geolocation on homepage landing from clobbering user preferences.

### Changed
- Added `v1.4.1` release note entry in `client/src/components/ChangelogModal.jsx`.

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
