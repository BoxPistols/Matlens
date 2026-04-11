/**
 * useEmbedding / `/api/search` が返すエンジン識別子。
 * 将来の API 拡張では未知の文字列が来る可能性があるため、表示系は default 分岐で生値を出す。
 */
export type SearchEngineId =
  | 'pending'
  | 'upstash'
  | 'keyword'
  | 'tfjs'
  | 'server';

/** トップバー等の接尾辞用。未確定・未検索時は null（括弧を付けない） */
export function formatSearchEngineLabel(engine: string | undefined): string | null {
  switch (engine) {
    case 'pending':
    case undefined:
      return null;
    case 'upstash':
      return 'Upstash';
    case 'keyword':
      return 'キーワード';
    case 'tfjs':
      return 'TF.js USE';
    case 'server':
      return 'サーバー';
    default:
      return engine;
  }
}
