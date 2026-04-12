import { useState, useEffect, useRef, useContext } from 'react';
import { Chart, registerables } from 'chart.js';
import { renderSafeMarkdown } from '../../services/safeMarkdown';
import { Icon, IconName } from '../../components/Icon';
import { Button, Badge, Card, SectionCard, ProgressBar } from '../../components/atoms';
import { AIInsightCard, KpiCard, ExportModal } from '../../components/molecules';
import { AppCtx } from '../../context/AppContext';
import type { Material, AIHook, AppContextValue } from '../../types';
import type { AnnouncementsState } from '../../hooks/useAnnouncements/useAnnouncements';
import type { AnnouncementType } from '../../data/announcements';

interface DashboardPageProps {
  db: Material[];
  onNav: (page: string) => void;
  claude: AIHook;
  announcements?: AnnouncementsState;
  onOpenAnnouncements?: () => void;
}

const ANNOUNCEMENT_TYPE_MAP: Record<
  AnnouncementType,
  { icon: IconName; color: string; bg: string; label: string }
> = {
  feature: { icon: 'spark', color: 'var(--ai-col)', bg: 'var(--ai-dim)', label: 'NEW' },
  fix: { icon: 'check', color: 'var(--ok)', bg: 'var(--ok-dim)', label: 'FIX' },
  info: { icon: 'info', color: 'var(--accent)', bg: 'var(--accent-dim)', label: 'INFO' },
  warn: { icon: 'warning', color: 'var(--warn)', bg: 'var(--warn-dim)', label: 'NOTICE' },
};

Chart.register(...registerables);

export const DashboardPage = ({ db, onNav, claude, announcements, onOpenAnnouncements }: DashboardPageProps) => {
  const [insight, setInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(true);
  const chartRefs = { trend: useRef(null), donut: useRef(null), status: useRef(null), scatter: useRef(null) };
  const chartInstances = useRef({});

  useEffect(() => {
    claude.call(`材料DB: 総${db.length}件、レビュー待${db.filter(r=>r.status==='レビュー待').length}件、AI検出${db.filter(r=>r.ai).length}件。研究リーダーへ2〜3文サマリーと推奨アクション1つ。`)
      .then(t => { setInsight(t); setInsightLoading(false); });
  }, []);

  useEffect(() => {
    const getV = (n: string) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
    const a=getV('--accent'), ok=getV('--ok'), warn=getV('--warn'), ai=getV('--ai-mid'), lo=getV('--text-lo'), bf=getV('--border-faint');
    Chart.defaults.color=lo; Chart.defaults.borderColor=bf; Chart.defaults.font.size=11;
    const destroy = (k: string) => { if((chartInstances.current as any)[k]){(chartInstances.current as any)[k].destroy();delete (chartInstances.current as any)[k];} };

    if(chartRefs.trend.current){
      destroy('trend');
      (chartInstances.current as any).trend = new Chart(chartRefs.trend.current, {
        type:'line',
        data:{ labels:['5月','6月','7月','8月','9月','10月','11月','12月','1月','2月','3月','4月'],
          datasets:[
            {label:'登録件数',data:[18,22,19,28,25,30,28,35,31,42,39,12],borderColor:a,backgroundColor:a+'22',tension:.4,fill:true,pointRadius:3,pointHoverRadius:5},
            {label:'承認件数',data:[15,19,16,24,21,26,24,30,28,38,35,10],borderColor:ok,backgroundColor:'transparent',tension:.4,borderDash:[4,3],pointRadius:2,pointHoverRadius:4},
          ]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top',labels:{boxWidth:10,padding:10}},tooltip:{mode:'index',intersect:false}},scales:{y:{beginAtZero:true,grid:{color:bf},ticks:{stepSize:10}},x:{grid:{display:false}}}}
      });
    }
    if(chartRefs.donut.current){
      destroy('donut');
      const cats=[{cat:'金属合金',n:db.filter(r=>r.cat==='金属合金').length||102,c:a},{cat:'セラミクス',n:db.filter(r=>r.cat==='セラミクス').length||68,c:ok},{cat:'ポリマー',n:db.filter(r=>r.cat==='ポリマー').length||47,c:warn},{cat:'複合材料',n:db.filter(r=>r.cat==='複合材料').length||30,c:ai}];
      (chartInstances.current as any).donut = new Chart(chartRefs.donut.current, {
        type:'doughnut',
        data:{labels:cats.map(d=>d.cat),datasets:[{data:cats.map(d=>d.n),backgroundColor:cats.map(d=>d.c+'cc'),borderColor:cats.map(d=>d.c),borderWidth:1.5,hoverOffset:6}]},
        options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{position:'bottom',labels:{boxWidth:10,padding:8,font:{size:11}}},tooltip:{callbacks:{label:ctx=>`${ctx.label}: ${ctx.parsed}件`}}}}
      });
    }
    if(chartRefs.status.current){
      destroy('status');
      const batches=['B-035','B-036','B-037','B-038'];
      const statusList=['承認済','登録済','レビュー待','要修正'];
      const sColors=[ok+'cc',a+'cc',warn+'cc','#E24B4Acc'];
      (chartInstances.current as any).status = new Chart(chartRefs.status.current, {
        type:'bar',
        data:{labels:batches,datasets:statusList.map((s,i)=>({label:s,data:batches.map(b=>db.filter(r=>r.batch===b&&r.status===s).length||[3,2,2,1][i]),backgroundColor:sColors[i],borderRadius:2,borderSkipped:false}))},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top',labels:{boxWidth:10,padding:8}},tooltip:{mode:'index'}},scales:{x:{stacked:true,grid:{display:false}},y:{stacked:true,beginAtZero:true,grid:{color:bf}}}}
      });
    }
    if(chartRefs.scatter.current){
      destroy('scatter');
      const catColors: Record<string, string> ={'金属合金':a,'セラミクス':ok,'ポリマー':warn,'複合材料':ai};
      (chartInstances.current as any).scatter = new Chart(chartRefs.scatter.current, {
        type:'scatter',
        data:{datasets:['金属合金','セラミクス','ポリマー','複合材料'].map(cat=>({label:cat,data:db.filter(r=>r.cat===cat&&r.hv&&r.ts).map(r=>({x:r.hv,y:r.ts})),backgroundColor:(catColors[cat]||a)+'99',pointRadius:5,pointHoverRadius:7}))},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'top',labels:{boxWidth:10,padding:8}},tooltip:{callbacks:{label:ctx=>`${ctx.dataset.label} HV:${ctx.parsed.x} MPa:${ctx.parsed.y}`}}},scales:{x:{title:{display:true,text:'硬度 (HV)',font:{size:11}},grid:{color:bf}},y:{title:{display:true,text:'引張強さ (MPa)',font:{size:11}},grid:{color:bf}}}}
      });
    }
    return () => { Object.values(chartInstances.current as any).forEach((c: any) => c.destroy()); chartInstances.current={}; };
  }, [db]);

  const { addToast, t } = useContext(AppCtx) as AppContextValue;
  const [exportOpen, setExportOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} db={db} filtered={db} />
      <div className="flex flex-col sm:flex-row items-start gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="ptitle text-[19px] font-bold tracking-tight">{t('ダッシュボード', 'Dashboard')}</h1>
          <p className="text-[12px] text-text-lo mt-0.5">{t('2026年4月 · 概況サマリー', 'Apr 2026 · Overview')}</p>
        </div>
        <div className="flex gap-2 items-center flex-shrink-0 flex-wrap">
          <Button variant="default" size="sm" onClick={() => setExportOpen(true)}><Icon name="download" size={13} />{t('レポート', 'Report')}</Button>
          <Button variant="ai" size="sm" onClick={() => onNav('rag')}><Icon name="spark" size={13} />{t('AI 分析', 'AI Analysis')}</Button>
          <Button variant="primary" size="sm" onClick={() => onNav('new')}><Icon name="plus" size={13} />{t('登録', 'Register')}</Button>
        </div>
      </div>
      <div className={`grid grid-cols-1 ${announcements && announcements.all.length > 0 ? 'lg:grid-cols-[2fr_1fr]' : ''} gap-3 items-start`}>
        <AIInsightCard loading={insightLoading} subtitle={t('登録データ全体の傾向やレビュー優先度をAIが分析します。', 'AI analyzes trends and review priorities across all registered data.')} chips={[
          { label: t('今月の傾向を詳しく', 'Monthly trends'), onClick: () => onNav(`rag:今月登録された材料データの傾向を分析してください。カテゴリ分布や物性値の特徴を教えてください。`) },
          { label: t('レビュー待ちを確認', 'Review pending items'), onClick: () => onNav(`rag:現在レビュー待ちの材料データを一覧し、優先的にレビューすべきものとその理由を教えてください。`) },
          { label: t('AI検出の詳細', 'AI detection details'), onClick: () => onNav(`rag:AI検出フラグが付いた材料データについて、何が検出されたのか、注意すべき点を教えてください。`) },
        ]}>
          {!insightLoading && <div className="md-preview" dangerouslySetInnerHTML={{ __html: renderSafeMarkdown(insight) }} />}
        </AIInsightCard>
        {announcements && announcements.all.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="info" size={13} className="text-accent flex-shrink-0" />
              <span className="text-[12px] font-bold text-text-lo tracking-[.05em] uppercase">{t('お知らせ', 'Announcements')}</span>
              {announcements.unreadCount > 0 && (
                <span className="text-[12px] font-bold text-accent bg-accent-dim px-1.5 py-0.5 rounded-full leading-none">
                  {announcements.unreadCount}
                </span>
              )}
              {onOpenAnnouncements && (
                <div className="ml-auto">
                  <Button variant="ghost" size="xs" onClick={onOpenAnnouncements}>
                    {t('一覧へ', 'View all')} <Icon name="chevronRight" size={10} />
                  </Button>
                </div>
              )}
            </div>
            <ul className="flex flex-col">
              {announcements.all.slice(0, 3).map(a => {
                const style = ANNOUNCEMENT_TYPE_MAP[a.type];
                const isUnread = announcements.unread.some(u => u.id === a.id);
                return (
                  <li
                    key={a.id}
                    className="flex items-start gap-2 py-1.5 border-b border-[var(--border-faint)] last:border-b-0"
                  >
                    <span
                      className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded mt-0.5"
                      style={{ background: style.bg, color: style.color }}
                      aria-hidden="true"
                    >
                      <Icon name={style.icon} size={12} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[12px] font-bold tracking-[.06em] uppercase flex-shrink-0"
                          style={{ color: style.color }}
                        >
                          {style.label}
                        </span>
                        <span className="text-[12px] text-text-lo flex-shrink-0">{a.date}</span>
                        {isUnread && (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"
                            aria-label="未読"
                          />
                        )}
                      </div>
                      <div className="text-[13px] text-text-hi font-semibold leading-snug truncate">
                        {a.title}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label={t('総データ件数', 'Total Records')} value={db.length} delta={t('▲ 12件（今月）', '▲ 12 this month')} deltaUp={true} />
        <KpiCard label={t('実験バッチ数', 'Batch Count')} value={38} delta={t('▲ 3バッチ', '▲ 3 batches')} deltaUp={true} />
        <KpiCard label={t('レビュー待ち', 'Pending Review')} value={db.filter(r=>r.status==='レビュー待').length} delta={t('▼ 要対応', '▼ Action needed')} deltaUp={false} />
        <KpiCard label={t('AI 検出', 'AI Flagged')} value={db.filter(r=>r.ai).length} delta={t('異常値候補あり', 'Anomaly candidates')} color="var(--ai-col)" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <SectionCard title={t('月次登録件数トレンド（12ヶ月）', 'Monthly Registrations (12 mo)')}><div className="chart-container"><canvas ref={chartRefs.trend} /></div></SectionCard>
        <SectionCard title={t('カテゴリ別件数構成', 'Category Distribution')}><div className="chart-container"><canvas ref={chartRefs.donut} /></div></SectionCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <SectionCard title={t('バッチ別ステータス内訳', 'Status by Batch')}><div className="chart-container"><canvas ref={chartRefs.status} /></div></SectionCard>
        <SectionCard title={t('硬度 vs 引張強さ 散布図', 'Hardness vs Tensile Scatter')}><div className="chart-container"><canvas ref={chartRefs.scatter} /></div></SectionCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <SectionCard title={t('最近登録されたデータ', 'Recently Registered')} action={<Button variant="ghost" size="xs" onClick={() => onNav('list')}>{t('一覧へ', 'View all')} <Icon name="chevronRight" size={10} /></Button>}>
          {db.slice(0,5).map((r, i) => (
            <div key={r.id} className="flex items-center gap-2.5 py-1.5 border-b border-[var(--border-faint)] last:border-b-0 cursor-pointer hover:bg-hover rounded px-1 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ['var(--accent)','var(--ok)','var(--warn)','var(--ai-mid)','#D4537E'][i] }} />
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold truncate">{r.name}</div>
                <div className="text-[12px] text-text-lo font-mono">{r.id} · {r.batch}</div>
              </div>
              <Badge>{r.status}</Badge>
            </div>
          ))}
        </SectionCard>
        <SectionCard title={t('実験フェーズ進捗', 'Experiment Phase Progress')}>
          {([[t('データ収集', 'Data Collection'),'var(--accent)',88],[t('一次評価', 'Initial Eval'),'var(--ok)',74],[t('解析・検証', 'Analysis'),'var(--warn)',51],[t('報告書作成', 'Report'),'var(--ai-mid)',32]] as [string, string, number][]).map(([lbl,col,val]) => (
            <div key={lbl} className="flex items-center gap-2.5 py-1.5 text-[12px]">
              <span className="w-20 text-text-md flex-shrink-0">{lbl}</span>
              <ProgressBar value={val} color={col} className="flex-1 h-1.5" />
              <span className="w-7 text-right font-mono text-text-lo">{val}%</span>
            </div>
          ))}
        </SectionCard>
      </div>
    </div>
  );
};
