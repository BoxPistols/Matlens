// 検索（統合）ハブ。
// 4 種類の検索画面（意味検索 / AI チャット / 類似材料 / 横断検索）を
// 1 ページのタブ UI に統合する。各タブパネルは既存ページコンポーネントを
// そのまま埋め込む（コードの重複を避ける）。
//
// 旧ルート (/vsearch / /rag / /sim / /semsearch) は App.tsx に残してあり、
// 直接 URL アクセスは引き続き可能。サイドバーからは本ハブ経由で到達する。

import { Suspense, useState } from 'react';
import type { Material } from '@/types';
import type { DbAction } from '@/types';
import { VectorSearchPage } from '@/pages/VectorSearch';
import { RAGChatPage } from '@/pages/RAGChat';
import { SimilarPage } from '@/pages/Similar';
import { SemanticSearchPage } from '@/features/search';

type SearchTab = 'semantic' | 'chat' | 'similar' | 'cross';

const TABS: { id: SearchTab; label: string; labelEn: string }[] = [
  { id: 'semantic', label: '意味検索', labelEn: 'Semantic' },
  { id: 'chat',     label: 'AI チャット', labelEn: 'AI Chat' },
  { id: 'similar',  label: '類似材料',   labelEn: 'Similar' },
  { id: 'cross',    label: '横断検索 (PoC)', labelEn: 'Cross-domain' },
];

const STORAGE_KEY = 'matlens_search_tab';

interface SearchHubPageProps {
  // VectorSearch / RAG / Similar が共通で必要とする props（App の commonProps 相当）
  // を素直に受け取り、子に流すだけのハブ。
  db: Material[];
  dispatch: React.Dispatch<DbAction>;
  onNav: (page: string) => void;
  // useAI / useEmbedding / useVoice の戻り値（型は App.tsx と合わせる）
  claude: unknown;
  embedding: unknown;
  voice: unknown;

  // 初期タブ（直リンクや navTo の prefix で指定したい場合）
  initialTab?: SearchTab;

  // RAG / Similar 専用のディープリンクパラメータ
  ragInitialQuery?: string;
  clearRagInitialQuery?: () => void;
  simInitialBase?: string;
  clearSimInitialBase?: () => void;
}

const loadInitialTab = (): SearchTab => {
  if (typeof window === 'undefined') return 'semantic';
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && TABS.some((t) => t.id === raw)) return raw as SearchTab;
  } catch {
    // ignore
  }
  return 'semantic';
};

export const SearchHubPage = ({
  db,
  dispatch,
  onNav,
  claude,
  embedding,
  voice,
  initialTab,
  ragInitialQuery = '',
  clearRagInitialQuery = () => undefined,
  simInitialBase = '',
  clearSimInitialBase = () => undefined,
}: SearchHubPageProps) => {
  const [tab, setTab] = useState<SearchTab>(initialTab ?? loadInitialTab());

  const switchTab = (next: SearchTab) => {
    setTab(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  // 子ページに渡す props は既存と同じ commonProps shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const commonProps: any = { db, dispatch, onNav, claude, embedding, voice };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="px-6 py-3 border-b border-[var(--border-faint)]">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold">検索（統合）</h1>
          <span className="text-[11px] text-[var(--text-lo)]">
            意味検索 / AI チャット / 類似材料 / 横断検索 を 1 画面にまとめました
          </span>
        </div>
        <div className="mt-2 flex gap-1.5" role="tablist" aria-label="検索モード">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => switchTab(t.id)}
                className={`px-3 py-1 text-[12px] rounded transition-colors ${
                  active
                    ? 'bg-[var(--accent,#2563eb)] text-white font-semibold'
                    : 'border border-[var(--border-faint)] text-[var(--text-md)] hover:bg-[var(--hover)]'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </header>
      <div className="flex-1 overflow-auto">
        <Suspense fallback={<div className="p-6 text-[var(--text-lo)]">読み込み中…</div>}>
          {tab === 'semantic' && <VectorSearchPage {...commonProps} />}
          {tab === 'chat' && (
            <RAGChatPage
              {...commonProps}
              initialQuery={ragInitialQuery}
              clearInitialQuery={clearRagInitialQuery}
            />
          )}
          {tab === 'similar' && (
            <SimilarPage
              {...commonProps}
              initialBase={simInitialBase}
              clearInitialBase={clearSimInitialBase}
            />
          )}
          {tab === 'cross' && <SemanticSearchPage />}
        </Suspense>
      </div>
    </div>
  );
};
