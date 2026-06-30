import { useState } from 'react';
import { Bot, Copy, Check, Sparkles, TrendingUp, CheckCircle, FileText } from 'lucide-react';
import { useData } from '../context/DataContext';
import { formatKRW } from '../utils/exportUtils';

export default function AITab() {
  const { data } = useData();
  const { monthlySummary, aiCommentary } = data;
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const latest = monthlySummary[monthlySummary.length - 1];

  function copyMemo() {
    navigator.clipboard.writeText(aiCommentary.closingMemo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function simulateGenerate() {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 1800);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-base">AI Commentary</h2>
          <p className="text-[#4b5a7a] text-xs mt-0.5">원가 변동 원인 분석 및 월마감 담당자 코멘트</p>
        </div>
        <button onClick={simulateGenerate} disabled={generating}
          className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg font-medium transition-all ${generating?'bg-indigo-600/50 text-indigo-300 cursor-not-allowed':'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
          <Sparkles size={14} className={generating?'animate-spin':''} />
          {generating ? 'AI 분석 중...' : 'AI 재분석'}
        </button>
      </div>

      <div className={`border rounded-xl p-4 ${aiCommentary.costRateAlert?'border-red-500/30 bg-red-500/5':'border-emerald-500/30 bg-emerald-500/5'}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${aiCommentary.costRateAlert?'bg-red-500/20':'bg-emerald-500/20'}`}>
            <Bot size={18} className={aiCommentary.costRateAlert?'text-red-400':'text-emerald-400'} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white font-semibold text-sm">AI 종합 요약</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${aiCommentary.costRateAlert?'bg-red-500/20 text-red-400':'bg-emerald-500/20 text-emerald-400'}`}>
                {aiCommentary.month}
              </span>
              {!data.isDemo && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">실제 데이터</span>}
            </div>
            <p className="text-[#a0b0cc] text-sm leading-relaxed">{aiCommentary.summary}</p>
          </div>
        </div>
      </div>

      <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={15} className="text-amber-400" />
          <span className="text-white font-semibold text-sm">주요 발견 사항</span>
        </div>
        <div className="space-y-3">
          {aiCommentary.keyFindings.map((f, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-[#1a2235] rounded-lg">
              <span className="text-base shrink-0">{f.icon}</span>
              <p className="text-[#a0b0cc] text-sm leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle size={15} className="text-emerald-400" />
          <span className="text-white font-semibold text-sm">확인 필요 액션 아이템</span>
        </div>
        <div className="space-y-2">
          {aiCommentary.actionItems.map((item, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-[#1e2638] last:border-0">
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
              <p className="text-[#a0b0cc] text-sm">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText size={15} className="text-violet-400" />
            <span className="text-white font-semibold text-sm">월마감 담당자 전달 코멘트</span>
          </div>
          <button onClick={copyMemo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a2235] hover:bg-[#1e2a42] text-[#6b7a9a] hover:text-white text-xs rounded-lg transition-colors">
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? '복사됨!' : '복사'}
          </button>
        </div>
        <div className="bg-[#0f1117] rounded-lg p-4 font-mono text-xs text-[#a0b0cc] leading-relaxed whitespace-pre-wrap border border-[#1a2235]">
          {aiCommentary.closingMemo}
        </div>
      </div>

      <div className="bg-[#131720] border border-[#1e2638] rounded-xl p-4">
        <div className="text-white font-semibold text-sm mb-3">원가율 상세 분석 ({latest?.month})</div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: '총 재료비', value: formatKRW(latest?.totalUsage||0), color: 'text-white' },
            { label: '추정 매출액', value: formatKRW(latest?.revenue||0), color: 'text-emerald-400' },
            { label: '원가율', value: `${((latest?.costRate||0)*100).toFixed(1)}%`, color: (latest?.costRateChange||0)>3?'text-red-400':'text-amber-400' },
            { label: '전월 대비', value: `${(latest?.costRateChange||0)>0?'+':''}${latest?.costRateChange||0}%p`, color: (latest?.costRateChange||0)>0?'text-red-400':'text-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center p-3 bg-[#1a2235] rounded-lg">
              <div className="text-[#4b5a7a] text-xs mb-1">{label}</div>
              <div className={`font-bold text-base ${color}`}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
