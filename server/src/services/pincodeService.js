import axios from 'axios';

const POPULAR_PINCODES = [
  { pincode: '560001', city: 'Bengaluru', state: 'Karnataka', metro: true },
  { pincode: '110001', city: 'New Delhi', state: 'Delhi', metro: true },
  { pincode: '400001', city: 'Mumbai', state: 'Maharashtra', metro: true },
  { pincode: '500001', city: 'Hyderabad', state: 'Telangana', metro: true },
  { pincode: '600001', city: 'Chennai', state: 'Tamil Nadu', metro: true },
  { pincode: '700001', city: 'Kolkata', state: 'West Bengal', metro: true },
  { pincode: '411001', city: 'Pune', state: 'Maharashtra', metro: true },
  { pincode: '380001', city: 'Ahmedabad', state: 'Gujarat', metro: true }
];

export async function lookupPincode(pincode) {
  const cleanPin = String(pincode).trim();
  if (!/^\d{6}$/.test(cleanPin)) {
    return {
      valid: false,
      message: 'Invalid Indian PIN code. Please enter a 6-digit postal code.'
    };
  }

  // Check presets
  const preset = POPULAR_PINCODES.find(p => p.pincode === cleanPin);
  if (preset) {
    return {
      valid: true,
      pincode: cleanPin,
      city: preset.city,
      state: preset.state,
      isMetro: preset.metro,
      apolloDelivery: '⚡ 2-Hour Express Delivery',
      truemedsDelivery: '📦 24-48 Hours Delivery',
      platinumDelivery: '📦 1-2 Days Delivery'
    };
  }

  // Live lookup via Postal API / PlatinumRx
  try {
    const res = await axios.get(`https://backend.platinumrx.in/pdp/pincode/${cleanPin}`, {
      timeout: 3500
    });
    const data = res.data;
    if (Array.isArray(data) && data[0]?.Status === 'Success') {
      const office = data[0]?.PostOffice?.[0] || {};
      const isMetro = ['Delhi', 'Mumbai', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata'].some(
        c => (office.District || '').toLowerCase().includes(c.toLowerCase())
      );

      return {
        valid: true,
        pincode: cleanPin,
        city: office.District || office.Block || 'India',
        state: office.State || 'India',
        isMetro,
        apolloDelivery: isMetro ? '⚡ 2-Hour Express Delivery' : '📦 24-48h Store Delivery',
        truemedsDelivery: '📦 2-3 Days Courier',
        platinumDelivery: '📦 2-3 Days Standard'
      };
    }
  } catch (err) {
    // Graceful fallback for 6 digit code
  }

  return {
    valid: true,
    pincode: cleanPin,
    city: 'India',
    state: 'India',
    isMetro: false,
    apolloDelivery: '📦 24-48h Delivery',
    truemedsDelivery: '📦 2-3 Days Courier',
    platinumDelivery: '📦 2-3 Days Standard'
  };
}

export function getPopularPincodes() {
  return POPULAR_PINCODES;
}

export async function reverseGeocodeLocation(lat, lng) {
  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);
  if (isNaN(numLat) || isNaN(numLng)) {
    throw new Error('Invalid coordinates');
  }

  let detectedPin = null;
  let detectedCity = null;
  let detectedState = null;

  // 1. Try OpenStreetMap Nominatim
  try {
    const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat: numLat, lon: numLng, format: 'json' },
      headers: { 'User-Agent': 'MedCompare-App/1.0 (contact@medcompare.in)' },
      timeout: 4000
    });
    const addr = res.data?.address;
    if (addr) {
      if (addr.postcode) {
        const match = String(addr.postcode).replace(/\s+/g, '').match(/[1-9][0-9]{5}/);
        if (match) detectedPin = match[0];
      }
      detectedCity = addr.city || addr.town || addr.municipality || addr.suburb || addr.city_district || addr.state_district;
      detectedState = addr.state;
    }
  } catch (err) {
    // Non-fatal, try fallback
  }

  // 2. Try BigDataCloud fallback if no pincode yet
  if (!detectedPin) {
    try {
      const res2 = await axios.get('https://api.bigdatacloud.net/data/reverse-geocode-client', {
        params: { latitude: numLat, longitude: numLng, localityLanguage: 'en' },
        timeout: 4000
      });
      if (res2.data?.postcode) {
        const match = String(res2.data.postcode).replace(/\s+/g, '').match(/[1-9][0-9]{5}/);
        if (match) detectedPin = match[0];
      }
      if (!detectedCity) detectedCity = res2.data?.city || res2.data?.locality;
      if (!detectedState) detectedState = res2.data?.principalSubdivision;
    } catch (err) {
      // Non-fatal
    }
  }

  // 3. Fallback to matching city in presets if still no pincode
  if (!detectedPin && detectedCity) {
    const matched = POPULAR_PINCODES.find(p =>
      detectedCity.toLowerCase().includes(p.city.toLowerCase()) ||
      p.city.toLowerCase().includes(detectedCity.toLowerCase())
    );
    if (matched) {
      detectedPin = matched.pincode;
      detectedCity = matched.city;
      detectedState = matched.state;
    }
  }

  if (detectedPin) {
    const info = await lookupPincode(detectedPin);
    return {
      ...info,
      city: detectedCity && detectedCity !== 'India' ? detectedCity : info.city,
      state: detectedState || info.state
    };
  }

  // Generic fallback if completely unresolved
  return {
    valid: false,
    pincode: '560001',
    city: detectedCity || 'Bengaluru',
    state: detectedState || 'Karnataka',
    message: 'Could not resolve exact postal code for coordinates.'
  };
}
