import axios from 'axios';
import { extractPackInfo, normalizePricing, generateDeepLink } from '../services/normalizer.js';

const TRUEMEDS_SEARCH_URL = 'https://nal.tmmumbai.in/SearchService/getSearchResult';
const TRUEMEDS_PINCODE_URL = 'https://nal.tmmumbai.in/ThirdPartyService/checkPincodeServiceability';

export class TruemedsAdapter {
  constructor() {
    this.name = 'Truemeds';
    this.platformId = 'truemeds';
    this.logo = 'https://assets.truemeds.in/Images/website-assets/truemedslogonav.svg';
  }

  async checkPincode(pincode = '560001') {
    try {
      const response = await axios.get(TRUEMEDS_PINCODE_URL, {
        params: { pincode },
        headers: {
          'Origin': 'https://www.truemeds.in',
          'Referer': 'https://www.truemeds.in/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        },
        timeout: 4000
      });
      const data = response.data;
      const isServicable = data?.isServicable ?? true;
      const days = data?.pincodeData?.[0]?.surface_delivery_days || 2;
      return {
        isServicable,
        deliveryDays: days,
        city: data?.pincodeData?.[0]?.city || ''
      };
    } catch {
      return { isServicable: true, deliveryDays: 2, city: '' };
    }
  }

  async search(query, pincode = '560001') {
    try {
      const [searchRes, pinInfo] = await Promise.all([
        axios.get(TRUEMEDS_SEARCH_URL, {
          params: {
            searchString: query,
            elasticSearchType: 1
          },
          headers: {
            'Origin': 'https://www.truemeds.in',
            'Referer': 'https://www.truemeds.in/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/json'
          },
          timeout: 6000
        }),
        this.checkPincode(pincode)
      ]);

      const productDetails = searchRes.data?.responseData?.elasticProductDetails || [];
      if (!Array.isArray(productDetails) || productDetails.length === 0) {
        return [];
      }

      const deliveryDays = pinInfo.deliveryDays || 2;
      const deliveryEstimate = pinInfo.isServicable
        ? `📦 Delivered in ${deliveryDays === 1 ? '24 Hours' : `${deliveryDays}-${deliveryDays + 1} Days`}`
        : '⚠️ Check Pincode Delivery';

      return productDetails.slice(0, 8).map((entry) => {
        const prod = entry.product || {};
        const suggestion = entry.suggestion;

        const { packSize, unitType } = extractPackInfo(prod.skuName, prod.packForm || '');
        const pricing = normalizePricing({
          mrp: prod.mrp,
          sellingPrice: prod.sellingPrice || prod.mrp,
          packSize
        });

        // Map Truemeds generic substitute if available
        let substitutes = [];
        if (suggestion && suggestion.skuName) {
          const subPack = extractPackInfo(suggestion.skuName, suggestion.packForm || '');
          const subPricing = normalizePricing({
            mrp: suggestion.mrp,
            sellingPrice: suggestion.sellingPrice || suggestion.mrp,
            packSize: subPack.packSize
          });

          substitutes.push({
            id: `tm-sub-${suggestion.productCode}`,
            platform: this.platformId,
            platformName: this.name,
            sku: suggestion.productCode,
            name: suggestion.skuName,
            manufacturer: suggestion.manufacturerName || 'Generic Partner',
            packSize: subPack.packSize,
            unitType: subPack.unitType,
            ...subPricing,
            savingsVsBrand: pricing.unitPrice > 0
              ? Math.round(((pricing.unitPrice - subPricing.unitPrice) / pricing.unitPrice) * 100)
              : subPricing.discountPercent,
            inStock: suggestion.available ?? true,
            deepLink: `https://www.truemeds.in/search/${encodeURIComponent(suggestion.skuName)}`
          });
        }

        return {
          id: `truemeds-${prod.productCode}`,
          platform: this.platformId,
          platformName: this.name,
          sku: prod.productCode,
          name: prod.skuName,
          brand: prod.brand || '',
          manufacturer: prod.manufacturerName || 'Pharma Lab',
          packForm: prod.packForm || 'Strip',
          packSize,
          unitType,
          ...pricing,
          inStock: prod.available !== false && !prod.is_oos,
          prescriptionRequired: Boolean(prod.rxRequired),
          imageUrl: prod.image || null,
          deliveryEstimate,
          deliverySpeedTier: deliveryDays <= 1 ? 'fast' : 'standard',
          deepLink: generateDeepLink('truemeds', { query, name: prod.skuName }),
          saltComposition: prod.compositionName || null,
          substitutes
        };
      });
    } catch (error) {
      console.error('[TruemedsAdapter] Search error:', error.message);
      return [];
    }
  }
}
