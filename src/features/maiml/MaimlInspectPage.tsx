// MaiML XML を整形 + 強調表示するインスペクタ。
// drop / ペーストで文字列を受け取り、indent と要素ハイライトをかけて読みやすく表示。
// 検索ボックスで substring 一致をハイライト（XPath は将来対応）。

import { useMemo, useState } from 'react';
import { MaimlPageLayout } from './components/MaimlPageLayout';
import { MaimlFileDropZone } from './components/MaimlFileDropZone';
import { MAIML_MAX_BYTES } from '@/services/maiml';

interface MaimlInspectPageProps {
  onNav: (page: string) => void;
}

/**
 * 単純な XML インデント。`<a><b>x</b></a>` のような単一要素は壊さず、
 * タグの境界で改行 + ネスト深さに応じてスペースを入れる。
 * 完全な整形ではないが、人間の目視確認には十分な軽量パターン。
 */
function prettyXml(xml: string): string {
  if (!xml.trim()) return '';
  // <?xml ?> と <!-- --> はそのまま、間に改行を挟む
  const PADDING = '  ';
  const reg = /(>)(<)(\/*)/g;
  let formatted = xml.replace(reg, '$1\n$2$3');
  // 浅いインデントロジック: 開きタグでネスト +1、閉じタグでネスト -1
  let pad = 0;
  formatted = formatted
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      let indent = pad;
      if (trimmed.startsWith('</')) {
        pad = Math.max(pad - 1, 0);
        indent = pad;
      } else if (trimmed.startsWith('<') && !trimmed.startsWith('<?') && !trimmed.startsWith('<!--')) {
        const isSelfClose = /\/>$/.test(trimmed) || /<\/.*>/.test(trimmed);
        if (!isSelfClose) {
          indent = pad;
          pad += 1;
        }
      }
      return PADDING.repeat(indent) + trimmed;
    })
    .filter((l) => l.length > 0)
    .join('\n');
  return formatted;
}

export const MaimlInspectPage = ({ onNav }: MaimlInspectPageProps) => {
  const [text, setText] = useState('');
  const [filename, setFilename] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const formatted = useMemo(() => prettyXml(text), [text]);

  const stats = useMemo(() => {
    const bytes = new Blob([text]).size;
    const lines = text.split('\n').length;
    const elementMatches = text.match(/<[a-zA-Z][^>]*>/g) ?? [];
    return { bytes, lines, elements: elementMatches.length };
  }, [text]);

  // 検索ハイライト: substring を <mark> で囲む（XML の中なので safe な escape も必要）
  const renderedLines = useMemo(() => {
    if (!formatted) return [] as { text: string; key: number }[];
    return formatted.split('\n').map((line, i) => ({ text: line, key: i }));
  }, [formatted]);

  const handleFile = (loaded: string, name: string) => {
    setError(null);
    setText(loaded);
    setFilename(name);
  };

  const handlePaste = (value: string) => {
    setError(null);
    setText(value);
    setFilename('(直接ペースト)');
  };

  return (
    <MaimlPageLayout
      title="MaiML インスペクト"
      subtitle="MaiML XML を整形して構造を素早く把握。検索ボックスで substring を強調表示します。"
      onBackToHub={() => onNav('maiml-hub')}
    >
      <div className="flex flex-col gap-4">
        {!text && (
          <>
            <MaimlFileDropZone
              onFileLoaded={handleFile}
              onError={setError}
              hint="MaiML ファイルを drop、または下のテキスト欄に直接ペースト"
            />
            <textarea
              placeholder={`<?xml version="1.0" encoding="UTF-8"?>\n<maiml version="1.0">\n  ...\n</maiml>`}
              onChange={(e) => {
                if (e.target.value.length > MAIML_MAX_BYTES) {
                  setError('入力が上限を超えています');
                  return;
                }
                if (e.target.value.trim()) handlePaste(e.target.value);
              }}
              className="w-full h-32 p-2 text-[12px] font-mono leading-[1.5] rounded border border-[var(--border-faint)] bg-[var(--bg-sunken)] resize-y"
              aria-label="MaiML 直接ペースト入力"
            />
          </>
        )}

        {error && (
          <div className="rounded-lg border border-[var(--err,#dc2626)] bg-[rgba(220,38,38,0.08)] p-3 text-[13px]">
            <div className="font-semibold text-[var(--err,#dc2626)]">エラー</div>
            <div>{error}</div>
          </div>
        )}

        {text && (
          <div className="flex flex-col gap-3">
            <header className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 text-[12px]">
                <span className="font-mono">{filename}</span>
                <span className="text-[var(--text-lo)]">
                  {(stats.bytes / 1024).toFixed(1)} KB / {stats.lines.toLocaleString()} 行 / {stats.elements} 要素
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="部分一致で検索"
                  className="px-2 py-1 text-[12px] rounded border border-[var(--border-faint)] bg-transparent"
                  aria-label="MaiML 内のテキスト検索"
                />
                <button
                  type="button"
                  onClick={() => {
                    setText('');
                    setFilename('');
                    setSearch('');
                  }}
                  className="text-[11px] underline text-[var(--text-lo)]"
                >
                  クリア
                </button>
              </div>
            </header>

            <pre
              className="overflow-auto max-h-[60vh] p-3 text-[11px] font-mono leading-[1.5] rounded border border-[var(--border-faint)] whitespace-pre"
              style={{ background: 'var(--bg-sunken)', color: 'var(--text-md)' }}
              aria-label="MaiML XML プレビュー"
            >
              {renderedLines.map(({ text: line, key }) => (
                <div key={key}>
                  {search && line.toLowerCase().includes(search.toLowerCase())
                    ? highlight(line, search)
                    : line}
                </div>
              ))}
            </pre>
          </div>
        )}
      </div>
    </MaimlPageLayout>
  );
};

/** 部分一致を <mark> で囲む（HTML エンティティは扱わない、純文字列ベース） */
function highlight(line: string, query: string): React.ReactNode {
  const lower = line.toLowerCase();
  const q = query.toLowerCase();
  const out: React.ReactNode[] = [];
  let i = 0;
  while (i < line.length) {
    const idx = lower.indexOf(q, i);
    if (idx < 0) {
      out.push(line.slice(i));
      break;
    }
    if (idx > i) out.push(line.slice(i, idx));
    out.push(
      <mark
        key={idx}
        style={{ background: 'rgba(245,158,11,0.45)', color: 'inherit' }}
      >
        {line.slice(idx, idx + query.length)}
      </mark>,
    );
    i = idx + query.length;
  }
  return out;
}
