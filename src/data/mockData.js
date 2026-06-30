export const MONTHS = [
  '2025-01','2025-02','2025-03','2025-04','2025-05','2025-06',
  '2025-07','2025-08','2025-09','2025-10','2025-11','2025-12',
  '2026-01','2026-02','2026-03','2026-04','2026-05',
];

// ── 시드 기반 결정론적 난수 생성기 ──────────────────────────────────────
function mkRng(seed) {
  let s = seed >>> 0;
  return (min, max) => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return min + (s % (max - min + 1));
  };
}

// ── Reagent 100개 이름 ─────────────────────────────────────────────────
const REAGENT_NAMES = [
  // PCR/qPCR (15)
  'Hot Start Taq PCR Mix','KAPA HiFi PCR Kit','Q5 High-Fidelity Mix','Phusion Hot Start Mix',
  'Multiplex PCR Master Mix','Long Range PCR Kit 20kb','Colony PCR Quick Mix',
  'One-Step RT-PCR Kit','qPCR SYBR Green I Master','SYBR Green RT-qPCR Mix',
  'TaqMan Universal PCR Mix','Multiplex qPCR Probe Mix','Digital PCR Master Mix',
  'PCR Grade Water 1L','ddPCR Supermix',
  // 추출/정제 (15)
  'Total RNA Isolation Kit','mRNA Purification Kit','miRNA Extraction Kit',
  'Plasmid Mini Kit','Plasmid Maxi Kit','Gel Extraction Kit',
  'PCR Purification Kit','Genomic DNA Kit','Cell-Free DNA Kit',
  'ChIP DNA Purification Kit','FFPE RNA Extraction Kit','Serum RNA Kit',
  'Viral RNA Isolation Kit','Soil DNA Extraction Kit','Environmental DNA Kit',
  // 단백질/항체 (15)
  'Protein Extraction Lysis Buffer','Co-IP Extraction Kit','Nuclear Extraction Kit',
  'Cytoplasmic Extraction Kit','BCA Protein Assay Kit','Bradford Protein Assay',
  'Lowry Protein Assay Kit','Anti-Beta-Actin Antibody','Anti-GAPDH Antibody',
  'Anti-HRP Secondary Antibody','Anti-Flag Antibody','Anti-His-Tag Antibody',
  'Anti-GFP Antibody','Streptavidin-HRP Conjugate','Protein A/G Magnetic Beads',
  // 세포생물학 (15)
  'Cell Viability MTT Assay','Annexin V Apoptosis Kit','Caspase-3 Activity Kit',
  'Cell Cycle Analysis Kit','BrdU Cell Proliferation Kit','Scratch Wound Assay Kit',
  'Cell Invasion Assay Kit','Reactive Oxygen Species Kit','Mitochondria Staining Kit',
  'Lysosome Staining Kit','Autophagy Detection Kit','Calcium Flux Assay Kit',
  'ATP Bioluminescence Kit','Beta-Galactosidase Assay','Luciferase Assay System',
  // ELISA/면역 (15)
  'IL-6 ELISA Kit','TNF-alpha ELISA Kit','IFN-gamma ELISA Kit','IL-1beta ELISA Kit',
  'IL-10 ELISA Kit','CRP High-Sensitivity ELISA','Human Insulin ELISA Kit',
  'Cortisol ELISA Kit','Testosterone ELISA Kit','Estradiol ELISA Kit',
  'HbA1c Detection Kit','Ferritin ELISA Kit','VEGF ELISA Kit',
  'EGF ELISA Kit','Troponin I ELISA Kit',
  // NGS (10)
  'NGS Library Prep Kit','DNA Fragmentation Kit','End Repair Mix',
  'A-Tailing Enzyme Mix','Adapter Ligation Kit','Size Selection AMPure Beads',
  'Index PCR Enrichment Mix','Whole Genome Amplification Kit',
  'Bisulfite Conversion Kit','ATAC-seq Tagmentation Kit',
  // 시퀀싱/클로닝 (5)
  'BigDye Terminator v3.1','T4 DNA Ligase 2000U','T4 Polynucleotide Kinase',
  'T7 RNA Polymerase Kit','In Vitro Transcription Kit',
  // 효소/버퍼 (10)
  'EcoRI Restriction Enzyme','HindIII Restriction Enzyme','BamHI Restriction Enzyme',
  'NcoI Restriction Enzyme','NotI Restriction Enzyme','SalI Restriction Enzyme',
  'XhoI Restriction Enzyme','10x PCR Buffer','NEBuffer 2.1 10ml','CutSmart Buffer 10ml',
];

// ── Consumable 100개 이름 ──────────────────────────────────────────────
const CONSUMABLE_NAMES = [
  // 튜브류 (20)
  'Microcentrifuge Tube 0.5ml','Microcentrifuge Tube 2.0ml','PCR Tube 0.2ml Strip',
  'PCR 8-Strip Cap Set','Snap Cap Tube 1.5ml','Safe-Lock Tube 2.0ml',
  'Cryogenic Vial 1.8ml','Cryogenic Vial 5.0ml','CryoTube 1.0ml',
  'Conical Tube 15ml PP','Conical Tube 50ml PP','Oak Ridge Tube 30ml',
  'Polypropylene Tube 5ml','Round Bottom Tube 5ml','Amber Tube 1.5ml',
  'Low Bind Tube 1.5ml','Low Bind Tube 0.2ml','Screw Cap Tube 2.0ml',
  'Graduated Tube 10ml','Flat Cap Strip 8-tube',
  // 플레이트류 (15)
  '96-well PCR Plate Skirted','96-well PCR Plate Semi-Skirted','96-well Deep Well 2ml',
  '96-well Clear Flat Bottom','384-well PCR Plate','384-well White Plate',
  '384-well Black Plate','24-well Cell Culture Plate','12-well Cell Culture Plate',
  '6-well Cell Culture Plate','96-well Cell Culture Plate','48-well Cell Culture Plate',
  'Microplate Lid','PCR Plate Sealing Film','Aluminum Sealing Foil',
  // 팁류 (15)
  'Filter Tips 10ul Low Retention','Filter Tips 100ul','Filter Tips 200ul Wide Bore',
  'Filter Tips 1000ul','Non-Filter Tips 10ul','Non-Filter Tips 200ul',
  'Non-Filter Tips 1000ul','Gel Loading Tips 10ul','Extended Length Tips 200ul',
  'Automation Tips 50ul','Automation Tips 300ul','Robotic Tips 1000ul',
  'Multichannel Tips 200ul','BioClean Tips 10ul','RNase-Free Tips 200ul',
  // 필터/멤브레인 (10)
  'Syringe Filter 0.22um PES','Syringe Filter 0.45um PVDF','Syringe Filter 0.22um PTFE',
  'Centrifugal Filter 30kDa','Centrifugal Filter 10kDa','Centrifugal Filter 50kDa',
  'Membrane Filter PVDF 0.45um','Bottle Top Filter 0.22um',
  'Spin Column with Membrane','Vacuum Filter Unit 0.22um',
  // PPE (20)
  'Nitrile Gloves S','Nitrile Gloves L','Nitrile Gloves XL',
  'Vinyl Gloves S','Vinyl Gloves M','Vinyl Gloves L',
  'Latex Gloves M','Latex Gloves L','N95 Face Mask','Surgical Mask 3-ply',
  'Lab Coat S/M','Lab Coat L/XL','Safety Goggles Clear','Safety Goggles Tinted',
  'Shoe Cover PP','Hair Cap PP','Apron PE','Ear Plugs Foam',
  'Face Shield Full','Vinyl Sleeve Guard',
  // 기타 소모품 (20)
  'Petri Dish 90mm','Petri Dish 150mm','Culture Flask T-25','Culture Flask T-75',
  'Culture Flask T-175','Serological Pipette 5ml','Serological Pipette 10ml',
  'Serological Pipette 25ml','Serological Pipette 50ml','Pasteur Pipette 3ml',
  'Glass Slides 75x25mm','Coverslips 22x22mm','Parafilm M Roll',
  'Lab Tape Yellow','Cryogenic Label Sheet','Specimen Bag Zip',
  'Biohazard Bag 19L','Autoclave Bag 26L','Sharps Container 1L',
  'Secondary Transport Container',
];

const RG_VENDORS = ['BioTech Co.','GeneSys Inc.','MediDiag Ltd.','NovaBio Inc.',
  'LifeSci Corp.','ProTech Ltd.','DiagMaster Co.','BioPlus Inc.','MolBio Co.','SafeCollect',
  'Henry Schein','Henry Schein','Henry Schein']; // B2B 비중 높임
const CS_VENDORS = ['LabSupply','TipMaster','SafeGuard','PlastiLab Inc.',
  'MedSupply Co.','LabPro Ltd.','CleanRoom Inc.','BioPlastic Co.','LabGear Inc.','SafeLab Corp.'];

// ── SKU MASTER 생성 ────────────────────────────────────────────────────
const rBase = mkRng(42);

// 기존 12개 유지 + 신규 100 Reagent + 100 Consumable
const BASE_SKUS = [
  { sku: 'RG-001', name: 'PCR Master Mix',              category: 'Reagent',    channel: 'B2B', vendor: 'BioTech Co.' },
  { sku: 'RG-002', name: 'RNA Extraction Kit',           category: 'Reagent',    channel: 'B2B', vendor: 'GeneSys Inc.' },
  { sku: 'RG-003', name: 'qPCR Probe Set',               category: 'Reagent',    channel: 'B2B', vendor: 'BioTech Co.' },
  { sku: 'RG-004', name: 'ELISA Assay Kit',              category: 'Reagent',    channel: 'B2C', vendor: 'MediDiag Ltd.' },
  { sku: 'RG-005', name: 'Viral Transport Medium',       category: 'Reagent',    channel: 'B2B', vendor: 'SafeCollect' },
  { sku: 'RG-006', name: 'DNA Extraction Reagent',       category: 'Reagent',    channel: 'B2B', vendor: 'GeneSys Inc.' },
  { sku: 'CS-001', name: 'Microcentrifuge Tubes 1.5ml',  category: 'Consumables', channel: 'B2B', vendor: 'LabSupply' },
  { sku: 'CS-002', name: 'PCR Plates 96-well',           category: 'Consumables', channel: 'B2B', vendor: 'LabSupply' },
  { sku: 'CS-003', name: 'Pipette Tips 200ul',           category: 'Consumables', channel: 'B2C', vendor: 'TipMaster' },
  { sku: 'CS-004', name: 'Gloves Nitrile M',             category: 'Consumables', channel: 'B2C', vendor: 'SafeGuard' },
  { sku: 'CS-005', name: 'Sample Collection Swabs',      category: 'Consumables', channel: 'B2B', vendor: 'SafeCollect' },
  { sku: 'CS-006', name: 'Centrifuge Tubes 50ml',        category: 'Consumables', channel: 'B2B', vendor: 'LabSupply' },
];

const NEW_REAGENTS = REAGENT_NAMES.map((name, i) => {
  const n = i + 7; // RG-007 ~ RG-106
  const r = mkRng(n * 31);
  return {
    sku: `RG-${String(n).padStart(3,'0')}`,
    name,
    category: 'Reagent',
    channel: r(0,9) < 8 ? 'B2B' : 'B2C',   // 80% B2B
    vendor: RG_VENDORS[r(0, RG_VENDORS.length - 1)],
  };
});

const NEW_CONSUMABLES = CONSUMABLE_NAMES.map((name, i) => {
  const n = i + 7; // CS-007 ~ CS-106
  const r = mkRng(n * 17);
  return {
    sku: `CS-${String(n).padStart(3,'0')}`,
    name,
    category: 'Consumables',
    channel: r(0,9) < 6 ? 'B2B' : 'B2C',   // 60% B2B
    vendor: CS_VENDORS[r(0, CS_VENDORS.length - 1)],
  };
});

// ── Henry Schein B2B 미국 임상진단 시약 ───────────────────────────────
// USD 기반 고단가 키트 (1 USD ≈ 1,350 KRW 기준)
export const HENRY_SCHEIN_SKUS = [
  // Chemistry / 생화학
  { sku: 'HS-001', name: 'Glucose Reagent Kit — Roche cobas® (500T)',         category: 'Reagent', channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-002', name: 'Comprehensive Metabolic Panel Reagent Set (250T)',   category: 'Reagent', channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-003', name: 'Lipid Panel Reagent Set — TC/HDL/LDL/TG (200T)',    category: 'Reagent', channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-004', name: 'Creatinine & BUN Dual Reagent Kit (300T)',           category: 'Reagent', channel: 'B2B', vendor: 'Henry Schein' },
  // Immunoassay / 면역
  { sku: 'HS-005', name: 'TSH (Thyroid-Stimulating Hormone) CLIA Kit (100T)', category: 'Reagent', channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-006', name: 'Free T4 / Free T3 Immunoassay Kit (100T)',          category: 'Reagent', channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-007', name: 'PSA Total & Free Immunoassay Kit (100T)',           category: 'Reagent', channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-008', name: 'Beta-HCG Quantitative Immunoassay Kit (100T)',      category: 'Reagent', channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-009', name: 'Vitamin D (25-OH) Total Assay Kit — Abbott (100T)', category: 'Reagent', channel: 'B2B', vendor: 'Henry Schein' },
  // Cardiac Markers / 심장 마커
  { sku: 'HS-010', name: 'Troponin I High-Sensitivity Assay Kit (100T)',      category: 'Reagent', channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-011', name: 'NT-proBNP Immunoassay Kit — Roche (96T)',           category: 'Reagent', channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-012', name: 'D-Dimer Quantitative Assay Kit (96T)',              category: 'Reagent', channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-013', name: 'CRP High-Sensitivity Immunoassay Kit (100T)',       category: 'Reagent', channel: 'B2B', vendor: 'Henry Schein' },
  // Coagulation / 응고
  { sku: 'HS-014', name: 'Prothrombin Time (PT/INR) Reagent — Siemens (100T)',category: 'Reagent', channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-015', name: 'Activated Partial Thromboplastin Time (aPTT) (100T)',category:'Reagent', channel: 'B2B', vendor: 'Henry Schein' },
  // Diabetes / 당뇨
  { sku: 'HS-016', name: 'HbA1c NGSP-Certified Assay Kit — Bio-Rad (50T)',    category: 'Reagent', channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-017', name: 'Fasting Insulin & C-Peptide Immunoassay Kit (100T)',category: 'Reagent', channel: 'B2B', vendor: 'Henry Schein' },
  // Rapid / POC 검사
  { sku: 'HS-018', name: 'Influenza A+B Rapid Antigen Test — CLIA Waived (25T)',category:'Reagent',channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-019', name: 'SARS-CoV-2 + Flu A/B Combo Rapid Test (25T)',       category: 'Reagent', channel: 'B2B', vendor: 'Henry Schein' },
  // Hematology / 혈액
  { sku: 'HS-020', name: 'CBC 5-Part Differential Reagent Pack — Sysmex (1L)',category: 'Reagent', channel: 'B2B', vendor: 'Henry Schein' },
];

// ── Henry Schein Calibrator (HS-021~025) ─────────────────────────
// 기존 HENRY_SCHEIN_SKUS에 추가 (push 방식으로 처리됨)
export const HENRY_SCHEIN_CAL_SKUS = [
  { sku: 'HS-021', name: 'Multi-Chemistry Calibrator Set — Roche cobas® (6 levels)',  category: 'Calibrator',           channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-022', name: 'Immunoassay Calibrator Set — Abbott ARCHITECT (4 levels)',   category: 'Calibrator',           channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-023', name: 'Coagulation Calibrator (PT/aPTT/Fibrinogen) — Siemens',     category: 'Calibrator',           channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-024', name: 'HbA1c Calibrator Set — Bio-Rad NGSP (3 levels)',            category: 'Calibrator',           channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-025', name: 'CBC 5-Part Diff. Calibrator — Sysmex (3 levels)',           category: 'Calibrator',           channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-026', name: 'Multi-Chemistry QC (Low/Normal/High) — Roche',              category: 'Control (QC Material)', channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-027', name: 'Cardiac Marker QC Pack — Troponin/BNP/D-Dimer Siemens',    category: 'Control (QC Material)', channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-028', name: 'Coagulation QC Pack (PT/aPTT/Fibrinogen) — Siemens',       category: 'Control (QC Material)', channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-029', name: 'HbA1c QC Material (3 levels) — Bio-Rad Lyphochek',         category: 'Control (QC Material)', channel: 'B2B', vendor: 'Henry Schein' },
  { sku: 'HS-030', name: 'CBC 5-Part Diff. QC (3 levels) — Sysmex',                  category: 'Control (QC Material)', channel: 'B2B', vendor: 'Henry Schein' },
];

// ── 씨젠(Seegene) B2C STI 시약 ────────────────────────────────────
// 성매개감염(STI) 전용 분자진단 라인 — B2C 채널 (병원/의원 직접 공급)
export const SEEGENE_SKUS = [
  // STI Essential / Master 패널
  { sku: 'SG-001', name: 'Allplex™ STI Essential Panel (96T)',             category: 'Reagent', channel: 'B2C', vendor: 'Seegene Inc.' },
  { sku: 'SG-002', name: 'Allplex™ STI Master Panel (96T)',                category: 'Reagent', channel: 'B2C', vendor: 'Seegene Inc.' },
  { sku: 'SG-003', name: 'Allplex™ STI Plus Panel (96T)',                  category: 'Reagent', channel: 'B2C', vendor: 'Seegene Inc.' },
  // CT/NG (Chlamydia / Gonorrhea)
  { sku: 'SG-004', name: 'Allplex™ CT/NG Assay (96T)',                     category: 'Reagent', channel: 'B2C', vendor: 'Seegene Inc.' },
  { sku: 'SG-005', name: 'Seeplex® STD6 ACE Detection — CT/NG (96T)',      category: 'Reagent', channel: 'B2C', vendor: 'Seegene Inc.' },
  // HPV
  { sku: 'SG-006', name: 'Allplex™ HPV HR Detection (96T)',                category: 'Reagent', channel: 'B2C', vendor: 'Seegene Inc.' },
  { sku: 'SG-007', name: 'Allplex™ HPV28 Detection (96T)',                 category: 'Reagent', channel: 'B2C', vendor: 'Seegene Inc.' },
  { sku: 'SG-008', name: 'Anyplex™ II HPV HR Detection (96T)',             category: 'Reagent', channel: 'B2C', vendor: 'Seegene Inc.' },
  { sku: 'SG-009', name: 'Anyplex™ II HPV28 Detection (96T)',              category: 'Reagent', channel: 'B2C', vendor: 'Seegene Inc.' },
  // Trichomonas / Mycoplasma / Ureaplasma
  { sku: 'SG-010', name: 'Allplex™ TV/MG/MH/UU Assay (96T)',              category: 'Reagent', channel: 'B2C', vendor: 'Seegene Inc.' },
  { sku: 'SG-011', name: 'Allplex™ Mycoplasma/Ureaplasma Panel (96T)',     category: 'Reagent', channel: 'B2C', vendor: 'Seegene Inc.' },
  { sku: 'SG-012', name: 'Seeplex® MG/TV ACE Detection (96T)',             category: 'Reagent', channel: 'B2C', vendor: 'Seegene Inc.' },
  // Herpes / HSV
  { sku: 'SG-013', name: 'Allplex™ HSV-1/2 & VZV Assay (96T)',            category: 'Reagent', channel: 'B2C', vendor: 'Seegene Inc.' },
  { sku: 'SG-014', name: 'Anyplex™ HSV-1/2 Detection (96T)',               category: 'Reagent', channel: 'B2C', vendor: 'Seegene Inc.' },
  // Syphilis / Treponema
  { sku: 'SG-015', name: 'Allplex™ Treponema pallidum Assay (96T)',        category: 'Reagent', channel: 'B2C', vendor: 'Seegene Inc.' },
  // HIV / Hepatitis (STI 연관)
  { sku: 'SG-016', name: 'Allplex™ HBV Assay (96T)',                       category: 'Reagent', channel: 'B2C', vendor: 'Seegene Inc.' },
  { sku: 'SG-017', name: 'Allplex™ HCV Assay (96T)',                       category: 'Reagent', channel: 'B2C', vendor: 'Seegene Inc.' },
  { sku: 'SG-018', name: 'Allplex™ HIV-1 Quant. Assay (96T)',              category: 'Reagent', channel: 'B2C', vendor: 'Seegene Inc.' },
  // 보조 시약 / Controls
  { sku: 'SG-019', name: 'Allplex™ STI Positive Control Set',              category: 'Control (QC Material)', channel: 'B2C', vendor: 'Seegene Inc.' },
  { sku: 'SG-020', name: 'Allplex™ STI Internal Control (IC) Set (96T)',   category: 'Control (QC Material)', channel: 'B2C', vendor: 'Seegene Inc.' },
];

export const SKU_MASTER = [...BASE_SKUS, ...HENRY_SCHEIN_SKUS, ...HENRY_SCHEIN_CAL_SKUS, ...SEEGENE_SKUS, ...NEW_REAGENTS, ...NEW_CONSUMABLES];

export const COST_CATEGORIES = [
  { code: 'MAT-001', name: 'Raw Material - Reagent',     type: 'Reagent' },
  { code: 'MAT-002', name: 'Raw Material - Consumable',  type: 'Consumable' },
  { code: 'MAT-003', name: 'Packaging Material',         type: 'Consumable' },
];

// ── Fishbowl / QB 매핑 (기존 12개 유지 + 대표 신규 10개) ───────────────
export const FISHBOWL_ITEMS = [
  { fbSku: 'FB-RG-001', fbName: 'PCR MasterMix 2x',            vendor: 'BioTech Co.',   category: 'Reagent' },
  { fbSku: 'FB-RG-002', fbName: 'RNA Ext. Kit (50T)',           vendor: 'GeneSys Inc.',  category: 'Reagent' },
  { fbSku: 'FB-RG-003', fbName: 'qPCR Probe Set',              vendor: 'BioTech Co.',   category: 'Reagent' },
  { fbSku: 'FB-RG-004', fbName: 'ELISA Assay Kit',             vendor: 'MediDiag Ltd.', category: 'Reagent' },
  { fbSku: 'FB-RG-005', fbName: 'VTM-500ml',                   vendor: 'SafeCollect',   category: 'Reagent' },
  { fbSku: 'FB-RG-006', fbName: 'DNA Extraction Reagent',      vendor: 'GeneSys Inc.',  category: 'Reagent' },
  { fbSku: 'FB-CS-001', fbName: 'Micro tubes 1.5ml',           vendor: 'LabSupply',     category: 'Consumable' },
  { fbSku: 'FB-CS-002', fbName: 'PCR Plate 96well',            vendor: 'LabSupply',     category: 'Consumable' },
  { fbSku: 'FB-CS-003', fbName: 'Pipette Tips 200uL',          vendor: 'TipMaster',     category: 'Consumable' },
  { fbSku: 'FB-CS-004', fbName: 'Nitrile Gloves (M)',          vendor: 'SafeGuard',     category: 'Consumable' },
  { fbSku: 'FB-CS-005', fbName: 'Sample Swabs',                vendor: 'SafeCollect',   category: 'Consumable' },
  { fbSku: 'FB-CS-006', fbName: 'Centrifuge Tube 50ml',        vendor: 'LabSupply',     category: 'Consumable' },
  { fbSku: 'FB-CS-007', fbName: 'Filter Tips 10ul',            vendor: 'TipMaster',     category: 'Consumable' },
  { fbSku: 'FB-RG-007', fbName: 'Lysis Buffer 100ml',          vendor: 'BioTech Co.',   category: 'Reagent' },
];

export const QB_ITEMS = [
  { qbCode: 'QB-RG-001', qbName: 'PCR Master Mix',              vendor: 'BioTech Co.' },
  { qbCode: 'QB-RG-002', qbName: 'RNA Extraction Kit',          vendor: 'GeneSys Inc.' },
  { qbCode: 'QB-RG-003', qbName: 'qPCR Probe Set',              vendor: 'BioTech Co.' },
  { qbCode: 'QB-RG-004', qbName: 'ELISA Kit v2',                vendor: 'MediDiag Ltd.' },
  { qbCode: 'QB-RG-005', qbName: 'Viral Transport Medium',      vendor: 'SafeCollect' },
  { qbCode: 'QB-RG-006', qbName: 'DNA Extraction Reagent',      vendor: 'GeneSys Inc.' },
  { qbCode: 'QB-CS-001', qbName: 'Microcentrifuge Tubes 1.5ml', vendor: 'LabSupply' },
  { qbCode: 'QB-CS-002', qbName: 'PCR Plates 96-well',          vendor: 'LabSupply' },
  { qbCode: 'QB-CS-003', qbName: 'Pipette Tips 200ul',          vendor: 'TipMaster' },
  { qbCode: 'QB-CS-004', qbName: 'Gloves Nitrile M',            vendor: 'SafeGuard' },
  { qbCode: 'QB-CS-005', qbName: 'Sample Collection Swabs',     vendor: 'SafeCollect' },
  { qbCode: 'QB-CS-006', qbName: 'Centrifuge Tubes 50ml',       vendor: 'LabSupply' },
  { qbCode: 'QB-CS-008', qbName: 'Disposable Gloves S',         vendor: 'SafeGuard' },
];

export const SKU_MAPPINGS = [
  { id:1,  fbSku:'FB-RG-001', fbName:'PCR MasterMix 2x',       qbCode:'QB-RG-001', qbName:'PCR Master Mix',              masterSku:'RG-001', status:'matched',   matchMethod:'auto_name', similarity:88,  confirmed:true  },
  { id:2,  fbSku:'FB-RG-002', fbName:'RNA Ext. Kit (50T)',      qbCode:'QB-RG-002', qbName:'RNA Extraction Kit',          masterSku:'RG-002', status:'matched',   matchMethod:'auto_name', similarity:76,  confirmed:true  },
  { id:3,  fbSku:'FB-RG-003', fbName:'qPCR Probe Set',         qbCode:'QB-RG-003', qbName:'qPCR Probe Set',              masterSku:'RG-003', status:'matched',   matchMethod:'exact_sku', similarity:100, confirmed:true  },
  { id:4,  fbSku:'FB-RG-004', fbName:'ELISA Assay Kit',        qbCode:'QB-RG-004', qbName:'ELISA Kit v2',                masterSku:'RG-004', status:'exception', matchMethod:'auto_name', similarity:61,  confirmed:false },
  { id:5,  fbSku:'FB-RG-005', fbName:'VTM-500ml',              qbCode:'QB-RG-005', qbName:'Viral Transport Medium',      masterSku:'RG-005', status:'exception', matchMethod:'auto_name', similarity:32,  confirmed:false },
  { id:6,  fbSku:'FB-RG-006', fbName:'DNA Extraction Reagent', qbCode:'QB-RG-006', qbName:'DNA Extraction Reagent',      masterSku:'RG-006', status:'matched',   matchMethod:'exact_sku', similarity:100, confirmed:true  },
  { id:7,  fbSku:'FB-CS-001', fbName:'Micro tubes 1.5ml',      qbCode:'QB-CS-001', qbName:'Microcentrifuge Tubes 1.5ml', masterSku:'CS-001', status:'matched',   matchMethod:'auto_name', similarity:72,  confirmed:true  },
  { id:8,  fbSku:'FB-CS-002', fbName:'PCR Plate 96well',       qbCode:'QB-CS-002', qbName:'PCR Plates 96-well',          masterSku:'CS-002', status:'matched',   matchMethod:'auto_name', similarity:85,  confirmed:true  },
  { id:9,  fbSku:'FB-CS-003', fbName:'Pipette Tips 200uL',     qbCode:'QB-CS-003', qbName:'Pipette Tips 200ul',          masterSku:'CS-003', status:'matched',   matchMethod:'exact_sku', similarity:98,  confirmed:true  },
  { id:10, fbSku:'FB-CS-004', fbName:'Nitrile Gloves (M)',     qbCode:'QB-CS-004', qbName:'Gloves Nitrile M',            masterSku:'CS-004', status:'matched',   matchMethod:'auto_name', similarity:68,  confirmed:true  },
  { id:11, fbSku:'FB-CS-005', fbName:'Sample Swabs',           qbCode:'QB-CS-005', qbName:'Sample Collection Swabs',    masterSku:'CS-005', status:'matched',   matchMethod:'auto_name', similarity:74,  confirmed:true  },
  { id:12, fbSku:'FB-CS-006', fbName:'Centrifuge Tube 50ml',   qbCode:'QB-CS-006', qbName:'Centrifuge Tubes 50ml',      masterSku:'CS-006', status:'matched',   matchMethod:'auto_name', similarity:91,  confirmed:true  },
  { id:13, fbSku:'FB-CS-007', fbName:'Filter Tips 10ul',       qbCode:null,        qbName:null,                         masterSku:null,     status:'fb_only',   matchMethod:'none',      similarity:0,   confirmed:false },
  { id:14, fbSku:'FB-RG-007', fbName:'Lysis Buffer 100ml',     qbCode:null,        qbName:null,                         masterSku:null,     status:'fb_only',   matchMethod:'none',      similarity:0,   confirmed:false },
  { id:15, fbSku:null,        fbName:null,                      qbCode:'QB-CS-008', qbName:'Disposable Gloves S',        masterSku:null,     status:'qb_only',   matchMethod:'none',      similarity:0,   confirmed:false },
];

// ── 월별 재고수불부 생성 ───────────────────────────────────────────────
function generateMonthlyInventory() {
  const data = {};
  SKU_MASTER.forEach((item, idx) => {
    const r = mkRng(idx * 97 + 13);
    const isSeegene      = item.vendor === 'Seegene Inc.';
    const isHenrySchein  = item.vendor === 'Henry Schein';
    const cat = item.category;
    // 카테고리별 단가
    const baseUnit = isHenrySchein
      ? (cat === 'Calibrator' ? r(80000, 600000)
        : cat === 'Control (QC Material)' ? r(60000, 400000)
        : r(270000, 3500000))
      : isSeegene
        ? (cat === 'Control (QC Material)' ? r(50000, 200000) : r(180000, 550000))
        : cat === 'Calibrator'           ? r(50000, 500000)
        : cat === 'Control (QC Material)' ? r(30000, 300000)
        : cat === 'Consumables'           ? r(500, 15000)
        :                                   r(3000, 80000); // Reagent
    // 카테고리/공급사별 초기 재고 수량
    let openingQty = isHenrySchein
      ? (cat === 'Calibrator' || cat === 'Control (QC Material)' ? r(2, 10) : r(3, 20))
      : isSeegene
        ? (cat === 'Control (QC Material)' ? r(2, 10) : r(5, 30))
        : (cat === 'Calibrator' || cat === 'Control (QC Material)' ? r(3, 15) : r(10, 200));
    let openingValue = openingQty * baseUnit;

    data[item.sku] = MONTHS.map((month, mi) => {
      const r2 = mkRng(idx * 97 + mi * 13 + 7);
      // 계절성
      const seasonFactor = isSeegene
        ? (mi <= 2 || mi >= 9) ? 1.6 : 1.0   // 씨젠: 호흡기 시즌 강함
        : isHenrySchein
          ? (mi <= 2 || mi >= 9) ? 1.2 : 0.95 // Henry Schein: 완만한 계절성
          : (mi <= 2 || mi >= 9) ? 1.3 : 1.0;
      // 발주량: Henry Schein 월 2~8 kit, 씨젠 3~15, 일반 5~80
      const purchaseQty = isHenrySchein ? r2(2, 8) : isSeegene ? r2(3, 15) : r2(5, 80);
      const purchaseValue = purchaseQty * baseUnit;
      // 사용량: Henry Schein 월 1~8 kit, 씨젠 2~12, 일반 3~60
      const rawUsage = isHenrySchein ? r2(1, 8) : isSeegene ? r2(2, 12) : r2(3, 60);
      const usageQty = Math.min(openingQty + purchaseQty - 1, Math.floor(rawUsage * seasonFactor));
      const closingQty = Math.max(isHenrySchein ? 1 : isSeegene ? 1 : 2, openingQty + purchaseQty - usageQty);
      const closingValue = closingQty * baseUnit;
      const usageValue = Math.max(0, openingValue + purchaseValue - closingValue);

      const row = {
        month, sku: item.sku, name: item.name,
        category: item.category, channel: item.channel,
        unitCost: baseUnit,
        openingQty, openingValue,
        purchaseQty, purchaseValue,
        closingQty, closingValue,
        usageValue,
        qbPurchase: purchaseValue + r2(-purchaseValue * 0.05, purchaseValue * 0.05) | 0,
        fbPurchase: purchaseValue,
      };
      openingQty = closingQty;
      openingValue = closingValue;
      return row;
    });
  });
  return data;
}

export const INVENTORY_DATA = generateMonthlyInventory();

// ── 월별 요약 ────────────────────────────────────────────────────────
// 월별 목표 원가율: 계절성 반영 (1~3월·10~12월 높음 / 4~9월 낮음)
const TARGET_COST_RATE = [
  // 2025
  0.385, 0.372, 0.356, 0.331, 0.318, 0.307,
  0.315, 0.328, 0.341, 0.352, 0.368, 0.382,
  // 2026 (1~5월) — 전년 대비 소폭 상승 (STI/HPV 수요 증가 반영)
  0.391, // Jan 2026
  0.378, // Feb 2026
  0.362, // Mar 2026
  0.338, // Apr 2026
  0.324, // May 2026
];

export const MONTHLY_SUMMARY = MONTHS.map((month, i) => {
  let totalOpening=0, totalPurchase=0, totalClosing=0, totalUsage=0;
  let b2bUsage=0, b2cUsage=0;
  let reagentUsage=0, calibratorUsage=0, controlUsage=0, consumablesUsage=0;

  SKU_MASTER.forEach(s => {
    const row = INVENTORY_DATA[s.sku][i];
    totalOpening   += row.openingValue;
    totalPurchase  += row.purchaseValue;
    totalClosing   += row.closingValue;
    totalUsage     += row.usageValue;
    if (s.channel === 'B2B') b2bUsage += row.usageValue; else b2cUsage += row.usageValue;
    if      (s.category === 'Reagent')              reagentUsage    += row.usageValue;
    else if (s.category === 'Calibrator')           calibratorUsage += row.usageValue;
    else if (s.category === 'Control (QC Material)')controlUsage    += row.usageValue;
    else                                            consumablesUsage+= row.usageValue;
  });
  // 하위 호환: reagentUsage에 Calibrator+Control 포함시켜 기존 차트 유지
  const legacyReagentUsage = reagentUsage + calibratorUsage + controlUsage;
  const consumableUsage = consumablesUsage; // alias

  // 월별 원가율 = 목표 원가율 ± 결정론적 소폭 변동 (-2%p ~ +3%p)
  const rRev = mkRng(i * 41 + 99);
  const variation = (rRev(0, 10) - 3) / 100; // -3%p ~ +7%p 중 -3~+7 범위
  const adjustedVariation = (rRev(0, 6) - 2) / 100; // -2%p ~ +4%p
  const costRate = parseFloat(Math.min(0.55, Math.max(0.18, TARGET_COST_RATE[i] + adjustedVariation)).toFixed(4));
  const revenue  = totalUsage / costRate;

  return { month, totalOpening, totalPurchase, totalClosing, totalUsage,
    b2bUsage, b2cUsage,
    reagentUsage: legacyReagentUsage,   // Reagent+Calibrator+Control
    consumableUsage,                     // Consumables only
    reagentOnly: reagentUsage,           // 순수 Reagent
    calibratorUsage, controlUsage, consumablesUsage,
    revenue, costRate, costRateChange: 0 };
});

for (let i = 1; i < MONTHLY_SUMMARY.length; i++) {
  const prev = MONTHLY_SUMMARY[i-1].costRate;
  const cur  = MONTHLY_SUMMARY[i].costRate;
  MONTHLY_SUMMARY[i].costRateChange = prev
    ? parseFloat(((cur - prev) / prev * 100).toFixed(2)) : 0;
}

// ── 이상탐지 ────────────────────────────────────────────────────────
export const EXCEPTIONS = (() => {
  const list = [];
  let id = 1;

  // 고정 이상 항목
  list.push(
    { id:id++, type:'SKU_MISMATCH',    severity:'high',   sku:'RG-003A', name:'qPCR Probe Set (Legacy)',       message:'SKU가 마스터와 불일치 (RG-003A → RG-003 추정)', month:'2025-11', action:'담당자 확인 필요' },
    { id:id++, type:'QB_FB_DIFF',      severity:'high',   sku:'CS-001',  name:'Microcentrifuge Tubes 1.5ml',   message:'QB 입고 ₩4,820,000 vs FB 입고 ₩5,200,000 (차이: ₩380,000)', month:'2025-12', action:'전표 재확인 필요' },
    { id:id++, type:'MISSING_CLOSING', severity:'medium', sku:'RG-005',  name:'Viral Transport Medium',        message:'기말재고 누락 (월말 실사 미기재)', month:'2025-12', action:'실사 담당자 확인' },
    { id:id++, type:'COST_SPIKE',      severity:'high',   sku:'RG-002',  name:'RNA Extraction Kit',            message:'원가율 전월 대비 +38.2% 급등', month:'2025-12', action:'입고단가 및 사용량 점검' },
    { id:id++, type:'NO_LEDGER',       severity:'medium', sku:'CS-007',  name:'Filter Tips 10ul',              message:'입고 기록은 있으나 재고수불부에 없는 품목', month:'2025-11', action:'SKU 마스터 등록 필요' },
    { id:id++, type:'VARIANCE_30',     severity:'medium', sku:'CS-003',  name:'Pipette Tips 200ul',            message:'전월 대비 -34.1% 감소', month:'2025-12', action:'수요 변동 원인 파악' },
    { id:id++, type:'NAME_MISMATCH',   severity:'low',    sku:'RG-004',  name:'ELISA Assay Kit',               message:'QB 품목명 "ELISA Kit v2" vs SKU 마스터 "ELISA Assay Kit"', month:'2025-10', action:'품목명 통일 필요' },
    { id:id++, type:'QB_FB_DIFF',      severity:'low',    sku:'RG-006',  name:'DNA Extraction Reagent',        message:'QB 입고 ₩2,100,000 vs FB 입고 ₩2,050,000 (차이: ₩50,000)', month:'2025-11', action:'소액 차이 확인' },
  );

  // Henry Schein B2B 이상 항목
  list.push(
    { id:id++, type:'COST_SPIKE',      severity:'high',   sku:'HS-010', name:'Troponin I High-Sensitivity Assay Kit',  message:'단가 전월 $1,850 → $2,240으로 +21.1% 인상 — Roche 공급가 인상. USD 환율(1,350원) 동시 상승으로 원화 기준 영향 확대', month:'2025-12', action:'Henry Schein 단가 협상 요청 (구매팀)' },
    { id:id++, type:'QB_FB_DIFF',      severity:'high',   sku:'HS-016', name:'HbA1c NGSP-Certified Assay Kit',         message:'QB 입고 ₩12,150,000 vs FB 입고 ₩11,880,000 (차이: ₩270,000) — USD 환율 적용 시점 차이로 추정', month:'2025-12', action:'환율 적용 기준일 통일 후 재처리' },
    { id:id++, type:'VARIANCE_30',     severity:'medium', sku:'HS-009', name:'Vitamin D (25-OH) Total Assay Kit',      message:'전월 대비 +38.5% 증가 — 미국 내 Vitamin D 검사 가이드라인 확대로 검사 건수 급증', month:'2025-12', action:'적정재고 상향 조정 검토' },
    { id:id++, type:'MISSING_CLOSING', severity:'medium', sku:'HS-014', name:'Prothrombin Time (PT/INR) Reagent',      message:'기말재고 미기재 — 미국 현지 창고 실사 미완료', month:'2025-12', action:'미국 창고 담당자(Sarah Kim) 확인 요청' },
    { id:id++, type:'NAME_MISMATCH',   severity:'low',    sku:'HS-018', name:'Influenza A+B Rapid Antigen Test',       message:'QB 품목명 "Flu A/B Rapid Test" vs SKU 마스터 명칭 불일치', month:'2025-11', action:'Henry Schein 공식 카탈로그명으로 통일' },
  );

  // 씨젠 STI 시약 전용 이상 항목
  list.push(
    { id:id++, type:'COST_SPIKE',      severity:'high',   sku:'SG-001', name:'Allplex™ STI Essential Panel',    message:'12월 사용량 전월 대비 +45.2% 급증 — 산부인과·비뇨기과 STI 정기검진 수요 증가', month:'2025-12', action:'긴급 발주 및 적정재고 상향 검토' },
    { id:id++, type:'VARIANCE_30',     severity:'high',   sku:'SG-006', name:'Allplex™ HPV HR Detection',       message:'전월 대비 +38.9% 증가 — 자궁경부암 검진 가이드라인 개정으로 HPV 검사 급증', month:'2025-12', action:'발주 수량 1.5배 상향 조정' },
    { id:id++, type:'VARIANCE_30',     severity:'medium', sku:'SG-004', name:'Allplex™ CT/NG Assay',            message:'전월 대비 +33.6% 증가. 클라미디아/임균 동시 검사 처방 증가', month:'2025-12', action:'수요 증가 원인 확인 및 재고 보충' },
    { id:id++, type:'MISSING_CLOSING', severity:'medium', sku:'SG-016', name:'Allplex™ HBV Assay',              message:'기말재고 미기재 — 12월 실사표 누락', month:'2025-12', action:'실사 담당자 확인 후 재기재' },
    { id:id++, type:'QB_FB_DIFF',      severity:'medium', sku:'SG-002', name:'Allplex™ STI Master Panel',       message:'QB 입고 ₩8,640,000 vs FB 입고 ₩8,910,000 (차이: ₩270,000)', month:'2025-11', action:'전표 원본 확인 필요' },
    { id:id++, type:'NAME_MISMATCH',   severity:'low',    sku:'SG-005', name:'Seeplex® STD6 ACE Detection',     message:'QB 품목명 "Seeplex STD6" vs SKU 마스터 "Seeplex® STD6 ACE Detection — CT/NG (96T)" 불일치', month:'2025-10', action:'QB 품목명 수정 요청' },
  );

  // 일반 품목 전월 대비 30%+ 변동 자동 탐지
  const lastIdx = MONTHS.length - 1;
  SKU_MASTER.forEach(s => {
    const cur = INVENTORY_DATA[s.sku][lastIdx].usageValue;
    const prv = INVENTORY_DATA[s.sku][lastIdx - 1].usageValue;
    if (prv > 50000 && cur > 0) {
      const chg = (cur - prv) / prv * 100;
      if (Math.abs(chg) >= 30 && !list.find(e => e.sku === s.sku && e.type === 'VARIANCE_30')) {
        list.push({ id:id++, type:'VARIANCE_30', severity:'medium', sku:s.sku, name:s.name,
          message:`전월 대비 ${chg>0?'+':''}${chg.toFixed(1)}% 변동`, month:MONTHS[lastIdx], action:'수요 변동 원인 파악' });
      }
    }
  });

  return list.slice(0, 35);
})();

export const AI_COMMENTARY = {
  month: '2026-05',
  costRateAlert: true,
  summary: '2026년 5월 재료비 원가율은 32.4%로 전월(33.8%) 대비 -1.4%p 개선되었습니다. Henry Schein B2B 임상진단 시약 및 씨젠 STI B2C 시약 포함 전체 252개 SKU 기준 분석되었으며, STI 검진 시즌 수요 증가에도 불구하고 구매 단가 협상 효과로 원가율이 소폭 하락하였습니다.',
  keyFindings: [
    { icon:'🇺🇸', text:'Henry Schein Troponin I HS (HS-010): Roche 공급가 $1,850 → $2,240 (+21.1%) 인상. USD 환율 동반 상승으로 원화 환산 영향 확대. Henry Schein 단가 재협상 시급.' },
    { icon:'🔬', text:'씨젠 Allplex™ STI Essential Panel (SG-001): 12월 사용량 전월 대비 +45.2% 급증. 산부인과·비뇨기과 STI 정기검진 수요 증가 및 건강보험 급여화 확대 영향.' },
    { icon:'📊', text:'씨젠 Allplex™ HPV HR Detection (SG-006): 자궁경부암 검진 가이드라인 개정으로 사용량 전월 대비 +38.9% 증가. B2C STI 재료비 비중 1위 품목으로 부상.' },
    { icon:'✅', text:'Henry Schein 응고 계열 (HS-014·015 PT/aPTT) 및 씨젠 HBV/HCV (SG-016·017): 안정적 운용 중. 씨젠 STI Master Panel (SG-002) QB/FB 불일치(₩270,000)는 확인 후 처리 예정.' },
  ],
  actionItems: [
    'Henry Schein Troponin I HS (HS-010) 단가 재협상 — Abbott ARCHITECT 대체 공급 견적 병행 검토 (구매팀)',
    'Allplex™ STI Essential Panel (SG-001) 발주 수량 상향 — STI 검진 수요 증가에 따른 재고 2개월치 확보 (구매팀)',
    'Allplex™ HPV HR Detection (SG-006) 발주 플랜 수립 — 검진 가이드라인 개정 반영 월 발주량 1.5배 조정 (구매팀)',
    'Henry Schein HbA1c Kit (HS-016) QB/FB 불일치 ₩270,000 — USD 환율 기준일 통일 후 재처리 (회계팀)',
    'PT/INR Reagent (HS-014) 미국 창고 기말재고 실사 완료 요청 — 담당자 확인 (창고팀)',
  ],
  closingMemo: `[월마감 담당자 전달사항 - 2025년 12월]\n\nHenry Schein B2B 20종 + 씨젠 STI B2C 20종 포함 전체 252개 SKU 재고수불부 확정 필요.\n\n【Henry Schein B2B 긴급 사항 (USD 기반)】\n1. Troponin I HS (HS-010): 단가 +21.1% 인상 → 재협상 요청\n2. HbA1c Kit (HS-016): QB/FB 불일치 ₩270,000 → 환율 기준일 확인\n3. Vitamin D Kit (HS-009): 사용량 +38.5% → 적정재고 상향 검토\n4. PT/INR Reagent (HS-014): 미국 창고 기말재고 미기재 → 실사 요청\n\n【씨젠 STI B2C 긴급 사항】\n5. Allplex™ STI Essential (SG-001): 사용량 +45.2% → 발주 수량 상향\n6. Allplex™ HPV HR Detection (SG-006): 사용량 +38.9% → 발주 플랜 수립\n7. Allplex™ CT/NG Assay (SG-004): 사용량 +33.6% → 재고 보충\n\n위 7가지 항목 처리 후 최종 원가 확정 바랍니다.\n감사합니다.`,
};
