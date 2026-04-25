import { useEffect, useMemo, useState } from 'react';
import type { DamageFinding, DamageType } from '@/domain/types';
import { DamagePatternSvg } from './components/DamagePatternSvg';
import { DamageTypeChip, damageTypeLabel } from './components/DamageTypeChip';
import { useDamages, useSimilarDamages } from './api';

const ALL_TYPES: DamageType[] = [
  'fatigue',
  'creep',
  'corrosion',
  'stress_corrosion',
  'brittle_fracture',
  'ductile_fracture',
  'wear',
  'thermal',
];

export const DamageGalleryPage = () => {
  const [search, setSearch] = useState('');
  const [typeSet, setTypeSet] = useState<Set<DamageType>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const query = useMemo(
    () => ({
      filter: {
        search: search.trim() || undefined,
        types: typeSet.size > 0 ? Array.from(typeSet) : undefined,
      },
      pageSize: 60,
    }),
    [search, typeSet]
  );

  const { data, isLoading } = useDamages(query);

  const toggleType = (t: DamageType) => {
    setTypeSet((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-[var(--border-faint)]">
        <h1 className="text-xl font-bold">損傷ギャラリー</h1>
        <p className="text-[13px] text-[var(--text-lo)] mt-1">
          過去の損傷所見を種別・キーワードで絞り込み、類似事例を発見します。
        </p>
      </header>
      <div className="flex flex-col gap-3 px-6 py-3 border-b border-[var(--border-faint)]">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="キーワード検索（部位・原因仮説）"
          aria-label="損傷所見 キーワード検索"
          className="w-full max-w-lg px-3 py-1.5 rounded border border-[var(--border-faint)] bg-transparent text-[13px]"
        />
        <div className="flex items-center gap-1.5 flex-wrap">
          {ALL_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleType(t)}
              aria-pressed={typeSet.has(t)}
              className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors ${
                typeSet.has(t)
                  ? 'bg-[var(--accent,#2563eb)] text-white border-transparent'
                  : 'text-[var(--text-md)] border-[var(--border-faint)] hover:bg-[var(--hover)]'
              }`}
            >
              {damageTypeLabel(t)}
            </button>
          ))}
          {typeSet.size > 0 && (
            <button
              type="button"
              onClick={() => setTypeSet(new Set())}
              className="px-2 py-1 text-[11px] text-[var(--text-lo)] underline"
            >
              解除
            </button>
          )}
          <span className="ml-auto text-[12px] text-[var(--text-lo)]">
            {data ? `${data.pagination.total} 件` : '…'}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {isLoading || !data ? (
          <div className="p-6 text-[var(--text-lo)]">読み込み中…</div>
        ) : data.items.length === 0 ? (
          <div className="p-6 text-[var(--text-lo)]">該当する所見はありません。</div>
        ) : (
          <div className="p-6 grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {data.items.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedId(d.id)}
                className="text-left rounded-lg overflow-hidden border border-[var(--border-faint)] bg-[var(--bg-raised)] hover:outline hover:outline-2 hover:outline-[var(--accent,#2563eb)] focus:outline focus:outline-2 focus:outline-[var(--accent,#2563eb)] transition"
              >
                <div className="aspect-[4/3] relative">
                  <DamagePatternSvg id={d.id} type={d.type} />
                </div>
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <DamageTypeChip type={d.type} />
                    <span className="text-[10px] font-mono text-[var(--text-lo)]">
                      {d.confidenceLevel}
                    </span>
                  </div>
                  <div className="mt-2 text-[12px] font-medium">{d.location}</div>
                  <div className="mt-1 text-[11px] text-[var(--text-lo)] line-clamp-2">
                    {d.rootCauseHypothesis}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {selectedId && (
        <DamageLightbox
          damages={data?.items ?? []}
          id={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};

interface DamageLightboxProps {
  damages: DamageFinding[];
  id: string;
  onClose: () => void;
}

const DamageLightbox = ({ damages, id, onClose }: DamageLightboxProps) => {
  const target = damages.find((d) => d.id === id);
  const { data: similar } = useSimilarDamages(id);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // フィルタ変更等で対象がページから外れた場合、selectedId を残したまま黙って閉じず明示的に閉じる
  useEffect(() => {
    if (!target) onClose();
  }, [target, onClose]);

  if (!target) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label="損傷所見 詳細"
    >
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        className="absolute inset-0 w-full h-full cursor-default"
        tabIndex={-1}
      />
      <div
        className="relative bg-[var(--bg-base,#0b0d11)] border border-[var(--border-faint)] rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto flex flex-col md:flex-row"
      >
        <div className="md:w-1/2 aspect-[4/3] md:aspect-auto">
          <DamagePatternSvg id={target.id} type={target.type} />
        </div>
        <div className="flex-1 p-5">
          <div className="flex items-center gap-2 flex-wrap">
            <DamageTypeChip type={target.type} />
            <span className="font-mono text-[11px] text-[var(--text-lo)]">{target.id}</span>
            <button
              type="button"
              onClick={onClose}
              className="ml-auto text-[12px] text-[var(--text-lo)] underline"
            >
              閉じる
            </button>
          </div>
          <h2 className="mt-2 text-lg font-bold">{target.location}</h2>
          <p className="mt-3 text-[13px] leading-relaxed">{target.rootCauseHypothesis}</p>
          <div className="mt-4 text-[12px] text-[var(--text-lo)]">
            <span className="font-semibold">確信度: </span>
            {target.confidenceLevel}
          </div>

          {similar && similar.length > 0 && (
            <section className="mt-6">
              <h3 className="text-[13px] font-semibold mb-2">類似事例 ({similar.length})</h3>
              <div className="grid grid-cols-3 gap-2">
                {similar.map((s) => (
                  <div
                    key={s.id}
                    className="aspect-[4/3] rounded border border-[var(--border-faint)] overflow-hidden"
                    title={s.rootCauseHypothesis}
                  >
                    <DamagePatternSvg id={s.id} type={s.type} />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
