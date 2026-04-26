// URL クエリ文字列パースの共通ヘルパ。
// 主に MSW ハンドラなどで snake_case クエリを安全に解釈するために使う。

/** 正の整数として解釈できなければ fallback を返す */
export const parsePositiveInt = (value: string | null, fallback: number): number => {
  if (value === null) return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
};

/**
 * カンマ区切り文字列を配列化する。空文字や全要素空のケースは undefined を返す。
 * `?status=` のような空クエリで全件除外バグを起こさないためのガード。
 */
export const parseCsvList = (value: string | null | undefined): string[] | undefined => {
  if (!value) return undefined;
  const items = value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
};
