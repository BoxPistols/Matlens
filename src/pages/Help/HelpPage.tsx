import { useState, useContext } from 'react';
import { Icon } from '../../components/Icon';
import { Badge, Card, Input } from '../../components/atoms';
import { SearchBox } from '../../components/molecules';
import { HELP_TERMS } from '../../data/constants';
import { AppCtx } from '../../context/AppContext';
import type { AppContextValue } from '../../types';

export const HelpPage = () => {
  const { t } = useContext(AppCtx) as AppContextValue;
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const CATS = [{id:'all',label:t('すべて', 'All')},{id:'guide',label:t('ページガイド', 'Page Guide')},{id:'mat',label:t('材料工学', 'Materials')},{id:'ai',label:'AI / ML'},{id:'sys',label:t('システム', 'System')},{id:'ops',label:t('操作ガイド', 'Operations')}];
  const filtered = HELP_TERMS.filter(t => (cat==='all'||t.cat===cat) && (!q||`${t.term} ${t.en} ${t.body}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="ptitle text-[19px] font-bold tracking-tight">{t('ヘルプ・用語集', 'Help / Glossary')}</h1>
          <p className="text-[12px] text-text-lo mt-0.5">{t('Matlens で使われる専門用語・操作ガイドのリファレンス', 'Reference for technical terms and operations used in Matlens')}</p>
        </div>
        <div style={{width:220}}><SearchBox value={q} onChange={setQ} placeholder={t('用語を検索...', 'Search terms...')} /></div>
      </div>
      <div className="flex gap-1.5 flex-wrap" role="tablist">
        {CATS.map(c=>(
          <button key={c.id} onClick={()=>setCat(c.id)} role="tab" aria-selected={cat===c.id}
            className={`px-4 py-1.5 rounded-full text-[13px] border transition-all font-ui ${cat===c.id?'bg-accent text-white border-accent':'bg-surface text-text-md border-[var(--border-default)] hover:bg-hover'}`}>
            {c.label}
          </button>
        ))}
      </div>
      <div className="grid gap-2.5" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))' }}>
        {filtered.map(t=>(
          <Card key={t.id} className={openId===t.id?'ring-2 ring-[var(--accent)]':''}>
            <button className="w-full flex items-start justify-between gap-3 p-3.5 text-left hover:bg-hover transition-colors rounded-lg"
              onClick={()=>setOpenId(openId===t.id?null:t.id)} aria-expanded={openId===t.id}>
              <div>
                <div className="text-[14px] font-bold text-text-hi">{t.term}</div>
                {t.en && <div className="text-[12px] text-text-lo font-ui mt-0.5">{t.en}</div>}
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
        {filtered.length===0 && <div className="col-span-full text-center py-10 text-text-lo"><Icon name="search" size={24} className="mx-auto mb-2 opacity-30" /><p>{t('該当する用語が見つかりません', 'No matching terms found')}</p></div>}
      </div>
    </div>
  );
};
