// MaiML バリデート画面（Phase 2 ではスタブ）。
// 将来的には XSD 検証 + provenance / uncertainty 必須項目チェックを行う。
// 仮実装として、既存 parseMaimlToMaterials の warnings リストを表示するだけにする
// （これだけでも「MaiML が壊れていないか」の素朴チェックには有用）。

import { useState } from 'react';
import { parseMaimlToMaterials } from '@/services/maiml';
import { MaimlPageLayout } from './components/MaimlPageLayout';
import { MaimlFileDropZone } from './components/MaimlFileDropZone';

interface MaimlValidatePageProps {
  onNav: (page: string) => void;
}

interface ValidationResult {
  filename: string;
  materialCount: number;
  warnings: string[];
  generatedAt: string | null;
}

export const MaimlValidatePage = ({ onNav }: MaimlValidatePageProps) => {
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validate = (text: string, filename: string) => {
    setError(null);
    try {
      const r = parseMaimlToMaterials(text);
      setResult({
        filename,
        materialCount: r.materials.length,
        warnings: r.warnings,
        generatedAt: r.generatedAt,
      });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <MaimlPageLayout
      title="MaiML バリデート"
      subtitle="Phase 2 暫定版: parseMaimlToMaterials の警告リストを表示します。XSD 検証 + provenance / uncertainty 必須項目チェックは Phase 9 で実装予定。"
      onBackToHub={() => onNav('maiml-hub')}
    >
      <div className="flex flex-col gap-4 max-w-3xl">
        <div className="rounded border border-[var(--border-faint)] bg-[rgba(217,119,6,0.06)] p-3 text-[12px]">
          <span className="font-semibold text-[var(--warn,#d97706)]">WIP:</span>
          {' '}本格的な XSD 検証と必須項目チェックは Phase 9 で実装予定。
          現状は parser 側の警告リスト表示のみです。
        </div>

        {!result && !error && (
          <MaimlFileDropZone
            onFileLoaded={validate}
            onError={setError}
            hint="MaiML ファイルを drop して検証"
          />
        )}

        {error && (
          <div className="rounded-lg border border-[var(--err,#dc2626)] bg-[rgba(220,38,38,0.08)] p-3 text-[13px]">
            <div className="font-semibold text-[var(--err,#dc2626)] mb-1">パースエラー</div>
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

        {result && (
          <div className="flex flex-col gap-3">
            <header className="rounded-lg border border-[var(--border-faint)] bg-[var(--bg-raised)] p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="font-mono text-[13px] truncate">{result.filename}</div>
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded"
                  style={{
                    background: result.warnings.length === 0 ? 'rgba(34,197,94,0.14)' : 'rgba(217,119,6,0.14)',
                    color: result.warnings.length === 0 ? 'var(--ok,#22c55e)' : 'var(--warn,#d97706)',
                  }}
                >
                  {result.warnings.length === 0 ? 'OK' : `${result.warnings.length} 警告`}
                </span>
              </div>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
                <dt className="text-[var(--text-lo)]">取込可能件数</dt>
                <dd className="font-mono text-right">{result.materialCount} 件</dd>
                <dt className="text-[var(--text-lo)]">出力日時</dt>
                <dd className="font-mono text-right">{result.generatedAt ?? '—'}</dd>
              </dl>
            </header>

            {result.warnings.length > 0 && (
              <ul className="rounded-lg border border-[var(--warn,#d97706)] bg-[rgba(217,119,6,0.06)] p-3 text-[12px] list-disc list-inside flex flex-col gap-1">
                {result.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={() => setResult(null)}
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
