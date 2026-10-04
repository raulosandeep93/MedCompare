# Project Context — MedCompare India

> **The shortest useful description of MedCompare for an AI agent entering the repository.**

---

## 📌 Project Overview

- **Name**: MedCompare India
- **Purpose**: Real-time medicine price, unit cost (₹/tablet, ₹/ml), and delivery SLA comparison engine across leading Indian e-pharmacies and quick-commerce providers.
- **Target Users**: Consumers and patients in India looking to avoid overpaying for branded medications and discover bio-equivalent generic alternatives.
- **Platforms Compared**:
  1. **Apollo Pharmacy** (Live API gateway)
  2. **PharmEasy** (Live search API + guaranteed delivery)
  3. **Tata 1mg** (Live autocomplete catalog API)
  4. **Netmeds** (Reliance Retail SSR catalog integration)
  5. **Truemeds** (Generic medicine specialist)
  6. **PlatinumRx** (Chronic condition high-discount provider)
  7. **Zepto** (10-minute quick-commerce delivery)
  8. **Amazon Pharmacy India** (Prime delivery node 18049712031)

---

## 💻 Technology Stack

Only technologies actually present in this repository:

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Lucide React (icons), Vanilla CSS (Custom Design System) |
| **Backend** | Node.js 20 (ES Modules), Express 4, Axios, Multer, Tesseract.js (OCR), Node-Cache, Nodemailer |
| **Linter / Bundler** | Oxlint (`client/package.json`), Vite 8 |
| **Email Delivery** | Nodemailer (Gmail SMTP) as primary, Resend API as fallback |
| **Hosting / CI** | GitHub Actions (`.github/workflows/deploy-pages.yml`) deploying frontend to GitHub Pages; Heroku-compatible backend setup in root `package.json` |

---

## 🏛️ High-Level Architecture

```text
[ React 19 Frontend SPA (Port 3000) ]
        │
        ▼ (HTTP REST / JSON)
[ Express 4 Aggregator Server (Port 5001) ]
   ├── /api/search ──► Aggregator Engine ──► 8 Parallel Platform Adapters
   │                                                 ├── Apollo
   │                                                 ├── PharmEasy
   │                                                 ├── Tata 1mg
   │                                                 ├── Netmeds
   │                                                 ├── Truemeds
   │                                                 ├── PlatinumRx
   │                                                 ├── Zepto
   │                                                 └── Amazon Pharmacy
   ├── /api/pincode/reverse-geocode ──► OpenStreetMap Nominatim
   ├── /api/suggestions ──► Preloaded Medicine & Composition Index
   ├── /api/scan-strip ──► Tesseract.js OCR Parser
   └── /api/report-issue ──► Nodemailer (Gmail SMTP) / Resend + issues.json
```

---

## 📂 Important Directories

```text
client/
  src/
    components/     # Modular UI components (ComparisonMatrix, SearchSection, Modals, Header)
    utils/api.js    # Client-side API fetch client with dynamic base URL support
    App.jsx         # Top-level state coordinator (search, location, modal states)
    index.css       # Complete design system with CSS custom properties & themes
server/
  src/
    adapters/       # Isolated query adapters for each of the 8 pharmacy platforms
    services/       # Aggregator, unit price normalizer, OCR, email, and pincode services
    routes/api.js   # Express router for all /api/* endpoints
    index.js        # Server entry point, middleware setup, port configuration
  data/
    issues.json     # Append-only persistent storage for customer issue reports
  .env              # Local environment configuration (SMTP, Resend API key, port)
docs/
  ai/               # AI agent operating manual, current state, architecture, decisions
```

---

## ⌨️ Important Commands

### 1. Installation
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Development Mode
Run both services in separate terminals:
- **Server**:
  ```bash
  cd server && npm run dev
  # Runs `node --watch src/index.js` on http://localhost:5001
  ```
- **Client**:
  ```bash
  cd client && npm run dev
  # Runs Vite dev server on http://localhost:3000
  ```

### 3. Build & Static Validation
- **Build Client**:
  ```bash
  cd client && npm run build
  ```
- **Lint Client**:
  ```bash
  cd client && npm run lint
  ```

---

## ⚠️ Important Constraints

1. **No External Database**: The system operates statelessly. Search results are cached in-memory with TTL via `node-cache`. Customer reports are appended to `server/data/issues.json`. Do not introduce SQL or Mongo dependencies unless explicitly instructed.
2. **Vanilla CSS Only**: The project uses an extensive custom CSS design system in `client/src/index.css` with dark/light themes. **Do not introduce TailwindCSS**.
3. **CORS & Base URL Handling**: The client communicates via `/api` (proxied by Vite to port 5001 in dev) or uses `VITE_API_BASE_URL` when deployed to static hosts like GitHub Pages.
4. **Resilient Platform Queries**: When querying external platforms, adapters must never throw unhandled rejections that could crash the aggregator. Use `Promise.allSettled`.
5. **Secrets Management**: SMTP passwords and API keys live in `server/.env`. Never commit credentials to version control.
