import { useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Loader2, FileSpreadsheet, RefreshCw, Calendar } from 'lucide-react';

const YEARS  = [2023, 2024, 2025, 2026];
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
import { processUploadedFiles } from '../utils/parseUtils';
import { exportInventoryLedger, exportCostAnalysis, exportExceptions } from '../utils/exportUtils';
import { useData } from '../context/DataContext';

// 결과물 3개 자동 다운로드
async function autoDownloadResults(result) {
  const lastMonth = result.months?.[result.months.length - 1] || '';
  const allRows = (result.skuMaster || []).map(s => {
    const arr = result.inventoryData?.[s.sku];
    return arr ? { ...s, ...arr[arr.length - 1] } : null;
  }).filter(Boolean);
  exportInventoryLedger(allRows, lastMonth);
  await new Promise(r => setTimeout(r, 300));
  exportCostAnalysis(result.monthlySummary || []);
  await new Promise(r => setTimeout(r, 300));
  exportExceptions(result.exceptions || []);
}

// 3개 파일만
const FILE_DEFS = [
  {
    id: 'fishbowl', required: true, label: 'Fishbowl 재고대장',
    desc: 'Inventory Valuation Summary (Fishbowl에서 내보낸 파일)',
    color: 'blue',
  },
  {
    id: 'qb', required: true, label: 'QuickBooks (Purchase/GL)',
    desc: 'Transaction Detail 입고 내역 파일',
    color: 'emerald',
  },
  {
    id: 'sku', required: true, label: 'SKU Master',
    desc: '품목 마스터 데이터 (xlsx / csv)',
    color: 'amber',
  },
];

const REQUIRED_COUNT = FILE_DEFS.length;

const C = {
  blue:    { border: 'border-blue-500/30 hover:border-blue-400/60',    icon: 'text-blue-400',    btn: 'bg-blue-500/10 text-blue-400' },
  emerald: { border: 'border-emerald-500/30 hover:border-emerald-400/60', icon: 'text-emerald-400', btn: 'bg-emerald-500/10 text-emerald-400' },
  amber:   { border: 'border-amber-500/30 hover:border-amber-400/60',  icon: 'text-amber-400',   btn: 'bg-amber-500/10 text-amber-400' },
};

export default function UploadModal({ onClose }) {
  const { loadData, resetToDemo, data } = useData();
  const [files, setFiles]   = useState({});
  const [status, setStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [year,  setYear]  = useState(2026);
  const [month, setMonth] = useState(6);

  const selectedMonth = `${year}-${String(month).padStart(2, '0')}`;

  const uploaded = Object.keys(files).length;
  const allUploaded = FILE_DEFS.every(f => files[f.id]);

  function handleFile(id, file) {
    if (!file) return;
    setFiles(prev => ({ ...prev, [id]: file }));
  }

  function removeFile(id) {
    setFiles(prev => { const n = { ...prev }; delete n[id]; return n; });
  }

  async function handleProcess() {
    if (!allUploaded) return;
    setStatus('processing');
    setErrorMsg('');
    try {
      const result = await processUploadedFiles(files);
      loadData(result);
      setStatus('done');
      await autoDownloadResults(result);
    } catch (err) {
      setErrorMsg(err.message || '파일 처리 중 오류가 발생했습니다. 파일 형식을 확인해 주세요.');
      setStatus('error');
    }
  }

  function handleReset() {
    resetToDemo();
    setFiles({});
    setStatus('idle');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative ml-auto w-full max-w-lg h-full bg-[#0f1117] border-l border-[#1e2638] flex flex-col shadow-2xl overflow-hidden">

        {/* 헤더 */}
        <div className="px-6 py-4 border-b border-[#1e2638] shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h2 className="text-white font-bold text-base mb-1">Excel 파일 업로드</h2>
              {/* 기준월 선택 */}
              <div className="flex items-center gap-2 mt-2">
                <Calendar size={12} className="text-[#4b5a7a] shrink-0" />
                <span className="text-[11px] text-[#4b5a7a]">기준월</span>
                <select value={year} onChange={e => setYear(Number(e.target.value))}
                  className="bg-[#1a2235] border border-[#1e2638] text-[#a0b0cc] text-[11px] rounded-lg px-2 py-1 outline-none hover:border-indigo-500/40 transition-colors">
                  {YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
                </select>
                <select value={month} onChange={e => setMonth(Number(e.target.value))}
                  className="bg-[#1a2235] border border-[#1e2638] text-[#a0b0cc] text-[11px] rounded-lg px-2 py-1 outline-none hover:border-indigo-500/40 transition-colors">
                  {MONTHS.map(m => <option key={m} value={m}>{String(m).padStart(2,'0')}월</option>)}
                </select>
                <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">{selectedMonth}</span>
              </div>
            </div>
            <button type="button" onClick={onClose}
              className="text-[#4b5a7a] hover:text-white p-1.5 rounded-lg hover:bg-[#1a2235] transition-colors shrink-0">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 파일 업로드 목록 */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 scrollbar-thin">
          {FILE_DEFS.map(({ id, label, desc, color }) => {
            const file = files[id];
            const cc = C[color];
            return (
              <div key={id}>
                {/* 파일명 + 설명 */}
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet size={14} className={cc.icon} />
                  <span className="text-[#a0b0cc] text-sm font-semibold">{label}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-red-500/20 text-red-400">필수</span>
                </div>
                <p className="text-[#2d3a55] text-[11px] mb-2 pl-5">{desc}</p>

                {/* 업로드 영역 — label 클릭 시 파일선택창 열림 */}
                <label
                  htmlFor={`file-input-${id}`}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all
                    ${file
                      ? 'border-emerald-500/30 bg-emerald-500/5 cursor-default'
                      : `border-dashed ${cc.border} bg-[#0f1117] cursor-pointer hover:bg-[#131720]`
                    }`}
                  style={{ display: 'flex' }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleFile(id, e.dataTransfer.files[0]); }}
                >
                  <input
                    id={`file-input-${id}`}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={e => { handleFile(id, e.target.files[0]); e.target.value = ''; }}
                  />

                  {file ? (
                    <>
                      <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-emerald-400 text-sm font-medium truncate">{file.name}</div>
                        <div className="text-[#4b5a7a] text-[11px] mt-0.5">{(file.size / 1024).toFixed(1)} KB · 업로드 완료</div>
                      </div>
                      <button
                        type="button"
                        onClick={e => { e.preventDefault(); e.stopPropagation(); removeFile(id); }}
                        className="text-[#3b4768] hover:text-red-400 shrink-0 transition-colors p-1"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload size={18} className={`${cc.icon} shrink-0`} />
                      <div>
                        <div className="text-[#a0b0cc] text-sm font-medium">클릭하여 파일 선택</div>
                        <div className="text-[#2d3a55] text-[11px] mt-0.5">xlsx · xls · csv · 드래그&드롭 가능</div>
                      </div>
                    </>
                  )}
                </label>
              </div>
            );
          })}
        </div>

        {/* 하단 */}
        <div className="px-6 py-4 border-t border-[#1e2638] space-y-3 shrink-0">
          {/* 진행 표시 */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#4b5a7a]">업로드 현황</span>
            <span className={allUploaded ? 'text-emerald-400 font-semibold' : 'text-[#4b5a7a]'}>
              {uploaded} / {REQUIRED_COUNT} {allUploaded ? '✓ 분석 가능' : ''}
            </span>
          </div>
          <div className="h-1.5 bg-[#1e2638] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${allUploaded ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              style={{ width: `${(uploaded / REQUIRED_COUNT) * 100}%` }}
            />
          </div>

          {/* 에러 */}
          {status === 'error' && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-xs">{errorMsg}</p>
            </div>
          )}

          {/* 성공 */}
          {status === 'done' && (
            <div className="flex items-start gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-emerald-400 text-xs font-semibold">분석 완료! 결과물 3개가 자동으로 다운로드됩니다.</p>
                <p className="text-[#4b5a7a] text-[11px] mt-0.5">재고수불부 · 원가분석 · 이상항목 리스트 Excel</p>
              </div>
            </div>
          )}

          {/* 분석 시작 버튼 */}
          <button
            type="button"
            onClick={handleProcess}
            disabled={!allUploaded || status === 'processing' || status === 'done'}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
              ${status === 'done'
                ? 'bg-emerald-600/30 text-emerald-400 cursor-default'
                : allUploaded && status !== 'processing'
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  : 'bg-[#1a2235] text-[#3b4768] cursor-not-allowed'
              }`}
          >
            {status === 'processing'
              ? <><Loader2 size={16} className="animate-spin" /> 분석 중...</>
              : status === 'done'
                ? <><CheckCircle size={16} /> 분석 완료</>
                : <>파일 분석 시작 {!allUploaded && `(${REQUIRED_COUNT - uploaded}개 더 필요)`}</>
            }
          </button>

          {/* 초기화 */}
          {!data.isDemo && (
            <button type="button" onClick={handleReset}
              className="w-full py-2 rounded-xl text-xs font-medium text-[#4b5a7a] hover:text-white bg-[#1a2235] hover:bg-[#1e2a42] transition-colors flex items-center justify-center gap-1.5">
              <RefreshCw size={12} /> 샘플 데이터로 초기화
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
