import * as XLSX from 'xlsx';

// Blob + anchor 방식 — 브라우저에서 파일명이 정확하게 저장됨
function saveExcel(wb, filename) {
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 150);
}

export function exportInventoryLedger(data, month) {
  const rows = data.map(r => ({
    '월': r.month, 'SKU': r.sku, '품목명': r.name,
    '구분': r.category, '채널': r.channel,
    '기초재고(원)': r.openingValue, '당월입고(원)': r.purchaseValue,
    '기말재고(원)': r.closingValue, '사용액(원)': r.usageValue,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [10,12,28,16,8,14,14,14,14].map(w=>({wch:w}));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '재고수불부');
  saveExcel(wb, `재고수불부_${month || 'export'}.xlsx`);
}

export function exportCostAnalysis(summary) {
  const rows = (summary || []).map(r => ({
    '월': r.month,
    '총사용액': r.totalUsage,
    'B2B재료비': r.b2bUsage,
    'B2C재료비': r.b2cUsage,
    'Reagent재료비': r.reagentUsage,
    'Consumable재료비': r.consumableUsage,
    '매출액': r.revenue,
    '원가율(%)': (r.costRate * 100).toFixed(2),
    '전월대비(%)': r.costRateChange,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [10,14,14,14,16,18,14,12,12].map(w=>({wch:w}));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '원가분석');
  saveExcel(wb, '원가분석_월별.xlsx');
}

export function exportExceptions(exceptions) {
  const rows = (exceptions || []).map(e => ({
    'ID': e.id, '유형': e.type, '심각도': e.severity,
    'SKU': e.sku, '품목명': e.name, '내용': e.message,
    '월': e.month, '조치': e.action,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [6,16,10,12,26,40,10,24].map(w=>({wch:w}));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '이상항목');
  saveExcel(wb, '이상항목_리스트.xlsx');
}

export function formatKRW(value) {
  if (!value && value !== 0) return '-';
  if (Math.abs(value) >= 100000000) return `₩${(value / 100000000).toFixed(1)}억`;
  if (Math.abs(value) >= 10000) return `₩${(value / 10000).toFixed(0)}만`;
  return `₩${value.toLocaleString()}`;
}

export function formatNum(value, decimals = 0) {
  if (!value && value !== 0) return '-';
  return value.toLocaleString('ko-KR', { maximumFractionDigits: decimals });
}
