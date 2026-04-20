// Materials マスタ詳細 (#/mat-master/:id)
// 組成 / 物性 / 関連規格 / 直近試験 を一画面で俯瞰する。

import type { ID, Material } from '@/domain/types';
import { MATERIAL_CATEGORY_LABEL } from './MaterialsMasterListPage';
import {
  useMaterial,
  useMaterialRecentTests,
  useStandardsIndex,
} from './api';

interface MaterialsMasterDetailPageProps {
  id: ID;
  onBack: () => void;
  onNav: (page: string) => void;
}

const CompositionTable = ({ material }: { material: Material }) => {
  const sorted = [...material.composition].sort((a, b) => b.wtPercent - a.wtPercent);
  return (
    <table className="w-full text-[12px]">
      <thead>
        <tr className="text-left border-b border-[var(--border-faint)]">
          <th className="px-3 py-1.5 font-semibold">元素</th>
          <th className="px-3 py-1.5 font-semibold text-right">wt%</th>
          <th className="px-3 py-1.5 font-semibold text-right">許容幅</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((c) => (
          <tr key={c.element} className="border-b border-[var(--border-faint)]">
            <td className="px-3 py-1.5 font-mono">{c.element}</td>
            <td className="px-3 py-1.5 font-mono text-right">{c.wtPercent.toFixed(2)}</td>
            <td className="px-3 py-1.5 font-mono text-right text-[var(--text-lo)]">
              {c.tolerance !== undefined ? `±${c.tolerance}` : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const PropertyItem = ({
  label,
  value,
  unit,
}: {
  label: string;
  value: number | undefined;
  unit: string;
}) => (
  <div className="bg-[var(--bg-base,transparent)] border border-[var(--border-faint)] rounded p-3">
    <div className="text-[11px] text-[var(--text-lo)] mb-1">{label}</div>
    <div className="font-mono text-lg font-semibold">
      {value !== undefined ? value : '—'}
      {value !== undefined && (
        <span className="text-[11px] font-normal text-[var(--text-lo)] ml-1">{unit}</span>
      )}
    </div>
  </div>
);

export const MaterialsMasterDetailPage = ({
  id,
  onBack,
  onNav,
}: MaterialsMasterDetailPageProps) => {
  const materialQ = useMaterial(id);
  const standardsQ = useStandardsIndex();
  const recentTestsQ = useMaterialRecentTests(id, 20);

  if (materialQ.isError) {
    return (
      <div className="p-6">
        <div className="text-[var(--err,#dc2626)]">材料の読み込みに失敗しました。</div>
        <button type="button" onClick={onBack} className="mt-4 underline">
          一覧に戻る
        </button>
      </div>
    );
  }

  if (materialQ.isLoading) {
    return <div className="p-6 text-[var(--text-lo)]">材料を読み込んでいます…</div>;
  }

  const material = materialQ.data;
  if (!material) {
    return (
      <div className="p-6">
        <div className="text-[var(--text-lo)]">材料が見つかりません。</div>
        <button type="button" onClick={onBack} className="mt-4 underline">
          一覧に戻る
        </button>
      </div>
    );
  }

  const relatedStandards = material.standardRefs
    .map((sid) => standardsQ.data?.get(sid))
    .filter((s): s is NonNullable<typeof s> => !!s);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-[var(--border-faint)]">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="text-[12px] text-[var(--text-lo)] underline"
          >
            ← 材料マスタ一覧
          </button>
          <span className="font-mono text-[12px] text-[var(--text-lo)]">{material.id}</span>
          <span className="inline-block px-2 py-0.5 text-[11px] rounded-full border border-[var(--border-faint)]">
            {MATERIAL_CATEGORY_LABEL[material.category]}
          </span>
        </div>
        <h1 className="text-xl font-bold mt-2 font-mono">{material.designation}</h1>
        {material.description && (
          <p className="text-[13px] text-[var(--text-lo)] mt-1">{material.description}</p>
        )}
      </header>

      <div className="flex-1 overflow-auto px-6 py-4 flex flex-col gap-6">
        {/* 物性 */}
        <section aria-label="代表物性">
          <h2 className="text-[14px] font-semibold mb-2">代表物性</h2>
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}
          >
            <PropertyItem label="密度" value={material.properties.density} unit="g/cm³" />
            <PropertyItem label="融点" value={material.properties.meltingPoint} unit="℃" />
            <PropertyItem
              label="ヤング率"
              value={material.properties.youngsModulus}
              unit="GPa"
            />
            <PropertyItem
              label="降伏強さ"
              value={material.properties.yieldStrength}
              unit="MPa"
            />
          </div>
        </section>

        {/* 組成 + 規格 2 カラム */}
        <div className="grid gap-6 md:grid-cols-2">
          <section
            aria-label="化学組成"
            className="rounded-lg border border-[var(--border-faint)] bg-[var(--bg-raised)] p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[14px] font-semibold">化学組成</h2>
              <span className="text-[11px] text-[var(--text-lo)] tabular-nums">
                {material.composition.length} 元素
              </span>
            </div>
            <CompositionTable material={material} />
          </section>

          <section
            aria-label="関連規格"
            className="rounded-lg border border-[var(--border-faint)] bg-[var(--bg-raised)] p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[14px] font-semibold">関連規格</h2>
              <span className="text-[11px] text-[var(--text-lo)] tabular-nums">
                {material.standardRefs.length} 件
              </span>
            </div>
            {relatedStandards.length === 0 ? (
              <div className="text-[12px] text-[var(--text-lo)]">
                {standardsQ.isLoading
                  ? '読み込み中…'
                  : '関連規格は登録されていません。'}
              </div>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {relatedStandards.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-baseline gap-3 py-1 text-[12px] border-b border-[var(--border-faint)] last:border-b-0"
                  >
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-[var(--bg-base,transparent)] border border-[var(--border-faint)]">
                      {s.org}
                    </span>
                    <span className="font-mono">{s.code}</span>
                    <span className="flex-1 truncate">{s.title}</span>
                    {s.url && (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] underline text-[var(--accent,#2563eb)]"
                      >
                        参照
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* 直近試験 */}
        <section
          aria-label="直近の試験"
          className="rounded-lg border border-[var(--border-faint)] bg-[var(--bg-raised)] p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[14px] font-semibold">この材料で実施した直近の試験</h2>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onNav('matrix')}
                className="text-[11px] underline text-[var(--text-lo)]"
              >
                マトリクスで俯瞰
              </button>
            </div>
          </div>
          {recentTestsQ.isLoading ? (
            <div className="text-[12px] text-[var(--text-lo)]">読み込み中…</div>
          ) : (recentTestsQ.data?.length ?? 0) === 0 ? (
            <div className="text-[12px] text-[var(--text-lo)]">
              この材料で実施した試験はまだありません。
            </div>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left border-b border-[var(--border-faint)]">
                  <th className="px-2 py-1.5 font-semibold">試験 ID</th>
                  <th className="px-2 py-1.5 font-semibold">試験種別</th>
                  <th className="px-2 py-1.5 font-semibold">ステータス</th>
                  <th className="px-2 py-1.5 font-semibold text-right">温度</th>
                  <th className="px-2 py-1.5 font-semibold">雰囲気</th>
                  <th className="px-2 py-1.5 font-semibold text-right">実施日</th>
                </tr>
              </thead>
              <tbody>
                {recentTestsQ.data?.map((t) => (
                  <tr key={t.id} className="border-b border-[var(--border-faint)]">
                    <td className="px-2 py-1.5 font-mono">{t.id}</td>
                    <td className="px-2 py-1.5 font-mono">{t.testTypeId}</td>
                    <td className="px-2 py-1.5 text-[11px]">{t.status}</td>
                    <td className="px-2 py-1.5 font-mono text-right">
                      {t.condition.temperature.value}
                      {t.condition.temperature.unit === 'C' ? '℃' : 'K'}
                    </td>
                    <td className="px-2 py-1.5">{t.condition.atmosphere}</td>
                    <td className="px-2 py-1.5 font-mono text-right text-[11px]">
                      {t.performedAt.slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};
