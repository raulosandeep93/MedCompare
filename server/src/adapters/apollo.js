import axios from 'axios';
import { extractPackInfo, normalizePricing, generateDeepLink } from '../services/normalizer.js';

const APOLLO_API_URL = 'https://apigateway.apollo247.in/search-service/search';
const AUTH_TOKEN = 'Oeu324WMvfKOj5KMJh2Lkf00eW1';

export class ApolloAdapter {
  constructor() {
    this.name = 'Apollo Pharmacy';
    this.platformId = 'apollo';
    this.logo = 'https://assets.apollopharmacy.in/production/aph-pharmacy-frontend/images/apollo_logo.svg';
  }

  async search(query, pincode = '560001') {
    try {
      const response = await axios.get(APOLLO_API_URL, {
        params: { query },
        headers: {
          'Authorization': AUTH_TOKEN,
          'x-source-service': 'PHARMA_AP_IN',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json'
        },
        timeout: 6000
      });

      const items = response.data?.data || [];
      if (!Array.isArray(items) || items.length === 0) {
        return [];
      }

      return items.slice(0, 10).map((item) => {
        const { packSize, unitType } = extractPackInfo(item.name, item.pack_form || item.pack_size || '');
        const pricing = normalizePricing({
          mrp: item.price,
          sellingPrice: item.specialPrice || item.price,
          packSize
        });

        const urlKey = item.urlKey;
        const deepLink = urlKey
          ? `https://www.apollopharmacy.in/medicine/${urlKey}`
          : generateDeepLink('apollo', { query, name: item.name });

        const tatStr = String(item.tat || '');
        const isExpress = tatStr.toLowerCase().includes('hour') || item.deliveryFlag === 'express' || item.tat === 2;
        const deliveryEstimate = isExpress ? '⚡ 2-Hour Express Delivery' : '📦 Next Day Delivery (Store Fulfillment)';

        return {
          id: `apollo-${item.id || item.sku}`,
          platform: this.platformId,
          platformName: this.name,
          sku: item.sku,
          name: item.name,
          brand: item.brand || '',
          manufacturer: item.manufacturer || item.brand || 'Apollo Pharmacy',
          packForm: item.pack_form || 'Strip',
          packSize,
          unitType,
          ...pricing,
          inStock: item.status === 'in-stock' && item.sellOnline !== false,
          prescriptionRequired: Boolean(item.isPrescriptionRequired),
          imageUrl: item.thumbnailUrl || (item.thumbnail ? `https://images.apollo247.in/pub/media/${item.thumbnail}` : null),
          deliveryEstimate,
          deliverySpeedTier: isExpress ? 'ultra-fast' : 'fast',
          deepLink,
          substitutes: [] // Apollo alternates can be linked if showAlternates is true
        };
      });
    } catch (error) {
      console.error('[ApolloAdapter] Search error:', error.message);
      return [];
    }
  }
}
