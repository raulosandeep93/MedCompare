import express from 'express';
import multer from 'multer';
import { MedicineAggregator } from '../services/aggregator.js';
import { extractMedicineFromImage, parsePharmaText } from '../services/ocrService.js';
import { lookupPincode, getPopularPincodes } from '../services/pincodeService.js';

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

router.get('/pincode/popular', (req, res) => {
  res.json({ success: true, data: getPopularPincodes() });
});

router.get('/popular-medicines', (req, res) => {
  res.json({ success: true, data: POPULAR_MEDICINES });
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

export default router;
