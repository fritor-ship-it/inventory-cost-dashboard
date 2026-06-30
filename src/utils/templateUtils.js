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
  const headers = ['날짜(Date)', 'SKU', '품목명(Item Name)', '입고수량', '단가', '입고금액', '현재고수량', '현재고금액'];
  const rows = [
    ['2025-12-31', 'RG-001', 'PCR Master Mix', 10, 45000, 450000, 15, 675000],
    ['2025-12-31', 'RG-002', 'RNA Extraction Kit', 5, 62000, 310000, 8, 496000],
    ['2025-12-31', 'CS-001', 'Microcentrifuge Tubes 1.5ml', 200, 150, 30000, 320, 48000],
  ];
  const ws = makeSheet(headers, rows, [14, 10, 26, 10, 10, 12, 12, 14]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Fishbowl_Inventory');
  download(wb, 'Fishbowl_양식.xlsx');
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
