import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useData } from '../context/DataContext';
import { formatKRW } from '../utils/exportUtils';

const COLORS = { B2B: '#f59e0b', B2C: '#f43f5e' };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a2235] border border-[#1e2638] rounded-lg p-3 text-xs shadow-xl">
      <p className="text-[#6b7a9a] mb-2 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-[#a0b0cc]">{p.name}:</span>
          <span className="text-white font-medium">{typeof p.value === 'number' && p.value > 100 ? formatKRW(p.value * 10000) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function B2BTab() {
  const { data } = useData();
  const { monthlySummary, skuMaster, inventoryData, months } = data;

  const latest = monthlySummary[monthlySummary.length - 1];
  const chartData = monthlySummary.map(m => ({
    month: m.month.slice(5),
    'B2B': Math.round(m.b2bUsage / 10000),
    'B2C': Math.round(m.b2cUsage / 10000),
  }));

  const pieData = [
    { name: 'B2B', value: latest?.b2bUsage || 0 },
    { name: 'B2C', value: latest?.b2cUsage || 0 },
  ];

  const total = (latest?.b2bUsage || 0) + (latest?.b2cUsage || 0);
  const b2bRatio = total > 0 ? latest.b2bUsage / total * 100 : 50;

  const b2bItems = skuMaster.filter(s => s.channel === 'B2B').map(s => {
    const arr = inventoryData[s.sku]; if (!arr?.length) return null;
    return { ...s, usageValue: arr[arr.length - 1].usageValue };
  }).filter(Boolean).sort((a,b) => b.usageValue - a.usageValue);

  const b2cItems = skuMaster.filter(s => s.channel === 'B2C').map(s => {
    const arr = inventoryData[s.sku]; if (!arr?.length) return null;
    return { ...s, usageValue: arr[arr.length - 1].usageValue };
  }).filter(Boolean).sort((a,b) => b.usageValue - a.usageValue);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-white font-bold text-base">B2B / B2C 분석</h2>
        <p className="text-[#4b5a7a] text-xs mt-0.5">채널별 재료비 구성 및 추이</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
          <div className="text-[#4b5a7a] text-xs mb-1">B2B 재료비 ({latest?.month})</div>
          <div className="text-amber-400 font-bold text-2xl">{formatKRW(latest?.b2bUsage||0)}</div>
          <div className="text-[#4b5a7a] text-xs mt-1">전체의 {b2bRatio.toFixed(1)}%</div>
          <div className="mt-2 h-1.5 bg-[#1e2638] rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${b2bRatio}%` }} />
          </div>
        </div>
        <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
          <div className="text-[#4b5a7a] text-xs mb-1">B2C 재료비 ({latest?.month})</div>
          <div className="text-rose-400 font-bold text-2xl">{formatKRW(latest?.b2cUsage||0)}</div>
          <div className="text-[#4b5a7a] text-xs mt-1">전체의 {(100-b2bRatio).toFixed(1)}%</div>
          <div className="mt-2 h-1.5 bg-[#1e2638] rounded-full overflow-hidden">
            <div className="h-full bg-rose-400 rounded-full" style={{ width: `${100-b2bRatio}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4 flex flex-col items-center">
          <div className="text-white text-sm font-semibold mb-2">채널 구성비</div>
          <PieChart width={200} height={160}>
            <Pie data={pieData} cx={100} cy={70} innerRadius={45} outerRadius={65} dataKey="value" paddingAngle={3}>
              {pieData.map((entry, i) => <Cell key={i} fill={COLORS[entry.name]} />)}
            </Pie>
            <Tooltip formatter={(v) => formatKRW(v)} />
          </PieChart>
          <div className="flex gap-4 mt-1">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[d.name] }} />
                <span className="text-[#6b7a9a]">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#131720] border border-[#1e2638] rounded-xl p-4">
          <div className="text-white text-sm font-semibold mb-1">월별 B2B / B2C 재료비 추이</div>
          <div className="text-[#4b5a7a] text-xs mb-4">단위: 만원</div>
          <ResponsiveContainer width="100%" height={190}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2638" />
              <XAxis dataKey="month" tick={{ fill: '#4b5a7a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b5a7a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#6b7a9a' }} />
              <Line type="monotone" dataKey="B2B" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
              <Line type="monotone" dataKey="B2C" stroke="#f43f5e" strokeWidth={2} dot={{ fill: '#f43f5e', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { title: 'B2B 주요 품목', items: b2bItems, color: 'text-amber-400', barColor: 'bg-amber-400' },
          { title: 'B2C 주요 품목', items: b2cItems, color: 'text-rose-400', barColor: 'bg-rose-400' },
        ].map(({ title, items, color, barColor }) => (
          <div key={title} className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
            <div className="text-white text-sm font-semibold mb-3">{title}</div>
            <div className="space-y-2.5">
              {items.length === 0 && <p className="text-[#3b4768] text-xs text-center py-4">품목 없음</p>}
              {items.map((item, i) => {
                const max = items[0]?.usageValue || 1;
                return (
                  <div key={item.sku} className="flex items-center gap-3">
                    <div className="text-[#3b4768] text-xs w-4 text-right">{i+1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#a0b0cc] truncate">{item.name}</span>
                        <span className={`${color} font-medium ml-2 shrink-0`}>{formatKRW(item.usageValue)}</span>
                      </div>
                      <div className="h-1.5 bg-[#1e2638] rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${(item.usageValue/max*100).toFixed(0)}%` }} />
                      </div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.category==='Reagent'?'bg-indigo-500/10 text-indigo-400':'bg-cyan-500/10 text-cyan-400'}`}>{item.category}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
