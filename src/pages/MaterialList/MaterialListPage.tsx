import { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { Icon } from '../../components/Icon';
import { DataDisclaimer } from '../../components/DataDisclaimer';
import { MaterialVisual } from '../../components/MaterialVisual';
import { Tooltip } from '../../components/Tooltip';
import { Button, Badge, Card, Input, Select, Checkbox } from '../../components/atoms';
import { Modal, SearchBox, FilterChip, ExportModal, ImportModal } from '../../components/molecules';
import { AppCtx } from '../../context/AppContext';
import type { Material, MaterialCategory, Provenance, AppContextValue, MaterialWithScore } from '../../types';

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

// ─── Saved Query (Preset) ────────────────────────────────────────────────

interface SavedQuery {
  id: string;
  name: string;
  filters: FilterState;
}

interface FilterState {
  q: string;
  cats: string[];
  statuses: string[];
  batches: string[];
  provenances: string[];
  hvMin: string;
  hvMax: string;
  tsMin: string;
  tsMax: string;
  elMin: string;
  elMax: string;
  dnMin: string;
  dnMax: string;
  aiOnly: boolean;
}

const EMPTY_FILTERS: FilterState = {
  q: '', cats: [], statuses: [], batches: [], provenances: [],
  hvMin: '', hvMax: '', tsMin: '', tsMax: '', elMin: '', elMax: '', dnMin: '', dnMax: '',
  aiOnly: false,
};

const DEFAULT_PRESETS: SavedQuery[] = [
  { id: 'p-metal-approved', name: '承認済み金属合金', filters: { ...EMPTY_FILTERS, cats: ['金属合金'], statuses: ['承認済'] } },
  { id: 'p-high-hardness', name: '高硬度材 (HV≥500)', filters: { ...EMPTY_FILTERS, hvMin: '500' } },
  { id: 'p-review-pending', name: 'レビュー待ち', filters: { ...EMPTY_FILTERS, statuses: ['レビュー待'] } },
  { id: 'p-composite-cfrp', name: '複合材料 (CFRP系)', filters: { ...EMPTY_FILTERS, cats: ['複合材料'], q: 'CFRP' } },
];

const STORAGE_KEY = 'matlens-saved-queries';

const loadSavedQueries = (): SavedQuery[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? [...DEFAULT_PRESETS, ...JSON.parse(raw)] : DEFAULT_PRESETS;
  } catch { return DEFAULT_PRESETS; }
};

const persistCustomQueries = (queries: SavedQuery[]) => {
  const custom = queries.filter(q => !q.id.startsWith('p-'));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(custom));
};

// ─── Facet count helper ──────────────────────────────────────────────────

interface FacetCounts {
  cats: Record<string, number>;
  statuses: Record<string, number>;
  batches: Record<string, number>;
  provenances: Record<string, number>;
}

const computeFacets = (rows: Material[]): FacetCounts => {
  const counts: FacetCounts = { cats: {}, statuses: {}, batches: {}, provenances: {} };
  for (const r of rows) {
    counts.cats[r.cat] = (counts.cats[r.cat] || 0) + 1;
    counts.statuses[r.status] = (counts.statuses[r.status] || 0) + 1;
    counts.batches[r.batch] = (counts.batches[r.batch] || 0) + 1;
    if (r.provenance) counts.provenances[r.provenance] = (counts.provenances[r.provenance] || 0) + 1;
  }
  return counts;
};

// ─── Multi-select chip group ─────────────────────────────────────────────

interface FacetGroupProps {
  label: string;
  options: string[];
  selected: string[];
  counts: Record<string, number>;
  onChange: (values: string[]) => void;
  displayMap?: Record<string, string>;
}

const FacetGroup = ({ label, options, selected, counts, onChange, displayMap }: FacetGroupProps) => {
  const toggle = (val: string) => {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  };
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] font-semibold text-text-lo">{label}</span>
      <div className="flex gap-1 flex-wrap">
        {options.map(opt => {
          const active = selected.includes(opt);
          const count = counts[opt] || 0;
          const display = displayMap?.[opt] || opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`
                inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-medium
                transition-all duration-150 border select-none
                ${active
                  ? 'bg-accent-dim text-accent border-accent'
                  : 'bg-raised text-text-md border-[var(--border-faint)] hover:border-[var(--border-default)]'
                }
              `}
            >
              {display}
              <span className={`text-[10px] ${active ? 'text-accent opacity-70' : 'text-text-lo'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─── Range filter ────────────────────────────────────────────────────────

interface RangeFilterProps {
  label: string;
  unit: string;
  min: string;
  max: string;
  onMinChange: (v: string) => void;
  onMaxChange: (v: string) => void;
}

const RangeFilter = ({ label, unit, min, max, onMinChange, onMaxChange }: RangeFilterProps) => (
  <div className="flex items-center gap-1.5 text-[12px] text-text-md">
    <span className="w-14 flex-shrink-0">{label}</span>
    <input type="number" value={min} onChange={e => onMinChange(e.target.value)} placeholder="min"
      className="w-16 px-2 py-1 border border-[var(--border-default)] rounded text-[12px] bg-raised text-text-hi outline-none focus:border-[var(--accent-mid)]" />
    <span>〜</span>
    <input type="number" value={max} onChange={e => onMaxChange(e.target.value)} placeholder="max"
      className="w-16 px-2 py-1 border border-[var(--border-default)] rounded text-[12px] bg-raised text-text-hi outline-none focus:border-[var(--accent-mid)]" />
    <span className="text-text-lo text-[10px]">{unit}</span>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────

export const MaterialListPage = ({ db, dispatch, onNav, onDetail, search }: MaterialListPageProps) => {
  const [filters, setFilters] = useState<FilterState>({ ...EMPTY_FILTERS });
  const [sortKey, setSortKey] = useState('id-desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [advOpen, setAdvOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card' | 'compact'>('table');
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>(loadSavedQueries);
  const [presetOpen, setPresetOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const { addToast } = useContext(AppCtx) as AppContextValue;

  const setF = useCallback(<K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // ─── Facet counts (computed on full DB) ────────────────────────────────
  const facets = useMemo(() => computeFacets(db), [db]);

  // ─── Unique values for facet groups ────────────────────────────────────
  const allBatches = useMemo(() => [...new Set(db.map(r => r.batch))].sort(), [db]);
  const allProvenances = useMemo(() => [...new Set(db.map(r => r.provenance).filter(Boolean))] as string[], [db]);

  const PROVENANCE_LABELS: Record<string, string> = {
    instrument: '装置計測', manual: '手入力', ai: 'AI推定', simulation: 'シミュレーション',
  };

  // ─── Filtering ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const { q, cats, statuses, batches, provenances, hvMin, hvMax, tsMin, tsMax, elMin, elMax, dnMin, dnMax, aiOnly } = filters;
    const rows = db.filter(r => {
      if (q && !`${r.id} ${r.name} ${r.comp} ${r.memo} ${r.author}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (cats.length > 0 && !cats.includes(r.cat)) return false;
      if (statuses.length > 0 && !statuses.includes(r.status)) return false;
      if (batches.length > 0 && !batches.includes(r.batch)) return false;
      if (provenances.length > 0 && (!r.provenance || !provenances.includes(r.provenance))) return false;
      if (hvMin && r.hv < parseFloat(hvMin)) return false;
      if (hvMax && r.hv > parseFloat(hvMax)) return false;
      if (tsMin && r.ts < parseFloat(tsMin)) return false;
      if (tsMax && r.ts > parseFloat(tsMax)) return false;
      if (elMin && r.el < parseFloat(elMin)) return false;
      if (elMax && r.el > parseFloat(elMax)) return false;
      if (dnMin && r.dn < parseFloat(dnMin)) return false;
      if (dnMax && r.dn > parseFloat(dnMax)) return false;
      if (aiOnly && !r.ai) return false;
      return true;
    });
    rows.sort((a, b) => {
      switch (sortKey) {
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
  }, [db, filters, sortKey]);

  useEffect(() => { setPage(1); }, [filters]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize);

  const toggleSelect = (id: string) => setSelected(prev => {
    const s = new Set(prev);
    if (s.has(id)) s.delete(id); else s.add(id);
    return s;
  });
  const toggleAll = (checked: boolean) => setSelected(checked ? new Set(slice.map(r => r.id)) : new Set());

  const clearAll = () => setFilters({ ...EMPTY_FILTERS });

  const hasActiveFilters = filters.q || filters.cats.length || filters.statuses.length || filters.batches.length || filters.provenances.length || filters.hvMin || filters.hvMax || filters.tsMin || filters.tsMax || filters.elMin || filters.elMax || filters.dnMin || filters.dnMax || filters.aiOnly;

  // ─── Active tags ───────────────────────────────────────────────────────
  const activeTags = [
    filters.q && { label: `"${filters.q}"`, clear: () => setF('q', '') },
    ...filters.cats.map(c => ({ label: c, clear: () => setF('cats', filters.cats.filter(x => x !== c)) })),
    ...filters.statuses.map(s => ({ label: s, clear: () => setF('statuses', filters.statuses.filter(x => x !== s)) })),
    ...filters.batches.map(b => ({ label: `B:${b}`, clear: () => setF('batches', filters.batches.filter(x => x !== b)) })),
    ...filters.provenances.map(p => ({ label: PROVENANCE_LABELS[p] || p, clear: () => setF('provenances', filters.provenances.filter(x => x !== p)) })),
    (filters.hvMin || filters.hvMax) && { label: `HV:${filters.hvMin || '*'}〜${filters.hvMax || '*'}`, clear: () => { setF('hvMin', ''); setF('hvMax', ''); } },
    (filters.tsMin || filters.tsMax) && { label: `MPa:${filters.tsMin || '*'}〜${filters.tsMax || '*'}`, clear: () => { setF('tsMin', ''); setF('tsMax', ''); } },
    (filters.elMin || filters.elMax) && { label: `GPa:${filters.elMin || '*'}〜${filters.elMax || '*'}`, clear: () => { setF('elMin', ''); setF('elMax', ''); } },
    (filters.dnMin || filters.dnMax) && { label: `密度:${filters.dnMin || '*'}〜${filters.dnMax || '*'}`, clear: () => { setF('dnMin', ''); setF('dnMax', ''); } },
    filters.aiOnly && { label: 'AI検出のみ', clear: () => setF('aiOnly', false) },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  // ─── Saved queries ─────────────────────────────────────────────────────
  const saveCurrentQuery = () => {
    if (!saveName.trim()) return;
    const newQuery: SavedQuery = { id: `u-${Date.now()}`, name: saveName.trim(), filters: { ...filters } };
    const updated = [...savedQueries, newQuery];
    setSavedQueries(updated);
    persistCustomQueries(updated);
    setSaveName('');
    addToast(`"${newQuery.name}" を保存しました`);
  };

  const loadQuery = (query: SavedQuery) => {
    setFilters({ ...query.filters });
    setPresetOpen(false);
    addToast(`"${query.name}" を適用`);
  };

  const deleteQuery = (id: string) => {
    const updated = savedQueries.filter(q => q.id !== id);
    setSavedQueries(updated);
    persistCustomQueries(updated);
  };

  return (
    <div className="flex flex-col gap-4 min-w-0">
      <ExportModal open={exportOpen} onClose={() => setExportOpen(false)} db={db} filtered={filtered} />
      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={(records) => {
          const existing = new Set(db.map(r => r.id));
          const fresh = records.filter(r => r.id && !existing.has(r.id));
          if (fresh.length === 0) { addToast('取り込めるデータがありません（ID が既に存在します）', 'warn'); return; }
          dispatch({ type: 'IMPORT', records: fresh });
          addToast(`${fresh.length}件を取り込みました`);
        }}
      />
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="削除の確認" footer={
        <>
          <Button variant="default" onClick={() => setDeleteTarget(null)}>キャンセル</Button>
          <Button variant="danger" onClick={() => { dispatch({ type: 'DELETE', id: deleteTarget! }); setDeleteTarget(null); addToast('削除しました'); }}>削除する</Button>
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
          <Button variant="default" size="sm" onClick={() => setImportOpen(true)} title="MaiML / JSON ファイルをインポート"><Icon name="upload" size={13} />インポート</Button>
          <Button variant="default" size="sm" onClick={() => setExportOpen(true)}><Icon name="download" size={13} />エクスポート</Button>
          <Button variant="primary" size="sm" onClick={() => onNav('new')}><Icon name="plus" size={13} />登録</Button>
        </div>
      </div>

      {/* ─── Search & Filter Panel ─────────────────────────────────────── */}
      <Card className="p-3">
        <div className="flex gap-2 flex-wrap items-center">
          <SearchBox value={filters.q} onChange={v => setF('q', v)} placeholder="名称・ID・組成・備考で全文検索..." className="min-w-48 flex-1" />
          <Button variant={presetOpen ? 'primary' : 'outline'} size="sm" onClick={() => setPresetOpen(v => !v)}>
            <Icon name="report" size={12} />プリセット
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAdvOpen(v => !v)}>
            <Icon name="filter" size={12} />{advOpen ? '詳細を閉じる' : '詳細条件'}
          </Button>
          {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearAll}><Icon name="close" size={11} />クリア</Button>}
        </div>

        {/* ─── Preset panel ───────────────────────────────────────────── */}
        {presetOpen && (
          <div className="mt-2.5 pt-2.5 border-t border-[var(--border-faint)]">
            <div className="flex gap-1.5 flex-wrap mb-2">
              {savedQueries.map(sq => (
                <div key={sq.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] bg-raised border border-[var(--border-faint)] hover:border-accent transition-colors">
                  <button type="button" onClick={() => loadQuery(sq)} className="hover:text-accent">{sq.name}</button>
                  {!sq.id.startsWith('p-') && (
                    <button type="button" onClick={() => deleteQuery(sq.id)} className="text-text-lo hover:text-err ml-0.5" aria-label={`${sq.name} を削除`}>
                      <Icon name="close" size={8} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-center">
              <Input value={saveName} onChange={e => setSaveName(e.target.value)} placeholder="現在のフィルタを保存..." className="flex-1 text-[12px] py-1" />
              <Button variant="default" size="xs" onClick={saveCurrentQuery} disabled={!saveName.trim()}>保存</Button>
            </div>
          </div>
        )}

        {/* ─── Faceted filter panel ───────────────────────────────────── */}
        {advOpen && (
          <div className="mt-2.5 pt-2.5 border-t border-[var(--border-faint)] flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <FacetGroup label="カテゴリ" options={['金属合金', 'セラミクス', 'ポリマー', '複合材料']}
                selected={filters.cats} counts={facets.cats} onChange={v => setF('cats', v)} />
              <FacetGroup label="ステータス" options={['登録済', 'レビュー待', '承認済', '要修正']}
                selected={filters.statuses} counts={facets.statuses} onChange={v => setF('statuses', v)} />
            </div>
            {allBatches.length > 0 && (
              <FacetGroup label="バッチ" options={allBatches}
                selected={filters.batches} counts={facets.batches} onChange={v => setF('batches', v)} />
            )}
            {allProvenances.length > 0 && (
              <FacetGroup label="データ出所" options={allProvenances}
                selected={filters.provenances} counts={facets.provenances} onChange={v => setF('provenances', v)}
                displayMap={PROVENANCE_LABELS} />
            )}
            <div className="grid grid-cols-2 gap-2">
              <RangeFilter label="硬度 HV" unit="HV" min={filters.hvMin} max={filters.hvMax}
                onMinChange={v => setF('hvMin', v)} onMaxChange={v => setF('hvMax', v)} />
              <RangeFilter label="引張強さ" unit="MPa" min={filters.tsMin} max={filters.tsMax}
                onMinChange={v => setF('tsMin', v)} onMaxChange={v => setF('tsMax', v)} />
              <RangeFilter label="弾性率" unit="GPa" min={filters.elMin} max={filters.elMax}
                onMinChange={v => setF('elMin', v)} onMaxChange={v => setF('elMax', v)} />
              <RangeFilter label="密度" unit="g/cm³" min={filters.dnMin} max={filters.dnMax}
                onMinChange={v => setF('dnMin', v)} onMaxChange={v => setF('dnMax', v)} />
            </div>
            <label className="flex items-center gap-1.5 text-[12px] text-text-md cursor-pointer">
              <Checkbox checked={filters.aiOnly} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setF('aiOnly', e.target.checked)} />AI検出のみ
            </label>
          </div>
        )}

        {/* ─── Active filter tags ─────────────────────────────────────── */}
        {activeTags.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-2 pt-2 border-t border-[var(--border-faint)]">
            {activeTags.map((tag, i) => <FilterChip key={i} label={tag.label} onRemove={tag.clear} />)}
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-raised border-b border-[var(--border-faint)]">
          <span className="text-[12px] font-semibold text-text-md">{filtered.length === db.length ? '全件表示' : `フィルタ: ${filtered.length}件`}</span>
          {selected.size > 0 && (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-[12px] text-text-md">{selected.size}件選択中</span>
              <Button variant="default" size="xs" onClick={() => { dispatch({ type: 'BULK_APPROVE', ids: selected }); setSelected(new Set()); addToast('一括承認しました'); }}>
                <Icon name="check" size={11} />承認
              </Button>
              <Button variant="danger" size="xs" onClick={() => { dispatch({ type: 'BULK_DELETE', ids: selected }); setSelected(new Set()); addToast('削除しました'); }}>
                <Icon name="trash" size={11} />削除
              </Button>
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Select aria-label="並び順" value={sortKey} onChange={e => setSortKey(e.target.value)} className="text-[12px] py-1">
              {[['id-desc', 'ID降順'], ['id-asc', 'ID昇順'], ['hv-desc', '硬度高'], ['hv-asc', '硬度低'], ['dt-desc', '日付新'], ['nm-asc', '名称']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
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
                <col style={{ width: '36px' }} /><col style={{ width: '80px' }} /><col /><col style={{ width: '80px' }} />
                <col style={{ width: '68px' }} /><col style={{ width: '110px' }} /><col style={{ width: '80px' }} />
                <col style={{ width: '72px' }} /><col style={{ width: '40px' }} /><col style={{ width: '72px' }} />
              </colgroup>
              <thead>
                <tr className="bg-raised">
                  <th className="border-b border-[var(--border-faint)]">
                    <label className="flex items-center justify-center p-2.5 cursor-pointer"><Checkbox checked={slice.length > 0 && slice.every(r => selected.has(r.id))} onChange={(e: React.ChangeEvent<HTMLInputElement>) => toggleAll(e.target.checked)} aria-label="全選択" /></label>
                  </th>
                  {[['ID', ''], ['材料名称', ''], ['カテゴリ', ''], ['硬度 HV', ''], ['組成', ''], ['登録日', ''], ['ステータス', ''], ['AI', 'text-center'], ['操作', 'text-center']].map(([l, cls]) => (
                    <th key={l} className={`px-3.5 py-2.5 text-left text-[11px] font-bold text-text-lo tracking-[.05em] uppercase border-b border-[var(--border-faint)] ${cls}`}>{l}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slice.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-10 text-text-lo"><Icon name="info" size={24} className="mx-auto mb-2 opacity-30" /><div>該当データなし</div></td></tr>
                ) : slice.map(r => (
                  <tr key={r.id} className={`border-b border-[var(--border-faint)] last:border-b-0 cursor-pointer transition-colors duration-75 ${selected.has(r.id) ? 'bg-accent-dim' : 'hover:bg-hover'}`} onClick={e => { if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'INPUT') return; onDetail(r.id); }}>
                    <td onClick={e => e.stopPropagation()}><label className="flex items-center justify-center p-2.5 cursor-pointer"><Checkbox checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} aria-label={`${r.name} を選択`} /></label></td>
                    <td className="px-3.5 py-2.5"><span className="text-[12px] text-text-lo tabular-nums"><Hl text={r.id} query={filters.q} /></span></td>
                    <td className="px-3.5 py-2.5"><span className="font-semibold"><Hl text={r.name} query={filters.q} /></span></td>
                    <td className="px-3.5 py-2.5"><Badge variant="gray">{r.cat}</Badge></td>
                    <td className="px-3.5 py-2.5 tabular-nums">{r.hv.toLocaleString()}</td>
                    <td className="px-3.5 py-2.5"><span className="text-[12px] block truncate text-text-md"><Hl text={r.comp} query={filters.q} /></span></td>
                    <td className="px-3.5 py-2.5 text-[12px] text-text-lo">{r.date}</td>
                    <td className="px-3.5 py-2.5"><Badge>{r.status}</Badge></td>
                    <td className="px-3.5 py-2.5 text-center">{r.ai && <Badge variant="ai">検出</Badge>}</td>
                    <td className="px-3.5 py-2.5">
                      <div className="flex gap-1 justify-center" onClick={e => e.stopPropagation()}>
                        <Tooltip label="詳細を見る" placement="top"><Button variant="default" size="xs" onClick={() => onDetail(r.id)} aria-label="詳細"><Icon name="info" size={11} /></Button></Tooltip>
                        <Tooltip label="編集する" placement="top"><Button variant="default" size="xs" onClick={() => onNav('edit_' + r.id)} aria-label="編集"><Icon name="edit" size={11} /></Button></Tooltip>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 p-3">
            {slice.length === 0 ? (
              <div className="col-span-full text-center py-10 text-text-lo"><Icon name="info" size={24} className="mx-auto mb-2 opacity-30" /><div>該当データなし</div></div>
            ) : slice.map(r => (
              <button key={r.id} onClick={() => onDetail(r.id)}
                className="group flex flex-col bg-surface border border-[var(--border-faint)] rounded-lg overflow-hidden hover:border-accent hover:shadow-md transition-all text-left">
                <div className="flex items-center justify-center p-3 bg-sunken">
                  <MaterialVisual name={r.name} cat={r.cat} hv={r.hv} size={80} />
                </div>
                <div className="p-3 flex flex-col gap-1 flex-1">
                  <div className="text-[10px] text-text-lo tabular-nums"><Hl text={r.id} query={filters.q} /></div>
                  <div className="text-[13px] font-bold text-text-hi group-hover:text-accent transition-colors leading-tight"><Hl text={r.name} query={filters.q} /></div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <Badge variant="gray">{r.cat}</Badge>
                    <Badge>{r.status}</Badge>
                    {r.ai && <Badge variant="ai">AI</Badge>}
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-2 text-[10px]">
                    <div><span className="text-text-lo">硬度</span><div className="font-bold tabular-nums">{r.hv.toLocaleString()}</div></div>
                    <div><span className="text-text-lo">引張</span><div className="font-bold tabular-nums">{r.ts.toLocaleString()}</div></div>
                    <div><span className="text-text-lo">弾性</span><div className="font-bold tabular-nums">{r.el}</div></div>
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
                <span className="text-[11px] tabular-nums text-text-lo w-16 flex-shrink-0"><Hl text={r.id} query={filters.q} /></span>
                <span className="text-[13px] font-semibold text-text-hi group-hover:text-accent flex-1 truncate"><Hl text={r.name} query={filters.q} /></span>
                <Badge variant="gray">{r.cat}</Badge>
                <span className="text-[12px] text-text-md tabular-nums w-16 text-right flex-shrink-0">{r.hv.toLocaleString()} HV</span>
                <Badge>{r.status}</Badge>
                {r.ai && <Badge variant="ai">AI</Badge>}
                <Icon name="chevronRight" size={12} className="text-text-lo group-hover:text-accent flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-2.5 bg-raised border-t border-[var(--border-faint)]">
          <span className="text-[12px] text-text-lo">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} / {filtered.length}件</span>
          <div className="flex items-center gap-1">
            <Button variant="default" size="xs" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} aria-label="前のページ"><Icon name="chevronLeft" size={10} /></Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let p = i + 1;
              if (totalPages > 5) {
                if (page <= 3) p = i + 1;
                else if (page >= totalPages - 2) p = totalPages - 4 + i;
                else p = page - 2 + i;
              }
              return <Button key={p} variant={p === page ? 'primary' : 'default'} size="xs" onClick={() => setPage(p)}>{p}</Button>;
            })}
            <Button variant="default" size="xs" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} aria-label="次のページ"><Icon name="chevronRight" size={10} /></Button>
            <Select aria-label="1ページあたりの件数" value={pageSize} onChange={e => { setPageSize(parseInt(e.target.value)); setPage(1); }} className="text-[12px] py-1 ml-2">
              {[10, 25, 50].map(n => <option key={n} value={n}>{n}件</option>)}
            </Select>
          </div>
        </div>
      </Card>
    </div>
  );
};
