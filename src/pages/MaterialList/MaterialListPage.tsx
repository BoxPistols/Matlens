import { useState, useEffect, useMemo, useContext } from 'react';
import { Icon } from '../../components/Icon';
import { DataDisclaimer } from '../../components/DataDisclaimer';
import { MaterialVisual } from '../../components/MaterialVisual';
import { Tooltip } from '../../components/Tooltip';
import { Button, Badge, Card, Input, Select, Checkbox } from '../../components/atoms';
import { Modal, SearchBox, FilterChip, ExportModal } from '../../components/molecules';
import { AppCtx } from '../../context/AppContext';
import type { Material, AppContextValue, MaterialWithScore } from '../../types';

interface MaterialListPageProps {
  db: Material[];
  dispatch: React.Dispatch<any>;
  onNav: (page: string) => void;
  onDetail: (id: string) => void;
  search: (q: string, topK?: number) => Promise<MaterialWithScore[]>;
}

const Hl = ({ text, query }: { text: string; query: string }) => {
  if (!query) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  if (parts.length === 1) return <>{text}</>;
  return <>{parts.map((p, i) => p.toLowerCase() === query.toLowerCase()
    ? <mark key={i} className="bg-[var(--accent-dim)] text-[var(--accent)] font-semibold rounded-sm px-0.5">{p}</mark>
    : p
  )}</>;
};

export const MaterialListPage = ({ db, dispatch, onNav, onDetail, search }: MaterialListPageProps) => {
  const [q, setQ] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterSt, setFilterSt] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [hvMin, setHvMin] = useState('');
  const [hvMax, setHvMax] = useState('');
  const [aiOnly, setAiOnly] = useState(false);
  const [sortKey, setSortKey] = useState('id-desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [advOpen, setAdvOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card' | 'compact'>('table');
  const { addToast } = useContext(AppCtx) as AppContextValue;

  const filtered = useMemo(() => {
    let rows = db.filter(r => {
      if(q && !`${r.id} ${r.name} ${r.comp} ${r.memo} ${r.author}`.toLowerCase().includes(q.toLowerCase())) return false;
      if(filterCat && r.cat !== filterCat) return false;
      if(filterSt && r.status !== filterSt) return false;
      if(filterBatch && r.batch !== filterBatch) return false;
      if(hvMin && r.hv < parseFloat(hvMin)) return false;
      if(hvMax && r.hv > parseFloat(hvMax)) return false;
      if(aiOnly && !r.ai) return false;
      return true;
    });
    rows.sort((a,b) => {
      switch(sortKey) {
        case 'id-asc':  return a.id.localeCompare(b.id);
        case 'hv-desc': return b.hv - a.hv;
        case 'hv-asc':  return a.hv - b.hv;
        case 'dt-desc': return b.date.localeCompare(a.date);
        case 'dt-asc':  return a.date.localeCompare(b.date);
        case 'nm-asc':  return a.name.localeCompare(b.name);
        default:        return b.id.localeCompare(a.id);
      }
    });
    return rows;
  }, [db, q, filterCat, filterSt, filterBatch, hvMin, hvMax, aiOnly, sortKey]);

  useEffect(() => { setPage(1); }, [q, filterCat, filterSt, filterBatch, hvMin, hvMax, aiOnly]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const slice = filtered.slice((page-1)*pageSize, page*pageSize);

  const toggleSelect = (id: string) => setSelected(prev => { const s=new Set(prev); s.has(id)?s.delete(id):s.add(id); return s; });
  const toggleAll = (checked: boolean) => setSelected(checked ? new Set(slice.map(r=>r.id)) : new Set());

  const activeTags = [
    q && { label:`"${q}"`, clear:()=>setQ('') },
    filterCat && { label:filterCat, clear:()=>setFilterCat('') },
    filterSt && { label:filterSt, clear:()=>setFilterSt('') },
    filterBatch && { label:`B:${filterBatch}`, clear:()=>setFilterBatch('') },
    (hvMin||hvMax) && { label:`HV:${hvMin||'*'}〜${hvMax||'*'}`, clear:()=>{setHvMin('');setHvMax('');} },
    aiOnly && { label:'AI検出のみ', clear:()=>setAiOnly(false) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div className="flex flex-col gap-4 min-w-0">
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} db={db} filtered={filtered} />
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="削除の確認" footer={
        <>
          <Button variant="default" onClick={() => setDeleteTarget(null)}>キャンセル</Button>
          <Button variant="danger" onClick={() => { dispatch({type:'DELETE',id:deleteTarget!}); setDeleteTarget(null); addToast('削除しました'); }}>削除する</Button>
        </>
      }>
        <p>このデータを削除します。この操作は元に戻せません。</p>
      </Modal>

      <DataDisclaimer />
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="ptitle text-[19px] font-bold tracking-tight">材料データ一覧</h1>
          <p className="text-[12px] text-text-lo mt-0.5">{filtered.length}件 (DB: {db.length}件)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" size="sm" onClick={() => setExportOpen(true)}><Icon name="download" size={13} />エクスポート</Button>
          <Button variant="primary" size="sm" onClick={() => onNav('new')}><Icon name="plus" size={13} />登録</Button>
        </div>
      </div>

      <Card className="p-3">
        <div className="flex gap-2 flex-wrap items-center">
          <SearchBox value={q} onChange={setQ} placeholder="名称・ID・組成・備考で全文検索..." className="min-w-48 flex-1" />
          <Select value={filterCat} onChange={e=>setFilterCat(e.target.value)} className="min-w-[120px]">
            <option value="">全カテゴリ</option>
            {['金属合金','セラミクス','ポリマー','複合材料'].map(c=><option key={c}>{c}</option>)}
          </Select>
          <Select value={filterSt} onChange={e=>setFilterSt(e.target.value)} className="min-w-[120px]">
            <option value="">全ステータス</option>
            {['登録済','レビュー待','承認済','要修正'].map(s=><option key={s}>{s}</option>)}
          </Select>
          <Select value={filterBatch} onChange={e=>setFilterBatch(e.target.value)}>
            <option value="">全バッチ</option>
            {['B-038','B-037','B-036','B-035'].map(b=><option key={b}>{b}</option>)}
          </Select>
          <Button variant="ghost" size="sm" onClick={() => setAdvOpen(v=>!v)}>
            <Icon name="filter" size={12} />{advOpen?'詳細を閉じる':'詳細条件'}
          </Button>
          {activeTags.length > 0 && <Button variant="ghost" size="sm" onClick={() => { setQ('');setFilterCat('');setFilterSt('');setFilterBatch('');setHvMin('');setHvMax('');setAiOnly(false); }}><Icon name="close" size={11} />クリア</Button>}
        </div>
        {advOpen && (
          <div className="flex gap-3 flex-wrap items-center mt-2.5 pt-2.5 border-t border-[var(--border-faint)]">
            <div className="flex items-center gap-1.5 text-[12px] text-text-md">
              <span>硬度 HV</span>
              <input type="number" value={hvMin} onChange={e=>setHvMin(e.target.value)} placeholder="最小" className="w-16 px-2 py-1 border border-[var(--border-default)] rounded text-[12px] bg-raised text-text-hi outline-none focus:border-[var(--accent-mid)]" />
              <span>〜</span>
              <input type="number" value={hvMax} onChange={e=>setHvMax(e.target.value)} placeholder="最大" className="w-16 px-2 py-1 border border-[var(--border-default)] rounded text-[12px] bg-raised text-text-hi outline-none focus:border-[var(--accent-mid)]" />
            </div>
            <label className="flex items-center gap-1.5 text-[12px] text-text-md cursor-pointer">
              <Checkbox checked={aiOnly} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setAiOnly(e.target.checked)} />AI検出のみ
            </label>
          </div>
        )}
        {activeTags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-2 pt-2 border-t border-[var(--border-faint)]">
            {activeTags.map((tag,i) => <FilterChip key={i} label={tag.label} onRemove={tag.clear} />)}
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-raised border-b border-[var(--border-faint)]">
          <span className="text-[12px] font-semibold text-text-md">{filtered.length === db.length ? '全件表示' : `フィルタ: ${filtered.length}件`}</span>
          {selected.size > 0 && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-[12px] text-text-md">{selected.size}件選択中</span>
              <Button variant="default" size="xs" onClick={() => { dispatch({type:'BULK_APPROVE',ids:selected}); setSelected(new Set()); addToast('一括承認しました'); }}>
                <Icon name="check" size={11} />承認
              </Button>
              <Button variant="danger" size="xs" onClick={() => { dispatch({type:'BULK_DELETE',ids:selected}); setSelected(new Set()); addToast('削除しました'); }}>
                <Icon name="trash" size={11} />削除
              </Button>
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Select value={sortKey} onChange={e=>setSortKey(e.target.value)} className="text-[12px] py-1">
              {[['id-desc','ID降順'],['id-asc','ID昇順'],['hv-desc','硬度高'],['hv-asc','硬度低'],['dt-desc','日付新'],['nm-asc','名称']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </Select>
            <div className="flex bg-raised rounded-md border border-[var(--border-faint)] p-0.5">
              {([['table', 'list'], ['card', 'dashboard'], ['compact', 'sort']] as const).map(([mode, icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`p-1.5 rounded transition-colors ${viewMode === mode ? 'bg-accent-dim text-accent' : 'text-text-lo hover:text-text-md'}`}
                  title={mode === 'table' ? 'テーブル表示' : mode === 'card' ? 'カード表示' : 'コンパクト表示'}>
                  <Icon name={icon} size={13} />
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* === Table view === */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] min-w-[860px]">
              <colgroup>
                <col style={{width:'36px'}}/><col style={{width:'80px'}}/><col /><col style={{width:'80px'}}/>
                <col style={{width:'68px'}}/><col style={{width:'110px'}}/><col style={{width:'80px'}}/>
                <col style={{width:'72px'}}/><col style={{width:'40px'}}/><col style={{width:'72px'}}/>
              </colgroup>
              <thead>
                <tr className="bg-raised">
                  <th className="border-b border-[var(--border-faint)]">
                    <label className="flex items-center justify-center p-2.5 cursor-pointer"><Checkbox checked={slice.length>0&&slice.every(r=>selected.has(r.id))} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>toggleAll(e.target.checked)} aria-label="全選択" /></label>
                  </th>
                  {[['ID','font-mono'],['材料名称',''],['カテゴリ',''],['硬度 HV',''],['組成',''],['登録日',''],['ステータス',''],['AI','text-center'],['操作','text-center']].map(([l,cls])=>(
                    <th key={l} className={`px-3.5 py-2.5 text-left text-[11px] font-bold text-text-lo tracking-[.05em] uppercase border-b border-[var(--border-faint)] ${cls}`}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slice.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-10 text-text-lo"><Icon name="info" size={24} className="mx-auto mb-2 opacity-30" /><div>該当データなし</div></td></tr>
                ) : slice.map(r => (
                  <tr key={r.id} className={`border-b border-[var(--border-faint)] last:border-b-0 cursor-pointer transition-colors duration-75 ${selected.has(r.id) ? 'bg-accent-dim' : 'hover:bg-hover'}`} onClick={e => { if((e.target as HTMLElement).tagName==='BUTTON'||(e.target as HTMLElement).tagName==='INPUT') return; onDetail(r.id); }}>
                    <td onClick={e=>e.stopPropagation()}><label className="flex items-center justify-center p-2.5 cursor-pointer"><Checkbox checked={selected.has(r.id)} onChange={()=>toggleSelect(r.id)} /></label></td>
                    <td className="px-3.5 py-2.5"><span className="font-mono text-[12px] text-text-lo"><Hl text={r.id} query={q} /></span></td>
                    <td className="px-3.5 py-2.5"><span className="font-semibold"><Hl text={r.name} query={q} /></span></td>
                    <td className="px-3.5 py-2.5"><Badge variant="gray">{r.cat}</Badge></td>
                    <td className="px-3.5 py-2.5 font-mono">{r.hv.toLocaleString()}</td>
                    <td className="px-3.5 py-2.5"><span className="font-mono text-[12px] block truncate text-text-md"><Hl text={r.comp} query={q} /></span></td>
                    <td className="px-3.5 py-2.5 text-[12px] text-text-lo">{r.date}</td>
                    <td className="px-3.5 py-2.5"><Badge>{r.status}</Badge></td>
                    <td className="px-3.5 py-2.5 text-center">{r.ai && <Badge variant="ai">検出</Badge>}</td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex gap-1 justify-center" onClick={e=>e.stopPropagation()}>
                        <Tooltip label="詳細を見る" placement="top"><Button variant="default" size="xs" onClick={() => onDetail(r.id)} aria-label="詳細"><Icon name="info" size={11} /></Button></Tooltip>
                        <Tooltip label="編集する" placement="top"><Button variant="default" size="xs" onClick={() => onNav('edit_'+r.id)} aria-label="編集"><Icon name="edit" size={11} /></Button></Tooltip>
                        <Tooltip label="削除する" placement="top"><Button variant="danger" size="xs" onClick={() => setDeleteTarget(r.id)} aria-label="削除"><Icon name="trash" size={11} /></Button></Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* === Card view === */}
        {viewMode === 'card' && (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-3">
            {slice.length === 0 ? (
              <div className="col-span-full text-center py-10 text-text-lo"><Icon name="info" size={24} className="mx-auto mb-2 opacity-30" /><div>該当データなし</div></div>
            ) : slice.map(r => (
              <button key={r.id} onClick={() => onDetail(r.id)}
                className="group flex flex-col bg-surface border border-[var(--border-faint)] rounded-lg overflow-hidden hover:border-accent hover:shadow-md transition-all text-left">
                <div className="flex items-center justify-center p-3 bg-sunken">
                  <MaterialVisual name={r.name} cat={r.cat} hv={r.hv} size={80} />
                </div>
                <div className="p-3 flex flex-col gap-1 flex-1">
                  <div className="text-[10px] font-mono text-text-lo"><Hl text={r.id} query={q} /></div>
                  <div className="text-[13px] font-bold text-text-hi group-hover:text-accent transition-colors leading-tight"><Hl text={r.name} query={q} /></div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <Badge variant="gray">{r.cat}</Badge>
                    <Badge>{r.status}</Badge>
                    {r.ai && <Badge variant="ai">AI</Badge>}
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-2 text-[10px]">
                    <div><span className="text-text-lo">硬度</span><div className="font-mono font-bold">{r.hv.toLocaleString()}</div></div>
                    <div><span className="text-text-lo">引張</span><div className="font-mono font-bold">{r.ts.toLocaleString()}</div></div>
                    <div><span className="text-text-lo">弾性</span><div className="font-mono font-bold">{r.el}</div></div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* === Compact list view === */}
        {viewMode === 'compact' && (
          <div className="flex flex-col">
            {slice.length === 0 ? (
              <div className="text-center py-10 text-text-lo"><Icon name="info" size={24} className="mx-auto mb-2 opacity-30" /><div>該当データなし</div></div>
            ) : slice.map(r => (
              <button key={r.id} onClick={() => onDetail(r.id)}
                className="group flex items-center gap-3 px-4 py-2.5 border-b border-[var(--border-faint)] last:border-b-0 hover:bg-hover transition-colors text-left">
                <MaterialVisual name={r.name} cat={r.cat} hv={r.hv} size={36} className="flex-shrink-0" />
                <span className="font-mono text-[11px] text-text-lo w-16 flex-shrink-0"><Hl text={r.id} query={q} /></span>
                <span className="text-[13px] font-semibold text-text-hi group-hover:text-accent flex-1 truncate"><Hl text={r.name} query={q} /></span>
                <Badge variant="gray">{r.cat}</Badge>
                <span className="font-mono text-[12px] text-text-md w-16 text-right flex-shrink-0">{r.hv.toLocaleString()} HV</span>
                <Badge>{r.status}</Badge>
                {r.ai && <Badge variant="ai">AI</Badge>}
                <Icon name="chevronRight" size={12} className="text-text-lo group-hover:text-accent flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-2.5 bg-raised border-t border-[var(--border-faint)]">
          <span className="text-[12px] text-text-lo">{(page-1)*pageSize+1}–{Math.min(page*pageSize,filtered.length)} / {filtered.length}件</span>
          <div className="flex items-center gap-1">
            <Button variant="default" size="xs" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}><Icon name="chevronLeft" size={10} /></Button>
            {Array.from({length:Math.min(totalPages,5)},(_,i)=>{
              let p = i+1;
              if(totalPages>5){
                if(page<=3) p=i+1;
                else if(page>=totalPages-2) p=totalPages-4+i;
                else p=page-2+i;
              }
              return <Button key={p} variant={p===page?'primary':'default'} size="xs" onClick={()=>setPage(p)}>{p}</Button>;
            })}
            <Button variant="default" size="xs" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}><Icon name="chevronRight" size={10} /></Button>
            <Select value={pageSize} onChange={e=>{setPageSize(parseInt(e.target.value));setPage(1);}} className="text-[12px] py-1 ml-2">
              {[10,25,50].map(n=><option key={n} value={n}>{n}件</option>)}
            </Select>
          </div>
        </div>
      </Card>
    </div>
  );
};
