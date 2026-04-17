import { useMemo, useState } from 'react';
import type { SearchEntityType, SearchHit } from '@/infra/repositories/interfaces';
import { useSemanticSearch } from './api';

const ENTITY_TYPES: { key: SearchEntityType; label: string }[] = [
  { key: 'damage', label: '損傷所見' },
  { key: 'material', label: '材料' },
  { key: 'project', label: '案件' },
  { key: 'report', label: 'レポート' },
];

const ENTITY_LABEL: Record<SearchEntityType, string> = {
  damage: '損傷所見',
  material: '材料',
  project: '案件',
  report: 'レポート',
};

export const SemanticSearchPage = () => {
  const [input, setInput] = useState('');
  const [committedQuery, setCommittedQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<SearchEntityType>>(new Set());
  const [selectedHit, setSelectedHit] = useState<SearchHit | null>(null);

  const query = useMemo(() => {
    if (!committedQuery.trim()) return null;
    return {
      query: committedQuery,
      entityTypes: selectedTypes.size > 0 ? Array.from(selectedTypes) : undefined,
      limit: 30,
    };
  }, [committedQuery, selectedTypes]);

  const { data: hits = [], isFetching } = useSemanticSearch(query);

  const toggleType = (t: SearchEntityType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setCommittedQuery(input);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-[var(--border-faint)]">
        <h1 className="text-xl font-bold">横断検索（セマンティック）</h1>
        <p className="text-[13px] text-[var(--text-lo)] mt-1">
          損傷所見・材料・案件を横断して自然言語検索します。
        </p>
      </header>
      <form
        onSubmit={submit}
        className="px-6 py-3 border-b border-[var(--border-faint)] flex items-center gap-2"
      >
        <input
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例: SUS316L 高温疲労 粒界破壊"
          className="flex-1 px-3 py-1.5 rounded border border-[var(--border-faint)] bg-transparent text-[13px]"
        />
        <button
          type="submit"
          className="px-4 py-1.5 rounded bg-[var(--accent,#2563eb)] text-white text-[13px] font-medium"
        >
          検索
        </button>
      </form>
      <div className="flex flex-1 min-h-0">
        <aside
          className="w-56 border-r border-[var(--border-faint)] p-4 overflow-auto bg-[var(--bg-raised)]"
          aria-label="検索フィルタ"
        >
          <div className="text-[11px] font-semibold text-[var(--text-lo)] mb-2">エンティティ</div>
          <div className="flex flex-col gap-1.5">
            {ENTITY_TYPES.map((et) => (
              <label key={et.key} className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={selectedTypes.has(et.key)}
                  onChange={() => toggleType(et.key)}
                />
                {et.label}
              </label>
            ))}
          </div>
        </aside>

        <section className="flex-1 overflow-auto p-4" aria-label="検索結果">
          {!committedQuery ? (
            <div className="text-[var(--text-lo)] text-[13px]">
              検索したいキーワードを入力してください。
            </div>
          ) : isFetching ? (
            <div className="text-[var(--text-lo)] text-[13px]">検索中…</div>
          ) : hits.length === 0 ? (
            <div className="text-[var(--text-lo)] text-[13px]">
              「{committedQuery}」に一致する結果はありません。
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {hits.map((hit) => (
                <li key={`${hit.entityType}-${hit.entityId}`}>
                  <button
                    type="button"
                    onClick={() => setSelectedHit(hit)}
                    aria-current={
                      selectedHit?.entityId === hit.entityId ? 'true' : undefined
                    }
                    className={`w-full text-left p-3 rounded border ${
                      selectedHit?.entityId === hit.entityId
                        ? 'border-[var(--accent,#2563eb)] bg-[var(--hover)]'
                        : 'border-[var(--border-faint)] hover:bg-[var(--hover)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[var(--text-lo)]">
                        {ENTITY_LABEL[hit.entityType]}
                      </span>
                      <span className="text-[11px] font-mono text-[var(--text-lo)]">
                        score {hit.score.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-1 font-medium text-[13px]">{hit.title}</div>
                    <div className="mt-1 text-[12px] text-[var(--text-md)] line-clamp-2">
                      {hit.snippet}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside
          className="w-80 border-l border-[var(--border-faint)] p-4 overflow-auto bg-[var(--bg-raised)]"
          aria-label="プレビュー"
        >
          {!selectedHit ? (
            <div className="text-[13px] text-[var(--text-lo)]">
              左の結果から 1 件を選ぶと、プレビューが表示されます。
            </div>
          ) : (
            <div className="flex flex-col gap-3 text-[13px]">
              <div>
                <div className="text-[11px] text-[var(--text-lo)]">
                  {ENTITY_LABEL[selectedHit.entityType]}
                </div>
                <div className="font-semibold">{selectedHit.title}</div>
                <div className="font-mono text-[11px] text-[var(--text-lo)]">
                  {selectedHit.entityId}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--text-lo)]">マッチ箇所</div>
                <div className="mt-1 p-2 rounded bg-[var(--bg-base,#0b0d11)] text-[12px] leading-relaxed whitespace-pre-wrap">
                  {selectedHit.snippet}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--text-lo)]">関連度スコア</div>
                <div className="font-mono text-lg">{selectedHit.score.toFixed(3)}</div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
