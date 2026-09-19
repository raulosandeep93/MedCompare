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
