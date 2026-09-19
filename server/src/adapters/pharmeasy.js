import axios from 'axios';
import { extractPackInfo, normalizePricing, generateDeepLink } from '../services/normalizer.js';

export class PharmEasyAdapter {
  constructor() {
    this.name = 'PharmEasy';
    this.platformId = 'pharmeasy';
    this.logo = 'https://assets.pharmeasy.in/web-assets/dist/fca22bc9.png';
  }

  async search(query, pincode = '560001') {
    try {
      const response = await axios.get('https://pharmeasy.in/api/search/search/', {
        params: { q: query },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/plain, */*'
        },
        timeout: 6500
      });

      const products = response.data?.data?.products || [];
      if (!Array.isArray(products) || products.length === 0) {
        return [];
      }

      return products.slice(0, 10).map((item) => {
        const { packSize, unitType } = extractPackInfo(item.name, item.measurementUnit || item.packform || '');
        const mrp = parseFloat(item.mrpDecimal) || 0;
        const sellingPrice = parseFloat(item.salePriceDecimal) || mrp;

        const pricing = normalizePricing({
          mrp,
          sellingPrice,
          packSize: item.packQuantityValue || packSize
        });

        const deepLink = item.slug
          ? `https://pharmeasy.in/online-medicine-order/${item.slug}`
          : generateDeepLink('pharmeasy', { query, name: item.name });

        const isExpress = item.productTierAttributes?.type === 5;
        const deliveryEstimate = isExpress
          ? '⚡ Guaranteed Express Delivery (Tomorrow)'
          : (item.productTierAttributes?.text || '📦 Standard Delivery (1-2 Days)');

        // Extract substitute recommendations if present in PharmEasy's catalog
        const subs = [];
        const subProd = item.productSubstitutionAttributes?.substituteProduct;
        if (subProd) {
          const subPack = extractPackInfo(subProd.name, subProd.measurementUnit || '');
          const subMrp = parseFloat(subProd.mrpDecimal) || 0;
          const subPrice = parseFloat(subProd.salePriceDecimal) || subMrp;
          const subPricing = normalizePricing({
            mrp: subMrp,
            sellingPrice: subPrice,
            packSize: subProd.packQuantityValue || subPack.packSize
          });

          subs.push({
            name: subProd.name,
            composition: subProd.moleculeName || subProd.compositions?.[0]?.name || '',
            manufacturer: subProd.manufacturer || '',
            packSize: subProd.packQuantityValue || subPack.packSize,
            unitType: subPack.unitType,
            ...subPricing,
            savingsVsBrand: parseFloat(item.productSubstitutionAttributes.savingsAmount) ||
              Math.max(0, parseFloat((sellingPrice - subPrice).toFixed(2))),
            deepLink: subProd.slug
              ? `https://pharmeasy.in/online-medicine-order/${subProd.slug}`
              : `https://pharmeasy.in/search/all?name=${encodeURIComponent(subProd.name)}`,
            recommendedBy: 'PharmEasy'
          });
        }

        return {
          id: `pharmeasy-${item.productId || item.slug}`,
          platform: this.platformId,
          platformName: this.name,
          sku: String(item.productId || ''),
          name: item.name,
          brand: item.moleculeName || '',
          manufacturer: item.manufacturer || 'PharmEasy Partner',
          packForm: item.packform || 'Strip',
          packSize: item.packQuantityValue || packSize,
          unitType,
          ...pricing,
          inStock: item.productAvailabilityFlags?.isAvailable !== false,
          prescriptionRequired: Boolean(item.isRxRequired),
          imageUrl: item.image || item.damImages?.[0]?.url || null,
          deliveryEstimate,
          deliverySpeedTier: isExpress ? 'ultra-fast' : 'fast',
          deepLink,
          substitutes: subs
        };
      });
    } catch (error) {
      console.error('[PharmEasyAdapter] Search error:', error.message);
      return [];
    }
  }
}
