import type { KeyboardEvent as ReactKeyboardEvent } from 'react';

/**
 * OS 判定・IME 対応のキーボードユーティリティ
 *
 * - 日本語入力 (IME) 中は変換確定の Enter を Submit と誤認しないように isComposing をチェック
 * - Submit は Cmd+Enter (Mac) / Ctrl+Enter (Win) に統一
 * - 表示ラベルは OS に応じて自動切替
 */

export const isMac = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  // navigator.platform は deprecated だが userAgent より信頼性がある
  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform
    ?? navigator.platform
    ?? '';
  return /mac|iphone|ipad|ipod/i.test(platform) || /Mac OS/i.test(navigator.userAgent);
};

/** ⌘ (Mac) / Ctrl (Win/Linux) の表示ラベル */
export const modKeyLabel = (): string => (isMac() ? '⌘' : 'Ctrl');

/** Submit キー組み合わせの表示ラベル (例: "⌘+Enter" / "Ctrl+Enter") */
export const submitShortcutLabel = (): string => `${modKeyLabel()}+Enter`;

/**
 * IME 変換中かどうかを判定
 * - React の e.nativeEvent.isComposing が最も確実
 * - keyCode 229 は Safari/古いブラウザのフォールバック
 */
export const isComposing = (e: ReactKeyboardEvent | KeyboardEvent): boolean => {
  const nativeEvent = 'nativeEvent' in e ? e.nativeEvent : e;
  return nativeEvent.isComposing || (e as KeyboardEvent).keyCode === 229;
};

/**
 * Submit ショートカット (Cmd+Enter / Ctrl+Enter) 判定
 * - IME 変換中は false を返す
 */
export const isSubmitShortcut = (e: ReactKeyboardEvent | KeyboardEvent): boolean => {
  if (isComposing(e)) return false;
  if (e.key !== 'Enter') return false;
  return isMac() ? e.metaKey : e.ctrlKey;
};

/**
 * 単一行フォーム向け: IME 中以外の Enter を検出
 * - 検索バーなど "Enter で実行" を残したい UI で使用
 */
export const isPlainEnter = (e: ReactKeyboardEvent | KeyboardEvent): boolean => {
  if (isComposing(e)) return false;
  return e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey;
};
