import React, { useState, useRef, useEffect, useContext } from 'react';
import { Icon } from '../../components/Icon';
import { Button, Badge, Card, Input, Typing } from '../../components/atoms';
import { MarkdownBubble, VecCard } from '../../components/molecules';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import type { Material, EmbeddingHook, AIHook, MaterialWithScore, AppContextValue } from '../../types';
import { isSubmitShortcut, submitShortcutLabel } from '../../utils/keyboard';
import { AppCtx } from '../../context/AppContext';

interface RAGChatPageProps {
  db: Material[];
  embedding: EmbeddingHook;
  claude: AIHook;
  initialQuery?: string;
  clearInitialQuery?: () => void;
}

export const RAGChatPage = ({ db, embedding, claude, initialQuery, clearInitialQuery }: RAGChatPageProps) => {
  const { t, addToast } = useContext(AppCtx) as AppContextValue;

  useEffect(() => {
    if (claude.lastError) {
      addToast(`AI: ${claude.lastError.message}`, 'warn');
    }
  }, [claude.lastError]);

  const [messages, setMessages] = useState<{ role: string; text: string; sources?: MaterialWithScore[] }[]>([
    { role: 'ai', text: 'Matlens の材料データベースについてなんでも聞いてください。ベクトル検索で関連データを取得し、根拠のある回答を提供します。' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [ctxSources, setCtxSources] = useState<MaterialWithScore[]>([]);
  const msgsRef = useRef<HTMLDivElement>(null);

  const PRESETS = ['硬度が300HV以上の金属合金を教えて','SUS316L に近い物性の材料は何がある？','航空宇宙用途に適した軽量材料を提案して','レビュー待ちデータの懸念点を分析して','耐食性と強度を両立する材料を教えて'];

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (msgsRef.current) {
          msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
        }
      }, 50);
    });
  };

  const send = async (q = input.trim()) => {
    if (!q || sending) return;
    setInput('');
    setSending(true);
    setMessages(prev => [...prev, { role: 'user', text: q }]);

    const topDocs = await embedding.search(q, 4);
    setCtxSources(topDocs);
    const ctxText = topDocs.map(r => `[${r.id}] ${r.name}（${r.cat}）: 組成=${r.comp}, 硬度=${r.hv}HV, 引張=${r.ts}MPa${r.memo?', 備考='+r.memo:''}`).join('\n');
    const sys = `あなたは材料科学の専門家AIアシスタントです。材料DB「Matlens」に組み込まれています。
以下の関連材料データ（RAG取得）を根拠として、Markdown形式で正確・実用的な日本語で回答してください。根拠となった材料IDを明記してください。

【関連材料データ】
${ctxText}`;

    // Push an empty assistant message and progressively fill it as chunks arrive.
    let replyIndex = -1;
    setMessages(prev => {
      replyIndex = prev.length;
      return [...prev, { role: 'ai', text: '', sources: topDocs }];
    });

    await claude.callStream(q, {
      onChunk: (delta) => {
        setMessages(prev => {
          if (replyIndex < 0 || replyIndex >= prev.length) return prev;
          const next = prev.slice();
          const current = next[replyIndex];
          if (!current) return prev;
          next[replyIndex] = { ...current, text: current.text + delta };
          return next;
        });
        scrollToBottom();
      },
    }, sys);

    setSending(false);
    scrollToBottom();
  };

  // Auto-send initial query from detail page context
  useEffect(() => {
    if (initialQuery && !sending) {
      send(initialQuery);
      clearInitialQuery?.();
    }
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">
      <div className="flex items-start gap-3 flex-shrink-0">
        <div className="flex-1">
          <h1 className="ptitle text-[19px] font-bold tracking-tight flex items-center gap-2">
            {t('AI チャット', 'AI Chat')} <Badge variant="ai">AI</Badge>
          </h1>
          <p className="text-[12px] text-text-lo mt-0.5">{t('登録済みの材料データを元に、AIが質問に回答します', 'AI answers questions based on registered material data')}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[12px] text-text-lo px-1 flex-shrink-0">
        {['クエリ','Embedding','類似度検索','コンテキスト注入','AI回答'].map((s,i,arr)=>(
          <React.Fragment key={i}>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${i===arr.length-1?'bg-ai-dim text-ai':'bg-vec-dim text-vec'}`}>{s}</span>
            {i<arr.length-1&&<Icon name="chevronRight" size={10} className="text-text-lo flex-shrink-0"/>}
          </React.Fragment>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap items-center flex-shrink-0">
        {PRESETS.slice(0,3).map(p => (
          <button key={p} onClick={() => send(p)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] bg-ai-dim text-ai border border-[var(--border-default)] hover:bg-ai hover:text-white transition-all font-ui">
            {p}
          </button>
        ))}
        <button onClick={() => send(PRESETS[3])}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[12px] bg-raised text-text-lo border border-[var(--border-default)] hover:bg-hover transition-all font-ui">
          <Icon name="chevronDown" size={11}/>他の質問
        </button>
      </div>

      <div className="grid gap-4 flex-1 min-h-0" style={{ gridTemplateColumns: '1fr 240px' }}>
        <Card className="overflow-hidden flex flex-col min-h-0">
          <div
            ref={msgsRef}
            role="log"
            aria-live="polite"
            aria-atomic="false"
            aria-label="会話履歴"
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                role="article"
                aria-label={m.role === 'ai' ? 'AI の発言' : 'あなたの発言'}
                className={`flex gap-2.5 items-start ${m.role==='user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${m.role==='ai' ? 'bg-ai-dim text-ai' : 'bg-accent-dim text-accent'}`} aria-hidden="true">
                  {m.role==='ai' ? <Icon name="ai" size={13} /> : 'KK'}
                </div>
                <div className={`max-w-[78%] flex flex-col gap-1.5 ${m.role==='user' ? 'items-end' : ''}`}>
                  <div className={`px-3 py-2 rounded-lg text-[13px] leading-relaxed ${m.role==='ai' ? 'bg-raised border border-[var(--border-faint)]' : 'bg-accent text-white'}`}>
                    {m.role === 'ai' ? (
                      <ErrorBoundary>
                        <MarkdownBubble text={m.text} />
                      </ErrorBoundary>
                    ) : m.text}
                  </div>
                  {m.sources && m.sources.length > 0 && (
                    <details className="w-full">
                      <summary className="text-[10px] font-bold text-vec tracking-[.05em] uppercase cursor-pointer flex items-center gap-1 hover:opacity-80 select-none py-0.5">
                        <Icon name="embed" size={11} />参照データ（{m.sources.length}件）
                      </summary>
                      <div className="px-3 py-1.5 bg-vec-dim border border-[var(--border-default)] rounded-md text-[12px] mt-1">
                        {m.sources.map(s => <div key={s.id} className="text-text-md font-mono py-0.5">▸ {s.id}: {s.name}</div>)}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-2.5 items-start" role="status" aria-live="polite" aria-busy="true">
                <span className="sr-only">AIが回答を生成中です</span>
                <div className="w-7 h-7 rounded-full bg-ai-dim text-ai flex items-center justify-center" aria-hidden="true"><Icon name="ai" size={13} /></div>
                <div className="px-3 py-2.5 bg-raised border border-[var(--border-faint)] rounded-lg" aria-hidden="true"><Typing /></div>
              </div>
            )}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="px-3 py-2.5 border-t border-[var(--border-faint)] flex gap-2 items-end"
            aria-label="AI への質問フォーム"
          >
            <label htmlFor="rag-chat-input" className="sr-only">質問を入力</label>
            <textarea
              id="rag-chat-input"
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(isSubmitShortcut(e)){e.preventDefault();send();} }}
              placeholder={`質問を入力... (${submitShortcutLabel()} 送信、Enter 改行)`}
              aria-describedby="rag-chat-input-hint"
              rows={2}
              className="flex-1 px-3 py-2 border border-[var(--border-default)] rounded-md bg-raised text-text-hi text-[13px] font-ui resize-none leading-snug max-h-24 outline-none focus:border-[var(--ai-mid)] focus:ring-2 focus:ring-[var(--ai-glow)]"
            />
            <span id="rag-chat-input-hint" className="sr-only">
              {submitShortcutLabel()} で送信、Enter で改行
            </span>
            <Button
              type="submit"
              variant="ai"
              disabled={sending || !input.trim()}
              aria-label={sending ? '送信中' : '質問を送信'}
            >
              {t('送信', 'Send')} <Icon name="chevronRight" size={12} />
            </Button>
          </form>
        </Card>

        <div className="flex flex-col gap-3">
          <Card className="p-3">
            <div className="text-[12px] font-bold text-text-lo uppercase tracking-[.04em] mb-2">{t('よく使われる質問', 'Common Questions')}</div>
            {PRESETS.slice(0,4).map(p => (
              <button key={p} onClick={() => send(p)}
                className="w-full text-left px-2.5 py-1.5 rounded-md text-[12px] text-text-md hover:bg-hover hover:text-text-hi transition-colors font-ui mb-0.5">
                {p}
              </button>
            ))}
          </Card>
          <VecCard>
            <div className="text-[12px] font-bold text-vec uppercase tracking-[.04em] mb-2">{t('最後のRAG取得', 'Last RAG Retrieval')}</div>
            {ctxSources.length === 0 ? <p className="text-[12px] text-text-lo">{t('質問を送信すると、関連する材料データが表示されます。', 'Send a question to see related material data.')}</p> : ctxSources.map(s=>(
              <div key={s.id} className="flex items-center gap-2 text-[12px] text-text-md font-mono py-1 border-b border-[var(--border-faint)] last:border-b-0">
                <span className="flex-1 truncate">▸ {s.id}: {s.name}</span>
                <span className="text-[10px] text-vec flex-shrink-0">{(s.score * 100).toFixed(0)}%</span>
              </div>
            ))}
          </VecCard>
        </div>
      </div>
    </div>
  );
};
