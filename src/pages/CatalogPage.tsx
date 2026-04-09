import { useState, useMemo } from 'react';
import { Icon } from '../components/Icon';
import { Button, Badge, Card, Select } from '../components/atoms';
import { SearchBox } from '../components/molecules';
import { MaterialVisual } from '../components/MaterialVisual';
import type { Material } from '../types';

interface CatalogPageProps {
  db: Material[];
  onNav: (page: string) => void;
  onDetail: (id: string) => void;
}

const CAT_COLORS: Record<string, string> = {
  '金属合金': 'text-accent',
  'セラミクス': 'text-warn',
  'ポリマー': 'text-ok',
  '複合材料': 'text-ai',
};

export const CatalogPage = ({ db, onNav, onDetail }: CatalogPageProps) => {
  const [q, setQ] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    return db.filter(r => {
      if (q && !`${r.id} ${r.name} ${r.comp} ${r.memo || ''}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (filterCat && r.cat !== filterCat) return false;
      return true;
    });
  }, [db, q, filterCat]);

  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    db.forEach(r => { counts[r.cat] = (counts[r.cat] || 0) + 1; });
    return counts;
  }, [db]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="ptitle text-[19px] font-bold tracking-tight flex items-center gap-2">
            材料カタログ <Badge variant="vec">3D</Badge>
          </h1>
          <p className="text-[12px] text-text-lo mt-0.5">
            {filtered.length}種の材料を3Dビジュアルで閲覧 — 物性値に応じて質感・形状が変化します
          </p>
        </div>
      </div>

      {/* Category summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {['金属合金', 'セラミクス', 'ポリマー', '複合材料'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(filterCat === cat ? '' : cat)}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
              filterCat === cat
                ? 'border-accent bg-accent-dim'
                : 'border-[var(--border-faint)] bg-raised hover:bg-hover'
            }`}
          >
            <MaterialVisual name={cat} cat={cat} hv={500} size={48} className="flex-shrink-0" />
            <div>
              <div className={`text-[13px] font-bold ${CAT_COLORS[cat] || 'text-text-hi'}`}>{cat}</div>
              <div className="text-[12px] text-text-lo">{catCounts[cat] || 0}件</div>
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="flex gap-2 items-center">
          <SearchBox value={q} onChange={setQ} placeholder="材料名・組成で検索..." className="flex-1" />
          <Select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">全カテゴリ</option>
            {['金属合金', 'セラミクス', 'ポリマー', '複合材料'].map(c => <option key={c}>{c}</option>)}
          </Select>
          <div className="flex bg-raised rounded-md border border-[var(--border-faint)] p-0.5">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-accent-dim text-accent' : 'text-text-lo hover:text-text-md'}`}>
              <Icon name="dashboard" size={14} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-accent-dim text-accent' : 'text-text-lo hover:text-text-md'}`}>
              <Icon name="list" size={14} />
            </button>
          </div>
        </div>
      </Card>

      {/* Grid view */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(r => (
            <button
              key={r.id}
              onClick={() => onDetail(r.id)}
              className="group flex flex-col bg-surface border border-[var(--border-faint)] rounded-xl overflow-hidden hover:border-accent hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center justify-center p-4 bg-sunken">
                <MaterialVisual name={r.name} cat={r.cat} hv={r.hv} size={140} showLabel />
              </div>
              <div className="p-3 flex flex-col gap-1">
                <div className="text-[11px] font-mono text-text-lo">{r.id}</div>
                <div className="text-[14px] font-bold text-text-hi group-hover:text-accent transition-colors leading-tight">{r.name}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge variant="gray">{r.cat}</Badge>
                  {r.ai && <Badge variant="ai">AI</Badge>}
                </div>
                <div className="grid grid-cols-3 gap-1 mt-2 text-[11px]">
                  <div>
                    <div className="text-text-lo">硬度</div>
                    <div className="font-mono font-bold text-text-hi">{r.hv.toLocaleString()} <span className="text-text-lo font-normal">HV</span></div>
                  </div>
                  <div>
                    <div className="text-text-lo">引張</div>
                    <div className="font-mono font-bold text-text-hi">{r.ts.toLocaleString()} <span className="text-text-lo font-normal">MPa</span></div>
                  </div>
                  <div>
                    <div className="text-text-lo">弾性</div>
                    <div className="font-mono font-bold text-text-hi">{r.el} <span className="text-text-lo font-normal">GPa</span></div>
                  </div>
                </div>
                <div className="mt-1.5 text-[11px] font-mono text-text-lo truncate">{r.comp}</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="flex flex-col gap-2">
          {filtered.map(r => (
            <button
              key={r.id}
              onClick={() => onDetail(r.id)}
              className="group flex items-center gap-4 p-3 bg-surface border border-[var(--border-faint)] rounded-lg hover:border-accent hover:bg-hover transition-all text-left"
            >
              <MaterialVisual name={r.name} cat={r.cat} hv={r.hv} size={64} className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-text-lo">{r.id}</span>
                  <span className="text-[14px] font-bold text-text-hi group-hover:text-accent transition-colors">{r.name}</span>
                  <Badge variant="gray">{r.cat}</Badge>
                  {r.ai && <Badge variant="ai">AI</Badge>}
                </div>
                <div className="text-[12px] font-mono text-text-lo mt-0.5 truncate">{r.comp}</div>
              </div>
              <div className="flex gap-6 text-[12px] flex-shrink-0">
                <div className="text-center">
                  <div className="text-text-lo text-[10px]">硬度</div>
                  <div className="font-mono font-bold">{r.hv.toLocaleString()} HV</div>
                </div>
                <div className="text-center">
                  <div className="text-text-lo text-[10px]">引張</div>
                  <div className="font-mono font-bold">{r.ts.toLocaleString()} MPa</div>
                </div>
                <div className="text-center">
                  <div className="text-text-lo text-[10px]">弾性</div>
                  <div className="font-mono font-bold">{r.el} GPa</div>
                </div>
              </div>
              <Icon name="chevronRight" size={14} className="text-text-lo group-hover:text-accent flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-text-lo">
          <Icon name="search" size={32} className="mx-auto mb-3 opacity-25" />
          <div className="text-[14px] font-semibold mb-1">該当する材料が見つかりません</div>
          <div className="text-[12px]">検索条件を変更してください</div>
        </div>
      )}
    </div>
  );
};
