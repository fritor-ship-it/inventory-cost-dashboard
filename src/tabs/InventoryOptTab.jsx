import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, ReferenceLine,
} from 'recharts';
import {
  AlertTriangle, CheckCircle, TrendingDown, TrendingUp, Package,
  ShoppingCart, Clock, Trash2, AlertCircle, Search, Download, Info,
  ChevronDown, ChevronUp, Zap,
} from 'lucide-react';
import { INVENTORY_OPTIM, OPTIM_SUMMARY } from '../data/inventoryOptimData';
import { formatKRW } from '../utils/exportUtils';
import * as XLSX from 'xlsx';

// ── 상태 메타 ─────────────────────────────────────────────────────────
const STATUS = {
  critical: { label: 'Critical 부족',  labelEn: 'Critical',  icon: '🔴', color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30',    dot: 'bg-red-400' },
  low:      { label: 'Low 주의',        labelEn: 'Low',       icon: '🟡', color: 'text-amber-400',  bg: 'bg-amber-500/10 border-amber-500/30',  dot: 'bg-amber-400' },
  optimal:  { label: 'Optimal 정상',    labelEn: 'Optimal',   icon: '🟢', color: 'text-emerald-400',bg: 'bg-emerald-500/10 border-emerald-500/30',dot:'bg-emerald-400'},
  overstock:{ label: 'Overstock 과다',  labelEn: 'Overstock', icon: '🔵', color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/30',    dot: 'bg-blue-400' },
  deadstock:{ label: 'Dead Stock',      labelEn: 'Dead Stock',icon: '⚫', color: 'text-gray-400',   bg: 'bg-gray-500/10 border-gray-500/30',    dot: 'bg-gray-500' },
  expiring: { label: 'Expiring Soon',   labelEn: 'Expiring',  icon: '🟠', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30',dot: 'bg-orange-400'},
};

const PIE_COLORS = { critical:'#f87171', low:'#fbbf24', optimal:'#34d399', overstock:'#60a5fa', deadstock:'#9ca3af', expiring:'#fb923c' };
const PRIORITY_COLORS = { critical:'text-red-400', high:'text-amber-400', medium:'text-blue-400', low:'text-emerald-400' };

function StatusBadge({ status, size = 'sm' }) {
  const m = STATUS[status] || STATUS.optimal;
  return (
    <span className={`inline-flex items-center gap-1 font-medium border rounded-full
      ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}
      ${m.bg} ${m.color}`}>
      <span>{m.icon}</span>{m.labelEn}
    </span>
  );
}

function HealthGauge({ score }) {
  const color = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-red-400';
  const bg    = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#1e2638" strokeWidth="4"/>
          <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor"
            strokeWidth="4" strokeDasharray={`${score * 1.257} 125.7`}
            className={color} strokeLinecap="round"/>
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${color}`}>{score}</span>
      </div>
      <div>
        <div className={`text-base font-bold ${color}`}>
          {score >= 80 ? 'Good' : score >= 60 ? 'Fair' : 'Poor'}
        </div>
        <div className="text-[#4b5a7a] text-[11px]">AI Health Score</div>
      </div>
    </div>
  );
}

function AlertCard({ item }) {
  const m = STATUS[item.status];
  return (
    <div className={`border rounded-xl p-3.5 ${m.bg}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">{m.icon}</span>
            <span className="text-white text-xs font-semibold truncate max-w-[150px]">{item.name}</span>
          </div>
          <div className="text-[#4b5a7a] text-[10px] font-mono mt-0.5">{item.sku}</div>
        </div>
        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${PRIORITY_COLORS[item.priority]} bg-[#0f1117]/50`}>
          {item.priority}
        </span>
      </div>
      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span className="text-[#4b5a7a]">현재재고 Current</span>
          <span className={`font-medium ${m.color}`}>{item.currentStock} ea</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#4b5a7a]">적정재고 Optimal</span>
          <span className="text-[#a0b0cc]">{item.optimalStock} ea</span>
        </div>
        {item.status === 'critical' || item.status === 'low' ? (
          <>
            <div className="flex justify-between">
              <span className="text-[#4b5a7a]">소진 예상 Stockout</span>
              <span className="text-red-400 font-medium">{item.daysUntilStockout === 999 ? '—' : `${item.daysUntilStockout}일`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#4b5a7a]">권장 발주 Order</span>
              <span className="text-amber-400 font-bold">{item.recommendedOrderQty} ea</span>
            </div>
          </>
        ) : item.status === 'overstock' ? (
          <div className="flex justify-between">
            <span className="text-[#4b5a7a]">초과 Excess</span>
            <span className="text-blue-400 font-medium">{item.currentStock - item.optimalStock} ea</span>
          </div>
        ) : item.status === 'expiring' ? (
          <div className="flex justify-between">
            <span className="text-[#4b5a7a]">유효기간 Expiry</span>
            <span className="text-orange-400 font-medium">{item.daysToExpiry}일 남음</span>
          </div>
        ) : null}
      </div>
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
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }}/>
          <span className="text-[#a0b0cc]">{p.name}:</span>
          <span className="text-white font-medium">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function exportOptim(rows) {
  const data = rows.map(r => ({
    'SKU': r.sku, '품목명': r.name, '구분': r.category, '채널': r.channel, 'Vendor': r.vendor,
    '현재재고 Current Stock': r.currentStock,
    '적정재고 Optimal Stock': r.optimalStock,
    '안전재고 Safety Stock': r.safetyStock,
    '재주문점 Reorder Point': r.reorderPoint,
    '일평균 Daily Usage': r.dailyUsage,
    '월평균 Monthly Usage': r.monthlyUsage,
    '소진예상(일) Days Until Stockout': r.daysUntilStockout === 999 ? '—' : r.daysUntilStockout,
    '재고일수 Days on Hand': r.daysOnHand === 999 ? '—' : r.daysOnHand,
    '권장발주 Rec. Order Qty': r.recommendedOrderQty || '—',
    '예상발주일 Order Date': r.recommendedOrderDate || '—',
    '리드타임 Lead Time': r.leadTimeDays,
    'MOQ': r.moq,
    '유효기간 Expiry Date': r.expirationDate,
    '재고상태 Status': r.status,
    '재고금액 Inv. Value': r.inventoryValue,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory_Optimization');
  XLSX.writeFile(wb, 'Inventory_Optimization.xlsx');
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────
export default function InventoryOptTab() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'daysUntilStockout', dir: 'asc' });
  const [expandedRow, setExpandedRow] = useState(null);

  const s = OPTIM_SUMMARY;

  const filtered = useMemo(() => {
    let rows = INVENTORY_OPTIM
      .filter(r => filterStatus === 'all' || r.status === filterStatus)
      .filter(r => filterCat === 'all' || r.category === filterCat)
      .filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.sku.toLowerCase().includes(search.toLowerCase()));

    rows.sort((a, b) => {
      const av = a[sort.key] ?? 999, bv = b[sort.key] ?? 999;
      return sort.dir === 'asc' ? av - bv : bv - av;
    });
    return rows;
  }, [filterStatus, filterCat, search, sort]);

  const pieData = Object.entries(s.cnt).map(([k, v]) => ({ name: STATUS[k]?.labelEn || k, value: v, key: k }));

  const riskChartData = s.riskTimeline.map(r => ({
    name: `${r.days}일`,
    'Critical / Stockout': r.critical,
    'Low / Reorder': r.low,
  }));

  // 상위 12개 품목 재고 vs 적정재고 비교
  const topItems = INVENTORY_OPTIM
    .filter(r => r.status !== 'optimal')
    .sort((a, b) => {
      const order = { critical:0, low:1, expiring:2, overstock:3, deadstock:4 };
      return (order[a.status]||5) - (order[b.status]||5);
    })
    .slice(0, 12)
    .map(r => ({
      name: r.name.length > 14 ? r.name.slice(0,14)+'…' : r.name,
      '현재재고': r.currentStock,
      '적정재고': r.optimalStock,
      '안전재고': r.safetyStock,
    }));

  const toggleSort = (key) =>
    setSort(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });

  const SortIcon = ({ k }) => sort.key === k
    ? (sort.dir === 'asc' ? <ChevronUp size={11}/> : <ChevronDown size={11}/>)
    : <ChevronDown size={11} className="opacity-30"/>;

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-base">AI Inventory Optimization</h2>
          <p className="text-[#4b5a7a] text-xs mt-0.5">AI 적정재고 관리 · 품목별 발주 권고 · 재고 예측</p>
        </div>
        <button onClick={() => exportOptim(filtered)}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg font-medium transition-colors">
          <Download size={14}/> Excel 다운로드
        </button>
      </div>

      {/* AI Health Score 배너 */}
      <div className={`border rounded-xl p-4 flex items-center justify-between flex-wrap gap-4
        ${s.healthScore >= 80 ? 'bg-emerald-500/5 border-emerald-500/20' : s.healthScore >= 60 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
        <HealthGauge score={s.healthScore}/>
        <div className="flex-1 min-w-[200px]">
          <div className="text-white text-sm font-semibold mb-1">재고 건강 현황 / Inventory Health Status</div>
          <p className="text-[#6b7a9a] text-xs leading-relaxed">
            {s.cnt.critical}개 품목 즉시 발주 필요 · {s.cnt.low}개 주의 · {s.cnt.expiring}개 유효기간 임박 · {s.cnt.deadstock}개 Dead Stock
          </p>
        </div>
        <div className="flex gap-4 flex-wrap">
          {[
            { label:'Stockout Risk', value: s.stockoutRisk+'건', color: 'text-red-400' },
            { label:'Days on Hand', value: s.avgDaysOnHand+'일', color: 'text-amber-400' },
            { label:'Turnover', value: s.inventoryTurnover+'×', color: 'text-blue-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className={`text-base font-bold ${color}`}>{value}</div>
              <div className="text-[#4b5a7a] text-[10px]">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label:'재고 금액\nInventory Value',     value: formatKRW(s.totalInvValue),  color:'text-white',         icon: Package },
          { label:'적정재고 커버\nCoverage %',       value: s.optimalCoverage+'%',        color: s.optimalCoverage >= 100 ? 'text-emerald-400' : 'text-amber-400', icon: CheckCircle },
          { label:'과다재고\nOverstock Value',      value: formatKRW(s.overstockValue), color:'text-blue-400',      icon: TrendingUp },
          { label:'구매 권고\nPurchase Rec.',       value: formatKRW(s.purchaseRec),    color:'text-amber-400',     icon: ShoppingCart },
          { label:'폐기 위험\nExpiring Value',      value: formatKRW(s.expiringValue),  color:'text-orange-400',    icon: Clock },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-[#131720] border border-[#1e2638] rounded-xl p-3.5">
            <div className="flex items-start justify-between mb-1">
              <div className="text-[#4b5a7a] text-[10px] leading-tight whitespace-pre-line">{label}</div>
              <Icon size={14} className={color}/>
            </div>
            <div className={`font-bold text-base ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* 상태 분포 + 리스크 타임라인 + Alert Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 상태 파이차트 */}
        <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
          <div className="text-white text-sm font-semibold mb-1">재고 상태 분포 / Status Distribution</div>
          <div className="text-[#4b5a7a] text-xs mb-3">총 {INVENTORY_OPTIM.length}개 품목</div>
          <PieChart width={200} height={160} style={{ margin: '0 auto' }}>
            <Pie data={pieData} cx={100} cy={75} innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
              {pieData.map((entry) => <Cell key={entry.key} fill={PIE_COLORS[entry.key]} />)}
            </Pie>
            <Tooltip formatter={(v, n) => [v + '개', n]} />
          </PieChart>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {Object.entries(s.cnt).map(([k, v]) => (
              <div key={k} className="flex items-center gap-1.5 text-[10px]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: PIE_COLORS[k] }}/>
                <span className="text-[#6b7a9a]">{STATUS[k]?.labelEn}</span>
                <span className="text-white font-medium ml-auto">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 30/60/90일 리스크 */}
        <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
          <div className="text-white text-sm font-semibold mb-1">재고 리스크 예측 / Risk Forecast</div>
          <div className="text-[#4b5a7a] text-xs mb-4">30 · 60 · 90일 후 위험 품목 수</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={riskChartData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2638"/>
              <XAxis dataKey="name" tick={{ fill:'#4b5a7a', fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:'#4b5a7a', fontSize:11 }} axisLine={false} tickLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend wrapperStyle={{ fontSize:11, color:'#6b7a9a' }}/>
              <Bar dataKey="Critical / Stockout" fill="#f87171" radius={[3,3,0,0]}/>
              <Bar dataKey="Low / Reorder"       fill="#fbbf24" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Alert Panel */}
        <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-red-400"/>
            <span className="text-white text-sm font-semibold">즉시 대응 필요 / Urgent Alerts</span>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin max-h-[220px]">
            {s.urgentItems.length === 0 ? (
              <div className="text-center text-[#3b4768] text-xs py-6">긴급 알림 없음</div>
            ) : s.urgentItems.map(item => (
              <AlertCard key={item.sku} item={item}/>
            ))}
          </div>
        </div>
      </div>

      {/* 현재재고 vs 적정재고 비교 */}
      <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
        <div className="text-white text-sm font-semibold mb-1">현재재고 vs 적정재고 비교 / Current vs Optimal (Non-Optimal Items)</div>
        <div className="text-[#4b5a7a] text-xs mb-4">상위 12개 조치 필요 품목</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={topItems} barSize={10}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2638"/>
            <XAxis dataKey="name" tick={{ fill:'#4b5a7a', fontSize:10 }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={40}/>
            <YAxis tick={{ fill:'#4b5a7a', fontSize:11 }} axisLine={false} tickLine={false}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Legend wrapperStyle={{ fontSize:11, color:'#6b7a9a' }}/>
            <Bar dataKey="현재재고" fill="#6366f1" radius={[3,3,0,0]}/>
            <Bar dataKey="적정재고" fill="#22d3ee" radius={[3,3,0,0]}/>
            <Bar dataKey="안전재고" fill="#f59e0b" radius={[3,3,0,0]}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 품목별 상세 테이블 */}
      <div className="bg-[#131720] border border-[#1e2638] rounded-xl overflow-hidden">
        {/* 필터 바 */}
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-[#1e2638]">
          <div className="flex gap-1 bg-[#0f1117] border border-[#1e2638] rounded-lg p-0.5">
            {[['all','전체 All'], ...Object.keys(STATUS).map(k => [k, STATUS[k].labelEn])].map(([id, lbl]) => (
              <button key={id} onClick={() => setFilterStatus(id)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${filterStatus===id?'bg-indigo-600 text-white':'text-[#6b7a9a] hover:text-white'}`}>
                {lbl}
                {id !== 'all' && <span className="ml-1 opacity-70">{s.cnt[id]||0}</span>}
              </button>
            ))}
          </div>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
            className="bg-[#1a2235] border border-[#1e2638] text-[#a0b0cc] text-xs rounded-lg px-3 py-1.5 outline-none">
            <option value="all">전체 구분</option>
            <option value="Reagent">Reagent</option>
            <option value="Consumable">Consumable</option>
          </select>
          <div className="flex items-center gap-2 bg-[#1a2235] border border-[#1e2638] rounded-lg px-3 py-1.5">
            <Search size={12} className="text-[#4b5a7a]"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="SKU / 품목명" className="bg-transparent text-[#a0b0cc] text-xs outline-none w-32 placeholder:text-[#2d3a55]"/>
          </div>
          <span className="text-[#4b5a7a] text-xs ml-auto">{filtered.length}개</span>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1e2638] bg-[#0f1117]">
                {[
                  ['sku','SKU'],['name','품목명 Item Name'],['status','상태 Status'],
                  ['currentStock','현재재고\nCurrent'],['optimalStock','적정재고\nOptimal'],
                  ['safetyStock','안전재고\nSafety'],['reorderPoint','재주문점\nReorder Pt.'],
                  ['dailyUsage','일평균\nDaily'],['monthlyUsage','월평균\nMonthly'],
                  ['daysUntilStockout','소진일\nDays Out'],['daysOnHand','재고일수\nDays on Hand'],
                  ['recommendedOrderQty','권장발주\nRec. Order'],['recommendedOrderDate','발주일\nOrder Date'],
                ].map(([key, label]) => (
                  <th key={key}
                    onClick={() => ['currentStock','optimalStock','daysUntilStockout','dailyUsage','monthlyUsage','daysOnHand','recommendedOrderQty'].includes(key) && toggleSort(key)}
                    className={`text-left text-[#4b5a7a] font-medium px-3 py-2.5 whitespace-pre-line leading-tight
                      ${['currentStock','daysUntilStockout','dailyUsage','monthlyUsage','daysOnHand','recommendedOrderQty'].includes(key)?'cursor-pointer hover:text-[#6b7a9a]':''}`}>
                    <div className="flex items-center gap-1">
                      {label}
                      {['currentStock','daysUntilStockout','dailyUsage','monthlyUsage','daysOnHand','recommendedOrderQty'].includes(key) && <SortIcon k={key}/>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2235]">
              {filtered.map(r => {
                const isExp = expandedRow === r.sku;
                return [
                  <tr key={r.sku}
                    onClick={() => setExpandedRow(isExp ? null : r.sku)}
                    className="hover:bg-[#1a2235]/60 cursor-pointer transition-colors">
                    <td className="px-3 py-2.5 text-indigo-400 font-mono text-[11px]">{r.sku}</td>
                    <td className="px-3 py-2.5 text-[#a0b0cc] max-w-[160px]">
                      <div className="truncate">{r.name}</div>
                    </td>
                    <td className="px-3 py-2.5"><StatusBadge status={r.status}/></td>
                    <td className={`px-3 py-2.5 text-right font-semibold ${STATUS[r.status]?.color}`}>{r.currentStock}</td>
                    <td className="px-3 py-2.5 text-right text-[#a0b0cc]">{r.optimalStock}</td>
                    <td className="px-3 py-2.5 text-right text-[#6b7a9a]">{r.safetyStock}</td>
                    <td className="px-3 py-2.5 text-right text-[#6b7a9a]">{r.reorderPoint}</td>
                    <td className="px-3 py-2.5 text-right text-[#a0b0cc]">{r.dailyUsage}</td>
                    <td className="px-3 py-2.5 text-right text-[#a0b0cc]">{r.monthlyUsage}</td>
                    <td className={`px-3 py-2.5 text-right font-medium ${r.daysUntilStockout <= 7 ? 'text-red-400' : r.daysUntilStockout <= 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {r.daysUntilStockout === 999 ? '∞' : r.daysUntilStockout+'일'}
                    </td>
                    <td className="px-3 py-2.5 text-right text-[#a0b0cc]">{r.daysOnHand === 999 ? '∞' : r.daysOnHand+'일'}</td>
                    <td className={`px-3 py-2.5 text-right font-bold ${r.recommendedOrderQty > 0 ? 'text-amber-400' : 'text-[#2d3a55]'}`}>
                      {r.recommendedOrderQty > 0 ? r.recommendedOrderQty : '—'}
                    </td>
                    <td className={`px-3 py-2.5 text-right text-[11px] ${r.recommendedOrderDate === '즉시 발주' ? 'text-red-400 font-bold' : 'text-[#6b7a9a]'}`}>
                      {r.recommendedOrderDate || '—'}
                    </td>
                  </tr>,
                  isExp && (
                    <tr key={r.sku + '-detail'} className="bg-[#0f1117]">
                      <td colSpan={13} className="px-4 py-3">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                          {/* 예측 */}
                          <div>
                            <div className="text-[#4b5a7a] text-[11px] font-medium mb-2">재고 예측 / Stock Forecast</div>
                            <div className="flex gap-3">
                              {r.forecast.map(f => (
                                <div key={f.days} className={`flex-1 rounded-lg p-2.5 border text-center
                                  ${f.stockout ? 'bg-red-500/10 border-red-500/30' : f.belowReorder ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                                  <div className="text-[#4b5a7a] text-[10px]">{f.days}일 후</div>
                                  <div className={`font-bold text-sm ${f.stockout ? 'text-red-400' : f.belowReorder ? 'text-amber-400' : 'text-emerald-400'}`}>
                                    {f.projectedStock} ea
                                  </div>
                                  <div className="text-[10px] mt-0.5">
                                    {f.stockout ? '⚠ Stockout' : f.belowReorder ? '↓ Reorder' : '✓ OK'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* AI 코멘트 */}
                          <div>
                            <div className="text-[#4b5a7a] text-[11px] font-medium mb-2">AI 권고사항 / AI Recommendation</div>
                            <div className="bg-[#131720] border border-[#1e2638] rounded-lg p-3">
                              <p className="text-[#a0b0cc] text-xs leading-relaxed">{r.aiComment}</p>
                              <div className="flex gap-3 mt-2 text-[10px] text-[#4b5a7a]">
                                <span>리드타임: {r.leadTimeDays}일</span>
                                <span>MOQ: {r.moq}개</span>
                                <span>유효기간: {r.expirationDate}</span>
                                <span>추세: {r.trendFactor > 1 ? '↑' : '↓'}{r.trendFactor}×</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                ];
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[#1e2638] px-4 py-2 flex items-center justify-between">
          <span className="text-[#4b5a7a] text-[11px]">{filtered.length}개 표시 · 행 클릭 시 상세 확장</span>
          <span className="text-[11px] text-amber-400 font-medium">
            구매권고 총액: {formatKRW(s.purchaseRec)}
          </span>
        </div>
      </div>

      {/* AI 분석 요약 */}
      <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={15} className="text-indigo-400"/>
          <span className="text-white text-sm font-semibold">AI 종합 분석 / AI Analysis Summary</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {[
            {
              title: '🔴 즉시 조치 필요',
              items: INVENTORY_OPTIM.filter(r => r.status === 'critical').slice(0,3)
                .map(r => `• ${r.name}: ${r.currentStock}개 보유, ${r.daysUntilStockout}일 내 소진, ${r.recommendedOrderQty}개 발주 권고`),
            },
            {
              title: '🔵 발주 연기 권고',
              items: INVENTORY_OPTIM.filter(r => r.status === 'overstock').slice(0,3)
                .map(r => `• ${r.name}: 적정재고 ${r.optimalStock}개 대비 ${r.currentStock}개 보유 (${(r.currentStock/r.optimalStock).toFixed(1)}배)`),
            },
            {
              title: '🟠 유효기간 임박',
              items: INVENTORY_OPTIM.filter(r => r.status === 'expiring').slice(0,3)
                .map(r => `• ${r.name}: ${r.daysToExpiry}일 남음 (${r.expirationDate}), 우선 사용 권고`),
            },
            {
              title: '⚫ Dead Stock 검토',
              items: INVENTORY_OPTIM.filter(r => r.status === 'deadstock').slice(0,3)
                .map(r => `• ${r.name}: 90일 이상 미사용, 재고금액 ${formatKRW(r.inventoryValue)}`),
            },
          ].map(({ title, items }) => (
            <div key={title} className="bg-[#0f1117] border border-[#1e2638] rounded-xl p-3.5">
              <div className="text-white text-xs font-semibold mb-2">{title}</div>
              {items.length === 0
                ? <p className="text-[#2d3a55] text-xs">해당 품목 없음</p>
                : items.map((t, i) => <p key={i} className="text-[#6b7a9a] text-[11px] mb-1 leading-relaxed">{t}</p>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
