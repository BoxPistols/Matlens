// CellTestList — マトリクスのセル選択時に、その組合せに含まれる試験を
// 一覧表示し、個別 / 一括の MaiML エクスポートを起点とするコンポーネント。
//
// 設計方針:
// - 試験データ（Test / Specimen / DamageFinding）は親から受け取る（DI）。
// - エクスポート確認モーダル本体は親が表示する。本コンポーネントはコールバックで
//   「この試験集合を出力したい」イベントだけを返す（描画の関心分離）。
// - 表示量は「セルの試験 N 件」想定なので仮想スクロール等は不要。

import type { DamageFinding, ID, Specimen, Test } from '@/domain/types';

interface CellTestListProps {
  tests: Test[];
  specimens: Specimen[];
  damages: DamageFinding[];
  /** 単一テストを MaiML エクスポート要求として親に通知する */
  onExportSingle: (testId: ID) => void;
  /** セル内の全テストをまとめて MaiML エクスポート要求 */
  onExportAll: () => void;
}

const formatDate = (iso: string) => iso.slice(0, 10);

export const CellTestList = ({
  tests,
  specimens,
  damages,
  onExportSingle,
  onExportAll,
}: CellTestListProps) => {
  if (tests.length === 0) {
    return (
      <div className="text-[12px] text-[var(--text-lo)] italic">
        この組合せの過去試験はまだありません。
      </div>
    );
  }

  const specimenByTestId = new Map<ID, Specimen | undefined>();
  for (const t of tests) {
    specimenByTestId.set(t.id, specimens.find((s) => s.id === t.specimenId));
  }

  // 損傷所見は test に紐づくため、testId → 件数 で前計算
  const damageCountByTestId = new Map<ID, number>();
  for (const d of damages) {
    if (!d.testId) continue;
    damageCountByTestId.set(d.testId, (damageCountByTestId.get(d.testId) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-[11px] text-[var(--text-lo)]">
          このセルの試験 ({tests.length} 件)
        </div>
        <button
          type="button"
          onClick={onExportAll}
          className="text-[11px] px-2 py-1 rounded border border-[var(--border-default)] hover:bg-[var(--hover)]"
        >
          全件 MaiML
        </button>
      </div>

      <ul className="flex flex-col gap-1">
        {tests.map((t) => {
          const sp = specimenByTestId.get(t.id);
          const dmgCount = damageCountByTestId.get(t.id) ?? 0;
          return (
            <li
              key={t.id}
              className="rounded border border-[var(--border-faint)] bg-[var(--bg-sunken)] p-2 text-[11px] flex items-center gap-2"
            >
              <div className="flex-1 min-w-0">
                <div className="font-mono truncate">{t.id}</div>
                <div className="text-[10px] text-[var(--text-lo)] flex gap-2 flex-wrap">
                  <span>{formatDate(t.performedAt)}</span>
                  {sp && <span>試験片 {sp.code}</span>}
                  <span>{t.condition.temperature.value}{t.condition.temperature.unit === 'C' ? '℃' : 'K'}</span>
                  <span>{t.condition.atmosphere}</span>
                  {dmgCount > 0 && (
                    <span className="text-[var(--warn,#d97706)]">損傷 {dmgCount} 件</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onExportSingle(t.id)}
                aria-label={`${t.id} を MaiML エクスポート`}
                className="text-[10px] px-2 py-0.5 rounded border border-[var(--border-default)] hover:bg-[var(--hover)] whitespace-nowrap"
              >
                MaiML
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
