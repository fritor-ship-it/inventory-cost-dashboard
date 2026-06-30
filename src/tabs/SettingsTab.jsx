import { useState } from 'react';
import { Save, Plus, Trash2, Edit2, DollarSign, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { useData } from '../context/DataContext';

const EXCHANGE_RATE = 1350;

// 목표 원가율 30% 기준 기본 매출액 계산
function defaultRevenue(totalUsage) {
  return Math.round(totalUsage / EXCHANGE_RATE / 0.30);
}

function CostRateBadge({ rate }) {
  const pct = (rate * 100).toFixed(1);
  if (rate <= 0.30) return <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">✓ {pct}%</span>;
  if (rate <= 0.35) return <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">⚠ {pct}%</span>;
  return <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-bold">↑ {pct}%</span>;
}

export default function SettingsTab() {
  const { data, revenueData, setMonthRevenue } = useData();
  const [skuList, setSkuList] = useState(data.skuMaster);
  const [catList, setCatList] = useState(data.costCategories || []);
  const [activeSection, setActiveSection] = useState('sku');
  const [saved, setSaved] = useState(false);
  const [filterYear, setFilterYear] = useState('all');

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-base">Settings / Master Data</h2>
          <p className="text-[#4b5a7a] text-xs mt-0.5">SKU 마스터 · 원가 카테고리 · 매핑 규칙 관리</p>
        </div>
        <button onClick={handleSave}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg transition-colors font-medium">
          <Save size={14} />{saved ? '저장됨!' : '저장'}
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'sku',     label: 'SKU Master' },
          { id: 'cost',    label: 'Cost Categories' },
          { id: 'mapping', label: '매핑 규칙' },
          { id: 'system',  label: '시스템 설정' },
          { id: 'revenue', label: '매출 관리 (Revenue)' },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setActiveSection(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeSection===id?'bg-indigo-600 text-white':'bg-[#1a2235] text-[#6b7a9a] hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── Revenue Management ── */}
      {activeSection === 'revenue' && (() => {
        const summary = data.monthlySummary;
        const years = [...new Set(summary.map(m => m.month.slice(0,4)))].sort();
        const filtered = filterYear === 'all' ? summary : summary.filter(m => m.month.startsWith(filterYear));

        // 전체 통계
        const avgCostRate = filtered.length > 0
          ? (filtered.reduce((s,m) => s + m.costRate, 0) / filtered.length * 100).toFixed(1)
          : '—';
        const totalRevUSD = filtered.reduce((s,m) => {
          const override = revenueData[m.month];
          return s + (override || defaultRevenue(m.totalUsage));
        }, 0);

        return (
          <div className="space-y-4">
            {/* 안내 배너 */}
            <div className="flex items-start gap-3 p-3.5 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
              <DollarSign size={16} className="text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-[#6b8ac4] leading-relaxed">
                월별 매출액을 USD로 입력하면 원가율이 자동 계산됩니다. 비워두면 <strong className="text-indigo-300">30% 목표 원가율</strong> 기준 매출이 자동 적용됩니다.
                <br/>환율: 1 USD = {EXCHANGE_RATE.toLocaleString()} KRW
              </div>
            </div>

            {/* 요약 카드 */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-3.5 text-center">
                <div className="text-[#4b5a7a] text-[11px] mb-1">평균 원가율</div>
                <div className={`font-bold text-lg ${parseFloat(avgCostRate) <= 30 ? 'text-emerald-400' : parseFloat(avgCostRate) <= 35 ? 'text-amber-400' : 'text-red-400'}`}>{avgCostRate}%</div>
              </div>
              <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-3.5 text-center">
                <div className="text-[#4b5a7a] text-[11px] mb-1">총 매출 (USD)</div>
                <div className="font-bold text-lg text-white">${(totalRevUSD/1000).toFixed(0)}K</div>
              </div>
              <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-3.5 text-center">
                <div className="text-[#4b5a7a] text-[11px] mb-1">수정 완료 월</div>
                <div className="font-bold text-lg text-indigo-400">{Object.keys(revenueData).length}개월</div>
              </div>
            </div>

            {/* 연도 필터 */}
            <div className="flex items-center gap-2">
              <span className="text-[#4b5a7a] text-xs">연도:</span>
              {['all', ...years].map(y => (
                <button key={y} onClick={() => setFilterYear(y)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${filterYear===y?'bg-indigo-600 text-white':'bg-[#1a2235] text-[#6b7a9a] hover:text-white'}`}>
                  {y === 'all' ? '전체' : `${y}년`}
                </button>
              ))}
              <button onClick={() => {
                filtered.forEach(m => setMonthRevenue(m.month, defaultRevenue(m.totalUsage)));
              }} className="ml-auto px-3 py-1 bg-[#1a2235] hover:bg-[#1e2a42] border border-[#1e2638] text-[#6b8ac4] text-xs rounded-lg transition-colors">
                선택 연도 30% 적용
              </button>
            </div>

            {/* 월별 매출 입력 테이블 */}
            <div className="bg-[#131720] border border-[#1e2638] rounded-xl overflow-hidden">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1e2638] bg-[#0f1117]">
                      {['월 (Month)','재료비 (USD)','매출액 (USD) — 직접 입력','원가율 (%)','상태'].map(h => (
                        <th key={h} className="text-left text-[#4b5a7a] font-medium px-4 py-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a2235]">
                    {filtered.map(m => {
                      const materialUSD = Math.round(m.totalUsage / EXCHANGE_RATE);
                      const defaultRev = defaultRevenue(m.totalUsage);
                      const currentRev = revenueData[m.month] !== undefined ? revenueData[m.month] : defaultRev;
                      const costRate = currentRev > 0 ? m.totalUsage / (currentRev * EXCHANGE_RATE) : m.costRate;
                      const isModified = revenueData[m.month] !== undefined;

                      return (
                        <tr key={m.month} className={`hover:bg-[#1a2235]/50 transition-colors ${isModified ? 'bg-indigo-500/3' : ''}`}>
                          <td className="px-4 py-3">
                            <span className="font-mono text-[#a0b0cc] font-medium">{m.month}</span>
                            {isModified && <span className="ml-2 text-[9px] text-indigo-400 bg-indigo-500/10 px-1 py-0.5 rounded">수정됨</span>}
                          </td>
                          <td className="px-4 py-3 text-[#6b7a9a] font-mono">
                            ${materialUSD.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[#4b5a7a] text-[11px]">$</span>
                              <input
                                type="number"
                                value={currentRev}
                                onChange={e => setMonthRevenue(m.month, e.target.value)}
                                className="w-32 bg-[#1a2235] border border-[#1e2638] text-[#a0b0cc] text-xs rounded-lg px-3 py-1.5 outline-none hover:border-indigo-500/40 focus:border-indigo-500 transition-colors font-mono"
                                min="0"
                                step="1000"
                              />
                              {isModified && (
                                <button onClick={() => {
                                  const next = {...revenueData};
                                  delete next[m.month];
                                  // setRevenueData를 직접 노출하지 않으므로 초기화는 기본값으로 재설정
                                  setMonthRevenue(m.month, defaultRev);
                                }} className="text-[#2d3a55] hover:text-amber-400 text-[10px] transition-colors" title="기본값(30%)으로 초기화">
                                  ↩
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <CostRateBadge rate={costRate} />
                          </td>
                          <td className="px-4 py-3">
                            {costRate <= 0.30
                              ? <span className="text-emerald-400 text-[11px]">✓ 목표 달성</span>
                              : costRate <= 0.35
                                ? <span className="text-amber-400 text-[11px]">⚠ 주의</span>
                                : <span className="text-red-400 text-[11px]">↑ 목표 초과</span>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-[#1e2638] px-4 py-2 flex items-center gap-4 text-[11px] text-[#4b5a7a]">
                <span>총 {filtered.length}개월</span>
                <span className="text-emerald-400">✓ ≤30% 목표</span>
                <span className="text-amber-400">⚠ 30~35% 주의</span>
                <span className="text-red-400">↑ &gt;35% 초과</span>
              </div>
            </div>
          </div>
        );
      })()}

      {activeSection === 'sku' && (
        <div className="bg-[#131720] border border-[#1e2638] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2638]">
            <span className="text-white text-sm font-medium">SKU Master ({skuList.length}개 품목)</span>
            <button className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300"><Plus size={13} /> 추가</button>
          </div>
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#1e2638] bg-[#0f1117]">
                  {['SKU','품목명','구분','채널','Vendor',''].map(h => (
                    <th key={h} className="text-left text-[#4b5a7a] font-medium px-4 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2235]">
                {skuList.map(s => (
                  <tr key={s.sku} className="hover:bg-[#1a2235]/50">
                    <td className="px-4 py-2.5 text-indigo-400 font-mono">{s.sku}</td>
                    <td className="px-4 py-2.5 text-[#a0b0cc]">{s.name}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] ${s.category==='Reagent'?'bg-indigo-500/10 text-indigo-400':'bg-cyan-500/10 text-cyan-400'}`}>{s.category}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <select value={s.channel} onChange={e => setSkuList(prev => prev.map(p => p.sku===s.sku?{...p,channel:e.target.value}:p))}
                        className="bg-[#1a2235] border border-[#1e2638] text-[#a0b0cc] text-[11px] rounded px-2 py-1 outline-none">
                        <option value="B2B">B2B</option><option value="B2C">B2C</option>
                      </select>
                    </td>
                    <td className="px-4 py-2.5 text-[#4b5a7a]">{s.vendor}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-2">
                        <button className="text-[#3b4768] hover:text-indigo-400"><Edit2 size={12} /></button>
                        <button onClick={() => setSkuList(prev => prev.filter(p => p.sku!==s.sku))} className="text-[#3b4768] hover:text-red-400"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSection === 'cost' && (
        <div className="bg-[#131720] border border-[#1e2638] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2638]">
            <span className="text-white text-sm font-medium">Cost Category ({catList.length}개)</span>
            <button className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300"><Plus size={13} /> 추가</button>
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1e2638] bg-[#0f1117]">
                {['코드','카테고리명','유형','GL계정',''].map(h => (
                  <th key={h} className="text-left text-[#4b5a7a] font-medium px-4 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2235]">
              {catList.map(c => (
                <tr key={c.code} className="hover:bg-[#1a2235]/50">
                  <td className="px-4 py-2.5 text-violet-400 font-mono">{c.code}</td>
                  <td className="px-4 py-2.5 text-[#a0b0cc]">{c.name}</td>
                  <td className="px-4 py-2.5"><span className={`px-1.5 py-0.5 rounded text-[10px] ${c.type==='Reagent'?'bg-indigo-500/10 text-indigo-400':'bg-cyan-500/10 text-cyan-400'}`}>{c.type}</span></td>
                  <td className="px-4 py-2.5 text-[#4b5a7a] font-mono">{c.glAccount}</td>
                  <td className="px-4 py-2.5"><button onClick={() => setCatList(prev => prev.filter(p => p.code!==c.code))} className="text-[#3b4768] hover:text-red-400"><Trash2 size={12} /></button></td>
                </tr>
              ))}
              {catList.length === 0 && <tr><td colSpan={5} className="text-center text-[#3b4768] py-6 text-xs">데이터 없음 — 파일 업로드 후 자동 로드됩니다</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeSection === 'mapping' && (
        <div className="space-y-3">
          {[
            { title: '자동 매칭 기준', options: [
              { label: '품목명 기준 자동 매칭', checked: true },
              { label: 'SKU 기준 자동 매칭', checked: true },
              { label: 'Vendor명 기준 유사 매칭', checked: true },
              { label: '동일 품목 SKU 상이 시 예외 표시', checked: true },
            ]},
            { title: '이상탐지 임계값', options: [
              { label: '전월 대비 30% 이상 변동 시 알림', checked: true },
              { label: 'QB/FB 입고 금액 차이 ₩10만 이상 시 알림', checked: true },
              { label: '원가율 5%p 이상 변동 시 알림', checked: false },
            ]},
          ].map(({ title, options }) => (
            <div key={title} className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
              <div className="text-white text-sm font-semibold mb-3">{title}</div>
              <div className="space-y-2.5">
                {options.map(opt => (
                  <label key={opt.label} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${opt.checked?'bg-indigo-500 border-indigo-500':'border-[#3b4768]'}`}>
                      {opt.checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                    </div>
                    <span className="text-[#a0b0cc] text-xs group-hover:text-white transition-colors">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'system' && (
        <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
          <div className="text-white text-sm font-semibold mb-3">데이터 소스 연결</div>
          <div className="space-y-3">
            {[
              { label: 'QuickBooks 연결 방식', value: '파일 업로드 (CSV/Excel)' },
              { label: 'Fishbowl 연결 방식', value: '파일 업로드 (CSV/Excel)' },
              { label: '기준 통화', value: 'USD' },
              { label: '보고 기간', value: '월별 (Monthly)' },
              { label: '현재 데이터', value: data.isDemo ? '샘플 데이터' : '업로드 데이터' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-[#1a2235] last:border-0">
                <span className="text-[#6b7a9a] text-xs">{label}</span>
                <span className="text-[#a0b0cc] text-xs">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
