# Changelog

All notable changes to the **MedCompare** project are documented in this file.

---

## [2026-09-27] - Search Autocomplete, Carousel UX, Geo-Location & Email Reporting

### 🚀 Major New Features

#### 1. Instant Autocomplete Suggestions Dropdown
- **Live Search Suggestions**: Added real-time autocomplete dropdowns for both **"Search by name"** and **"By composition"** inputs.
- **Dual Matching**: Matches on medicine brand names as well as active salt/API compositions.
- **Visual Categorization**: Displays distinct badges for active chemical salts vs. medicine brands, along with therapy category tags (e.g., *Antibiotic*, *Fever & Pain*, *Pain*, *Salt*).
- **Keyboard Navigation**: Full support for `ArrowDown`, `ArrowUp`, `Enter` to select, and `Escape` to dismiss.
- **Character Highlighting**: Matching prefix text is highlighted in real-time.
- **Backend API**: Added `GET /api/suggestions?q=:query&mode=name|composition` returning deduplicated, categorized suggestions with active salts.

#### 2. Card Carousel for Alternatives & Comparison Matrix
- **Top-3 Carousel View**: Replaced the long vertical cards layout with an interactive horizontal carousel.
- **Smooth Navigation**: Added Left (`‹`) and Right (`›`) navigation controls, a live slide position indicator (e.g., `1–3 of 8`), and clickable pagination dots.
- **Responsive Layout**: Displays 3 cards at a time on desktop screens, 2 on tablets, and 1 on mobile screens.

#### 3. Automatic Location Permission & Geolocation
- **Auto-Detect Location on Page Load**: The application prompts for browser geolocation permission (`navigator.geolocation`) upon landing.
- **Reverse Geocoding Endpoint**: Added `GET /api/pincode/reverse-geocode?lat=:lat&lng=:lng` using OpenStreetMap Nominatim to resolve coordinates directly to Indian PIN codes, city, and state.
- **Persistent Memory**: Detected location is saved to `localStorage` and application state, eliminating repeated pincode prompts.
- **Removed Redundant Live Store Scanning Section**: Cleaned up the landing flow by removing unnecessary live store scanning banners, keeping live store availability integrated directly into the comparison matrix.

#### 4. Issue Reporting & Direct Email Notifications
- **Email Notification Dispatcher**: Implemented `emailService.js` supporting both **Resend API** and **SMTP (Nodemailer)**.
- **Target Recipient**: Configured all issue reports to be delivered directly to `raulosandeep93@gmail.com`.
- **Rich HTML Email Notification**: Sends formatted emails containing medicine details, reported store/pharmacy, expected vs actual price, user notes, pincode, and timestamp.
- **Local Persistence**: Backed by persistent JSON logging in `server/data/issues.json` so reports are never lost even if SMTP/API keys are offline.
- **Environment Configuration**: Added `server/.env.example` with instructions for configuring Resend or Gmail App Passwords.

#### 5. Search Bar Polish
- **Removed Duplicate Scan Strip Icon**: Removed the redundant camera icon from inside the search input box, keeping the dedicated top "Scan Strip" tab as the single, clear entry point.

---

### 🛠️ Files Added & Modified

- **Created**:
  - `client/src/components/SearchSuggestions.jsx`: Autocomplete dropdown component with keyboard shortcuts and highlight matching.
  - `server/src/services/emailService.js`: Email service handling Resend & Nodemailer delivery.
  - `server/.env.example`: Template for environment variables.
  - `server/data/issues.json`: Local persistence for reported price/pharmacy issues.
  - `CHANGELOG.md`: Detailed changelog tracking daily enhancements.

- **Modified**:
  - `client/src/components/SearchSection.jsx`: Integrated autocomplete dropdowns with debouncing, outside-click handlers, and removed inner scan-strip button.
  - `client/src/components/ComparisonMatrix.jsx`: Transformed card lists into a multi-item slide carousel with navigation controls.
  - `client/src/components/ReportIssueModal.jsx`: Connected form submission to the live issue reporting and notification endpoint.
  - `client/src/components/PincodeModal.jsx`: Enhanced auto-geolocation detection and reverse geocoding hooks.
  - `client/src/components/Header.jsx`: Streamlined header location badge and indicators.
  - `client/src/App.jsx`: Added landing geolocation trigger, auto-pincode detection, and toast notifications.
  - `client/src/utils/api.js`: Added client API helper functions (`fetchSuggestions`, `reverseGeocodePincode`, `reportIssue`).
  - `client/src/index.css`: Added CSS styles for autocomplete dropdowns, carousel controls, indicators, and dark-mode styling.
  - `server/src/routes/api.js`: Added `/api/suggestions`, `/api/report-issue`, and `/api/pincode/reverse-geocode`.
  - `server/src/services/pincodeService.js`: Added reverse geocoding implementation with caching and fallback.
