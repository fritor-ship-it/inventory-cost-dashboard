import { useState, useMemo, useEffect } from 'react';
import { Download, Search } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatKRW, exportInventoryLedger } from '../utils/exportUtils';
import { CATEGORIES, getCatMeta } from '../utils/categoryUtils';

export default function LedgerTab() {
  const { data, selectedMonth: ctxMonth, monthIndex: ctxIndex } = useData();
  const { skuMaster, inventoryData, months } = data;

  // 사이드바 기준월과 동기화
  const [selectedMonth, setSelectedMonth] = useState(ctxMonth);
  useEffect(() => { setSelectedMonth(ctxMonth); }, [ctxMonth]);

  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterCh, setFilterCh] = useState('all');

  const monthIndex = months.indexOf(selectedMonth) >= 0 ? months.indexOf(selectedMonth) : ctxIndex;

  const rows = useMemo(() => {
    return skuMaster
      .filter(s => filterCat === 'all' || s.category === filterCat)
      .filter(s => filterCh === 'all' || s.channel === filterCh)
      .filter(s => search === '' || s.name.toLowerCase().includes(search.toLowerCase()) || s.sku.toLowerCase().includes(search.toLowerCase()))
      .map(s => {
        const arr = inventoryData[s.sku];
        if (!arr) return null;
        const d = arr[Math.min(monthIndex, arr.length - 1)] || arr[arr.length - 1];
        return { ...s, ...d };
      }).filter(Boolean);
  }, [selectedMonth, search, filterCat, filterCh, monthIndex, skuMaster, inventoryData]);

  const totals = useMemo(() => rows.reduce((acc, r) => ({
    openingValue: acc.openingValue + (r.openingValue || 0),
    purchaseValue: acc.purchaseValue + (r.purchaseValue || 0),
    closingValue: acc.closingValue + (r.closingValue || 0),
    usageValue: acc.usageValue + (r.usageValue || 0),
  }), { openingValue:0, purchaseValue:0, closingValue:0, usageValue:0 }), [rows]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-base">재고수불부</h2>
          <p className="text-[#4b5a7a] text-xs mt-0.5">기초재고 + 당월입고 - 기말재고 = 사용액</p>
        </div>
        <button
          onClick={() => exportInventoryLedger(rows, selectedMonth)}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors font-medium"
        >
          <Download size={14} /> Excel 다운로드
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
          className="bg-[#1a2235] border border-[#1e2638] text-[#a0b0cc] text-xs rounded-lg px-3 py-2 outline-none">
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <div className="flex items-center gap-2 bg-[#1a2235] border border-[#1e2638] rounded-lg px-3 py-2">
          <Search size={13} className="text-[#4b5a7a]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SKU / 품목명 검색"
            className="bg-transparent text-[#a0b0cc] text-xs outline-none w-40 placeholder:text-[#2d3a55]" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="bg-[#1a2235] border border-[#1e2638] text-[#a0b0cc] text-xs rounded-lg px-3 py-2 outline-none">
          <option value="all">전체 구분</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterCh} onChange={e => setFilterCh(e.target.value)}
          className="bg-[#1a2235] border border-[#1e2638] text-[#a0b0cc] text-xs rounded-lg px-3 py-2 outline-none">
          <option value="all">전체 채널</option>
          <option value="B2B">B2B</option>
          <option value="B2C">B2C</option>
        </select>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '기초재고', value: totals.openingValue, color: 'text-blue-400' },
          { label: '당월입고', value: totals.purchaseValue, color: 'text-emerald-400' },
          { label: '기말재고', value: totals.closingValue, color: 'text-violet-400' },
          { label: '사용액(재료비)', value: totals.usageValue, color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#131720] border border-[#1e2638] rounded-xl p-3.5">
            <div className="text-[#4b5a7a] text-xs mb-1">{label}</div>
            <div className={`${color} font-bold text-base`}>{formatKRW(value)}</div>
          </div>
        ))}
      </div>

      <div className="bg-[#131720] border border-[#1e2638] rounded-xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1e2638] bg-[#0f1117]">
                {['SKU','품목명','구분','채널','Vendor','기초재고','당월입고','기말재고','사용액','확인'].map(h => (
                  <th key={h} className="text-left text-[#4b5a7a] font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2235]">
              {rows.map(r => {
                const check = Math.abs((r.openingValue + r.purchaseValue - r.closingValue) - r.usageValue) > 1000;
                return (
                  <tr key={r.sku} className="hover:bg-[#1a2235]/50 transition-colors">
                    <td className="px-4 py-3 text-indigo-400 font-mono">{r.sku}</td>
                    <td className="px-4 py-3 text-[#a0b0cc] max-w-[180px]"><div className="truncate">{r.name}</div></td>
                    <td className="px-4 py-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${getCatMeta(r.category).bg}`}>{getCatMeta(r.category).label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${r.channel === 'B2B' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'}`}>{r.channel}</span>
                    </td>
                    <td className="px-4 py-3 text-[#4b5a7a]">{r.vendor}</td>
                    <td className="px-4 py-3 text-right text-[#a0b0cc]">{formatKRW(r.openingValue)}</td>
                    <td className="px-4 py-3 text-right text-emerald-400">{formatKRW(r.purchaseValue)}</td>
                    <td className="px-4 py-3 text-right text-violet-400">{formatKRW(r.closingValue)}</td>
                    <td className="px-4 py-3 text-right text-white font-semibold">{formatKRW(r.usageValue)}</td>
                    <td className="px-4 py-3 text-center">
                      {check ? <span className="text-red-400 text-[10px]">불일치</span> : <span className="text-emerald-400 text-[10px]">✓</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[#1e2638] px-4 py-2 text-[#4b5a7a] text-[11px]">총 {rows.length}개 품목</div>
      </div>
    </div>
  );
}
