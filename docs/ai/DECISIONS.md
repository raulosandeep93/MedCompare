# Architectural Decisions — MedCompare India

> **Architectural Decision Records (ADRs) documenting deliberate design choices in MedCompare.**

---

## DECISION-001 — 8-Platform Parallel Aggregation with `Promise.allSettled`

**Date**:
2026-09-26

**Decision**:
Query all 8 pharmacy platform adapters in parallel using `Promise.allSettled` rather than sequential execution or `Promise.all`.

**Reason**:
External e-pharmacy APIs have varying response times and occasional network timeouts. If one merchant's endpoint is slow or unreachable, `Promise.allSettled` guarantees that results from all surviving platforms are still aggregated and returned to the patient without breaking the search.

**Alternatives considered**:
- Sequential querying (too slow, would result in 5–10s search latencies).
- `Promise.all` (fragile: one failing adapter causes the entire query to fail).

**Do not**:
Do not replace `Promise.allSettled` with `Promise.all` or sequential `await` loops inside `aggregator.js`.

**Source**:
`server/src/services/aggregator.js`

---

## DECISION-002 — Normalized Unit Pricing Calculation (₹ / Tablet, ₹ / mL)

**Date**:
2026-09-26

**Decision**:
Normalize all medicine prices down to per-tablet or per-ml costs rather than comparing raw package prices directly.

**Reason**:
Strips and bottles are packaged in inconsistent quantities across platforms (e.g., 10 tablets on PharmEasy vs. 15 tablets on Apollo vs. 30 tablets on Truemeds). A direct total MRP comparison misleadingly makes smaller packs look cheaper when their unit cost is significantly higher.

**Alternatives considered**:
- Comparing only total package prices (deceives users on actual unit cost).
- Requiring platforms to return unit prices (most platforms do not supply unit pricing in search results).

**Do not**:
Do not sort or award "Best Value" ribbons solely based on total package price. Always use `unitPrice`.

**Source**:
`server/src/services/normalizer.js`

---

## DECISION-003 — Stateless Server Architecture with In-Memory TTL Cache & Local JSON Logging

**Date**:
2026-09-26

**Decision**:
Keep the backend server stateless, utilizing `node-cache` (5-minute TTL) for query acceleration and a simple append-only JSON file (`server/data/issues.json`) for reported issues.

**Reason**:
MedCompare is an informational search engine. Avoiding an external SQL or NoSQL database eliminates database provisioning costs, connection pool overhead, and operational maintenance.

**Alternatives considered**:
- MongoDB or PostgreSQL for storing medicine catalogs (catalogs drift rapidly; live query with short caching is more accurate than maintaining a stale copy of 8 platforms).

**Do not**:
Do not introduce MongoDB or SQL connections for standard search flows without explicit user requirements.

**Source**:
`server/src/services/aggregator.js`, `server/src/services/emailService.js`

---

## DECISION-004 — Direct Gmail SMTP Primary for Issue Alerts with Resend Fallback

**Date**:
2026-10-04

**Decision**:
Configure authenticated Gmail SMTP (port 465, SSL) as the primary delivery mechanism for issue alerts to `raulosandeep93@gmail.com`, with Resend API retained as secondary fallback.

**Reason**:
Resend's free trial domain (`onboarding@resend.dev`) strictly enforces recipient delivery policies (only allows sending to the single account owner registered on that specific Resend key), which caused reported issues to be rejected or dropped. Gmail SMTP using an authenticated Google App Password guarantees direct, trusted delivery into the admin's inbox.

**Alternatives considered**:
- Resend-only (dropped deliveries when recipient did not match Resend account owner).
- Webhook to Slack/Discord (requires external third-party webhook setup).

**Do not**:
Do not comment out SMTP credentials or prioritize the Resend sandbox over verified Gmail SMTP in `emailService.js`.

**Source**:
`server/src/services/emailService.js`, `server/.env`

---

## DECISION-005 — Vanilla CSS with Custom Design Tokens Instead of TailwindCSS

**Date**:
2026-09-26

**Decision**:
Implement styling strictly in Vanilla CSS inside `client/src/index.css` using CSS custom properties (`--bg-main`, `--text-main`, etc.) and CSS modules/classes rather than TailwindCSS.

**Reason**:
A hand-crafted CSS design system provides fine-grained control over complex glassmorphism effects, platform-specific brand badges, responsive carousels, and dual theme toggling without utility class bloat or build configuration overhead.

**Alternatives considered**:
- TailwindCSS (would require major refactoring of hundreds of existing semantic CSS classes and tokens).

**Do not**:
Do not install TailwindCSS or replace semantic classes with Tailwind utility classes.

**Source**:
`client/src/index.css`

---

## DECISION-006 — OpenStreetMap Nominatim for Reverse-Geocoding GPS Coordinates

**Date**:
2026-09-27

**Decision**:
Use OpenStreetMap's free Nominatim reverse-geocoding API (`https://nominatim.openstreetmap.org/reverse`) to resolve browser GPS coordinates (`latitude`, `longitude`) to Indian PIN codes and cities.

**Reason**:
OpenStreetMap provides a zero-credential, reliable reverse geocoder for Indian addresses, avoiding the need for a Google Maps or Mapbox API key.

**Alternatives considered**:
- Google Geocoding API (requires paid Google Cloud billing account and API keys).
- Requiring manual user PIN code entry only (higher friction for first-time visitors).

**Do not**:
Do not spam Nominatim without the custom `User-Agent` header (`MedCompare-India/1.0`).

**Source**:
`server/src/services/pincodeService.js`

---

## DECISION-007 — Split Deployment (GitHub Pages for Frontend, Separate Node Host for Backend)

**Date**:
2026-09-27

**Decision**:
Deploy the Vite React SPA to GitHub Pages (`client/dist`) via GitHub Actions, and deploy the Express API separately to a Node-compatible hosting service.

**Reason**:
GitHub Pages offers free, high-performance global CDN hosting for static SPAs. Because GitHub Pages cannot execute Node.js Express servers, the client dynamically directs API traffic using `VITE_API_BASE_URL`.

**Alternatives considered**:
- Monolithic deployment on single Heroku/Render dyno (higher latency for static frontend assets).

**Do not**:
Do not hardcode `http://localhost:5001` in client fetch calls; always use the `apiUrl()` helper from `client/src/utils/api.js`.

**Source**:
`.github/workflows/deploy-pages.yml`, `client/vite.config.js`, `client/src/utils/api.js`
