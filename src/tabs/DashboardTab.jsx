import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Package, AlertTriangle, DollarSign, BarChart3, PackageSearch, ShoppingCart, Clock, Zap } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatKRW } from '../utils/exportUtils';
import { OPTIM_SUMMARY, INVENTORY_OPTIM } from '../data/inventoryOptimData';

function KpiCard({ title, value, sub, change, icon: Icon, color = 'indigo', alert }) {
  const colors = {
    indigo: 'from-indigo-500/10 to-indigo-600/5 border-indigo-500/20',
    green: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20',
    red: 'from-red-500/10 to-red-600/5 border-red-500/20',
    amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/20',
    violet: 'from-violet-500/10 to-violet-600/5 border-violet-500/20',
  };
  const iconColors = { indigo: 'text-indigo-400', green: 'text-emerald-400', red: 'text-red-400', amber: 'text-amber-400', violet: 'text-violet-400' };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4 relative`}>
      {alert && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-400 animate-pulse" />}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-[#4b5a7a] text-xs font-medium mb-1.5">{title}</div>
          <div className="text-white text-xl font-bold leading-tight truncate">{value}</div>
          {sub && <div className="text-[#4b5a7a] text-xs mt-1">{sub}</div>}
        </div>
        <div className={`p-2 rounded-lg bg-[#131720]/50 ${iconColors[color]}`}>
          <Icon size={18} />
        </div>
      </div>
      {change !== undefined && (
        <div className={`mt-2 flex items-center gap-1 text-xs font-medium ${change >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
          {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          전월 대비 {change >= 0 ? '+' : ''}{change}%
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a2235] border border-[#1e2638] rounded-lg p-3 text-xs shadow-xl">
      <p className="text-[#6b7a9a] mb-2 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[#a0b0cc]">{p.name}:</span>
          <span className="text-white font-medium">{typeof p.value === 'number' && p.value > 10000 ? formatKRW(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardTab() {
  const { data } = useData();
  const { monthlySummary, skuMaster, inventoryData, exceptions, months } = data;

  const latest = monthlySummary[monthlySummary.length - 1];
  const prev = monthlySummary[monthlySummary.length - 2] || latest;

  const chartData = monthlySummary.map(m => ({
    month: m.month.slice(5),
    'B2B': Math.round(m.b2bUsage / 10000),
    'B2C': Math.round(m.b2cUsage / 10000),
    '원가율(%)': parseFloat((m.costRate * 100).toFixed(1)),
  }));

  const topUsage = skuMaster.map(s => {
    const rows = inventoryData[s.sku];
    if (!rows?.length) return null;
    const row = rows[rows.length - 1];
    return { name: s.name.length > 18 ? s.name.slice(0,18)+'…' : s.name, value: row.usageValue, category: s.category };
  }).filter(Boolean).sort((a,b) => b.value - a.value).slice(0, 6);

  const highExceptions = exceptions.filter(e => e.severity === 'high').length;

  const os = OPTIM_SUMMARY;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-white font-bold text-lg">재고/원가관리 대시보드</h1>
        <p className="text-[#4b5a7a] text-xs mt-0.5">{latest?.month} 기준 · {data.isDemo ? '샘플 데이터' : '업로드 데이터'}</p>
      </div>

      {/* AI Inventory Alert Panel */}
      {os.urgentItems.length > 0 && (
        <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={15} className="text-red-400" />
            <span className="text-red-300 text-sm font-semibold">AI Inventory Alert — 즉시 대응 필요 {os.stockoutRisk}건</span>
            <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-bold
              ${os.healthScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' : os.healthScore >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}`}>
              Health Score {os.healthScore}/100
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
            {os.urgentItems.map(item => (
              <div key={item.sku} className="bg-[#0f1117] border border-red-500/20 rounded-lg p-2.5">
                <div className="flex items-center gap-1 mb-1.5">
                  <span className="text-xs">🔴</span>
                  <span className="text-white text-[11px] font-medium truncate">{item.name}</span>
                </div>
                <div className="space-y-0.5 text-[10px]">
                  <div className="flex justify-between"><span className="text-[#4b5a7a]">현재재고</span><span className="text-red-400 font-medium">{item.currentStock} ea</span></div>
                  <div className="flex justify-between"><span className="text-[#4b5a7a]">소진 예상</span><span className="text-amber-400">{item.daysUntilStockout === 999 ? '—' : item.daysUntilStockout + '일'}</span></div>
                  <div className="flex justify-between"><span className="text-[#4b5a7a]">권장 발주</span><span className="text-white font-bold">{item.recommendedOrderQty} ea</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 원가 KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          title={`총 재료비 (${latest?.month?.slice(5)}월)`}
          value={formatKRW(latest?.totalUsage || 0)}
          sub={`기초 ${formatKRW(latest?.totalOpening || 0)}`}
          change={prev && prev !== latest ? parseFloat(((latest.totalUsage - prev.totalUsage) / (prev.totalUsage || 1) * 100).toFixed(1)) : undefined}
          icon={DollarSign} color="indigo"
        />
        <KpiCard
          title="원가율"
          value={`${((latest?.costRate || 0) * 100).toFixed(1)}%`}
          sub={`전월 ${((prev?.costRate || 0) * 100).toFixed(1)}%`}
          change={latest?.costRateChange}
          icon={BarChart3} color={latest?.costRateChange > 3 ? 'red' : 'green'}
          alert={latest?.costRateChange > 3}
        />
        <KpiCard
          title="이상 항목"
          value={`${exceptions.length}건`}
          sub={`High: ${highExceptions}건 · Medium: ${exceptions.filter(e=>e.severity==='medium').length}건`}
          icon={AlertTriangle} color={highExceptions > 0 ? 'red' : 'amber'}
          alert={highExceptions > 0}
        />
        <KpiCard
          title="관리 SKU"
          value={`${skuMaster.length}종`}
          sub={`RG ${skuMaster.filter(s=>s.category==='Reagent').length} · CAL ${skuMaster.filter(s=>s.category==='Calibrator').length} · QC ${skuMaster.filter(s=>s.category==='Control (QC Material)').length} · CS ${skuMaster.filter(s=>s.category==='Consumables').length}`}
          icon={Package} color="violet"
        />
      </div>

      {/* AI 재고 최적화 KPI */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <PackageSearch size={14} className="text-indigo-400" />
          <span className="text-white text-xs font-semibold">AI Inventory Optimization KPIs</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5">
          {[
            { label: 'Inventory Value', value: formatKRW(os.totalInvValue), color: 'text-white', icon: Package },
            { label: 'Coverage %', value: os.optimalCoverage + '%', color: os.optimalCoverage >= 100 ? 'text-emerald-400' : 'text-amber-400', icon: BarChart3 },
            { label: 'Stockout Risk', value: os.stockoutRisk + '건', color: os.stockoutRisk > 5 ? 'text-red-400' : 'text-amber-400', icon: AlertTriangle },
            { label: 'Overstock Value', value: formatKRW(os.overstockValue), color: 'text-blue-400', icon: TrendingUp },
            { label: 'Purchase Rec.', value: formatKRW(os.purchaseRec), color: 'text-amber-400', icon: ShoppingCart },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="bg-[#131720] border border-[#1e2638] rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#4b5a7a] text-[10px]">{label}</span>
                <Icon size={12} className={color} />
              </div>
              <div className={`font-bold text-sm ${color}`}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#131720] border border-[#1e2638] rounded-xl p-4">
          <div className="text-white text-sm font-semibold mb-1">월별 재료비 추이</div>
          <div className="text-[#4b5a7a] text-xs mb-4">B2B / B2C 구분 (만원)</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2638" />
              <XAxis dataKey="month" tick={{ fill: '#4b5a7a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b5a7a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#6b7a9a' }} />
              <Bar dataKey="B2B" fill="#6366f1" radius={[3,3,0,0]} />
              <Bar dataKey="B2C" fill="#22d3ee" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
          <div className="text-white text-sm font-semibold mb-1">원가율 트렌드</div>
          <div className="text-[#4b5a7a] text-xs mb-4">월별 원가율 (%)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2638" />
              <XAxis dataKey="month" tick={{ fill: '#4b5a7a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4b5a7a', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto','auto']} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="원가율(%)" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
          <div className="text-white text-sm font-semibold mb-3">상위 재료비 품목 ({latest?.month})</div>
          <div className="space-y-2.5">
            {topUsage.map((item, i) => {
              const max = topUsage[0]?.value || 1;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-[#3b4768] text-xs w-4 text-right">{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#a0b0cc] truncate">{item.name}</span>
                      <span className="text-white font-medium ml-2 shrink-0">{formatKRW(item.value)}</span>
                    </div>
                    <div className="h-1.5 bg-[#1e2638] rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.category === 'Reagent' ? 'bg-indigo-500' : 'bg-cyan-500'}`}
                        style={{ width: `${(item.value / max * 100).toFixed(0)}%` }} />
                    </div>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${item.category === 'Reagent' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                    {item.category}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
          <div className="text-white text-sm font-semibold mb-3">이상 항목 요약</div>
          <div className="space-y-2">
            {exceptions.slice(0, 5).map(ex => (
              <div key={ex.id} className="flex items-start gap-2.5 p-2.5 bg-[#1a2235] rounded-lg">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 mt-0.5 ${
                  ex.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                  ex.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-gray-500/20 text-gray-400'}`}>
                  {ex.severity.toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[#a0b0cc] text-xs font-medium truncate">{ex.name}</div>
                  <div className="text-[#4b5a7a] text-[11px] mt-0.5 leading-tight">{ex.message}</div>
                </div>
              </div>
            ))}
            {exceptions.length === 0 && <p className="text-[#3b4768] text-xs text-center py-4">이상 항목 없음</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
