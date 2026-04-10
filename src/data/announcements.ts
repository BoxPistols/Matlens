// アプリケーション内お知らせ（更新履歴・運用情報）のデータソース。
//
// エントリは「発表日降順」で上から並べる。id は不変のユニーク文字列で、
// 既読管理の localStorage キーとして使われるため、リリース後は変更しない。
// type はバナーのアイコン色に使用される。

export type AnnouncementType = 'feature' | 'fix' | 'info' | 'warn';

export interface Announcement {
  id: string;
  date: string; // YYYY-MM-DD
  type: AnnouncementType;
  title: string;
  body: string; // 1-3文。長文は含めない
}

// 新しいお知らせは配列の先頭に追加する。
export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: '2026-04-10-maiml',
    date: '2026-04-10',
    type: 'feature',
    title: 'MaiML (JIS K 0200:2024) エクスポート/インポートに対応',
    body: '材料データを MaiML 形式で書き出し・読み込みできるようになりました。材料一覧の「インポート」「エクスポート」、詳細ページの「MaiML」ボタンからご利用ください。',
  },
  {
    id: '2026-04-10-rag-streaming',
    date: '2026-04-10',
    type: 'feature',
    title: 'AI チャットにストリーミング応答を導入',
    body: 'RAG チャットで回答が少しずつ流れてくるようになり、体感速度が改善しました。参照材料データも折りたたみで確認できます。',
  },
  {
    id: '2026-04-09-ui-polish',
    date: '2026-04-09',
    type: 'fix',
    title: '細部UIの改善 — チェックボックス・検索ハイライト・テキスト選択色',
    body: 'ライト/ダーク両モードで見やすくなるよう、チェックボックスの配色、検索キーワードのハイライト、テキスト選択色を調整しました。',
  },
];

/**
 * 最新のお知らせを取得。ANNOUNCEMENTS が空の場合は undefined。
 */
export function getLatestAnnouncement(): Announcement | undefined {
  return ANNOUNCEMENTS[0];
}
