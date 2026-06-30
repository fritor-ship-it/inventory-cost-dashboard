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

export function DataProvider({ children }) {
  const [data, setData] = useState(DEMO_DATA);
  // 전역 기준월 — null이면 마지막 월
  const [selectedMonth, setSelectedMonth] = useState(null);

  function loadData(parsed) {
    setData({ ...parsed, aiCommentary: AI_COMMENTARY });
    // 새 데이터 로드 시 마지막 월로 리셋
    setSelectedMonth(null);
  }

  function resetToDemo() {
    setData(DEMO_DATA);
    setSelectedMonth(null);
  }

  // 실제 사용할 기준월: 선택된 월 OR 마지막 월
  const currentMonth = selectedMonth || data.months[data.months.length - 1];
  const currentMonthIndex = data.months.indexOf(currentMonth);
  const effectiveIndex = currentMonthIndex >= 0 ? currentMonthIndex : data.months.length - 1;

  return (
    <DataContext.Provider value={{
      data, loadData, resetToDemo,
      selectedMonth: currentMonth,
      setSelectedMonth,
      monthIndex: effectiveIndex,
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
