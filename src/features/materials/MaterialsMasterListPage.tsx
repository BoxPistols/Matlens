// Materials マスタ一覧 (#/mat-master)
// ドメインモデル側の Material マスタ（12 件）を表示する。
// 既存 #/list は INITIAL_DB ベースの「材料データ一覧」で別物。

import { useMemo, useState } from 'react';
import type { ID, Material, MaterialCategory } from '@/domain/types';
import { useMaterialUsage, useMaterials } from './api';

interface MaterialsMasterListPageProps {
  onNav: (page: string) => void;
}

const CATEGORY_OPTIONS: { value: MaterialCategory; label: string }[] = [
  { value: 'steel', label: '炭素鋼 / 合金鋼' },
  { value: 'stainless', label: 'ステンレス' },
  { value: 'aluminum', label: 'アルミ合金' },
  { value: 'titanium', label: 'チタン合金' },
  { value: 'nickel_alloy', label: 'Ni 基合金' },
  { value: 'copper', label: '銅合金' },
  { value: 'polymer', label: 'ポリマー' },
  { value: 'composite', label: '複合材' },
  { value: 'ceramic', label: 'セラミクス' },
  { value: 'other', label: 'その他' },
];

const CATEGORY_LABEL: Record<MaterialCategory, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((o) => [o.value, o.label])
) as Record<MaterialCategory, string>;

const compositionSummary = (m: Material, max = 3): string => {
  const head = [...m.composition]
    .sort((a, b) => b.wtPercent - a.wtPercent)
    .slice(0, max)
    .map((c) => `${c.element} ${c.wtPercent.toFixed(c.wtPercent >= 10 ? 0 : 1)}`)
    .join(' / ');
  const rest = m.composition.length - max;
  return rest > 0 ? `${head} / 他 ${rest}` : head;
};

export const MaterialsMasterListPage = ({ onNav }: MaterialsMasterListPageProps) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<MaterialCategory | ''>('');

  // Repository には search だけ渡し、カテゴリ絞り込みはクライアント側で行う。
  // こうすることで「カテゴリ別チップの件数」は「search 適用後のカテゴリ分布」を
  // 常に反映でき、あるカテゴリを選んでも他カテゴリの件数がゼロに潰れない。
  const filter = useMemo(() => {
    const f: { search?: string } = {};
    if (search.trim()) f.search = search.trim();
    return f;
  }, [search]);

  const materialsQ = useMaterials(filter);
  const usageQ = useMaterialUsage();

  const countsByCategory = useMemo(() => {
    const map = new Map<MaterialCategory, number>();
    for (const opt of CATEGORY_OPTIONS) map.set(opt.value, 0);
    for (const m of materialsQ.data ?? []) {
      map.set(m.category, (map.get(m.category) ?? 0) + 1);
    }
    return map;
  }, [materialsQ.data]);

  const displayedMaterials = useMemo(() => {
    const all = materialsQ.data ?? [];
    if (!category) return all;
    return all.filter((m) => m.category === category);
  }, [materialsQ.data, category]);

  if (materialsQ.isError) {
    return (
      <div className="p-6 text-[var(--err,#dc2626)]">
        材料マスタの読み込みに失敗しました。
      </div>
    );
  }

  if (materialsQ.isLoading || !materialsQ.data) {
    return (
      <div className="p-6 text-[var(--text-lo)]">材料マスタを読み込んでいます…</div>
    );
  }

  const materials = displayedMaterials;
  const totalCount = materialsQ.data.length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-[var(--border-faint)]">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold">材料マスタ</h1>
          <span className="text-[11px] text-[var(--text-lo)]">Materials Master (PoC)</span>
          <span className="ml-auto text-[12px] text-[var(--text-lo)]">
            表示 {materials.length} / 全 {totalCount} 件
          </span>
        </div>
        <p className="text-[13px] text-[var(--text-lo)] mt-1">
          試験ドメインで使う母材マスタ。組成・物性・関連規格・過去試験実績をまとめて確認できます。
        </p>
      </header>

      <div className="flex flex-col gap-3 px-6 py-3 border-b border-[var(--border-faint)]">
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="材料名・説明で検索"
            className="min-w-[260px] px-3 py-1.5 rounded border border-[var(--border-faint)] bg-transparent text-[13px]"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as MaterialCategory | '')}
            className="px-2 py-1.5 rounded border border-[var(--border-faint)] bg-transparent text-[13px]"
            aria-label="カテゴリ"
          >
            <option value="">すべてのカテゴリ</option>
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setCategory('')}
            aria-pressed={category === ''}
            className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors ${
              category === ''
                ? 'bg-[var(--accent,#2563eb)] text-white border-transparent'
                : 'text-[var(--text-md)] border-[var(--border-faint)] hover:bg-[var(--hover)]'
            }`}
          >
            すべて
          </button>
          {CATEGORY_OPTIONS.map((o) => {
            const count = countsByCategory.get(o.value) ?? 0;
            const active = category === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => setCategory(active ? '' : o.value)}
                aria-pressed={active}
                className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors ${
                  active
                    ? 'bg-[var(--accent,#2563eb)] text-white border-transparent'
                    : 'text-[var(--text-md)] border-[var(--border-faint)] hover:bg-[var(--hover)]'
                }`}
              >
                {o.label} <span className="font-mono tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {materials.length === 0 ? (
          <div className="p-6 text-[var(--text-lo)]">該当する材料はありません。</div>
        ) : (
          <div className="overflow-auto border border-[var(--border-faint)] rounded-lg">
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-[var(--bg-raised)] z-10">
                <tr className="text-left border-b border-[var(--border-faint)]">
                  <th className="px-3 py-2 font-semibold">材料名</th>
                  <th className="px-3 py-2 font-semibold">カテゴリ</th>
                  <th className="px-3 py-2 font-semibold">主要組成 (wt%)</th>
                  <th className="px-3 py-2 font-semibold text-right">密度</th>
                  <th className="px-3 py-2 font-semibold text-right">耐力</th>
                  <th className="px-3 py-2 font-semibold text-right">規格</th>
                  <th className="px-3 py-2 font-semibold text-right">試験片</th>
                  <th className="px-3 py-2 font-semibold text-right">試験</th>
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => {
                  const specCount = usageQ.data?.specimenByMaterial.get(m.id) ?? 0;
                  const testCount = usageQ.data?.testByMaterial.get(m.id) ?? 0;
                  return (
                    <tr
                      key={m.id}
                      onClick={() => onNav(`mat-master_${m.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onNav(`mat-master_${m.id}`);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`材料 ${m.designation} を開く`}
                      className="border-b border-[var(--border-faint)] cursor-pointer hover:bg-[var(--hover)] focus:outline focus:outline-2 focus:outline-[var(--accent,#2563eb)]"
                    >
                      <td className="px-3 py-1.5">
                        <div className="font-mono font-semibold">{m.designation}</div>
                        {m.description && (
                          <div className="text-[11px] text-[var(--text-lo)] truncate max-w-[320px]">
                            {m.description}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-1.5">{CATEGORY_LABEL[m.category]}</td>
                      <td className="px-3 py-1.5 font-mono text-[11px] text-[var(--text-md)] truncate max-w-[280px]">
                        {compositionSummary(m)}
                      </td>
                      <td className="px-3 py-1.5 font-mono text-right">
                        {m.properties.density ?? '—'}
                      </td>
                      <td className="px-3 py-1.5 font-mono text-right">
                        {m.properties.yieldStrength ?? '—'}
                      </td>
                      <td className="px-3 py-1.5 font-mono text-right">
                        {m.standardRefs.length}
                      </td>
                      <td className="px-3 py-1.5 font-mono text-right">{specCount}</td>
                      <td className="px-3 py-1.5 font-mono text-right">{testCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export { CATEGORY_LABEL as MATERIAL_CATEGORY_LABEL };
