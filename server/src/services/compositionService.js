/**
 * Composition and Multi-Ingredient Matching Service for Indian Pharmaceuticals.
 * Handles salt synonym normalization, multi-ingredient matching, and
 * curated Indian multi-salt formulations.
 */

// Canonical salt aliases and synonyms
const SALT_SYNONYMS = {
  // Paracetamol / Acetaminophen
  paracetamol: ['paracetamol', 'acetaminophen', 'pcm', 'apap'],
  acetaminophen: ['paracetamol', 'acetaminophen', 'pcm', 'apap'],

  // Clavulanic Acid / Clavulanate
  'clavulanic acid': ['clavulanic acid', 'clavulanate', 'potassium clavulanate', 'clav', 'clavulanic'],
  clavulanate: ['clavulanic acid', 'clavulanate', 'potassium clavulanate', 'clav', 'clavulanic'],
  'potassium clavulanate': ['clavulanic acid', 'clavulanate', 'potassium clavulanate', 'clav', 'clavulanic'],

  // Amoxicillin / Amoxycillin
  amoxicillin: ['amoxicillin', 'amoxycillin', 'amox'],
  amoxycillin: ['amoxicillin', 'amoxycillin', 'amox'],

  // Metformin
  metformin: ['metformin', 'metformin hydrochloride', 'metformin hcl'],

  // Glimepiride
  glimepiride: ['glimepiride', 'glimepirid'],

  // Telmisartan
  telmisartan: ['telmisartan'],

  // Amlodipine
  amlodipine: ['amlodipine', 'amlodipine besylate'],

  // Pantoprazole
  pantoprazole: ['pantoprazole', 'pantoprazole sodium'],

  // Domperidone
  domperidone: ['domperidone'],

  // Montelukast
  montelukast: ['montelukast', 'montelukast sodium'],

  // Levocetirizine
  levocetirizine: ['levocetirizine', 'levocetirizine dihydrochloride', 'levocetirizine hcl'],
  cetirizine: ['cetirizine', 'cetirizine dihydrochloride', 'cetirizine hcl'],

  // Aceclofenac
  aceclofenac: ['aceclofenac'],

  // Serratiopeptidase
  serratiopeptidase: ['serratiopeptidase', 'serrapeptase'],

  // Vitamin D3 / Cholecalciferol
  'vitamin d3': ['vitamin d3', 'cholecalciferol', 'vit d3', 'cholecalciferol ip'],
  cholecalciferol: ['vitamin d3', 'cholecalciferol', 'vit d3', 'cholecalciferol ip'],

  // Calcium
  calcium: ['calcium', 'calcium carbonate', 'calcium citrate', 'elemental calcium'],

  // Atorvastatin
  atorvastatin: ['atorvastatin', 'atorvastatin calcium'],

  // Fenofibrate
  fenofibrate: ['fenofibrate'],

  // Caffeine
  caffeine: ['caffeine', 'anhydrous caffeine'],

  // Phenylephrine
  phenylephrine: ['phenylephrine', 'phenylephrine hydrochloride', 'phenylephrine hcl'],

  // Chlorpheniramine
  chlorpheniramine: ['chlorpheniramine', 'chlorpheniramine maleate', 'cpm']
};

// Curated Indian multi-salt formulations with popular reference brands
export const POPULAR_COMPOSITIONS = [
  {
    id: 'amox-clav',
    title: 'Amoxicillin + Clavulanic Acid',
    category: 'Antibiotic Combination',
    referenceBrand: 'Augmentin 625 Duo',
    ingredients: [
      { name: 'Amoxicillin', strength: '500mg' },
      { name: 'Clavulanic Acid', strength: '125mg' }
    ],
    searchKeywords: ['Augmentin 625', 'Amoxyclav 625', 'Moxikind CV 625', 'Clavam 625']
  },
  {
    id: 'met-glim',
    title: 'Metformin + Glimepiride',
    category: 'Type 2 Diabetes Dual Therapy',
    referenceBrand: 'Glycomet GP 2',
    ingredients: [
      { name: 'Metformin', strength: '500mg' },
      { name: 'Glimepiride', strength: '2mg' }
    ],
    searchKeywords: ['Glycomet GP 2', 'Glimisave M 2', 'Gemer 2']
  },
  {
    id: 'mont-levo',
    title: 'Montelukast + Levocetirizine',
    category: 'Allergy & Bronchial Relief',
    referenceBrand: 'Montair LC',
    ingredients: [
      { name: 'Montelukast', strength: '10mg' },
      { name: 'Levocetirizine', strength: '5mg' }
    ],
    searchKeywords: ['Montair LC', 'Telekast L', 'Montek LC']
  },
  {
    id: 'panto-dom',
    title: 'Pantoprazole + Domperidone',
    category: 'Acidity, GERD & Nausea',
    referenceBrand: 'Pan-D',
    ingredients: [
      { name: 'Pantoprazole', strength: '40mg' },
      { name: 'Domperidone', strength: '30mg' }
    ],
    searchKeywords: ['Pan D', 'Pantocid DSR', 'Pantosec D SR']
  },
  {
    id: 'telma-amlo',
    title: 'Telmisartan + Amlodipine',
    category: 'Hypertension / BP Dual Control',
    referenceBrand: 'Telma AM',
    ingredients: [
      { name: 'Telmisartan', strength: '40mg' },
      { name: 'Amlodipine', strength: '5mg' }
    ],
    searchKeywords: ['Telma AM', 'Telmikind AM', 'Telsartan AM']
  },
  {
    id: 'pcm-caffeine',
    title: 'Paracetamol + Caffeine',
    category: 'Severe Headache & Migraine',
    referenceBrand: 'Saridon',
    ingredients: [
      { name: 'Paracetamol', strength: '500mg' },
      { name: 'Caffeine', strength: '50mg' }
    ],
    searchKeywords: ['Saridon', 'Crocin Pain Relief']
  },
  {
    id: 'aceclo-pcm-serra',
    title: 'Aceclofenac + Paracetamol + Serratiopeptidase',
    category: 'Triple Pain & Swelling Relief',
    referenceBrand: 'Zerodol-SP',
    ingredients: [
      { name: 'Aceclofenac', strength: '100mg' },
      { name: 'Paracetamol', strength: '325mg' },
      { name: 'Serratiopeptidase', strength: '15mg' }
    ],
    searchKeywords: ['Zerodol SP', 'Hifenac D', 'Signoflam']
  },
  {
    id: 'calc-vitd3',
    title: 'Calcium + Vitamin D3',
    category: 'Bone Health & Calcium Refill',
    referenceBrand: 'Shelcal 500',
    ingredients: [
      { name: 'Calcium', strength: '500mg' },
      { name: 'Vitamin D3', strength: '250IU' }
    ],
    searchKeywords: ['Shelcal 500', 'Cipcal 500', 'Gemcal']
  }
];

/**
 * Normalizes an ingredient name into a list of search regex tokens.
 */
export function getIngredientAliases(ingredientName = '') {
  const clean = ingredientName.trim().toLowerCase();
  if (SALT_SYNONYMS[clean]) {
    return SALT_SYNONYMS[clean];
  }

  // Check substring match in synonyms
  for (const [key, aliases] of Object.entries(SALT_SYNONYMS)) {
    if (clean.includes(key) || aliases.some(a => clean.includes(a))) {
      return aliases;
    }
  }

  // Fallback to the clean word itself
  return [clean];
}

/**
 * Checks if a specific ingredient is present in a target text (composition, name, or molecule).
 */
export function checkIngredientMatch(targetText = '', ingredient) {
  if (!targetText) return false;
  const normalizedText = targetText.toLowerCase();

  const ingName = typeof ingredient === 'string' ? ingredient : ingredient?.name || '';
  const aliases = getIngredientAliases(ingName);

  return aliases.some(alias => {
    // Word boundary or non-alphanumeric separator check
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');
    return regex.test(normalizedText);
  });
}

/**
 * Evaluates whether a medicine candidate contains the requested ingredients.
 * Checks item's saltComposition, brand, name, and manufacturer.
 *
 * @param {Object} item Medicine item returned by platform adapter
 * @param {Array} requestedIngredients Array of strings or { name, strength }
 * @param {Boolean} requireAll If true, ALL ingredients must match (exact match)
 * @returns {Object} Match evaluation result
 */
export function evaluateCompositionMatch(item, requestedIngredients = [], requireAll = true) {
  if (!item || !requestedIngredients.length) {
    return {
      isExactMatch: false,
      matchCount: 0,
      totalRequested: requestedIngredients.length,
      matchedIngredients: [],
      missingIngredients: [],
      matchScore: 0
    };
  }

  // Collect all searchable text fields from the item
  const compositionText = item.saltComposition || '';
  const brandText = item.brand || '';
  const nameText = item.name || '';
  const combinedText = `${compositionText} ${brandText} ${nameText}`.toLowerCase();

  const matchedIngredients = [];
  const missingIngredients = [];

  for (const ing of requestedIngredients) {
    const ingName = typeof ing === 'string' ? ing.trim() : (ing.name || '').trim();
    if (!ingName) continue;

    const isMatched = checkIngredientMatch(combinedText, ingName);
    if (isMatched) {
      matchedIngredients.push(ingName);
    } else {
      missingIngredients.push(ingName);
    }
  }

  // Also check against our known combination database if the item's brand matches
  const totalCount = requestedIngredients.length;
  let isKnownFormulationMatch = false;

  const foundPreset = POPULAR_COMPOSITIONS.find(preset => {
    // Check if item name contains any of the reference search keywords
    return preset.searchKeywords.some(kw =>
      combinedText.includes(kw.toLowerCase()) ||
      combinedText.includes(preset.referenceBrand.toLowerCase())
    );
  });

  if (foundPreset) {
    // Check if preset ingredients match requested ingredients
    const presetMatchesAll = requestedIngredients.every(req => {
      const rName = (typeof req === 'string' ? req : req.name || '').toLowerCase();
      return foundPreset.ingredients.some(pi =>
        checkIngredientMatch(pi.name, rName) || checkIngredientMatch(rName, pi.name)
      );
    });

    if (presetMatchesAll) {
      isKnownFormulationMatch = true;
      // All requested ingredients are satisfied by this known formulation
      for (const missing of [...missingIngredients]) {
        matchedIngredients.push(missing);
      }
      missingIngredients.length = 0;
    }
  }

  const matchCount = matchedIngredients.length;
  const isExactMatch = matchCount === totalCount;
  const matchScore = totalCount > 0 ? parseFloat((matchCount / totalCount).toFixed(2)) : 0;

  return {
    isExactMatch,
    matchCount,
    totalRequested: totalCount,
    matchedIngredients,
    missingIngredients,
    matchScore,
    isKnownFormulationMatch,
    matchedCompositionLabel: matchedIngredients.join(' + ')
  };
}

/**
 * Builds the best search query string for online pharmacy APIs from requested ingredients.
 */
export function buildCompositionQuery(ingredients = []) {
  if (!ingredients.length) return '';

  const names = ingredients.map(i => (typeof i === 'string' ? i.trim() : (i.name || '').trim())).filter(Boolean);

  // Check if this matches a popular combination preset to leverage its high-yielding brand keywords
  const matchedPreset = POPULAR_COMPOSITIONS.find(preset => {
    if (preset.ingredients.length !== names.length) return false;
    return names.every(n =>
      preset.ingredients.some(pi => checkIngredientMatch(pi.name, n) || checkIngredientMatch(n, pi.name))
    );
  });

  if (matchedPreset) {
    // Returning reference brand + salt produces the highest result accuracy on Indian platforms
    return {
      primaryQuery: matchedPreset.referenceBrand,
      saltQuery: names.join(' '),
      preset: matchedPreset
    };
  }

  return {
    primaryQuery: names.join(' '),
    saltQuery: names.join(' '),
    preset: null
  };
}
