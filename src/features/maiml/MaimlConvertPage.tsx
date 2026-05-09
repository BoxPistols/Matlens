// CSV / Excel エクスポート → MaiML 変換画面。
// 元データが現場の Excel に散在している現実 (痛み B1 🔥) を踏まえ、
// Excel → CSV (UTF-8) → MaiML の経路を 1 画面で完結させる。
//
// フロー:
//   1) CSV ファイルを drop
//   2) ヘッダ行を検出し、Material フィールドへの推測マッピングを表示
//   3) ユーザがマッピングを確認 / 修正 (id / name は必須)
//   4) preview (取込 件数 + 警告 + 先頭 10 件)
//   5) 「.maiml ダウンロード」 or 「Studio Import に commit」を選択
//
// xlsx は将来対応 (SheetJS は ~400KB のため遅延ロード前提)。
// 現時点では Excel 「名前を付けて保存 → CSV (UTF-8)」運用を前提とする。

import { useMemo, useState } from 'react';
import type { Material, DbAction } from '@/types';
import {
  parseCsvWithHeader,
  inferColumnMapping,
  buildMaterialsFromCsv,
  ALL_MATERIAL_FIELDS,
  type ColumnMapping,
  type MaterialField,
  type CsvParseResult,
} from '@/services/csvToMaiml';
import { serializeMaterialsToMaiml } from '@/services/maiml';
import { downloadTextFile } from '@/services/downloadFile';
import { MaimlPageLayout } from './components/MaimlPageLayout';

interface MaimlConvertPageProps {
  db: Material[];
  dispatch: React.Dispatch<DbAction>;
  onNav: (page: string) => void;
}

interface LoadedCsv {
  filename: string;
  csv: CsvParseResult;
}

const REQUIRED_FIELDS: MaterialField[] = ['id', 'name'];

export const MaimlConvertPage = ({ db, dispatch, onNav }: MaimlConvertPageProps) => {
  const [loaded, setLoaded] = useState<LoadedCsv | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [error, setError] = useState<string | null>(null);
  const [imported, setImported] = useState<{ count: number; skipped: number } | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setImported(null);
    if (!/\.(csv|tsv|txt)$/i.test(file.name)) {
      setError('対応拡張子は .csv / .tsv / .txt です（Excel は CSV エクスポートしてください）');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('ファイルサイズが上限 (10 MB) を超えています');
      return;
    }
    try {
      const text = await file.text();
      const csv = parseCsvWithHeader(text);
      if (csv.headers.length === 0) {
        setError('CSV のヘッダ行が読めませんでした');
        return;
      }
      setLoaded({ filename: file.name, csv });
      setMapping(inferColumnMapping(csv.headers));
    } catch (e) {
      setError(`読み込みエラー: ${(e as Error).message}`);
    }
  };

  const reset = () => {
    setLoaded(null);
    setMapping({});
    setError(null);
    setImported(null);
  };

  // マッピング変更ハンドラ。空文字は割当解除。
  const onMappingChange = (field: MaterialField, header: string) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (header === '') {
        delete next[field];
      } else {
        next[field] = header;
      }
      return next;
    });
  };

  const result = useMemo(() => {
    if (!loaded) return null;
    return buildMaterialsFromCsv(loaded.csv, mapping);
  }, [loaded, mapping]);

  const requiredMissing = REQUIRED_FIELDS.filter((f) => !mapping[f]);
  const canCommit = !!result && requiredMissing.length === 0 && result.materials.length > 0;

  const handleDownloadMaiml = () => {
    if (!result || result.materials.length === 0) return;
    const xml = serializeMaterialsToMaiml(result.materials, { source: 'matlens-csv-import' });
    const base = loaded?.filename.replace(/\.(csv|tsv|txt)$/i, '') ?? 'export';
    downloadTextFile(xml, `${base}.maiml`, 'application/xml');
  };

  const handleCommit = () => {
    if (!result || result.materials.length === 0) return;
    const existing = new Set(db.map((r) => r.id));
    const fresh = result.materials.filter((m) => !existing.has(m.id));
    const skipped = result.materials.length - fresh.length;
    if (fresh.length === 0) {
      setImported({ count: 0, skipped });
      return;
    }
    dispatch({ type: 'IMPORT', records: fresh });
    setImported({ count: fresh.length, skipped });
  };

  return (
    <MaimlPageLayout
      title="CSV → MaiML 変換"
      subtitle="Excel エクスポート (CSV / UTF-8) を Material[] にマッピングし MaiML XML に変換します。.maiml をダウンロードするか、Studio Import 経由でアプリ内に取り込めます。"
      onBackToHub={() => onNav('maiml-hub')}
    >
      <div className="flex flex-col gap-4 max-w-4xl">
        {!loaded && !imported && (
          <DropZone onFile={handleFile} />
        )}

        {error && (
          <div className="rounded-lg border border-[var(--err,#dc2626)] bg-[rgba(220,38,38,0.08)] p-4 text-[13px]">
            <div className="font-semibold text-[var(--err,#dc2626)] mb-1">エラー</div>
            <div className="text-[var(--text-md)]">{error}</div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="mt-3 text-[12px] underline text-[var(--text-lo)]"
            >
              閉じる
            </button>
          </div>
        )}

        {loaded && !imported && (
          <>
            <header className="rounded-lg border border-[var(--border-faint)] bg-[var(--bg-raised)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-mono text-[13px] truncate">{loaded.filename}</div>
                <span className="text-[12px] font-mono px-2 py-0.5 rounded bg-[var(--accent-dim)] text-[var(--accent,#2563eb)]">
                  {loaded.csv.rows.length} 行 / {loaded.csv.headers.length} 列
                </span>
              </div>
            </header>

            <MappingTable
              headers={loaded.csv.headers}
              mapping={mapping}
              onChange={onMappingChange}
            />

            {requiredMissing.length > 0 && (
              <div className="rounded-lg border border-[var(--warn,#d97706)] bg-[rgba(217,119,6,0.08)] p-3 text-[13px]">
                必須カラムが未割当です: {requiredMissing.join(', ')}
              </div>
            )}

            {result && result.warnings.length > 0 && (
              <details className="rounded-lg border border-[var(--warn,#d97706)] bg-[rgba(217,119,6,0.08)] p-3">
                <summary className="cursor-pointer text-[13px] font-semibold text-[var(--warn,#d97706)]">
                  警告 {result.warnings.length} 件（クリックで展開）
                </summary>
                <ul className="mt-2 text-[12px] list-disc list-inside flex flex-col gap-1 max-h-48 overflow-auto">
                  {result.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </details>
            )}

            {result && result.materials.length > 0 && (
              <PreviewTable materials={result.materials} />
            )}

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
                onClick={handleDownloadMaiml}
                disabled={!canCommit}
                className="text-[12px] px-3 py-1.5 rounded border border-[var(--border-default)] hover:bg-[var(--hover)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                .maiml をダウンロード
              </button>
              <button
                type="button"
                onClick={handleCommit}
                disabled={!canCommit}
                className="text-[12px] px-3 py-1.5 rounded bg-[var(--accent,#2563eb)] text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {result?.materials.length ?? 0} 件をアプリに取り込む
              </button>
            </div>
          </>
        )}

        {imported && (
          <div className="rounded-lg border border-[var(--ok,#22c55e)] bg-[rgba(34,197,94,0.08)] p-4">
            <div className="text-[14px] font-semibold text-[var(--ok,#22c55e)]">取込完了</div>
            <p className="mt-1 text-[13px]">
              {imported.count} 件を取り込みました
              {imported.skipped > 0 && (
                <span className="text-[var(--text-lo)]">
                  （既存 ID 重複により {imported.skipped} 件を skip）
                </span>
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
                別の CSV を変換する
              </button>
            </div>
          </div>
        )}
      </div>
    </MaimlPageLayout>
  );
};

// ----- 内部コンポーネント -----

const DropZone = ({ onFile }: { onFile: (file: File) => void }) => {
  const [dragging, setDragging] = useState(false);
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
      }}
      className={`flex flex-col items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
        dragging
          ? 'border-[var(--accent,#2563eb)] bg-[var(--accent-dim)]'
          : 'border-[var(--border-faint)] bg-[var(--bg-raised)] hover:bg-[var(--hover)]'
      }`}
    >
      <div className="text-[14px] font-semibold">CSV / TSV ファイルをドロップ、またはクリックで選択</div>
      <div className="text-[12px] text-[var(--text-lo)]">
        Excel から「名前を付けて保存 → CSV (UTF-8)」で書き出したファイルが対象（最大 10 MB）
      </div>
      <input
        type="file"
        accept=".csv,.tsv,.txt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = '';
        }}
      />
    </label>
  );
};

interface MappingTableProps {
  headers: string[];
  mapping: ColumnMapping;
  onChange: (field: MaterialField, header: string) => void;
}

const MappingTable = ({ headers, mapping, onChange }: MappingTableProps) => (
  <section
    aria-label="カラムマッピング"
    className="rounded-lg border border-[var(--border-faint)] overflow-hidden"
  >
    <div className="text-[12px] text-[var(--text-lo)] px-3 py-1.5 bg-[var(--bg-sunken)] border-b border-[var(--border-faint)]">
      カラムマッピング — Material のフィールドに、CSV のどのヘッダを割り当てるか選択
    </div>
    <table className="w-full text-[12px]">
      <thead>
        <tr className="bg-[var(--bg-raised)] border-b border-[var(--border-faint)]">
          <th className="px-3 py-1.5 text-left font-semibold w-[40%]">Material フィールド</th>
          <th className="px-3 py-1.5 text-left font-semibold">CSV ヘッダ</th>
        </tr>
      </thead>
      <tbody>
        {ALL_MATERIAL_FIELDS.map(({ field, label, required }) => (
          <tr key={field} className="border-b border-[var(--border-faint)]">
            <td className="px-3 py-1.5">
              {label}
              {required && (
                <span className="ml-1 text-[var(--err,#dc2626)] font-bold">*</span>
              )}
            </td>
            <td className="px-3 py-1">
              <select
                value={mapping[field] ?? ''}
                onChange={(e) => onChange(field, e.target.value)}
                className="text-[12px] px-2 py-1 rounded border border-[var(--border-default)] bg-[var(--bg-base)] min-w-[160px]"
                aria-label={`${label} のカラム`}
              >
                <option value="">— 未割当 —</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);

const PreviewTable = ({ materials }: { materials: Material[] }) => (
  <section
    aria-label="取り込み対象プレビュー"
    className="rounded-lg border border-[var(--border-faint)] overflow-hidden"
  >
    <div className="text-[12px] text-[var(--text-lo)] px-3 py-1.5 bg-[var(--bg-sunken)] border-b border-[var(--border-faint)]">
      プレビュー（先頭 10 件）— ここで内容を確認してから取込してください
    </div>
    <table className="w-full text-[12px]">
      <thead>
        <tr className="bg-[var(--bg-raised)] border-b border-[var(--border-faint)]">
          <th className="px-3 py-1.5 text-left font-semibold">ID</th>
          <th className="px-3 py-1.5 text-left font-semibold">名前</th>
          <th className="px-3 py-1.5 text-left font-semibold">カテゴリ</th>
          <th className="px-3 py-1.5 text-right font-semibold">硬度 HV</th>
          <th className="px-3 py-1.5 text-right font-semibold">引張 MPa</th>
        </tr>
      </thead>
      <tbody>
        {materials.slice(0, 10).map((m) => (
          <tr key={m.id} className="border-b border-[var(--border-faint)]">
            <td className="px-3 py-1 font-mono">{m.id}</td>
            <td className="px-3 py-1">{m.name}</td>
            <td className="px-3 py-1">{m.cat}</td>
            <td className="px-3 py-1 font-mono text-right">{m.hv}</td>
            <td className="px-3 py-1 font-mono text-right">{m.ts}</td>
          </tr>
        ))}
      </tbody>
    </table>
    {materials.length > 10 && (
      <div className="px-3 py-1.5 text-[12px] text-[var(--text-lo)]">
        他 {materials.length - 10} 件
      </div>
    )}
  </section>
);
