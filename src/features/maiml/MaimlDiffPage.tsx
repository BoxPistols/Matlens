// MaiML Diff 画面（Phase 2 ではスタブ）。
// 将来的には diff-match-patch ベースの構造比較 + 行ハイライトを実装。
// Phase 2 は 2 ファイル受け取り → 行単位の単純比較を表示する暫定版。

import { useState } from 'react';
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

  return (
    <MaimlPageLayout
      title="MaiML Diff"
      subtitle="Phase 2 暫定版: 2 ファイルの行数 / 要素数の差分を表示します。Phase 9 で diff-match-patch ベースの構造比較を実装予定。"
      onBackToHub={() => onNav('maiml-hub')}
    >
      <div className="flex flex-col gap-4">
        <div className="rounded border border-[var(--border-faint)] bg-[rgba(217,119,6,0.06)] p-3 text-[12px]">
          <span className="font-semibold text-[var(--warn,#d97706)]">WIP:</span>
          {' '}本格的な diff（行単位ハイライト + 構造比較）は Phase 9 で実装予定。
          現状は両ファイルの簡易メタ比較のみです。
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <DiffSlot label="ファイル A" slot={a} onLoad={setA} />
          <DiffSlot label="ファイル B" slot={b} onLoad={setB} />
        </div>

        {a && b && (
          <section
            aria-label="比較結果"
            className="rounded-lg border border-[var(--border-faint)] bg-[var(--bg-raised)] p-4 text-[12px]"
          >
            <h2 className="text-[13px] font-semibold mb-3">差分サマリ</h2>
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-[var(--border-faint)]">
                  <th className="px-2 py-1 font-semibold">項目</th>
                  <th className="px-2 py-1 font-semibold text-right">A</th>
                  <th className="px-2 py-1 font-semibold text-right">B</th>
                  <th className="px-2 py-1 font-semibold text-right">差</th>
                </tr>
              </thead>
              <tbody>
                <DiffRow label="バイト" a={byteSize(a.text)} b={byteSize(b.text)} />
                <DiffRow label="行数" a={lineCount(a.text)} b={lineCount(b.text)} />
                <DiffRow label="要素タグ" a={elementCount(a.text)} b={elementCount(b.text)} />
                <DiffRow label="property タグ" a={countMatches(a.text, /<property\s/g)} b={countMatches(b.text, /<property\s/g)} />
                <DiffRow label="result タグ" a={countMatches(a.text, /<result\s/g)} b={countMatches(b.text, /<result\s/g)} />
              </tbody>
            </table>
          </section>
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
          {(byteSize(slot.text) / 1024).toFixed(1)} KB / {lineCount(slot.text)} 行
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

const DiffRow = ({ label, a, b }: { label: string; a: number; b: number }) => {
  const delta = b - a;
  return (
    <tr className="border-b border-[var(--border-faint)]">
      <td className="px-2 py-1">{label}</td>
      <td className="px-2 py-1 font-mono text-right">{a.toLocaleString()}</td>
      <td className="px-2 py-1 font-mono text-right">{b.toLocaleString()}</td>
      <td
        className="px-2 py-1 font-mono text-right"
        style={{
          color: delta > 0 ? 'var(--ok,#22c55e)' : delta < 0 ? 'var(--err,#dc2626)' : 'var(--text-lo)',
        }}
      >
        {delta > 0 ? `+${delta}` : delta}
      </td>
    </tr>
  );
};

const byteSize = (s: string) => new Blob([s]).size;
const lineCount = (s: string) => (s ? s.split('\n').length : 0);
const elementCount = (s: string) => countMatches(s, /<[a-zA-Z][^>]*>/g);
const countMatches = (s: string, re: RegExp) => (s.match(re) ?? []).length;
