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
      const isMetro = ['Delhi', 'Mumbai', 'Bangalore', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'].some(
        c => (office.District || '').toLowerCase().includes(c.toLowerCase()) ||
             cleanPin.startsWith('411') ||
             cleanPin.startsWith('560') ||
             cleanPin.startsWith('110') ||
             cleanPin.startsWith('400')
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

// High-accuracy locality and bounding box overrides for known metro areas where
// OpenStreetMap Nominatim data has erroneous polygon postcodes (e.g. Pune Ward 6 411011
// polygon erroneously covering Kalyani Nagar / Nagar Road, or Viman Nagar/Vadgaon Sheri tagged 411001).
const KNOWN_LOCALITY_PINCODES = [
  {
    pincode: '411014',
    city: 'Pune',
    label: 'Viman Nagar / Vadgaon Sheri, Pune',
    keywords: [
      'viman nagar', 'vadgaon sheri', 'wadgaon sheri', 'vadgaonsheri', 'wadgaonsheri',
      'kharadi', 'chandan nagar', 'chandannagar', 'somnath nagar', 'ramwadi',
      'sainikwadi', 'anand park', 'dukirkline', 'mhada colony'
    ],
    // Eastern Pune corridor (Vadgaon Sheri, Viman Nagar, Kharadi)
    bounds: { minLat: 18.535, maxLat: 18.590, minLng: 73.902, maxLng: 73.970 }
  },
  {
    pincode: '411006',
    city: 'Pune',
    label: 'Kalyani Nagar / Yerawada, Pune',
    keywords: ['yerawada', 'yerwada', 'kalyani nagar', 'shastrinagar', 'shastri nagar'],
    bounds: { minLat: 18.538, maxLat: 18.570, minLng: 73.880, maxLng: 73.905 }
  },
  {
    pincode: '411015',
    city: 'Pune',
    label: 'Vishrantwadi / Tingre Nagar, Pune',
    keywords: ['tingre nagar', 'vishrantwadi', 'vishrant wadi']
  },
  {
    pincode: '411032',
    city: 'Pune',
    label: 'Lohegaon / Pune Airport, Pune',
    keywords: ['lohegaon', 'dhanori', 'pune airport'],
    bounds: { minLat: 18.575, maxLat: 18.625, minLng: 73.905, maxLng: 73.955 }
  },
  {
    pincode: '411028',
    city: 'Pune',
    label: 'Hadapsar / Magarpatta, Pune',
    keywords: ['hadapsar', 'magarpatta', 'amanora', 'gadital', 'fursungi'],
    bounds: { minLat: 18.485, maxLat: 18.535, minLng: 73.910, maxLng: 73.970 }
  },
  {
    pincode: '411038',
    city: 'Pune',
    label: 'Kothrud, Pune',
    keywords: ['kothrud', 'karve nagar', 'dahanukar colony']
  },
  {
    pincode: '411045',
    city: 'Pune',
    label: 'Baner / Balewadi, Pune',
    keywords: ['baner', 'balewadi']
  },
  {
    pincode: '411027',
    city: 'Pune',
    label: 'Aundh, Pune',
    keywords: ['aundh']
  },
  {
    pincode: '411057',
    city: 'Pune',
    label: 'Hinjawadi / Wakad, Pune',
    keywords: ['hinjawadi', 'hinjewadi', 'wakad']
  },
  {
    pincode: '411011',
    city: 'Pune',
    label: 'Kasba Peth / Rasta Peth, Pune',
    keywords: ['kasba peth', 'mangalwar peth', 'rasta peth', 'somwar peth'],
    bounds: { minLat: 18.514, maxLat: 18.530, minLng: 73.852, maxLng: 73.875 }
  }
];

function resolvePuneAnomaly(lat, lng, rawPin, text) {
  const lowerText = (text || '').toLowerCase();

  // 1. Keyword match on locality / suburb / road / display_name
  for (const entry of KNOWN_LOCALITY_PINCODES) {
    if (entry.keywords.some(kw => lowerText.includes(kw))) {
      return entry;
    }
  }

  // 2. Geographic bounding box match
  for (const entry of KNOWN_LOCALITY_PINCODES) {
    if (entry.bounds) {
      const { minLat, maxLat, minLng, maxLng } = entry.bounds;
      if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
        return entry;
      }
    }
  }

  // 3. Fix OSM 411011 Ward 6 anomaly:
  // OSM has a bug where 411011 is assigned to coordinates far east of Pune city center (lng >= 73.88).
  // Real 411011 is strictly Central Pune (lng 73.852 - 73.875).
  if (rawPin === '411011' && (lng > 73.88 || lat > 18.535)) {
    if (lng >= 73.902) {
      return KNOWN_LOCALITY_PINCODES[0]; // 411014 (Vadgaon Sheri / Viman Nagar / Kharadi)
    }
    if (lng >= 73.880 && lng < 73.902) {
      return KNOWN_LOCALITY_PINCODES[1]; // 411006 (Kalyani Nagar / Yerawada)
    }
  }

  return null;
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
      params: { lat: numLat, lon: numLng, format: 'json', addressdetails: 1 },
      headers: { 'User-Agent': 'MedCompare-App/1.0 (contact@medcompare.in)' },
      timeout: 4500
    });
    const addr = res.data?.address;
    if (addr) {
      let rawPin = null;
      if (addr.postcode) {
        const match = String(addr.postcode).replace(/\s+/g, '').match(/[1-9][0-9]{5}/);
        if (match) rawPin = match[0];
      }
      const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.quarter || '';
      detectedCity = addr.city || addr.town || addr.municipality || suburb || addr.city_district || addr.state_district;
      detectedState = addr.state;

      const combinedText = `${suburb} ${addr.road || ''} ${addr.neighbourhood || ''} ${res.data?.display_name || ''}`;

      // Check Pune locality correction
      const puneMatch = resolvePuneAnomaly(numLat, numLng, rawPin, combinedText);
      if (puneMatch) {
        detectedPin = puneMatch.pincode;
        detectedCity = suburb ? `${suburb}, Pune` : puneMatch.label;
        detectedState = 'Maharashtra';
      } else if (rawPin) {
        detectedPin = rawPin;
      }
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

      // Also check Pune anomaly against BigDataCloud locality/coords
      if (!detectedPin) {
        const bdcMatch = resolvePuneAnomaly(numLat, numLng, null, `${res2.data?.locality || ''} ${res2.data?.city || ''}`);
        if (bdcMatch) {
          detectedPin = bdcMatch.pincode;
          detectedCity = bdcMatch.label;
          detectedState = 'Maharashtra';
        }
      }
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
