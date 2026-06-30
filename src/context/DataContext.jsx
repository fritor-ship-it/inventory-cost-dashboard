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

  function loadData(parsed) {
    setData({
      ...parsed,
      aiCommentary: AI_COMMENTARY, // AI 코멘트는 고정
    });
  }

  function resetToDemo() {
    setData(DEMO_DATA);
  }

  return (
    <DataContext.Provider value={{ data, loadData, resetToDemo }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside DataProvider');
  return ctx;
}
