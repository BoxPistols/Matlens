// Reports 詳細 (#/report-detail/<id>)
// Markdown 本文を素レンダリング（PDF 変換・高度な書式は Phase 4 以降）。

import type { ReactElement, ReactNode } from 'react';
import type { ID } from '@/domain/types';
import {
  useProjectsIndexForReports,
  useReport,
  useUsersIndex,
} from './api';
import {
  REPORT_KIND_LABEL,
  REPORT_STATUS_ACCENT,
  REPORT_STATUS_LABEL,
} from './ReportsListPage';

interface ReportDetailPageProps {
  id: ID;
  onBack: () => void;
  onNav: (page: string) => void;
}

/**
 * 簡易 Markdown レンダラ。
 * - 見出し (# / ## / ###)
 * - 表 (パイプ区切り)
 * - リスト (- / *)
 * - 段落・太字 `**...**`
 * - 行内 `code`
 * 依存を足さず本文表示ができる最低限。高度な書式は将来 marked 等に置換。
 */
// 非強欲マッチで `**a * b**` のような内部アスタリスク混入にも対応。
// バッククオートも同方針で揃える。
const INLINE_PATTERN = /(\*\*.+?\*\*|`.+?`)/g;

const inline = (text: string): ReactNode[] => {
  const out: ReactNode[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(INLINE_PATTERN)) {
    const start = match.index ?? 0;
    if (start > lastIndex) out.push(text.slice(lastIndex, start));
    const token = match[0];
    if (token.startsWith('**')) {
      out.push(
        <strong key={`b-${start}`} className="font-semibold">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      out.push(
        <code
          key={`c-${start}`}
          className="px-1 py-0.5 rounded bg-[var(--bg-raised)] border border-[var(--border-faint)] text-[11px] font-mono"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = start + token.length;
  }
  if (lastIndex < text.length) out.push(text.slice(lastIndex));
  return out;
};

const renderMarkdown = (src: string): ReactElement => {
  const lines = src.split('\n');
  const nodes: ReactElement[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i] ?? '';
    if (line.startsWith('# ')) {
      nodes.push(
        <h1 key={key++} className="text-xl font-bold mt-2 mb-2">
          {line.slice(2)}
        </h1>
      );
      i++;
    } else if (line.startsWith('## ')) {
      nodes.push(
        <h2 key={key++} className="text-[15px] font-semibold mt-4 mb-1.5">
          {line.slice(3)}
        </h2>
      );
      i++;
    } else if (line.startsWith('### ')) {
      nodes.push(
        <h3 key={key++} className="text-[13px] font-semibold mt-3 mb-1">
          {line.slice(4)}
        </h3>
      );
      i++;
    } else if (line.trim().startsWith('|') && (lines[i + 1] ?? '').trim().startsWith('|')) {
      // table
      const tableLines: string[] = [];
      while (i < lines.length && (lines[i] ?? '').trim().startsWith('|')) {
        tableLines.push(lines[i] ?? '');
        i++;
      }
      // 末尾パイプ省略形（`| a | b`）にも対応するため、先頭・末尾の `|` を
      // 「存在する場合のみ」剥がしてから split する。
      const rows = tableLines
        .map((row) => {
          const trimmed = row.trim();
          const noLeading = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed;
          const noTrailing = noLeading.endsWith('|') ? noLeading.slice(0, -1) : noLeading;
          return noTrailing.split('|').map((c) => c.trim());
        })
        .filter((r) => r.length > 0);
      const isSep = rows[1]?.every((c) => /^-{3,}$/.test(c));
      const header = isSep ? rows[0] : null;
      const body = isSep ? rows.slice(2) : rows;
      nodes.push(
        <div key={key++} className="overflow-x-auto my-2">
          <table className="w-full text-[12px] border-collapse">
            {header && (
              <thead>
                <tr>
                  {header.map((h, hi) => (
                    <th
                      key={hi}
                      className="border border-[var(--border-faint)] px-2 py-1 bg-[var(--bg-raised)] text-left font-semibold"
                    >
                      {inline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {body.map((row, ri) => (
                <tr key={ri}>
                  {row.map((c, ci) => (
                    <td
                      key={ci}
                      className="border border-[var(--border-faint)] px-2 py-1"
                    >
                      {inline(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = [];
      while (
        i < lines.length &&
        ((lines[i] ?? '').startsWith('- ') || (lines[i] ?? '').startsWith('* '))
      ) {
        items.push((lines[i] ?? '').slice(2));
        i++;
      }
      nodes.push(
        <ul key={key++} className="list-disc list-inside my-1 text-[13px]">
          {items.map((it, ii) => (
            <li key={ii}>{inline(it)}</li>
          ))}
        </ul>
      );
    } else if (line.trim() === '') {
      i++;
    } else {
      nodes.push(
        <p key={key++} className="my-2 text-[13px] leading-relaxed">
          {inline(line)}
        </p>
      );
      i++;
    }
  }

  return <>{nodes}</>;
};

export const ReportDetailPage = ({ id, onBack, onNav }: ReportDetailPageProps) => {
  const reportQ = useReport(id);
  const projectsQ = useProjectsIndexForReports();
  const usersQ = useUsersIndex();

  if (reportQ.isError) {
    return (
      <div className="p-6">
        <div className="text-[var(--err,#dc2626)]">レポートの読み込みに失敗しました。</div>
        <button type="button" onClick={onBack} className="mt-4 underline">
          一覧に戻る
        </button>
      </div>
    );
  }
  if (reportQ.isLoading) {
    return <div className="p-6 text-[var(--text-lo)]">レポートを読み込んでいます…</div>;
  }
  const report = reportQ.data;
  if (!report) {
    return (
      <div className="p-6">
        <div className="text-[var(--text-lo)]">レポートが見つかりません。</div>
        <button type="button" onClick={onBack} className="mt-4 underline">
          一覧に戻る
        </button>
      </div>
    );
  }

  const project = report.projectId ? projectsQ.data?.get(report.projectId) : null;
  const author = usersQ.data?.get(report.authorId);
  const reviewer = report.reviewerId ? usersQ.data?.get(report.reviewerId) : null;
  const approver = report.approverId ? usersQ.data?.get(report.approverId) : null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-4 border-b border-[var(--border-faint)]">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="text-[12px] text-[var(--text-lo)] underline"
          >
            ← レポート一覧
          </button>
          <span className="font-mono text-[12px] text-[var(--text-lo)]">{report.code}</span>
          <span
            className="inline-block px-2 py-0.5 text-[11px] rounded"
            style={{
              background: `${REPORT_STATUS_ACCENT[report.status]}22`,
              color: REPORT_STATUS_ACCENT[report.status],
            }}
          >
            {REPORT_STATUS_LABEL[report.status]}
          </span>
          <span className="inline-block px-2 py-0.5 text-[11px] rounded border border-[var(--border-faint)]">
            {REPORT_KIND_LABEL[report.kind]}
          </span>
        </div>
        <h1 className="text-xl font-bold mt-2">{report.title}</h1>
        {report.titleEn !== report.title && (
          <p className="text-[12px] text-[var(--text-lo)] mt-0.5">{report.titleEn}</p>
        )}
        <div className="mt-2 text-[12px] text-[var(--text-md)]">{report.summary}</div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="flex min-h-full">
          <article className="flex-1 px-6 py-4">{renderMarkdown(report.body)}</article>

          <aside
            className="w-72 border-l border-[var(--border-faint)] p-4 bg-[var(--bg-raised)] text-[12px] flex flex-col gap-4"
            aria-label="レポート メタ"
          >
            {project && (
              <div>
                <div className="text-[11px] text-[var(--text-lo)] mb-1">関連案件</div>
                <button
                  type="button"
                  onClick={() => onNav(`pjdetail_${project.id}`)}
                  className="text-left w-full underline text-[var(--accent,#2563eb)] font-mono"
                >
                  {project.code}
                </button>
                <div className="text-[11px] text-[var(--text-lo)] mt-0.5 truncate">
                  {project.title}
                </div>
              </div>
            )}

            <div>
              <div className="text-[11px] text-[var(--text-lo)] mb-1">担当</div>
              <dl className="grid grid-cols-[70px_1fr] gap-y-0.5">
                <dt className="text-[var(--text-lo)]">作成者</dt>
                <dd>{author?.name ?? report.authorId}</dd>
                <dt className="text-[var(--text-lo)]">レビュア</dt>
                <dd>{reviewer?.name ?? '—'}</dd>
                <dt className="text-[var(--text-lo)]">承認者</dt>
                <dd>{approver?.name ?? '—'}</dd>
              </dl>
            </div>

            <div>
              <div className="text-[11px] text-[var(--text-lo)] mb-1">日付</div>
              <dl className="grid grid-cols-[70px_1fr] gap-y-0.5 font-mono">
                <dt className="text-[var(--text-lo)]">作成</dt>
                <dd>{report.createdAt.slice(0, 10)}</dd>
                <dt className="text-[var(--text-lo)]">更新</dt>
                <dd>{report.updatedAt.slice(0, 10)}</dd>
                <dt className="text-[var(--text-lo)]">発行</dt>
                <dd>{report.issuedAt ?? '—'}</dd>
              </dl>
            </div>

            {(report.testIds.length > 0 ||
              report.specimenIds.length > 0 ||
              report.damageIds.length > 0) && (
              <div>
                <div className="text-[11px] text-[var(--text-lo)] mb-1">参照</div>
                <dl className="grid grid-cols-[70px_1fr] gap-y-0.5 font-mono">
                  <dt className="text-[var(--text-lo)]">試験</dt>
                  <dd>{report.testIds.length} 件</dd>
                  <dt className="text-[var(--text-lo)]">試験片</dt>
                  <dd>{report.specimenIds.length} 件</dd>
                  <dt className="text-[var(--text-lo)]">損傷所見</dt>
                  <dd>{report.damageIds.length} 件</dd>
                </dl>
              </div>
            )}

            {report.tags.length > 0 && (
              <div>
                <div className="text-[11px] text-[var(--text-lo)] mb-1">タグ</div>
                <div className="flex gap-1 flex-wrap">
                  {report.tags.map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.5 text-[10px] rounded border border-[var(--border-faint)]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};
