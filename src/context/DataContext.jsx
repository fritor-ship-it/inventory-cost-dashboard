import { createContext, useContext, useState } from 'react';
import {
  MONTHLY_SUMMARY, SKU_MASTER, INVENTORY_DATA,
  EXCEPTIONS, AI_COMMENTARY, MONTHS, COST_CATEGORIES,
} from '../data/mockData';

const DataContext = createContext(null);

const DEMO_DATA = {
  skuMaster: SKU_MASTER,
  costCategories: COST_CATEGORIES,
  inventoryData: INVENTORY_DATA,
  monthlySummary: MONTHLY_SUMMARY,
  exceptions: EXCEPTIONS,
  aiCommentary: AI_COMMENTARY,
  months: MONTHS,
  isDemo: true,
};

const EXCHANGE_RATE = 1350; // 1 USD = 1,350 KRW

export { EXCHANGE_RATE };

export function DataProvider({ children }) {
  const [data, setData] = useState(DEMO_DATA);
  // 전역 기준월 — null이면 마지막 월
  const [selectedMonth, setSelectedMonth] = useState(null);
  // 월별 매출 오버라이드 { 'YYYY-MM': revenueUSD }
  const [revenueData, setRevenueData] = useState({});

  function loadData(parsed) {
    setData({ ...parsed, aiCommentary: AI_COMMENTARY });
    setSelectedMonth(null);
  }

  function resetToDemo() {
    setData(DEMO_DATA);
    setSelectedMonth(null);
    setRevenueData({});
  }

  function setMonthRevenue(month, revenueUSD) {
    setRevenueData(prev => ({ ...prev, [month]: parseFloat(revenueUSD) || 0 }));
  }

  // 매출 오버라이드가 반영된 monthlySummary 계산
  const effectiveSummary = data.monthlySummary.map((m, i) => {
    const overrideUSD = revenueData[m.month];
    if (overrideUSD > 0) {
      const revenueKRW = overrideUSD * EXCHANGE_RATE;
      const costRate = revenueKRW > 0 ? parseFloat((m.totalUsage / revenueKRW).toFixed(4)) : m.costRate;
      return { ...m, revenue: revenueKRW, costRate };
    }
    return m;
  });
  // 전월 대비 변동률 재계산
  for (let i = 1; i < effectiveSummary.length; i++) {
    const prev = effectiveSummary[i-1].costRate;
    const cur  = effectiveSummary[i].costRate;
    effectiveSummary[i].costRateChange = prev
      ? parseFloat(((cur - prev) / prev * 100).toFixed(2)) : 0;
  }

  // 실제 사용할 기준월: 선택된 월 OR 마지막 월
  const currentMonth = selectedMonth || data.months[data.months.length - 1];
  const currentMonthIndex = data.months.indexOf(currentMonth);
  const effectiveIndex = currentMonthIndex >= 0 ? currentMonthIndex : data.months.length - 1;

  // data.monthlySummary를 effectiveSummary로 교체한 data 객체
  const dataWithRevenue = { ...data, monthlySummary: effectiveSummary };

  return (
    <DataContext.Provider value={{
      data: dataWithRevenue,
      loadData, resetToDemo,
      selectedMonth: currentMonth,
      setSelectedMonth,
      monthIndex: effectiveIndex,
      revenueData,
      setMonthRevenue,
      EXCHANGE_RATE,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
