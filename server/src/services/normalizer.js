/**
 * Normalizes medicine pack sizes, calculates per-unit prices (₹/tablet or ₹/ml),
 * discount percentages, and generates direct store search/product deep links.
 */

export function extractPackInfo(name = '', packForm = '') {
  const combined = (name + ' ' + packForm).trim();

  // Determine unit type
  let unitType = 'unit';
  if (/capsule|cap/i.test(combined)) unitType = 'capsule';
  else if (/tablet|tab/i.test(combined)) unitType = 'tablet';
  else if (/ml|liquid|syrup|drop/i.test(combined)) unitType = 'ml';
  else if (/gm|powder|cream|gel|ointment/i.test(combined)) unitType = 'g';

  // 1. Check for explicit pack count indicators
  const trailingMatch = combined.match(/(?:pack of|strip of)\s*(\d+)/i) ||
                        combined.match(/\b(\d+)\s*['’]s\b/i) ||
                        combined.match(/\b(\d+)\s*s\b/i) ||
                        combined.match(/Tablet\s*(\d+)\b/i) ||
                        combined.match(/Capsule\s*(\d+)\b/i) ||
                        combined.match(/\b(\d+)\s*(?:tablets?|capsules?|tabs?|caps?)\b/i);

  if (trailingMatch) {
    const size = parseInt(trailingMatch[1], 10);
    if (size > 0 && size <= 200) return { packSize: size, unitType };
  }

  // 2. Liquid volume (ml)
  const volMatch = combined.match(/(\d+)\s*ml\b/i);
  if (volMatch) return { packSize: parseInt(volMatch[1], 10), unitType: 'ml' };

  return { packSize: 1, unitType };
}

export function normalizePricing({ mrp, sellingPrice, packSize }) {
  const numMrp = parseFloat(mrp) || 0;
  const numPrice = parseFloat(sellingPrice) || numMrp;
  const size = Math.max(1, packSize || 1);

  const unitPrice = parseFloat((numPrice / size).toFixed(2));
  const unitMrp = parseFloat((numMrp / size).toFixed(2));
  const savings = Math.max(0, parseFloat((numMrp - numPrice).toFixed(2)));
  const discountPercent = numMrp > 0 ? Math.round(((numMrp - numPrice) / numMrp) * 100) : 0;

  return {
    mrp: numMrp,
    sellingPrice: numPrice,
    unitPrice,
    unitMrp,
    savings,
    discountPercent: Math.max(0, discountPercent)
  };
}

export function generateDeepLink(platform, { name, sku, urlKey, query }) {
  const q = encodeURIComponent(query || name || '');
  switch (platform.toLowerCase()) {
    case 'apollo':
      if (urlKey) return `https://www.apollopharmacy.in/medicine/${urlKey}`;
      return `https://www.apollopharmacy.in/search-medicines/${q}`;
    case 'truemeds':
      if (urlKey) return `https://www.truemeds.in/medicine/${urlKey}`;
      return `https://www.truemeds.in/search/${q}`;
    case 'platinumrx':
      return `https://www.platinumrx.in/search?q=${q}`;
    case 'pharmeasy':
      if (urlKey) return `https://pharmeasy.in/online-medicine-order/${urlKey}`;
      return `https://pharmeasy.in/search/all?name=${q}`;
    case '1mg':
    case 'onemg':
      if (urlKey) return urlKey.startsWith('http') ? urlKey : `https://www.1mg.com${urlKey}`;
      return `https://www.1mg.com/search/all?name=${q}`;
    case 'netmeds':
      if (urlKey) return `https://www.netmeds.com/product/${urlKey}`;
      return `https://www.netmeds.com/products/?q=${q}`;
    case 'zepto':
      return `https://www.zepto.com/search?query=${q}`;
    case 'amazon':
      return `https://www.amazon.in/s?k=${q}&rh=n%3A18049712031`;
    default:
      return '#';
  }
}

