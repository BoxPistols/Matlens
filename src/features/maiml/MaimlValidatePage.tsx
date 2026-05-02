// MaiML バリデート画面（Phase 9 フル実装）。
// validateMaiml 純関数で意味的検証を行い、severity (error/warn/info) ごとに
// グループ化して表示する。XSD 完全検証は CI（xmllint）で別途行う前提。

import { useState } from 'react';
import { validateMaiml, type MaimlValidationReport, type IssueSeverity } from '@/services/maimlValidate';
import { MaimlPageLayout } from './components/MaimlPageLayout';
import { MaimlFileDropZone } from './components/MaimlFileDropZone';

interface MaimlValidatePageProps {
  onNav: (page: string) => void;
}

const SEVERITY_LABEL: Record<IssueSeverity, string> = {
  error: 'エラー',
  warn: '警告',
  info: '情報',
};

const SEVERITY_COLOR: Record<IssueSeverity, { fg: string; bg: string }> = {
  error: { fg: 'var(--err, #dc2626)', bg: 'rgba(220,38,38,0.08)' },
  warn: { fg: 'var(--warn, #d97706)', bg: 'rgba(217,119,6,0.08)' },
  info: { fg: 'var(--text-md, #cbd5e1)', bg: 'rgba(148,163,184,0.08)' },
};

interface RunState {
  filename: string;
  report: MaimlValidationReport;
}

export const MaimlValidatePage = ({ onNav }: MaimlValidatePageProps) => {
  const [run, setRun] = useState<RunState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = (text: string, filename: string) => {
    setError(null);
    const report = validateMaiml(text);
    setRun({ filename, report });
  };

  return (
    <MaimlPageLayout
      title="MaiML バリデート"
      subtitle="DOCTYPE 拒否・ルート要素・header メタ・provenance / uncertainty 必須項目を検証します。XSD 完全検証は CI（xmllint）で別途実施します。"
      onBackToHub={() => onNav('maiml-hub')}
    >
      <div className="flex flex-col gap-4 max-w-3xl">
        {!run && !error && (
          <MaimlFileDropZone onFileLoaded={validate} onError={setError} hint="MaiML ファイルを drop して検証" />
        )}

        {error && (
          <div className="rounded-lg border border-[var(--err,#dc2626)] bg-[rgba(220,38,38,0.08)] p-3 text-[13px]">
            <div className="font-semibold text-[var(--err,#dc2626)] mb-1">読み込みエラー</div>
            <div>{error}</div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="mt-2 text-[12px] underline text-[var(--text-lo)]"
            >
              再試行
            </button>
          </div>
        )}

        {run && (
          <div className="flex flex-col gap-3">
            <header className="rounded-lg border border-[var(--border-faint)] bg-[var(--bg-raised)] p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="font-mono text-[13px] truncate">{run.filename}</div>
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded"
                  style={{
                    background: run.report.errorCount === 0 ? 'rgba(34,197,94,0.14)' : SEVERITY_COLOR.error.bg,
                    color: run.report.errorCount === 0 ? 'var(--ok,#22c55e)' : SEVERITY_COLOR.error.fg,
                  }}
                >
                  {run.report.errorCount === 0
                    ? 'OK'
                    : `${run.report.errorCount} エラー / ${run.report.warnCount} 警告`}
                </span>
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
                <dt className="text-[var(--text-lo)]">documentKind</dt>
                <dd className="font-mono text-right">{run.report.documentKind ?? '—'}</dd>
                <dt className="text-[var(--text-lo)]">出力日時</dt>
                <dd className="font-mono text-right">{run.report.generatedAt ?? '—'}</dd>
                <dt className="text-[var(--text-lo)]">出力元</dt>
                <dd className="font-mono text-right">{run.report.source ?? '—'}</dd>
              </dl>
            </header>

            <section
              aria-label="検証結果"
              className="grid grid-cols-3 gap-2 text-[12px]"
            >
              <Stat label="エラー" count={run.report.errorCount} severity="error" />
              <Stat label="警告" count={run.report.warnCount} severity="warn" />
              <Stat label="情報" count={run.report.infoCount} severity="info" />
            </section>

            {run.report.issues.length === 0 ? (
              <div className="rounded-lg border border-[var(--ok,#22c55e)] bg-[rgba(34,197,94,0.08)] p-3 text-[13px]">
                指摘事項はありません。
              </div>
            ) : (
              <ul className="rounded-lg border border-[var(--border-faint)] divide-y divide-[var(--border-faint)] overflow-hidden">
                {run.report.issues.map((issue, i) => (
                  <li
                    key={i}
                    className="px-3 py-2 text-[12px] flex items-start gap-3"
                    style={{ background: SEVERITY_COLOR[issue.severity].bg }}
                  >
                    <span
                      className="text-[10px] font-mono uppercase tracking-[0.05em] px-1.5 py-0.5 rounded shrink-0"
                      style={{
                        color: SEVERITY_COLOR[issue.severity].fg,
                        border: `1px solid ${SEVERITY_COLOR[issue.severity].fg}`,
                      }}
                    >
                      {SEVERITY_LABEL[issue.severity]}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--text-lo)] shrink-0">{issue.code}</span>
                    <span className="flex-1">{issue.message}</span>
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={() => setRun(null)}
              className="text-[12px] underline text-[var(--text-lo)] self-start"
            >
              別のファイルを検証
            </button>
          </div>
        )}
      </div>
    </MaimlPageLayout>
  );
};

const Stat = ({ label, count, severity }: { label: string; count: number; severity: IssueSeverity }) => (
  <div
    className="rounded border p-3"
    style={{
      borderColor: SEVERITY_COLOR[severity].fg,
      background: SEVERITY_COLOR[severity].bg,
    }}
  >
    <div className="text-[10px] uppercase tracking-[0.05em] text-[var(--text-lo)]">{label}</div>
    <div className="font-mono text-2xl font-bold" style={{ color: SEVERITY_COLOR[severity].fg }}>
      {count}
    </div>
  </div>
);
