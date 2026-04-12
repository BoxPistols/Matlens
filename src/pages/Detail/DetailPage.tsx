import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { renderSafeMarkdown } from '../../services/safeMarkdown';
import {
  serializeMaterialToMaiml,
  downloadMaimlFile,
} from '../../services/maiml';
import { Icon } from '../../components/Icon';
import { Button, Badge, Card, SectionCard } from '../../components/atoms';
import { Modal, AIInsightCard, VecCard, DownloadPreviewModal } from '../../components/molecules';
import { MaterialVisual } from '../../components/MaterialVisual';
import { DataDisclaimer } from '../../components/DataDisclaimer';
import { AppCtx } from '../../context/AppContext';
import type { Material, AIHook, EmbeddingHook, AppContextValue, MaterialWithScore } from '../../types';

interface DetailPageProps {
  db: Material[];
  recordId: string;
  dispatch: React.Dispatch<any>;
  onBack: () => void;
  onEdit: () => void;
  claude: AIHook;
  embedding: EmbeddingHook;
  onNav: (page: string) => void;
}

export const DetailPage = ({ db, recordId, dispatch, onBack, onEdit, claude, embedding, onNav }: DetailPageProps) => {
  const r = db.find(x => x.id === recordId);
  const [aiComment, setAiComment] = useState('');
  const [aiLoading, setAiLoading] = useState(true);
  const [vecNear, setVecNear] = useState<MaterialWithScore[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [maimlPreviewOpen, setMaimlPreviewOpen] = useState(false);
  const { addToast, t } = useContext(AppCtx) as AppContextValue;

  // 単一材料の MaiML プレビュー内容を memoize（モーダルを閉じるまで再計算しない）
  const singleMaimlXml = useMemo(
    () => (maimlPreviewOpen && r ? serializeMaterialToMaiml(r) : ''),
    [maimlPreviewOpen, r],
  );

  const handleMaimlDownloadConfirm = () => {
    if (!r) return;
    downloadMaimlFile(singleMaimlXml, `${r.id}.maiml`);
    addToast('MaiML ファイルをダウンロードしました');
    setMaimlPreviewOpen(false);
  };

  // Prev/Next navigation (via on-screen buttons only — no global arrow-key shortcut)
  const currentIndex = useMemo(() => db.findIndex(x => x.id === recordId), [db, recordId]);
  const prevId = currentIndex > 0 ? (db[currentIndex - 1]?.id ?? null) : null;
  const nextId = currentIndex < db.length - 1 ? (db[currentIndex + 1]?.id ?? null) : null;
  const goTo = useCallback((id: string | null) => { if (id) onNav('detail_' + id); }, [onNav]);

  useEffect(() => {
    setAiComment(''); setAiLoading(true);
    if (!r) return;
    claude.call(`材料「${r.name}」（${r.comp}）硬度${r.hv}HV・引張${r.ts}MPa・弾性${r.el}GPaの特徴と代表的な用途を2〜3文で教えてください。`)
      .then(t => { setAiComment(t); setAiLoading(false); });
    embedding.search(`${r.name} ${r.comp}`, 4).then(res => setVecNear(res.filter(x=>x.id!==recordId)));
  }, [recordId]);

  if (!r) return <div className="text-text-lo text-center py-20">{t('データが見つかりません', 'Data not found')}</div>;

  const same = db.filter(x=>x.cat===r.cat&&x.id!==r.id).slice(0,3);
  const cmpData = [r,...same];
  const maxHv = Math.max(...cmpData.map(x=>x.hv));
  const colors = ['var(--accent)','var(--ok)','var(--warn)','var(--ai-mid)'];

  const renderAiHtml = () => renderSafeMarkdown(aiComment);

  return (
    <div className="flex flex-col gap-4">
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)} title={t('削除の確認', 'Confirm Deletion')} footer={
        <>
          <Button variant="default" onClick={() => setDeleteOpen(false)}>{t('キャンセル', 'Cancel')}</Button>
          <Button variant="danger" onClick={() => { dispatch({type:'DELETE',id:recordId}); setDeleteOpen(false); onBack(); addToast(t('削除しました', 'Deleted')); }}>{t('削除する', 'Delete')}</Button>
        </>
      }>
        <p><strong>{r.name}</strong>（{r.id}）を削除します。この操作は元に戻せません。</p>
      </Modal>

      <DownloadPreviewModal
        open={maimlPreviewOpen}
        onClose={() => setMaimlPreviewOpen(false)}
        onConfirm={handleMaimlDownloadConfirm}
        title={t('MaiML エクスポート プレビュー（単一材料）', 'MaiML Export Preview (Single Material)')}
        filename={`${r.id}.maiml`}
        content={singleMaimlXml}
        language="xml"
        description={`${r.name}（${r.id}）を JIS K 0200:2024 準拠の MaiML 形式で書き出します。`}
      />


      {/* Breadcrumb + prev/next navigation */}
      <div className="flex items-center gap-1.5 text-[12px] text-text-lo">
        <button onClick={onBack} className="text-accent hover:underline flex items-center gap-1"><Icon name="chevronLeft" size={12} />{t('戻る', 'Back')}</button>
        <Icon name="chevronRight" size={10} />
        <span className="truncate">{r.name}</span>
        <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
          <button onClick={() => goTo(prevId)} disabled={!prevId}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[var(--border-default)] bg-raised hover:bg-hover hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[11px]"
            title="前の材料">
            <Icon name="chevronLeft" size={12} />
            {prevId && <span className="hidden sm:inline text-text-md truncate max-w-[80px]">{db[currentIndex - 1]?.name}</span>}
          </button>
          <span className="text-[11px] text-text-lo font-mono px-1">{currentIndex + 1} / {db.length}</span>
          <button onClick={() => goTo(nextId)} disabled={!nextId}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[var(--border-default)] bg-raised hover:bg-hover hover:border-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[11px]"
            title="次の材料">
            {nextId && <span className="hidden sm:inline text-text-md truncate max-w-[80px]">{db[currentIndex + 1]?.name}</span>}
            <Icon name="chevronRight" size={12} />
          </button>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <MaterialVisual name={r.name} cat={r.cat} hv={r.hv} size={100} className="flex-shrink-0" showLabel={false} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[11px] bg-raised px-2 py-1 rounded text-text-lo flex-shrink-0">{r.id}</span>
            </div>
            <h1 className="text-[19px] font-bold tracking-tight">{r.name}</h1>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <Badge variant="gray">{r.cat}</Badge>
              <Badge>{r.status}</Badge>
              {r.provenance && (
                <Badge variant={
                  r.provenance === 'instrument' ? 'green'
                  : r.provenance === 'manual' ? 'blue'
                  : r.provenance === 'ai' ? 'ai'
                  : 'amber'
                }>
                  {r.provenance === 'instrument' ? t('装置計測', 'Instrument')
                   : r.provenance === 'manual' ? t('手入力', 'Manual')
                   : r.provenance === 'ai' ? t('AI推定', 'AI Est.')
                   : t('シミュレーション', 'Simulation')}
                </Badge>
              )}
              <span className="text-[12px] text-text-lo">{t('登録', 'Registered')}: {r.date} · {r.author}</span>
              {r.ai && <Badge variant="ai"><Icon name="warning" size={11} />{t('AI検出', 'AI flagged')}</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setMaimlPreviewOpen(true)}
              title="この材料を MaiML (JIS K 0200:2024) で書き出す"
            >
              <Icon name="download" size={12} />MaiML
            </Button>
            <Button variant="default" size="sm" onClick={onEdit}><Icon name="edit" size={12} />{t('編集', 'Edit')}</Button>
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}><Icon name="trash" size={12} />{t('削除', 'Delete')}</Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {([[t('バッチ', 'Batch'),r.batch,false],[t('組成', 'Composition'),r.comp,true],[t('密度', 'Density'),r.dn?`${r.dn} g/cm³`:'—',false]] as [string,string,boolean][]).map(([lbl,val,mono])=>(
            <div key={lbl} className="bg-raised border border-[var(--border-faint)] rounded-md p-3">
              <div className="text-[10px] font-bold text-text-lo uppercase tracking-[.05em] mb-1">{lbl}</div>
              <div className={`text-[13px] font-semibold ${mono?'font-mono text-[12px]':''}`}>{val}</div>
            </div>
          ))}
        </div>
        {/* Phase A 拡張フィールド */}
        {(r.microstructure || r.testMethod) && (
          <div className="grid grid-cols-2 gap-3 mt-3">
            {r.microstructure && (
              <div className="bg-raised border border-[var(--border-faint)] rounded-md p-3">
                <div className="text-[10px] font-bold text-text-lo uppercase tracking-[.05em] mb-1">金属組織 / Microstructure</div>
                <div className="text-[12px] text-text-md">{r.microstructure}</div>
              </div>
            )}
            {r.testMethod && (
              <div className="bg-raised border border-[var(--border-faint)] rounded-md p-3">
                <div className="text-[10px] font-bold text-text-lo uppercase tracking-[.05em] mb-1">試験方法 / Test Method</div>
                <div className="text-[12px] font-mono text-text-md">{r.testMethod}</div>
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 300px', alignItems: 'start' }}>
        <div className="flex flex-col gap-4">
          <SectionCard title={t('物性データ', 'Properties')}>
            {[[t('硬度', 'Hardness'),r.hv?`${r.hv.toLocaleString()} HV`:'—'],[t('引張強さ', 'Tensile Str.'),r.ts?`${r.ts} MPa`:'—'],[t('弾性率', 'Elastic Mod.'),r.el?`${r.el} GPa`:'—'],[t('耐力 0.2%', '0.2% Proof'),r.pf?`${r.pf} MPa`:'—'],[t('伸び', 'Elongation'),r.el2!=null?`${r.el2} %`:'—']].map(([k,v])=>(
              <div key={k} className="flex justify-between items-baseline py-1.5 border-b border-[var(--border-faint)] last:border-b-0 text-[13px]">
                <span className="text-text-md">{k}</span><span className="font-semibold">{v}</span>
              </div>
            ))}
          </SectionCard>

          <SectionCard title={t('同カテゴリ 硬度比較', 'Hardness Comparison (Same Category)')}>
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

          <SectionCard title={t('変更履歴', 'Change History')}>
            <div className="flex gap-2.5 py-2 border-b border-[var(--border-faint)]">
              <div className="w-7 h-7 rounded-full bg-[var(--ok-dim)] text-ok flex items-center justify-center flex-shrink-0"><Icon name="check" size={12} /></div>
              <div><div className="text-[13px] font-semibold">{t('登録', 'Registered')} — {r.author}</div><div className="text-[11px] text-text-lo">{r.date} · {t('ステータス', 'Status')}: {r.status}</div></div>
            </div>
            {r.memo && (
              <div className="flex gap-2.5 py-2">
                <div className="w-7 h-7 rounded-full bg-[var(--warn-dim)] text-warn flex items-center justify-center flex-shrink-0"><Icon name="info" size={12} /></div>
                <div><div className="text-[13px] font-semibold">{t('備考あり', 'Has notes')}</div><div className="text-[11px] text-text-lo">{r.memo}</div></div>
              </div>
            )}
          </SectionCard>
        </div>

        <div className="flex flex-col gap-3">
          <AIInsightCard loading={aiLoading} subtitle={t('この材料の特徴・用途・注意点をAIが要約します。', 'AI summarizes features, applications, and notes for this material.')} chips={[
            { label: t('AIチャットで詳しく', 'Discuss with AI'), onClick: () => onNav(`rag:${r.name}（${r.comp}）の特徴、用途、類似材料との違いを詳しく教えてください`) },
            { label: t('類似材料を探す', 'Find similar'), onClick: () => onNav('sim:' + r.id) },
          ]}>
            {!aiLoading && <div className="md-preview" dangerouslySetInnerHTML={{ __html: renderAiHtml() }} />}
          </AIInsightCard>

          <VecCard>
            <div className="text-[12px] font-bold text-vec uppercase tracking-[.04em] mb-2">{t('Embedding 近傍', 'Embedding Neighbors')}</div>
            {vecNear.length === 0 ? <p className="text-[12px]">—</p> : vecNear.map(x=>(
              <div key={x.id} className="flex items-center gap-2 py-1 border-b border-[var(--border-faint)] last:border-b-0 text-[12px]">
                <span className="font-mono text-text-lo">{x.id}</span>
                <span className="flex-1 truncate">{x.name}</span>
                <span className="text-[11px] font-bold text-vec">{Math.round((x.score||0)*100)}%</span>
              </div>
            ))}
          </VecCard>

          <SectionCard title={t('同バッチ', 'Same Batch')}>
            {db.filter(x=>x.batch===r.batch&&x.id!==r.id).slice(0,4).map(x=>(
              <div key={x.id} className="flex items-center gap-2 py-1.5 border-b border-[var(--border-faint)] last:border-b-0 text-[13px]">
                <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                <div className="flex-1 min-w-0"><div className="font-semibold truncate">{x.name}</div><div className="text-[12px] text-text-lo font-mono">{x.id}</div></div>
                <Badge>{x.status}</Badge>
              </div>
            ))}
            {db.filter(x=>x.batch===r.batch&&x.id!==r.id).length === 0 && <p className="text-[12px] text-text-lo">{t('このバッチの他データなし', 'No other data in this batch')}</p>}
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
