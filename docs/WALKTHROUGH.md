# Walkthrough: MedCompare India (8-Platform Medicine Price Comparison)

MedCompare India aggregates, normalizes, and compares medicine pricing, delivery timelines, pack quantities, and generic substitutes across **8 leading Indian healthcare platforms**:

1. **Apollo Pharmacy** (`apollopharmacy.in`)
2. **PharmEasy** (`pharmeasy.in`)
3. **Tata 1mg** (`1mg.com`)
4. **Netmeds** (`netmeds.com`)
5. **Truemeds** (`truemeds.in`)
6. **PlatinumRx** (`platinumrx.in`)
7. **Zepto** (`zepto.com`)
8. **Amazon Pharmacy** (`amazon.in`)

---

## Visual Verification & Screenshots

### 1. 8-Platform Live Medicine Comparison
The platform queries all 8 providers in parallel and displays winner badges (**Lowest Price / Unit**, **Fastest Delivery**, and **Best MRP Discount**) alongside individual store comparison cards:

![8-Platform Live Medicine Comparison](./images/medcompare_live_search.png)

---

### 2. Side-by-Side Table View & Generic Substitutes
Users can toggle to **Table View** for compact analysis across pack sizes, prices per tablet, total prices, discount percentages, and 1-click **Buy Now** actions. The engine also lists verified generic salt alternatives with savings up to 70-80%:

![Table View and Generic Substitutes](./images/table_and_generics.png)

---

## Key Features & User Flows Tested

### 1. Per-Tablet Price Normalization
Different pharmacies package medicines in strips of 10, 15, 20, or 30 tablets. The normalizer computes exact per-tablet unit economics (e.g. `₹1.71 / tablet` on Truemeds vs `₹2.13 / tablet` on Apollo).

### 2. Delivery SLA Tiers
- **⚡ Ultra-Fast**: Zepto (10-minute delivery), Apollo (2-hour express delivery).
- **📦 Fast Delivery**: PharmEasy (Guaranteed tomorrow), Tata 1mg (1-2 days), Netmeds (1-2 days), PlatinumRx (1-2 days), Amazon Pharmacy (Prime next-day).
- **🚚 Standard Courier**: Truemeds (24-48h courier).

### 3. Packaging / Strip Scanner
- Supports uploading medicine packaging photos to detect medicine names and active chemical compositions (e.g., *Dolo 650*, *Telma 40*, *Augmentin 625 Duo*, *Pantocid 40*).
- Immediately initiates multi-platform search without manual typing.

### 4. Direct 1-Click Store Deep Links
- Every card and table row features a direct **Buy Now** CTA directing users to the exact medicine page or product search on that platform.

---

## Live Data Comparison Sample (*Query: Dolo 650*)

| Platform | Fulfillment Type | Price / Tablet | Pack Price (MRP) | Delivery SLA | Deep Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Apollo Pharmacy** | Live API | ₹2.13 / tablet | ₹32.00 | ⚡ 2-Hour Express Delivery | [View](https://www.apollopharmacy.in/search-medicines/Dolo%20650) |
| **PharmEasy** | Live API | ₹1.94 / tablet | ₹29.05 (₹32.28) | ⚡ Guaranteed Express Delivery | [View](https://pharmeasy.in/search/all?name=Dolo%20650) |
| **Tata 1mg** | Live API | ₹1.98 / tablet | ₹29.70 (₹32.28) | 📦 Standard 1-2 Days Delivery | [View](https://www.1mg.com/search/all?name=Dolo%20650) |
| **Netmeds** | Live SSR | ₹1.71 / tablet | ₹25.60 (₹32.28) | 📦 1-2 Day Delivery | [View](https://www.netmeds.com/products/?q=Dolo%20650) |
| **Truemeds** | Live API | ₹1.71 / tablet | ₹25.70 (₹32.28) | 📦 24-48h Courier Delivery | [View](https://www.truemeds.in/search/Dolo%20650) |
| **PlatinumRx** | Live API | ₹1.76 / tablet | ₹26.47 (₹32.28) | 📦 1-2 Days Delivery | [View](https://www.platinumrx.in/search?q=Dolo%20650) |
| **Zepto** | Quick-Commerce | ₹2.01 / tablet | ₹30.08 (₹32.28) | ⚡ 10-Minute Superfast Delivery | [View](https://www.zepto.com/search?query=Dolo%20650) |
| **Amazon Pharmacy** | Marketplace | ₹1.83 / tablet | ₹27.52 (₹32.28) | 📦 Prime Next-Day Delivery | [View](https://www.amazon.in/s?k=Dolo%20650&rh=n%3A18049712031) |
