// Unread-state tracking for in-app announcements.
//
// We deliberately keep this on localStorage rather than a user account so
// the banner doesn't reappear after each reload for returning users, while
// staying anonymous for first-time visitors. The stored value is the id of
// the most-recent announcement the user has acknowledged; anything newer
// than that id (by array position) is treated as unread.

import { useState, useEffect, useCallback } from 'react';
import { ANNOUNCEMENTS, type Announcement } from '../../data/announcements';

const STORAGE_KEY = 'matlens:lastSeenAnnouncementId';

function loadLastSeenId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveLastSeenId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore quota / disabled storage */
  }
}

export interface AnnouncementsState {
  /** すべてのお知らせ（降順） */
  all: Announcement[];
  /** 未読のお知らせ（最新→古い順） */
  unread: Announcement[];
  /** 一番最新の未読お知らせ。なければ null */
  latestUnread: Announcement | null;
  /** 未読件数 */
  unreadCount: number;
  /** 指定IDまでを既読にする（デフォルトは全件既読） */
  markAsSeen: (id?: string) => void;
}

export function useAnnouncements(): AnnouncementsState {
  const [lastSeenId, setLastSeenId] = useState<string | null>(() =>
    typeof window === 'undefined' ? null : loadLastSeenId()
  );

  // 別タブでの更新を反映（複数タブ起動時の体験を揃える）
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setLastSeenId(e.newValue);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const unreadIndex = lastSeenId
    ? ANNOUNCEMENTS.findIndex(a => a.id === lastSeenId)
    : ANNOUNCEMENTS.length;
  // lastSeen が見つからない場合（旧ID を消した等）は全件未読扱い
  const cutoff = unreadIndex < 0 ? ANNOUNCEMENTS.length : unreadIndex;
  const unread = ANNOUNCEMENTS.slice(0, cutoff);

  const markAsSeen = useCallback((id?: string) => {
    const target = id ?? ANNOUNCEMENTS[0]?.id;
    if (!target) return;
    saveLastSeenId(target);
    setLastSeenId(target);
  }, []);

  return {
    all: ANNOUNCEMENTS,
    unread,
    latestUnread: unread[0] ?? null,
    unreadCount: unread.length,
    markAsSeen,
  };
}
