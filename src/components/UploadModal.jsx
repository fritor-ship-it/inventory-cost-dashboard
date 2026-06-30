import { useState } from 'react';
import { X, Download, Upload, CheckCircle, AlertCircle, Loader2, FileSpreadsheet, RefreshCw, PackageCheck } from 'lucide-react';
import {
  downloadQBTemplate, downloadFishbowlTemplate,
  downloadSKUMasterTemplate, downloadAllTemplates,
} from '../utils/templateUtils';
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

  // 브라우저가 연속 다운로드를 막지 않도록 300ms 간격
  exportInventoryLedger(allRows, lastMonth);
  await new Promise(r => setTimeout(r, 300));
  exportCostAnalysis(result.monthlySummary || []);
  await new Promise(r => setTimeout(r, 300));
  exportExceptions(result.exceptions || []);
}

// 3개 파일만 사용
const FILE_DEFS = [
  {
    id: 'fishbowl', required: true, label: 'Fishbowl 재고대장',
    desc: 'Inventory Valuation Summary — Item Name · SKU · Qty · Unit Cost · Type · B2B/B2C',
    color: 'blue', downloadFn: downloadFishbowlTemplate,
  },
  {
    id: 'qb',       required: true, label: 'QuickBooks (Purchase/GL)',
    desc: '날짜 · 거래처 · 품목명 · SKU · 수량 · 단가 · 금액',
    color: 'emerald', downloadFn: downloadQBTemplate,
  },
  {
    id: 'sku',      required: true, label: 'SKU Master',
    desc: 'SKU · 품목명 · Reagent/Calibrator/Control(QC)/Consumables · B2B/B2C · Vendor',
    color: 'amber', downloadFn: downloadSKUMasterTemplate,
  },
];

const REQUIRED_COUNT = FILE_DEFS.length;

const C = {
  emerald: { border: 'border-emerald-500/30 hover:border-emerald-400/50', icon: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400', btn: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  blue:    { border: 'border-blue-500/30 hover:border-blue-400/50',    icon: 'text-blue-400',    badge: 'bg-blue-500/10 text-blue-400',    btn: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/30' },
  violet:  { border: 'border-violet-500/30 hover:border-violet-400/50',icon: 'text-violet-400',  badge: 'bg-violet-500/10 text-violet-400',btn: 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border-violet-500/30' },
  amber:   { border: 'border-amber-500/30 hover:border-amber-400/50',  icon: 'text-amber-400',   badge: 'bg-amber-500/10 text-amber-400',  btn: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/30' },
  rose:    { border: 'border-rose-500/30 hover:border-rose-400/50',    icon: 'text-rose-400',    badge: 'bg-rose-500/10 text-rose-400',    btn: 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30' },
};

export default function UploadModal({ onClose, targetMonth }) {
  const { loadData, resetToDemo, data } = useData();
  const [files, setFiles] = useState({});
  const [status, setStatus] = useState('idle'); // idle | processing | done | error
  const [errorMsg, setErrorMsg] = useState('');

  const uploaded = Object.keys(files).length;
  // 필수 파일(4개)이 모두 업로드되면 분석 가능
  const requiredUploaded = FILE_DEFS.filter(f => f.required).every(f => files[f.id]);
  const allUploaded = requiredUploaded; // alias for downstream checks

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
      // 결과물 3개 자동 다운로드
      await autoDownloadResults(result);
    } catch (err) {
      setErrorMsg(err.message || '파일 처리 중 오류가 발생했습니다.');
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
      {/* 백드롭 */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* 패널 */}
      <div className="relative ml-auto w-full max-w-xl h-full bg-[#0f1117] border-l border-[#1e2638] flex flex-col shadow-2xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e2638] shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-white font-bold text-base">Excel 파일 업로드</h2>
              {targetMonth && (
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                  {targetMonth}
                </span>
              )}
            </div>
            <p className="text-[#4b5a7a] text-xs mt-0.5">
              {targetMonth ? `${targetMonth} 기준월 데이터 업로드` : '양식 다운로드 → 작성 → 업로드 → 분석'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-[#4b5a7a] hover:text-white p-1.5 rounded-lg hover:bg-[#1a2235] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* 파일 목록 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scrollbar-thin">
          {FILE_DEFS.map(({ id, label, desc, color, downloadFn, required }) => {
            const file = files[id];
            const cc = C[color];
            return (
              <div key={id} className={`border rounded-xl overflow-hidden transition-all ${file ? 'border-[#2a3a5a] bg-[#131720]' : `border-dashed ${cc.border} bg-[#0f1117]`}`}>
                {/* 상단: 제목 + 양식 다운로드 */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet size={16} className={cc.icon} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#a0b0cc] text-xs font-medium">{label}</span>
                        <span className={`text-[9px] px-1 py-0.5 rounded font-bold shrink-0 ${required ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {required ? '필수' : '선택'}
                        </span>
                      </div>
                      <div className="text-[#2d3a55] text-[11px] mt-0.5">{desc}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); downloadFn(); }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${cc.btn}`}
                  >
                    <Download size={11} /> 양식
                  </button>
                </div>

                {/* 업로드 영역 — label로 input 직접 연결 (모든 브라우저 호환) */}
                <label
                  htmlFor={`file-input-${id}`}
                  className="mx-4 mb-3 border border-dashed border-[#1e2638] rounded-lg px-3 py-2.5 flex items-center gap-2 transition-colors hover:border-indigo-500/50 hover:bg-[#131720]/50"
                  style={{ cursor: file ? 'default' : 'pointer', display: 'flex' }}
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
                      <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                      <span className="text-emerald-400 text-xs flex-1 truncate">{file.name}</span>
                      <span className="text-[#4b5a7a] text-[11px] shrink-0">{(file.size / 1024).toFixed(1)} KB</span>
                      <button
                        type="button"
                        onClick={e => { e.preventDefault(); e.stopPropagation(); removeFile(id); }}
                        className="text-[#3b4768] hover:text-red-400 ml-1 shrink-0"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload size={13} className="text-[#4b5a7a] shrink-0" />
                      <span className="text-[#4b5a7a] text-xs">클릭하여 파일 선택 또는 드래그&드롭</span>
                      <span className="text-[#2d3a55] text-[10px] ml-auto shrink-0">xlsx · xls · csv</span>
                    </>
                  )}
                </label>
              </div>
            );
          })}
        </div>

        {/* 하단 액션 */}
        <div className="px-6 py-4 border-t border-[#1e2638] space-y-2.5 shrink-0">
          {/* 진행 표시 */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#4b5a7a]">업로드 현황 · 필수 {REQUIRED_COUNT}개 / 선택 1개</span>
            <span className={requiredUploaded ? 'text-emerald-400 font-medium' : 'text-[#4b5a7a]'}>
              {uploaded} / {FILE_DEFS.length} 업로드
              {requiredUploaded && ' ✓ 분석 가능'}
            </span>
          </div>
          <div className="h-1.5 bg-[#1e2638] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${requiredUploaded ? 'bg-emerald-500' : 'bg-indigo-500'}`}
              style={{ width: `${(uploaded / FILE_DEFS.length) * 100}%` }}
            />
          </div>

          {/* 에러 메시지 */}
          {status === 'error' && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-xs">{errorMsg}</p>
            </div>
          )}

          {/* 성공 메시지 */}
          {status === 'done' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <CheckCircle size={14} className="text-emerald-400 shrink-0" />
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
            className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
              status === 'done' ? 'bg-emerald-600/30 text-emerald-400 cursor-default' :
              allUploaded && status !== 'processing' ? 'bg-indigo-600 hover:bg-indigo-500 text-white' :
              'bg-[#1a2235] text-[#3b4768] cursor-not-allowed'
            }`}
          >
            {status === 'processing' ? (
              <><Loader2 size={16} className="animate-spin" /> 데이터 처리 중...</>
            ) : status === 'done' ? (
              <><CheckCircle size={16} /> 분석 완료</>
            ) : (
              <>
                데이터 분석 시작
                {!requiredUploaded && (
                  <span className="text-[11px] font-normal opacity-70">
                    (필수 파일 {FILE_DEFS.filter(f => f.required && !files[f.id]).length}개 필요)
                  </span>
                )}
              </>
            )}
          </button>

          {/* 샘플 데이터로 초기화 */}
          {!data.isDemo && (
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2 rounded-xl text-xs font-medium text-[#4b5a7a] hover:text-white bg-[#1a2235] hover:bg-[#1e2a42] transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={12} /> 샘플 데이터로 초기화
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
