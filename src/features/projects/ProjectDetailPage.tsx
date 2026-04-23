import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '@/app/providers';
import type { ID } from '@/domain/types';
import { ProjectStatusPill } from './components/ProjectStatusPill';
import { DueTimeline } from './components/DueTimeline';
import { SpecimenKanbanMini } from './components/SpecimenKanbanMini';
import { useCustomersIndex, useProject } from './api';

interface ProjectDetailPageProps {
  id: ID;
  onBack: () => void;
  onNav: (page: string) => void;
}

export const ProjectDetailPage = ({ id, onBack, onNav }: ProjectDetailPageProps) => {
  const { data: project, isLoading } = useProject(id);
  const { data: customerIndex } = useCustomersIndex();
  const { specimens, tests } = useRepositories();

  const specimensQuery = useQuery({
    queryKey: ['project-specimens', id],
    queryFn: () => specimens.list({ filter: { projectId: id }, pageSize: 100 }),
    enabled: !!project,
  });
  const testsQuery = useQuery({
    queryKey: ['project-tests', id],
    queryFn: () => tests.list({ filter: { projectId: id }, pageSize: 100 }),
    enabled: !!project,
  });

  if (isLoading) {
    return <div className="p-6 text-[var(--text-lo)]">案件を読み込んでいます…</div>;
  }
  if (!project) {
    return (
      <div className="p-6">
        <div className="text-[var(--text-lo)]">案件が見つかりません。</div>
        <button type="button" onClick={onBack} className="mt-4 underline">
          一覧に戻る
        </button>
      </div>
    );
  }

  const customer = customerIndex?.get(project.customerId);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-[var(--border-faint)]">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="text-[12px] text-[var(--text-lo)] underline"
          >
            ← 案件一覧
          </button>
          <span className="font-mono text-[12px] text-[var(--text-lo)]">{project.code}</span>
          <ProjectStatusPill status={project.status} />
        </div>
        <h1 className="text-xl font-bold mt-2">{project.title}</h1>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-[13px]">
          <InfoCell label="顧客" value={customer?.name ?? project.customerId} />
          <InfoCell label="開始日" value={project.startedAt} />
          <InfoCell label="納期" value={project.dueAt ?? '—'} />
          <InfoCell
            label="完了日"
            value={project.completedAt ?? (project.status === 'completed' ? '—' : '未完了')}
          />
        </div>
      </header>
      <div className="flex-1 overflow-auto px-6 py-4">
        <section className="mb-6">
          <h2 className="font-semibold mb-2 text-[14px]">納期タイムライン</h2>
          <div className="rounded-lg border border-[var(--border-faint)] bg-[var(--bg-raised)] p-3">
            <DueTimeline
              startedAt={project.startedAt}
              dueAt={project.dueAt}
              completedAt={project.completedAt}
            />
          </div>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold mb-2 text-[14px]">試験片ステータス</h2>
          {specimensQuery.data ? (
            <SpecimenKanbanMini specimens={specimensQuery.data.items} />
          ) : (
            <div className="text-[12px] text-[var(--text-lo)]">読み込み中…</div>
          )}
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">試験片 ({project.specimenCount})</h2>
            <button
              type="button"
              onClick={() => onNav('matrix')}
              className="text-[12px] underline text-[var(--text-lo)]"
            >
              試験マトリクスで俯瞰
            </button>
          </div>
          {specimensQuery.isLoading || !specimensQuery.data ? (
            <div className="text-[var(--text-lo)] text-[13px]">読み込み中…</div>
          ) : specimensQuery.data.items.length === 0 ? (
            <div className="text-[var(--text-lo)] text-[13px]">
              試験片は登録されていません。
            </div>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left border-b border-[var(--border-faint)]">
                  <th className="px-2 py-1.5 font-semibold">コード</th>
                  <th className="px-2 py-1.5 font-semibold">材料</th>
                  <th className="px-2 py-1.5 font-semibold">形状</th>
                  <th className="px-2 py-1.5 font-semibold">保管</th>
                  <th className="px-2 py-1.5 font-semibold">ステータス</th>
                </tr>
              </thead>
              <tbody>
                {specimensQuery.data.items.map((s) => (
                  <tr key={s.id} className="border-b border-[var(--border-faint)]">
                    <td className="px-2 py-1.5 font-mono">{s.code}</td>
                    <td className="px-2 py-1.5 font-mono">{s.materialId}</td>
                    <td className="px-2 py-1.5">{s.dimensions.shape}</td>
                    <td className="px-2 py-1.5">{s.location}</td>
                    <td className="px-2 py-1.5">
                      <span className="text-[11px] text-[var(--text-md)]">{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section>
          <h2 className="font-semibold mb-2">試験実績 ({project.testCount})</h2>
          {testsQuery.isLoading || !testsQuery.data ? (
            <div className="text-[var(--text-lo)] text-[13px]">読み込み中…</div>
          ) : testsQuery.data.items.length === 0 ? (
            <div className="text-[var(--text-lo)] text-[13px]">試験は登録されていません。</div>
          ) : (
            <table className="w-full text-[12px]">
              <thead>
                <tr className="text-left border-b border-[var(--border-faint)]">
                  <th className="px-2 py-1.5 font-semibold">試験ID</th>
                  <th className="px-2 py-1.5 font-semibold">試験片</th>
                  <th className="px-2 py-1.5 font-semibold">種別</th>
                  <th className="px-2 py-1.5 font-semibold">温度</th>
                  <th className="px-2 py-1.5 font-semibold">雰囲気</th>
                  <th className="px-2 py-1.5 font-semibold">ステータス</th>
                  <th className="px-2 py-1.5 font-semibold">実施日</th>
                </tr>
              </thead>
              <tbody>
                {testsQuery.data.items.slice(0, 50).map((t) => (
                  <tr key={t.id} className="border-b border-[var(--border-faint)]">
                    <td className="px-2 py-1.5 font-mono">{t.id}</td>
                    <td className="px-2 py-1.5 font-mono">{t.specimenId}</td>
                    <td className="px-2 py-1.5 font-mono">{t.testTypeId}</td>
                    <td className="px-2 py-1.5 font-mono text-right">
                      {t.condition.temperature.value}
                      {t.condition.temperature.unit === 'C' ? '℃' : 'K'}
                    </td>
                    <td className="px-2 py-1.5">{t.condition.atmosphere}</td>
                    <td className="px-2 py-1.5">
                      <span className="text-[11px] text-[var(--text-md)]">{t.status}</span>
                    </td>
                    <td className="px-2 py-1.5 font-mono text-[11px]">
                      {t.performedAt.slice(0, 10)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {testsQuery.data && testsQuery.data.items.length > 50 && (
            <div className="mt-2 text-[11px] text-[var(--text-lo)]">
              先頭 50 件を表示しています（全 {testsQuery.data.items.length} 件）
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const InfoCell = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div className="text-[11px] text-[var(--text-lo)]">{label}</div>
    <div className="font-mono text-[13px]">{value}</div>
  </div>
);
