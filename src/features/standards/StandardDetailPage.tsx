// Standards マスタ詳細 (#/std-master-detail/<id>)
// 発行組織 + コード + タイトル + 関連試験種別 + 準拠材料 + 試験実績件数 を 1 画面に集約。

import { useMemo } from 'react';
import type { ID } from '@/domain/types';
import {
  useMaterialsByStandard,
  useStandard,
  useTestCountsByStandard,
  useTestTypesIndex,
} from './api';
import { ORG_ACCENT } from './StandardsListPage';

interface StandardDetailPageProps {
  id: ID;
  onBack: () => void;
  onNav: (page: string) => void;
}

export const StandardDetailPage = ({
  id,
  onBack,
  onNav,
}: StandardDetailPageProps) => {
  const standardQ = useStandard(id);
  const testTypesQ = useTestTypesIndex();
  const materialsByStdQ = useMaterialsByStandard();
  const testCountsQ = useTestCountsByStandard();

  // 関連試験種別は standard の情報が揃ったタイミングで派生させる（hook 順序を守るため
  // 早期 return より前に配置）。standard 未取得時は空配列で安全にフォールバック。
  const relatedTestTypes = useMemo(() => {
    const standard = standardQ.data;
    if (!standard) return [];
    return standard.relatedTestTypeIds
      .map((tid) => testTypesQ.data?.get(tid))
      .filter((t): t is NonNullable<typeof t> => !!t);
  }, [standardQ.data, testTypesQ.data]);

  if (standardQ.isError) {
    return (
      <div className="p-6">
        <div className="text-[var(--err,#dc2626)]">規格の読み込みに失敗しました。</div>
        <button type="button" onClick={onBack} className="mt-4 underline">
          一覧に戻る
        </button>
      </div>
    );
  }
  if (standardQ.isLoading) {
    return <div className="p-6 text-[var(--text-lo)]">規格を読み込んでいます…</div>;
  }
  const standard = standardQ.data;
  if (!standard) {
    return (
      <div className="p-6">
        <div className="text-[var(--text-lo)]">規格が見つかりません。</div>
        <button type="button" onClick={onBack} className="mt-4 underline">
          一覧に戻る
        </button>
      </div>
    );
  }

  const referencingMaterials = materialsByStdQ.data?.get(standard.id) ?? [];
  const testCount = testCountsQ.data?.get(standard.id) ?? 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-[var(--border-faint)]">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="text-[12px] text-[var(--text-lo)] underline"
          >
            ← 規格マスタ一覧
          </button>
          <span
            className="inline-block px-2 py-0.5 text-[11px] font-mono rounded"
            style={{
              background: `${ORG_ACCENT[standard.org]}22`,
              color: ORG_ACCENT[standard.org],
            }}
          >
            {standard.org}
          </span>
          <span className="font-mono text-[12px] text-[var(--text-lo)]">
            {standard.id}
          </span>
          <span className="text-[11px] text-[var(--text-lo)]">
            カテゴリ: {standard.category}
          </span>
        </div>
        <h1 className="text-xl font-bold mt-2 font-mono">{standard.code}</h1>
        <div className="mt-1 text-[14px]">{standard.title}</div>
        {standard.titleEn !== standard.title && (
          <div className="text-[12px] text-[var(--text-lo)] mt-0.5">{standard.titleEn}</div>
        )}
        {standard.url && (
          <a
            href={standard.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-[12px] underline text-[var(--accent,#2563eb)]"
          >
            規格ドキュメントを開く →
          </a>
        )}
      </header>

      <div className="flex-1 overflow-auto px-6 py-4 flex flex-col gap-6">
        {/* KPI */}
        <section aria-label="集計">
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
          >
            <div className="rounded border border-[var(--border-faint)] bg-[var(--bg-raised)] p-3">
              <div className="text-[11px] text-[var(--text-lo)]">関連試験種別</div>
              <div className="font-mono text-2xl font-semibold">
                {relatedTestTypes.length}
              </div>
            </div>
            <div className="rounded border border-[var(--border-faint)] bg-[var(--bg-raised)] p-3">
              <div className="text-[11px] text-[var(--text-lo)]">準拠材料</div>
              <div className="font-mono text-2xl font-semibold">
                {referencingMaterials.length}
              </div>
            </div>
            <div className="rounded border border-[var(--border-faint)] bg-[var(--bg-raised)] p-3">
              <div className="text-[11px] text-[var(--text-lo)]">この規格での試験実績</div>
              <div className="font-mono text-2xl font-semibold">{testCount}</div>
            </div>
          </div>
        </section>

        {/* 関連試験種別 + 準拠材料 */}
        <div className="grid gap-6 md:grid-cols-2">
          <section
            aria-label="関連試験種別"
            className="rounded-lg border border-[var(--border-faint)] bg-[var(--bg-raised)] p-4"
          >
            <h2 className="text-[14px] font-semibold mb-2">関連試験種別</h2>
            {relatedTestTypes.length === 0 ? (
              <div className="text-[12px] text-[var(--text-lo)]">
                この規格が直接紐づく試験種別はありません（材料規格など）。
              </div>
            ) : (
              <ul className="flex flex-col gap-1">
                {relatedTestTypes.map((tt) => (
                  <li
                    key={tt.id}
                    className="flex items-baseline gap-3 py-1 border-b border-[var(--border-faint)] last:border-b-0"
                  >
                    <span className="font-mono text-[11px] text-[var(--text-lo)]">
                      {tt.id}
                    </span>
                    <span className="flex-1 text-[13px]">{tt.name}</span>
                    <span className="text-[11px] text-[var(--text-lo)]">{tt.nameEn}</span>
                    <button
                      type="button"
                      onClick={() => onNav('matrix')}
                      className="text-[11px] underline text-[var(--accent,#2563eb)]"
                    >
                      マトリクスで見る
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            aria-label="準拠材料"
            className="rounded-lg border border-[var(--border-faint)] bg-[var(--bg-raised)] p-4"
          >
            <h2 className="text-[14px] font-semibold mb-2">この規格を参照している材料</h2>
            {referencingMaterials.length === 0 ? (
              <div className="text-[12px] text-[var(--text-lo)]">
                参照材料はまだ登録されていません。
              </div>
            ) : (
              <ul className="flex flex-col gap-1">
                {referencingMaterials.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-3 py-1 border-b border-[var(--border-faint)] last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => onNav(`mat-master_${m.id}`)}
                      className="font-mono text-[13px] underline text-[var(--accent,#2563eb)]"
                    >
                      {m.designation}
                    </button>
                    <span className="text-[11px] text-[var(--text-lo)] flex-1 truncate">
                      {m.category}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
