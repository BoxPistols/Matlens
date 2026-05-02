// 軽量 Markdown レンダラ（依存追加なし）。
// 対応書式: 見出し (# / ## / ###) / 表 / リスト (- *) / 段落 / 太字 / 行内コード。
// 高度な書式（リンク・画像・コードブロック等）は将来 marked 等に置換予定。

import type { ReactElement, ReactNode } from 'react';

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

export const renderMarkdown = (src: string): ReactElement => {
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
      const tableLines: string[] = [];
      while (i < lines.length && (lines[i] ?? '').trim().startsWith('|')) {
        tableLines.push(lines[i] ?? '');
        i++;
      }
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
