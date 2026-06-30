import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { useData } from '../context/DataContext';
import { formatKRW } from '../utils/exportUtils';
import { CATEGORY_META, CATEGORIES, getCatMeta } from '../utils/categoryUtils';

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
            {typeof p.value === 'number' && p.value > 100 ? formatKRW(p.value * 10000) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const CAT_KEYS = {
  'Reagent':              'reagentOnly',
  'Calibrator':           'calibratorUsage',
  'Control (QC Material)':'controlUsage',
  'Consumables':          'consumablesUsage',
};

export default function ReagentTab() {
  const { data } = useData();
  const { monthlySummary, skuMaster, inventoryData, months } = data;
  const latest = monthlySummary[monthlySummary.length - 1];

  // 카테고리별 품목 집계
  const catItems = CATEGORIES.map(cat => {
    const items = skuMaster.filter(s => s.category === cat).map(s => {
      const arr = inventoryData[s.sku];
      if (!arr?.length) return null;
      const cur = arr[arr.length - 1];
      const prv = arr[arr.length - 2];
      const change = prv?.usageValue > 0
        ? ((cur.usageValue - prv.usageValue) / prv.usageValue * 100).toFixed(1)
        : '0.0';
      return { ...s, usageValue: cur.usageValue, change };
    }).filter(Boolean).sort((a, b) => b.usageValue - a.usageValue);

    const totalUsage = items.reduce((s, x) => s + x.usageValue, 0);
    const m = getCatMeta(cat);
    return { cat, items, totalUsage, meta: m };
  });

  const grandTotal = catItems.reduce((s, c) => s + c.totalUsage, 0);

  // 월별 스택 차트
  const chartData = monthlySummary.map(m => ({
    month: m.month.slice(5),
    'Reagent':    Math.round((m.reagentOnly || 0) / 10000),
    'Calibrator': Math.round((m.calibratorUsage || 0) / 10000),
    'Control/QC': Math.round((m.controlUsage || 0) / 10000),
    'Consumables':Math.round((m.consumablesUsage || 0) / 10000),
  }));

  // 파이 데이터
  const pieData = catItems.map(c => ({
    name: c.meta.label,
    value: c.totalUsage,
    color: c.meta.chartColor,
  })).filter(p => p.value > 0);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-white font-bold text-base">Category Analysis</h2>
        <p className="text-[#4b5a7a] text-xs mt-0.5">Reagent · Calibrator · Control (QC Material) · Consumables</p>
      </div>

      {/* 카테고리 KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {catItems.map(({ cat, items, totalUsage, meta }) => {
          const ratio = grandTotal > 0 ? (totalUsage / grandTotal * 100).toFixed(1) : '0.0';
          return (
            <div key={cat} className={`border rounded-xl p-4 bg-[#131720] border-[#1e2638]`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${meta.bg}`}>{meta.label}</span>
              </div>
              <div className={`font-bold text-xl ${meta.color}`}>{formatKRW(totalUsage)}</div>
              <div className="text-[#4b5a7a] text-xs mt-1">{ratio}% · {items.length}개 품목</div>
              <div className={`mt-2 h-1 rounded-full bg-[#1e2638] overflow-hidden`}>
                <div className="h-full rounded-full" style={{ width: `${ratio}%`, background: meta.chartColor }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 월별 스택 + 파이차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#131720] border border-[#1e2638] rounded-xl p-4">
          <div className="text-white text-sm font-semibold mb-1">월별 카테고리별 재료비</div>
          <div className="text-[#4b5a7a] text-xs mb-4">단위: 만원 (스택)</div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={chartData} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2638" />
              <XAxis dataKey="month" tick={{ fill:'#4b5a7a', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#4b5a7a', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize:11, color:'#6b7a9a' }} />
              <Bar dataKey="Reagent"    fill="#6366f1" radius={[0,0,0,0]} stackId="a" />
              <Bar dataKey="Calibrator" fill="#10b981" radius={[0,0,0,0]} stackId="a" />
              <Bar dataKey="Control/QC" fill="#f59e0b" radius={[0,0,0,0]} stackId="a" />
              <Bar dataKey="Consumables"fill="#22d3ee" radius={[3,3,0,0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4 flex flex-col items-center">
          <div className="text-white text-sm font-semibold mb-1">구성비 ({latest?.month})</div>
          <div className="text-[#4b5a7a] text-xs mb-2">카테고리별 재료비 비중</div>
          <PieChart width={200} height={170}>
            <Pie data={pieData} cx={100} cy={80} innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={2}>
              {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip formatter={(v) => formatKRW(v)} />
          </PieChart>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-[#6b7a9a]">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 카테고리별 상세 품목 테이블 */}
      {catItems.map(({ cat, items, meta }) => (
        <div key={cat} className="bg-[#131720] border border-[#1e2638] rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1e2638]">
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${meta.bg}`}>{meta.label}</span>
            <span className="text-white text-sm font-semibold">{cat}</span>
            <span className="text-[#4b5a7a] text-xs ml-auto">{items.length}개 품목</span>
          </div>
          {items.length === 0 ? (
            <div className="py-6 text-center text-[#3b4768] text-xs">품목 없음</div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#1a2235] bg-[#0f1117]">
                    {['SKU','품목명','채널 Channel','Vendor','사용액 Usage','전월대비 MoM'].map(h => (
                      <th key={h} className="text-left text-[#4b5a7a] font-medium px-3 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2235]">
                  {items.slice(0, 8).map(r => (
                    <tr key={r.sku} className="hover:bg-[#1a2235]/50">
                      <td className={`px-3 py-2 font-mono text-[11px] ${meta.color}`}>{r.sku}</td>
                      <td className="px-3 py-2 text-[#a0b0cc] max-w-[200px]"><div className="truncate">{r.name}</div></td>
                      <td className="px-3 py-2">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${r.channel==='B2B'?'bg-amber-500/10 text-amber-400':'bg-rose-500/10 text-rose-400'}`}>{r.channel}</span>
                      </td>
                      <td className="px-3 py-2 text-[#4b5a7a] text-[11px]">{r.vendor}</td>
                      <td className={`px-3 py-2 text-right font-semibold ${meta.color}`}>{formatKRW(r.usageValue)}</td>
                      <td className={`px-3 py-2 text-right font-medium ${parseFloat(r.change)>0?'text-red-400':'text-emerald-400'}`}>
                        {parseFloat(r.change)>0?'+':''}{r.change}%
                      </td>
                    </tr>
                  ))}
                  {items.length > 8 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-2 text-center text-[#3b4768] text-[11px]">
                        외 {items.length - 8}개 품목 (Inventory Ledger에서 전체 확인)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
