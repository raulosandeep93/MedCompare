# Multi-Platform Medicine Price Comparison Platform (India) - 8 Platform Expansion

A comprehensive healthcare aggregator for India that compares medicine prices, unit costs, availability, delivery timelines, and generic/salt substitutes across **8 major Indian platforms**:
1. **Apollo Pharmacy** (Live Gateway)
2. **Truemeds** (Live Search & Generics)
3. **PlatinumRx** (Live PLP & Substitutes)
4. **PharmEasy** (Live API & Guaranteed Delivery)
5. **Tata 1mg** (Live Catalog API)
6. **Netmeds** (Live Reliance Fynd SSR Catalog)
7. **Zepto** (10-Minute Quick Commerce)
8. **Amazon Pharmacy** (Prime Delivery & Health Catalog)

---

## Technical Architecture

```mermaid
flowchart TD
    User([User / Patient]) --> WebApp[Comparison Web App (React + Vite)]
    WebApp --> Aggregator[Aggregator API Server]
    
    subgraph Live Pharmacy Adapters
        Aggregator --> Apollo[Apollo Pharmacy]
        Aggregator --> Truemeds[Truemeds]
        Aggregator --> Platinum[PlatinumRx]
        Aggregator --> PharmEasy[PharmEasy]
        Aggregator --> OneMg[Tata 1mg]
        Aggregator --> Netmeds[Netmeds]
        Aggregator --> Zepto[Zepto Quick-Commerce]
        Aggregator --> Amazon[Amazon Pharmacy]
    end

    subgraph Data Processing
        Aggregator --> Normalizer[Pack Size & Unit Price Normalizer]
        Aggregator --> SubsEngine[Cross-Platform Generic Substitutes]
        Aggregator --> MetricsCalc[Best Value & Speed Badges]
    end
```

---

## Proposed Changes

### Backend Service (`/server`)

#### [NEW] `server/src/adapters/pharmeasy.js`
- Connects to `https://pharmeasy.in/api/search/search/?q=...`
- Extracts product name, MRP, selling price, unit price, manufacturer, discount %, delivery tier, product image, and substitute suggestions.
- Direct deep links: `https://pharmeasy.in/online-medicine-order/${slug}`.

#### [NEW] `server/src/adapters/onemg.js`
- Connects to `https://www.1mg.com/api/v1/search/autocomplete?name=...`
- Extracts product details, MRP (`price`), discounted price, pack count, manufacturer, and deep links: `https://www.1mg.com${url_path}`.

#### [NEW] `server/src/adapters/netmeds.js`
- Connects to `https://www.netmeds.com/products/?q=...`
- Parses `window.__INITIAL_STATE__` SSR payload
- Extracts product items, effective price, marked price (MRP), pack sizes, manufacturer, images, and deep links: `https://www.netmeds.com/product/${slug}`.

#### [NEW] `server/src/adapters/zepto.js`
- Quick commerce pharmacy adapter with 10-minute delivery promise (`⚡ 10-Minute Superfast Delivery`).
- Direct deep link to `https://www.zepto.com/search?query=...`.

#### [NEW] `server/src/adapters/amazon.js`
- Amazon Pharmacy adapter with Prime delivery (`📦 Prime Same-Day / Next-Day Delivery`).
- Direct deep link to `https://www.amazon.in/s?k=...&rh=n%3A18049712031`.

#### [MODIFY] `server/src/services/normalizer.js`
- Add deep link generators for `pharmeasy`, `1mg` / `tata1mg`, `netmeds`, `zepto`, `amazon`.

#### [MODIFY] `server/src/services/aggregator.js`
- Register all 8 adapters and execute queries in parallel via `Promise.allSettled`.
- Compute winner metrics across all 8 platforms (Lowest Unit Price, Lowest Pack Price, Best Discount, Fastest Delivery).
- Aggregate generic substitute recommendations from Truemeds, PlatinumRx, and PharmEasy.

---

### Frontend Client (`/client`)

#### [MODIFY] `client/src/components/ComparisonMatrix.jsx`
- Support all 8 platforms dynamically in both Cards View and Table View.
- Provide quick filter chips by category (e.g. "All Platforms", "Quick Delivery", "Online Pharmacies").

#### [MODIFY] `client/src/components/ComparisonCard.jsx`
- Add distinctive styling, badges, and brand colors for PharmEasy, Tata 1mg, Netmeds, Zepto, and Amazon Pharmacy.

#### [MODIFY] `client/src/index.css`
- Add platform badge colors and button styles for the new platforms.

#### [MODIFY] `client/src/App.jsx`
- Update UI search loader to state: *"Querying 8 pharmacy platforms simultaneously..."*

---

## Verification Plan

### Automated / Node Tests
- Run integration search test script across all 8 platforms with queries:
  - `Dolo 650`
  - `Telma 40`
  - `Pan 40`
- Confirm all 8 platforms return standardized schema:
  - `id`, `platform`, `platformName`, `name`, `mrp`, `sellingPrice`, `unitPrice`, `packSize`, `unitType`, `deliveryEstimate`, `deepLink`

### Browser / Visual Verification
- Verify that Cards view and Table view display all 8 platforms cleanly with responsive layout.
- Verify that clicking "Buy Now" directs to the appropriate platform search/medicine page.
