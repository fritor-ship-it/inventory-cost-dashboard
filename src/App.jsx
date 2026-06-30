import { useState } from 'react';
import Sidebar from './components/Sidebar';
import UploadModal from './components/UploadModal';
import DashboardTab from './tabs/DashboardTab';
import LedgerTab from './tabs/LedgerTab';
import CostTab from './tabs/CostTab';
import B2BTab from './tabs/B2BTab';
import SKUMappingTab from './tabs/SKUMappingTab';
import InventoryOptTab from './tabs/InventoryOptTab';
import ReagentTab from './tabs/ReagentTab';
import ExceptionTab from './tabs/ExceptionTab';
import AITab from './tabs/AITab';
import SettingsTab from './tabs/SettingsTab';
import { DataProvider, useData } from './context/DataContext';
import {
  downloadQBTemplate, downloadFishbowlTemplate, downloadPhysicalTemplate,
  downloadSKUMasterTemplate, downloadCostCategoryTemplate, downloadAllTemplates,
} from './utils/templateUtils';
import { exportInventoryLedger, exportCostAnalysis, exportExceptions } from './utils/exportUtils';

const TAB_COMPONENTS = {
  dashboard:    DashboardTab,
  ledger:       LedgerTab,
  'sku-mapping':SKUMappingTab,
  'inv-optim':  InventoryOptTab,
  cost:         CostTab,
  'b2b-b2c':    B2BTab,
  reagent:      ReagentTab,
  exceptions:   ExceptionTab,
  ai:           AITab,
  settings:     SettingsTab,
};

function AppInner() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadMonth, setUploadMonth] = useState('');
  const { data } = useData();
  const ActiveComponent = TAB_COMPONENTS[activeTab];

  function handleDownload(key) {
    const latest = data.monthlySummary?.[data.monthlySummary.length - 1];
    const allRows = data.skuMaster.map(s => {
      const arr = data.inventoryData[s.sku];
      return arr ? { ...s, ...arr[arr.length - 1] } : null;
    }).filter(Boolean);

    if (key === 'all')          downloadAllTemplates();
    else if (key === 'qb')      downloadQBTemplate();
    else if (key === 'fishbowl')downloadFishbowlTemplate();
    else if (key === 'physical')downloadPhysicalTemplate();
    else if (key === 'sku')     downloadSKUMasterTemplate();
    else if (key === 'cost')    downloadCostCategoryTemplate();
    else if (key === 'ledger')  exportInventoryLedger(allRows, latest?.month || '');
    else if (key === 'costAnalysis') exportCostAnalysis(data.monthlySummary);
    else if (key === 'exceptions')   exportExceptions(data.exceptions);
  }

  return (
    <div className="flex min-h-screen bg-[#0f1117]">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        exceptionCount={data.exceptions.filter(e => e.severity === 'high').length}
        onUpload={(month) => { setUploadMonth(month); setShowUpload(true); }}
        onDownload={handleDownload}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 헤더 — 데이터 상태 표시만 */}
        <header className="border-b border-[#1e2638] bg-[#0f1117] px-6 py-3 flex items-center shrink-0">
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-1.5 h-1.5 rounded-full ${data.isDemo ? 'bg-amber-400' : 'bg-emerald-400'}`} />
            <span className="text-[#4b5a7a]">
              {data.isDemo ? '샘플 데이터' : '업로드 데이터'} · {data.months[data.months.length - 1]} 기준
            </span>
            {!data.isDemo && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium ml-1">
                실제 데이터
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-[1400px]">
            <ActiveComponent />
          </div>
        </main>
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} targetMonth={uploadMonth} />}
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppInner />
    </DataProvider>
  );
}
