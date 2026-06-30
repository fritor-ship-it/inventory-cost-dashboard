import * as XLSX from 'xlsx';

// Excel 다운로드 — octet-stream 강제 다운로드 + 완료 토스트
function saveExcel(wb, filename) {
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  // octet-stream: 브라우저가 '열기' 대신 무조건 '저장'으로 처리
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.style.cssText = 'position:fixed;top:-200px;left:-200px;opacity:0;pointer-events:none';
  a.href = url;
  a.setAttribute('download', filename);  // setAttribute 방식이 더 호환성 높음
  document.body.appendChild(a);
  a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showDownloadToast(filename);
  }, 1000);
}

// 다운로드 완료 토스트 알림
function showDownloadToast(filename) {
  // 기존 토스트 제거
  const prev = document.getElementById('dl-toast');
  if (prev) prev.remove();

  const toast = document.createElement('div');
  toast.id = 'dl-toast';
  toast.style.cssText = `
    position:fixed; bottom:28px; right:28px; z-index:9999;
    background:#131720; border:1px solid #1e2638;
    border-left:3px solid #34d399;
    padding:14px 18px; border-radius:4px;
    display:flex; align-items:flex-start; gap:12px;
    box-shadow:0 8px 32px rgba(0,0,0,.5);
    animation: slideIn .25s ease;
    max-width:320px;
  `;
  toast.innerHTML = `
    <style>@keyframes slideIn{from{transform:translateX(20px);opacity:0}to{transform:none;opacity:1}}</style>
    <span style="color:#34d399;font-size:16px;margin-top:1px">✓</span>
    <div>
      <div style="color:#e2e8f0;font-size:12px;font-weight:600;margin-bottom:3px">다운로드 완료</div>
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
}

export function exportInventoryLedger(data, month) {
  const toUSD = v => v ? Math.round(v / EXCHANGE_RATE) : 0;
  const rows = data.map(r => ({
    'Month': r.month, 'SKU': r.sku, 'Item Name': r.name,
    'Category': r.category, 'Channel': r.channel,
    'Opening($)': toUSD(r.openingValue), 'Purchase($)': toUSD(r.purchaseValue),
    'Closing($)': toUSD(r.closingValue), 'Usage($)': toUSD(r.usageValue),
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [10,12,28,16,8,14,14,14,14].map(w=>({wch:w}));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '재고수불부');
  saveExcel(wb, `재고수불부_${month || 'export'}.xlsx`);
}

export function exportCostAnalysis(summary) {
  const toUSD = v => v ? Math.round(v / EXCHANGE_RATE) : 0;
  const rows = (summary || []).map(r => ({
    'Month': r.month,
    'Total Usage($)': toUSD(r.totalUsage),
    'B2B Usage($)': toUSD(r.b2bUsage),
    'B2C Usage($)': toUSD(r.b2cUsage),
    'Reagent($)': toUSD(r.reagentUsage),
    'Consumable($)': toUSD(r.consumableUsage),
    'Revenue($)': toUSD(r.revenue),
    'Cost Rate(%)': (r.costRate * 100).toFixed(2),
    'MoM Change(%)': r.costRateChange,
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

// 환율: 1 USD = 1,350 KRW (내부 데이터는 KRW, 표시는 USD)
const EXCHANGE_RATE = 1350;

export function formatKRW(value) {
  if (!value && value !== 0) return '-';
  const usd = value / EXCHANGE_RATE;
  if (Math.abs(usd) >= 1000000) return `$${(usd / 1000000).toFixed(2)}M`;
  if (Math.abs(usd) >= 1000)    return `$${(usd / 1000).toFixed(1)}K`;
  if (Math.abs(usd) >= 1)       return `$${usd.toFixed(0)}`;
  return `$${usd.toFixed(2)}`;
}

// alias
export const formatUSD = formatKRW;

export function formatNum(value, decimals = 0) {
  if (!value && value !== 0) return '-';
  return value.toLocaleString('ko-KR', { maximumFractionDigits: decimals });
}
