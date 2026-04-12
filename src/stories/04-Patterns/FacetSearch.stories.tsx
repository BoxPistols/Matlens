import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Card, Input } from '../../components/atoms';

/**
 * MaterialListPage 内の FacetGroup / RangeFilter を再現したパターンストーリー。
 * 内部コンポーネントのため、同等の構造をインラインで定義する。
 */

// ─── FacetGroup (再現) ───────────────────────────────────────────────────

interface FacetGroupProps {
  label: string;
  options: string[];
  selected: string[];
  counts: Record<string, number>;
  onChange: (values: string[]) => void;
  displayMap?: Record<string, string>;
}

const FacetGroup = ({ label, options, selected, counts, onChange, displayMap }: FacetGroupProps) => {
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

// ─── RangeFilter (再現) ──────────────────────────────────────────────────

interface RangeFilterProps {
  label: string;
  unit: string;
  min: string;
  max: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
}

const RangeFilter = ({ label, unit, min, max, onMinChange, onMaxChange }: RangeFilterProps) => (
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

// ─── Preset パネル ───────────────────────────────────────────────────────

interface Preset {
  id: string;
  name: string;
}

const PresetPanel = ({ presets, onSelect }: { presets: Preset[]; onSelect: (id: string) => void }) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[12px] font-semibold text-text-lo">プリセット</span>
    <div className="flex gap-1 flex-wrap">
      {presets.map(p => (
        <button
          key={p.id}
          type="button"
          onClick={() => onSelect(p.id)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-medium transition-all duration-150 border select-none bg-raised text-text-md border-[var(--border-faint)] hover:border-accent hover:text-accent"
        >
          {p.name}
        </button>
      ))}
    </div>
  </div>
);

// ─── Demo wrapper ────────────────────────────────────────────────────────

const FacetDemo = () => {
  const [cats, setCats] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);

  const catCounts: Record<string, number> = { '金属合金': 142, 'セラミクス': 38, 'ポリマー': 45, '複合材料': 22 };
  const statusCounts: Record<string, number> = { '登録済': 80, 'レビュー待': 34, '承認済': 112, '要修正': 21 };

  return (
    <Card className="p-4 max-w-lg">
      <div className="text-[12px] font-bold text-text-lo tracking-[.04em] uppercase mb-3 pb-2.5 border-b border-[var(--border-faint)]">
        ファセット検索
      </div>
      <div className="flex flex-col gap-3">
        <FacetGroup label="カテゴリ" options={['金属合金', 'セラミクス', 'ポリマー', '複合材料']}
          selected={cats} counts={catCounts} onChange={setCats} />
        <FacetGroup label="ステータス" options={['登録済', 'レビュー待', '承認済', '要修正']}
          selected={statuses} counts={statusCounts} onChange={setStatuses} />
      </div>
      {(cats.length > 0 || statuses.length > 0) && (
        <div className="mt-3 pt-2.5 border-t border-[var(--border-faint)] text-[12px] text-text-lo">
          選択中: {[...cats, ...statuses].join(', ')}
        </div>
      )}
    </Card>
  );
};

const meta: Meta = {
  title: 'Patterns/FacetSearch',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'MaterialListPage のファセット検索パターン。カテゴリ・ステータスのチップ選択、プリセット呼び出し、範囲フィルタを組み合わせたフィルタ UI。',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

/** カテゴリ + ステータスのファセット表示 */
export const Default: Story = {
  render: () => <FacetDemo />,
};

/** プリセットパネル付き */
export const WithPresets: Story = {
  render: () => {
    const [cats, setCats] = useState<string[]>([]);
    const [statuses, setStatuses] = useState<string[]>([]);
    const catCounts: Record<string, number> = { '金属合金': 142, 'セラミクス': 38, 'ポリマー': 45, '複合材料': 22 };
    const statusCounts: Record<string, number> = { '登録済': 80, 'レビュー待': 34, '承認済': 112, '要修正': 21 };

    const presets: Preset[] = [
      { id: 'p-metal-approved', name: '承認済み金属合金' },
      { id: 'p-high-hardness', name: '高硬度材 (HV≥500)' },
      { id: 'p-review-pending', name: 'レビュー待ち' },
      { id: 'p-cfrp', name: 'CFRP 系' },
    ];

    const onPreset = (id: string) => {
      if (id === 'p-metal-approved') { setCats(['金属合金']); setStatuses(['承認済']); }
      else if (id === 'p-review-pending') { setCats([]); setStatuses(['レビュー待']); }
      else if (id === 'p-cfrp') { setCats(['複合材料']); setStatuses([]); }
      else { setCats([]); setStatuses([]); }
    };

    return (
      <Card className="p-4 max-w-lg">
        <div className="text-[12px] font-bold text-text-lo tracking-[.04em] uppercase mb-3 pb-2.5 border-b border-[var(--border-faint)]">
          ファセット検索 + プリセット
        </div>
        <div className="flex flex-col gap-3">
          <PresetPanel presets={presets} onSelect={onPreset} />
          <div className="border-t border-[var(--border-faint)] pt-2.5" />
          <FacetGroup label="カテゴリ" options={['金属合金', 'セラミクス', 'ポリマー', '複合材料']}
            selected={cats} counts={catCounts} onChange={setCats} />
          <FacetGroup label="ステータス" options={['登録済', 'レビュー待', '承認済', '要修正']}
            selected={statuses} counts={statusCounts} onChange={setStatuses} />
        </div>
      </Card>
    );
  },
};

/** 範囲フィルタ付き */
export const WithRangeFilters: Story = {
  render: () => {
    const [cats, setCats] = useState<string[]>(['金属合金']);
    const [hvMin, setHvMin] = useState('');
    const [hvMax, setHvMax] = useState('');
    const [tsMin, setTsMin] = useState('');
    const [tsMax, setTsMax] = useState('');
    const catCounts: Record<string, number> = { '金属合金': 142, 'セラミクス': 38, 'ポリマー': 45, '複合材料': 22 };

    return (
      <Card className="p-4 max-w-lg">
        <div className="text-[12px] font-bold text-text-lo tracking-[.04em] uppercase mb-3 pb-2.5 border-b border-[var(--border-faint)]">
          ファセット検索 + 範囲フィルタ
        </div>
        <div className="flex flex-col gap-3">
          <FacetGroup label="カテゴリ" options={['金属合金', 'セラミクス', 'ポリマー', '複合材料']}
            selected={cats} counts={catCounts} onChange={setCats} />
          <div className="border-t border-[var(--border-faint)] pt-2.5">
            <span className="text-[12px] font-semibold text-text-lo mb-2 block">数値範囲</span>
            <div className="flex flex-col gap-2">
              <RangeFilter label="硬度" unit="HV" min={hvMin} max={hvMax} onMinChange={setHvMin} onMaxChange={setHvMax} />
              <RangeFilter label="引張強さ" unit="MPa" min={tsMin} max={tsMax} onMinChange={setTsMin} onMaxChange={setTsMax} />
            </div>
          </div>
        </div>
      </Card>
    );
  },
};
