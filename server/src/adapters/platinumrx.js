import axios from 'axios';
import { extractPackInfo, normalizePricing, generateDeepLink } from '../services/normalizer.js';

const PLATINUM_PLP_URL = 'https://backend.platinumrx.in/pdp/v2/fetchPlp';
const PLATINUM_PINCODE_URL = 'https://backend.platinumrx.in/pdp/pincode/';

export class PlatinumRxAdapter {
  constructor() {
    this.name = 'PlatinumRx';
    this.platformId = 'platinumrx';
    this.logo = 'https://google-cdn-prod.platinumrx.in/assets/icons/logo.svg';
  }

  async checkPincode(pincode = '560001') {
    try {
      const response = await axios.get(`${PLATINUM_PINCODE_URL}${pincode}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        },
        timeout: 4000
      });
      const data = response.data;
      const isServicable = Array.isArray(data) && data[0]?.Status === 'Success';
      return {
        isServicable,
        deliveryDays: 2,
        city: data?.[0]?.PostOffice?.[0]?.District || ''
      };
    } catch {
      return { isServicable: true, deliveryDays: 2, city: '' };
    }
  }

  async search(query, pincode = '560001') {
    try {
      const [plpRes, pinInfo] = await Promise.all([
        axios.post(
          PLATINUM_PLP_URL,
          {
            searchText: query,
            fetchBestOfferPrice: true
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            },
            timeout: 6000
          }
        ),
        this.checkPincode(pincode)
      ]);

      const plpData = plpRes.data?.data?.plpData || [];
      if (!Array.isArray(plpData) || plpData.length === 0) {
        return [];
      }

      const deliveryDays = pinInfo.deliveryDays || 2;
      const deliveryEstimate = pinInfo.isServicable
        ? `📦 Standard Delivery in ${deliveryDays}-${deliveryDays + 1} Days`
        : '⚠️ Check Delivery Pincode';

      return plpData.slice(0, 8).map((entry) => {
        const master = entry.masterItemData || {};
        const sub = entry.substituteItemData;

        const displayName = master.displayName || master.skuName || query;
        const { packSize, unitType } = extractPackInfo(displayName, master.packForm || '');
        const pricing = normalizePricing({
          mrp: master.mrp,
          sellingPrice: master.discountedPrice || master.mrp,
          packSize: master.packQuantityValueDecimal || packSize
        });

        let substitutes = [];
        if (sub && (sub.displayName || sub.name)) {
          const subName = sub.displayName || sub.name;
          const subPack = extractPackInfo(subName, sub.packForm || '');
          const subPricing = normalizePricing({
            mrp: sub.mrp,
            sellingPrice: sub.discountedPrice || sub.mrp,
            packSize: sub.packQuantityValueDecimal || subPack.packSize
          });

          substitutes.push({
            id: `prx-sub-${sub.id || sub.masterDrugCode || 'sub'}`,
            platform: this.platformId,
            platformName: this.name,
            sku: sub.masterDrugCode || 'sub',
            name: subName,
            manufacturer: sub.manufacturerName || 'Certified Generic Partner',
            packSize: subPack.packSize,
            unitType: subPack.unitType,
            ...subPricing,
            savingsVsBrand: pricing.unitPrice > 0
              ? Math.round(((pricing.unitPrice - subPricing.unitPrice) / pricing.unitPrice) * 100)
              : subPricing.discountPercent,
            inStock: sub.drugStock !== 'OUT_OF_STOCK',
            deepLink: `https://www.platinumrx.in/search?q=${encodeURIComponent(subName)}`
          });
        }

        return {
          id: `platinumrx-${master.id || master.masterDrugCode || Math.random()}`,
          platform: this.platformId,
          platformName: this.name,
          sku: master.masterDrugCode,
          name: displayName,
          brand: master.topBrand ? displayName.split(' ')[0] : '',
          manufacturer: master.manufacturerName || 'Pharma Co',
          packForm: master.packForm || 'Strip',
          packSize: master.packQuantityValueDecimal || packSize,
          unitType,
          ...pricing,
          inStock: master.drugStock !== 'OUT_OF_STOCK',
          prescriptionRequired: master.category?.toLowerCase().includes('prescription') || false,
          imageUrl: master.heroImage || null,
          deliveryEstimate,
          deliverySpeedTier: 'standard',
          deepLink: generateDeepLink('platinumrx', { query, name: displayName }),
          saltComposition: master.saltComposition || null,
          substitutes
        };
      });
    } catch (error) {
      console.error('[PlatinumRxAdapter] Search error:', error.message);
      return [];
    }
  }
}
