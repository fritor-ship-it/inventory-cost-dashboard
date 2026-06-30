import { SKU_MASTER, INVENTORY_DATA } from './mockData';

// ── 공급업체별 파라미터 ───────────────────────────────────────────────
const VENDOR_PARAMS = {
  'BioTech Co.':    { leadTime: 14, reliability: 0.95 },
  'GeneSys Inc.':   { leadTime: 21, reliability: 0.90 },
  'MediDiag Ltd.':  { leadTime: 28, reliability: 0.85 },
  'SafeCollect':    { leadTime: 10, reliability: 0.98 },
  'NovaBio Inc.':   { leadTime: 14, reliability: 0.92 },
  'LifeSci Corp.':  { leadTime: 21, reliability: 0.88 },
  'ProTech Ltd.':   { leadTime: 18, reliability: 0.90 },
  'DiagMaster Co.': { leadTime: 21, reliability: 0.87 },
  'BioPlus Inc.':   { leadTime: 14, reliability: 0.93 },
  'MolBio Co.':     { leadTime: 28, reliability: 0.85 },
  'LabSupply':      { leadTime: 7,  reliability: 0.99 },
  'TipMaster':      { leadTime: 5,  reliability: 0.99 },
  'SafeGuard':      { leadTime: 7,  reliability: 0.98 },
  'PlastiLab Inc.': { leadTime: 10, reliability: 0.95 },
  'MedSupply Co.':  { leadTime: 14, reliability: 0.93 },
  'LabPro Ltd.':    { leadTime: 7,  reliability: 0.97 },
  'CleanRoom Inc.': { leadTime: 10, reliability: 0.95 },
  'BioPlastic Co.': { leadTime: 7,  reliability: 0.98 },
  'LabGear Inc.':   { leadTime: 10, reliability: 0.95 },
  'SafeLab Corp.':  { leadTime: 7,  reliability: 0.98 },
};

// 월별 계절성 지수 (1월~12월)
const SEASONALITY = [1.2,1.1,1.0,0.9,0.9,0.8,0.8,0.9,1.0,1.1,1.2,1.3];

// 결정론적 난수
function mkRng(seed) {
  let s = seed >>> 0;
  return (min, max) => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return min + (s % (max - min + 1));
  };
}

// AI 자연어 코멘트 생성
function genComment(item) {
  const { name, status, currentStock, optimalStock, safetyStock,
          daysUntilStockout, recommendedOrderQty, leadTimeDays,
          expirationDate, daysToExpiry, monthlyUsage } = item;

  if (status === 'critical') {
    return `${name}는 현재 재고(${currentStock}개)가 안전재고(${safetyStock}개) 이하로 ` +
      `약 ${daysUntilStockout}일 내 소진이 예상됩니다. ` +
      `공급업체 리드타임 ${leadTimeDays}일을 감안하면 즉시 ${recommendedOrderQty}개 발주가 필요합니다.`;
  }
  if (status === 'low') {
    return `${name}는 재주문점에 도달하였습니다. 월평균 사용량 ${monthlyUsage}개 기준 ` +
      `약 ${daysUntilStockout}일 후 소진 예상 — ${recommendedOrderQty}개 발주를 권장합니다.`;
  }
  if (status === 'overstock') {
    const excess = currentStock - optimalStock;
    const months = (excess / Math.max(monthlyUsage, 1)).toFixed(1);
    return `${name}는 적정재고(${optimalStock}개) 대비 ${(currentStock/optimalStock).toFixed(1)}배 보유 중입니다. ` +
      `초과 재고 ${excess}개(${months}개월분)가 있어 향후 발주를 연기하세요.`;
  }
  if (status === 'expiring') {
    return `${name}는 유효기간이 ${expirationDate}까지(${daysToExpiry}일 남음)입니다. ` +
      `신규 구매를 보류하고 기존 재고를 우선 사용하세요.`;
  }
  if (status === 'deadstock') {
    return `${name}는 최근 90일간 사용 기록이 없습니다. ` +
      `Dead Stock 여부를 확인하고 반납 또는 폐기 처리를 검토하세요.`;
  }
  return `${name}는 적정 재고 범위를 유지하고 있습니다. ` +
    `현재 ${currentStock}개 보유 — 월평균 사용량(${monthlyUsage}개) 기준 ${daysUntilStockout}일분 재고입니다.`;
}

// ── 메인 계산 ────────────────────────────────────────────────────────
function compute() {
  const today = new Date('2025-12-31');

  return SKU_MASTER.map((item, idx) => {
    const r = mkRng(idx * 53 + 17);
    const skuData = INVENTORY_DATA[item.sku];
    if (!skuData?.length) return null;

    // 월별 사용량 (qty)
    const usageQtys = skuData.map(row =>
      Math.max(0, (row.openingQty || 0) + (row.purchaseQty || 0) - (row.closingQty || 0))
    );
    const avg12mUsage = usageQtys.reduce((a, b) => a + b, 0) / 12;
    const last3mAvg   = usageQtys.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const last1mUsage = usageQtys[usageQtys.length - 1];
    const dailyUsage  = last1mUsage / 30;

    const trendFactor      = avg12mUsage > 0 ? last3mAvg / avg12mUsage : 1;
    const seasonalityFactor = SEASONALITY[11]; // December

    const currentStock = skuData[skuData.length - 1].closingQty || 0;
    const unitCost     = skuData[0].unitCost || 1;

    const vp = VENDOR_PARAMS[item.vendor] || { leadTime: 14, reliability: 0.90 };
    const leadTimeDays = vp.leadTime;

    // MOQ
    const moq = item.category === 'Reagent'
      ? r(1, 5) * 10
      : r(2, 10) * 50;

    // 유효기간
    const shelfLifeDays = item.category === 'Reagent' ? r(180, 730) : r(730, 1825);
    const isExpiringSoon = item.category === 'Reagent' && r(0, 9) === 0;
    const daysToExpiry = isExpiringSoon ? r(20, 89) : r(90, shelfLifeDays);
    const expDate = new Date(today);
    expDate.setDate(expDate.getDate() + daysToExpiry);
    const expirationDate = expDate.toISOString().split('T')[0];

    // 안전재고 = 일평균 × 리드타임 × 1.5
    const safetyStock = Math.max(1, Math.ceil(dailyUsage * leadTimeDays * 1.5));

    // 재주문점 = 일평균 × 리드타임 + 안전재고
    const reorderPoint = Math.ceil(dailyUsage * leadTimeDays) + safetyStock;

    // 적정재고 = 2개월 × 추세 × 계절성 + 안전재고
    const optimalStock = Math.ceil(avg12mUsage * 2 * Math.min(Math.max(trendFactor, 0.5), 2) * seasonalityFactor) + safetyStock;

    const daysUntilStockout = dailyUsage > 0 ? Math.floor(currentStock / dailyUsage) : 999;

    // 상태 분류
    let status;
    const noUsage = last1mUsage === 0 && avg12mUsage < 0.5;
    if (noUsage)                               status = 'deadstock';
    else if (daysToExpiry < 90)                status = 'expiring';
    else if (currentStock <= safetyStock)      status = 'critical';
    else if (currentStock < reorderPoint)      status = 'low';
    else if (currentStock >= optimalStock * 1.5) status = 'overstock';
    else                                       status = 'optimal';

    // 권장 발주수량
    let recommendedOrderQty = 0;
    if (status === 'critical' || status === 'low') {
      const deficit = optimalStock + safetyStock - currentStock;
      recommendedOrderQty = Math.ceil(Math.max(moq, deficit) / moq) * moq;
    }

    // 예상 발주일
    let recommendedOrderDate = null;
    if (recommendedOrderQty > 0) {
      const daysLeft = Math.max(0, daysUntilStockout - leadTimeDays - 3);
      const od = new Date(today);
      od.setDate(od.getDate() + daysLeft);
      recommendedOrderDate = daysLeft === 0 ? '즉시 발주' : od.toISOString().split('T')[0];
    }

    // 우선순위
    let priority;
    if (status === 'critical' || daysUntilStockout <= leadTimeDays) priority = 'critical';
    else if (status === 'low' || status === 'expiring') priority = 'high';
    else if (status === 'overstock' || status === 'deadstock') priority = 'medium';
    else priority = 'low';

    // 30/60/90일 예측
    const forecast = [30, 60, 90].map(days => {
      const projected = Math.max(0, currentStock - dailyUsage * days);
      return {
        days,
        projectedStock: Math.round(projected),
        belowSafety:  projected < safetyStock,
        belowReorder: projected < reorderPoint,
        stockout:     projected <= 0,
      };
    });

    const result = {
      ...item,
      currentStock,
      unitCost,
      optimalStock,
      safetyStock,
      reorderPoint,
      leadTimeDays,
      moq,
      shelfLifeDays,
      expirationDate,
      daysToExpiry,
      dailyUsage: Math.round(dailyUsage * 10) / 10,
      monthlyUsage: Math.round(avg12mUsage),
      last3mAvg: Math.round(last3mAvg),
      last1mUsage,
      trendFactor: Math.round(trendFactor * 100) / 100,
      seasonalityFactor,
      daysUntilStockout,
      daysOnHand: daysUntilStockout,
      recommendedOrderQty,
      recommendedOrderDate,
      status,
      priority,
      forecast,
      inventoryValue: currentStock * unitCost,
    };
    result.aiComment = genComment(result);
    return result;
  }).filter(Boolean);
}

export const INVENTORY_OPTIM = compute();

// ── 요약 통계 ────────────────────────────────────────────────────────
export const OPTIM_SUMMARY = (() => {
  const d = INVENTORY_OPTIM;

  const cnt = {
    optimal:  d.filter(x => x.status === 'optimal').length,
    low:      d.filter(x => x.status === 'low').length,
    critical: d.filter(x => x.status === 'critical').length,
    overstock:d.filter(x => x.status === 'overstock').length,
    deadstock:d.filter(x => x.status === 'deadstock').length,
    expiring: d.filter(x => x.status === 'expiring').length,
  };

  const totalInvValue   = d.reduce((s, x) => s + x.inventoryValue, 0);
  const overstockValue  = d.filter(x => x.status === 'overstock')
    .reduce((s, x) => s + Math.max(0, x.currentStock - x.optimalStock) * x.unitCost, 0);
  const deadstockValue  = d.filter(x => x.status === 'deadstock')
    .reduce((s, x) => s + x.inventoryValue, 0);
  const expiringValue   = d.filter(x => x.status === 'expiring')
    .reduce((s, x) => s + x.inventoryValue, 0);
  const purchaseRec     = d.filter(x => x.recommendedOrderQty > 0)
    .reduce((s, x) => s + x.recommendedOrderQty * x.unitCost, 0);

  const totalOptimalVal = d.reduce((s, x) => s + x.optimalStock * x.unitCost, 0);
  const optimalCoverage = totalOptimalVal > 0
    ? Math.round(totalInvValue / totalOptimalVal * 100) : 0;

  const usableItems = d.filter(x => x.daysUntilStockout < 999);
  const avgDaysOnHand = usableItems.length
    ? Math.round(usableItems.reduce((s, x) => s + x.daysOnHand, 0) / usableItems.length) : 0;

  const totalMonthlyVal = d.reduce((s, x) => s + x.monthlyUsage * x.unitCost, 0);
  const inventoryTurnover = totalInvValue > 0
    ? parseFloat((totalMonthlyVal * 12 / totalInvValue).toFixed(1)) : 0;

  // AI 건강점수 (100점 기준)
  let healthScore = 100;
  healthScore -= cnt.critical * 5;
  healthScore -= cnt.low      * 2;
  healthScore -= cnt.overstock * 1;
  healthScore -= cnt.expiring  * 3;
  healthScore -= cnt.deadstock * 2;
  healthScore = Math.max(0, Math.min(100, healthScore));

  const urgentItems  = d.filter(x => x.priority === 'critical')
    .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout).slice(0, 5);

  // 30/60/90일 리스크 집계
  const riskTimeline = [30, 60, 90].map(days => ({
    days,
    critical: d.filter(x => x.forecast.find(f => f.days === days)?.stockout).length,
    low:      d.filter(x => {
      const f = x.forecast.find(ff => ff.days === days);
      return f && f.belowReorder && !f.stockout;
    }).length,
  }));

  return {
    cnt, totalInvValue, overstockValue, deadstockValue, expiringValue,
    purchaseRec, optimalCoverage, avgDaysOnHand, inventoryTurnover,
    healthScore, urgentItems, riskTimeline,
    stockoutRisk: cnt.critical + cnt.low,
  };
})();
