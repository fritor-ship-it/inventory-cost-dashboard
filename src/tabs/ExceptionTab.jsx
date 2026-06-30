import { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, Download } from 'lucide-react';
import { useData } from '../context/DataContext';
import { exportExceptions } from '../utils/exportUtils';

const TYPE_LABELS = {
  SKU_MISMATCH: 'SKU 불일치', QB_FB_DIFF: 'QB/FB 불일치', MISSING_CLOSING: '기말재고 누락',
  COST_SPIKE: '원가율 급등락', NO_LEDGER: '수불부 미등재', VARIANCE_30: '30% 이상 변동', NAME_MISMATCH: '품목명 불일치',
};
const TYPE_COLORS = {
  SKU_MISMATCH: 'bg-red-500/10 text-red-400 border-red-500/20', QB_FB_DIFF: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  MISSING_CLOSING: 'bg-amber-500/10 text-amber-400 border-amber-500/20', COST_SPIKE: 'bg-red-500/10 text-red-400 border-red-500/20',
  NO_LEDGER: 'bg-violet-500/10 text-violet-400 border-violet-500/20', VARIANCE_30: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  NAME_MISMATCH: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

function SeverityIcon({ s }) {
  if (s === 'high') return <AlertTriangle size={14} className="text-red-400 shrink-0" />;
  if (s === 'medium') return <AlertCircle size={14} className="text-amber-400 shrink-0" />;
  return <Info size={14} className="text-blue-400 shrink-0" />;
}

export default function ExceptionTab() {
  const { data } = useData();
  const { exceptions } = data;
  const [filterSev, setFilterSev] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filtered = exceptions
    .filter(e => filterSev === 'all' || e.severity === filterSev)
    .filter(e => filterType === 'all' || e.type === filterType);

  const counts = {
    high: exceptions.filter(e => e.severity === 'high').length,
    medium: exceptions.filter(e => e.severity === 'medium').length,
    low: exceptions.filter(e => e.severity === 'low').length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-base">이상 항목 리스트</h2>
          <p className="text-[#4b5a7a] text-xs mt-0.5">자동 탐지된 데이터 이상 및 불일치 항목</p>
        </div>
        <button onClick={() => exportExceptions(exceptions)}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors font-medium">
          <Download size={14} /> Excel 다운로드
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'High', count: counts.high, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Medium', count: counts.medium, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Low', count: counts.low, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`border rounded-xl p-4 ${bg}`}>
            <div className="text-[#4b5a7a] text-xs mb-1">{label} 심각도</div>
            <div className={`font-bold text-2xl ${color}`}>{count}건</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <select value={filterSev} onChange={e => setFilterSev(e.target.value)}
          className="bg-[#1a2235] border border-[#1e2638] text-[#a0b0cc] text-xs rounded-lg px-3 py-2 outline-none">
          <option value="all">전체 심각도</option>
          <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="bg-[#1a2235] border border-[#1e2638] text-[#a0b0cc] text-xs rounded-lg px-3 py-2 outline-none">
          <option value="all">전체 유형</option>
          {Object.keys(TYPE_LABELS).map(k => <option key={k} value={k}>{TYPE_LABELS[k]}</option>)}
        </select>
        <div className="text-[#4b5a7a] text-xs self-center ml-2">{filtered.length}건 표시</div>
      </div>

      <div className="space-y-2.5">
        {filtered.map(ex => (
          <div key={ex.id} className="bg-[#131720] border border-[#1e2638] rounded-xl p-4 hover:border-[#2a3a5a] transition-colors">
            <div className="flex items-start gap-3">
              <SeverityIcon s={ex.severity} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-white text-sm font-medium">{ex.name}</span>
                  <span className="text-[#4b5a7a] font-mono text-xs">{ex.sku}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${TYPE_COLORS[ex.type] || 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                    {TYPE_LABELS[ex.type] || ex.type}
                  </span>
                  <span className="text-[#2d3a55] text-[11px]">{ex.month}</span>
                </div>
                <p className="text-[#6b7a9a] text-xs leading-relaxed">{ex.message}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="text-[10px] text-[#3b4768]">조치:</span>
                  <span className="text-[10px] text-[#6b8ac4] font-medium">{ex.action}</span>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-1 rounded-full font-bold shrink-0 ${
                ex.severity==='high'?'bg-red-500/20 text-red-400':ex.severity==='medium'?'bg-amber-500/20 text-amber-400':'bg-blue-500/20 text-blue-400'}`}>
                {ex.severity.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#3b4768]">
            <AlertTriangle size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">조건에 맞는 이상 항목이 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
