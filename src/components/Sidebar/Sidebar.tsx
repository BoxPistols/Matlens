// サイドバーナビ。
// - フラット項目: ボタンとして描画、クリックで onNav
// - 親項目 (children あり): クリックで展開/折り畳み、子は onNav
// - section ヘッダ: 視覚区切りのみ（クリック不可）
// - devOnly: import.meta.env.DEV のときだけ表示。本番ビルドではサイドバーから消える
//
// 折り畳み state は localStorage（key matlens_sidebar_groups）に永続化し、
// リロード後も状態を保持する。currentPage が children のいずれかと一致する親は
// 自動展開して「今どこにいるか」を見失わない。

import { useEffect, useMemo, useState } from 'react';
import { Icon, IconName } from '../Icon';
import { Tooltip } from '../Tooltip';
import { Badge } from '../atoms';
import { NAV_ITEMS, STORYBOOK_URL } from '../../data/constants';
import type { NavItem } from '../../types';

interface SidebarProps {
  currentPage: string;
  onNav: (page: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  dbCount: number;
  embStatus: string;
  embCount: number;
  lang?: 'ja' | 'en';
  mobileOpen?: boolean;
}

const STORAGE_KEY = 'matlens_sidebar_groups';

const isDev = import.meta.env.DEV;

const loadGroupState = (): Record<string, boolean> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
};

const saveGroupState = (state: Record<string, boolean>) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 容量超過等は無視
  }
};

/** 親が currentPage を含むか再帰チェック（自動展開判定用） */
const containsCurrent = (item: NavItem, currentPage: string): boolean => {
  if (!item.children) return false;
  return item.children.some(
    (c) => c.id === currentPage || containsCurrent(c, currentPage),
  );
};

export const Sidebar = ({
  currentPage,
  onNav,
  collapsed,
  onToggle,
  dbCount,
  embStatus,
  embCount,
  lang = 'ja',
  mobileOpen = false,
}: SidebarProps) => {
  const isEn = lang === 'en';

  const [groupState, setGroupState] = useState<Record<string, boolean>>(() => loadGroupState());

  useEffect(() => {
    saveGroupState(groupState);
  }, [groupState]);

  const toggleGroup = (id: string) => {
    setGroupState((prev) => ({ ...prev, [id]: !isOpen(prev, id) }));
  };

  const isOpen = (state: Record<string, boolean>, id: string): boolean => state[id] === true;

  /**
   * グループの展開状態を計算。
   * 1) 永続化された state があればそれを優先
   * 2) なければ defaultOpen を見る
   * 3) いずれもなければ「currentPage を子に含む」場合に自動展開
   */
  const resolveOpen = (item: NavItem): boolean => {
    if (!item.id) return false;
    if (item.id in groupState) return groupState[item.id]!;
    if (item.defaultOpen) return true;
    if (containsCurrent(item, currentPage)) return true;
    return false;
  };

  // dev フィルタ + section の空セクション除去を一度だけ計算
  const visibleItems = useMemo(() => filterVisible(NAV_ITEMS, isDev), []);

  return (
    <nav
      className={`sidebar-nav flex-shrink-0 flex flex-col border-r border-[var(--border-faint)] overflow-y-auto overflow-x-hidden transition-all duration-[220ms] ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      style={{ background: 'var(--sidebar-bg)' }}
      aria-label="メインナビゲーション"
    >
      <div
        className={`flex items-center border-b border-[var(--border-faint)] h-[42px] flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'px-3 gap-2'}`}
      >
        <Tooltip
          label={collapsed ? (isEn ? 'Expand sidebar' : 'サイドバーを展開') : (isEn ? 'Collapse sidebar' : 'サイドバーを折り畳む')}
          placement="right"
        >
          <button
            onClick={onToggle}
            aria-label={collapsed ? (isEn ? 'Expand sidebar' : 'サイドバーを展開') : (isEn ? 'Collapse sidebar' : 'サイドバーを折り畳む')}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded text-text-lo hover:bg-hover hover:text-text-hi transition-colors"
          >
            <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} size={14} />
          </button>
        </Tooltip>
        {!collapsed && (
          <span className="text-[12px] font-bold text-text-lo tracking-[.04em] uppercase select-none">
            Menu
          </span>
        )}
      </div>

      {visibleItems.map((item, i) => {
        if (item.section) {
          return <SectionHeader key={`s${i}`} item={item} collapsed={collapsed} isEn={isEn} />;
        }
        if (item.children && item.children.length > 0) {
          return (
            <NavGroup
              key={item.id ?? `g${i}`}
              item={item}
              currentPage={currentPage}
              onNav={onNav}
              collapsed={collapsed}
              isEn={isEn}
              dbCount={dbCount}
              open={resolveOpen(item)}
              onToggle={() => item.id && toggleGroup(item.id)}
            />
          );
        }
        return (
          <NavLeaf
            key={item.id}
            item={item}
            currentPage={currentPage}
            onNav={onNav}
            collapsed={collapsed}
            isEn={isEn}
            dbCount={dbCount}
            indent={false}
          />
        );
      })}

      <div className="mt-auto p-3 border-t border-[var(--border-faint)] flex flex-col gap-2">
        <Tooltip label="Storybook - コンポーネントカタログを新しいタブで開く" placement="right">
          <a
            href={STORYBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Storybook を新しいタブで開く"
            className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] font-semibold border border-[var(--border-faint)] bg-raised text-text-md hover:bg-[#FF4785]/10 hover:text-[#FF4785] hover:border-[#FF4785]/40 transition-colors ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <span className="w-2 h-2 rounded-full bg-[#FF4785] flex-shrink-0" aria-hidden="true" />
            {!collapsed && (
              <>
                <span className="flex-1 truncate text-left">Storybook</span>
                <span className="text-[12px] opacity-70" aria-hidden="true">
                  ↗
                </span>
              </>
            )}
          </a>
        </Tooltip>
        <Tooltip
          label={
            embStatus === 'ready'
              ? isEn
                ? `${embCount} items indexed`
                : `${embCount}件インデックス済み`
              : embStatus === 'fallback'
                ? isEn
                  ? 'Keyword search active'
                  : 'キーワード検索モード'
                : embStatus === 'indexing'
                  ? isEn
                    ? 'Building index...'
                    : 'インデックス構築中...'
                  : isEn
                    ? 'Initializing...'
                    : '初期化中...'
          }
          placement="right"
        >
          <div
            className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] font-semibold cursor-default ${embStatus === 'ready' ? 'bg-vec-dim text-vec' : 'bg-raised text-text-lo'} ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <Icon name="embed" size={12} className="flex-shrink-0" />
            {!collapsed && (
              <span className="truncate text-left">
                {embStatus === 'ready'
                  ? isEn
                    ? `${embCount} Ready`
                    : `${embCount}件 Ready`
                  : embStatus === 'fallback'
                    ? isEn
                      ? 'Keyword'
                      : 'キーワード検索'
                    : isEn
                      ? 'Loading...'
                      : '初期化中...'}
              </span>
            )}
          </div>
        </Tooltip>
      </div>
    </nav>
  );
};

// ----- 内部コンポーネント -----

const SectionHeader = ({ item, collapsed, isEn }: { item: NavItem; collapsed: boolean; isEn: boolean }) => (
  <div
    className={`pt-4 pb-1 text-[11px] font-bold text-text-hi opacity-50 tracking-[.08em] uppercase whitespace-nowrap border-t border-[var(--border-default)] mt-2 ${collapsed ? 'px-0 text-center' : 'px-3.5'}`}
  >
    {!collapsed && (isEn && item.sectionEn ? item.sectionEn : item.section)}
    {collapsed && <span className="block w-4 h-px bg-[var(--border-faint)] mx-auto mt-1" />}
  </div>
);

interface LeafProps {
  item: NavItem;
  currentPage: string;
  onNav: (page: string) => void;
  collapsed: boolean;
  isEn: boolean;
  dbCount: number;
  indent: boolean;
}

const NavLeaf = ({ item, currentPage, onNav, collapsed, isEn, dbCount, indent }: LeafProps) => {
  const isActive = currentPage === item.id;
  const activeBase =
    item.cls === 'vec-nav'
      ? 'bg-vec-dim text-vec border-vec'
      : item.cls === 'ai-nav'
        ? 'bg-ai-dim text-ai border-ai'
        : 'bg-accent-dim text-accent border-accent';
  const padLeft = collapsed ? 'justify-center px-0' : indent ? 'pl-8 pr-3.5' : 'px-3.5';
  return (
    <Tooltip key={item.id} label={collapsed ? (isEn && item.labelEn ? item.labelEn : item.label) : undefined} placement="right">
      <button
        onClick={() => !item.disabled && onNav(item.id!)}
        aria-current={isActive ? 'page' : undefined}
        disabled={item.disabled}
        className={`w-full flex items-center gap-2.5 py-2 text-left transition-all duration-100 disabled:opacity-40 disabled:cursor-not-allowed select-none border-l-2 ${padLeft} ${isActive ? activeBase + ' font-semibold' : 'text-text-md hover:bg-hover hover:text-text-hi border-transparent'}`}
      >
        <Icon name={item.icon as IconName} size={15} className="flex-shrink-0 opacity-80" />
        {!collapsed && (
          <>
            <span className="text-[13px] leading-none whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">
              {isEn && item.labelEn ? item.labelEn : item.label}
            </span>
            {item.badge && (
              <span className="ml-auto text-[10px] bg-[var(--tag-surface)] px-1.5 py-0.5 rounded-full text-text-lo flex-shrink-0">
                {dbCount}
              </span>
            )}
            {item.badgeLabel && (
              <Badge variant={item.badgeVariant || 'gray'} className="ml-auto text-[10px] flex-shrink-0">
                {item.badgeLabel}
              </Badge>
            )}
          </>
        )}
      </button>
    </Tooltip>
  );
};

interface GroupProps {
  item: NavItem;
  currentPage: string;
  onNav: (page: string) => void;
  collapsed: boolean;
  isEn: boolean;
  dbCount: number;
  open: boolean;
  onToggle: () => void;
}

const NavGroup = ({ item, currentPage, onNav, collapsed, isEn, dbCount, open, onToggle }: GroupProps) => {
  const containsActive = item.children?.some((c) => c.id === currentPage) ?? false;
  const label = isEn && item.labelEn ? item.labelEn : item.label;
  return (
    <>
      <Tooltip label={collapsed ? label : undefined} placement="right">
        <button
          onClick={onToggle}
          aria-expanded={open}
          className={`w-full flex items-center gap-2.5 py-2 text-left transition-all duration-100 select-none border-l-2 ${collapsed ? 'justify-center px-0' : 'px-3.5'} ${containsActive ? 'text-text-hi font-semibold border-transparent' : 'text-text-md hover:bg-hover hover:text-text-hi border-transparent'}`}
        >
          <Icon name={item.icon as IconName} size={15} className="flex-shrink-0 opacity-80" />
          {!collapsed && (
            <>
              <span className="text-[13px] leading-none whitespace-nowrap overflow-hidden text-ellipsis text-left flex-1">
                {label}
              </span>
              {item.badgeLabel && (
                <Badge variant={item.badgeVariant || 'gray'} className="text-[10px] flex-shrink-0">
                  {item.badgeLabel}
                </Badge>
              )}
              <Icon
                name={open ? 'chevronDown' : 'chevronRight'}
                size={12}
                className="flex-shrink-0 opacity-60"
              />
            </>
          )}
        </button>
      </Tooltip>
      {open &&
        !collapsed &&
        item.children!.map((child) => (
          <NavLeaf
            key={child.id}
            item={child}
            currentPage={currentPage}
            onNav={onNav}
            collapsed={collapsed}
            isEn={isEn}
            dbCount={dbCount}
            indent={true}
          />
        ))}
    </>
  );
};

// ----- フィルタ -----

/**
 * dev フラグでフィルタ + 子が全部消えたグループを除去 + 残ったセクションヘッダの孤立を除去。
 * フィルタ後の連続するセクションヘッダ（中身がないもの）も視覚的にゴミになるので排除する。
 */
function filterVisible(items: NavItem[], dev: boolean): NavItem[] {
  // Phase 1: dev フィルタ + children 内も dev フィルタ
  const filtered = items
    .map((item) => {
      if (item.devOnly && !dev) return null;
      if (item.children) {
        const visibleChildren = item.children.filter((c) => !c.devOnly || dev);
        if (visibleChildren.length === 0) return null;
        return { ...item, children: visibleChildren };
      }
      return item;
    })
    .filter((x): x is NavItem => x !== null);

  // Phase 2: 中身が空のセクションを排除
  const out: NavItem[] = [];
  for (let i = 0; i < filtered.length; i++) {
    const cur = filtered[i]!;
    if (cur.section) {
      // 次のセクションヘッダ or 配列末尾までの間に表示する項目があるかを見る
      let hasContent = false;
      for (let j = i + 1; j < filtered.length; j++) {
        const next = filtered[j]!;
        if (next.section) break;
        if (next.id) {
          hasContent = true;
          break;
        }
      }
      if (hasContent) out.push(cur);
    } else {
      out.push(cur);
    }
  }
  return out;
}
