import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, FileText } from 'lucide-react';

const FILE_TYPES = [
  { id: 'qb', label: 'QuickBooks (Purchase/GL)', accept: '.csv,.xlsx,.xls', color: 'green' },
  { id: 'fishbowl', label: 'Fishbowl Inventory Export', accept: '.csv,.xlsx,.xls', color: 'blue' },
  { id: 'physical', label: '월말 실사 재고표', accept: '.csv,.xlsx,.xls', color: 'purple' },
  { id: 'sku', label: 'SKU Master', accept: '.csv,.xlsx,.xls', color: 'orange' },
  { id: 'cost', label: 'Cost Category Master', accept: '.csv,.xlsx,.xls', color: 'pink' },
];

const COLOR_MAP = {
  green: 'border-emerald-500/30 hover:border-emerald-400/60 bg-emerald-500/5',
  blue: 'border-blue-500/30 hover:border-blue-400/60 bg-blue-500/5',
  purple: 'border-violet-500/30 hover:border-violet-400/60 bg-violet-500/5',
  orange: 'border-orange-500/30 hover:border-orange-400/60 bg-orange-500/5',
  pink: 'border-pink-500/30 hover:border-pink-400/60 bg-pink-500/5',
};

const ICON_COLOR = { green: 'text-emerald-400', blue: 'text-blue-400', purple: 'text-violet-400', orange: 'text-orange-400', pink: 'text-pink-400' };

export default function FileUpload({ onAllUploaded }) {
  const [files, setFiles] = useState({});
  const refs = useRef({});

  function handleDrop(id, e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) setFiles(prev => ({ ...prev, [id]: file }));
  }

  function handleChange(id, e) {
    const file = e.target.files[0];
    if (file) setFiles(prev => ({ ...prev, [id]: file }));
  }

  const uploadedCount = Object.keys(files).length;
  const allUploaded = uploadedCount === FILE_TYPES.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-semibold text-base">파일 업로드</h2>
          <p className="text-[#4b5a7a] text-xs mt-0.5">분석에 필요한 소스 파일을 업로드하세요</p>
        </div>
        <div className="text-[#4b5a7a] text-xs">{uploadedCount} / {FILE_TYPES.length} 파일</div>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {FILE_TYPES.map(({ id, label, accept, color }) => {
          const file = files[id];
          return (
            <div
              key={id}
              className={`relative border rounded-xl p-3.5 cursor-pointer transition-all ${file ? 'border-[#2a3a5a] bg-[#1a2235]' : `border-dashed ${COLOR_MAP[color]}`}`}
              onDragOver={e => e.preventDefault()}
              onDrop={e => handleDrop(id, e)}
              onClick={() => !file && refs.current[id]?.click()}
            >
              <input
                ref={el => refs.current[id] = el}
                type="file"
                accept={accept}
                className="hidden"
                onChange={e => handleChange(id, e)}
              />
              <div className="flex items-center gap-3">
                {file ? (
                  <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                ) : (
                  <Upload size={18} className={`${ICON_COLOR[color]} shrink-0`} />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-[#a0b0cc] text-xs font-medium">{label}</div>
                  {file && <div className="text-[#4b5a7a] text-[11px] truncate mt-0.5">{file.name} ({(file.size/1024).toFixed(1)} KB)</div>}
                  {!file && <div className="text-[#2d3a55] text-[11px] mt-0.5">드래그 또는 클릭으로 업로드</div>}
                </div>
                {file && (
                  <button
                    onClick={e => { e.stopPropagation(); setFiles(prev => { const n = {...prev}; delete n[id]; return n; }); }}
                    className="text-[#3b4768] hover:text-red-400 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => allUploaded && onAllUploaded(files)}
        className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
          allUploaded
            ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
            : 'bg-[#1a2235] text-[#3b4768] cursor-not-allowed'
        }`}
      >
        {allUploaded ? '데이터 분석 시작' : `파일 ${FILE_TYPES.length - uploadedCount}개 더 필요`}
      </button>

      <div className="border border-[#1e2638] rounded-xl p-3 bg-[#131720]">
        <div className="flex items-center gap-2 text-[#4b5a7a] text-[11px]">
          <FileText size={12} />
          <span>데모 모드: 샘플 데이터로 모든 기능을 확인할 수 있습니다</span>
        </div>
        <button
          onClick={() => onAllUploaded(null)}
          className="mt-2 w-full py-2 rounded-lg text-xs font-medium bg-[#1a2638] hover:bg-[#1e2a42] text-[#6b8ac4] transition-colors border border-[#1e2638]"
        >
          샘플 데이터로 시작
        </button>
      </div>
    </div>
  );
}
