import NodeCache from 'node-cache';
import { ApolloAdapter } from '../adapters/apollo.js';
import { TruemedsAdapter } from '../adapters/truemeds.js';
import { PlatinumRxAdapter } from '../adapters/platinumrx.js';
import { PharmEasyAdapter } from '../adapters/pharmeasy.js';
import { OneMgAdapter } from '../adapters/onemg.js';
import { NetmedsAdapter } from '../adapters/netmeds.js';
import { ZeptoAdapter } from '../adapters/zepto.js';
import { AmazonPharmacyAdapter } from '../adapters/amazon.js';
import { buildCompositionQuery, evaluateCompositionMatch, POPULAR_COMPOSITIONS } from './compositionService.js';

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 }); // 5 minutes cache

export class MedicineAggregator {
  constructor() {
    this.apollo = new ApolloAdapter();
    this.truemeds = new TruemedsAdapter();
    this.platinum = new PlatinumRxAdapter();
    this.pharmeasy = new PharmEasyAdapter();
    this.onemg = new OneMgAdapter();
    this.netmeds = new NetmedsAdapter();
    this.zepto = new ZeptoAdapter();
    this.amazon = new AmazonPharmacyAdapter();
  }

  async searchAll(query, pincode = '560001') {
    if (!query || typeof query !== 'string') {
      return { results: [], comparison: null };
    }

    const cleanQuery = query.trim();
    const cacheKey = `${cleanQuery.toLowerCase()}_${pincode}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Step 1: Parallel fetch from ultra-fast live online pharmacy APIs
    const [
      apolloRes,
      truemedsRes,
      platinumRes,
      pharmeasyRes,
      onemgRes
    ] = await Promise.allSettled([
      this.apollo.search(cleanQuery, pincode),
      this.truemeds.search(cleanQuery, pincode),
      this.platinum.search(cleanQuery, pincode),
      this.pharmeasy.search(cleanQuery, pincode),
      this.onemg.search(cleanQuery, pincode)
    ]);

    const apolloItems = apolloRes.status === 'fulfilled' ? apolloRes.value : [];
    const truemedsItems = truemedsRes.status === 'fulfilled' ? truemedsRes.value : [];
    const platinumItems = platinumRes.status === 'fulfilled' ? platinumRes.value : [];
    const pharmeasyItems = pharmeasyRes.status === 'fulfilled' ? pharmeasyRes.value : [];
    const onemgItems = onemgRes.status === 'fulfilled' ? onemgRes.value : [];

    // Reference item from live platforms to calibrate quick-commerce, Netmeds, and Amazon
    const primaryLiveItem =
      apolloItems[0] ||
      pharmeasyItems[0] ||
      onemgItems[0] ||
      truemedsItems[0] ||
      platinumItems[0] ||
      null;

    // Step 2: Fetch Netmeds, Zepto (10-min quick commerce), and Amazon Pharmacy
    const [netmedsRes, zeptoRes, amazonRes] = await Promise.allSettled([
      this.netmeds.search(cleanQuery, pincode, primaryLiveItem),
      this.zepto.search(cleanQuery, pincode, primaryLiveItem),
      this.amazon.search(cleanQuery, pincode, primaryLiveItem)
    ]);

    const netmedsItems = netmedsRes.status === 'fulfilled' ? netmedsRes.value : [];
    const zeptoItems = zeptoRes.status === 'fulfilled' ? zeptoRes.value : [];
    const amazonItems = amazonRes.status === 'fulfilled' ? amazonRes.value : [];


    // Top item from each platform for side-by-side comparison
    const topApollo = apolloItems[0] || null;
    const topTruemeds = truemedsItems[0] || null;
    const topPlatinum = platinumItems[0] || null;
    const topPharmEasy = pharmeasyItems[0] || null;
    const topOneMg = onemgItems[0] || null;
    const topNetmeds = netmedsItems[0] || null;
    const topZepto = zeptoItems[0] || null;
    const topAmazon = amazonItems[0] || null;

    const topItems = [
      topApollo,
      topTruemeds,
      topPlatinum,
      topPharmEasy,
      topOneMg,
      topNetmeds,
      topZepto,
      topAmazon
    ].filter(Boolean);

    // Identify winners across metrics
    let lowestUnitPriceItem = null;
    let lowestPackPriceItem = null;
    let highestDiscountItem = null;
    let fastestDeliveryItem = null;

    if (topItems.length > 0) {
      const inStockItems = topItems.filter(i => i.inStock);
      const itemsToConsider = inStockItems.length > 0 ? inStockItems : topItems;

      lowestUnitPriceItem = itemsToConsider.reduce((min, cur) =>
        cur.unitPrice < min.unitPrice ? cur : min, itemsToConsider[0]);

      lowestPackPriceItem = itemsToConsider.reduce((min, cur) =>
        cur.sellingPrice < min.sellingPrice ? cur : min, itemsToConsider[0]);

      highestDiscountItem = itemsToConsider.reduce((max, cur) =>
        cur.discountPercent > max.discountPercent ? cur : max, itemsToConsider[0]);

      fastestDeliveryItem = itemsToConsider.find(i => i.deliverySpeedTier === 'ultra-fast') ||
        itemsToConsider.find(i => i.deliverySpeedTier === 'fast') ||
        itemsToConsider[0];
    }

    // Collect all unique substitute recommendations across platforms (Truemeds, PlatinumRx, PharmEasy)
    const allSubstitutes = [];
    const subSourceItems = [...truemedsItems, ...platinumItems, ...pharmeasyItems];
    for (const item of subSourceItems) {
      if (Array.isArray(item.substitutes) && item.substitutes.length > 0) {
        for (const sub of item.substitutes) {
          if (!allSubstitutes.some(s => s.name.toLowerCase() === sub.name.toLowerCase())) {
            allSubstitutes.push({
              ...sub,
              recommendedBy: sub.recommendedBy || item.platformName
            });
          }
        }
      }
    }

    // Sort substitutes by greatest savings
    allSubstitutes.sort((a, b) => (b.savingsVsBrand || b.discountPercent) - (a.savingsVsBrand || a.discountPercent));

    const response = {
      query: cleanQuery,
      pincode,
      timestamp: new Date().toISOString(),
      platforms: {
        apollo: {
          platformName: 'Apollo Pharmacy',
          platformId: 'apollo',
          count: apolloItems.length,
          topItem: topApollo,
          items: apolloItems
        },
        truemeds: {
          platformName: 'Truemeds',
          platformId: 'truemeds',
          count: truemedsItems.length,
          topItem: topTruemeds,
          items: truemedsItems
        },
        platinumrx: {
          platformName: 'PlatinumRx',
          platformId: 'platinumrx',
          count: platinumItems.length,
          topItem: topPlatinum,
          items: platinumItems
        },
        pharmeasy: {
          platformName: 'PharmEasy',
          platformId: 'pharmeasy',
          count: pharmeasyItems.length,
          topItem: topPharmEasy,
          items: pharmeasyItems
        },
        onemg: {
          platformName: 'Tata 1mg',
          platformId: 'onemg',
          count: onemgItems.length,
          topItem: topOneMg,
          items: onemgItems
        },
        netmeds: {
          platformName: 'Netmeds',
          platformId: 'netmeds',
          count: netmedsItems.length,
          topItem: topNetmeds,
          items: netmedsItems
        },
        zepto: {
          platformName: 'Zepto',
          platformId: 'zepto',
          count: zeptoItems.length,
          topItem: topZepto,
          items: zeptoItems
        },
        amazon: {
          platformName: 'Amazon Pharmacy',
          platformId: 'amazon',
          count: amazonItems.length,
          topItem: topAmazon,
          items: amazonItems
        }
      },
      comparison: {
        hasData: topItems.length > 0,
        lowestUnitPrice: lowestUnitPriceItem ? {
          platform: lowestUnitPriceItem.platform,
          platformName: lowestUnitPriceItem.platformName,
          unitPrice: lowestUnitPriceItem.unitPrice,
          packSize: lowestUnitPriceItem.packSize,
          unitType: lowestUnitPriceItem.unitType,
          sellingPrice: lowestUnitPriceItem.sellingPrice,
          name: lowestUnitPriceItem.name
        } : null,
        lowestPackPrice: lowestPackPriceItem ? {
          platform: lowestPackPriceItem.platform,
          platformName: lowestPackPriceItem.platformName,
          sellingPrice: lowestPackPriceItem.sellingPrice,
          packSize: lowestPackPriceItem.packSize,
          unitType: lowestPackPriceItem.unitType,
          name: lowestPackPriceItem.name
        } : null,
        highestDiscount: highestDiscountItem ? {
          platform: highestDiscountItem.platform,
          platformName: highestDiscountItem.platformName,
          discountPercent: highestDiscountItem.discountPercent,
          sellingPrice: highestDiscountItem.sellingPrice,
          mrp: highestDiscountItem.mrp,
          name: highestDiscountItem.name
        } : null,
        fastestDelivery: fastestDeliveryItem ? {
          platform: fastestDeliveryItem.platform,
          platformName: fastestDeliveryItem.platformName,
          deliveryEstimate: fastestDeliveryItem.deliveryEstimate,
          name: fastestDeliveryItem.name
        } : null
      },
      genericSubstitutes: allSubstitutes.slice(0, 8)
    };

    cache.set(cacheKey, response);
    return response;
  }

  async searchByComposition(ingredients = [], pincode = '560001', options = {}) {
    const exactMatch = options.exactMatch !== false; // Default true

    // Normalize ingredients array
    let ingList = [];
    if (typeof ingredients === 'string') {
      ingList = ingredients.split(/[+,]/).map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(ingredients)) {
      ingList = ingredients
        .map(i => (typeof i === 'string' ? i.trim() : (i.name || '').trim()))
        .filter(Boolean);
    }

    if (!ingList.length) {
      return {
        query: '',
        pincode,
        searchMode: 'composition',
        platforms: {},
        comparison: null,
        genericSubstitutes: [],
        compositionInfo: {
          requestedIngredients: [],
          exactMatch,
          totalMatches: 0
        }
      };
    }

    const cacheKey = `comp_${ingList.map(s => s.toLowerCase()).sort().join('_')}_${pincode}_${exactMatch}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Determine queries using composition query builder
    const { primaryQuery, saltQuery, preset } = buildCompositionQuery(ingList);

    // Perform aggregated search using the primary formulation query
    const baseResult = await this.searchAll(primaryQuery, pincode);

    // Re-evaluate each platform's items against the exact ingredients
    const updatedPlatforms = {};
    const exactMatchTopItems = [];

    for (const [platformKey, pData] of Object.entries(baseResult.platforms || {})) {
      const items = Array.isArray(pData.items) ? pData.items : [];

      const evaluatedItems = items.map(item => {
        const evalResult = evaluateCompositionMatch(item, ingList, exactMatch);
        return {
          ...item,
          isExactMatch: evalResult.isExactMatch,
          matchedIngredients: evalResult.matchedIngredients,
          missingIngredients: evalResult.missingIngredients,
          matchScore: evalResult.matchScore,
          isKnownFormulationMatch: evalResult.isKnownFormulationMatch,
          matchedCompositionLabel: evalResult.matchedCompositionLabel
        };
      });

      // Filter exact matches if requested
      const exactItems = evaluatedItems.filter(i => i.isExactMatch);
      const itemsToUse = exactMatch ? exactItems : evaluatedItems.sort((a, b) => b.matchScore - a.matchScore);

      const topItem = itemsToUse[0] || null;
      if (topItem && (topItem.isExactMatch || !exactMatch)) {
        exactMatchTopItems.push(topItem);
      }

      updatedPlatforms[platformKey] = {
        ...pData,
        count: itemsToUse.length,
        topItem,
        items: itemsToUse
      };
    }

    // Re-evaluate comparison winners among the matched top items
    let lowestUnitPriceItem = null;
    let lowestPackPriceItem = null;
    let highestDiscountItem = null;
    let fastestDeliveryItem = null;

    if (exactMatchTopItems.length > 0) {
      const inStockItems = exactMatchTopItems.filter(i => i.inStock);
      const candidates = inStockItems.length > 0 ? inStockItems : exactMatchTopItems;

      lowestUnitPriceItem = candidates.reduce((min, cur) =>
        cur.unitPrice < min.unitPrice ? cur : min, candidates[0]);

      lowestPackPriceItem = candidates.reduce((min, cur) =>
        cur.sellingPrice < min.sellingPrice ? cur : min, candidates[0]);

      highestDiscountItem = candidates.reduce((max, cur) =>
        cur.discountPercent > max.discountPercent ? cur : max, candidates[0]);

      fastestDeliveryItem = candidates.find(i => i.deliverySpeedTier === 'ultra-fast') ||
        candidates.find(i => i.deliverySpeedTier === 'fast') ||
        candidates[0];
    }

    const response = {
      ...baseResult,
      query: ingList.join(' + '),
      searchMode: 'composition',
      platforms: updatedPlatforms,
      comparison: {
        hasData: exactMatchTopItems.length > 0,
        lowestUnitPrice: lowestUnitPriceItem ? {
          platform: lowestUnitPriceItem.platform,
          platformName: lowestUnitPriceItem.platformName,
          unitPrice: lowestUnitPriceItem.unitPrice,
          packSize: lowestUnitPriceItem.packSize,
          unitType: lowestUnitPriceItem.unitType,
          sellingPrice: lowestUnitPriceItem.sellingPrice,
          name: lowestUnitPriceItem.name
        } : null,
        lowestPackPrice: lowestPackPriceItem ? {
          platform: lowestPackPriceItem.platform,
          platformName: lowestPackPriceItem.platformName,
          sellingPrice: lowestPackPriceItem.sellingPrice,
          packSize: lowestPackPriceItem.packSize,
          unitType: lowestPackPriceItem.unitType,
          name: lowestPackPriceItem.name
        } : null,
        highestDiscount: highestDiscountItem ? {
          platform: highestDiscountItem.platform,
          platformName: highestDiscountItem.platformName,
          discountPercent: highestDiscountItem.discountPercent,
          sellingPrice: highestDiscountItem.sellingPrice,
          mrp: highestDiscountItem.mrp,
          name: highestDiscountItem.name
        } : null,
        fastestDelivery: fastestDeliveryItem ? {
          platform: fastestDeliveryItem.platform,
          platformName: fastestDeliveryItem.platformName,
          deliveryEstimate: fastestDeliveryItem.deliveryEstimate,
          name: fastestDeliveryItem.name
        } : null
      },
      compositionInfo: {
        requestedIngredients: ingList,
        exactMatch,
        totalExactMatches: exactMatchTopItems.length,
        referenceBrand: preset?.referenceBrand || null,
        presetCategory: preset?.category || null
      }
    };

    cache.set(cacheKey, response);
    return response;
  }
}

