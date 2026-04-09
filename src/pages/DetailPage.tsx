import { useState, useEffect, useContext } from 'react';
import { marked } from 'marked';
import { Icon } from '../components/Icon';
import { Button, Badge, Card, SectionCard } from '../components/atoms';
import { Modal, AIInsightCard, VecCard } from '../components/molecules';
import { AppCtx } from '../context/AppContext';

export const DetailPage = ({ db, recordId, dispatch, onBack, onEdit, claude, embedding, onNav }) => {
  const r = db.find(x => x.id === recordId);
  const [aiComment, setAiComment] = useState('');
  const [aiLoading, setAiLoading] = useState(true);
  const [vecNear, setVecNear] = useState([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { addToast } = useContext(AppCtx);

  useEffect(() => {
    if (!r) return;
    claude.call(`材料「${r.name}」（${r.comp}）硬度${r.hv}HV・引張${r.ts}MPa・弾性${r.el}GPaの特徴と代表的な用途を2〜3文で教えてください。`)
      .then(t => { setAiComment(t); setAiLoading(false); });
    embedding.search(`${r.name} ${r.comp}`, 4).then(res => setVecNear(res.filter(x=>x.id!==recordId)));
  }, [recordId]);

  if (!r) return <div className="text-text-lo text-center py-20">データが見つかりません</div>;

  const same = db.filter(x=>x.cat===r.cat&&x.id!==r.id).slice(0,3);
  const cmpData = [r,...same];
  const maxHv = Math.max(...cmpData.map(x=>x.hv));
  const colors = ['var(--accent)','var(--ok)','var(--warn)','var(--ai-mid)'];

  const renderAiHtml = () => {
    try {
      marked.setOptions({ breaks: true, gfm: true });
      return marked.parse(aiComment);
    } catch(e) { return aiComment; }
  };

  return (
    <div className="flex flex-col gap-4">
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title="削除の確認" footer={
        <>
          <Button variant="default" onClick={() => setDeleteOpen(false)}>キャンセル</Button>
          <Button variant="danger" onClick={() => { dispatch({type:'DELETE',id:recordId}); setDeleteOpen(false); onBack(); addToast('削除しました'); }}>削除する</Button>
        </>
      }>
        <p><strong>{r.name}</strong>（{r.id}）を削除します。この操作は元に戻せません。</p>
      </Modal>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-text-lo">
        <button onClick={onBack} className="text-accent hover:underline flex items-center gap-1"><Icon name="chevronLeft" size={12} />材料データ一覧</button>
        <Icon name="chevronRight" size={10} />
        <span>{r.name}</span>
      </div>

      <Card className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <span className="font-mono text-[11px] bg-raised px-2 py-1 rounded text-text-lo flex-shrink-0 mt-1">{r.id}</span>
          <div className="flex-1">
            <h1 className="text-[19px] font-bold tracking-tight">{r.name}</h1>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <Badge variant="gray">{r.cat}</Badge>
              <Badge>{r.status}</Badge>
              <span className="text-[12px] text-text-lo">登録: {r.date} · {r.author}</span>
              {r.ai && <Badge variant="ai"><Icon name="warning" size={11} />AI検出</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="default" size="sm" onClick={onEdit}><Icon name="edit" size={12} />編集</Button>
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}><Icon name="trash" size={12} />削除</Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[['バッチ',r.batch],['組成',r.comp,true],['密度',r.dn?`${r.dn} g/cm³`:'—']].map(([lbl,val,mono])=>(
            <div key={lbl} className="bg-raised border border-[var(--border-faint)] rounded-md p-3">
              <div className="text-[10px] font-bold text-text-lo uppercase tracking-[.05em] mb-1">{lbl}</div>
              <div className={`text-[13px] font-semibold ${mono?'font-mono text-[12px]':''}`}>{val}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 300px', alignItems: 'start' }}>
        <div className="flex flex-col gap-4">
          <SectionCard title="物性データ">
            {[['硬度',r.hv?`${r.hv.toLocaleString()} HV`:'—'],['引張強さ',r.ts?`${r.ts} MPa`:'—'],['弾性率',r.el?`${r.el} GPa`:'—'],['耐力 0.2%',r.pf?`${r.pf} MPa`:'—'],['伸び',r.el2!=null?`${r.el2} %`:'—']].map(([k,v])=>(
              <div key={k} className="flex justify-between items-baseline py-1.5 border-b border-[var(--border-faint)] last:border-b-0 text-[13px]">
                <span className="text-text-md">{k}</span><span className="font-semibold">{v}</span>
              </div>
            ))}
          </SectionCard>

          <SectionCard title="同カテゴリ 硬度比較">
            {cmpData.map((x,i) => (
              <div key={x.id} className="flex items-center gap-2.5 text-[12px] py-1">
                <span className="w-16 text-right text-text-lo font-mono flex-shrink-0">{x.id.slice(-4)}</span>
                <div className="flex-1 h-1.5 bg-raised rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width:`${Math.round(x.hv/maxHv*100)}%`, background: colors[i] }} />
                </div>
                <span className="w-14 font-mono text-text-lo text-right">{x.hv.toLocaleString()} HV</span>
              </div>
            ))}
          </SectionCard>

          <SectionCard title="変更履歴">
            <div className="flex gap-2.5 py-2 border-b border-[var(--border-faint)]">
              <div className="w-7 h-7 rounded-full bg-[var(--ok-dim)] text-ok flex items-center justify-center flex-shrink-0"><Icon name="check" size={12} /></div>
              <div><div className="text-[13px] font-semibold">登録 — {r.author}</div><div className="text-[11px] text-text-lo">{r.date} · ステータス: {r.status}</div></div>
            </div>
            {r.memo && (
              <div className="flex gap-2.5 py-2">
                <div className="w-7 h-7 rounded-full bg-[var(--warn-dim)] text-warn flex items-center justify-center flex-shrink-0"><Icon name="info" size={12} /></div>
                <div><div className="text-[13px] font-semibold">備考あり</div><div className="text-[11px] text-text-lo">{r.memo}</div></div>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="flex flex-col gap-3">
          <AIInsightCard loading={aiLoading} chips={[
            { label: 'RAGチャットで詳しく', onClick: () => onNav('rag') },
            { label: '類似材料を探す', onClick: () => onNav('sim') },
          ]}>
            {!aiLoading && <div className="md-preview" dangerouslySetInnerHTML={{ __html: renderAiHtml() }} />}
          </AIInsightCard>

          <VecCard>
            <div className="text-[12px] font-bold text-vec uppercase tracking-[.04em] mb-2">Embedding 近傍</div>
            {vecNear.length === 0 ? <p className="text-[12px]">—</p> : vecNear.map(x=>(
              <div key={x.id} className="flex items-center gap-2 py-1 border-b border-[var(--border-faint)] last:border-b-0 text-[12px]">
                <span className="font-mono text-text-lo">{x.id}</span>
                <span className="flex-1 truncate">{x.name}</span>
                <span className="text-[11px] font-bold text-vec">{Math.round((x.score||0)*100)}%</span>
              </div>
            ))}
          </VecCard>

          <SectionCard title="同バッチ">
            {db.filter(x=>x.batch===r.batch&&x.id!==r.id).slice(0,4).map(x=>(
              <div key={x.id} className="flex items-center gap-2 py-1.5 border-b border-[var(--border-faint)] last:border-b-0 text-[13px]">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                <div className="flex-1 min-w-0"><div className="font-semibold truncate">{x.name}</div><div className="text-[12px] text-text-lo font-mono">{x.id}</div></div>
                <Badge>{x.status}</Badge>
              </div>
            ))}
            {db.filter(x=>x.batch===r.batch&&x.id!==r.id).length === 0 && <p className="text-[12px] text-text-lo">このバッチの他データなし</p>}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
