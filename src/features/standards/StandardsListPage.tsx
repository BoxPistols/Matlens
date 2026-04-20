// Standards マスタ一覧 (#/std-master)
// 組織（JIS / ASTM / ASME / ISO / EN / other）タブ + キーワード検索 + テーブル。

import { useMemo, useState } from 'react';
import type { Standard, StandardOrg } from '@/domain/types';
import {
  useMaterialsByStandard,
  useStandards,
  useTestCountsByStandard,
} from './api';

interface StandardsListPageProps {
  onNav: (page: string) => void;
}

const ORG_TABS: { value: StandardOrg | 'all'; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'JIS', label: 'JIS' },
  { value: 'ASTM', label: 'ASTM' },
  { value: 'ASME', label: 'ASME' },
  { value: 'ISO', label: 'ISO' },
  { value: 'EN', label: 'EN' },
  { value: 'other', label: 'その他' },
];

const ORG_ACCENT: Record<StandardOrg, string> = {
  JIS: '#ef4444',
  ASTM: '#3b82f6',
  ASME: '#a855f7',
  ISO: '#10b981',
  EN: '#f59e0b',
  other: '#64748b',
};

export const StandardsListPage = ({ onNav }: StandardsListPageProps) => {
  const [org, setOrg] = useState<StandardOrg | 'all'>('all');
  const [search, setSearch] = useState('');

  const listFilter = useMemo(() => {
    // org タブはクライアント側フィルタにして、タブ切替のときにカウントが潰れないように
    const f: { search?: string } = {};
    if (search.trim()) f.search = search.trim();
    return f;
  }, [search]);

  const standardsQ = useStandards(listFilter);
  const materialsByStdQ = useMaterialsByStandard();
  const testCountsQ = useTestCountsByStandard();

  const countsByOrg = useMemo(() => {
    const map = new Map<StandardOrg | 'all', number>();
    const all = standardsQ.data ?? [];
    map.set('all', all.length);
    for (const s of all) {
      map.set(s.org, (map.get(s.org) ?? 0) + 1);
    }
    return map;
  }, [standardsQ.data]);

  const displayed = useMemo<Standard[]>(() => {
    const all = standardsQ.data ?? [];
    if (org === 'all') return all;
    return all.filter((s) => s.org === org);
  }, [standardsQ.data, org]);

  if (standardsQ.isError) {
    return (
      <div className="p-6 text-[var(--err,#dc2626)]">
        規格マスタの読み込みに失敗しました。
      </div>
    );
  }
  if (standardsQ.isLoading || !standardsQ.data) {
    return (
      <div className="p-6 text-[var(--text-lo)]">規格マスタを読み込んでいます…</div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-[var(--border-faint)]">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold">規格マスタ</h1>
          <span className="text-[11px] text-[var(--text-lo)]">Standards Master (PoC)</span>
          <span className="ml-auto text-[12px] text-[var(--text-lo)]">
            表示 {displayed.length} / 全 {standardsQ.data.length} 件
          </span>
        </div>
        <p className="text-[13px] text-[var(--text-lo)] mt-1">
          JIS / ASTM / ASME / ISO / EN 等の試験規格を組織別に俯瞰し、関連試験種別・準拠材料・試験件数を把握します。
        </p>
      </header>

      <div className="flex flex-col gap-3 px-6 py-3 border-b border-[var(--border-faint)]">
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="コード・タイトルで検索 (例: JIS Z 2241, Tensile)"
            className="min-w-[320px] px-3 py-1.5 rounded border border-[var(--border-faint)] bg-transparent text-[13px]"
          />
        </div>

        <div
          className="inline-flex rounded-lg border border-[var(--border-faint)] overflow-hidden"
          role="tablist"
          aria-label="発行組織"
        >
          {ORG_TABS.map((t) => {
            const active = org === t.value;
            const count = countsByOrg.get(t.value) ?? 0;
            return (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setOrg(t.value)}
                className={`px-3 py-1.5 text-[12px] flex items-center gap-2 transition-colors ${
                  active
                    ? 'bg-[var(--accent,#2563eb)] text-white'
                    : 'text-[var(--text-md)] hover:bg-[var(--hover)]'
                }`}
              >
                <span>{t.label}</span>
                <span className="font-mono text-[11px] tabular-nums opacity-80">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {displayed.length === 0 ? (
          <div className="p-6 text-[var(--text-lo)]">該当する規格はありません。</div>
        ) : (
          <div className="overflow-auto border border-[var(--border-faint)] rounded-lg">
            <table className="w-full text-[12px]">
              <thead className="sticky top-0 bg-[var(--bg-raised)] z-10">
                <tr className="text-left border-b border-[var(--border-faint)]">
                  <th className="px-3 py-2 font-semibold w-[70px]">組織</th>
                  <th className="px-3 py-2 font-semibold w-[170px]">コード</th>
                  <th className="px-3 py-2 font-semibold">タイトル</th>
                  <th className="px-3 py-2 font-semibold w-[120px]">カテゴリ</th>
                  <th className="px-3 py-2 font-semibold text-right w-[90px]">試験種別</th>
                  <th className="px-3 py-2 font-semibold text-right w-[90px]">準拠材料</th>
                  <th className="px-3 py-2 font-semibold text-right w-[90px]">試験実績</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((s) => {
                  const matCount = materialsByStdQ.data?.get(s.id)?.length ?? 0;
                  const testCount = testCountsQ.data?.get(s.id) ?? 0;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => onNav(`std-master_${s.id}`)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onNav(`std-master_${s.id}`);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`規格 ${s.code} を開く`}
                      className="border-b border-[var(--border-faint)] cursor-pointer hover:bg-[var(--hover)] focus:outline focus:outline-2 focus:outline-[var(--accent,#2563eb)]"
                    >
                      <td className="px-3 py-1.5">
                        <span
                          className="inline-block px-2 py-0.5 text-[10px] font-mono rounded"
                          style={{
                            background: `${ORG_ACCENT[s.org]}22`,
                            color: ORG_ACCENT[s.org],
                          }}
                        >
                          {s.org}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 font-mono">{s.code}</td>
                      <td className="px-3 py-1.5">
                        <div>{s.title}</div>
                        {s.titleEn !== s.title && (
                          <div className="text-[11px] text-[var(--text-lo)] truncate max-w-[420px]">
                            {s.titleEn}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-[11px] text-[var(--text-md)]">
                        {s.category}
                      </td>
                      <td className="px-3 py-1.5 font-mono text-right">
                        {s.relatedTestTypeIds.length}
                      </td>
                      <td className="px-3 py-1.5 font-mono text-right">{matCount}</td>
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

export { ORG_ACCENT };
