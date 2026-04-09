import { Icon } from './Icon';
import { Tooltip } from './Tooltip';
import { Typing } from './atoms';

interface TopbarProps {
  theme: string;
  setTheme: (t: string) => void;
  onToggleSidebar: () => void;
  embStatus: string;
  embCount: number;
  onGlobalSearch: (q: string) => void;
  globalQuery: string;
  setGlobalQuery: (q: string) => void;
}

export const Topbar = ({ theme, setTheme, onToggleSidebar, embStatus, embCount, onGlobalSearch, globalQuery, setGlobalQuery }: TopbarProps) => {
  const THEMES = [
    { id: 'light', label: 'Light' },
    { id: 'dark',  label: 'Dark' },
    { id: 'eng',   label: 'Engineering' },
    { id: 'cae',   label: 'CAE' },
  ];
  const vecStatusLabel = { idle:'初期化中', loading:'モデル読込中', indexing:'索引構築中', ready:`${embCount}件`, fallback:'キーワード検索' }[embStatus] || '—';

  return (
    <header className="flex-shrink-0 flex items-center gap-3 px-5 h-[52px] border-b border-[rgba(255,255,255,.06)]" style={{ background: 'var(--topbar-bg)' }} role="banner">
      <Tooltip label="サイドバーを開閉" placement="bottom">
        <button onClick={onToggleSidebar} className="w-8 h-8 flex items-center justify-center rounded bg-white/10 border border-white/20 text-white hover:bg-white/25 transition-all flex-shrink-0" aria-label="サイドバーを開閉する">
          <svg viewBox="0 0 16 16" fill="currentColor" width={15} height={15}>
            <rect x="1" y="3" width="14" height="1.5" rx="0.75"/>
            <rect x="1" y="7.25" width="14" height="1.5" rx="0.75"/>
            <rect x="1" y="11.5" width="14" height="1.5" rx="0.75"/>
          </svg>
        </button>
      </Tooltip>
      <div className="flex items-center gap-2 text-white select-none">
        <div className="w-6 h-6 rounded flex items-center justify-center bg-white/20 border border-white/25">
          <Icon name="dashboard" size={13} className="text-white" />
        </div>
        <span className="text-[15px] font-bold tracking-tight">Matlens</span>
      </div>
      <div className="w-px h-4 bg-white/20" />
      <span className="text-[12px] text-white/60 leading-none hidden sm:inline">研究・実験データ管理 v3</span>
      <div className="flex-1 max-w-md mx-3">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"><Icon name="search" size={13} /></span>
          <input value={globalQuery} onChange={e => setGlobalQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && globalQuery.trim()) { e.preventDefault(); onGlobalSearch(globalQuery.trim()); } }} placeholder="材料名・ID・組成を検索...（Enter）" className="w-full pl-8 pr-3 py-1.5 rounded-md bg-white/10 border border-white/15 text-white text-[12px] placeholder-white/35 outline-none focus:bg-white/15 focus:border-white/30 transition-all font-ui" />
          {globalQuery && (
            <button onClick={() => setGlobalQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"><Icon name="close" size={10} /></button>
          )}
        </div>
      </div>
      <div className="flex gap-0.5 bg-black/25 p-0.5 rounded-md border border-white/10" role="group" aria-label="テーマ切替">
        {THEMES.map(t => (
          <button key={t.id} className={`px-2.5 py-1 rounded text-[12px] font-medium transition-all duration-150 font-ui ${theme === t.id ? 'bg-white/18 text-white' : 'text-white/50 hover:text-white/80'}`} onClick={() => setTheme(t.id)} aria-pressed={theme === t.id}>
            {t.label}
          </button>
        ))}
      </div>
      <Tooltip label={embStatus === "fallback" ? "キーワード検索モード" : `ベクトル検索: ${vecStatusLabel}`} placement="left">
        <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all duration-200 ${embStatus === 'ready' ? 'bg-vec-dim text-vec border-[var(--vec-mid)]' : 'bg-white/10 text-white/80 border-white/20'}`} aria-label="ベクトル検索ページへ">
          <Icon name="embed" size={12} />
          <span>{vecStatusLabel}</span>
          {(embStatus === 'loading' || embStatus === 'indexing') && <Typing color="currentColor" />}
        </button>
      </Tooltip>
      <Tooltip label="ログインユーザー: 木村 研一" placement="bottom">
        <div className="w-8 h-8 rounded-full bg-white/20 border-[1.5px] border-white/40 flex items-center justify-center text-[11px] font-bold text-white" aria-label="ログインユーザー">KK</div>
      </Tooltip>
    </header>
  );
};
