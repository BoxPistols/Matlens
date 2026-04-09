import { Icon, IconName } from './Icon';
import { Tooltip } from './Tooltip';
import { Badge, Typing } from './atoms';
import { NAV_ITEMS } from '../data/constants';

interface SidebarProps {
  currentPage: string;
  onNav: (page: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  dbCount: number;
  embStatus: string;
  embCount: number;
}

export const Sidebar = ({ currentPage, onNav, collapsed, onToggle, dbCount, embStatus, embCount }: SidebarProps) => {
  return (
    <nav className={`sidebar-nav flex-shrink-0 flex flex-col border-r border-[var(--border-faint)] overflow-y-auto overflow-x-hidden transition-all duration-[220ms] ${collapsed ? 'collapsed' : ''}`} style={{ background: 'var(--sidebar-bg)' }} aria-label="メインナビゲーション">
      <div className={`flex items-center border-b border-[var(--border-faint)] h-[42px] flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'px-3 gap-2'}`}>
        <Tooltip label={collapsed ? 'サイドバーを展開' : 'サイドバーを折り畳む'} placement="right">
          <button onClick={onToggle} aria-label={collapsed ? 'サイドバーを展開' : 'サイドバーを折り畳む'} className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded text-text-lo hover:bg-hover hover:text-text-hi transition-colors">
            <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} size={14} />
          </button>
        </Tooltip>
        {!collapsed && <span className="text-[12px] font-bold text-text-lo tracking-[.04em] uppercase select-none">Menu</span>}
      </div>
      {NAV_ITEMS.map((item, i) => {
        if (item.section) {
          return (
            <div key={`s${i}`} className={`pt-4 pb-1 text-[10px] font-bold text-text-lo tracking-[.1em] uppercase overflow-hidden whitespace-nowrap ${collapsed ? 'px-0 text-center' : 'px-3.5'}`}>
              {!collapsed && item.section}
              {collapsed && <span className="block w-4 h-px bg-[var(--border-faint)] mx-auto mt-1" />}
            </div>
          );
        }
        const isActive = currentPage === item.id;
        const activeBase = item.cls === 'vec-nav' ? 'bg-vec-dim text-vec border-vec' : item.cls === 'ai-nav' ? 'bg-ai-dim text-ai border-ai' : 'bg-accent-dim text-accent border-accent';
        return (
          <Tooltip key={item.id} label={collapsed ? item.label : undefined} placement="right">
            <button onClick={() => !item.disabled && onNav(item.id!)} aria-current={isActive ? 'page' : undefined} disabled={item.disabled} className={`w-full flex items-center gap-2.5 py-2 text-left transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed select-none border-l-2 ${collapsed ? 'justify-center px-0' : 'px-3.5'} ${isActive ? activeBase + ' font-semibold' : 'text-text-md hover:bg-hover hover:text-text-hi border-transparent'}`}>
              <Icon name={item.icon as IconName} size={15} className="flex-shrink-0 opacity-80" />
              {!collapsed && (
                <>
                  <span className="text-[13px] leading-none whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">{item.label}</span>
                  {item.badge && <span className="ml-auto text-[10px] bg-[var(--tag-surface)] px-1.5 py-0.5 rounded-full text-text-lo flex-shrink-0">{dbCount}</span>}
                  {item.badgeLabel && <Badge variant={item.badgeVariant || 'gray'} className="ml-auto text-[10px] flex-shrink-0">{item.badgeLabel}</Badge>}
                </>
              )}
            </button>
          </Tooltip>
        );
      })}
      <div className="mt-auto p-3 border-t border-[var(--border-faint)]">
        <Tooltip label={embStatus === 'ready' ? `Embedding ${embCount}件インデックス済み` : embStatus === 'fallback' ? 'キーワード検索モードで動作中' : embStatus === 'indexing' ? 'ベクトルインデックスを構築中...' : 'TF.js Universal Sentence Encoderを読み込み中...'} placement="right">
          <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] font-semibold cursor-default ${embStatus === 'ready' ? 'bg-vec-dim text-vec' : 'bg-raised text-text-lo'} ${collapsed ? 'justify-center px-0' : ''}`}>
            <Icon name="embed" size={12} className="flex-shrink-0" />
            {!collapsed && <span className="truncate text-left">{embStatus === 'ready' ? `${embCount}件 Ready` : embStatus === 'fallback' ? 'キーワード検索' : '初期化中...'}</span>}
          </div>
        </Tooltip>
      </div>
    </nav>
  );
};
