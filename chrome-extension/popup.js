/**
 * MedCompare Extension — Popup Script
 */

const API_BASE = 'https://medcompare-lac3.onrender.com/api';
const PLATFORM_ORDER = ['apollo', 'pharmeasy', 'onemg', 'netmeds', 'zepto', 'truemeds', 'platinumrx', 'amazon'];
const PLATFORM_META = {
  apollo:     { label: 'Apollo Pharmacy' },
  truemeds:   { label: 'Truemeds' },
  platinumrx: { label: 'PlatinumRx' },
  pharmeasy:  { label: 'PharmEasy' },
  onemg:      { label: 'Tata 1mg' },
  netmeds:    { label: 'Netmeds' },
  zepto:      { label: 'Zepto' },
  amazon:     { label: 'Amazon Pharmacy' }
};

// ── Elements ──
const statusSection = document.getElementById('status-section');
const popupResults = document.getElementById('popup-results');
const searchInput = document.getElementById('popup-search-input');
const searchBtn = document.getElementById('popup-search-btn');

// ── Detect if on a pharmacy page ──
async function detectCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) return setStatusNotFound();

    const pharmacyHosts = [
      'apollopharmacy.in', 'pharmeasy.in', '1mg.com',
      'netmeds.com', 'zepto.com', 'amazon.in',
      'truemeds.in', 'platinumrx.in'
    ];

    const tabUrl = new URL(tab.url);
    const hostname = tabUrl.hostname.replace('www.', '');
    const isPharmacy = pharmacyHosts.some(h => hostname.includes(h));

    if (!isPharmacy) {
      setStatusNotFound();
      return;
    }

    // Request the content script to extract the medicine name
    chrome.tabs.sendMessage(tab.id, { type: 'GET_MEDICINE_NAME' }, (response) => {
      if (chrome.runtime.lastError || !response?.medicineName) {
        setStatusNotFound();
        return;
      }
      setStatusFound(response.medicineName, tab.id, response.siteName);
    });
  } catch (e) {
    setStatusNotFound();
  }
}

function setStatusFound(medicineName, tabId, siteName) {
  const fromTag = siteName ? ` from ${siteName}` : '';
  statusSection.innerHTML = `
    <div class="status-found">
      <span class="status-dot found"></span>
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: 10px; color: #10b981; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px;">Currently Comparing${esc(fromTag)}:</div>
        <div class="status-med-name" style="font-weight: 800; font-size: 13px; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${esc(medicineName)}</div>
      </div>
      <button class="status-compare-btn" id="status-compare-btn">Compare</button>
    </div>
  `;
  document.getElementById('status-compare-btn').addEventListener('click', () => {
    searchMedicine(medicineName);
  });
}

function setStatusNotFound() {
  statusSection.innerHTML = `
    <div class="status-not-found">
      <span class="status-dot not-found"></span>
      <span>Browse any pharmacy site to auto-detect</span>
    </div>
  `;
}

// ── Search ──
async function searchMedicine(query) {
  if (!query?.trim()) return;
  query = query.trim();
  searchInput.value = query;

  popupResults.classList.remove('hidden');
  popupResults.innerHTML = `
    <div class="res-loading">
      <div class="mini-spinner"></div>
      <span>Comparing prices for <strong>${esc(query)}</strong>…</span>
    </div>
  `;

  try {
    const url = `${API_BASE}/search?q=${encodeURIComponent(query)}&pincode=560001`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    if (!json.success) throw new Error(json.error || 'Failed');
    renderResults(json.data);
  } catch (err) {
    popupResults.innerHTML = `<div class="res-error">❌ ${esc(err.message || 'Error fetching prices')}</div>`;
  }
}

function renderResults(data) {
  const { platforms, comparison } = data;
  const lowestId = comparison?.lowestUnitPrice?.platform;

  let html = '';

  if (comparison?.lowestUnitPrice) {
    const lp = comparison.lowestUnitPrice;
    html += `
      <div class="res-winner">
        <div class="res-winner-label">🏆 Best Price</div>
        <div class="res-winner-val">${esc(PLATFORM_META[lp.platform]?.label || lp.platformName)} — ₹${lp.sellingPrice}</div>
      </div>
    `;
  }

  PLATFORM_ORDER.forEach(id => {
    const p = platforms[id];
    if (!p) return;
    const label = PLATFORM_META[id]?.label || id;
    const item = p.topItem;
    const isLowest = id === lowestId;

    if (!p.available || !item) {
      html += `
        <div class="res-platform-row res-na">
          <span class="res-plat-name">${esc(label)}</span>
          <span class="res-na-text">—</span>
        </div>
      `;
    } else {
      html += `
        <div class="res-platform-row ${isLowest ? 'res-best' : ''}">
          <span class="res-plat-name">${esc(label)}</span>
          <span class="res-price">₹${item.sellingPrice}</span>
        </div>
      `;
    }
  });

  popupResults.innerHTML = html;
}

function esc(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Event listeners ──
searchBtn.addEventListener('click', () => searchMedicine(searchInput.value));
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchMedicine(searchInput.value);
});

document.querySelectorAll('.quick-chip').forEach(chip => {
  chip.addEventListener('click', () => searchMedicine(chip.dataset.med));
});

// Also expose GET_MEDICINE_NAME responder via content script (add listener in content.js)
// but the popup gets medicine from tabs.sendMessage

// ── Init ──
detectCurrentPage();
