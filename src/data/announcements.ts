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
    id: '2026-04-12-lang-switch',
    date: '2026-04-12',
    type: 'feature',
    title: '言語切替 (JP/EN) を追加',
    body: 'トップバーの JP/EN ボタンで日本語・英語を切替できるようになりました。設定はブラウザに保存され、次回アクセス時も維持されます。海外パートナーとの共有時に便利です。',
  },
  {
    id: '2026-04-12-workflow-nav',
    date: '2026-04-12',
    type: 'feature',
    title: 'ワークフロー連動ナビゲーション',
    body: 'ペトリネットの各工程 (Place) をクリックすると、対応するシステム画面に直接遷移できるようになりました。「計画中」→新規登録、「評価済」→ベイズ最適化など、業務フローと画面が 1:1 で対応します。',
  },
  {
    id: '2026-04-12-faceted-search',
    date: '2026-04-12',
    type: 'feature',
    title: 'ファセット検索 + 保存済クエリ',
    body: '材料データ一覧にファセットカウント付きマルチセレクトフィルタ、全物性値の範囲フィルタ、保存済クエリ (プリセット) を追加しました。「詳細条件」で開閉、「プリセット」でよく使うフィルタを保存・呼び出しできます。',
  },
  {
    id: '2026-04-12-step-wizard',
    date: '2026-04-12',
    type: 'feature',
    title: 'ステップ式入力ウィザードで登録を簡素化',
    body: '材料データの新規登録を 3 ステップ (基本情報→物性データ→確認) に分割しました。カテゴリ選択でプレースホルダーが自動切替され、確認画面で入力済み項目数が表示されます。',
  },
  {
    id: '2026-04-12-bayes-opt',
    date: '2026-04-12',
    type: 'feature',
    title: 'ベイズ最適化ページを追加 — 次実験候補の自動提案',
    body: 'ガウス過程回帰 + Expected Improvement 獲得関数で「次に試すべき実験点」を提案する新ページを追加しました。「ベイズ最適化」メニューから特徴変数と目的変数を選んで探索できます。',
  },
  {
    id: '2026-04-12-download-preview',
    date: '2026-04-12',
    type: 'feature',
    title: '全ダウンロードにプレビュー確認モーダルを導入',
    body: 'CSV / JSON / Markdown / MaiML / PNML / AI テキスト / 会話履歴 の全データダウンロードで、ファイル内容・サイズ・行数を確認してから「ダウンロード実行」を押す 2 段階フローに変更しました。',
  },
  {
    id: '2026-04-12-petri-net',
    date: '2026-04-12',
    type: 'feature',
    title: '金属試験ワークフローのペトリネット可視化を追加',
    body: '11 工程の金属試験ライフサイクルを Petri net で可視化する新ページを追加しました。トークンを発火させて工程を進められ、再加工フィードバックループや長時間試験の並行ステーション制約にも対応。PNML 形式で外部ツール (PIPE/GreatSPN) にエクスポート可能です。',
  },
  {
    id: '2026-04-10-notifications',
    date: '2026-04-10',
    type: 'feature',
    title: 'アプリ内お知らせ機能を追加',
    body: 'トップバー右側の鈴アイコン、ヘッダー下バナー、右下サポートボタンに未読バッジ付きで通知を表示するようになりました。「お知らせ」タブから過去の更新履歴もまとめて確認できます。',
  },
  {
    id: '2026-04-10-storybook',
    date: '2026-04-10',
    type: 'info',
    title: 'Storybook でデザインシステムを公開中',
    body: 'Matlens の UI コンポーネント・デザイントークン・パターンを Storybook で参照できます。トップバー右側の「Storybook」リンク、またはサポートパネル内のリンクから開けます。',
  },
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
