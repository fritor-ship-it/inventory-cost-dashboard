import { useState } from 'react';
import { Save, Plus, Trash2, Edit2, Upload } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function SettingsTab() {
  const { data } = useData();
  const [skuList, setSkuList] = useState(data.skuMaster);
  const [catList, setCatList] = useState(data.costCategories || []);
  const [activeSection, setActiveSection] = useState('sku');
  const [saved, setSaved] = useState(false);

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

      <div className="flex gap-2">
        {[
          { id: 'sku', label: 'SKU Master' },
          { id: 'cost', label: 'Cost Categories' },
          { id: 'mapping', label: '매핑 규칙' },
          { id: 'system', label: '시스템 설정' },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setActiveSection(id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeSection===id?'bg-indigo-600 text-white':'bg-[#1a2235] text-[#6b7a9a] hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

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
