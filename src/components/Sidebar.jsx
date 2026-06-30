import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, BookOpen, GitMerge, BarChart2, Users, FlaskConical,
  AlertTriangle, Bot, Settings, PackageSearch,
  Upload, Download, FileSpreadsheet, Table2, ChevronDown, Calendar, Info,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'intro',        label: '소개자료',               icon: Info },
  { id: 'dashboard',    label: 'Dashboard',             icon: LayoutDashboard },
  { id: 'ai',           label: 'AI Commentary',         icon: Bot },
  { id: 'inv-optim',    label: 'Inventory Optimization',icon: PackageSearch, badge: 'AI' },
  { id: 'ledger',       label: 'Inventory Ledger',      icon: BookOpen },
  { id: 'sku-mapping',  label: 'SKU Mapping',           icon: GitMerge },
  { id: 'cost',         label: 'Cost Analysis',         icon: BarChart2 },
  { id: 'b2b-b2c',      label: 'B2B / B2C Analysis',   icon: Users },
  { id: 'reagent',      label: 'Category Analysis',     icon: FlaskConical },
  { id: 'exceptions',   label: 'Exception List',        icon: AlertTriangle },
  { id: 'settings',     label: 'Settings / Master',     icon: Settings },
];

// 연도 목록 (2023 ~ 내년)
const currentYear = 2025;
const YEARS = [2023, 2024, 2025, 2026];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

// ── 다운로드 드롭다운 ─────────────────────────────────────────────────
function DownloadMenu({ onDownload }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const ITEMS = [
    { section: '📋 양식 (Template)', list: [
      { label: '전체 양식 한번에 (3개)', key: 'all',      accent: true },
      { label: 'Fishbowl 재고대장 양식', key: 'fishbowl' },
      { label: 'QuickBooks 양식',        key: 'qb' },
      { label: 'SKU Master 양식',        key: 'sku' },
    ]},
    { section: '📊 결과물 (Export)', list: [
      { label: '전체 결과물 한번에 (3개)', key: 'allResults', accent: true },
      { label: '재고수불부 Excel',         key: 'ledger' },
      { label: '원가분석 Excel',           key: 'costAnalysis' },
      { label: '이상항목 리스트 Excel',    key: 'exceptions' },
    ]},
  ];

  return (
    <div className="relative" ref={ref}>
      {open && (
        <div className="absolute bottom-full left-0 mb-1 w-56 bg-[#131720] border border-[#1e2638] rounded-xl shadow-2xl z-50 overflow-hidden">
          {ITEMS.map(({ section, list }) => (
            <div key={section}>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-[#3b4768] bg-[#0f1117] border-b border-[#1e2638]">{section}</div>
              {list.map(({ label, key, accent }) => (
                <button key={key} onClick={() => { onDownload(key); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors text-left
                    ${accent ? 'text-indigo-400 hover:bg-indigo-500/10 font-semibold' : 'text-[#a0b0cc] hover:bg-[#1a2035] hover:text-white'}`}>
                  {accent
                    ? <FileSpreadsheet size={11} className="text-indigo-400 shrink-0" />
                    : <Table2 size={11} className="text-[#4b5a7a] shrink-0" />}
                  {label}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
      <button onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all
          ${open ? 'bg-[#1e2a42] text-emerald-400' : 'text-[#6b7a9a] hover:bg-[#1a2035] hover:text-[#a0b0cc]'}`}>
        <Download size={14} className={open ? 'text-emerald-400' : ''} />
        <span className="flex-1">Excel 다운로드</span>
        <ChevronDown size={11} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
}

// ── 메인 사이드바 ─────────────────────────────────────────────────────
export default function Sidebar({ activeTab, onTabChange, exceptionCount, onUpload, onDownload }) {
  const [year, setYear]   = useState(2025);
  const [month, setMonth] = useState(12);

  const selectedMonth = `${year}-${String(month).padStart(2, '0')}`;

  return (
    <aside className="w-56 h-screen bg-[#131720] border-r border-[#1e2638] flex flex-col shrink-0">

      {/* 로고 */}
      <div className="px-5 py-4 border-b border-[#1e2638] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">IC</div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">재고/원가관리</div>
            <div className="text-[#4b5a7a] text-[11px]">대시보드</div>
          </div>
        </div>
      </div>

      {/* 네비게이션 */}
      <nav className="py-2 px-2 space-y-0.5 shrink-0">
        {NAV_ITEMS.map(({ id, label, icon: Icon, badge }) => {
          const isActive = activeTab === id;
          return (
            <button key={id} onClick={() => onTabChange(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all
                ${isActive ? 'bg-[#1e2a42] text-white font-medium' : 'text-[#6b7a9a] hover:bg-[#1a2035] hover:text-[#a0b0cc]'}`}>
              <Icon size={14} className={isActive ? 'text-indigo-400' : ''} />
              <span className="flex-1 truncate text-xs">{label}</span>
              {badge && (
                <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold shrink-0">{badge}</span>
              )}
              {id === 'exceptions' && exceptionCount > 0 && (
                <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold shrink-0">{exceptionCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Settings 바로 아래: 연월 + 업로드/다운로드 ── */}
      <div className="mx-2 border border-[#1e2638] rounded-xl bg-[#0f1117] px-3 py-3 space-y-2.5 shrink-0">

        {/* 연월 선택 */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Calendar size={11} className="text-[#4b5a7a]" />
            <span className="text-[10px] text-[#4b5a7a] font-medium">업로드 기준월</span>
          </div>
          <div className="flex gap-1.5">
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              className="flex-1 bg-[#1a2235] border border-[#1e2638] text-[#a0b0cc] text-[11px] rounded-lg px-2 py-1.5 outline-none hover:border-indigo-500/40 transition-colors">
              {YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
            </select>
            <select value={month} onChange={e => setMonth(Number(e.target.value))}
              className="flex-1 bg-[#1a2235] border border-[#1e2638] text-[#a0b0cc] text-[11px] rounded-lg px-2 py-1.5 outline-none hover:border-indigo-500/40 transition-colors">
              {MONTHS.map(m => <option key={m} value={m}>{String(m).padStart(2,'0')}월</option>)}
            </select>
          </div>
          <div className="mt-1.5 text-center">
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{selectedMonth}</span>
          </div>
        </div>

        {/* 업로드 버튼 */}
        <button onClick={() => onUpload(selectedMonth)}
          className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors font-semibold">
          <Upload size={13} /> Excel 업로드
        </button>

        {/* 다운로드 드롭다운 */}
        <DownloadMenu onDownload={onDownload} />
      </div>

      {/* 하단 여백 + 버전 */}
      <div className="flex-1" />
      <div className="px-4 py-3 border-t border-[#1e2638] shrink-0">
        <div className="text-[#2d3a55] text-[10px] text-center">v1.0.0 · {selectedMonth} 기준</div>
      </div>
    </aside>
  );
}
