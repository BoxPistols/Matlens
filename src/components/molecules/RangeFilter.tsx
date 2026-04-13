interface RangeFilterProps {
  label: string;
  unit: string;
  min: string;
  max: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
}

export const RangeFilter = ({ label, unit, min, max, onMinChange, onMaxChange }: RangeFilterProps) => (
  <div className="flex items-center gap-1.5 text-[12px] text-text-md">
    <span className="w-14 flex-shrink-0">{label}</span>
    <input type="number" value={min} onChange={e => onMinChange(e.target.value)} placeholder="min"
      className="w-16 px-2 py-1 border border-[var(--border-default)] rounded text-[12px] bg-raised text-text-hi outline-none focus:border-[var(--accent-mid)]" />
    <span>〜</span>
    <input type="number" value={max} onChange={e => onMaxChange(e.target.value)} placeholder="max"
      className="w-16 px-2 py-1 border border-[var(--border-default)] rounded text-[12px] bg-raised text-text-hi outline-none focus:border-[var(--accent-mid)]" />
    <span className="text-text-lo text-[10px]">{unit}</span>
  </div>
);
