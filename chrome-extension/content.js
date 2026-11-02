/**
 * MedCompare Chrome Extension — Content Script
 * Injected into all 8 supported pharmacy websites.
 * Detects the medicine product page, extracts the name,
 * and renders a Buyhatke-style floating comparison sidebar.
 */

const MC_EXT_ID = 'mc-ext';

// ─── Site-specific medicine name extractors ─────────────────────────────────
// Each extractor returns a cleaned string or null if not on a product page.

const SITE_EXTRACTORS = [
  {
    id: 'apollo',
    host: 'apollopharmacy.in',
    extract() {
      const selectors = [
        'h1.product-name', 'h1[class*="product"]', '.pdp-product-name',
        'h1', '[class*="productName"]', '[class*="ProductName"]'
      ];
      return trySelectors(selectors);
    }
  },
  {
    id: 'pharmeasy',
    host: 'pharmeasy.in',
    extract() {
      const selectors = [
        'h1[class*="ProductTitle"]', 'h1[class*="productTitle"]',
        'h1[class*="product-title"]', '.product-name h1',
        '[class*="PageTitle__"] h1', 'h1'
      ];
      return trySelectors(selectors);
    }
  },
  {
    id: 'onemg',
    host: '1mg.com',
    extract() {
      const selectors = [
        'h1[class*="DrugHeader__name"]', 'h1[class*="ProductTitle"]',
        '.drugname', '[class*="style__drug-name"]', 'h1[class*="name"]', 'h1'
      ];
      return trySelectors(selectors);
    }
  },
  {
    id: 'netmeds',
    host: 'netmeds.com',
    extract() {
      const selectors = [
        '.medicine-name h1', '.product-name h1', 'h1.name',
        '#product-name', 'h1[class*="name"]', 'h1'
      ];
      return trySelectors(selectors);
    }
  },
  {
    id: 'zepto',
    host: 'zepto.com',
    extract() {
      const selectors = [
        'h1[class*="product"]', 'h1[class*="Product"]',
        '[class*="ProductName"]', '[data-testid*="product-name"]',
        'h1'
      ];
      return trySelectors(selectors);
    }
  },
  {
    id: 'amazon',
    host: 'amazon.in',
    isProductPage() {
      // Only fire on Amazon Pharmacy / Health pages
      const path = window.location.pathname;
      const isPharmacy = path.includes('/dp/') || path.includes('/gp/product');
      const title = document.title || '';
      const hasHealthKeyword = /tablet|capsule|mg|syrup|injection|medicine|pharma/i.test(title);
      return isPharmacy && hasHealthKeyword;
    },
    extract() {
      const selectors = [
        '#productTitle', 'h1[id="title"]', 'span#productTitle'
      ];
      return trySelectors(selectors);
    }
  },
  {
    id: 'truemeds',
    host: 'truemeds.in',
    extract() {
      const selectors = [
        'h1[class*="medicine"]', 'h1[class*="product"]',
        '.product-title h1', '[class*="MedicineName"]', 'h1'
      ];
      return trySelectors(selectors);
    }
  },
  {
    id: 'platinumrx',
    host: 'platinumrx.in',
    extract() {
      const selectors = [
        'h1.product-name', 'h1[class*="product"]',
        '.medicine-name', '[class*="ProductName"]', 'h1'
      ];
      return trySelectors(selectors);
    }
  }
];

function trySelectors(selectors) {
  for (const sel of selectors) {
    try {
      const el = document.querySelector(sel);
      if (el) {
        const text = (el.textContent || el.innerText || '').trim();
        if (text && text.length > 2 && text.length < 200) {
          // Basic sanity: looks like a medicine name (contains letters)
          if (/[a-zA-Z]/.test(text)) {
            return cleanMedicineName(text);
          }
        }
      }
    } catch (_) {}
  }
  return null;
}

function cleanMedicineName(raw) {
  return raw
    // Remove trailing dosage forms like "(Pack of 10)" or "(10 Tablets)"
    .replace(/\s*\(.*?\)\s*$/, '')
    // Remove leading/trailing symbols
    .replace(/^[\s\-–—]+|[\s\-–—]+$/g, '')
    // Normalize multiple spaces
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ─── Detect current site & extract medicine name ─────────────────────────────

function detectSiteAndExtract() {
  const hostname = window.location.hostname.replace('www.', '');
  for (const extractor of SITE_EXTRACTORS) {
    if (hostname.includes(extractor.host)) {
      // Optional product page guard (e.g. Amazon)
      if (extractor.isProductPage && !extractor.isProductPage()) {
        return null;
      }
      const name = extractor.extract();
      return name ? { siteId: extractor.id, medicineName: name } : null;
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

function injectTriggerButton(medicineName) {
  if (document.getElementById(`${MC_EXT_ID}-trigger`)) return;

  triggerBtn = document.createElement('button');
  triggerBtn.id = `${MC_EXT_ID}-trigger`;
  triggerBtn.innerHTML = `
    <span class="mc-trigger-logo">💊</span>
    <span class="mc-trigger-text">Compare Prices</span>
    <span class="mc-trigger-badge">8 stores</span>
  `;
  triggerBtn.setAttribute('aria-label', 'Compare medicine prices on MedCompare');
  triggerBtn.addEventListener('click', () => openSidebar(medicineName));
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
  return `
    <div class="mc-loading-state">
      <div class="mc-spinner"></div>
      <p class="mc-loading-med">Scanning <strong>${escHtml(medicineName)}</strong></p>
      <p class="mc-loading-sub">Querying 8 pharmacy platforms…</p>
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
      <p class="mc-error-sub">Check your connection or try a manual search on MedCompare.</p>
      <a href="https://medcompare.in" target="_blank" rel="noopener" class="mc-open-link">Open MedCompare ↗</a>
    </div>
  `;
}

function buildResultsHTML(data) {
  const { query, platforms, comparison, genericSubstitutes } = data;
  const platformOrder = ['apollo', 'pharmeasy', 'onemg', 'netmeds', 'zepto', 'truemeds', 'platinumrx', 'amazon'];

  // Find lowest unit price for highlighting
  const lowestUnitPrice = comparison?.lowestUnitPrice?.unitPrice;
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

  return `
    <div class="mc-results-wrap">
      <div class="mc-medicine-header">
        <div class="mc-med-title-row">
          <span class="mc-med-icon">💊</span>
          <div>
            <h2 class="mc-med-title">${escHtml(medTitle)}</h2>
            <span class="mc-med-sub">Found on ${availableCount} of 8 platforms</span>
          </div>
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

// ─── Sidebar open / close / search ───────────────────────────────────────────

function openSidebar(medicineName) {
  if (!sidebar) injectSidebar();
  currentMedicine = medicineName;
  sidebar.classList.add('mc-open');
  document.body.classList.add('mc-sidebar-open');

  if (!isSearching) {
    triggerSearch(medicineName);
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
// Pharmacy sites like 1mg are React SPAs — the title changes without page reload.

let lastDetected = null;
let debounceTimer = null;

function attemptDetection() {
  const result = detectSiteAndExtract();
  if (result && result.medicineName !== lastDetected) {
    lastDetected = result.medicineName;
    injectTriggerButton(result.medicineName);
    // Update trigger text if button already exists
    const btn = document.getElementById(`${MC_EXT_ID}-trigger`);
    if (btn) {
      const textEl = btn.querySelector('.mc-trigger-text');
      if (textEl) textEl.textContent = 'Compare Prices';
    }
  }
}

function scheduleDetection() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(attemptDetection, 500);
}

// Initial detection
attemptDetection();

// Watch for SPA navigation (URL / DOM changes)
const observer = new MutationObserver(scheduleDetection);
observer.observe(document.body, { childList: true, subtree: true });

// Also hook into history API changes (pushState / popState)
const _origPushState = history.pushState.bind(history);
history.pushState = function (...args) {
  _origPushState(...args);
  scheduleDetection();
};
window.addEventListener('popstate', scheduleDetection);


// ─── Message listener for popup ──────────────────────────────────────────────
// The popup requests the current detected medicine name
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_MEDICINE_NAME') {
    const result = detectSiteAndExtract();
    sendResponse(result ? { medicineName: result.medicineName } : { medicineName: null });
  }
  return false;
});
