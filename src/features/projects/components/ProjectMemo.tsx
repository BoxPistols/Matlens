// 案件メモ — Markdown 編集 / プレビュー切替フィールド。
// PoC 段階のため永続化は localStorage（key: project-memo-<projectId>）。
// 将来的には Repository 経由で persist する想定で、Repository が
// 整備された段階で localStorage アクセス箇所を差し替える。
// 履歴管理は Issue #82 の将来要件として未実装。

import { useEffect, useState } from 'react';
import type { ID } from '@/domain/types';
import { renderMarkdown } from '@/shared/markdown/renderMarkdown';

interface ProjectMemoProps {
  projectId: ID;
}

const storageKey = (id: ID) => `project-memo-${id}`;

const PLACEHOLDER = `案件に関するメモ（Markdown 対応）

## 例
- 顧客から特殊指示があった場合の備忘
- 試験計画の変更履歴
- ステークホルダ間の合意事項

| 項目 | 値 |
| --- | --- |
| **重要連絡事項** | 例：4 月末までに最終納品 |
`;

const formatTimestamp = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

export const ProjectMemo = ({ projectId }: ProjectMemoProps) => {
  const [text, setText] = useState('');
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(storageKey(projectId));
      if (raw) {
        const parsed = JSON.parse(raw) as { text?: string; updatedAt?: string };
        setText(parsed.text ?? '');
        setUpdatedAt(parsed.updatedAt ?? null);
      } else {
        setText('');
        setUpdatedAt(null);
      }
      setEditing(false);
    } catch {
      // localStorage が壊れていた場合は空メモから始めて UI を維持する
      setText('');
      setUpdatedAt(null);
    }
  }, [projectId]);

  const startEdit = () => {
    setDraft(text);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft('');
  };

  const save = () => {
    const now = new Date().toISOString();
    setText(draft);
    setUpdatedAt(now);
    setEditing(false);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(
          storageKey(projectId),
          JSON.stringify({ text: draft, updatedAt: now })
        );
      } catch {
        // 容量超過等で保存失敗しても UI は破壊しない
      }
    }
  };

  return (
    <section aria-label="案件メモ">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-[14px]">案件メモ</h2>
        <div className="flex items-center gap-2">
          {updatedAt && !editing && (
            <span className="text-[11px] text-[var(--text-lo)]">
              最終更新: {formatTimestamp(updatedAt)}
            </span>
          )}
          {!editing ? (
            <button
              type="button"
              onClick={startEdit}
              className="text-[12px] px-3 py-1 rounded border border-[var(--border-default)] hover:bg-[var(--hover)]"
            >
              {text ? '編集' : 'メモを書く'}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={cancelEdit}
                className="text-[12px] px-3 py-1 rounded border border-[var(--border-default)] hover:bg-[var(--hover)]"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={save}
                className="text-[12px] px-3 py-1 rounded bg-[var(--accent,#2563eb)] text-white hover:opacity-90"
              >
                保存
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border-faint)] bg-[var(--bg-raised)] p-3 min-h-[120px]">
        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] text-[var(--text-lo)] mb-1">編集（Markdown）</div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={PLACEHOLDER}
                className="w-full h-[260px] p-2 text-[12px] font-mono leading-[1.5] rounded border border-[var(--border-faint)] bg-[var(--bg-sunken)] resize-y"
                aria-label="案件メモ編集領域"
              />
            </div>
            <div>
              <div className="text-[11px] text-[var(--text-lo)] mb-1">プレビュー</div>
              <div className="h-[260px] overflow-auto p-2 text-[13px] rounded border border-[var(--border-faint)] bg-[var(--bg-sunken)]">
                {draft.trim() ? (
                  renderMarkdown(draft)
                ) : (
                  <div className="text-[12px] text-[var(--text-lo)]">（プレビューはここに表示されます）</div>
                )}
              </div>
            </div>
          </div>
        ) : text.trim() ? (
          renderMarkdown(text)
        ) : (
          <div className="text-[13px] text-[var(--text-lo)]">
            まだメモはありません。「メモを書く」から Markdown 形式で記録できます。
          </div>
        )}
      </div>
      <p className="mt-1 text-[10px] text-[var(--text-lo)]">
        現在は端末のローカルストレージに保存されます。Phase 4 以降で Repository 経由の永続化と履歴管理に置き換える予定です。
      </p>
    </section>
  );
};
