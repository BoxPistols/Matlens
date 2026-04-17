import type { DamageType } from '@/domain/types';

const LABEL: Record<DamageType, string> = {
  fatigue: '疲労',
  creep: 'クリープ',
  corrosion: '腐食',
  stress_corrosion: '応力腐食',
  brittle_fracture: '脆性破壊',
  ductile_fracture: '延性破壊',
  wear: '摩耗',
  thermal: '熱疲労',
};

const COLOR: Record<DamageType, string> = {
  fatigue: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
  creep: 'bg-orange-500/15 text-orange-400 border-orange-500/40',
  corrosion: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
  stress_corrosion: 'bg-yellow-500/15 text-yellow-500 border-yellow-500/40',
  brittle_fracture: 'bg-lime-500/15 text-lime-500 border-lime-500/40',
  ductile_fracture: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40',
  wear: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40',
  thermal: 'bg-violet-500/15 text-violet-400 border-violet-500/40',
};

export const damageTypeLabel = (t: DamageType) => LABEL[t];
export const damageTypeColor = (t: DamageType) => COLOR[t];

export const DamageTypeChip = ({ type }: { type: DamageType }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${COLOR[type]}`}
  >
    {LABEL[type]}
  </span>
);
