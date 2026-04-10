import { useState } from 'react';
import { Icon } from '../../components/Icon';
import { Button, Badge, Card, Input, Select, Typing } from '../../components/atoms';
import { VecCard } from '../../components/molecules';
import type { Material, EmbeddingHook, AIHook, MaterialWithScore } from '../../types';
import { isPlainEnter } from '../../utils/keyboard';

interface VectorSearchPageProps {
  db: Material[];
  embedding: EmbeddingHook;
  claude: AIHook;
}

export const VectorSearchPage = ({ db, embedding, claude }: VectorSearchPageProps) => {
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(5);
  const [results, setResults] = useState<MaterialWithScore[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const PRESETS = ['高温強度が高い耐熱合金','軽量で高比強度の材料','耐食性に優れるステンレス系','生体適合性がある金属','低摩擦・化学的に安定なポリマー'];

  const runSearch = async (q = query) => {
    if (!q.trim()) return;
    setSearching(true);
    const res = await embedding.search(q, topK);
    setResults(res); setSearched(true); setSearching(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="ptitle text-[19px] font-bold tracking-tight flex items-center gap-2">
            ベクトル検索 <Badge variant="vec">VSS</Badge>
          </h1>
          <p className="text-[12px] text-text-lo mt-0.5">自然言語の説明で意味的に近い材料を検索します</p>
        </div>
      </div>

      <VecCard>
        各材料テキスト（名称・組成・特性）を <strong className="text-text-hi">OpenAI text-embedding-3-small</strong> で 1536次元ベクトルに変換し、
        <strong className="text-text-hi">Upstash Vector</strong> に保存。クエリとの <strong className="text-text-hi">コサイン類似度</strong> を計算してランキング表示します。
        キーワード検索では拾えない「意味的に近い材料」を発見できます。
        <div className="mt-2 text-[12px]">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${embedding.status==='ready' ? 'bg-[var(--ok-dim)] text-ok' : 'bg-raised text-text-lo'}`}>
            <Icon name="embed" size={11} />
            {embedding.status==='ready' ? `${embedding.embCount}件 検索可能（${embedding.engine}）` : '初期化中...'}
          </span>
        </div>
      </VecCard>

      <Card className="p-3">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-vec pointer-events-none"><Icon name="vecSearch" size={15} /></span>
            <Input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{ if(isPlainEnter(e))runSearch(); }}
              placeholder='例: "高温でも強度が落ちない軽量合金" / "耐食性が高いステンレス系"'
              className="pl-9 text-[14px]" />
          </div>
          <Select value={topK} onChange={e=>setTopK(parseInt(e.target.value))}>
            <option value={3}>Top 3</option><option value={5}>Top 5</option><option value={10}>Top 10</option>
          </Select>
          <Button variant="vec" onClick={() => runSearch()} disabled={searching || !query.trim()}>
            <Icon name="vecSearch" size={13} />{searching ? '検索中...' : '検索'}
          </Button>
        </div>
        <div className="flex gap-2 mt-2.5 flex-wrap">
          {PRESETS.map(p => (
            <button key={p} onClick={() => { setQuery(p); runSearch(p); }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] bg-surface text-vec border border-[var(--border-default)] hover:bg-vec-dim transition-all font-ui">
              {p}
            </button>
          ))}
        </div>
      </Card>

      {searching && <div className="text-center py-8 text-text-lo"><Typing color="var(--vec)" /><p className="mt-2 text-[13px]">ベクトル計算中...</p></div>}

      {searched && !searching && (
        <div className="flex flex-col gap-2">
          {/* Score viz */}
          {results.length > 0 && (
            <Card className="p-3">
              <div className="text-[12px] font-bold text-text-lo tracking-[.05em] uppercase mb-2">類似度スコア分布</div>
              <div className="flex items-end gap-1.5 h-10">
                {results.map((r, i) => (
                  <div key={r.id} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-text-lo">{Math.round((r.score||0)*100)}%</span>
                    <div className="w-full rounded-t-sm" style={{ height: `${Math.round((r.score||0)*100)*.28}px`, background: 'var(--vec-mid)', opacity: .4 + (results.length-i)/results.length*.6 }} />
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5 mt-1">
                {results.map(r => <div key={r.id} className="flex-1 text-[10px] text-text-lo text-center truncate">{r.id.slice(-4)}</div>)}
              </div>
              <p className="text-[11px] text-text-lo mt-1.5">クエリ: "{query}"</p>
            </Card>
          )}

          {results.map((r, i) => (
            <Card key={r.id} className="p-3 hover:border-[var(--vec-mid)] transition-colors cursor-pointer">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-[13px] font-bold text-text-lo">#{i+1}</span>
                <span className="font-mono text-[12px] text-text-lo">{r.id}</span>
                <span className="font-semibold flex-1">{r.name}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-bold bg-vec-dim text-vec border border-[var(--border-default)]">
                  <Icon name="embed" size={11} />{Math.round((r.score||0)*100)}%
                </span>
                <Badge>{r.status}</Badge>
              </div>
              <p className="text-[12px] text-text-md">{r.cat} · 硬度: {r.hv} HV · <span className="font-mono">{r.comp}</span></p>
              {r.memo && <p className="text-[11px] text-text-lo mt-1">{r.memo}</p>}
              <div className="h-0.5 rounded-full mt-2 opacity-50" style={{ width:`${Math.round((r.score||0)*100)}%`, background:'var(--vec-mid)' }} />
            </Card>
          ))}

          {results.length === 0 && <div className="text-center py-8 text-text-lo"><Icon name="search" size={28} className="mx-auto mb-2 opacity-30" /><p>該当なし</p></div>}
        </div>
      )}
    </div>
  );
};
