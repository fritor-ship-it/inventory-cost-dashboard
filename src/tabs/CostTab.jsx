import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { Download, TrendingUp, TrendingDown } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatKRW, exportCostAnalysis } from '../utils/exportUtils';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a2235] border border-[#1e2638] rounded-lg p-3 text-xs shadow-xl">
      <p className="text-[#6b7a9a] mb-2 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-[#a0b0cc]">{p.name}:</span>
          <span className="text-white font-medium">
            {p.name.includes('%') ? `${p.value}%` : typeof p.value === 'number' && p.value > 1000 ? formatKRW(p.value * 10000) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function CostTab() {
  const { data } = useData();
  const { monthlySummary, skuMaster, inventoryData, months } = data;

  const latest = monthlySummary[monthlySummary.length - 1];
  const prev = monthlySummary[monthlySummary.length - 2] || latest;

  const chartData = monthlySummary.map(m => ({
    month: m.month.slice(5),
    'Reagent': Math.round(m.reagentUsage / 10000),
    'Consumable': Math.round(m.consumableUsage / 10000),
    '원가율(%)': parseFloat((m.costRate * 100).toFixed(1)),
    '전월대비(%)': m.costRateChange,
  }));

  const monthChanges = skuMaster.map(s => {
    const arr = inventoryData[s.sku];
    if (!arr || arr.length < 2) return null;
    const cur = arr[arr.length - 1];
    const prv = arr[arr.length - 2];
    const change = prv.usageValue > 0 ? (cur.usageValue - prv.usageValue) / prv.usageValue * 100 : 0;
    return { ...s, curUsage: cur.usageValue, prevUsage: prv.usageValue, change: parseFloat(change.toFixed(1)) };
  }).filter(Boolean).sort((a,b) => Math.abs(b.change) - Math.abs(a.change));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-base">원가분석</h2>
          <p className="text-[#4b5a7a] text-xs mt-0.5">월별 재료비 · 원가율 · 전월 대비 증감</p>
        </div>
        <button onClick={() => exportCostAnalysis(monthlySummary)}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors font-medium">
          <Download size={14} /> Excel 다운로드
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: `${latest?.month} 총재료비`, value: formatKRW(latest?.totalUsage||0), change: prev&&prev!==latest?((latest.totalUsage-prev.totalUsage)/(prev.totalUsage||1)*100).toFixed(1):null, color: 'text-white' },
          { label: '원가율', value: `${((latest?.costRate||0)*100).toFixed(1)}%`, change: latest?.costRateChange, color: latest?.costRateChange>0?'text-red-400':'text-emerald-400' },
          { label: 'Reagent 재료비', value: formatKRW(latest?.reagentUsage||0), change: prev&&prev!==latest?((latest.reagentUsage-prev.reagentUsage)/(prev.reagentUsage||1)*100).toFixed(1):null, color: 'text-indigo-400' },
          { label: 'Consumable 재료비', value: formatKRW(latest?.consumableUsage||0), change: prev&&prev!==latest?((latest.consumableUsage-prev.consumableUsage)/(prev.consumableUsage||1)*100).toFixed(1):null, color: 'text-cyan-400' },
        ].map(({ label, value, change, color }) => (
          <div key={label} className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
            <div className="text-[#4b5a7a] text-xs mb-1">{label}</div>
            <div className={`font-bold text-lg ${color}`}>{value}</div>
            {change != null && (
              <div className={`text-xs mt-1 flex items-center gap-1 ${parseFloat(change)>0?'text-red-400':'text-emerald-400'}`}>
                {parseFloat(change)>0?<TrendingUp size={11}/>:<TrendingDown size={11}/>}
                전월 대비 {parseFloat(change)>0?'+':''}{change}%
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
          <div className="text-white text-sm font-semibold mb-1">월별 재료비 (Reagent / Consumable)</div>
          <div className="text-[#4b5a7a] text-xs mb-4">단위: 만원</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="reagentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="consumGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} /><stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2638" />
              <XAxis dataKey="month" tick={{ fill: '#4b5a7a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b5a7a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#6b7a9a' }} />
              <Area type="monotone" dataKey="Reagent" stroke="#6366f1" fill="url(#reagentGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="Consumable" stroke="#22d3ee" fill="url(#consumGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
          <div className="text-white text-sm font-semibold mb-1">원가율 전월 대비 증감</div>
          <div className="text-[#4b5a7a] text-xs mb-4">(%)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2638" />
              <XAxis dataKey="month" tick={{ fill: '#4b5a7a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b5a7a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#3b4768" />
              <Bar dataKey="전월대비(%)" fill="#f59e0b" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
        <div className="text-white text-sm font-semibold mb-3">전월 대비 주요 증감 품목</div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1e2638]">
                {['SKU','품목명','구분','채널','전월 사용액','당월 사용액','증감액','증감률'].map(h => (
                  <th key={h} className="text-left text-[#4b5a7a] font-medium px-3 py-2.5 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2235]">
              {monthChanges.slice(0,8).map(r => (
                <tr key={r.sku} className="hover:bg-[#1a2235]/50">
                  <td className="px-3 py-2.5 text-indigo-400 font-mono">{r.sku}</td>
                  <td className="px-3 py-2.5 text-[#a0b0cc]">{r.name}</td>
                  <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded text-[10px] ${r.category==='Reagent'?'bg-indigo-500/10 text-indigo-400':'bg-cyan-500/10 text-cyan-400'}`}>{r.category}</span></td>
                  <td className="px-3 py-2.5"><span className={`px-1.5 py-0.5 rounded text-[10px] ${r.channel==='B2B'?'bg-amber-500/10 text-amber-400':'bg-rose-500/10 text-rose-400'}`}>{r.channel}</span></td>
                  <td className="px-3 py-2.5 text-right text-[#6b7a9a]">{formatKRW(r.prevUsage)}</td>
                  <td className="px-3 py-2.5 text-right text-white">{formatKRW(r.curUsage)}</td>
                  <td className={`px-3 py-2.5 text-right ${r.curUsage-r.prevUsage>0?'text-red-400':'text-emerald-400'}`}>
                    {r.curUsage-r.prevUsage>0?'+':''}{formatKRW(r.curUsage-r.prevUsage)}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <span className={`font-semibold ${Math.abs(r.change)>=30?'text-red-400':r.change>0?'text-amber-400':'text-emerald-400'}`}>
                      {r.change>0?'+':''}{r.change}% {Math.abs(r.change)>=30&&'⚠️'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
