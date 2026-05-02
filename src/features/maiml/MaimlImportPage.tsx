// MaiML インポート画面。
// drop → preview → commit の 3 段階で取り込み事故を防ぐ。
// 現状は材料 (Material[]) の round-trip 完全対応のみ。
// Project / TestSet の inverse parser は未実装のため、その場合は Inspect での
// 確認案内のみを出す（ADR-016 で明記予定）。

import { useState } from 'react';
import type { Material } from '@/types';
import type { DbAction } from '@/types';
import { parseMaimlToMaterials } from '@/services/maiml';
import { MaimlPageLayout } from './components/MaimlPageLayout';
import { MaimlFileDropZone } from './components/MaimlFileDropZone';

interface MaimlImportPageProps {
  db: Material[];
  dispatch: React.Dispatch<DbAction>;
  onNav: (page: string) => void;
}

interface ParsedState {
  filename: string;
  materials: Material[];
  warnings: string[];
  generatedAt: string | null;
  source: string | null;
}

export const MaimlImportPage = ({ db, dispatch, onNav }: MaimlImportPageProps) => {
  const [parsed, setParsed] = useState<ParsedState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imported, setImported] = useState<{ count: number; skipped: number } | null>(null);

  const reset = () => {
    setParsed(null);
    setError(null);
    setImported(null);
  };

  const handleFile = (text: string, filename: string) => {
    reset();
    try {
      const result = parseMaimlToMaterials(text);
      setParsed({
        filename,
        materials: result.materials,
        warnings: result.warnings,
        generatedAt: result.generatedAt,
        source: result.source,
      });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleConfirm = () => {
    if (!parsed) return;
    const existing = new Set(db.map((r) => r.id));
    const fresh = parsed.materials.filter((m) => m.id && !existing.has(m.id));
    const skipped = parsed.materials.length - fresh.length;
    if (fresh.length === 0) {
      setImported({ count: 0, skipped });
      return;
    }
    dispatch({ type: 'IMPORT', records: fresh });
    setImported({ count: fresh.length, skipped });
  };

  return (
    <MaimlPageLayout
      title="MaiML インポート"
      subtitle="MaiML / XML ファイルを 3 段階（取込 → preview → commit）で安全に取り込みます。即反映は事故になりやすいため必ずプレビューを挟みます。"
      onBackToHub={() => onNav('maiml-hub')}
    >
      <div className="flex flex-col gap-4 max-w-3xl">
        {!parsed && !error && !imported && (
          <MaimlFileDropZone onFileLoaded={handleFile} onError={setError} />
        )}

        {error && (
          <div className="rounded-lg border border-[var(--err,#dc2626)] bg-[rgba(220,38,38,0.08)] p-4 text-[13px]">
            <div className="font-semibold text-[var(--err,#dc2626)] mb-1">読み込みエラー</div>
            <div className="text-[var(--text-md)]">{error}</div>
            <button
              type="button"
              onClick={reset}
              className="mt-3 text-[12px] underline text-[var(--text-lo)]"
            >
              別のファイルを試す
            </button>
          </div>
        )}

        {parsed && !imported && (
          <div className="flex flex-col gap-3">
            <header className="rounded-lg border border-[var(--border-faint)] bg-[var(--bg-raised)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-mono text-[13px] truncate">{parsed.filename}</div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--accent-dim)] text-[var(--accent,#2563eb)]">
                  preview
                </span>
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
                <dt className="text-[var(--text-lo)]">取込件数</dt>
                <dd className="font-mono text-right">{parsed.materials.length} 件</dd>
                <dt className="text-[var(--text-lo)]">出力日時</dt>
                <dd className="font-mono text-right">{parsed.generatedAt ?? '—'}</dd>
                <dt className="text-[var(--text-lo)]">出力元</dt>
                <dd className="font-mono text-right">{parsed.source ?? '—'}</dd>
              </dl>
            </header>

            {parsed.warnings.length > 0 && (
              <details className="rounded-lg border border-[var(--warn,#d97706)] bg-[rgba(217,119,6,0.08)] p-3">
                <summary className="cursor-pointer text-[13px] font-semibold text-[var(--warn,#d97706)]">
                  警告 {parsed.warnings.length} 件（クリックで展開）
                </summary>
                <ul className="mt-2 text-[12px] list-disc list-inside flex flex-col gap-1">
                  {parsed.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </details>
            )}

            <section
              aria-label="取り込み対象の材料"
              className="rounded-lg border border-[var(--border-faint)] overflow-hidden"
            >
              <div className="text-[12px] text-[var(--text-lo)] px-3 py-1.5 bg-[var(--bg-sunken)] border-b border-[var(--border-faint)]">
                取り込み対象一覧（先頭 10 件）
              </div>
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-[var(--bg-raised)] border-b border-[var(--border-faint)]">
                    <th className="px-3 py-1.5 text-left font-semibold">ID</th>
                    <th className="px-3 py-1.5 text-left font-semibold">名前</th>
                    <th className="px-3 py-1.5 text-right font-semibold">硬度 HV</th>
                    <th className="px-3 py-1.5 text-right font-semibold">引張 MPa</th>
                  </tr>
                </thead>
                <tbody>
                  {parsed.materials.slice(0, 10).map((m) => (
                    <tr key={m.id} className="border-b border-[var(--border-faint)]">
                      <td className="px-3 py-1 font-mono">{m.id}</td>
                      <td className="px-3 py-1">{m.name}</td>
                      <td className="px-3 py-1 font-mono text-right">{m.hv}</td>
                      <td className="px-3 py-1 font-mono text-right">{m.ts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsed.materials.length > 10 && (
                <div className="px-3 py-1.5 text-[11px] text-[var(--text-lo)]">
                  他 {parsed.materials.length - 10} 件
                </div>
              )}
            </section>

            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={reset}
                className="text-[12px] px-3 py-1.5 rounded border border-[var(--border-default)] hover:bg-[var(--hover)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="text-[12px] px-3 py-1.5 rounded bg-[var(--accent,#2563eb)] text-white hover:opacity-90"
              >
                {parsed.materials.length} 件を取り込む
              </button>
            </div>
          </div>
        )}

        {imported && (
          <div className="rounded-lg border border-[var(--ok,#22c55e)] bg-[rgba(34,197,94,0.08)] p-4">
            <div className="text-[14px] font-semibold text-[var(--ok,#22c55e)]">
              取込完了
            </div>
            <p className="mt-1 text-[13px]">
              {imported.count} 件を取り込みました
              {imported.skipped > 0 && (
                <span className="text-[var(--text-lo)]">（既存 ID 重複により {imported.skipped} 件を skip）</span>
              )}
              。
            </p>
            <div className="flex items-center gap-3 mt-3">
              <button
                type="button"
                onClick={() => onNav('list')}
                className="text-[12px] px-3 py-1.5 rounded border border-[var(--border-default)] hover:bg-[var(--hover)]"
              >
                材料データ一覧へ
              </button>
              <button
                type="button"
                onClick={reset}
                className="text-[12px] underline text-[var(--text-lo)]"
              >
                別のファイルを取り込む
              </button>
            </div>
          </div>
        )}
      </div>
    </MaimlPageLayout>
  );
};
