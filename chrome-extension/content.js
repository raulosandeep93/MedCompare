/**
 * MedCompare Chrome Extension — Content Script
 * Injected into all 8 supported pharmacy websites.
 * Detects the medicine product page, extracts the name,
 * and renders a floating comparison sidebar with prominent
 * 'Currently Comparing' status and real-time prices.
 */

const MC_EXT_ID = 'mc-ext';

// ─── Boilerplate & Non-Medicine Detection ───────────────────────────────────
// Rejects generic site headings, navigation text, marketing slogans, and SEO titles

const BOILERPLATE_PATTERNS = [
  /order\s+medicines?\s+online/i,
  /trusted\s+e-?pharmacy/i,
  /india'?s\s+trusted/i,
  /india'?s\s+leading/i,
  /online\s+pharmacy/i,
  /online\s+medical\s+store/i,
  /buy\s+medicines?\s+online/i,
  /pharmacy\s+near\s+me/i,
  /medicine\s+price\s+engine/i,
  /healthcare\s+platform/i,
  /fastest\s+delivery/i,
  /upload\s+prescription/i,
  /generic\s+medicine\s+specialist/i,
  /home\s+delivery/i,
  /free\s+doctor\s+consultation/i,
  /download\s+app/i,
  /login\s*\/?\s*sign\s*up/i,
  /all\s+categories/i,
  /view\s+cart/i,
  /search\s+for\s+medicines?/i,
  /flat\s+discount/i,
  /save\s+up\s+to/i,
  /cashback/i,
  /best\s+price\s+in\s+india/i,
  /uses,?\s*(dosage|side\s*effects|substitutes|composition)/i
];

function isBoilerplateOrGenericText(text) {
  if (!text) return true;
  const t = text.trim();
  if (t.length < 3 || t.length > 120) return true;
  if (!/[a-zA-Z]/.test(t)) return true;
  if (/^(truemeds|pharmeasy|netmeds|1mg|tata 1mg|apollo|apollo pharmacy|zepto|amazon|platinumrx)$/i.test(t)) return true;
  return BOILERPLATE_PATTERNS.some(p => p.test(t));
}

function cleanMedicineName(raw) {
  if (!raw) return '';
  return raw
    // Remove site suffixes: e.g. " | Truemeds", " - Tata 1mg", " - PharmEasy", " - Apollo Pharmacy"
    .replace(/(\s*[-|•–—]\s*(Truemeds|1mg|Tata 1mg|PharmEasy|Netmeds|Apollo Pharmacy|Apollo|Zepto|Amazon|PlatinumRx)).*$/i, '')
    // Remove metadata suffixes: e.g. ": Uses, Price, Composition...", ": Buy Online..."
    .replace(/:\s*(Uses|Price|Dosage|Side Effects|Composition|Benefits|Overview).*$/i, '')
    .replace(/(\s*[-|]\s*Buy Online.*)$/i, '')
    .replace(/(\s*[-|]\s*Best Price.*)$/i, '')
    // Remove trailing dosage form brackets like "(Pack of 10)" or "(10 Tablets)" or "(Strip of 30)"
    .replace(/\s*\(.*?\)\s*$/, '')
    // Remove leading/trailing symbols or quotes
    .replace(/^[\s\-–—"''\[\]]+|[\s\-–—"''\[\]]+$/g, '')
    // Normalize multiple spaces
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ─── Extractors & Fallbacks ──────────────────────────────────────────────────

function trySelectors(selectors) {
  for (const sel of selectors) {
    try {
      const elements = document.querySelectorAll(sel);
      for (const el of elements) {
        // Skip hidden elements
        if (el.offsetParent === null && el.offsetWidth === 0 && el.offsetHeight === 0) continue;

        // Skip elements inside headers, navbars, footers
        if (el.closest('header, nav, footer, [class*="header" i], [class*="navbar" i], [class*="footer" i], [id*="header" i]')) continue;

        const rawText = (el.textContent || el.innerText || '').trim();
        if (!rawText || isBoilerplateOrGenericText(rawText)) continue;

        const cleaned = cleanMedicineName(rawText);
        if (cleaned && cleaned.length >= 3 && !isBoilerplateOrGenericText(cleaned)) {
          return cleaned;
        }
      }
    } catch (_) {}
  }
  return null;
}

function tryBreadcrumbs() {
  const breadcrumbSelectors = [
    'ol[class*="breadcrumb" i] li:last-child',
    'ul[class*="breadcrumb" i] li:last-child',
    'nav[aria-label*="breadcrumb" i] li:last-child',
    '[class*="breadcrumb" i] span:last-child',
    '[class*="breadcrumb" i] a:last-child',
    '[class*="Breadcrumb" i] li:last-child',
    '[class*="Breadcrumb" i] span:last-child'
  ];

  for (const sel of breadcrumbSelectors) {
    try {
      const el = document.querySelector(sel);
      if (el) {
        const text = (el.textContent || el.innerText || '').trim();
        if (text && !isBoilerplateOrGenericText(text)) {
          const cleaned = cleanMedicineName(text);
          if (cleaned && cleaned.length >= 3 && !isBoilerplateOrGenericText(cleaned)) {
            return cleaned;
          }
        }
      }
    } catch (_) {}
  }
  return null;
}

function extractSlugFromPath(regex, transform) {
  try {
    const match = window.location.pathname.match(regex);
    if (match && match[1]) {
      let slug = match[1];
      if (transform) slug = transform(slug);
      let name = slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .trim();
      if (name && !isBoilerplateOrGenericText(name)) {
        return cleanMedicineName(name);
      }
    }
  } catch (_) {}
  return null;
}

function tryMetaTags() {
  try {
    const og = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    if (og && !isBoilerplateOrGenericText(og)) {
      const cleaned = cleanMedicineName(og);
      if (cleaned && cleaned.length >= 3 && !isBoilerplateOrGenericText(cleaned)) {
        return cleaned;
      }
    }
    const docTitle = document.title;
    if (docTitle && !isBoilerplateOrGenericText(docTitle)) {
      const cleaned = cleanMedicineName(docTitle);
      if (cleaned && cleaned.length >= 3 && !isBoilerplateOrGenericText(cleaned)) {
        return cleaned;
      }
    }
  } catch (_) {}
  return null;
}

// ─── Site-specific medicine name extractors ─────────────────────────────────

const SITE_EXTRACTORS = [
  {
    id: 'truemeds',
    name: 'Truemeds',
    host: 'truemeds.in',
    isProductPage() {
      return window.location.pathname.includes('/medicine/');
    },
    extract() {
      const selectors = [
        '[data-testid*="medicine-name"]',
        '[data-testid*="product-name"]',
        'h1[class*="medicine"]',
        'h1[class*="product"]',
        'h1[class*="title"]',
        '[class*="MedicineName"]',
        '[class*="medicineName"]',
        '[class*="ProductTitle"]',
        '[class*="productTitle"]',
        '[class*="product_name"]',
        '[class*="productName"]',
        '[class*="details"] h1',
        '[class*="pdp"] h1',
        'main h1',
        '#main h1',
        'h1',
        'h2[class*="title"]',
        'h2'
      ];
      return trySelectors(selectors) ||
        tryBreadcrumbs() ||
        extractSlugFromPath(/\/medicine\/([a-zA-Z0-9\-]+)/, slug => slug.replace(/-TM-[A-Z0-9\-]+$/i, '')) ||
        tryMetaTags();
    }
  },
  {
    id: 'pharmeasy',
    name: 'PharmEasy',
    host: 'pharmeasy.in',
    isProductPage() {
      return window.location.pathname.includes('/online-medicine-order/');
    },
    extract() {
      const selectors = [
        'h1[class*="ProductTitle"]',
        'h1[class*="productTitle"]',
        'h1[class*="product-title"]',
        '.product-name h1',
        '[class*="PageTitle__"] h1',
        'main h1',
        'h1'
      ];
      return trySelectors(selectors) ||
        tryBreadcrumbs() ||
        extractSlugFromPath(/\/online-medicine-order\/([a-zA-Z0-9\-]+)/, slug => slug.replace(/-[0-9]+$/i, '')) ||
        tryMetaTags();
    }
  },
  {
    id: 'onemg',
    name: 'Tata 1mg',
    host: '1mg.com',
    isProductPage() {
      const p = window.location.pathname;
      return p.includes('/drugs/') || p.includes('/otc/');
    },
    extract() {
      const selectors = [
        'h1[class*="DrugHeader__name"]',
        'h1[class*="ProductTitle"]',
        '.drugname',
        '[class*="style__drug-name"]',
        'h1[class*="name"]',
        'main h1',
        'h1'
      ];
      return trySelectors(selectors) ||
        tryBreadcrumbs() ||
        extractSlugFromPath(/\/(?:drugs|otc)\/([a-zA-Z0-9\-]+)/, slug => slug.replace(/-[0-9]+$/i, '')) ||
        tryMetaTags();
    }
  },
  {
    id: 'apollo',
    name: 'Apollo Pharmacy',
    host: 'apollopharmacy.in',
    isProductPage() {
      const p = window.location.pathname;
      return p.includes('/otc/') || p.includes('/medicine/') || p.includes('/product/');
    },
    extract() {
      const selectors = [
        'h1.product-name',
        'h1[class*="product"]',
        '.pdp-product-name',
        '[class*="productName"]',
        '[class*="ProductName"]',
        'main h1',
        'h1'
      ];
      return trySelectors(selectors) ||
        tryBreadcrumbs() ||
        extractSlugFromPath(/\/(?:otc|medicine|product)\/([a-zA-Z0-9\-]+)/, slug => slug.replace(/-[0-9]+$/i, '')) ||
        tryMetaTags();
    }
  },
  {
    id: 'netmeds',
    name: 'Netmeds',
    host: 'netmeds.com',
    isProductPage() {
      const p = window.location.pathname;
      return p.includes('/prescriptions/') || p.includes('/non-prescriptions/');
    },
    extract() {
      const selectors = [
        '.medicine-name h1',
        '.product-name h1',
        'h1.name',
        '#product-name',
        'h1[class*="name"]',
        'main h1',
        'h1'
      ];
      return trySelectors(selectors) ||
        tryBreadcrumbs() ||
        extractSlugFromPath(/\/(?:prescriptions|non-prescriptions)\/([a-zA-Z0-9\-]+)/) ||
        tryMetaTags();
    }
  },
  {
    id: 'zepto',
    name: 'Zepto',
    host: 'zepto.com',
    isProductPage() {
      return window.location.pathname.includes('/pn/');
    },
    extract() {
      const selectors = [
        'h1[data-testid*="product-name"]',
        'h1[class*="product"]',
        'h1[class*="Product"]',
        '[class*="ProductName"]',
        'main h1',
        'h1'
      ];
      return trySelectors(selectors) ||
        tryBreadcrumbs() ||
        extractSlugFromPath(/\/pn\/([a-zA-Z0-9\-]+)/, slug => slug.replace(/\/pvid\/.*$/i, '')) ||
        tryMetaTags();
    }
  },
  {
    id: 'amazon',
    name: 'Amazon Pharmacy',
    host: 'amazon.in',
    isProductPage() {
      const p = window.location.pathname;
      const isPharmacy = p.includes('/dp/') || p.includes('/gp/product');
      const title = document.title || '';
      const hasHealthKeyword = /tablet|capsule|mg|syrup|injection|medicine|pharma|drops|gel|cream|ointment/i.test(title);
      return isPharmacy && hasHealthKeyword;
    },
    extract() {
      const selectors = [
        '#productTitle',
        'h1[id="title"]',
        'span#productTitle',
        'h1'
      ];
      return trySelectors(selectors) || tryMetaTags();
    }
  },
  {
    id: 'platinumrx',
    name: 'PlatinumRx',
    host: 'platinumrx.in',
    isProductPage() {
      const p = window.location.pathname;
      return p.includes('/product/') || p.includes('/medicine/');
    },
    extract() {
      const selectors = [
        'h1.product-name',
        'h1[class*="product"]',
        '.medicine-name',
        '[class*="ProductName"]',
        'main h1',
        'h1'
      ];
      return trySelectors(selectors) ||
        tryBreadcrumbs() ||
        extractSlugFromPath(/\/(?:product|medicine)\/([a-zA-Z0-9\-]+)/) ||
        tryMetaTags();
    }
  }
];

// ─── Detect current site & extract medicine name ─────────────────────────────

let currentSiteId = null;
let currentSiteName = null;

function detectSiteAndExtract() {
  const hostname = window.location.hostname.replace('www.', '');
  for (const extractor of SITE_EXTRACTORS) {
    if (hostname.includes(extractor.host)) {
      if (extractor.isProductPage && !extractor.isProductPage()) {
        return null;
      }
      const name = extractor.extract();
      if (name) {
        currentSiteId = extractor.id;
        currentSiteName = extractor.name;
        return { siteId: extractor.id, siteName: extractor.name, medicineName: name };
      }
      return null;
    }
  }
  return null;
}

// ─── Platform display metadata ────────────────────────────────────────────────

const PLATFORM_META = {
  apollo:    { label: 'Apollo Pharmacy', color: '#e63946', emoji: '🔴' },
  truemeds:  { label: 'Truemeds',        color: '#7b2d8b', emoji: '💜' },
  platinumrx:{ label: 'PlatinumRx',     color: '#c9a800', emoji: '🟡' },
  pharmeasy: { label: 'PharmEasy',       color: '#e76f00', emoji: '🟠' },
  onemg:     { label: 'Tata 1mg',        color: '#e63946', emoji: '❤️' },
  netmeds:   { label: 'Netmeds',         color: '#3f7cf2', emoji: '🔵' },
  zepto:     { label: 'Zepto',           color: '#6c3fc5', emoji: '⚡' },
  amazon:    { label: 'Amazon Pharmacy', color: '#f59e0b', emoji: '🛒' }
};

// ─── Inject floating trigger button ──────────────────────────────────────────

let triggerBtn = null;
let sidebar = null;
let currentMedicine = null;
let isSearching = false;

function shortenName(name, max = 22) {
  if (!name) return '';
  return name.length > max ? name.slice(0, max - 1) + '…' : name;
}

function updateTriggerButton(medicineName) {
  currentMedicine = medicineName;
  const btn = document.getElementById(`${MC_EXT_ID}-trigger`);
  if (!btn) return;
  btn.dataset.medicine = medicineName;
  const medEl = btn.querySelector('.mc-trigger-med');
  if (medEl) {
    medEl.textContent = shortenName(medicineName, 22);
  }
  btn.setAttribute('aria-label', `Compare ${medicineName} on MedCompare`);
}

function injectTriggerButton(medicineName, siteName) {
  currentMedicine = medicineName;
  if (document.getElementById(`${MC_EXT_ID}-trigger`)) {
    updateTriggerButton(medicineName);
    return;
  }

  triggerBtn = document.createElement('button');
  triggerBtn.id = `${MC_EXT_ID}-trigger`;
  triggerBtn.dataset.medicine = medicineName;
  triggerBtn.innerHTML = `
    <span class="mc-trigger-logo">💊</span>
    <span class="mc-trigger-content">
      <span class="mc-trigger-prefix">Compare on 8 Stores</span>
      <span class="mc-trigger-med">${escHtml(shortenName(medicineName, 22))}</span>
    </span>
    <span class="mc-trigger-badge">₹ Live</span>
  `;
  triggerBtn.setAttribute('aria-label', `Compare ${medicineName} on MedCompare`);
  // Read currentMedicine dynamically at click time — NEVER use stale closure parameters!
  triggerBtn.addEventListener('click', () => {
    openSidebar(currentMedicine || triggerBtn.dataset.medicine);
  });
  document.body.appendChild(triggerBtn);

  // Animate in after a short delay
  setTimeout(() => triggerBtn.classList.add('mc-visible'), 600);
}

// ─── Build Sidebar HTML ───────────────────────────────────────────────────────

function injectSidebar() {
  if (document.getElementById(`${MC_EXT_ID}-sidebar`)) return;

  sidebar = document.createElement('div');
  sidebar.id = `${MC_EXT_ID}-sidebar`;
  sidebar.setAttribute('role', 'dialog');
  sidebar.setAttribute('aria-label', 'MedCompare Price Comparison');
  sidebar.innerHTML = buildSidebarShell();
  document.body.appendChild(sidebar);

  // Close button
  sidebar.querySelector('.mc-sidebar-close').addEventListener('click', closeSidebar);

  // Click outside to close
  document.addEventListener('click', handleOutsideClick);
}

function buildSidebarShell() {
  return `
    <div class="mc-sidebar-inner">
      <div class="mc-sidebar-header">
        <div class="mc-brand">
          <span class="mc-brand-logo">💊</span>
          <div class="mc-brand-text">
            <span class="mc-brand-name">MedCompare</span>
            <span class="mc-brand-tagline">India's Medicine Price Engine</span>
          </div>
        </div>
        <button class="mc-sidebar-close" aria-label="Close sidebar">✕</button>
      </div>
      <div class="mc-sidebar-body" id="${MC_EXT_ID}-body">
        <div class="mc-idle-state">
          <div class="mc-idle-icon">🔍</div>
          <p>Ready to compare prices</p>
        </div>
      </div>
    </div>
  `;
}

function buildLoadingState(medicineName) {
  const siteTag = currentSiteName ? `From ${currentSiteName}` : 'Auto-detected';
  return `
    <div class="mc-loading-state">
      <div class="mc-loading-badge-wrap">
        <span class="mc-active-dot"></span>
        <span class="mc-loading-badge">COMPARING MEDICINE</span>
        <span class="mc-source-tag">${escHtml(siteTag)}</span>
      </div>
      <div class="mc-spinner"></div>
      <p class="mc-loading-med"><strong>${escHtml(medicineName)}</strong></p>
      <p class="mc-loading-sub">Querying 8 pharmacy platforms in real-time…</p>
      <div class="mc-loading-platforms">
        ${Object.values(PLATFORM_META).map(p => `<span class="mc-plat-chip">${p.emoji} ${p.label}</span>`).join('')}
      </div>
    </div>
  `;
}

function buildErrorState(message) {
  return `
    <div class="mc-error-state">
      <div class="mc-error-icon">⚠️</div>
      <p class="mc-error-msg">${escHtml(message)}</p>
      <p class="mc-error-sub">Check your connection or try searching directly.</p>
      <a href="https://medcompare-lac3.onrender.com" target="_blank" rel="noopener" class="mc-open-link">Open MedCompare ↗</a>
    </div>
  `;
}

function buildResultsHTML(data) {
  const { query, platforms, comparison, genericSubstitutes } = data;
  const platformOrder = ['apollo', 'pharmeasy', 'onemg', 'netmeds', 'zepto', 'truemeds', 'platinumrx', 'amazon'];

  const lowestPlatformId = comparison?.lowestUnitPrice?.platform;
  const fastestPlatformId = comparison?.fastestDelivery?.platform;

  const platformRows = platformOrder
    .map(id => {
      const p = platforms[id];
      if (!p) return '';
      const meta = PLATFORM_META[id] || { label: id, color: '#888', emoji: '•' };
      const item = p.topItem;

      if (!p.available || !item) {
        return `
          <div class="mc-platform-row mc-unavailable">
            <span class="mc-plat-dot" style="background:${meta.color}"></span>
            <span class="mc-plat-name">${meta.label}</span>
            <span class="mc-plat-na">Not found</span>
          </div>
        `;
      }

      const isLowest = id === lowestPlatformId;
      const isFastest = id === fastestPlatformId;
      const unitLabel = item.unitPrice ? `₹${item.unitPrice.toFixed(2)}/${item.unitType || 'tab'}` : '';
      const deliveryLabel = item.deliveryEstimate || '';

      return `
        <div class="mc-platform-row ${isLowest ? 'mc-best' : ''}">
          <span class="mc-plat-dot" style="background:${meta.color}"></span>
          <div class="mc-plat-info">
            <span class="mc-plat-name">
              ${meta.label}
              ${isLowest ? '<span class="mc-badge mc-badge-green">Lowest Price</span>' : ''}
              ${isFastest && !isLowest ? '<span class="mc-badge mc-badge-amber">⚡ Fastest</span>' : ''}
            </span>
            ${unitLabel ? `<span class="mc-plat-unit">${unitLabel}</span>` : ''}
          </div>
          <div class="mc-plat-price-col">
            <span class="mc-plat-price">₹${item.sellingPrice}</span>
            ${item.discountPercent > 0 ? `<span class="mc-plat-discount">${item.discountPercent}% off</span>` : ''}
            ${deliveryLabel ? `<span class="mc-plat-delivery">${deliveryLabel}</span>` : ''}
          </div>
          ${item.productUrl ? `<a href="${escHtml(item.productUrl)}" target="_blank" rel="noopener" class="mc-buy-link" title="Buy on ${meta.label}">Buy ↗</a>` : ''}
        </div>
      `;
    })
    .join('');

  // Winner summary bar
  const winnerBar = comparison?.lowestUnitPrice ? `
    <div class="mc-winner-bar">
      <span class="mc-winner-icon">🏆</span>
      <div class="mc-winner-info">
        <span class="mc-winner-label">Best Price Found</span>
        <span class="mc-winner-val">${PLATFORM_META[comparison.lowestUnitPrice.platform]?.label || comparison.lowestUnitPrice.platformName} — ₹${comparison.lowestUnitPrice.sellingPrice} <span class="mc-winner-unit">(₹${comparison.lowestUnitPrice.unitPrice?.toFixed(2)}/${comparison.lowestUnitPrice.unitType || 'tab'})</span></span>
      </div>
    </div>
  ` : '';

  // Generic callout
  const genericBar = genericSubstitutes?.length > 0 ? `
    <div class="mc-generic-bar">
      <span class="mc-generic-icon">💡</span>
      <div>
        <span class="mc-generic-label">Generic Alternative Available</span>
        <span class="mc-generic-name">${escHtml(genericSubstitutes[0].name)}</span>
        ${genericSubstitutes[0].savingsVsBrand ? `<span class="mc-generic-save">Save up to ${genericSubstitutes[0].savingsVsBrand}%</span>` : ''}
      </div>
    </div>
  ` : '';

  const medTitle = query;
  const availableCount = platformOrder.filter(id => platforms[id]?.available).length;
  const siteTag = currentSiteName ? `From ${currentSiteName}` : 'Live Comparison';

  return `
    <div class="mc-results-wrap">
      <div class="mc-medicine-header">
        <div class="mc-compare-badge-row">
          <span class="mc-active-dot"></span>
          <span class="mc-compare-label">CURRENTLY COMPARING</span>
          <span class="mc-source-tag">${escHtml(siteTag)}</span>
        </div>
        <div class="mc-med-title-row">
          <h2 class="mc-med-title" id="mc-active-med-name">${escHtml(medTitle)}</h2>
        </div>
        <div class="mc-med-meta-row">
          <span class="mc-med-sub">Found on ${availableCount} of 8 platforms</span>
          <button class="mc-change-btn" id="mc-change-med-btn" type="button" title="Change or search another medicine">
            ✏️ Change
          </button>
        </div>
        <div class="mc-search-bar-wrap" id="mc-search-bar-wrap" style="display: none;">
          <form id="mc-inline-search-form" class="mc-search-form">
            <input 
              type="text" 
              id="mc-inline-search-input" 
              class="mc-search-input" 
              placeholder="Search another medicine..." 
              value="${escHtml(medTitle)}" 
            />
            <button type="submit" class="mc-search-submit-btn">Compare</button>
          </form>
        </div>
      </div>

      ${winnerBar}
      ${genericBar}

      <div class="mc-platform-list-header">
        <span>Platform</span>
        <span>Pack Price</span>
      </div>
      <div class="mc-platform-list">
        ${platformRows}
      </div>

      <a
        href="https://medcompare-lac3.onrender.com/?q=${encodeURIComponent(query)}"
        target="_blank"
        rel="noopener"
        class="mc-full-compare-btn"
      >
        View Full Comparison on MedCompare ↗
      </a>

      <div class="mc-footer-note">
        Prices are live estimates. Verify before purchase.
      </div>
    </div>
  `;
}

// ─── Attach Listeners for Inline Search / Change ──────────────────────────────

function attachResultListeners() {
  const changeBtn = document.getElementById('mc-change-med-btn');
  const searchWrap = document.getElementById('mc-search-bar-wrap');
  const searchForm = document.getElementById('mc-inline-search-form');
  const searchInput = document.getElementById('mc-inline-search-input');

  if (changeBtn && searchWrap && searchInput) {
    changeBtn.addEventListener('click', () => {
      const isHidden = searchWrap.style.display === 'none';
      searchWrap.style.display = isHidden ? 'block' : 'none';
      changeBtn.textContent = isHidden ? '✕ Close' : '✏️ Change';
      if (isHidden) {
        searchInput.focus();
        searchInput.select();
      }
    });
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = searchInput.value.trim();
      if (val) {
        triggerSearch(val);
      }
    });
  }
}

// ─── Sidebar open / close / search ───────────────────────────────────────────

let lastSearchedMedicine = null;

function openSidebar(medicineName) {
  if (!sidebar) injectSidebar();
  const med = medicineName || currentMedicine || detectSiteAndExtract()?.medicineName;
  if (!med) return;

  currentMedicine = med;
  sidebar.classList.add('mc-open');
  document.body.classList.add('mc-sidebar-open');

  if (med !== lastSearchedMedicine || !isSearching) {
    triggerSearch(med);
  }
}

function closeSidebar() {
  if (sidebar) {
    sidebar.classList.remove('mc-open');
    document.body.classList.remove('mc-sidebar-open');
  }
}

function handleOutsideClick(e) {
  if (
    sidebar &&
    sidebar.classList.contains('mc-open') &&
    !sidebar.contains(e.target) &&
    e.target.id !== `${MC_EXT_ID}-trigger` &&
    !e.target.closest(`#${MC_EXT_ID}-trigger`)
  ) {
    closeSidebar();
  }
}

function setBodyContent(html) {
  const body = document.getElementById(`${MC_EXT_ID}-body`);
  if (body) body.innerHTML = html;
}

async function triggerSearch(medicineName) {
  if (!medicineName) return;
  currentMedicine = medicineName;
  lastSearchedMedicine = medicineName;
  isSearching = true;
  setBodyContent(buildLoadingState(medicineName));

  try {
    const result = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { type: 'SEARCH_MEDICINE', medicineName, pincode: '560001' },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (!response.success) {
            reject(new Error(response.error || 'Search failed'));
          } else {
            resolve(response.data);
          }
        }
      );
    });

    setBodyContent(buildResultsHTML(result));
    attachResultListeners();
  } catch (err) {
    setBodyContent(buildErrorState(err.message || 'Could not fetch prices. Please try again.'));
  } finally {
    isSearching = false;
  }
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ─── MutationObserver for SPAs ────────────────────────────────────────────────

let lastDetected = null;
let debounceTimer = null;

function attemptDetection() {
  const result = detectSiteAndExtract();
  if (result && result.medicineName) {
    const medChanged = result.medicineName !== lastDetected;
    if (medChanged) {
      lastDetected = result.medicineName;
      currentMedicine = result.medicineName;
      currentSiteId = result.siteId;
      currentSiteName = result.siteName;
      injectTriggerButton(result.medicineName, result.siteName);
      updateTriggerButton(result.medicineName);

      // If sidebar is currently open and medicine changed via SPA navigation,
      // immediately refresh comparison for the newly navigated medicine
      if (sidebar && sidebar.classList.contains('mc-open')) {
        triggerSearch(result.medicineName);
      }
    }
  }
}

function scheduleDetection() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(attemptDetection, 400);
}

// Initial detection
attemptDetection();

// Watch for SPA navigation (URL / DOM changes)
const observer = new MutationObserver(scheduleDetection);
observer.observe(document.body, { childList: true, subtree: true });

// Also hook into history API changes (pushState / replaceState / popState)
const _origPushState = history.pushState.bind(history);
history.pushState = function (...args) {
  _origPushState(...args);
  lastDetected = null;
  scheduleDetection();
};

const _origReplaceState = history.replaceState.bind(history);
history.replaceState = function (...args) {
  _origReplaceState(...args);
  lastDetected = null;
  scheduleDetection();
};

window.addEventListener('popstate', () => {
  lastDetected = null;
  scheduleDetection();
});

// ─── Message listener for popup ──────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_MEDICINE_NAME') {
    const result = detectSiteAndExtract();
    sendResponse(result ? { medicineName: result.medicineName, siteName: result.siteName } : { medicineName: null });
  }
  return false;
});

