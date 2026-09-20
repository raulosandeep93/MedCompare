// Leave this empty for local development, where Vite proxies /api to the
// local Express server. Set VITE_API_BASE_URL when the static site is hosted.
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

function apiUrl(path) {
  return `${apiBaseUrl}${path}`;
}

export async function searchMedicines(query, pincode = '560001') {
  const url = apiUrl(`/api/search?q=${encodeURIComponent(query)}&pincode=${encodeURIComponent(pincode)}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Search failed: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function lookupPincode(pincode) {
  const url = apiUrl(`/api/pincode/lookup?pincode=${encodeURIComponent(pincode)}`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Pincode lookup failed');
  }
  const json = await res.json();
  return json.data;
}

export async function getPopularPincodes() {
  const res = await fetch(apiUrl('/api/pincode/popular'));
  const json = await res.json();
  return json.data || [];
}

export async function getPopularMedicines() {
  const res = await fetch(apiUrl('/api/popular-medicines'));
  const json = await res.json();
  return json.data || [];
}

export async function scanMedicineStrip({ file, simulatedText }) {
  if (file) {
    const formData = new FormData();
    formData.append('stripImage', file);
    const res = await fetch(apiUrl('/api/scan-strip'), {
      method: 'POST',
      body: formData
    });
    const json = await res.json();
    return json.data;
  } else if (simulatedText) {
    const res = await fetch(apiUrl('/api/scan-strip'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ simulatedText })
    });
    const json = await res.json();
    return json.data;
  }
  throw new Error('No file or simulated text provided');
}
