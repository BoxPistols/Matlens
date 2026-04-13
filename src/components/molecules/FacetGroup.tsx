interface FacetGroupProps {
  label: string;
  options: string[];
  selected: string[];
  counts: Record<string, number>;
  onChange: (values: string[]) => void;
  displayMap?: Record<string, string>;
}

export const FacetGroup = ({ label, options, selected, counts, onChange, displayMap }: FacetGroupProps) => {
  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  };
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] font-semibold text-text-lo">{label}</span>
      <div className="flex gap-1 flex-wrap">
        {options.map(opt => {
          const active = selected.includes(opt);
          const count = counts[opt] || 0;
          const display = displayMap?.[opt] || opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`
                inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-medium
                transition-all duration-150 border select-none
                ${active
                  ? 'bg-accent-dim text-accent border-accent'
                  : 'bg-raised text-text-md border-[var(--border-faint)] hover:border-[var(--border-default)]'
                }
              `}
            >
              {display}
              <span className={`text-[10px] ${active ? 'text-accent opacity-70' : 'text-text-lo'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
