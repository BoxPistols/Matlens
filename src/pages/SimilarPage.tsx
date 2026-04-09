import { useState } from 'react';
import { marked } from 'marked';
import { Icon } from '../components/Icon';
import { Button, Badge, Card, Input, Select, FormGroup, UnitInput, Typing } from '../components/atoms';
import { AIInsightCard, VecCard } from '../components/molecules';
import type { Material, EmbeddingHook, AIHook, MaterialWithScore } from '../types';

interface SimilarPageProps {
  db: Material[];
  embedding: EmbeddingHook;
  claude: AIHook;
}

export const SimilarPage = ({ db, embedding, claude }: SimilarPageProps) => {
  const [base, setBase] = useState('MAT-0237 — SUS316L 低炭素ステンレス');
  const [weight, setWeight] = useState('総合スコア');
  const [k, setK] = useState(10);
  const [threshold, setThreshold] = useState(60);
  const [results, setResults] = useState<MaterialWithScore[]>([]);
  const [aiComment, setAiComment] = useState('');
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);

  const run = async () => {
    setRunning(true);
    const baseId = (base.match(/MAT-\d+/)||[])[0];
    const baseRec = db.find(r=>r.id===baseId);
    const q = baseRec ? `${baseRec.name} ${baseRec.comp}` : base;
    const res = await embedding.search(q, k);
    const filtered = res.filter(r => r.id !== baseId && (r.score||0) >= threshold/100);
    setResults(filtered);
    setRan(true);
    const t = await claude.call(`「${base}」に類似する材料として ${filtered.slice(0,3).map(r=>r.name).join('、')} が候補です。2〜3文で選定ポイントと用途別の使い分けをアドバイスしてください。`);
    setAiComment(t);
    setRunning(false);
  };

  const renderAiHtml = () => {
    try {
      marked.setOptions({ breaks: true, gfm: true });
      return marked.parse(aiComment);
    } catch(e) { return aiComment; }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="ptitle text-[19px] font-bold tracking-tight">類似材料探索</h1>
          <p className="text-[12px] text-text-lo mt-0.5">Embedding コサイン類似度で類似材料を発見します</p>
        </div>
      </div>
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <FormGroup label="基準材料（ID または名称）">
            <Input value={base} onChange={e=>setBase(e.target.value)} placeholder="例: MAT-0231 または SUS316L" />
          </FormGroup>
          <FormGroup label="重み付け">
            <Select value={weight} onChange={e=>setWeight(e.target.value)} className="w-full">
              {['総合スコア（推奨）','組成を優先','硬度を優先'].map(o=><option key={o}>{o}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="最大表示件数">
            <Select value={k} onChange={e=>setK(parseInt(e.target.value))} className="w-full">
              <option value={5}>5件</option><option value={10}>10件</option><option value={20}>20件</option>
            </Select>
          </FormGroup>
          <FormGroup label="類似度しきい値">
            <UnitInput unit="% 以上" inputProps={{ value: threshold, onChange: e=>setThreshold(parseInt(e.target.value)||0), type:'number',min:0,max:100 }} />
          </FormGroup>
        </div>
        <div className="flex gap-2">
          <Button variant="vec" onClick={run} disabled={running}><Icon name="vecSearch" size={13} />{running?'探索中...':'探索実行'}</Button>
          <Button variant="default" size="sm" onClick={() => { setResults([]); setRan(false); setAiComment(''); }}>クリア</Button>
        </div>
      </Card>

      {ran && (
        <div className="flex flex-col gap-3">
          {aiComment && (
            <AIInsightCard chips={[]}>
              <div className="md-preview" dangerouslySetInnerHTML={{ __html: renderAiHtml() }} />
            </AIInsightCard>
          )}
          {!aiComment && <div className="text-center py-4 text-text-lo"><Typing color="var(--ai-col)" /></div>}
          {results.map((r,i) => (
            <Card key={r.id} className="p-3 hover:border-[var(--vec-mid)] transition-colors">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-[13px] font-bold text-text-lo">#{i+1}</span>
                <span className="font-mono text-[12px] text-text-lo">{r.id}</span>
                <span className="font-semibold flex-1">{r.name}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-bold bg-vec-dim text-vec border border-[var(--border-default)]">
                  <Icon name="embed" size={11} />{Math.round((r.score||0)*100)}%
                </span>
              </div>
              <p className="text-[12px] text-text-md">{r.cat} · 硬度: {r.hv} HV · {r.comp}</p>
              <div className="h-0.5 rounded-full mt-2 opacity-50" style={{ width:`${Math.round((r.score||0)*100)}%`, background:'var(--vec-mid)' }} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
