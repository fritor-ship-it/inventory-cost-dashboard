import * as XLSX from 'xlsx';

function makeSheet(headers, rows, colWidths) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = colWidths.map(w => ({ wch: w }));
  // 헤더 행 굵게 (xlsx는 스타일 제한적 — 너비/구조만 적용)
  return ws;
}

function download(wb, filename) {
  XLSX.writeFile(wb, filename);
}

export function downloadQBTemplate() {
  const headers = ['날짜(Date)', '거래처(Vendor)', '품목명(Item Name)', 'SKU', '수량(Qty)', '단가(Unit Cost)', '금액(Amount)', '계정(Account)', '비고'];
  const rows = [
    ['2025-12-01', 'BioTech Co.', 'PCR Master Mix', 'RG-001', 10, 45000, 450000, '재료비', ''],
    ['2025-12-05', 'GeneSys Inc.', 'RNA Extraction Kit', 'RG-002', 5, 62000, 310000, '재료비', '단가인상'],
    ['2025-12-10', 'LabSupply', 'Microcentrifuge Tubes 1.5ml', 'CS-001', 200, 150, 30000, '소모품', ''],
  ];
  const ws = makeSheet(headers, rows, [14, 18, 26, 10, 8, 12, 12, 12, 16]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'QB_Purchase');
  download(wb, 'QuickBooks_양식.xlsx');
}

export function downloadFishbowlTemplate() {
  // Fishbowl Inventory Valuation Summary 실제 양식과 동일한 형식
  const wb = XLSX.utils.book_new();

  // ── 재고대장 시트 ──
  const titleRow   = ['Inventory Valuation Summary', null, null, null, null, null, null, null, null, null, null, null];
  const dateRow    = [new Date(), null, null, null, null, null, null, null, null, null, null, null];
  const emptyRow   = [null, null, null, null, null, null, null, null, null, null, null, null];
  const headerRow  = ['Item Name','Item Description','Item SKU','Qty','UOM','Unit Cost','Asset Value','Item Tags','Department','Notes','Type','B2B/B2C'];
  const sampleRows = [
    ['Anti-HCV Calibrator',            'Abbott',        '1L79-01',  2,  'Each', 253.99, 507.98,   'Architect i2000SR ||| Henry Schein', 'Core',  null, 'Calibrator',            'B2B'],
    ['Anti-Tg Calibrator',             'Abbott',        '2K46-01',  2,  'Each', 253.99, 507.98,   'Architect i2000SR ||| Henry Schein', 'Core',  null, 'Calibrator',            'B2B'],
    ['AUSAB Calibrator',               'Abbott',        '1L82-02',  2,  'Each', 253.99, 507.98,   'Architect i2000SR ||| Henry Schein', 'Core',  null, 'Calibrator',            'B2B'],
    ['Allplex™ STI Essential Panel',   'Seegene',       'SG-001',   5,  'Kit',  380.00, 1900.00,  'STI Panel ||| Seegene Inc.',        'Core',  null, 'Reagent',               'B2C'],
    ['Allplex™ HPV HR Detection',      'Seegene',       'SG-006',   3,  'Kit',  350.00, 1050.00,  'HPV Panel ||| Seegene Inc.',        'Core',  null, 'Reagent',               'B2C'],
    ['Troponin I HS Kit',              'Henry Schein',  'HS-010',   2,  'Kit', 2240.00, 4480.00,  'Troponin ||| Henry Schein',         'Core',  null, 'Reagent',               'B2B'],
    ['Multi-Chemistry QC (3 levels)',  'Henry Schein',  'HS-026',   1,  'Set',  320.00,  320.00,  'QC Material ||| Henry Schein',      'Core',  null, 'Control (QC Material)', 'B2B'],
    ['CBC 5-Part Calibrator',          'Henry Schein',  'HS-025',   1,  'Set',  450.00,  450.00,  'Calibrator ||| Henry Schein',       'Core',  null, 'Calibrator',            'B2B'],
    ['Pipette Tips 200ul',             'TipMaster',     'CS-003',  500, 'Pack',   0.15,   75.00,  'Consumables ||| TipMaster',         'Lab',   null, 'Consumables',           'B2C'],
    ['Microcentrifuge Tubes 1.5ml',    'LabSupply',     'CS-001',  200, 'Pack',   0.15,   30.00,  'Consumables ||| LabSupply',         'Lab',   null, 'Consumables',           'B2B'],
  ];

  // 소계 행
  const totalAssets = sampleRows.reduce((s, r) => s + (r[6] || 0), 0);
  const summaryRows = [
    [null, null, null, null, 'Total Assets Value', null, totalAssets, null, null, null, null, null],
    [null, null, null, null, null, null, null, 'Category', null, 'Amount', null, null],
    [null, null, null, null, null, null, null, 'Inventory - Reagent', 'B2B', sampleRows.filter(r=>r[10]==='Reagent'&&r[11]==='B2B').reduce((s,r)=>s+r[6],0), null, null],
    [null, null, null, null, null, null, null, 'Inventory - Reagent', 'B2C', sampleRows.filter(r=>r[10]==='Reagent'&&r[11]==='B2C').reduce((s,r)=>s+r[6],0), null, null],
    [null, null, null, null, null, null, null, 'Inventory - Calibrator', 'B2B', sampleRows.filter(r=>r[10]==='Calibrator').reduce((s,r)=>s+r[6],0), null, null],
    [null, null, null, null, null, null, null, 'Inventory - Control (QC)', 'B2B', sampleRows.filter(r=>r[10]==='Control (QC Material)').reduce((s,r)=>s+r[6],0), null, null],
    [null, null, null, null, null, null, null, 'Inventory - Consumables', 'B2B', sampleRows.filter(r=>r[10]==='Consumables').reduce((s,r)=>s+r[6],0), null, null],
    [null, null, null, null, null, null, null, 'Total', null, totalAssets, null, null],
  ];

  const allRows = [titleRow, dateRow, emptyRow, headerRow, ...sampleRows, ...summaryRows];
  const ws = XLSX.utils.aoa_to_sheet(allRows);
  ws['!cols'] = [28, 18, 12, 8, 8, 12, 14, 34, 10, 14, 24, 10].map(w => ({ wch: w }));

  XLSX.utils.book_append_sheet(wb, ws, 'Inventory Valuation Summary');

  // ── 작성 가이드 시트 ──
  const guide = XLSX.utils.aoa_to_sheet([
    ['【Fishbowl 재고대장 작성 가이드】'],
    [],
    ['열(Column)', '내용', '예시', '필수'],
    ['Item Name',        '품목명',                 'Anti-HCV Calibrator',       '필수'],
    ['Item Description', '공급업체(Vendor)',        'Abbott',                    '권장'],
    ['Item SKU',         'SKU 코드',               '1L79-01',                   '필수'],
    ['Qty',              '현재 보유 수량',          '2',                         '필수'],
    ['UOM',              '단위',                   'Each / Kit / Pack / Set',   '권장'],
    ['Unit Cost',        '단가 (USD)',              '253.99',                    '필수'],
    ['Asset Value',      '재고금액 (USD, Qty×Cost)','507.98',                   '자동계산'],
    ['Item Tags',        '장비명 ||| 공급사',       'Architect i2000SR ||| Henry Schein', '권장'],
    ['Department',       '부서',                   'Core / Lab',               '선택'],
    ['Notes',            '비고',                   '',                          '선택'],
    ['Type',             '품목 구분',              'Reagent / Calibrator / Control (QC Material) / Consumables', '필수'],
    ['B2B/B2C',          '채널',                   'B2B / B2C',                '필수'],
    [],
    ['【주의사항】'],
    ['- Row 1: "Inventory Valuation Summary" 고정'],
    ['- Row 2: 보고 기준일 (YYYY-MM-DD)'],
    ['- Row 3: 빈 행'],
    ['- Row 4: 헤더 행 (위 컬럼명과 동일하게)'],
    ['- Row 5~: 데이터 행 (Item SKU가 있는 행만 처리)'],
    ['- 금액 단위: USD (시스템이 자동으로 KRW 환산 적용)'],
    ['- 환율: 기본 1,350원/USD (Settings에서 변경 가능)'],
  ]);
  guide['!cols'] = [24, 24, 40, 10].map(w => ({ wch: w }));
  XLSX.utils.book_append_sheet(wb, guide, '작성_가이드');

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
  // 4개 카테고리: Reagent / Calibrator / Control (QC Material) / Consumables
  const headers = [
    'SKU',
    '품목명(Item Name)',
    '구분(Reagent/Calibrator/Control(QC Material)/Consumables)',
    '채널(B2B/B2C)',
    '거래처(Vendor)',
    '단위(Unit)',
  ];
  const rows = [
    ['RG-001', 'PCR Master Mix',                   'Reagent',              'B2B', 'BioTech Co.',  'Kit'],
    ['RG-002', 'RNA Extraction Kit',                'Reagent',              'B2B', 'GeneSys Inc.', 'Kit'],
    ['HS-021', 'Multi-Chemistry Calibrator Set',    'Calibrator',           'B2B', 'Henry Schein', 'Set'],
    ['HS-022', 'Immunoassay Calibrator Set',        'Calibrator',           'B2B', 'Henry Schein', 'Set'],
    ['HS-026', 'Multi-Chemistry QC (3 levels)',     'Control (QC Material)','B2B', 'Henry Schein', 'Set'],
    ['SG-019', 'Allplex™ STI Positive Control Set', 'Control (QC Material)','B2C', 'Seegene Inc.', 'Set'],
    ['CS-001', 'Microcentrifuge Tubes 1.5ml',       'Consumables',          'B2B', 'LabSupply',    'Pack'],
    ['CS-003', 'Pipette Tips 200ul',                'Consumables',          'B2C', 'TipMaster',    'Pack'],
  ];
  const ws = makeSheet(headers, rows, [12, 30, 40, 10, 18, 10]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'SKU_Master');
  // 안내 시트 추가
  const guide = XLSX.utils.aoa_to_sheet([
    ['【카테고리 입력 규칙】'],
    ['구분', '입력값', '설명'],
    ['시약', 'Reagent', 'PCR, ELISA, NGS, 진단 시약 등'],
    ['캘리브레이터', 'Calibrator', '장비 보정용 캘리브레이터 세트'],
    ['QC물질', 'Control (QC Material)', '정도관리 물질 (Positive/Negative Control)'],
    ['소모품', 'Consumables', '튜브, 팁, 플레이트, PPE 등'],
    [],
    ['【채널 입력 규칙】'],
    ['채널', '입력값'],
    ['기관 판매', 'B2B'],
    ['개인/병원 판매', 'B2C'],
  ]);
  guide['!cols'] = [25,30,35].map(w => ({ wch: w }));
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
  downloadQBTemplate();
  downloadFishbowlTemplate();
  downloadPhysicalTemplate();
  downloadSKUMasterTemplate();
  downloadCostCategoryTemplate();
}
