import * as XLSX from 'xlsx';

function readSheet(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array', cellDates: true });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        resolve(rows);
      } catch (err) { reject(new Error(`파일 읽기 실패: ${err.message}`)); }
    };
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsArrayBuffer(file);
  });
}

function toStr(v) { return String(v ?? '').trim(); }
function toNum(v) { return parseFloat(String(v).replace(/[^0-9.-]/g, '')) || 0; }

function parseDate(v) {
  if (!v) return null;
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  const s = String(v).trim();
  // YYYY-MM-DD 또는 YYYY/MM/DD
  const m1 = s.match(/(\d{4})[-./](\d{1,2})/);
  if (m1) return `${m1[1]}-${String(m1[2]).padStart(2, '0')}`;
  // MM/DD/YYYY (QuickBooks 형식)
  const m2 = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m2) return `${m2[3]}-${String(m2[1]).padStart(2, '0')}`;
  return null;
}

// ── 카테고리 파싱 (4개 체계) ──────────────────────────────────────────
// 실제 Fishbowl Type 값: reagent / control / calibrator / Linearity / consumable / equipment / Lab supplies
function parseCategory(raw) {
  const v = toStr(raw).toLowerCase().trim();
  if (!v || v === 'true' || v === 'false') return 'Reagent'; // 불리언값 기본처리
  if (v === 'calibrator' || v.includes('calibrat') || v.includes('linearity') || v.includes('캘리브')) return 'Calibrator';
  if (v === 'control' || v.includes('control') || v.includes('qc') || v.includes('quality')) return 'Control (QC Material)';
  if (v === 'consumable' || v === 'equipment' || v.includes('consumab') || v.includes('lab suppli') || v.includes('소모품')) return 'Consumables';
  // reagent, 기타 → Reagent
  return 'Reagent';
}

// ── 파서들 ──────────────────────────────────────────────────────────

export async function parseQB(file) {
  const rows = await readSheet(file);
  if (rows.length < 2) throw new Error('QuickBooks 파일에 데이터가 없습니다.');

  // ── QuickBooks Transaction Detail 형식 자동 감지 ──
  // 헤더: [null, 'Transaction date', 'Transaction type', ...]
  const h = rows[0] || [];
  const isQBTransDetail = toStr(h[1]).toLowerCase().includes('transaction date');

  if (isQBTransDetail) {
    // Col A: Vendor(그룹헤더), Col B: 날짜(MM/DD/YYYY), Col C: Type, Col D: Num
    // Col E: Product/Service, Col F: Description(SKU), Col G: Qty, Col H: Rate, Col I: Amount
    const result = [];
    let currentVendor = '';
    for (const row of rows.slice(1)) {
      // 거래처 헤더 행: Col A에 값, Col B 없음
      if (row[0] && !row[1]) {
        currentVendor = toStr(row[0]);
        continue;
      }
      // 거래 행: Col B에 날짜, Col C에 거래유형
      const date = parseDate(row[1]);
      const txnType = toStr(row[2]);
      if (!date || !txnType || txnType === 'Transaction type') continue;
      const amount = toNum(row[8]); // Amount
      if (amount <= 0) continue;

      const productName = toStr(row[4]); // Product/Service full name
      const description  = toStr(row[5]); // Description (often SKU)
      const qty          = toNum(row[6]);
      const rate         = toNum(row[7]);

      result.push({
        month: date,
        vendor: currentVendor,
        name: productName || description,
        sku: description || productName,  // Description에 SKU 입력 권장
        qty: qty || 0,
        unitCost: rate || (qty > 0 ? amount / qty : amount),
        amount,
        account: txnType,
      });
    }
    return result.filter(r => r.month && r.amount > 0);
  }

  // ── 레거시 형식 (날짜·거래처·품목명·SKU...) ──
  const data = rows.slice(1).filter(r => r[0]);
  return data.map(r => ({
    month: parseDate(r[0]),
    vendor: toStr(r[1]),
    name: toStr(r[2]),
    sku: toStr(r[3]),
    qty: toNum(r[4]),
    unitCost: toNum(r[5]),
    amount: toNum(r[6]),
    account: toStr(r[7]),
  })).filter(r => r.month && r.amount > 0);
}

export async function parseFishbowl(file) {
  const rows = await readSheet(file);
  if (rows.length < 2) throw new Error('Fishbowl 파일에 데이터가 없습니다.');

  // ── Fishbowl Inventory Valuation Summary 형식 자동 감지 ──
  const title = toStr(rows[0]?.[0]);
  if (title.toLowerCase().includes('inventory valuation summary')) {
    return parseFishbowlIVS(rows);
  }

  // ── 레거시 형식 (날짜·SKU·품목명·입고수량...) ──
  const data = rows.slice(1).filter(r => r[0]);
  return data.map(r => ({
    month: parseDate(r[0]),
    sku: toStr(r[1]),
    name: toStr(r[2]),
    vendor: '',
    category: 'Reagent',
    channel: 'B2B',
    receiptQty: toNum(r[3]),
    unitCostUSD: 0,
    unitCost: toNum(r[4]),
    receiptAmount: toNum(r[5]),
    stockQty: toNum(r[6]),
    stockValue: toNum(r[7]),
    closingQty: toNum(r[6]),
    closingValue: toNum(r[7]),
    department: '',
    itemTags: '',
  })).filter(r => r.month && r.sku);
}

// ── Fishbowl IVS 전용 파서 ─────────────────────────────────────────
// 형식: Row1=제목, Row2=날짜, Row3=빈행, Row4=헤더, Row5+=데이터
function parseFishbowlIVS(rows, exchangeRate = 1350) {
  // 보고 기준일 추출 (Row 2)
  const reportDate = rows[1]?.[0];
  const reportMonth = parseDate(reportDate) || '';

  // 헤더 찾기 (Item Name이 있는 행)
  let headerIdx = 3;
  for (let i = 0; i < rows.length; i++) {
    if (toStr(rows[i]?.[0]).toLowerCase() === 'item name') { headerIdx = i; break; }
  }

  // 데이터 행: Item SKU(col C, index 2)가 있는 행만
  const dataRows = rows.slice(headerIdx + 1).filter(r => r[2] && toStr(r[2]).trim());

  return dataRows.map(r => {
    const qty       = toNum(r[3]);
    const unitCostUSD = toNum(r[5]);
    const assetUSD  = toNum(r[6]) || qty * unitCostUSD;
    const unitCostKRW  = unitCostUSD * exchangeRate;
    const assetKRW  = assetUSD * exchangeRate;

    // Type → 4개 카테고리 매핑
    const rawType = toStr(r[10]);
    const category = parseCategory(rawType);

    // Vendor: Item Description (col B) 우선, Item Tags에서 추출
    const vendor = toStr(r[1]) || extractVendorFromTags(toStr(r[7]));

    return {
      month:       reportMonth,
      sku:         toStr(r[2]),
      name:        toStr(r[0]),
      vendor,
      category,
      channel:     toStr(r[11]).toUpperCase().includes('B2B') ? 'B2B' : 'B2C',
      department:  toStr(r[8]),
      itemTags:    toStr(r[7]),
      notes:       toStr(r[9]),
      uom:         toStr(r[4]),
      unitCostUSD,
      unitCost:    unitCostKRW,
      stockQty:    qty,
      stockValue:  assetKRW,
      // 기말재고 (현재 보유)
      closingQty:  qty,
      closingValue:assetKRW,
      // 입고 데이터 없음 (IVS는 스냅샷)
      receiptQty: 0,
      receiptAmount: 0,
    };
  }).filter(r => r.sku);
}

function extractVendorFromTags(tags) {
  if (!tags) return '';
  const parts = tags.split('|||');
  return parts.length > 1 ? parts[parts.length - 1].trim() : '';
}

export async function parsePhysical(file) {
  const rows = await readSheet(file);
  if (rows.length < 2) throw new Error('월말 실사 파일에 데이터가 없습니다.');
  const data = rows.slice(1).filter(r => r[0]);
  return data.map(r => ({
    month: toStr(r[0]).trim(),
    sku: toStr(r[1]),
    name: toStr(r[2]),
    openingQty: toNum(r[3]),
    openingValue: toNum(r[4]),
    closingQty: toNum(r[5]),
    closingValue: toNum(r[6]),
    notes: toStr(r[7]),
  })).filter(r => r.month && r.sku);
}

export async function parseSKUMaster(file) {
  if (!file) return [];
  const rows = await readSheet(file);
  if (rows.length < 2) return [];

  const header = rows[0] || [];
  const h0 = toStr(header[0]).replace('*','').toLowerCase().trim();
  const h1 = toStr(header[1]).toLowerCase().trim();

  // ── 실제 양식: *Item-Name(col A) | Item-Sku(col B) | Type(col C) | B2B/B2C(col D) | Vendor(col E) ──
  const isActualFormat = h0.includes('item') && h0.includes('name') && h1.includes('sku');

  const data = rows.slice(1).filter(r => r[0] || r[1]);

  if (isActualFormat) {
    return data.map(r => ({
      name:     toStr(r[0]),                   // *Item-Name
      sku:      toStr(r[1]),                   // Item-Sku
      category: parseCategory(r[2]),           // Type (reagent/calibrator/control/consumable)
      channel:  toStr(r[3]).toUpperCase().includes('B2B') ? 'B2B' : 'B2C',
      vendor:   toStr(r[4]),                   // Vendor
      unit:     toStr(r[5]) || '',             // Department / Unit
    })).filter(r => r.sku && r.name);
  }

  // ── 레거시 양식: SKU(col A) | Name(col B) | Category(col C) | Channel(col D) | Vendor(col E) ──
  return data.map(r => ({
    sku:      toStr(r[0]),
    name:     toStr(r[1]),
    category: parseCategory(r[2]),
    channel:  toStr(r[3]).toUpperCase().includes('B2B') ? 'B2B' : 'B2C',
    vendor:   toStr(r[4]),
    unit:     toStr(r[5]) || '',
  })).filter(r => r.sku && r.name);
}

export async function parseCostCategory(file) {
  if (!file) return []; // 선택 파일 — 없으면 빈 배열 반환
  const rows = await readSheet(file);
  if (rows.length < 2) return [];
  const data = rows.slice(1).filter(r => r[0]);
  return data.map(r => ({
    code: toStr(r[0]),
    name: toStr(r[1]),
    type: parseCategory(r[2]),
    glAccount: toStr(r[3]),
  })).filter(r => r.code);
}

// ── 이상탐지 ────────────────────────────────────────────────────────

function detectExceptions(skuMaster, inventoryBySkuMonth, qbBySkuMonth, fbBySkuMonth, months) {
  const exceptions = [];
  let id = 1;
  const skuSet = new Set(skuMaster.map(s => s.sku));

  // QB에 있는데 SKU 마스터에 없는 품목
  for (const sku of Object.keys(qbBySkuMonth)) {
    if (sku && !skuSet.has(sku)) {
      exceptions.push({
        id: id++, type: 'NO_LEDGER', severity: 'medium', sku,
        name: qbBySkuMonth[sku]?.name || sku,
        message: 'QB 입고 기록은 있으나 SKU 마스터에 없는 품목',
        month: months[months.length - 1], action: 'SKU 마스터 등록 필요',
      });
    }
  }

  months.forEach(month => {
    skuMaster.forEach(s => {
      const inv = inventoryBySkuMonth[s.sku]?.[month];
      const qb = qbBySkuMonth[s.sku]?.[month] || 0;
      const fb = fbBySkuMonth[s.sku]?.[month]?.receiptAmount || 0;

      if (qb > 0 && fb > 0) {
        const diff = Math.abs(qb - fb);
        const pct = diff / Math.max(qb, fb);
        if (diff > 100000 || pct > 0.05) {
          exceptions.push({
            id: id++, type: 'QB_FB_DIFF',
            severity: diff > 500000 ? 'high' : 'medium',
            sku: s.sku, name: s.name,
            message: `QB 입고 ${qb.toLocaleString()}원 vs FB 입고 ${fb.toLocaleString()}원 (차이: ${diff.toLocaleString()}원)`,
            month, action: '전표 재확인 필요',
          });
        }
      }

      if (!inv || (inv.closingValue === 0 && inv.closingQty === 0 && qb > 0)) {
        exceptions.push({
          id: id++, type: 'MISSING_CLOSING', severity: 'medium',
          sku: s.sku, name: s.name,
          message: '기말재고 미기재 (실사표 확인 필요)',
          month, action: '실사 담당자 확인',
        });
      }
    });
  });

  for (let i = 1; i < months.length; i++) {
    const cur = months[i], prv = months[i - 1];
    skuMaster.forEach(s => {
      const curUsage = inventoryBySkuMonth[s.sku]?.[cur]?.usageValue || 0;
      const prvUsage = inventoryBySkuMonth[s.sku]?.[prv]?.usageValue || 0;
      if (prvUsage > 50000 && curUsage > 0) {
        const chg = (curUsage - prvUsage) / prvUsage * 100;
        if (Math.abs(chg) >= 30) {
          exceptions.push({
            id: id++, type: 'VARIANCE_30', severity: 'medium',
            sku: s.sku, name: s.name,
            message: `전월 대비 ${chg > 0 ? '+' : ''}${chg.toFixed(1)}% 변동`,
            month: cur, action: '수요 변동 원인 파악',
          });
        }
      }
    });
  }

  return exceptions.slice(0, 30);
}

// ── 메인 처리 함수 ───────────────────────────────────────────────────

export async function processUploadedFiles(files) {
  // 3개 필수 파일: Fishbowl 재고대장, QuickBooks, SKU Master
  const [fbRaw, qbRaw, skuRaw] = await Promise.all([
    parseFishbowl(files.fishbowl),
    parseQB(files.qb),
    parseSKUMaster(files.sku),
  ]);

  if (fbRaw.length === 0) throw new Error('Fishbowl 재고대장에 유효한 데이터가 없습니다.');
  if (qbRaw.length === 0) throw new Error('QuickBooks 파일에 유효한 데이터가 없습니다.');

  // Fishbowl IVS 여부 확인
  const isFishbowlIVS = fbRaw[0]?.category !== undefined;

  // SKU Master: 파일이 없거나 비어 있으면 Fishbowl IVS로 자동 생성
  let finalSku = skuRaw;
  if (finalSku.length === 0) {
    if (!isFishbowlIVS) throw new Error('SKU Master 파일에 유효한 데이터가 없습니다.');
    const seen = new Set();
    finalSku = fbRaw.filter(r => { if (seen.has(r.sku)) return false; seen.add(r.sku); return true; })
      .map(r => ({ sku: r.sku, name: r.name, category: r.category, channel: r.channel, vendor: r.vendor, unit: r.uom || '' }));
  }

  if (finalSku.length === 0) throw new Error('SKU Master를 구성할 수 없습니다. Fishbowl 파일을 확인해 주세요.');

  // 월 목록: QB + Fishbowl IVS 날짜 기준
  const monthSet = new Set([
    ...qbRaw.map(r => r.month),
    ...(isFishbowlIVS ? fbRaw.map(r => r.month) : []),
  ].filter(Boolean));
  const months = [...monthSet].sort();

  if (months.length === 0) throw new Error('유효한 날짜가 없습니다. QuickBooks 파일의 날짜 형식(YYYY-MM-DD)을 확인해 주세요.');

  const physRaw  = []; // 월말 실사 파일 미사용
  const costRaw  = []; // Cost Category 파일 미사용

  // QB 집계
  const qbBySkuMonth = {};
  qbRaw.forEach(r => {
    if (!qbBySkuMonth[r.sku]) qbBySkuMonth[r.sku] = { name: r.name };
    qbBySkuMonth[r.sku][r.month] = (qbBySkuMonth[r.sku][r.month] || 0) + r.amount;
  });

  // Fishbowl 집계
  const fbBySkuMonth = {};
  fbRaw.forEach(r => {
    if (!fbBySkuMonth[r.sku]) fbBySkuMonth[r.sku] = {};
    if (!fbBySkuMonth[r.sku][r.month]) {
      fbBySkuMonth[r.sku][r.month] = { receiptAmount: 0, stockQty: r.stockQty, stockValue: r.stockValue };
    }
    fbBySkuMonth[r.sku][r.month].receiptAmount += r.receiptAmount;
  });

  // 실사 집계
  const physBySkuMonth = {};
  physRaw.forEach(r => {
    if (!physBySkuMonth[r.sku]) physBySkuMonth[r.sku] = {};
    physBySkuMonth[r.sku][r.month] = r;
  });

  // Fishbowl IVS: 기말재고를 physBySkuMonth에 자동 반영
  if (isFishbowlIVS && fbRaw.length > 0) {
    const fbMonth = fbRaw[0].month;
    if (fbMonth) {
      fbRaw.forEach(r => {
        if (!physBySkuMonth[r.sku]) physBySkuMonth[r.sku] = {};
        if (!physBySkuMonth[r.sku][fbMonth]) {
          physBySkuMonth[r.sku][fbMonth] = {
            month: fbMonth, sku: r.sku, name: r.name,
            openingQty: 0, openingValue: 0,
            closingQty: r.closingQty,
            closingValue: r.closingValue,
            notes: r.notes || '',
          };
        }
      });
      // IVS 월이 months 목록에 없으면 추가
      if (!months.includes(fbMonth)) months.push(fbMonth);
      months.sort();
    }
  }

  // 재고수불부 생성
  const inventoryData = {};
  const inventoryBySkuMonth = {};

  finalSku.forEach(s => {
    inventoryData[s.sku] = months.map(month => {
      const phys = physBySkuMonth[s.sku]?.[month] || {};
      const qbAmt = qbBySkuMonth[s.sku]?.[month] || 0;
      const openingValue = phys.openingValue || 0;
      const openingQty   = phys.openingQty   || 0;
      const closingValue = phys.closingValue || 0;
      const closingQty   = phys.closingQty   || 0;
      const purchaseValue = qbAmt;
      const purchaseQty  = openingQty > 0 ? Math.round(qbAmt / (openingValue / openingQty)) : 0;
      const usageValue   = Math.max(0, openingValue + purchaseValue - closingValue);

      const row = {
        month, sku: s.sku, name: s.name,
        category: s.category, channel: s.channel,
        unitCost: openingQty > 0 ? Math.round(openingValue / openingQty) : 0,
        openingQty, openingValue, purchaseQty, purchaseValue,
        closingQty, closingValue, usageValue,
        qbPurchase: qbAmt,
        fbPurchase: fbBySkuMonth[s.sku]?.[month]?.receiptAmount || 0,
      };

      if (!inventoryBySkuMonth[s.sku]) inventoryBySkuMonth[s.sku] = {};
      inventoryBySkuMonth[s.sku][month] = row;
      return row;
    });
  });

  // 월별 요약 — 4개 카테고리 전부 집계
  const monthlySummary = months.map((month, i) => {
    let totalOpening=0, totalPurchase=0, totalClosing=0, totalUsage=0;
    let b2bUsage=0, b2cUsage=0;
    let reagentOnly=0, calibratorUsage=0, controlUsage=0, consumablesUsage=0;

    finalSku.forEach(s => {
      const row = inventoryBySkuMonth[s.sku]?.[month];
      if (!row) return;
      totalOpening   += row.openingValue;
      totalPurchase  += row.purchaseValue;
      totalClosing   += row.closingValue;
      totalUsage     += row.usageValue;
      if (s.channel === 'B2B') b2bUsage += row.usageValue; else b2cUsage += row.usageValue;
      const cat = s.category;
      if      (cat === 'Reagent')               reagentOnly      += row.usageValue;
      else if (cat === 'Calibrator')            calibratorUsage  += row.usageValue;
      else if (cat === 'Control (QC Material)') controlUsage     += row.usageValue;
      else                                      consumablesUsage += row.usageValue;
    });

    // 하위 호환 필드
    const reagentUsage   = reagentOnly + calibratorUsage + controlUsage;
    const consumableUsage = consumablesUsage;

    // 목표 원가율 기반 매출 (계절성 반영)
    const TARGET = [0.385,0.372,0.356,0.331,0.318,0.307,0.315,0.328,0.341,0.352,0.368,0.382];
    const monthIdx = parseInt(month.slice(5)) - 1;
    const targetRate = TARGET[monthIdx] || 0.35;
    const revenue  = totalUsage > 0 ? totalUsage / targetRate : 0;
    const costRate = revenue > 0 ? parseFloat((totalUsage / revenue).toFixed(4)) : 0;

    return {
      month, totalOpening, totalPurchase, totalClosing, totalUsage,
      b2bUsage, b2cUsage,
      reagentUsage,     // 하위 호환 (Reagent+Cal+Control)
      consumableUsage,  // 하위 호환 (Consumables only)
      reagentOnly, calibratorUsage, controlUsage, consumablesUsage,
      revenue, costRate, costRateChange: 0,
    };
  });

  for (let i = 1; i < monthlySummary.length; i++) {
    const prev = monthlySummary[i-1].costRate;
    const cur  = monthlySummary[i].costRate;
    monthlySummary[i].costRateChange = prev
      ? parseFloat(((cur - prev) / prev * 100).toFixed(2)) : 0;
  }

  const exceptions = detectExceptions(finalSku, inventoryBySkuMonth, qbBySkuMonth, fbBySkuMonth, months);

  return {
    skuMaster: finalSku,
    costCategories: costRaw,
    inventoryData,
    monthlySummary,
    exceptions,
    months,
    isDemo: false,
  };
}
