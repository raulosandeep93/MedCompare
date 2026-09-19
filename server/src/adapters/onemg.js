import axios from 'axios';
import { extractPackInfo, normalizePricing, generateDeepLink } from '../services/normalizer.js';

export class OneMgAdapter {
  constructor() {
    this.name = 'Tata 1mg';
    this.platformId = 'onemg';
    this.logo = 'https://onemg.gumlet.io/v1601441711/marketing/website-logo-netmeds.svg';
  }

  async search(query, pincode = '560001') {
    try {
      const response = await axios.get('https://www.1mg.com/api/v1/search/autocomplete', {
        params: { name: query },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Referer': 'https://www.1mg.com/'
        },
        timeout: 6500
      });

      const rawItems = response.data?.results || [];
      const products = rawItems.filter(r => r.type !== 'query_suggestion');

      if (!Array.isArray(products) || products.length === 0) {
        return [];
      }

      return products.slice(0, 10).map((item) => {
        const cleanName = (item.label || item.name || '').replace(/<[^>]+>/g, '').trim();
        const { packSize: extractedPack, unitType } = extractPackInfo(cleanName, item.pack_size_label || item.pack_form || '');
        const packSize = item.units_in_pack || extractedPack || 1;

        const mrp = parseFloat(item.price) || 0;
        const sellingPrice = parseFloat(item.discounted_price) || mrp;

        const pricing = normalizePricing({
          mrp,
          sellingPrice,
          packSize
        });

        const deepLink = item.url_path
          ? (item.url_path.startsWith('http') ? item.url_path : `https://www.1mg.com${item.url_path}`)
          : generateDeepLink('1mg', { query, name: cleanName });

        const deliveryEstimate = item.eta_text
          ? `⚡ ${item.eta_text}`
          : '📦 Standard Delivery (1-2 Days by Tata 1mg)';

        return {
          id: `onemg-${item.id || item.sku_id || Math.random().toString(36).substr(2, 9)}`,
          platform: this.platformId,
          platformName: this.name,
          sku: String(item.id || item.sku_id || ''),
          name: cleanName,
          brand: item.drug_name || item.brand_name || '',
          manufacturer: item.manufacturer_name || item.marketer_name || 'Tata 1mg',
          packForm: item.pack_form || 'Strip',
          packSize,
          unitType,
          ...pricing,
          inStock: item.available !== false && item.is_discontinued !== true,
          prescriptionRequired: Boolean(item.rx_required),
          imageUrl: item.image_urls?.[0] || item.cropped_image_urls?.[0] || null,
          deliveryEstimate,
          deliverySpeedTier: 'fast',
          deepLink,
          substitutes: []
        };
      });
    } catch (error) {
      console.error('[OneMgAdapter] Search error:', error.message);
      return [];
    }
  }
}
