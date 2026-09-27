import express from 'express';
import multer from 'multer';
import { MedicineAggregator } from '../services/aggregator.js';
import { extractMedicineFromImage, parsePharmaText } from '../services/ocrService.js';
import { lookupPincode, getPopularPincodes, reverseGeocodeLocation } from '../services/pincodeService.js';
import { POPULAR_COMPOSITIONS } from '../services/compositionService.js';
import { sendIssueNotificationEmail, getAllSavedIssues } from '../services/emailService.js';

const router = express.Router();
const aggregator = new MedicineAggregator();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Popular search suggestions for quick testing
const POPULAR_MEDICINES = [
  { name: 'Dolo 650', category: 'Fever & Pain', salt: 'Paracetamol 650mg' },
  { name: 'Telma 40', category: 'Blood Pressure / Hypertension', salt: 'Telmisartan 40mg' },
  { name: 'Augmentin 625 Duo', category: 'Antibiotic', salt: 'Amoxicillin + Clavulanic Acid' },
  { name: 'Glycomet GP 2', category: 'Type 2 Diabetes', salt: 'Metformin 500mg + Glimepiride 2mg' },
  { name: 'Pan 40', category: 'Acidity & Reflux', salt: 'Pantoprazole 40mg' },
  { name: 'Montair LC', category: 'Allergy & Respiratory', salt: 'Montelukast 10mg + Levocetirizine 5mg' },
  { name: 'Rosuvas 10', category: 'Cholesterol', salt: 'Rosuvastatin 10mg' },
  { name: 'Shelcal 500', category: 'Bone Health / Calcium', salt: 'Calcium + Vitamin D3' }
];

// ─────────────────────────────────────────────────────────
// Autocomplete suggestion dataset — medicines + active salts
// ─────────────────────────────────────────────────────────
const SUGGESTION_DATABASE = [
  // ── Fever, Pain & Anti-inflammatory ──
  { name: 'Dolo 650', salt: 'Paracetamol 650mg', category: 'Fever & Pain' },
  { name: 'Calpol 500', salt: 'Paracetamol 500mg', category: 'Fever & Pain' },
  { name: 'Combiflam', salt: 'Ibuprofen 400mg + Paracetamol 325mg', category: 'Pain & Fever' },
  { name: 'Brufen 400', salt: 'Ibuprofen 400mg', category: 'Pain & Anti-inflammatory' },
  { name: 'Voveran 50', salt: 'Diclofenac 50mg', category: 'Pain & Inflammation' },
  { name: 'Zerodol P', salt: 'Aceclofenac 100mg + Paracetamol 500mg', category: 'Pain' },
  { name: 'Hifenac P', salt: 'Aceclofenac 100mg + Paracetamol 500mg', category: 'Pain' },
  { name: 'Meftal Spas', salt: 'Mefenamic Acid + Dicyclomine', category: 'Antispasmodic' },
  { name: 'Ketorol DT', salt: 'Ketorolac 10mg', category: 'Pain Relief' },
  { name: 'Nimesulide 100', salt: 'Nimesulide 100mg', category: 'Fever & Pain' },
  // ── Antibiotics ──
  { name: 'Augmentin 625 Duo', salt: 'Amoxicillin 500mg + Clavulanic Acid 125mg', category: 'Antibiotic' },
  { name: 'Amoxyclav 625', salt: 'Amoxicillin 500mg + Clavulanic Acid 125mg', category: 'Antibiotic' },
  { name: 'Azithral 500', salt: 'Azithromycin 500mg', category: 'Antibiotic' },
  { name: 'Zithromax 500', salt: 'Azithromycin 500mg', category: 'Antibiotic' },
  { name: 'Cifran 500', salt: 'Ciprofloxacin 500mg', category: 'Antibiotic' },
  { name: 'Ciplox 500', salt: 'Ciprofloxacin 500mg', category: 'Antibiotic' },
  { name: 'Levoflox 500', salt: 'Levofloxacin 500mg', category: 'Antibiotic' },
  { name: 'Monocef 1g', salt: 'Ceftriaxone 1g', category: 'Antibiotic Injection' },
  { name: 'Metrogyl 400', salt: 'Metronidazole 400mg', category: 'Antibiotic / Antiprotozoal' },
  { name: 'Flagyl 400', salt: 'Metronidazole 400mg', category: 'Antiprotozoal' },
  { name: 'Doxycycline 100', salt: 'Doxycycline 100mg', category: 'Antibiotic' },
  // ── Blood Pressure & Cardiac ──
  { name: 'Telma 40', salt: 'Telmisartan 40mg', category: 'Blood Pressure' },
  { name: 'Telma H', salt: 'Telmisartan 40mg + Hydrochlorothiazide 12.5mg', category: 'Blood Pressure' },
  { name: 'Amlokind AT', salt: 'Amlodipine 5mg + Atenolol 50mg', category: 'Hypertension' },
  { name: 'Stamlo 5', salt: 'Amlodipine 5mg', category: 'Blood Pressure' },
  { name: 'Atenolol 50', salt: 'Atenolol 50mg', category: 'Beta Blocker' },
  { name: 'Losartan 50', salt: 'Losartan 50mg', category: 'Blood Pressure' },
  { name: 'Olmecip 20', salt: 'Olmesartan 20mg', category: 'Blood Pressure' },
  { name: 'Concor 2.5', salt: 'Bisoprolol 2.5mg', category: 'Heart Failure / Hypertension' },
  // ── Diabetes ──
  { name: 'Glycomet GP 2', salt: 'Metformin 500mg + Glimepiride 2mg', category: 'Type 2 Diabetes' },
  { name: 'Metformin 500', salt: 'Metformin 500mg', category: 'Type 2 Diabetes' },
  { name: 'Glucobay 25', salt: 'Acarbose 25mg', category: 'Diabetes' },
  { name: 'Januvia 50', salt: 'Sitagliptin 50mg', category: 'Type 2 Diabetes' },
  { name: 'Galvus 50', salt: 'Vildagliptin 50mg', category: 'Type 2 Diabetes' },
  { name: 'Jardiance 10', salt: 'Empagliflozin 10mg', category: 'Type 2 Diabetes' },
  // ── Acidity, GI & Stomach ──
  { name: 'Pan 40', salt: 'Pantoprazole 40mg', category: 'Acidity & Reflux' },
  { name: 'Omez 20', salt: 'Omeprazole 20mg', category: 'Acidity' },
  { name: 'Rablet 20', salt: 'Rabeprazole 20mg', category: 'Acidity' },
  { name: 'Nexpro 40', salt: 'Esomeprazole 40mg', category: 'Acidity' },
  { name: 'Pantodac 40', salt: 'Pantoprazole 40mg', category: 'Gastric Reflux' },
  { name: 'Domperidone 10', salt: 'Domperidone 10mg', category: 'Nausea & GI' },
  { name: 'Rcinex Forte', salt: 'Rifampicin + Isoniazid + Pyrazinamide', category: 'Tuberculosis' },
  { name: 'Ondansetron 4', salt: 'Ondansetron 4mg', category: 'Anti-nausea' },
  { name: 'Cremaffin Plus', salt: 'Liquid Paraffin + Milk of Magnesia', category: 'Constipation' },
  // ── Cholesterol & Liver ──
  { name: 'Rosuvas 10', salt: 'Rosuvastatin 10mg', category: 'Cholesterol' },
  { name: 'Rosuvas 20', salt: 'Rosuvastatin 20mg', category: 'Cholesterol' },
  { name: 'Atorva 10', salt: 'Atorvastatin 10mg', category: 'Cholesterol' },
  { name: 'Lipitor 20', salt: 'Atorvastatin 20mg', category: 'Cholesterol' },
  { name: 'Fibator 145', salt: 'Fenofibrate 145mg', category: 'Triglycerides' },
  // ── Allergy & Respiratory ──
  { name: 'Montair LC', salt: 'Montelukast 10mg + Levocetirizine 5mg', category: 'Allergy' },
  { name: 'Levocet 5', salt: 'Levocetirizine 5mg', category: 'Anti-allergic' },
  { name: 'Cetirizine 10', salt: 'Cetirizine 10mg', category: 'Anti-allergic' },
  { name: 'Allegra 120', salt: 'Fexofenadine 120mg', category: 'Anti-allergic' },
  { name: 'Asthalin Inhaler', salt: 'Salbutamol 100mcg', category: 'Asthma / Bronchodilator' },
  { name: 'Seroflo 250', salt: 'Salmeterol 25mcg + Fluticasone 250mcg', category: 'Asthma' },
  { name: 'Foracort 200', salt: 'Formoterol + Budesonide 200mcg', category: 'Asthma' },
  { name: 'Montek LC', salt: 'Montelukast 10mg + Levocetirizine 5mg', category: 'Allergy' },
  // ── Bone Health, Vitamins ──
  { name: 'Shelcal 500', salt: 'Calcium Carbonate 1.25g + Vitamin D3 250IU', category: 'Bone Health' },
  { name: 'Calcirol', salt: 'Cholecalciferol 60000IU', category: 'Vitamin D3' },
  { name: 'D-Rise 60K', salt: 'Cholecalciferol 60000IU', category: 'Vitamin D Deficiency' },
  { name: 'Becosules Z', salt: 'B-Complex + Zinc', category: 'Multivitamin' },
  { name: 'Neurobion Forte', salt: 'Vitamin B1 + B6 + B12', category: 'Nerve Health' },
  { name: 'Evion 400', salt: 'Vitamin E 400mg', category: 'Antioxidant' },
  // ── Thyroid, Hormones ──
  { name: 'Thyronorm 50', salt: 'Levothyroxine 50mcg', category: 'Thyroid' },
  { name: 'Eltroxin 50', salt: 'Levothyroxine 50mcg', category: 'Hypothyroidism' },
  { name: 'Thyronorm 100', salt: 'Levothyroxine 100mcg', category: 'Thyroid' },
  // ── Mental Health, Neurology ──
  { name: 'Nexito 5', salt: 'Escitalopram 5mg', category: 'Antidepressant' },
  { name: 'Escitalopram 10', salt: 'Escitalopram 10mg', category: 'Antidepressant / Anxiety' },
  { name: 'Etizolam 0.5', salt: 'Etizolam 0.5mg', category: 'Anxiety / Sedative' },
  { name: 'Clonazepam 0.5', salt: 'Clonazepam 0.5mg', category: 'Epilepsy / Anxiety' },
  { name: 'Gabapentin 300', salt: 'Gabapentin 300mg', category: 'Neuropathic Pain' },
  { name: 'Pregabalin 75', salt: 'Pregabalin 75mg', category: 'Nerve Pain' },
  // ── Skin & Dermatology ──
  { name: 'Betnovate-N', salt: 'Betamethasone + Neomycin Cream', category: 'Skin Infection' },
  { name: 'Candid B', salt: 'Beclomethasone + Clotrimazole Cream', category: 'Fungal Skin' },
  { name: 'Fucidin Cream', salt: 'Fusidic Acid 2% Cream', category: 'Skin Infection' },
  // ── Iron & Haemoglobin ──
  { name: 'Dexorange', salt: 'Iron + Folic Acid + Vitamin B12', category: 'Anaemia' },
  { name: 'Ferrous Sulphate', salt: 'Ferrous Sulphate 200mg', category: 'Iron Deficiency' },
  { name: 'Ferium XT', salt: 'Iron Polymaltose + Folic Acid + Zinc', category: 'Anaemia' },
  // ── Active Salts (for composition search suggestions) ──
  { name: 'Paracetamol', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Ibuprofen', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Amoxicillin', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Clavulanic Acid', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Azithromycin', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Metformin', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Glimepiride', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Pantoprazole', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Omeprazole', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Rosuvastatin', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Atorvastatin', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Montelukast', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Levocetirizine', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Cetirizine', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Telmisartan', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Amlodipine', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Domperidone', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Serratiopeptidase', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Aceclofenac', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Diclofenac', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Ciprofloxacin', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Levofloxacin', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Calcium Carbonate', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Vitamin D3', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Cholecalciferol', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Levothyroxine', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Escitalopram', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Gabapentin', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Pregabalin', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Metronidazole', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Doxycycline', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Fenofibrate', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Ondansetron', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Salbutamol', salt: 'Active Salt / API', category: 'Salt' },
  { name: 'Caffeine', salt: 'Active Salt / API', category: 'Salt' },
];


// 1. Universal Search across Apollo, Truemeds, PlatinumRx
router.get('/search', async (req, res) => {
  try {
    const { q, pincode = '560001' } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required.' });
    }

    const data = await aggregator.searchAll(q, pincode);
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[API /search] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to aggregate medicines across platforms',
      message: error.message
    });
  }
});

// 1b. Search by Composition / Multi-Salt Combinations
router.get('/search/composition', async (req, res) => {
  try {
    const { ingredients, pincode = '560001', exactMatch = 'true' } = req.query;
    if (!ingredients) {
      return res.status(400).json({ error: 'Query parameter "ingredients" is required.' });
    }

    const isExact = exactMatch === 'true' || exactMatch === true || exactMatch === '1';
    const ingList = typeof ingredients === 'string'
      ? ingredients.split(/[+,]/).map(s => s.trim()).filter(Boolean)
      : ingredients;

    const data = await aggregator.searchByComposition(ingList, pincode, { exactMatch: isExact });
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[API /search/composition] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search by medicine composition',
      message: error.message
    });
  }
});

router.post('/search/composition', async (req, res) => {
  try {
    const { ingredients, pincode = '560001', exactMatch = true } = req.body;
    if (!ingredients || (Array.isArray(ingredients) && ingredients.length === 0)) {
      return res.status(400).json({ error: 'Body field "ingredients" is required.' });
    }

    const data = await aggregator.searchByComposition(ingredients, pincode, { exactMatch });
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('[API POST /search/composition] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search by medicine composition',
      message: error.message
    });
  }
});

router.get('/popular-compositions', (req, res) => {
  res.json({ success: true, data: POPULAR_COMPOSITIONS });
});

// 2. Pincode verification & delivery SLA
router.get('/pincode/lookup', async (req, res) => {
  try {
    const { pincode } = req.query;
    const info = await lookupPincode(pincode);
    res.json({ success: true, data: info });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/pincode/reverse-geocode', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, error: 'Latitude and Longitude are required' });
    }
    const info = await reverseGeocodeLocation(lat, lng);
    res.json({ success: true, data: info });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/pincode/popular', (req, res) => {
  res.json({ success: true, data: getPopularPincodes() });
});

router.get('/popular-medicines', (req, res) => {
  res.json({ success: true, data: POPULAR_MEDICINES });
});

// Autocomplete suggestions endpoint
router.get('/suggestions', (req, res) => {
  const { q = '', mode = 'name' } = req.query;
  const trimmed = q.trim().toLowerCase();

  if (!trimmed || trimmed.length < 2) {
    return res.json({ success: true, data: [] });
  }

  const results = SUGGESTION_DATABASE.filter((item) => {
    const nameMatch = item.name.toLowerCase().includes(trimmed);
    const saltMatch = item.salt.toLowerCase().includes(trimmed);

    // For composition mode, prioritise salt matches and include salts
    if (mode === 'composition') {
      return saltMatch || nameMatch;
    }
    return nameMatch || saltMatch;
  });

  // Sort: items starting with the query come first
  results.sort((a, b) => {
    const aStarts = a.name.toLowerCase().startsWith(trimmed) ? 0 : 1;
    const bStarts = b.name.toLowerCase().startsWith(trimmed) ? 0 : 1;
    return aStarts - bStarts;
  });

  res.json({ success: true, data: results.slice(0, 8) });
});

// 4. Platform Delivery Availability check for a pincode
// Runs a lightweight probe search to determine which platforms service the given pincode.
// Results are cached server-side for 10 minutes.
router.get('/check-availability', async (req, res) => {
  try {
    const { pincode = '560001' } = req.query;
    // Use a common OTC medicine as probe; results discarded, only availability matters
    const data = await aggregator.searchAll('paracetamol', pincode);
    const availability = {};
    if (data && data.platforms) {
      for (const [key, platform] of Object.entries(data.platforms)) {
        availability[key] = {
          platformName: platform.platformName,
          available: platform.available === true || platform.count > 0
        };
      }
    }
    res.json({ success: true, pincode, availability });
  } catch (error) {
    console.error('[API /check-availability] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Medicine Strip Photo Upload & OCR Extraction
router.post('/scan-strip', upload.single('stripImage'), async (req, res) => {
  try {
    if (!req.file) {
      // Check if text was passed directly as simulated scan
      if (req.body.simulatedText) {
        const parsed = parsePharmaText(req.body.simulatedText);
        return res.json({ success: true, data: parsed });
      }
      return res.status(400).json({ success: false, error: 'No image file uploaded.' });
    }

    const extraction = await extractMedicineFromImage(req.file.buffer);
    res.json({
      success: true,
      data: extraction
    });
  } catch (error) {
    console.error('[API /scan-strip] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process medicine strip image',
      message: error.message
    });
  }
});

// 5. Customer Issue Reporting & Email Notification
router.post('/report-issue', async (req, res) => {
  try {
    const { category, categoryLabel, platform, medicineName, description, email } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, error: 'Description is required.' });
    }

    const report = {
      id: `issue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      category: category || 'other',
      categoryLabel: categoryLabel || category || 'General Issue',
      platform: platform || 'All Stores / General',
      medicineName: (medicineName || '').trim(),
      description: description.trim(),
      email: (email || '').trim(),
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || ''
    };

    const notificationResult = await sendIssueNotificationEmail(report);
    res.json({
      success: true,
      message: 'Issue reported successfully.',
      data: report,
      notification: notificationResult
    });
  } catch (error) {
    console.error('[API /report-issue] Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. View logged issues (for inspection / admin)
router.get('/reports', (req, res) => {
  const issues = getAllSavedIssues();
  res.json({ success: true, count: issues.length, data: issues });
});

export default router;
