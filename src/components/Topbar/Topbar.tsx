import { useState, useRef, useEffect, useMemo, useContext } from 'react';
import { Icon } from '../Icon';
import { Tooltip } from '../Tooltip';
import { Typing, Badge } from '../atoms';
import type { Material, AppContextValue } from '../../types';
import { STORYBOOK_URL } from '../../data/constants';
import { isComposing } from '../../utils/keyboard';
import { formatSearchEngineLabel } from '../../utils/searchEngine';
import { DENSITY_META, VALID_DENSITIES, type Density } from '../../hooks/useDensity';
import { AppCtx } from '../../context/AppContext';

type Lang = 'ja' | 'en';

interface TopbarProps {
  theme: string;
  setTheme: (t: string) => void;
  density: Density;
  setDensity: (d: Density) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  onToggleSidebar: () => void;
  embStatus: string;
  embCount: number;
  embEngine?: string;
  onGlobalSearch: (q: string) => void;
  globalQuery: string;
  setGlobalQuery: (q: string) => void;
  db: Material[];
  onDetail: (id: string) => void;
  unreadNotifications?: number;
  onOpenNotifications?: () => void;
}

export const Topbar = ({ theme, setTheme, density, setDensity, lang, setLang, onToggleSidebar, embStatus, embCount, embEngine, onGlobalSearch, globalQuery, setGlobalQuery, db, onDetail, unreadNotifications = 0, onOpenNotifications }: TopbarProps) => {
  const { t } = useContext(AppCtx) as AppContextValue;
  const THEMES = [
    { id: 'light', label: 'Light' },
    { id: 'dark',  label: 'Dark' },
    { id: 'eng',   label: 'Eng' },
    { id: 'cae',   label: 'CAE' },
  ];
  const engineLabel = formatSearchEngineLabel(embEngine);
  const engineSuffix = engineLabel ? ` (${engineLabel})` : '';
  const vecStatusLabel = { idle:t('初期化中','Initializing'), loading:t('モデル読込中','Loading model'), indexing:t('索引構築中','Building index'), ready:`${embCount}${t('件','')}${engineSuffix}`, fallback:t('キーワード検索','Keyword search') }[embStatus] || '—';

  // Highlight matched text with yellow marker
  const highlight = (text: string, query: string) => {
    if (!query) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="bg-yellow-300/60 text-inherit rounded-sm px-0.5">{part}</mark>
        : part
    );
  };

  const [focused, setFocused] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  // Live search results (max 8)
  const results = useMemo(() => {
    if (!globalQuery || globalQuery.length < 1) return [];
    const q = globalQuery.toLowerCase();
    return db.filter(r =>
      `${r.id} ${r.name} ${r.comp} ${r.cat} ${r.memo}`.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [globalQuery, db]);

  const showDropdown = focused && globalQuery.length > 0;

  // Reset selection when results change
  useEffect(() => { setSelectedIdx(-1); }, [results]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // IME 変換中の Enter は候補確定に使われるので送信処理に流さない。
    // isComposing() は Safari の keyCode 229 フォールバックも含む。
    if (isComposing(e)) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIdx >= 0 && results[selectedIdx]) {
        onDetail(results[selectedIdx].id);
        setFocused(false);
        setGlobalQuery('');
      } else if (globalQuery.trim()) {
        onGlobalSearch(globalQuery.trim());
        setFocused(false);
      }
    } else if (e.key === 'Escape') {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <header className="flex-shrink-0 flex items-center gap-3 px-5 h-[52px] border-b border-[rgba(255,255,255,.06)] overflow-x-auto no-scrollbar" style={{ background: 'var(--topbar-bg)' }} role="banner">
      <Tooltip label="サイドバーを開閉" placement="bottom">
      <button onClick={onToggleSidebar} className="w-8 h-8 flex items-center justify-center rounded bg-white/10 border border-white/20 text-white hover:bg-white/25 transition-all flex-shrink-0" aria-label="サイドバーを開閉する">
        <svg viewBox="0 0 16 16" fill="currentColor" width={15} height={15}><rect x="1" y="3" width="14" height="1.5" rx="0.75"/><rect x="1" y="7.25" width="14" height="1.5" rx="0.75"/><rect x="1" y="11.5" width="14" height="1.5" rx="0.75"/></svg>
      </button>
      </Tooltip>
      <div className="flex items-center gap-2 text-white select-none flex-shrink-0">
        <div className="w-6 h-6 rounded flex items-center justify-center bg-white/20 border border-white/25">
          <Icon name="dashboard" size={13} className="text-white" />
        </div>
        <span className="text-[15px] font-bold tracking-tight">Matlens</span>
      </div>
      <div className="w-px h-4 bg-white/20 hidden md:block flex-shrink-0" />
      <span className="text-[12px] text-white/60 leading-none hidden lg:inline flex-shrink-0">{t('研究・実験データ管理 v3', 'R&D Data Management v3')}</span>

      {/* Global search with live results */}
      <div className="flex-1 min-w-[160px] max-w-lg mx-1 md:mx-3 relative">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"><Icon name="search" size={13} /></span>
          <input
            ref={inputRef}
            value={globalQuery}
            onChange={e => setGlobalQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder={t('材料名・ID・組成を検索...', 'Search by name, ID, composition...')}
            className="w-full pl-8 pr-8 py-1.5 rounded-md bg-white/10 border border-white/15 text-white text-[12px] placeholder-white/35 outline-none focus:bg-white/15 focus:border-white/30 transition-all font-ui"
          />
          {globalQuery && (
            <button onClick={() => { setGlobalQuery(''); inputRef.current?.focus(); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70">
              <Icon name="close" size={10} />
            </button>
          )}
        </div>

        {/* Dropdown results */}
        {showDropdown && (
          <div ref={dropRef} className="absolute top-full left-0 right-0 mt-1 bg-surface border border-[var(--border-default)] rounded-lg shadow-lg z-[200] overflow-hidden max-h-[400px] overflow-y-auto">
            {results.length > 0 ? (
              <>
                <div className="px-3 py-1.5 text-[11px] text-text-lo border-b border-[var(--border-faint)] flex items-center justify-between">
                  <span>{results.length}{t('件の候補', ' results')}{results.length === 8 ? t('（上位8件）', ' (top 8)') : ''}</span>
                  <span className="text-[10px]">{t('Enter: 一覧表示 / 上下: 選択', 'Enter: list / ↑↓: select')}</span>
                </div>
                {results.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => { onDetail(r.id); setFocused(false); setGlobalQuery(''); }}
                    onMouseEnter={() => setSelectedIdx(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${i === selectedIdx ? 'bg-accent-dim' : 'hover:bg-hover'}`}
                  >
                    <span className="font-mono text-[11px] text-text-lo w-16 flex-shrink-0">{highlight(r.id, globalQuery)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-text-hi truncate">{highlight(r.name, globalQuery)}</div>
                      <div className="text-[11px] text-text-lo font-mono truncate">{highlight(r.comp, globalQuery)}</div>
                    </div>
                    <Badge variant="gray">{highlight(r.cat, globalQuery)}</Badge>
                  </button>
                ))}
                <button
                  onClick={() => { onGlobalSearch(globalQuery.trim()); setFocused(false); }}
                  className="w-full px-3 py-2 text-[12px] text-accent font-semibold text-left border-t border-[var(--border-faint)] hover:bg-hover transition-colors flex items-center gap-1.5"
                >
                  <Icon name="search" size={12} />
                  {t(`「${globalQuery}」で一覧を絞り込み`, `Filter list by "${globalQuery}"`)}
                </button>
              </>
            ) : (
              <div className="px-3 py-4 text-center">
                <Icon name="search" size={20} className="mx-auto mb-2 text-text-lo opacity-40" />
                <div className="text-[13px] font-semibold text-text-md">{t(`「${globalQuery}」に一致する材料はありません`, `No materials match "${globalQuery}"`)}</div>
                <div className="text-[11px] text-text-lo mt-1">{t('名称・ID・組成・備考で検索しています', 'Searching name, ID, composition, notes')}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="hidden md:flex gap-0.5 bg-black/25 p-0.5 rounded-md border border-white/10 flex-shrink-0" role="group" aria-label="テーマ切替">
        {THEMES.map(t => (
          <button key={t.id} className={`px-2.5 py-1 rounded text-[12px] font-medium transition-all duration-150 font-ui ${theme === t.id ? 'bg-white/18 text-white' : 'text-white/50 hover:text-white/80'}`} onClick={() => setTheme(t.id)} aria-pressed={theme === t.id}>
            {t.label}
          </button>
        ))}
      </div>

      {/* 言語切替 */}
      <div className="hidden md:flex gap-0.5 bg-black/25 p-0.5 rounded-md border border-white/10 flex-shrink-0" role="group" aria-label="言語切替">
        {([['ja', 'JP'], ['en', 'EN']] as const).map(([id, label]) => (
          <button key={id} className={`px-2.5 py-1 rounded text-[12px] font-medium transition-all duration-150 font-ui ${lang === id ? 'bg-white/18 text-white' : 'text-white/50 hover:text-white/80'}`} onClick={() => setLang(id)} aria-pressed={lang === id}>
            {label}
          </button>
        ))}
      </div>

      {/* UI 密度トグル */}
      <Tooltip label="UI 密度 (行間隔)" placement="bottom">
        <div className="hidden lg:flex gap-0.5 bg-black/25 p-0.5 rounded-md border border-white/10 flex-shrink-0" role="group" aria-label="UI 密度切替">
          {VALID_DENSITIES.map(d => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              aria-pressed={density === d}
              className={`px-1.5 py-1 rounded text-[11px] font-medium transition-all duration-150 font-ui ${density === d ? 'bg-white/18 text-white' : 'text-white/50 hover:text-white/80'}`}
            >
              {DENSITY_META[d].label}
            </button>
          ))}
        </div>
      </Tooltip>
      <Tooltip label={unreadNotifications > 0 ? `お知らせ (未読 ${unreadNotifications} 件)` : 'お知らせ'} placement="bottom">
        <button
          type="button"
          onClick={onOpenNotifications}
          className="relative flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full border border-white/20 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200"
          aria-label={unreadNotifications > 0 ? `お知らせ 未読 ${unreadNotifications} 件` : 'お知らせ'}
        >
          <Icon name="info" size={15} />
          {unreadNotifications > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[var(--err)] text-white text-[9px] font-bold flex items-center justify-center border-[1.5px] border-[var(--topbar-bg)]"
            >
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </button>
      </Tooltip>
      <Tooltip label={embStatus === "fallback" ? "キーワード検索モード" : `ベクトル検索: ${vecStatusLabel}`} placement="left">
        <button className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all duration-200 ${embStatus === 'ready' ? 'bg-vec-dim text-vec border-[var(--vec-mid)]' : 'bg-white/10 text-white/80 border-white/20'}`} aria-label="ベクトル検索ページへ">
          <Icon name="embed" size={12} />
          <span>{vecStatusLabel}</span>
          {(embStatus === 'loading' || embStatus === 'indexing') && <Typing color="currentColor" />}
        </button>
      </Tooltip>
      <Tooltip label="Storybook - コンポーネントカタログ" placement="bottom">
        <a
          href={STORYBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex flex-shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border border-white/20 bg-white/10 text-white/80 hover:bg-[#FF4785]/20 hover:text-white hover:border-[#FF4785]/60 transition-all duration-200"
          aria-label="Storybook を新しいタブで開く"
        >
          <span className="w-2 h-2 rounded-full bg-[#FF4785] flex-shrink-0" aria-hidden="true" />
          <span>Storybook</span>
          <span className="text-[10px] opacity-70" aria-hidden="true">↗</span>
        </a>
      </Tooltip>
      <Tooltip label="ログインユーザー: 木村 研一" placement="left">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 border-[1.5px] border-white/40 flex items-center justify-center text-[11px] font-bold text-white" aria-label="ログインユーザー">
        KK
      </div>
      </Tooltip>
    </header>
  );
};
