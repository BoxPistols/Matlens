import { useState, useEffect, useRef, useContext } from 'react';
import { renderSafeMarkdown } from '../../services/safeMarkdown';
import { Icon } from '../../components/Icon';
import { Button, Badge, Card, Input, Select, FormGroup, UnitInput, Typing } from '../../components/atoms';
import { AIInsightCard, VecCard } from '../../components/molecules';
import type { Material, EmbeddingHook, AIHook, MaterialWithScore, AppContextValue } from '../../types';
import { AppCtx } from '../../context/AppContext';

interface SimilarPageProps {
  db: Material[];
  embedding: EmbeddingHook;
  claude: AIHook;
  initialBase?: string;
  clearInitialBase?: () => void;
}

// Build a "MAT-xxxx — name" label from an id or free-form text
function resolveBase(input: string, db: Material[]): string {
  if (!input) return '';
  const idMatch = input.match(/(?:MAT|MT)-\d+/);
  if (idMatch) {
    const rec = db.find(r => r.id === idMatch[0]);
    if (rec) return `${rec.id} — ${rec.name}`;
  }
  return input;
}

export const SimilarPage = ({ db, embedding, claude, initialBase, clearInitialBase }: SimilarPageProps) => {
  const { t, addToast } = useContext(AppCtx) as AppContextValue;

  useEffect(() => {
    if (claude.lastError) {
      addToast(`AI: ${claude.lastError.message}`, 'warn');
    }
  }, [claude.lastError]);

  const [base, setBase] = useState(() => resolveBase(initialBase || '', db));
  const autoRan = useRef(false);
  const [weight, setWeight] = useState('総合スコア');
  const [k, setK] = useState(10);
  const [threshold, setThreshold] = useState(40);
  const [results, setResults] = useState<MaterialWithScore[]>([]);
  const [aiComment, setAiComment] = useState('');
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);

  const runWith = async (baseLabel: string) => {
    setRunning(true);
    const baseId = (baseLabel.match(/(?:MAT|MT)-\d+/)||[])[0];
    const baseRec = db.find(r=>r.id===baseId);
    const q = baseRec ? `${baseRec.name} ${baseRec.comp}` : baseLabel;
    const res = await embedding.search(q, k);
    const filtered = res.filter(r => r.id !== baseId && (r.score||0) >= threshold/100);
    setResults(filtered);
    setRan(true);
    const t = await claude.call(`「${baseLabel}」に類似する材料として ${filtered.slice(0,3).map(r=>r.name).join('、')} が候補です。2〜3文で選定ポイントと用途別の使い分けをアドバイスしてください。`);
    setAiComment(t);
    setRunning(false);
  };

  const run = () => runWith(base);

  // Auto-run when arriving with an initialBase from another page (e.g. detail → similar)
  useEffect(() => {
    if (!initialBase || autoRan.current) return;
    autoRan.current = true;
    const resolved = resolveBase(initialBase, db);
    setBase(resolved);
    runWith(resolved);
    clearInitialBase?.();
  }, [initialBase]);

  const renderAiHtml = () => renderSafeMarkdown(aiComment);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="ptitle text-[19px] font-bold tracking-tight">{t('類似材料探索', 'Similar Materials')}</h1>
          <p className="text-[12px] text-text-lo mt-0.5">{t('Embedding コサイン類似度で類似材料を発見します', 'Discover similar materials via embedding cosine similarity')}</p>
        </div>
      </div>
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <FormGroup label={t('基準材料（ID または名称）', 'Reference Material (ID or Name)')}>
            <Input value={base} onChange={e=>setBase(e.target.value)} placeholder="例: MT-0001, MAT-0308, SUS316L" />
          </FormGroup>
          <FormGroup label={t('重み付け', 'Weighting')}>
            <Select value={weight} onChange={e=>setWeight(e.target.value)} className="w-full">
              {['総合スコア（推奨）','組成を優先','硬度を優先'].map(o=><option key={o}>{o}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label={t('最大表示件数', 'Max Results')}>
            <Select value={k} onChange={e=>setK(parseInt(e.target.value))} className="w-full">
              <option value={5}>5件</option><option value={10}>10件</option><option value={20}>20件</option>
            </Select>
          </FormGroup>
          <FormGroup label={t('類似度しきい値', 'Similarity Threshold')}>
            <UnitInput unit="% 以上" inputProps={{ value: threshold, onChange: e=>setThreshold(parseInt(e.target.value)||0), type:'number',min:0,max:100 }} />
          </FormGroup>
        </div>
        <div className="flex gap-2">
          <Button variant="vec" onClick={run} disabled={running}><Icon name="vecSearch" size={13} />{running ? t('探索中...', 'Searching...') : t('探索実行', 'Search')}</Button>
          <Button variant="default" size="sm" onClick={() => { setResults([]); setRan(false); setAiComment(''); }}>{t('クリア', 'Clear')}</Button>
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
          {results.length === 0 && (
            <Card className="p-4 border-dashed border-[var(--warn)]">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="info" size={14} className="text-warn" />
                <span className="text-[13px] font-semibold text-warn">{t('該当する類似材料が見つかりませんでした', 'No similar materials found')}</span>
              </div>
              <ul className="text-[12px] text-text-md space-y-1 ml-5 list-disc">
                <li>{t('しきい値を下げてみてください', 'Try lowering the similarity threshold')} ({t('現在', 'currently')} {threshold}%)</li>
                <li>{t('有効な ID を使用してください', 'Use a valid material ID')} (MT-0001〜MT-0020, MAT-0301〜MAT-0368)</li>
                <li>{t('材料名や組成で検索することもできます', 'You can also search by material name or composition')} ({t('例', 'e.g.')}: SUS316L, Ti-6Al-4V)</li>
              </ul>
            </Card>
          )}
          {results.map((r,i) => (
            <Card key={r.id} className="p-3 hover:border-[var(--vec-mid)] transition-colors">
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="text-[13px] font-bold text-text-lo">#{i+1}</span>
                <span className="text-[12px] text-text-lo">{r.id}</span>
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
