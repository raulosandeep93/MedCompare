/**
 * Medicine Information Service
 * Derives structured clinical information (uses, side effects, warnings,
 * drug class, food interactions) from a medicine's salt composition or brand name.
 * Uses a curated lookup table of common Indian pharmaceuticals & active ingredients.
 */

// ─── Comprehensive salt knowledge base ───────────────────────────────────────
const SALT_INFO_DB = {
  // ── Paracetamol / Acetaminophen ──
  paracetamol: {
    drugClass: 'Analgesic & Antipyretic',
    uses: ['Reduces fever (antipyretic)', 'Relieves mild to moderate pain (headache, toothache, muscle ache, backache)', 'Post-vaccination fever'],
    sideEffects: ['Nausea (rare at therapeutic doses)', 'Liver toxicity in overdose', 'Skin rash (allergic reaction, rare)'],
    warnings: ['Do not exceed 4g/day in adults', 'Avoid alcohol while taking paracetamol — increases liver toxicity risk', 'Caution in liver or kidney disease'],
    foodInteractions: ['Avoid alcohol'],
    pregnancySafety: 'Generally safe in all trimesters at recommended doses'
  },
  acetaminophen: {
    drugClass: 'Analgesic & Antipyretic',
    uses: ['Reduces fever', 'Relieves mild to moderate pain'],
    sideEffects: ['Liver toxicity in overdose', 'Skin rash (rare)'],
    warnings: ['Do not exceed 4g/day', 'Avoid alcohol'],
    foodInteractions: ['Avoid alcohol'],
    pregnancySafety: 'Generally safe at therapeutic doses'
  },

  // ── Ibuprofen ──
  ibuprofen: {
    drugClass: 'NSAID (Non-Steroidal Anti-Inflammatory Drug)',
    uses: ['Pain relief (dental, menstrual, headache, arthritis)', 'Anti-inflammatory for sports injuries and joint pain', 'Fever reduction'],
    sideEffects: ['Stomach upset, heartburn, nausea', 'Peptic ulcers with long-term use', 'Increased blood pressure', 'Kidney dysfunction with prolonged use', 'Risk of cardiovascular events (high dose, long term)'],
    warnings: ['Take with food or milk to reduce stomach irritation', 'Avoid in patients with peptic ulcers or GI bleeding', 'Caution in kidney, liver, or heart disease', 'Avoid in last trimester of pregnancy', 'Not recommended for children under 3 months'],
    foodInteractions: ['Take with food or milk', 'Avoid alcohol'],
    pregnancySafety: 'Avoid in 3rd trimester; caution in 1st & 2nd trimester'
  },

  // ── Amoxicillin ──
  amoxicillin: {
    drugClass: 'Beta-Lactam Antibiotic (Aminopenicillin)',
    uses: ['Bacterial infections of the ear, nose, and throat', 'Respiratory tract infections (pneumonia, bronchitis)', 'Urinary tract infections (UTI)', 'Skin and soft tissue infections', 'H. pylori eradication (in combination)'],
    sideEffects: ['Nausea, vomiting, diarrhea', 'Skin rash (including allergic rash)', 'Oral thrush (Candida overgrowth with prolonged use)', 'Anaphylaxis (rare but serious allergic reaction)'],
    warnings: ['Inform your doctor of any penicillin allergy', 'Complete the full course even if symptoms improve', 'Can reduce efficacy of oral contraceptives'],
    foodInteractions: ['Can be taken with or without food'],
    pregnancySafety: 'Generally considered safe (Category B)'
  },

  // ── Clavulanic Acid ──
  'clavulanic acid': {
    drugClass: 'Beta-Lactamase Inhibitor',
    uses: ['Used in combination with amoxicillin to treat antibiotic-resistant infections', 'Extends amoxicillin coverage to include beta-lactamase producing bacteria'],
    sideEffects: ['Nausea, vomiting, diarrhea', 'Skin rash', 'Liver enzyme elevation (rare)'],
    warnings: ['Can cause liver toxicity with prolonged use — monitor liver function', 'Do not use if allergic to penicillin'],
    foodInteractions: ['Take with food to reduce GI side effects'],
    pregnancySafety: 'Generally safe; consult your doctor'
  },

  // ── Azithromycin ──
  azithromycin: {
    drugClass: 'Macrolide Antibiotic',
    uses: ['Community-acquired pneumonia', 'Typhoid fever (second line)', 'Sexually transmitted infections (chlamydia, gonorrhea)', 'Sinusitis, pharyngitis, bronchitis', 'Skin infections'],
    sideEffects: ['Nausea, vomiting, abdominal cramps', 'Diarrhea', 'QT interval prolongation (heart rhythm effect)', 'Hearing loss (rare, high dose or prolonged)', 'Liver dysfunction (rare)'],
    warnings: ['Avoid in patients with liver disease or QT prolongation', 'Do not take antacids within 2 hours', 'Avoid in myasthenia gravis'],
    foodInteractions: ['Can be taken with or without food (food reduces stomach upset)'],
    pregnancySafety: 'Category B — use only if clearly needed'
  },

  // ── Metformin ──
  metformin: {
    drugClass: 'Biguanide Antidiabetic',
    uses: ['First-line treatment for Type 2 Diabetes Mellitus', 'Polycystic Ovary Syndrome (PCOS) — improves insulin resistance', 'Prevention of Type 2 DM in pre-diabetes'],
    sideEffects: ['Nausea, vomiting, diarrhea (especially on initiation)', 'Abdominal discomfort and bloating', 'Metallic taste', 'Lactic acidosis (rare but serious, particularly in renal impairment)', 'Vitamin B12 deficiency with long-term use'],
    warnings: ['Hold before iodinated contrast procedures (CT scans, angiograms)', 'Avoid in severe kidney disease (eGFR < 30)', 'Avoid excessive alcohol', 'Check B12 levels periodically with long-term use'],
    foodInteractions: ['Take with food to reduce GI side effects', 'Avoid excess alcohol (risk of lactic acidosis)'],
    pregnancySafety: 'Used in gestational diabetes under medical supervision; consult doctor'
  },

  // ── Glimepiride ──
  glimepiride: {
    drugClass: 'Sulfonylurea Antidiabetic',
    uses: ['Type 2 Diabetes Mellitus — stimulates pancreatic insulin secretion'],
    sideEffects: ['Hypoglycemia (low blood sugar) — most common risk', 'Weight gain', 'Nausea', 'Skin sensitivity to sun (photosensitivity)'],
    warnings: ['Monitor blood glucose regularly', 'Risk of severe hypoglycemia — carry sugar tablets', 'Avoid skipping meals', 'Use with caution in elderly patients', 'Avoid in severe kidney or liver disease'],
    foodInteractions: ['Take 30 minutes before breakfast', 'Avoid alcohol (risk of hypoglycemia)'],
    pregnancySafety: 'Not recommended in pregnancy — use insulin instead'
  },

  // ── Pantoprazole ──
  pantoprazole: {
    drugClass: 'Proton Pump Inhibitor (PPI)',
    uses: ['Gastroesophageal reflux disease (GERD / Acid Reflux)', 'Peptic ulcer disease (gastric and duodenal ulcers)', 'Zollinger-Ellison Syndrome', 'Prevention of NSAID-induced ulcers', 'H. pylori eradication (as part of triple therapy)'],
    sideEffects: ['Headache', 'Nausea, diarrhea', 'Abdominal pain', 'Hypomagnesemia with long-term use', 'Increased risk of C. difficile infection', 'Bone fractures with long-term use (osteoporosis risk)'],
    warnings: ['Long-term use (>1 year) — monitor magnesium and B12 levels', 'Can mask symptoms of gastric cancer — investigate if symptoms persist', 'Avoid abrupt discontinuation — rebound hyperacidity possible'],
    foodInteractions: ['Take 30–60 minutes before meals on an empty stomach', 'Avoid alcohol and spicy foods'],
    pregnancySafety: 'Category B — use only when necessary'
  },

  // ── Omeprazole ──
  omeprazole: {
    drugClass: 'Proton Pump Inhibitor (PPI)',
    uses: ['GERD and acid reflux', 'Peptic ulcer treatment and prevention', 'H. pylori eradication'],
    sideEffects: ['Headache, diarrhea, nausea', 'Hypomagnesemia (long-term)', 'B12 deficiency (long-term)', 'Bone fracture risk (long-term)'],
    warnings: ['Take on empty stomach, 30 min before meals', 'Avoid long-term use without medical supervision', 'Can interact with clopidogrel (antiplatelet)'],
    foodInteractions: ['Take before meals', 'Avoid alcohol and citrus'],
    pregnancySafety: 'Category C — use with caution'
  },

  // ── Telmisartan ──
  telmisartan: {
    drugClass: 'Angiotensin Receptor Blocker (ARB) — Antihypertensive',
    uses: ['Hypertension (high blood pressure)', 'Cardiovascular risk reduction in high-risk patients', 'Diabetic nephropathy protection'],
    sideEffects: ['Dizziness, lightheadedness (especially on standing up)', 'Hyperkalemia (elevated potassium)', 'Upper respiratory tract infection', 'Back pain', 'Diarrhea'],
    warnings: ['CONTRAINDICATED in pregnancy — can cause fetal harm', 'Avoid potassium supplements or potassium-sparing diuretics', 'Monitor kidney function and potassium levels', 'Avoid in bilateral renal artery stenosis'],
    foodInteractions: ['Avoid potassium-rich foods in excess (bananas, potatoes) when on potassium-sparing drugs'],
    pregnancySafety: 'CONTRAINDICATED — causes serious fetal harm'
  },

  // ── Amlodipine ──
  amlodipine: {
    drugClass: 'Calcium Channel Blocker (Dihydropyridine) — Antihypertensive',
    uses: ['Hypertension (high blood pressure)', 'Stable angina (chest pain)', 'Vasospastic (Prinzmetal) angina'],
    sideEffects: ['Peripheral edema (ankle/foot swelling)', 'Flushing, headache', 'Dizziness', 'Palpitations', 'Gingival hyperplasia (gum overgrowth)'],
    warnings: ['Do not stop abruptly (risk of rebound angina)', 'Grapefruit juice can increase blood levels — avoid', 'Caution in liver disease'],
    foodInteractions: ['Avoid grapefruit juice'],
    pregnancySafety: 'Category C — use with caution; alternatives preferred'
  },

  // ── Montelukast ──
  montelukast: {
    drugClass: 'Leukotriene Receptor Antagonist (Anti-allergic / Anti-asthmatic)',
    uses: ['Prevention and management of asthma', 'Allergic rhinitis (hay fever)', 'Exercise-induced bronchoconstriction', 'Hives (chronic urticaria)'],
    sideEffects: ['Headache', 'Diarrhea, abdominal pain', 'Fatigue', 'Neuropsychiatric effects (rare) — mood changes, sleep disturbances, nightmares, agitation, anxiety, depression'],
    warnings: ['FDA Black Box Warning: Serious neuropsychiatric events reported — monitor mental health', 'Not for acute asthma attacks — use rescue inhaler', 'Report any behavioural changes to your doctor immediately'],
    foodInteractions: ['Can be taken with or without food'],
    pregnancySafety: 'Category B — generally considered safe'
  },

  // ── Levocetirizine ──
  levocetirizine: {
    drugClass: 'Second-Generation Antihistamine',
    uses: ['Allergic rhinitis (seasonal and perennial)', 'Chronic urticaria (hives)', 'Itchy skin, eczema, watery eyes from allergies'],
    sideEffects: ['Drowsiness (less than older antihistamines)', 'Dry mouth', 'Fatigue', 'Headache', 'Nausea'],
    warnings: ['Avoid driving or operating heavy machinery if drowsy', 'Reduce dose in kidney impairment', 'Avoid alcohol — enhances sedation'],
    foodInteractions: ['Avoid alcohol'],
    pregnancySafety: 'Category B — use with caution'
  },

  // ── Cetirizine ──
  cetirizine: {
    drugClass: 'Second-Generation Antihistamine',
    uses: ['Allergic rhinitis', 'Chronic urticaria', 'Itching from insect bites and eczema'],
    sideEffects: ['Drowsiness', 'Dry mouth', 'Headache', 'Fatigue', 'Nausea'],
    warnings: ['Avoid alcohol', 'Caution with sedatives and tranquilizers', 'Reduce dose in renal impairment'],
    foodInteractions: ['Avoid alcohol'],
    pregnancySafety: 'Category B — use with caution'
  },

  // ── Aceclofenac ──
  aceclofenac: {
    drugClass: 'NSAID (Non-Steroidal Anti-Inflammatory Drug)',
    uses: ['Osteoarthritis and rheumatoid arthritis', 'Ankylosing spondylitis', 'Post-operative pain', 'Dental pain', 'Dysmenorrhea (menstrual pain)'],
    sideEffects: ['Nausea, dyspepsia, stomach pain', 'Diarrhea', 'Gastric ulcer with prolonged use', 'Elevated liver enzymes', 'Increased cardiovascular risk with long-term use'],
    warnings: ['Take with food to reduce GI side effects', 'Avoid in peptic ulcer disease', 'Monitor kidney and liver function with chronic use', 'Avoid in last trimester of pregnancy'],
    foodInteractions: ['Take with food or after meals'],
    pregnancySafety: 'Avoid especially in 3rd trimester'
  },

  // ── Diclofenac ──
  diclofenac: {
    drugClass: 'NSAID (Non-Steroidal Anti-Inflammatory Drug)',
    uses: ['Pain and inflammation in arthritis', 'Back pain, muscle pain, sprains', 'Migraine', 'Dental and post-surgical pain', 'Dysmenorrhea'],
    sideEffects: ['GI upset, nausea, vomiting', 'Peptic ulcer (long-term use)', 'Liver toxicity', 'Increased blood pressure', 'Elevated cardiovascular risk'],
    warnings: ['Avoid in peptic ulcer, renal or hepatic disease', 'Highest cardiovascular risk among NSAIDs — use lowest effective dose', 'Available as gel or injection for targeted use'],
    foodInteractions: ['Take with food or milk'],
    pregnancySafety: 'Avoid in 3rd trimester; avoid altogether if possible'
  },

  // ── Serratiopeptidase ──
  serratiopeptidase: {
    drugClass: 'Proteolytic Enzyme (Anti-inflammatory)',
    uses: ['Reduces post-operative swelling and inflammation', 'Chronic sinusitis (mucolytic)', 'Carpal tunnel syndrome', 'Sports injuries', 'Adjunct to antibiotics for localized infections'],
    sideEffects: ['Nausea, stomach discomfort', 'Skin rash (allergic, rare)', 'Muscle ache', 'Joint pain (rare)'],
    warnings: ['Avoid in bleeding disorders or patients on anticoagulants', 'Not recommended in severe liver or kidney disease'],
    foodInteractions: ['Take on empty stomach for best absorption'],
    pregnancySafety: 'Safety not established — consult doctor'
  },

  // ── Rosuvastatin ──
  rosuvastatin: {
    drugClass: 'HMG-CoA Reductase Inhibitor (Statin) — Lipid-Lowering',
    uses: ['High cholesterol (hypercholesterolemia)', 'Cardiovascular risk reduction (heart attacks, strokes)', 'Hypertriglyceridemia', 'Familial hypercholesterolemia'],
    sideEffects: ['Muscle pain or weakness (myalgia)', 'Rhabdomyolysis (severe muscle breakdown — rare)', 'Liver enzyme elevation', 'Headache', 'Nausea', 'New-onset diabetes risk'],
    warnings: ['Report any unexplained muscle pain or weakness immediately', 'Avoid grapefruit juice', 'Monitor liver enzymes periodically', 'CONTRAINDICATED in pregnancy and breastfeeding', 'Reduce dose or avoid in renal impairment'],
    foodInteractions: ['Can be taken with or without food', 'Avoid grapefruit juice'],
    pregnancySafety: 'CONTRAINDICATED in pregnancy'
  },

  // ── Atorvastatin ──
  atorvastatin: {
    drugClass: 'HMG-CoA Reductase Inhibitor (Statin)',
    uses: ['High LDL cholesterol', 'Prevention of cardiovascular disease', 'Stroke prevention'],
    sideEffects: ['Muscle pain, myopathy', 'Liver toxicity (rare)', 'Headache', 'Nausea', 'New-onset diabetes'],
    warnings: ['Avoid grapefruit juice', 'Contraindicated in pregnancy', 'Monitor liver enzymes', 'Report muscle pain immediately'],
    foodInteractions: ['Avoid grapefruit juice', 'Can be taken any time of day'],
    pregnancySafety: 'CONTRAINDICATED'
  },

  // ── Levothyroxine ──
  levothyroxine: {
    drugClass: 'Thyroid Hormone Replacement',
    uses: ['Hypothyroidism (underactive thyroid)', 'Thyroid cancer (suppression therapy)', 'Hashimoto\'s thyroiditis', 'Myxedema coma (emergency)'],
    sideEffects: ['Palpitations, rapid heartbeat (if over-dosed)', 'Weight loss, tremors, anxiety (over-dosage symptoms)', 'Insomnia', 'Heat intolerance, excessive sweating', 'Osteoporosis risk with long-term high doses'],
    warnings: ['Take on empty stomach 30–60 minutes before breakfast', 'Do not take within 4 hours of calcium, iron, or antacids (impair absorption)', 'Brand changes can alter bioavailability — stick to one brand', 'Never stop abruptly', 'Regular TSH monitoring required'],
    foodInteractions: ['Take on empty stomach', 'Avoid calcium-rich foods, iron supplements, soy, coffee within 4 hours of dose'],
    pregnancySafety: 'Essential in pregnancy — dose may need adjustment; consult endocrinologist'
  },

  // ── Escitalopram ──
  escitalopram: {
    drugClass: 'SSRI (Selective Serotonin Reuptake Inhibitor) — Antidepressant',
    uses: ['Major depressive disorder (MDD)', 'Generalized anxiety disorder (GAD)', 'Panic disorder', 'Social anxiety disorder', 'OCD (off-label)'],
    sideEffects: ['Nausea (common at initiation)', 'Insomnia or drowsiness', 'Sexual dysfunction (decreased libido)', 'Dry mouth', 'Headache', 'Suicidal ideation (risk in young adults — monitor closely)'],
    warnings: ['Black Box Warning: Increased risk of suicidal thoughts in children, adolescents, young adults — monitor closely', 'Do not stop abruptly — taper dose to avoid discontinuation syndrome', 'Avoid with MAOIs (serotonin syndrome risk)', 'May take 2–4 weeks to see full therapeutic effect'],
    foodInteractions: ['Avoid alcohol', 'Can be taken with or without food'],
    pregnancySafety: 'Category C — risk vs benefit to be assessed with doctor'
  },

  // ── Gabapentin ──
  gabapentin: {
    drugClass: 'Anticonvulsant / Neuropathic Pain Agent',
    uses: ['Neuropathic pain (diabetic neuropathy, post-herpetic neuralgia)', 'Epilepsy (adjunctive therapy)', 'Restless legs syndrome', 'Fibromyalgia (off-label)'],
    sideEffects: ['Drowsiness, sedation (very common)', 'Dizziness, unsteady gait', 'Weight gain', 'Peripheral edema', 'Cognitive dulling, memory issues'],
    warnings: ['Caution when driving or operating machinery', 'Taper dose when discontinuing — abrupt withdrawal can cause seizures', 'Reduce dose in renal impairment', 'Potential for abuse/dependence'],
    foodInteractions: ['Avoid alcohol (enhances sedation)', 'High-fat food increases absorption'],
    pregnancySafety: 'Category C — avoid unless essential'
  },

  // ── Pregabalin ──
  pregabalin: {
    drugClass: 'Anticonvulsant / Neuropathic Pain Agent',
    uses: ['Diabetic peripheral neuropathy', 'Post-herpetic neuralgia', 'Fibromyalgia', 'Partial onset seizures (adjunctive)', 'Generalized anxiety disorder (GAD)'],
    sideEffects: ['Dizziness (very common)', 'Somnolence (sleepiness)', 'Weight gain', 'Blurred vision', 'Peripheral edema', 'Cognitive impairment'],
    warnings: ['Potential for abuse — Schedule V controlled substance (US); narcotic-like scheduling in some countries', 'Do not stop abruptly', 'Caution in renal impairment — dose reduction required', 'Avoid alcohol'],
    foodInteractions: ['Can be taken with or without food', 'Avoid alcohol'],
    pregnancySafety: 'Category C — risk to fetus; avoid unless essential'
  },

  // ── Metronidazole ──
  metronidazole: {
    drugClass: 'Nitroimidazole Antibiotic / Antiprotozoal',
    uses: ['Bacterial vaginosis (BV)', 'Pelvic inflammatory disease (PID)', 'Amoebic dysentery and liver abscess', 'Giardiasis', 'C. difficile infection', 'H. pylori eradication (in combination)'],
    sideEffects: ['Nausea, vomiting, metallic taste', 'Diarrhea, abdominal cramping', 'Dark/discoloured urine', 'Peripheral neuropathy (prolonged use)', 'Headache, dizziness'],
    warnings: ['Absolute contraindication with alcohol during and for 48 hours after treatment (disulfiram-like reaction — severe flushing, vomiting)', 'Avoid in first trimester of pregnancy', 'Can potentiate warfarin anticoagulant effect'],
    foodInteractions: ['STRICTLY avoid alcohol during and 48 hours after treatment', 'Take with food to reduce nausea'],
    pregnancySafety: 'Avoid in 1st trimester; cautious use in 2nd and 3rd trimester'
  },

  // ── Doxycycline ──
  doxycycline: {
    drugClass: 'Tetracycline Antibiotic',
    uses: ['Respiratory infections (atypical pneumonia)', 'STIs (chlamydia, syphilis)', 'Malaria prophylaxis and treatment', 'Lyme disease', 'Acne vulgaris (anti-inflammatory)', 'Rickettsia infections'],
    sideEffects: ['Nausea, vomiting (take with food)', 'Photosensitivity (sunburn easily)', 'Oesophageal irritation if not taken with enough water', 'Yeast infections', 'Tooth discoloration (in children <8 years — avoid)'],
    warnings: ['Do not lie down for 30 minutes after taking', 'Use sunscreen — high photosensitivity risk', 'CONTRAINDICATED in children under 8 years and pregnancy', 'Avoid antacids and dairy 2 hours before/after dose'],
    foodInteractions: ['Avoid dairy products (milk, yogurt) and calcium-rich foods within 2 hours', 'Take with plenty of water'],
    pregnancySafety: 'CONTRAINDICATED in pregnancy and lactation'
  },

  // ── Calcium Carbonate / Calcium ──
  calcium: {
    drugClass: 'Mineral Supplement',
    uses: ['Calcium deficiency', 'Osteoporosis prevention and treatment', 'Hypocalcemia', 'Adjunct in vitamin D deficiency'],
    sideEffects: ['Constipation (most common)', 'Nausea, bloating', 'Hypercalcemia at high doses (weakness, confusion, kidney stones)'],
    warnings: ['Split doses throughout the day for better absorption', 'Avoid taking with levothyroxine or iron supplements (reduces absorption)', 'Monitor calcium levels in kidney disease'],
    foodInteractions: ['Avoid taking at the same time as iron supplements or levothyroxine', 'Vitamin D enhances calcium absorption'],
    pregnancySafety: 'Safe and recommended during pregnancy'
  },
  'calcium carbonate': {
    drugClass: 'Calcium Supplement (Antacid)',
    uses: ['Calcium supplementation and osteoporosis', 'Antacid for heartburn and acid indigestion', 'Hyperphosphatemia in chronic kidney disease'],
    sideEffects: ['Constipation', 'Nausea', 'Belching', 'Kidney stones at high doses'],
    warnings: ['Take with food (requires stomach acid for absorption)', 'Avoid high doses (>2.5g/day)', 'Reduce dose in kidney disease'],
    foodInteractions: ['Take with meals', 'Avoid excess oxalate-rich foods (spinach) if prone to kidney stones'],
    pregnancySafety: 'Safe in recommended doses'
  },

  // ── Vitamin D3 / Cholecalciferol ──
  'vitamin d3': {
    drugClass: 'Fat-Soluble Vitamin / Hormone Precursor',
    uses: ['Vitamin D deficiency and insufficiency', 'Osteoporosis and osteomalacia prevention', 'Rickets in children', 'Immune system modulation', 'Muscle function support'],
    sideEffects: ['Hypercalcemia at toxic doses (fatigue, confusion, frequent urination, kidney stones)', 'Nausea, constipation (high doses)', 'Weakness'],
    warnings: ['Toxicity possible with excessive supplementation — do not self-medicate high doses', 'Monitor serum 25-OH Vitamin D and calcium levels', 'High-dose supplementation (>4000 IU/day) requires medical supervision'],
    foodInteractions: ['Take with a fatty meal for best absorption (fat-soluble vitamin)', 'Calcium intake synergizes with Vitamin D'],
    pregnancySafety: 'Safe and recommended; supplement to maintain adequate levels'
  },
  cholecalciferol: {
    drugClass: 'Fat-Soluble Vitamin',
    uses: ['Vitamin D deficiency treatment and prevention', 'Bone health support'],
    sideEffects: ['Hypercalcemia at high doses', 'Nausea and weakness (overdose)'],
    warnings: ['Monitor serum levels with high-dose therapy', 'Take with fatty food'],
    foodInteractions: ['Take with fatty meal'],
    pregnancySafety: 'Recommended supplementation in pregnancy'
  },

  // ── Folic Acid / Folate ──
  'folic acid': {
    drugClass: 'B-Group Vitamin (Vitamin B9)',
    uses: ['Prevention of neural tube defects in pregnancy', 'Megaloblastic anemia treatment', 'Folate deficiency supplementation', 'Adjunct therapy in methotrexate use', 'Cardiovascular risk reduction (homocysteine lowering)'],
    sideEffects: ['Generally very well tolerated', 'Rarely: nausea, loss of appetite, bitter taste', 'May mask B12 deficiency'],
    warnings: ['Can mask symptoms of vitamin B12 deficiency — always check B12 if supplementing folic acid', 'High dose supplementation (>5mg/day) requires medical supervision'],
    foodInteractions: ['Can be taken with or without food'],
    pregnancySafety: 'Essential in pregnancy — recommended at 400–800 mcg/day preconception and first trimester'
  },
  folate: {
    drugClass: 'B-Group Vitamin (Vitamin B9)',
    uses: ['Prevention of neural tube defects', 'Megaloblastic anemia', 'Homocysteine lowering'],
    sideEffects: ['Very well tolerated; may mask B12 deficiency'],
    warnings: ['Ensure adequate B12 status when supplementing long-term'],
    foodInteractions: ['Can be taken with or without food'],
    pregnancySafety: 'Highly recommended in pregnancy'
  },
  'l-methylfolate': {
    drugClass: 'Active form of Vitamin B9 (5-MTHF)',
    uses: ['Folate deficiency in patients with MTHFR gene mutation', 'Neural tube defect prevention (superior to standard folic acid in MTHFR carriers)', 'Adjunct in depression management', 'Homocysteine reduction', 'Pregnancy supplement for better bioavailability'],
    sideEffects: ['Mild irritability or agitation at high doses', 'Sleep disturbances (rare)', 'Nausea (uncommon)'],
    warnings: ['Preferred form for patients who cannot convert standard folic acid (MTHFR mutation)', 'Does not mask B12 deficiency as readily as standard folic acid'],
    foodInteractions: ['Can be taken with or without food'],
    pregnancySafety: 'Highly safe and recommended — especially beneficial for MTHFR-positive patients'
  },
  methyltetrahydrofolate: {
    drugClass: 'Active form of Vitamin B9',
    uses: ['Bioactive folate supplementation', 'Neural tube defect prevention', 'MTHFR gene mutation-related folate deficiency'],
    sideEffects: ['Well tolerated at recommended doses'],
    warnings: ['Superior bioavailability compared to standard folic acid for many patients'],
    foodInteractions: ['Can be taken with or without food'],
    pregnancySafety: 'Safe and recommended in pregnancy'
  },

  // ── Vitamin B12 / Cyanocobalamin / Methylcobalamin ──
  cyanocobalamin: {
    drugClass: 'Vitamin B12 (Synthetic form)',
    uses: ['Vitamin B12 deficiency', 'Pernicious anemia', 'Neurological damage from B12 deficiency', 'Megaloblastic anemia', 'Neuropathy prevention'],
    sideEffects: ['Diarrhea (high dose oral)', 'Hypokalemia with initiation of therapy', 'Mild allergic reactions (injection form)', 'Acne-like skin eruptions (rare)'],
    warnings: ['Leber\'s optic neuropathy: avoid cyanocobalamin — use hydroxocobalamin instead', 'Injections needed in pernicious anemia (poor oral absorption)', 'Patients on metformin have higher B12 deficiency risk — monitor annually'],
    foodInteractions: ['Can be taken with or without food'],
    pregnancySafety: 'Safe and essential during pregnancy'
  },
  methylcobalamin: {
    drugClass: 'Active form of Vitamin B12',
    uses: ['Peripheral neuropathy', 'Diabetic neuropathy', 'Vitamin B12 deficiency (superior neurological bioavailability)', 'Nerve regeneration support'],
    sideEffects: ['Well tolerated', 'Rare: nausea, diarrhea'],
    warnings: ['Preferred form for neuropathy — better neurological uptake than cyanocobalamin'],
    foodInteractions: ['Can be taken with or without food'],
    pregnancySafety: 'Safe and beneficial in pregnancy'
  },
  mecobalamin: {
    drugClass: 'Active form of Vitamin B12',
    uses: ['Peripheral neuropathy', 'Diabetic neuropathy', 'Megaloblastic anemia'],
    sideEffects: ['Well tolerated', 'Rare: nausea'],
    warnings: ['Preferred over cyanocobalamin for neuropathic conditions'],
    foodInteractions: ['Can be taken with or without food'],
    pregnancySafety: 'Safe during pregnancy'
  },

  // ── Vitamin B6 / Pyridoxine / Pyridoxal-5-Phosphate ──
  pyridoxine: {
    drugClass: 'Vitamin B6',
    uses: ['Vitamin B6 deficiency', 'Morning sickness in pregnancy (anti-emetic)', 'Premenstrual syndrome (PMS)', 'Adjunct in isoniazid therapy (prevents peripheral neuropathy)', 'Homocysteine lowering'],
    sideEffects: ['Sensory neuropathy at high doses (>200mg/day long-term)', 'Nausea, headache (high dose)', 'Sensitivity to sunlight'],
    warnings: ['Peripheral neuropathy with doses >200mg/day — do not exceed recommended therapeutic doses', 'High-dose supplements without medical supervision are risky'],
    foodInteractions: ['Best taken with food'],
    pregnancySafety: 'Safe at recommended doses; used for morning sickness'
  },
  'pyridoxal-5-phosphate': {
    drugClass: 'Active form of Vitamin B6',
    uses: ['B6 deficiency', 'Nerve health support', 'Homocysteine metabolism', 'Morning sickness (as Pyridoxine)'],
    sideEffects: ['Well tolerated at recommended doses'],
    warnings: ['Active form — more readily usable than standard pyridoxine'],
    foodInteractions: ['Can be taken with or without food'],
    pregnancySafety: 'Safe at recommended doses'
  },

  // ── Iron (Ferrous Sulphate / Iron Polymaltose) ──
  iron: {
    drugClass: 'Mineral Supplement — Haematinic',
    uses: ['Iron deficiency anemia', 'Pregnancy-related anemia prevention and treatment', 'Restless legs syndrome (iron-related)'],
    sideEffects: ['Constipation (very common)', 'Dark or black stools (normal)', 'Nausea, stomach cramps', 'Diarrhea (less common)'],
    warnings: ['Keep away from children — iron overdose is a leading cause of death in young children', 'Take 2 hours apart from calcium, antacids, levothyroxine, and fluoroquinolone antibiotics', 'Stains teeth (liquid form) — use a straw'],
    foodInteractions: ['Vitamin C (citrus juice) enhances iron absorption', 'Avoid tea, coffee, dairy, calcium-rich foods within 2 hours of dose'],
    pregnancySafety: 'Essential and required in pregnancy under medical guidance'
  },
  'ferrous sulphate': {
    drugClass: 'Iron Supplement',
    uses: ['Iron deficiency anemia', 'Pregnancy anemia prevention'],
    sideEffects: ['Constipation, dark stools, nausea'],
    warnings: ['Dangerous in overdose — keep away from children', 'Separate from other minerals and medications by 2 hours'],
    foodInteractions: ['Take with Vitamin C for better absorption; avoid tea/coffee'],
    pregnancySafety: 'Required in pregnancy — prescribed by doctor'
  },

  // ── Ondansetron ──
  ondansetron: {
    drugClass: '5-HT3 Receptor Antagonist (Antiemetic)',
    uses: ['Prevention and treatment of nausea and vomiting caused by chemotherapy', 'Post-operative nausea and vomiting (PONV)', 'Radiation therapy-induced nausea', 'Severe morning sickness in pregnancy (hyperemesis gravidarum)'],
    sideEffects: ['Headache (most common)', 'Constipation', 'QT interval prolongation (cardiac rhythm concern)', 'Dizziness', 'Flushing'],
    warnings: ['Avoid in patients with QT prolongation or risk factors for cardiac arrhythmia', 'Serotonin syndrome possible in combination with other serotonergic drugs', 'Caution in liver impairment — reduce dose'],
    foodInteractions: ['Can be taken with or without food'],
    pregnancySafety: 'Category B — used under medical supervision for hyperemesis gravidarum; limited data for 1st trimester safety'
  },

  // ── Salbutamol / Albuterol ──
  salbutamol: {
    drugClass: 'Short-Acting Beta-2 Agonist (SABA) — Bronchodilator',
    uses: ['Acute asthma attack (rescue inhaler)', 'Bronchospasm in COPD', 'Exercise-induced bronchoconstriction', 'Hyperkalemia (IV form in emergencies)'],
    sideEffects: ['Tremor (hand shakiness)', 'Palpitations and rapid heartbeat', 'Headache', 'Hypokalemia at high doses', 'Restlessness'],
    warnings: ['Not for maintenance therapy — for rescue use only', 'Overuse can worsen asthma control and indicate poorly controlled disease — seek medical review', 'Use spacer with inhaler for better drug delivery (especially in children)'],
    foodInteractions: ['No significant food interactions for inhaled form'],
    pregnancySafety: 'Category C — inhaled form generally considered acceptable; seek doctor advice'
  },

  // ── Fenofibrate ──
  fenofibrate: {
    drugClass: 'Fibrate — Triglyceride-Lowering Agent',
    uses: ['Hypertriglyceridemia (high triglycerides)', 'Mixed dyslipidemia (high triglycerides + low HDL)', 'Adjunct to statins for comprehensive lipid management'],
    sideEffects: ['Muscle pain (myopathy) — risk increases with statins', 'GI upset, nausea', 'Liver enzyme elevation', 'Rash', 'Gallstones with prolonged use'],
    warnings: ['Avoid with severe kidney disease', 'Risk of myopathy increases when combined with statins — monitor muscle pain', 'Monitor liver function tests periodically'],
    foodInteractions: ['Take with food for optimal absorption'],
    pregnancySafety: 'CONTRAINDICATED in pregnancy'
  },

  // ── Domperidone ──
  domperidone: {
    drugClass: 'Dopamine Antagonist (Prokinetic / Antiemetic)',
    uses: ['Nausea and vomiting', 'Gastric motility disorders (gastroparesis)', 'Bloating and early satiety', 'Drug-induced nausea (e.g., from dopaminergic medications)'],
    sideEffects: ['Dry mouth', 'QT interval prolongation (cardiac risk — cardiac arrhythmias)', 'Galactorrhea (milk production in non-breastfeeding patients)', 'Amenorrhea', 'Hyperprolactinemia'],
    warnings: ['Not approved by FDA in the US due to cardiac risks — used in India and many countries', 'Avoid high doses (>30mg/day) and in elderly patients', 'Avoid in patients with cardiac conditions', 'Not for long-term use without medical supervision'],
    foodInteractions: ['Take 15–30 minutes before meals'],
    pregnancySafety: 'Avoid in pregnancy — limited safety data'
  },

  // ── Metoclopramide ──
  metoclopramide: {
    drugClass: 'Prokinetic / Antiemetic (Central Dopamine Antagonist)',
    uses: ['Nausea and vomiting from various causes', 'Diabetic gastroparesis', 'GERD adjunct', 'Migraine with nausea'],
    sideEffects: ['Drowsiness, fatigue', 'Tardive dyskinesia (involuntary movements — long-term use)', 'Extrapyramidal symptoms', 'Restlessness (akathisia)', 'Hyperprolactinemia'],
    warnings: ['Do not use for more than 5 days for acute GI conditions', 'Risk of tardive dyskinesia with long-term use — irreversible in some cases', 'Avoid in Parkinson\'s disease', 'Avoid in patients with GI obstruction or perforation'],
    foodInteractions: ['Take 30 minutes before meals'],
    pregnancySafety: 'Category B — use with caution'
  },

  // ── Hydroxychloroquine ──
  hydroxychloroquine: {
    drugClass: 'Antimalarial / Disease-Modifying Anti-Rheumatic Drug (DMARD)',
    uses: ['Rheumatoid arthritis', 'Systemic lupus erythematosus (SLE)', 'Malaria treatment and prophylaxis', 'Porphyria cutanea tarda'],
    sideEffects: ['GI upset (nausea, diarrhea)', 'Retinopathy (eye damage) with long-term use — annual eye exams needed', 'Skin discoloration', 'QT prolongation', 'Cardiomyopathy (rare, long-term)'],
    warnings: ['Annual ophthalmology exams mandatory with long-term use', 'Avoid in G6PD deficiency', 'Monitor QT interval and cardiac function', 'Check baseline CBC before initiation'],
    foodInteractions: ['Take with food or milk to reduce GI side effects'],
    pregnancySafety: 'Category C — generally used in SLE in pregnancy under specialist supervision'
  }
};

// ─── Drug class → generic info mapping (fallback when no exact salt match) ──
const DRUG_CLASS_HINTS = [
  { patterns: ['antibiotic', 'amoxicillin', 'azithromycin', 'ciprofloxacin', 'doxycycline', 'cefixime', 'amoxyclav', 'clavulanate'], hint: 'Antibiotic — complete the full prescribed course to prevent antibiotic resistance.' },
  { patterns: ['statin', 'rosuvastatin', 'atorvastatin', 'cholesterol'], hint: 'Cholesterol-lowering medication — usually taken long-term; avoid grapefruit juice.' },
  { patterns: ['ppi', 'pantoprazole', 'omeprazole', 'rabeprazole', 'esomeprazole'], hint: 'Proton Pump Inhibitor — take before meals. Avoid long-term use without medical supervision.' },
  { patterns: ['metformin', 'glimepiride', 'diabetes', 'diabetic', 'insulin'], hint: 'Antidiabetic medication — monitor blood glucose levels regularly.' },
  { patterns: ['folate', 'folic', 'methylfolate', 'quatrefolic', 'folinext'], hint: 'Folate/B-vitamin supplement — essential during pregnancy for fetal neural development.' },
  { patterns: ['vitamin d', 'cholecalciferol', 'd3'], hint: 'Vitamin D supplement — take with a fatty meal for best absorption.' },
  { patterns: ['calcium', 'shelcal', 'cipcal'], hint: 'Calcium supplement — split doses for better absorption; take separately from iron and levothyroxine.' },
  { patterns: ['b12', 'cobalamin', 'methylcobalamin', 'cyanocobalamin', 'mecobalamin'], hint: 'Vitamin B12 supplement — important for nerve health and red blood cell production.' },
  { patterns: ['antihistamine', 'levocetirizine', 'cetirizine', 'fexofenadine'], hint: 'Antihistamine — may cause drowsiness; avoid driving if affected.' },
  { patterns: ['thyroid', 'levothyroxine', 'thyroxine'], hint: 'Thyroid hormone — take on empty stomach, 30-60 minutes before breakfast. Regular TSH monitoring required.' },
  { patterns: ['nsaid', 'ibuprofen', 'aceclofenac', 'diclofenac', 'naproxen'], hint: 'NSAID Pain-reliever — take with food to protect your stomach.' },
  { patterns: ['antihypertensive', 'telmisartan', 'amlodipine', 'losartan', 'olmesartan', 'ramipril'], hint: 'Blood pressure medication — do not stop abruptly; monitor BP regularly.' },
  { patterns: ['iron', 'ferrous', 'haematinic', 'anemia'], hint: 'Iron supplement — take with Vitamin C for better absorption; avoid with tea/coffee.' },
];

// ─── Parse composition text to extract salt names ────────────────────────────
function parseSaltsFromComposition(compositionText = '') {
  if (!compositionText) return [];
  return compositionText
    .split(/[+,/\n]/)
    .map(s => s.replace(/\d+(\.\d+)?\s*(mg|mcg|iu|g|ml|%|units?)/gi, '').trim().toLowerCase())
    .filter(s => s.length > 2);
}

// ─── Merge info from multiple matched salts ──────────────────────────────────
function mergeInfoForSalts(salts) {
  const merged = {
    matchedSalts: [],
    drugClass: null,
    uses: [],
    sideEffects: [],
    warnings: [],
    foodInteractions: [],
    pregnancySafety: null
  };

  for (const salt of salts) {
    // Direct match
    let info = SALT_INFO_DB[salt];

    // Partial/substring match fallback
    if (!info) {
      for (const [key, val] of Object.entries(SALT_INFO_DB)) {
        if (salt.includes(key) || key.includes(salt)) {
          info = val;
          break;
        }
      }
    }

    if (info) {
      merged.matchedSalts.push(salt);
      if (!merged.drugClass) merged.drugClass = info.drugClass;
      for (const u of (info.uses || [])) {
        if (!merged.uses.includes(u)) merged.uses.push(u);
      }
      for (const s of (info.sideEffects || [])) {
        if (!merged.sideEffects.includes(s)) merged.sideEffects.push(s);
      }
      for (const w of (info.warnings || [])) {
        if (!merged.warnings.includes(w)) merged.warnings.push(w);
      }
      for (const f of (info.foodInteractions || [])) {
        if (!merged.foodInteractions.includes(f)) merged.foodInteractions.push(f);
      }
      if (!merged.pregnancySafety && info.pregnancySafety) {
        merged.pregnancySafety = info.pregnancySafety;
      }
    }
  }

  return merged;
}

// ─── Main export: build medicine info from search result data ────────────────
/**
 * Builds a structured medicine information panel from platform search results.
 * @param {string} query - The search query
 * @param {Object} platforms - The platforms data from aggregator response
 * @param {number} totalResultCount - Total number of platforms that returned results
 * @returns {Object|null} medicineInfo object or null if insufficient data
 */
export function buildMedicineInfo(query, platforms, totalResultCount) {
  if (!totalResultCount || totalResultCount === 0) return null;

  // Gather all data from available top items
  const topItems = Object.values(platforms)
    .map(p => p.topItem)
    .filter(Boolean);

  if (topItems.length === 0) return null;

  // Pick the most information-rich item
  const bestItem = topItems.reduce((best, item) => {
    const score = (item.saltComposition ? 5 : 0) + (item.name ? 2 : 0) + (item.brand ? 1 : 0);
    const bestScore = (best.saltComposition ? 5 : 0) + (best.name ? 2 : 0) + (best.brand ? 1 : 0);
    return score > bestScore ? item : best;
  }, topItems[0]);

  // Get best salt composition text from any available item
  const compositionText = topItems
    .map(i => i.saltComposition || i.brand || '')
    .find(s => s && s.length > 2) || '';

  const saltsFromComposition = parseSaltsFromComposition(compositionText);
  const queryTokens = query.toLowerCase().split(/\s+/);

  // Also try to match from query itself
  const allTokens = [...new Set([...saltsFromComposition, ...queryTokens])];

  const merged = mergeInfoForSalts(allTokens);

  // Drug class hint from composition text if no salt matched
  let drugClassHint = null;
  if (!merged.drugClass || merged.uses.length === 0) {
    const combinedText = `${query} ${compositionText}`.toLowerCase();
    for (const { patterns, hint } of DRUG_CLASS_HINTS) {
      if (patterns.some(p => combinedText.includes(p))) {
        drugClassHint = hint;
        break;
      }
    }
  }

  // Build final medicine name from best item
  const medicineName = bestItem.name || query;
  const manufacturer = topItems
    .map(i => i.manufacturer)
    .find(m => m && m.length > 2 && !['Apollo Pharmacy', 'PharmEasy', 'Netmeds', 'Truemeds', 'PlatinumRx', 'Tata 1mg', 'Zepto', 'Amazon', 'Netmeds Certified Pharmacy', 'PharmEasy Partner', 'Tata 1mg'].includes(m)) || null;

  const platformsFound = Object.entries(platforms)
    .filter(([, p]) => p.available && p.topItem)
    .map(([, p]) => p.platformName);

  // Confidence: how many salts we recognized
  const confidence = merged.matchedSalts.length > 0 ? 'high' : (drugClassHint ? 'medium' : 'low');

  return {
    medicineName,
    compositionText: compositionText || null,
    manufacturer: manufacturer || null,
    drugClass: merged.drugClass || null,
    uses: merged.uses.slice(0, 6),
    sideEffects: merged.sideEffects.slice(0, 6),
    warnings: merged.warnings.slice(0, 5),
    foodInteractions: merged.foodInteractions.slice(0, 3),
    pregnancySafety: merged.pregnancySafety || null,
    drugClassHint: drugClassHint || null,
    platformsFound,
    confidence,
    disclaimer: 'This information is for educational purposes only and does not constitute medical advice. Always consult a qualified healthcare professional before starting, stopping, or modifying any medication.'
  };
}
