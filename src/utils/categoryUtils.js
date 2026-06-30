export const CATEGORY_META = {
  'Reagent': {
    label: 'Reagent', labelKo: '시약',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10 text-indigo-400',
    border: 'border-indigo-500/20',
    chartColor: '#6366f1',
  },
  'Calibrator': {
    label: 'Calibrator', labelKo: '캘리브레이터',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 text-emerald-400',
    border: 'border-emerald-500/20',
    chartColor: '#10b981',
  },
  'Control (QC Material)': {
    label: 'Control/QC', labelKo: 'QC 물질',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 text-amber-400',
    border: 'border-amber-500/20',
    chartColor: '#f59e0b',
  },
  'Consumables': {
    label: 'Consumables', labelKo: '소모품',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10 text-cyan-400',
    border: 'border-cyan-500/20',
    chartColor: '#22d3ee',
  },
};

export const CATEGORIES = Object.keys(CATEGORY_META);

export function getCatMeta(category) {
  return CATEGORY_META[category] || CATEGORY_META['Reagent'];
}

export function catBadgeClass(category, size = 'sm') {
  const m = getCatMeta(category);
  const sz = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';
  return `rounded font-medium ${sz} ${m.bg}`;
}
