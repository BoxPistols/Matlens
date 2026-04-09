import React, { useState, useRef } from 'react';
import { Icon } from '../components/Icon';
import { Button, Badge, Card, Input, Typing } from '../components/atoms';
import { MarkdownBubble, VecCard } from '../components/molecules';

export const RAGChatPage = ({ db, embedding, claude }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Matlens の材料データベースについてなんでも聞いてください。ベクトル検索で関連データを取得し、根拠のある回答を提供します。' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [ctxSources, setCtxSources] = useState([]);
  const msgsRef = useRef(null);

  const PRESETS = ['硬度が300HV以上の金属合金を教えて','SUS316L に近い物性の材料は何がある？','航空宇宙用途に適した軽量材料を提案して','レビュー待ちデータの懸念点を分析して','耐食性と強度を両立する材料を教えて'];

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

    const reply = await claude.call(q, sys);
    setMessages(prev => [...prev, { role: 'ai', text: reply, sources: topDocs }]);
    setSending(false);
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (msgsRef.current) {
          msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
        }
      }, 50);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="ptitle text-[19px] font-bold tracking-tight flex items-center gap-2">
            RAG チャット <Badge variant="ai">RAG</Badge>
          </h1>
          <p className="text-[12px] text-text-lo mt-0.5">材料DBをコンテキストにしたAI質問応答</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[12px] text-text-lo px-1">
        {['クエリ','Embedding','類似度検索','コンテキスト注入','AI回答'].map((s,i,arr)=>(
          <React.Fragment key={i}>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${i===arr.length-1?'bg-ai-dim text-ai':'bg-vec-dim text-vec'}`}>{s}</span>
            {i<arr.length-1&&<Icon name="chevronRight" size={10} className="text-text-lo flex-shrink-0"/>}
          </React.Fragment>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap items-center">
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

      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 240px', alignItems: 'start' }}>
        <Card className="overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 360px)', minHeight: '380px' }}>
          <div ref={msgsRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2.5 items-start ${m.role==='user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${m.role==='ai' ? 'bg-ai-dim text-ai' : 'bg-accent-dim text-accent'}`}>
                  {m.role==='ai' ? <Icon name="ai" size={13} /> : 'KK'}
                </div>
                <div className={`max-w-[78%] flex flex-col gap-1.5 ${m.role==='user' ? 'items-end' : ''}`}>
                  <div className={`px-3 py-2 rounded-lg text-[13px] leading-relaxed ${m.role==='ai' ? 'bg-raised border border-[var(--border-faint)]' : 'bg-accent text-white'}`}>
                    {m.role === 'ai' ? <MarkdownBubble text={m.text} /> : m.text}
                  </div>
                  {m.sources && m.sources.length > 0 && (
                    <div className="px-3 py-2 bg-vec-dim border border-[var(--border-default)] rounded-md text-[12px] w-full">
                      <div className="text-[10px] font-bold text-vec tracking-[.05em] uppercase mb-1 flex items-center gap-1"><Icon name="embed" size={11} />参照した材料データ</div>
                      {m.sources.map(s => <div key={s.id} className="text-text-md font-mono">▸ {s.id}: {s.name}</div>)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex gap-2.5 items-start">
                <div className="w-7 h-7 rounded-full bg-ai-dim text-ai flex items-center justify-center"><Icon name="ai" size={13} /></div>
                <div className="px-3 py-2.5 bg-raised border border-[var(--border-faint)] rounded-lg"><Typing /></div>
              </div>
            )}
          </div>
          <div className="px-3 py-2.5 border-t border-[var(--border-faint)] flex gap-2 items-end">
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();} }}
              placeholder="質問を入力... (Enter 送信、Shift+Enter 改行)"
              rows={2} className="flex-1 px-3 py-2 border border-[var(--border-default)] rounded-md bg-raised text-text-hi text-[13px] font-ui resize-none leading-snug max-h-24 outline-none focus:border-[var(--ai-mid)] focus:ring-2 focus:ring-[var(--ai-glow)]" />
            <Button variant="ai" onClick={() => send()} disabled={sending || !input.trim()}>
              送信 <Icon name="chevronRight" size={12} />
            </Button>
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <Card className="p-3">
            <div className="text-[12px] font-bold text-text-lo uppercase tracking-[.04em] mb-2">よく使われる質問</div>
            {PRESETS.slice(0,4).map(p => (
              <button key={p} onClick={() => send(p)}
                className="w-full text-left px-2.5 py-1.5 rounded-md text-[12px] text-text-md hover:bg-hover hover:text-text-hi transition-colors font-ui mb-0.5">
                {p}
              </button>
            ))}
          </Card>
          <VecCard>
            <div className="text-[12px] font-bold text-vec uppercase tracking-[.04em] mb-2">最後のRAG取得</div>
            {ctxSources.length === 0 ? <p>—</p> : ctxSources.map(s=>(
              <div key={s.id} className="text-[12px] text-text-md font-mono py-0.5 border-b border-[var(--border-faint)] last:border-b-0">
                ▸ {s.id}: {s.name}
              </div>
            ))}
          </VecCard>
        </div>
      </div>
    </div>
  );
};
