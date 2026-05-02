// MaiML Diff 画面（Phase 9 フル実装）。
// LCS ベースの行差分（diffLines 純関数）を表示する。
// 大規模ファイル時のパフォーマンスは将来 Myers アルゴリズムへの差し替えで対応。

import { useMemo, useState } from 'react';
import { diffLines, type DiffLine } from '@/services/maimlDiff';
import { MaimlPageLayout } from './components/MaimlPageLayout';
import { MaimlFileDropZone } from './components/MaimlFileDropZone';

interface MaimlDiffPageProps {
  onNav: (page: string) => void;
}

interface FileSlot {
  filename: string;
  text: string;
}

export const MaimlDiffPage = ({ onNav }: MaimlDiffPageProps) => {
  const [a, setA] = useState<FileSlot | null>(null);
  const [b, setB] = useState<FileSlot | null>(null);
  const [showEqual, setShowEqual] = useState(true);

  const diff = useMemo(() => {
    if (!a || !b) return null;
    return diffLines(a.text, b.text);
  }, [a, b]);

  const filtered = useMemo(() => {
    if (!diff) return [] as DiffLine[];
    return showEqual ? diff.lines : diff.lines.filter((l) => l.op !== 'equal');
  }, [diff, showEqual]);

  return (
    <MaimlPageLayout
      title="MaiML Diff"
      subtitle="2 つの MaiML / XML ファイルを行単位で差分表示します。LCS ベースの純 TS 実装で、改行コードは LF / CRLF を吸収します。"
      onBackToHub={() => onNav('maiml-hub')}
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <DiffSlot label="ファイル A（変更前）" slot={a} onLoad={setA} />
          <DiffSlot label="ファイル B（変更後）" slot={b} onLoad={setB} />
        </div>

        {a && b && diff && (
          <>
            <section
              aria-label="差分サマリ"
              className="grid grid-cols-3 gap-2 text-[12px]"
            >
              <SummaryCard label="追加" value={diff.summary.added} color="var(--ok,#22c55e)" bg="rgba(34,197,94,0.08)" />
              <SummaryCard label="削除" value={diff.summary.removed} color="var(--err,#dc2626)" bg="rgba(220,38,38,0.08)" />
              <SummaryCard label="変更なし" value={diff.summary.equal} color="var(--text-md)" bg="rgba(148,163,184,0.06)" />
            </section>

            <div className="flex items-center gap-3 text-[12px]">
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={showEqual}
                  onChange={(e) => setShowEqual(e.target.checked)}
                />
                変更なし行も表示
              </label>
              <span className="text-[var(--text-lo)]">表示行数: {filtered.length}</span>
            </div>

            <section
              aria-label="差分内容"
              className="rounded-lg border border-[var(--border-faint)] overflow-hidden"
            >
              <div className="overflow-x-auto max-h-[60vh]">
                <table className="w-full text-[11px] font-mono">
                  <thead className="bg-[var(--bg-raised)] sticky top-0">
                    <tr className="border-b border-[var(--border-faint)]">
                      <th className="px-2 py-1 text-right font-semibold w-12">A</th>
                      <th className="px-2 py-1 text-right font-semibold w-12">B</th>
                      <th className="px-2 py-1 text-left font-semibold">行</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((line, i) => (
                      <DiffRow key={i} line={line} />
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </MaimlPageLayout>
  );
};

const DiffSlot = ({
  label,
  slot,
  onLoad,
}: {
  label: string;
  slot: FileSlot | null;
  onLoad: (slot: FileSlot | null) => void;
}) => (
  <div className="flex flex-col gap-2">
    <div className="text-[12px] font-semibold">{label}</div>
    {slot ? (
      <div className="rounded-lg border border-[var(--border-faint)] bg-[var(--bg-raised)] p-3">
        <div className="font-mono text-[12px] truncate">{slot.filename}</div>
        <div className="text-[11px] text-[var(--text-lo)] mt-1">
          {(new Blob([slot.text]).size / 1024).toFixed(1)} KB / {slot.text.split('\n').length} 行
        </div>
        <button
          type="button"
          onClick={() => onLoad(null)}
          className="mt-2 text-[11px] underline text-[var(--text-lo)]"
        >
          差し替え
        </button>
      </div>
    ) : (
      <MaimlFileDropZone
        onFileLoaded={(text, filename) => onLoad({ text, filename })}
        hint={`${label} を drop`}
      />
    )}
  </div>
);

const SummaryCard = ({
  label,
  value,
  color,
  bg,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
}) => (
  <div className="rounded border p-3" style={{ borderColor: color, background: bg }}>
    <div className="text-[10px] uppercase tracking-[0.05em] text-[var(--text-lo)]">{label}</div>
    <div className="font-mono text-2xl font-bold" style={{ color }}>
      {value.toLocaleString()}
    </div>
  </div>
);

const DiffRow = ({ line }: { line: DiffLine }) => {
  const styles =
    line.op === 'added'
      ? { background: 'rgba(34,197,94,0.10)', color: 'var(--ok,#22c55e)' }
      : line.op === 'removed'
        ? { background: 'rgba(220,38,38,0.10)', color: 'var(--err,#dc2626)' }
        : { background: 'transparent', color: 'var(--text-md)' };
  const sign = line.op === 'added' ? '+' : line.op === 'removed' ? '-' : ' ';
  return (
    <tr className="border-b border-[var(--border-faint)] align-top" style={styles}>
      <td className="px-2 py-0.5 text-right tabular-nums opacity-70">{line.lineA ?? ''}</td>
      <td className="px-2 py-0.5 text-right tabular-nums opacity-70">{line.lineB ?? ''}</td>
      <td className="px-2 py-0.5 whitespace-pre">
        <span className="opacity-60 mr-1">{sign}</span>
        {line.text}
      </td>
    </tr>
  );
};
