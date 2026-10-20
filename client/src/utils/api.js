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

export async function searchByComposition(ingredients, pincode = '560001', options = {}) {
  const exactMatch = options.exactMatch !== false;
  const res = await fetch(apiUrl('/api/search/composition'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ingredients,
      pincode,
      exactMatch
    })
  });
  if (!res.ok) {
    throw new Error(`Composition search failed: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function getPopularCompositions() {
  const res = await fetch(apiUrl('/api/popular-compositions'));
  const json = await res.json();
  return json.data || [];
}

export async function checkPlatformAvailability(pincode = '560001') {
  const res = await fetch(apiUrl(`/api/check-availability?pincode=${encodeURIComponent(pincode)}`));
  if (!res.ok) throw new Error('Availability check failed');
  const json = await res.json();
  return json.availability || {};
}

export function getPreciseLocation(options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation not supported by browser'));
    }

    // Attempt high accuracy first (essential for desktop/laptop WiFi positioning)
    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) => {
        // If high accuracy times out (code 3), retry with coarse
        if (err && err.code === 3) {
          navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
          );
        } else {
          reject(err);
        }
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 30000, ...options }
    );
  });
}

export async function reverseGeocodeLocation(lat, lng) {
  try {
    const res = await fetch(apiUrl(`/api/pincode/reverse-geocode?lat=${lat}&lng=${lng}`));
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) return json.data;
    }
  } catch (err) {
    console.warn('Server reverse geocode failed, trying client fallback...', err);
  }

  // Client-side fallback if server reverse geocode is unreachable
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const rawPostcode = addr.postcode ? String(addr.postcode).replace(/\s+/g, '').match(/[1-9][0-9]{5}/)?.[0] : null;
      const suburb = (addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || '').trim();
      const city = addr.city || addr.town || addr.village || suburb || addr.city_district || addr.state_district || 'India';
      const combined = `${suburb} ${addr.road || ''} ${addr.neighbourhood || ''} ${data.display_name || ''}`.toLowerCase();

      // Check Pune locality correction in fallback
      const numLat = parseFloat(lat);
      const numLng = parseFloat(lng);
      const is411014 = [
        'viman nagar', 'vadgaon sheri', 'wadgaon sheri', 'kharadi',
        'chandan nagar', 'somnath nagar', 'ramwadi', 'sainikwadi'
      ].some(k => combined.includes(k)) ||
      (numLat >= 18.535 && numLat <= 18.590 && numLng >= 73.902 && numLng <= 73.970) ||
      (rawPostcode === '411011' && numLng >= 73.902);

      if (is411014) {
        return {
          valid: true,
          pincode: '411014',
          city: suburb ? `${suburb}, Pune` : 'Viman Nagar, Pune',
          state: 'Maharashtra',
          isMetro: true
        };
      }

      const is411006 = ['yerawada', 'yerwada', 'kalyani nagar', 'shastrinagar'].some(k => combined.includes(k)) ||
        (rawPostcode === '411011' && numLng >= 73.880 && numLng < 73.902);

      if (is411006) {
        return {
          valid: true,
          pincode: '411006',
          city: suburb ? `${suburb}, Pune` : 'Kalyani Nagar, Pune',
          state: 'Maharashtra',
          isMetro: true
        };
      }

      if (rawPostcode) {
        return {
          valid: true,
          pincode: rawPostcode,
          city,
          state: addr.state || 'India'
        };
      }
    }
  } catch (err2) {
    console.warn('Direct Nominatim fallback failed:', err2);
  }

  return null;
}

export async function reportIssue(payload) {
  const res = await fetch(apiUrl('/api/report-issue'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit report');
  }
  return res.json();
}

export async function fetchSuggestions(query, mode = 'name') {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(apiUrl(`/api/suggestions?q=${encodeURIComponent(query.trim())}&mode=${mode}`));
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}
