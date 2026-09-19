import { createWorker } from 'tesseract.js';

// Common Indian Pharma Active Ingredients (Salts)
const PHARMA_SALTS = [
  'paracetamol', 'acetaminophen',
  'amoxicillin', 'clavulanate', 'potassium clavulanate',
  'telmisartan', 'amlodipine', 'losartan', 'atenolol',
  'pantoprazole', 'omeprazole', 'rabeprazole', 'esomeprazole',
  'metformin', 'glimepiride', 'vildagliptin', 'sitagliptin', 'dapagliflozin',
  'atorvastatin', 'rosuvastatin',
  'montelukast', 'levocetirizine', 'cetirizine', 'fexofenadine',
  'azithromycin', 'ciprofloxacin', 'cefixime', 'ofloxacin',
  'ibuprofen', 'diclofenac', 'aceclofenac', 'tramadol',
  'vitamin d3', 'cholecalciferol', 'calcium', 'folic acid', 'methylcobalamin'
];

// Popular Indian Brand Names for high-confidence matching
const POPULAR_BRANDS = [
  'dolo', 'calpol', 'crocin', 'p-650', 'pacimol',
  'augmentin', 'moxikind', 'clamav',
  'telma', 'telsartan', 'telmikind', 'telpres',
  'pan', 'pantocid', 'pantosec', 'pan-d',
  'glycomet', 'glycomet-gp', 'glimin',
  'rosuvas', 'atorva', 'lipaglyn',
  'montair', 'montair-lc', 'telekast',
  'azithral', 'zady', 'azee',
  'shelcal', 'cipcal', 'gemcal',
  'volini', 'combiflam', 'zerodol'
];

let workerInstance = null;

async function getWorker() {
  if (!workerInstance) {
    workerInstance = await createWorker('eng');
  }
  return workerInstance;
}

export async function extractMedicineFromImage(imageBuffer) {
  try {
    const worker = await getWorker();
    const { data } = await worker.recognize(imageBuffer);
    const rawText = data.text || '';

    return parsePharmaText(rawText);
  } catch (error) {
    console.error('[OCR Service] Extraction error:', error);
    // Return graceful fallback
    return {
      success: false,
      error: error.message,
      detectedName: null,
      rawText: ''
    };
  }
}

export function parsePharmaText(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const normalized = text.toLowerCase();

  let detectedBrand = null;
  let detectedSalt = null;
  let detectedDosage = null;

  // 1. Detect Dosage (e.g. 650mg, 650 mg, 625, 40mg, 500mg, 10mg, 5mg)
  const dosageMatch = text.match(/\b(\d+(?:\.\d+)?)\s*(?:mg|gm|mcg|iu)\b/i) || text.match(/\b(650|625|500|400|250|100|40|20|10|5)\b/);
  if (dosageMatch) {
    detectedDosage = dosageMatch[0];
  }

  // 2. Detect Brand Name
  for (const brand of POPULAR_BRANDS) {
    const regex = new RegExp(`\\b${brand}\\b`, 'i');
    if (regex.test(normalized)) {
      detectedBrand = brand.toUpperCase();
      break;
    }
  }

  // 3. Detect Active Salt / Composition
  for (const salt of PHARMA_SALTS) {
    const regex = new RegExp(`\\b${salt}\\b`, 'i');
    if (regex.test(normalized)) {
      detectedSalt = salt.charAt(0).toUpperCase() + salt.slice(1);
      break;
    }
  }

  // Formulate primary search query
  let searchQuery = '';
  if (detectedBrand && detectedDosage) {
    searchQuery = `${detectedBrand} ${detectedDosage}`;
  } else if (detectedBrand) {
    searchQuery = detectedBrand;
  } else if (detectedSalt && detectedDosage) {
    searchQuery = `${detectedSalt} ${detectedDosage}`;
  } else if (detectedSalt) {
    searchQuery = detectedSalt;
  } else {
    // If no exact match, grab the most prominent capitalized alphanumeric token
    const candidate = lines.find(l => l.length >= 4 && l.length <= 25 && !/warning|schedule|prescription|mfg|lic|batch/i.test(l));
    searchQuery = candidate || 'Dolo 650';
  }

  return {
    success: true,
    detectedName: searchQuery,
    detectedBrand: detectedBrand || null,
    detectedComposition: detectedSalt ? `${detectedSalt} ${detectedDosage || ''}`.trim() : null,
    detectedDosage: detectedDosage || null,
    rawText: text.slice(0, 500),
    confidence: detectedBrand && detectedDosage ? 'high' : detectedBrand || detectedSalt ? 'medium' : 'low'
  };
}
