import * as XLSX from 'xlsx';

function makeSheet(headers, rows, colWidths) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = colWidths.map(w => ({ wch: w }));
  // 헤더 행 굵게 (xlsx는 스타일 제한적 — 너비/구조만 적용)
  return ws;
}

function download(wb, filename) {
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.style.cssText = 'position:fixed;top:-200px;left:-200px;opacity:0;pointer-events:none';
  a.href = url;
  a.setAttribute('download', filename);
  document.body.appendChild(a);
  a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // 토스트 알림
    const prev = document.getElementById('dl-toast');
    if (prev) prev.remove();
    const toast = document.createElement('div');
    toast.id = 'dl-toast';
    toast.style.cssText = `
      position:fixed;bottom:28px;right:28px;z-index:9999;
      background:#131720;border:1px solid #1e2638;border-left:3px solid #6366f1;
      padding:14px 18px;border-radius:4px;
      display:flex;align-items:flex-start;gap:12px;
      box-shadow:0 8px 32px rgba(0,0,0,.5);
      animation:slideIn .25s ease;max-width:320px;
    `;
    toast.innerHTML = `
      <style>@keyframes slideIn{from{transform:translateX(20px);opacity:0}to{transform:none;opacity:1}}</style>
      <span style="color:#6366f1;font-size:16px;margin-top:1px">↓</span>
      <div>
        <div style="color:#e2e8f0;font-size:12px;font-weight:600;margin-bottom:3px">양식 다운로드 완료</div>
        <div style="color:#4b5a7a;font-size:11px;font-family:'Courier New',monospace;word-break:break-all">${filename}</div>
        <div style="color:#2d3a55;font-size:10px;margin-top:4px">📁 다운로드 폴더를 확인하세요</div>
      </div>
      <button onclick="this.parentElement.remove()" style="
        background:none;border:none;color:#2d3a55;cursor:pointer;
        font-size:14px;margin-left:auto;padding:0;line-height:1;flex-shrink:0
      ">✕</button>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast?.remove(), 5000);
  }, 1000);
}

export function downloadQBTemplate() {
  // 실제 QuickBooks Transaction Detail 리포트와 동일한 구조
  // Col A: Vendor(그룹헤더) | B: Transaction date(MM/DD/YYYY) | C: Type | D: Num
  // E: Product/Service | F: Description(SKU) | G: Quantity | H: Rate | I: Amount | J: Balance
  const N = null;
  const wb = XLSX.utils.book_new();

  const headerRow = [N, 'Transaction date', 'Transaction type', 'Num', 'Product/Service full name', 'Description', 'Quantity', 'Rate', 'Amount', 'Balance'];

  let balance = 0;
  const mkRow = (vendor, date, type, num, product, desc, qty, rate) => {
    const amount = qty ? Math.round(qty * rate * 100) / 100 : rate;
    balance += amount;
    return [vendor || N, date || N, type, num, product || '', desc || '', qty || N, rate || N, amount, balance];
  };

  const rows = [
    headerRow,
    // ── Henry Schein ──
    ['Henry Schein', N, N, N, N, N, N, N, N, N],
    mkRow(N, '06/01/2026','Bill','HS-INV-001','Anti-HCV Calibrator',    '1L79-01', 2, 253.99),
    mkRow(N, '06/01/2026','Bill','HS-INV-001','Anti-Tg Calibrator',     '2K46-01', 2, 253.99),
    mkRow(N, '06/01/2026','Bill','HS-INV-001','Anti-TPO Calibrator',    '2K47-01', 2, 253.99),
    mkRow(N, '06/01/2026','Bill','HS-INV-001','AUSAB Calibrator',       '1L82-02', 2, 253.99),
    mkRow(N, '06/01/2026','Bill','HS-INV-001','BNP Calibrator',         '8K28-04', 0,   0.00),
    mkRow(N, '06/05/2026','Bill','HS-INV-002','Troponin I HS Assay Kit','HS-010',  2, 2240.00),
    mkRow(N, '06/05/2026','Bill','HS-INV-002','Vitamin D (25-OH) Total','HS-009',  3, 890.00),
    mkRow(N, '06/05/2026','Bill','HS-INV-002','D-Dimer Quantitative',   'HS-012',  2, 1250.00),
    mkRow(N, '06/10/2026','Bill','HS-INV-003','Multi-Chemistry QC Low', 'HS-026A', 2, 85.00),
    mkRow(N, '06/10/2026','Bill','HS-INV-003','Multi-Chemistry QC Norm','HS-026B', 2, 85.00),
    mkRow(N, '06/10/2026','Bill','HS-INV-003','Multi-Chemistry QC High','HS-026C', 2, 85.00),
    // ── Seegene Inc. ──
    ['Seegene Inc.', N, N, N, N, N, N, N, N, N],
    mkRow(N, '06/03/2026','Bill','SG-INV-001','Allplex STI Essential Panel','SG-001', 5, 380.00),
    mkRow(N, '06/03/2026','Bill','SG-INV-001','Allplex STI Master Panel',   'SG-002', 3, 420.00),
    mkRow(N, '06/03/2026','Bill','SG-INV-001','Allplex CT/NG Assay',        'SG-004', 4, 350.00),
    mkRow(N, '06/03/2026','Bill','SG-INV-001','Allplex HPV HR Detection',   'SG-006', 3, 360.00),
    mkRow(N, '06/03/2026','Bill','SG-INV-001','Allplex HBV Assay',          'SG-016', 2, 370.00),
    mkRow(N, '06/03/2026','Bill','SG-INV-001','Allplex STI IC Set',         'SG-020', 1, 120.00),
    // ── LabSupply ──
    ['LabSupply', N, N, N, N, N, N, N, N, N],
    mkRow(N, '06/08/2026','Bill','LAB-INV-001','Pipette Tips 200ul',        'CS-003', 500, 0.15),
    mkRow(N, '06/08/2026','Bill','LAB-INV-001','Microcentrifuge Tubes 1.5ml','CS-001',200, 0.15),
    mkRow(N, '06/08/2026','Bill','LAB-INV-001','PCR Plates 96-well',        'CS-002',  50, 2.50),
  ];

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [26, 16, 16, 14, 32, 14, 9, 11, 12, 12].map(w => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  download(wb, 'QuickBooks_양식.xlsx');
}

export function downloadFishbowlTemplate() {
  // ── 실제 Fishbowl IVS 파일과 완전히 동일한 구조 ──
  const wb = XLSX.utils.book_new();

  const N = null;
  const today = new Date();

  // 샘플 데이터 (실제 파일과 동일한 12컬럼 구조)
  const data = [
    // Calibrator (Abbott / Henry Schein)
    ['Anti-HCV Calibrator',          'Abbott',        '1L79-01', 2, 'Each', 253.99,  507.98,  'Architect i2000SR ||| Henry Schein', 'Core', N, 'Calibrator', 'B2B'],
    ['Anti-Tg Calibrator',           'Abbott',        '2K46-01', 2, 'Each', 253.99,  507.98,  'Architect i2000SR ||| Henry Schein', 'Core', N, 'Calibrator', 'B2B'],
    ['Anti-TPO Calibrator',          'Abbott',        '2K47-01', 2, 'Each', 253.99,  507.98,  'Architect i2000SR ||| Henry Schein', 'Core', N, 'Calibrator', 'B2B'],
    ['AUSAB Calibrator',             'Abbott',        '1L82-02', 2, 'Each', 253.99,  507.98,  'Architect i2000SR ||| Henry Schein', 'Core', N, 'Calibrator', 'B2B'],
    ['BNP Calibrator',               'Abbott',        '8K28-04', 0, 'Each', 248.73,  0,       'Architect i2000SR ||| Henry Schein', 'Core', N, 'Calibrator', 'B2B'],
    ['HbA1c Calibrator Set',         'Henry Schein',  'HS-024',  1, 'Set',  420.00,  420.00,  'Bio-Rad NGSP ||| Henry Schein',      'Core', N, 'Calibrator', 'B2B'],
    ['CBC 5-Part Calibrator',        'Henry Schein',  'HS-025',  1, 'Set',  450.00,  450.00,  'Sysmex ||| Henry Schein',            'Core', N, 'Calibrator', 'B2B'],
    // Control (QC)
    ['Multi-Chemistry QC Low',       'Henry Schein',  'HS-026A', 2, 'Each', 85.00,   170.00,  'Roche cobas ||| Henry Schein',       'Core', N, 'control',    'B2B'],
    ['Multi-Chemistry QC Normal',    'Henry Schein',  'HS-026B', 2, 'Each', 85.00,   170.00,  'Roche cobas ||| Henry Schein',       'Core', N, 'control',    'B2B'],
    ['Multi-Chemistry QC High',      'Henry Schein',  'HS-026C', 2, 'Each', 85.00,   170.00,  'Roche cobas ||| Henry Schein',       'Core', N, 'control',    'B2B'],
    ['Troponin QC Pack',             'Henry Schein',  'HS-027',  1, 'Set',  380.00,  380.00,  'Siemens ||| Henry Schein',           'Core', N, 'control',    'B2B'],
    ['Allplex STI Positive Control', 'Seegene',       'SG-019',  2, 'Set',  120.00,  240.00,  'STI Panel ||| Seegene Inc.',         'Core', N, 'control',    'B2C'],
    // Reagent — B2B
    ['Troponin I HS Assay Kit',      'Henry Schein',  'HS-010',  2, 'Kit', 2240.00, 4480.00,  'Abbott ARCHITECT ||| Henry Schein',  'Core', N, 'reagent',    'B2B'],
    ['Vitamin D (25-OH) Total',      'Henry Schein',  'HS-009',  3, 'Kit',  890.00, 2670.00,  'Abbott ARCHITECT ||| Henry Schein',  'Core', N, 'reagent',    'B2B'],
    ['D-Dimer Quantitative',         'Henry Schein',  'HS-012',  2, 'Kit', 1250.00, 2500.00,  'Siemens ||| Henry Schein',           'Core', N, 'reagent',    'B2B'],
    // Reagent — B2C (Seegene STI)
    ['Allplex STI Essential Panel',  'Seegene',       'SG-001',  5, 'Kit',  380.00, 1900.00,  'STI Panel ||| Seegene Inc.',         'Core', N, 'reagent',    'B2C'],
    ['Allplex STI Master Panel',     'Seegene',       'SG-002',  3, 'Kit',  420.00, 1260.00,  'STI Panel ||| Seegene Inc.',         'Core', N, 'reagent',    'B2C'],
    ['Allplex CT/NG Assay',          'Seegene',       'SG-004',  4, 'Kit',  350.00, 1400.00,  'CT/NG Assay ||| Seegene Inc.',       'Core', N, 'reagent',    'B2C'],
    ['Allplex HPV HR Detection',     'Seegene',       'SG-006',  3, 'Kit',  360.00, 1080.00,  'HPV Panel ||| Seegene Inc.',         'Core', N, 'reagent',    'B2C'],
    ['Allplex HBV Assay',            'Seegene',       'SG-016',  2, 'Kit',  370.00,  740.00,  'HBV Assay ||| Seegene Inc.',         'Core', N, 'reagent',    'B2C'],
    // Consumable (Lab supplies)
    ['Pipette Tips 200ul',           'TipMaster',     'CS-003', 500, 'Pack',   0.15,   75.00, 'Consumables ||| TipMaster',          'Lab',  N, 'consumable', 'B2B'],
    ['Microcentrifuge Tubes 1.5ml',  'LabSupply',     'CS-001', 200, 'Pack',   0.15,   30.00, 'Consumables ||| LabSupply',          'Lab',  N, 'consumable', 'B2B'],
    ['PCR Plates 96-well',           'LabSupply',     'CS-002',  50, 'Pack',   2.50,  125.00, 'Consumables ||| LabSupply',          'Lab',  N, 'consumable', 'B2B'],
    ['Nitrile Gloves M',             'SafeGuard',     'CS-004', 100, 'Pack',   0.08,    8.00, 'Consumables ||| SafeGuard',          'Lab',  N, 'consumable', 'B2C'],
  ];

  const totalAsset = data.reduce((s, r) => s + (r[6] || 0), 0);
  const sum = (type, ch) => data.filter(r =>
    (!type || r[10] === type) && (!ch || r[11] === ch)
  ).reduce((s, r) => s + (r[6] || 0), 0);

  // ── 실제 파일 하단 요약 구조 그대로 재현 ──
  const summaryBlock = [
    [N, N, N, N, 'Total Assets Value', N, totalAsset, N,           N,     N,          N, N],
    [N, N, N, N, N,                    N, N,           N,           N,     N,          N, N],
    [N, N, N, N, N,                    N, N,           'Category',  N,     'Amount',   N, N],
    [N, N, N, N, N,                    N, N,           'Inventory - Reagent ',  'B2B', sum('reagent','B2B'),    N, N],
    [N, N, N, N, N,                    N, N,           'Inventory - Lab supplies', 'B2B', sum('consumable','B2B'), N, N],
    [N, N, N, N, N,                    N, N,           'Inventory - Reagent',   'B2C', sum('reagent','B2C'),    N, N],
    [N, N, N, N, N,                    N, N,           'Inventory - Lab supplies ', 'B2C', sum('consumable','B2C'), N, N],
    [N, N, N, N, N,                    N, N,           'Total',     N,     totalAsset, true, N],
    [N, N, N, N, N,                    N, N,           N,           N,     0,          N, N],
    [N, N, N, N, N,                    N, 'Reagent',   'reagent',   'B2B', sum('reagent','B2B'),   N, N],
    [N, N, N, N, N,                    N, N,           'reagent',   'B2C', sum('reagent','B2C'),   N, N],
    [N, N, N, N, N,                    N, N,           'control',   'B2B', sum('control','B2B'),   N, N],
    [N, N, N, N, N,                    N, N,           'control',   'B2C', sum('control','B2C'),   N, N],
    [N, N, N, N, N,                    N, N,           'calibrator','B2B', sum('Calibrator','B2B'),N, N],
    [N, N, N, N, N,                    N, N,           'calibrator','B2C', sum('Calibrator','B2C'),N, N],
    [N, N, N, N, N,                    N, N,           'Linearity', 'B2B', 0,          N, N],
    [N, N, N, N, N,                    N, N,           'Linearity', 'B2C', 0,          N, N],
    [N, N, N, N, N,                    N, 'Lab supplies','consumable','B2B',sum('consumable','B2B'),N,N],
    [N, N, N, N, N,                    N, N,           'consumable','B2C', sum('consumable','B2C'),N, N],
    [N, N, N, N, N,                    N, N,           'equipment', 'B2B', 0,          N, N],
    [N, N, N, N, N,                    N, N,           'equipment', 'B2C', 0,          N, N],
    [N, N, N, N, N,                    N, 'Total',     N,           N,     totalAsset, true, N],
    [N, N, N, N, N,                    N, N,           N,           'B2C KIT', sum(null,'B2C'), N, N],
    [N, N, N, N, N,                    N, N,           N,           'Total ', totalAsset, N, N],
  ];

  const allRows = [
    ['Inventory Valuation Summary', N, N, N, N, N, N, N, N, N, N, N],
    [today,                         N, N, N, N, N, N, N, N, N, N, N],
    [N, N, N, N, N, N, N, N, N, N, N, N],
    ['Item Name','Item Description','Item SKU','Qty','UOM','Unit Cost','Asset Value','Item Tags','Department','Notes','Type','B2B/B2C'],
    ...data,
    [N, N, N, N, N, N, N, N, N, N, N, N], // 데이터 이후 빈 행
    ...summaryBlock,
  ];

  const ws = XLSX.utils.aoa_to_sheet(allRows);
  ws['!cols'] = [28,18,12,7,7,11,13,36,12,14,24,10].map(w => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory Valuation Summary');

  download(wb, 'Fishbowl_재고대장_양식.xlsx');
}

export function downloadPhysicalTemplate() {
  const headers = ['월(YYYY-MM)', 'SKU', '품목명(Item Name)', '기초재고수량', '기초재고금액', '기말재고수량', '기말재고금액', '비고'];
  const rows = [
    ['2025-12', 'RG-001', 'PCR Master Mix', 20, 900000, 15, 675000, ''],
    ['2025-12', 'RG-002', 'RNA Extraction Kit', 12, 540000, 8, 496000, '단가변경'],
    ['2025-12', 'CS-001', 'Microcentrifuge Tubes 1.5ml', 285, 42750, 320, 48000, ''],
  ];
  const ws = makeSheet(headers, rows, [14, 10, 26, 12, 14, 12, 14, 16]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '월말실사');
  download(wb, '월말실사_양식.xlsx');
}

export function downloadSKUMasterTemplate() {
  // 실제 파일 형식: *Item-Name | Item-Sku (첫 2컬럼) + 확장 컬럼 추가
  const headers = [
    '*Item-Name',
    'Item-Sku',
    'Type',
    'B2B/B2C',
    'Vendor',
    'Department',
  ];
  // 실제 파일과 동일하게: *Item-Name(col A), Item-Sku(col B) 순서 유지
  // 컬럼 A=품목명, B=SKU, C=Type, D=B2B/B2C, E=Vendor, F=Department
  const rows = [
    // Calibrators (Abbott / Henry Schein)
    ['Anti-HCV Calibrator',            '1L79-01',   'Calibrator',            'B2B', 'Abbott',        'Core'],
    ['Anti-Tg Calibrator',             '2K46-01',   'Calibrator',            'B2B', 'Abbott',        'Core'],
    ['Anti-TPO Calibrator',            '2K47-01',   'Calibrator',            'B2B', 'Abbott',        'Core'],
    ['AUSAB Calibrator',               '1L82-02',   'Calibrator',            'B2B', 'Abbott',        'Core'],
    ['BNP Calibrator',                 '8K28-04',   'Calibrator',            'B2B', 'Abbott',        'Core'],
    ['HbA1c Calibrator Set',           'HS-024',    'Calibrator',            'B2B', 'Henry Schein',  'Core'],
    ['CBC 5-Part Calibrator',          'HS-025',    'Calibrator',            'B2B', 'Henry Schein',  'Core'],
    // Controls
    ['Multi-Chemistry QC Low',         'HS-026A',   'control',               'B2B', 'Henry Schein',  'Core'],
    ['Multi-Chemistry QC Normal',      'HS-026B',   'control',               'B2B', 'Henry Schein',  'Core'],
    ['Multi-Chemistry QC High',        'HS-026C',   'control',               'B2B', 'Henry Schein',  'Core'],
    ['Troponin QC Pack',               'HS-027',    'control',               'B2B', 'Henry Schein',  'Core'],
    ['Allplex STI Positive Control',   'SG-019',    'control',               'B2C', 'Seegene Inc.',  'Core'],
    // Reagents B2B
    ['Troponin I HS Assay Kit',        'HS-010',    'reagent',               'B2B', 'Henry Schein',  'Core'],
    ['Vitamin D (25-OH) Total',        'HS-009',    'reagent',               'B2B', 'Henry Schein',  'Core'],
    ['D-Dimer Quantitative',           'HS-012',    'reagent',               'B2B', 'Henry Schein',  'Core'],
    // Reagents B2C (Seegene STI)
    ['Allplex STI Essential Panel',    'SG-001',    'reagent',               'B2C', 'Seegene Inc.',  'Core'],
    ['Allplex STI Master Panel',       'SG-002',    'reagent',               'B2C', 'Seegene Inc.',  'Core'],
    ['Allplex CT/NG Assay',            'SG-004',    'reagent',               'B2C', 'Seegene Inc.',  'Core'],
    ['Allplex HPV HR Detection',       'SG-006',    'reagent',               'B2C', 'Seegene Inc.',  'Core'],
    ['Allplex HBV Assay',              'SG-016',    'reagent',               'B2C', 'Seegene Inc.',  'Core'],
    // Consumables (Lab supplies)
    ['4mL K3E K3EDTA',                 'C-BCT-004', 'consumable',            'B2B', 'BD',            'Lab'],
    ['21g Butterfly Needle',           '450095V1',  'consumable',            'B2B', 'BD',            'Lab'],
    ['23g Butterfly Needle',           'C-NEE-005', 'consumable',            'B2B', 'BD',            'Lab'],
    ['BD 2gal Sharps Container',       'C-OTH-012', 'consumable',            'B2B', 'BD',            'Lab'],
    ['BD Sharps Collector 1.5qt',      'C-OTH-011', 'consumable',            'B2B', 'BD',            'Lab'],
    ['Blood Culture Collection Kit',   'C-OTH-019', 'consumable',            'B2B', 'BD',            'Lab'],
    ['Pipette Tips 200ul',             'CS-003',    'consumable',            'B2B', 'TipMaster',     'Lab'],
    ['Microcentrifuge Tubes 1.5ml',    'CS-001',    'consumable',            'B2B', 'LabSupply',     'Lab'],
    ['PCR Plates 96-well',             'CS-002',    'consumable',            'B2B', 'LabSupply',     'Lab'],
  ];
  const ws = makeSheet(headers, rows, [36, 16, 24, 10, 18, 12]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'SKU_Master');

  // 작성 가이드 시트
  const guide = XLSX.utils.aoa_to_sheet([
    ['【SKU Master 작성 가이드】'],
    [],
    ['열', '내용', '예시', '필수'],
    ['*Item-Name', '품목명 (Fishbowl Item Name과 동일하게)', 'Anti-HCV Calibrator', '필수'],
    ['Item-Sku',   'SKU 코드 (Fishbowl Item SKU와 동일하게)', '1L79-01',           '필수'],
    ['Type',       '품목 구분', 'reagent / calibrator / control / consumable',      '권장'],
    ['B2B/B2C',    '판매 채널', 'B2B / B2C',                                       '권장'],
    ['Vendor',     '공급업체',  'Abbott / Henry Schein / Seegene Inc.',            '선택'],
    ['Department', '부서',      'Core / Lab',                                      '선택'],
    [],
    ['【Type 입력값 (대소문자 무관)】'],
    ['입력값',           '분류',                  '예시'],
    ['reagent',          'Reagent (시약)',         'Allplex STI, Troponin Kit'],
    ['calibrator',       'Calibrator (캘리브레이터)','Anti-HCV Calibrator'],
    ['control',          'Control (QC Material)', 'Multi-Chemistry QC'],
    ['consumable',       'Consumables (소모품)',   'Needles, Tubes, Tips'],
    ['equipment',        'Consumables (소모품)',   '장비용품'],
    ['Linearity',        'Calibrator',            '직선성 검증 물질'],
  ]);
  guide['!cols'] = [20, 38, 36, 8].map(w => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, guide, '작성_가이드');
  download(wb, 'SKU_Master_양식.xlsx');
}

export function downloadCostCategoryTemplate() {
  const headers = ['코드(Code)', '카테고리명(Category Name)', '유형(Reagent/Calibrator/Control(QC Material)/Consumables)', 'GL계정'];
  const rows = [
    ['MAT-001', 'Raw Material - Reagent',             'Reagent',              '51100'],
    ['MAT-002', 'Calibrator Material',                 'Calibrator',           '51150'],
    ['MAT-003', 'QC / Control Material',               'Control (QC Material)','51160'],
    ['MAT-004', 'Raw Material - Consumables',          'Consumables',          '51200'],
    ['MAT-005', 'Packaging Material',                  'Consumables',          '51300'],
  ];
  const ws = makeSheet(headers, rows, [14, 28, 22, 12]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cost_Category');
  download(wb, 'Cost_Category_양식.xlsx');
}

export function downloadAllTemplates() {
  downloadFishbowlTemplate();
  downloadQBTemplate();
  downloadSKUMasterTemplate();
}
