// Slim sticky banner shown just below the topbar when there are unread
// announcements. Clicking "すべて見る" opens the SupportPanel on the
// announcements tab, and the × button marks every current unread entry
// as seen so returning users don't get nagged.
//
// Designed to be visible-but-quiet: one line of text, one accent color
// based on the announcement type, and dismissible.

import { Icon, IconName } from '../Icon';
import type { Announcement, AnnouncementType } from '../../data/announcements';

interface AnnouncementBannerProps {
  announcement: Announcement;
  unreadCount: number;
  onDismiss: () => void;
  onOpenAll: () => void;
}

const TYPE_STYLE: Record<
  AnnouncementType,
  { icon: IconName; bg: string; accent: string; label: string }
> = {
  feature: {
    icon: 'spark',
    bg: 'bg-ai-dim',
    accent: 'text-ai',
    label: 'NEW',
  },
  fix: {
    icon: 'check',
    bg: 'bg-[var(--ok-dim)]',
    accent: 'text-ok',
    label: 'FIX',
  },
  info: {
    icon: 'info',
    bg: 'bg-accent-dim',
    accent: 'text-accent',
    label: 'INFO',
  },
  warn: {
    icon: 'warning',
    bg: 'bg-[var(--warn-dim)]',
    accent: 'text-warn',
    label: 'NOTICE',
  },
};

export const AnnouncementBanner = ({
  announcement,
  unreadCount,
  onDismiss,
  onOpenAll,
}: AnnouncementBannerProps) => {
  const style = TYPE_STYLE[announcement.type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${style.bg} border-b border-[var(--border-faint)]`}
    >
      <div className="flex items-center gap-3 px-4 py-2">
        <Icon name={style.icon} size={14} className={`${style.accent} flex-shrink-0`} />
        <span
          className={`text-[10px] font-bold tracking-[.08em] uppercase ${style.accent} flex-shrink-0`}
        >
          {style.label}
        </span>
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-[12px] text-text-lo flex-shrink-0 hidden sm:inline">
            {announcement.date}
          </span>
          <span className="text-[12px] font-semibold text-text-hi truncate">
            {announcement.title}
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenAll}
          className={`text-[11px] font-semibold ${style.accent} hover:underline flex-shrink-0 font-ui`}
        >
          すべて見る
          {unreadCount > 1 && (
            <span className="ml-1 opacity-70">（他 {unreadCount - 1} 件）</span>
          )}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="お知らせを閉じる"
          className="flex items-center justify-center w-5 h-5 rounded hover:bg-hover text-text-lo hover:text-text-hi transition-colors flex-shrink-0"
        >
          <Icon name="close" size={12} />
        </button>
      </div>
    </div>
  );
};
