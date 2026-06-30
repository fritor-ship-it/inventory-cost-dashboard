import { useState, useMemo } from 'react';
import {
  CheckCircle, AlertTriangle, XCircle, Link2, Link2Off,
  Search, RefreshCw, Save, ChevronDown, Plus, Download
} from 'lucide-react';
import { SKU_MAPPINGS, QB_ITEMS, FISHBOWL_ITEMS } from '../data/mockData';
import * as XLSX from 'xlsx';

const STATUS_META = {
  matched:   { label: '매칭 완료', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle },
  exception: { label: '검토 필요', color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   icon: AlertTriangle },
  fb_only:   { label: 'FB 전용',   color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',    icon: Link2Off },
  qb_only:   { label: 'QB 전용',   color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20',    icon: Link2Off },
  unmatched: { label: '미매칭',    color: 'text-gray-400',    bg: 'bg-gray-500/10 border-gray-500/20',    icon: XCircle },
};

const METHOD_META = {
  exact_sku:  { label: 'SKU 완전일치', color: 'text-emerald-400 bg-emerald-500/10' },
  auto_name:  { label: '이름 유사 매칭', color: 'text-blue-400 bg-blue-500/10' },
  manual:     { label: '수동 매칭', color: 'text-violet-400 bg-violet-500/10' },
  none:       { label: '—', color: 'text-gray-500 bg-transparent' },
};

function SimilarityBar({ value }) {
  const color = value >= 90 ? 'bg-emerald-500' : value >= 70 ? 'bg-blue-500' : value >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#1e2638] rounded-full overflow-hidden w-16">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-[11px] font-mono ${value >= 90 ? 'text-emerald-400' : value >= 70 ? 'text-blue-400' : value >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
        {value}%
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.unmatched;
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium ${m.bg} ${m.color}`}>
      <Icon size={10} />{m.label}
    </span>
  );
}

function QBSelector({ value, onChange }) {
  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value || null)}
      className="bg-[#1a2235] border border-[#1e2638] text-[#a0b0cc] text-[11px] rounded-lg px-2 py-1.5 outline-none w-full max-w-[220px] cursor-pointer hover:border-indigo-500/50 transition-colors"
    >
      <option value="">— QB 품목 선택 —</option>
      {QB_ITEMS.map(q => (
        <option key={q.qbCode} value={q.qbCode}>{q.qbCode} · {q.qbName}</option>
      ))}
    </select>
  );
}

function exportMappings(rows) {
  const data = rows.map(r => ({
    'Fishbowl SKU': r.fbSku || '',
    'Fishbowl 품목명': r.fbName || '',
    'QB 코드': r.qbCode || '',
    'QB 품목명': r.qbName || '',
    'Master SKU': r.masterSku || '',
    '매칭 상태': STATUS_META[r.status]?.label || r.status,
    '매칭 방법': METHOD_META[r.matchMethod]?.label || r.matchMethod,
    '유사도(%)': r.similarity,
    '확정 여부': r.confirmed ? '확정' : '미확정',
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [14,22,12,24,12,12,14,10,10].map(w => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'SKU_Mapping');
  XLSX.writeFile(wb, 'SKU_Mapping.xlsx');
}

export default function SKUMappingTab() {
  const [mappings, setMappings] = useState(SKU_MAPPINGS);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const stats = useMemo(() => ({
    total: mappings.length,
    matched: mappings.filter(m => m.status === 'matched' && m.confirmed).length,
    exception: mappings.filter(m => m.status === 'exception').length,
    fb_only: mappings.filter(m => m.status === 'fb_only').length,
    qb_only: mappings.filter(m => m.status === 'qb_only').length,
    unconfirmed: mappings.filter(m => !m.confirmed).length,
  }), [mappings]);

  const filtered = useMemo(() => mappings.filter(m => {
    if (filter !== 'all' && m.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (m.fbSku || '').toLowerCase().includes(q)
        || (m.fbName || '').toLowerCase().includes(q)
        || (m.qbCode || '').toLowerCase().includes(q)
        || (m.qbName || '').toLowerCase().includes(q);
    }
    return true;
  }), [mappings, filter, search]);

  function confirmMapping(id) {
    setMappings(prev => prev.map(m => m.id === id ? { ...m, confirmed: true, status: m.status === 'exception' ? 'matched' : m.status } : m));
  }

  function updateQBMatch(id, qbCode) {
    const qbItem = QB_ITEMS.find(q => q.qbCode === qbCode);
    setMappings(prev => prev.map(m => {
      if (m.id !== id) return m;
      return {
        ...m,
        qbCode: qbItem?.qbCode || null,
        qbName: qbItem?.qbName || null,
        status: qbItem ? 'exception' : 'fb_only',
        matchMethod: qbItem ? 'manual' : 'none',
        similarity: qbItem ? 80 : 0,
        confirmed: false,
      };
    }));
    setEditingId(null);
  }

  function autoMatchAll() {
    setMappings(prev => prev.map(m => {
      if (m.confirmed || m.status === 'matched') return m;
      if (!m.fbName) return m;
      // 이름 기반 간이 유사도 매칭
      let bestMatch = null, bestScore = 0;
      QB_ITEMS.forEach(q => {
        const fbWords = m.fbName.toLowerCase().split(/\s+/);
        const qbWords = q.qbName.toLowerCase().split(/\s+/);
        const common = fbWords.filter(w => qbWords.some(qw => qw.includes(w) || w.includes(qw)));
        const score = Math.round((common.length * 2) / (fbWords.length + qbWords.length) * 100);
        if (score > bestScore) { bestScore = score; bestMatch = q; }
      });
      if (bestMatch && bestScore >= 50) {
        return {
          ...m, qbCode: bestMatch.qbCode, qbName: bestMatch.qbName,
          status: bestScore >= 85 ? 'matched' : 'exception',
          matchMethod: 'auto_name', similarity: bestScore, confirmed: false,
        };
      }
      return m;
    }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const FILTER_TABS = [
    { id: 'all',       label: '전체',      count: stats.total },
    { id: 'matched',   label: '매칭 완료', count: stats.matched },
    { id: 'exception', label: '검토 필요', count: stats.exception },
    { id: 'fb_only',   label: 'FB 전용',   count: stats.fb_only },
    { id: 'qb_only',   label: 'QB 전용',   count: stats.qb_only },
  ];

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-base">SKU Mapping</h2>
          <p className="text-[#4b5a7a] text-xs mt-0.5">Fishbowl SKU ↔ QuickBooks 품목코드 매칭 관리</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportMappings(mappings)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1a2235] hover:bg-[#1e2a42] border border-[#1e2638] text-[#6b7a9a] hover:text-white text-xs rounded-lg transition-colors">
            <Download size={13} /> Excel
          </button>
          <button onClick={autoMatchAll}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1a2235] hover:bg-[#1e2a42] border border-[#1e2638] text-[#6b8ac4] hover:text-white text-xs rounded-lg transition-colors font-medium">
            <RefreshCw size={13} /> 자동 매칭
          </button>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg transition-colors font-medium">
            <Save size={13} />{saved ? '저장됨!' : '저장'}
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-5 gap-2.5">
        {[
          { label: '전체 품목', value: stats.total, color: 'text-white' },
          { label: '매칭 완료', value: stats.matched, color: 'text-emerald-400' },
          { label: '검토 필요', value: stats.exception, color: 'text-amber-400' },
          { label: 'FB 전용', value: stats.fb_only, color: 'text-blue-400' },
          { label: 'QB 전용', value: stats.qb_only, color: 'text-rose-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#131720] border border-[#1e2638] rounded-xl p-3 text-center">
            <div className="text-[#4b5a7a] text-[11px] mb-1">{label}</div>
            <div className={`font-bold text-xl ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* 미확정 배너 */}
      {stats.unconfirmed > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
          <AlertTriangle size={15} className="text-amber-400 shrink-0" />
          <span className="text-amber-300 text-xs">
            <span className="font-semibold">{stats.unconfirmed}개</span> 매핑이 미확정 상태입니다. 검토 후 확정 버튼을 눌러주세요.
          </span>
        </div>
      )}

      {/* 필터 탭 + 검색 */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1 bg-[#131720] border border-[#1e2638] rounded-xl p-1">
          {FILTER_TABS.map(({ id, label, count }) => (
            <button key={id} onClick={() => setFilter(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${filter === id ? 'bg-indigo-600 text-white' : 'text-[#6b7a9a] hover:text-white'}`}>
              {label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filter === id ? 'bg-white/20' : 'bg-[#1e2638]'}`}>{count}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-[#1a2235] border border-[#1e2638] rounded-lg px-3 py-2">
          <Search size={13} className="text-[#4b5a7a]" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="FB SKU / QB 코드 / 품목명 검색"
            className="bg-transparent text-[#a0b0cc] text-xs outline-none w-48 placeholder:text-[#2d3a55]" />
        </div>
        <span className="text-[#4b5a7a] text-xs ml-auto">{filtered.length}건</span>
      </div>

      {/* 테이블 */}
      <div className="bg-[#131720] border border-[#1e2638] rounded-xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#1e2638] bg-[#0f1117]">
                <th className="text-left text-[#4b5a7a] font-medium px-4 py-3 whitespace-nowrap">Fishbowl SKU</th>
                <th className="text-left text-[#4b5a7a] font-medium px-4 py-3 whitespace-nowrap">Fishbowl 품목명</th>
                <th className="text-center text-[#4b5a7a] font-medium px-3 py-3 whitespace-nowrap">연결</th>
                <th className="text-left text-[#4b5a7a] font-medium px-4 py-3 whitespace-nowrap">QB 코드</th>
                <th className="text-left text-[#4b5a7a] font-medium px-4 py-3 whitespace-nowrap">QB 품목명</th>
                <th className="text-left text-[#4b5a7a] font-medium px-4 py-3 whitespace-nowrap">Master SKU</th>
                <th className="text-left text-[#4b5a7a] font-medium px-4 py-3 whitespace-nowrap">유사도</th>
                <th className="text-left text-[#4b5a7a] font-medium px-4 py-3 whitespace-nowrap">매칭 방법</th>
                <th className="text-left text-[#4b5a7a] font-medium px-4 py-3 whitespace-nowrap">상태</th>
                <th className="text-left text-[#4b5a7a] font-medium px-4 py-3 whitespace-nowrap">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2235]">
              {filtered.map(m => {
                const isEditing = editingId === m.id;
                const mm = METHOD_META[m.matchMethod] || METHOD_META.none;
                return (
                  <tr key={m.id} className={`hover:bg-[#1a2235]/50 transition-colors ${!m.confirmed && m.status !== 'fb_only' && m.status !== 'qb_only' ? 'bg-amber-500/3' : ''}`}>
                    {/* FB SKU */}
                    <td className="px-4 py-3">
                      {m.fbSku
                        ? <span className="font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded text-[11px]">{m.fbSku}</span>
                        : <span className="text-[#2d3a55] text-[11px]">—</span>}
                    </td>
                    {/* FB 품목명 */}
                    <td className="px-4 py-3 text-[#a0b0cc] max-w-[160px]">
                      <div className="truncate">{m.fbName || <span className="text-[#2d3a55]">—</span>}</div>
                    </td>
                    {/* 연결 아이콘 */}
                    <td className="px-3 py-3 text-center">
                      {m.qbCode && m.fbSku
                        ? <Link2 size={14} className={m.confirmed ? 'text-emerald-400' : 'text-amber-400'} />
                        : <Link2Off size={14} className="text-[#3b4768]" />}
                    </td>
                    {/* QB 코드 */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <QBSelector value={m.qbCode} onChange={v => updateQBMatch(m.id, v)} />
                      ) : m.qbCode
                        ? <span className="font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-[11px]">{m.qbCode}</span>
                        : (
                          <button onClick={() => setEditingId(m.id)}
                            className="flex items-center gap-1 text-[#3b4768] hover:text-indigo-400 text-[11px] transition-colors">
                            <Plus size={11} /> QB 선택
                          </button>
                        )}
                    </td>
                    {/* QB 품목명 */}
                    <td className="px-4 py-3 text-[#6b7a9a] max-w-[160px]">
                      {isEditing ? null : <div className="truncate">{m.qbName || <span className="text-[#2d3a55]">—</span>}</div>}
                    </td>
                    {/* Master SKU */}
                    <td className="px-4 py-3">
                      {m.masterSku
                        ? <span className="font-mono text-indigo-400 text-[11px]">{m.masterSku}</span>
                        : <span className="text-[#2d3a55] text-[11px]">미등록</span>}
                    </td>
                    {/* 유사도 */}
                    <td className="px-4 py-3 min-w-[110px]">
                      {m.similarity > 0 ? <SimilarityBar value={m.similarity} /> : <span className="text-[#2d3a55]">—</span>}
                    </td>
                    {/* 매칭 방법 */}
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${mm.color}`}>{mm.label}</span>
                    </td>
                    {/* 상태 */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={m.status} />
                    </td>
                    {/* 액션 */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {!m.confirmed && m.qbCode && (
                          <button onClick={() => confirmMapping(m.id)}
                            className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] rounded font-medium transition-colors border border-emerald-500/20">
                            확정
                          </button>
                        )}
                        {m.confirmed && (
                          <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                            <CheckCircle size={11} /> 확정됨
                          </span>
                        )}
                        <button onClick={() => setEditingId(isEditing ? null : m.id)}
                          className={`px-2 py-1 text-[10px] rounded font-medium transition-colors border ${isEditing ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-[#1a2235] border-[#1e2638] text-[#6b7a9a] hover:text-white'}`}>
                          {isEditing ? '취소' : '변경'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[#1e2638] px-4 py-2 flex items-center justify-between">
          <span className="text-[#4b5a7a] text-[11px]">{filtered.length}개 표시 · 전체 {mappings.length}개</span>
          <span className="text-[11px] text-emerald-400 font-medium">
            확정률 {Math.round(mappings.filter(m => m.confirmed).length / mappings.length * 100)}%
          </span>
        </div>
      </div>

      {/* 안내 박스 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {[
          { title: 'SKU 완전일치', desc: 'FB SKU와 QB 코드의 숫자 부분이 완전히 동일한 경우 자동 확정됩니다.', color: 'border-emerald-500/20 bg-emerald-500/5' },
          { title: '이름 유사 매칭', desc: '품목명 토큰 유사도 50% 이상이면 자동 제안되지만 수동 확정이 필요합니다.', color: 'border-blue-500/20 bg-blue-500/5' },
          { title: '수동 매칭',      desc: 'FB 전용 또는 미매칭 품목은 QB 선택 버튼으로 직접 연결 후 확정하세요.', color: 'border-violet-500/20 bg-violet-500/5' },
        ].map(({ title, desc, color }) => (
          <div key={title} className={`border rounded-xl p-3.5 ${color}`}>
            <div className="text-white text-xs font-semibold mb-1">{title}</div>
            <p className="text-[#6b7a9a] text-[11px] leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
