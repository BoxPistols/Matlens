import { useState, useContext } from 'react';
import { Icon } from '../../components/Icon';
import { Badge, Card } from '../../components/atoms';
import { SearchBox } from '../../components/molecules';
import { AppCtx } from '../../context/AppContext';
import type { AppContextValue } from '../../types';
import { HELP_TERMS, PAGE_GUIDES } from '../../data/constants';
import type { PageGuide } from '../../data/constants';

/* ---------- ページガイド専用ビュー ---------- */

const GUIDE_TITLE_MAP: Record<string, string> = Object.fromEntries(
  PAGE_GUIDES.map(g => [g.id, g.title]),
);

const PageGuideSection = ({
  guides, onNav,
}: {
  guides: PageGuide[];
  onNav?: (page: string) => void;
}) => (
  <div className="flex flex-col gap-5">
    {guides.map(g => (
      <div key={g.id} className="rounded-xl border border-[var(--border-default)] bg-surface overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-3">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Icon name={g.icon as Parameters<typeof Icon>[0]['name']} size={18} className="text-accent" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[15px] font-bold text-text-hi leading-snug truncate">
              {g.title} <span className="text-text-lo font-normal">/ {g.titleEn}</span>
            </h3>
          </div>
        </div>

        <div className="border-t border-[var(--border-faint)] mx-5" />

        <div className="px-5 py-4 flex flex-col gap-4 text-[13px] leading-relaxed text-text-md">
          {/* 概要 */}
          <div>
            <div className="text-[12px] font-bold text-text-lo uppercase tracking-wider mb-1">概要</div>
            <p>{g.summary}</p>
          </div>

          {/* できること */}
          <div>
            <div className="text-[12px] font-bold text-text-lo uppercase tracking-wider mb-1">できること</div>
            <ul className="list-disc list-inside space-y-0.5">
              {g.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>

          {/* 操作のヒント */}
          <div>
            <div className="text-[12px] font-bold text-text-lo uppercase tracking-wider mb-1">操作のヒント</div>
            <ul className="list-disc list-inside space-y-0.5">
              {g.tips.map((tip, i) => <li key={i}>{tip}</li>)}
            </ul>
          </div>

          {/* Footer: 関連ページ + 遷移ボタン */}
          <div className="flex items-center justify-between gap-4 pt-1 flex-wrap">
            {g.related.length > 0 && (
              <div className="text-[12px] text-text-lo">
                関連ページ:{' '}
                {g.related.map((rid, i) => {
                  const label = GUIDE_TITLE_MAP[rid] ?? rid;
                  return (
                    <span key={rid}>
                      {i > 0 && <span className="mx-1">|</span>}
                      {onNav ? (
                        <button
                          className="text-accent hover:underline"
                          onClick={() => onNav(rid)}
                        >{label}</button>
                      ) : (
                        <span className="text-accent">{label}</span>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
            {onNav && g.id !== 'help' && (
              <button
                className="ml-auto text-[12px] font-bold text-accent hover:underline flex items-center gap-1 flex-shrink-0"
                onClick={() => onNav(g.id)}
              >
                このページを開く
                <Icon name="chevronRight" size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ---------- HelpPage ---------- */

export const HelpPage = ({ onNav }: { onNav?: (page: string) => void }) => {
  const { t } = useContext(AppCtx) as AppContextValue;
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const CATS = [{id:'all',label:t('すべて','All')},{id:'guide',label:t('ページガイド','Page Guide')},{id:'mat',label:t('材料工学','Materials')},{id:'ai',label:'AI / ML'},{id:'sys',label:t('システム','System')},{id:'ops',label:t('操作ガイド','Operations')}];
  const filtered = HELP_TERMS.filter(t => (cat==='all'||t.cat===cat) && (!q||`${t.term} ${t.en} ${t.body}`.toLowerCase().includes(q.toLowerCase())));

  // ページガイド表示時は q でフィルタ
  const filteredGuides = PAGE_GUIDES.filter(g =>
    !q || `${g.title} ${g.titleEn} ${g.summary}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="ptitle text-[19px] font-bold tracking-tight">ヘルプ・用語集</h1>
          <p className="text-[12px] text-text-lo mt-0.5">Matlens で使われる専門用語・操作ガイドのリファレンス</p>
        </div>
        <div style={{width:220}}><SearchBox value={q} onChange={setQ} placeholder="用語を検索..." /></div>
      </div>
      <div className="flex gap-1.5 flex-wrap" role="tablist">
        {CATS.map(c=>(
          <button key={c.id} onClick={()=>setCat(c.id)} role="tab" aria-selected={cat===c.id}
            className={`px-4 py-1.5 rounded-full text-[13px] border transition-all font-ui ${cat===c.id?'bg-accent text-white border-accent':'bg-surface text-text-md border-[var(--border-default)] hover:bg-hover'}`}>
            {c.label}
          </button>
        ))}
      </div>

      {cat === 'guide' ? (
        filteredGuides.length > 0 ? (
          <PageGuideSection guides={filteredGuides} onNav={onNav} />
        ) : (
          <div className="text-center py-10 text-text-lo">
            <Icon name="search" size={24} className="mx-auto mb-2 opacity-30" />
            <p>該当するガイドが見つかりません</p>
          </div>
        )
      ) : (
        <div className="grid gap-2.5" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))' }}>
          {filtered.map(t=>(
            <Card key={t.id} className={openId===t.id?'ring-2 ring-[var(--accent)]':''}>
              <button className="w-full flex items-start justify-between gap-3 p-3.5 text-left hover:bg-hover transition-colors rounded-lg"
                onClick={()=>setOpenId(openId===t.id?null:t.id)} aria-expanded={openId===t.id}>
                <div>
                  <div className="text-[14px] font-bold text-text-hi">{t.term}</div>
                  {t.en && <div className="text-[12px] text-text-lo font-mono mt-0.5">{t.en}</div>}
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge variant={t.catVariant}>{t.catLabel}</Badge>
                  <Icon name={openId===t.id?'chevronDown':'chevronRight'} size={12} className="text-text-lo" />
                </div>
              </button>
              {openId===t.id && (
                <div className="px-3.5 pb-3.5 pt-0 text-[13px] text-text-md leading-relaxed border-t border-[var(--border-faint)] mt-0">
                  <div className="pt-3">{t.body}</div>
                  {t.related && <div className="mt-2 text-[12px] text-text-lo">関連: <strong className="text-accent">{t.related}</strong></div>}
                </div>
              )}
            </Card>
          ))}
          {filtered.length===0 && <div className="col-span-full text-center py-10 text-text-lo"><Icon name="search" size={24} className="mx-auto mb-2 opacity-30" /><p>該当する用語が見つかりません</p></div>}
        </div>
      )}
    </div>
  );
};
