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
    id: '2026-04-23-adr-012-integration-strategy',
    date: '2026-04-23',
    type: 'info',
    title: 'ADR-012: machining-fundamentals との親密化統合戦略を草稿（Proposed）',
    body: '並行開発中の金属加工学習アプリ machining-fundamentals を、Matlens の事実上の公式ドキュメントとして位置づける親密化戦略を ADR-012 として草稿しました。相互リンク戦略 5 パターン（用語集双方向 / PAGE_GUIDES 誘導 / 章末 Matlens カード / RAG 統合 / 検索横断）と Phase 0〜4 の段階的統合計画を記載。peer 側との URL 規約合意 → Matlens PAGE_GUIDES 型拡張 → Phase 1 着手の順で進めます。',
  },
  {
    id: '2026-04-20-domain-research-phase-3',
    date: '2026-04-20',
    type: 'info',
    title: 'ドメインリサーチメモ第 3 弾（切削実機知 3 本）を追加 — 合計 10 本',
    body: '5 軸同時制御切削の運動学（B-table / B-head / RTCP / 特異点）、切削プロセス計測（温度 / 残留応力 / 加工変質層の手法比較）、特殊切削技術（MQL / クライオ / 超音波 / ハイブリッド製造）の 3 本を docs/research/ に追加。これで規格 / 認証 / セキュリティ / 連携 / 切削実機 / ビジネスの 6 領域を網羅する合計 10 本の研究ノートが揃いました。',
  },
  {
    id: '2026-04-20-domain-research-phase-2',
    date: '2026-04-20',
    type: 'info',
    title: 'ドメインリサーチメモ第 2 弾（NADCAP / 輸出管理 / LIMS 市場）を追加',
    body: '航空系試験所認定 NADCAP（AC7101 シリーズと Task Group）、ITAR / EAR / 外為法によるクラウド可否への影響、主要 LIMS（LabWare / Matrix Gemini / Sample Manager 等）と連携パターンを整理しました。合計 7 本の研究ノートが docs/research/ に揃い、現場ヒアリングで確認したい論点を各メモ末尾に明示しています。',
  },
  {
    id: '2026-04-20-domain-research',
    date: '2026-04-20',
    type: 'info',
    title: 'ドメインリサーチメモ 3 本を docs/research/ に追加',
    body: '航空宇宙材料の AMS (SAE) 体系、ISO/IEC 17025 7.8 の試験報告書必須記載事項と測定不確かさ、FAR Part 25 / MMPDS の A-basis / B-basis と統計要件を整理。公開情報ベースの学習ドラフトで、各メモ末尾に「現場で聞くこと」を併記しています。ApplicationGuide の現場入り準備キットセクションから辿れます。',
  },
  {
    id: '2026-04-20-onsite-prep-kit',
    date: '2026-04-20',
    type: 'info',
    title: '現場入り準備キットと ADR 10 本をリポジトリに追加',
    body: 'docs/onsite/ にヒアリングシート（11 画面分）・ペルソナ別ワークフロー仮説（4 ペルソナ）・既存ツール比較・痛み候補 30 件・知識ギャップ棚卸しを格納しました。あわせて docs/adr/ にフロント / ドメイン設計の判断ログ 10 本（切削ドメイン分離・決定論 fixture・Stability Lobe 段階実装・純 SVG 方針・Stage 2 集計境界など）を追加。Storybook の ApplicationGuide からも現在地と準備内容が辿れます。',
  },
  {
    id: '2026-04-20-cutting-sim-ui',
    date: '2026-04-20',
    type: 'feature',
    title: '切削経験式パネル（Kienzle / Stability Lobe / Taylor）を UI に統合',
    body: '切削条件エクスプローラで点を選ぶと、Kienzle モデルの Fc/P/MRR 見積（実測値との乖離率表示）と Altintas 2012 Stability Lobe 厳密曲線が右ペインに表示されるようになりました。工具ライフトラッカーには Taylor 工具寿命の回帰予測（R² 付）を追加し、実測点から n, C を推定して現行 Vc での予測寿命距離を算出します。',
  },
  {
    id: '2026-04-20-cutting-domain-math',
    date: '2026-04-20',
    type: 'feature',
    title: '切削プロセス経験式モジュール（Taylor / Kc / Stability Lobe）を追加',
    body: '工具寿命 (Taylor V·T^n=C)、切削抵抗 (Kienzle Kc1.1·h^(1-mc)·b)、安定性ローブ (Altintas 2012 単一 DOF モデル) を純 TS で実装。ISO 3685 の VB 閾値や工具材種別 Taylor 指数、被削材別 Kc 係数も規格定数として一元化しました。UI 統合は次回アップデート。',
  },
  {
    id: '2026-04-20-tool-life-tracker',
    date: '2026-04-20',
    type: 'feature',
    title: '工具ライフトラッカー（PoC）を追加',
    body: '工具個体ごとの累積加工距離 × 工具摩耗 VB の推移を可視化する新画面を追加しました。VB=0.3mm の摩耗限界ライン、実施プロセス数、総切削距離、びびり検出回数、直近プロセス一覧を集約表示します。',
  },
  {
    id: '2026-04-20-reports',
    date: '2026-04-20',
    type: 'feature',
    title: 'レポート画面（PoC）を追加',
    body: '試験報告書・損傷解析・検査成績書・サマリレポートを一覧化し、Markdown 本文を詳細で表示する新画面です。種別 / ステータスフィルタで絞込、案件詳細から相互リンクできます。',
  },
  {
    id: '2026-04-20-standards-master',
    date: '2026-04-20',
    type: 'feature',
    title: '規格マスタ（PoC）を追加',
    body: 'JIS / ASTM / ASME / ISO / EN 等の試験規格を組織タブで俯瞰する新画面です。詳細で関連試験種別・準拠材料・試験実績件数を確認でき、材料マスタから相互リンクします。',
  },
  {
    id: '2026-04-20-materials-master',
    date: '2026-04-20',
    type: 'feature',
    title: '材料マスタ（PoC）を追加',
    body: '試験ドメインの母材マスタを一覧化する新画面です。カテゴリ別カウント・キーワード検索、詳細で組成・物性・関連規格・直近試験実績を俯瞰できます。サイドバー「受託試験 (PoC)」→「材料マスタ」から開けます。',
  },
  {
    id: '2026-04-20-ops-dashboard',
    date: '2026-04-20',
    type: 'feature',
    title: '受託試験ダッシュボードを追加',
    body: '進行中案件数・期限 7 日以内の試験片・過去 30 日の完了試験・異常所見比率の KPI、納期リスク 7 日以内の案件一覧、最新の試験完了・損傷所見登録のタイムラインを 1 画面に集約しました。サイドバー「受託試験 (PoC)」→「受託試験ダッシュボード」から開けます。',
  },
  {
    id: '2026-04-20-specimen-tracker',
    date: '2026-04-20',
    type: 'feature',
    title: '試験片トラッカー（カンバン + テーブル）を追加',
    body: '受入 → 準備 → 試験中 → 試験済 → 保管のライフサイクルを俯瞰する新画面を追加しました。ビューはカンバン / テーブル切替、案件・母材・ステータス・キーワードでフィルタ可能。廃棄はオプションで表示できます。',
  },
  {
    id: '2026-04-20-cutting-waveform-viewer',
    date: '2026-04-20',
    type: 'feature',
    title: '切削条件エクスプローラに波形ビューアを追加',
    body: '切削条件エクスプローラで点を選ぶと、紐づく波形を時間領域 + 周波数領域（FFT 片側振幅スペクトル）で表示するようになりました。min / max / 平均 / RMS / 標準偏差 / ピーク周波数の統計値も併記。マルチチャネル対応で、切削抵抗 3 方向や振動・音響をタブで切替できます。',
  },
  {
    id: '2026-04-19-cutting-conditions-explorer',
    date: '2026-04-19',
    type: 'feature',
    title: '切削条件エクスプローラを追加',
    body: '切削速度 × 送りの散布図で過去加工を俯瞰し、びびり検出有無で色分け表示。母材 / 加工種別 / 工具種別 / びびり有無のフィルタ、点選択で工具・代表値・波形概要を右ペインに表示します。サイドバー「受託試験 (PoC)」から開けます。',
  },
  {
    id: '2026-04-19-cutting-process-domain',
    date: '2026-04-19',
    type: 'feature',
    title: '切削プロセスドメインの基盤を追加',
    body: '金属切削加工（転削・旋削）の条件・工具マスタ・時系列波形データを扱うドメイン層を追加しました。工具マスタ 12 件、加工プロセス 1,304 件、波形サンプル 250 件をモックデータとして同梱。UI は次回アップデートで追加予定です。',
  },
  {
    id: '2026-04-19-review-fixes-pr43',
    date: '2026-04-19',
    type: 'fix',
    title: 'レビュー指摘 32 件を一括対応',
    body: 'PR #43 のレビュー指摘（URL 解決仕様バグ、モック採番衝突、キーボード操作、aria-current 複合キー、MSW 起動失敗の可視化ほか）を一括で修正しました。',
  },
  {
    id: '2026-04-17-phase12-signature-screens',
    date: '2026-04-17',
    type: 'feature',
    title: 'PoC Phase 1/2 — 基盤刷新 + Signature Screens 3 本を追加',
    body: 'レイヤードアーキテクチャ（domain / infra / mocks / features）、Repository パターン、MSW による API モック化を導入。試験マトリクス・損傷ギャラリー・横断セマンティック検索の 3 画面と、案件一覧・詳細を追加しました。',
  },
  {
    id: '2026-04-13-help-guide',
    date: '2026-04-13',
    type: 'feature',
    title: 'ヘルプにページガイドを追加',
    body: '「ヘルプ・用語集」に新カテゴリ「ページガイド」を追加。全12ページの使い方ガイドと操作手順FAQを網羅しました。初めて使う方は「ページガイド」タブからご確認ください。',
  },
  {
    id: '2026-04-13-sidebar-labels',
    date: '2026-04-13',
    type: 'fix',
    title: 'サイドバーのセクションラベル改善',
    body: 'サイドバーのグルーピングラベル（概要/データ入力/ワークフロー等）が見えにくかった問題を修正。区切り線とコントラストを改善しました。',
  },
  {
    id: '2026-04-13-css-perf',
    date: '2026-04-13',
    type: 'fix',
    title: 'CSSレンダリングパフォーマンス改善',
    body: 'スクロールバーのテーマ適用で全要素 (*) セレクタを使用していた問題を修正。overflow 要素のみに限定し、レンダリング負荷を軽減しました。',
  },
  {
    id: '2026-04-12-mobile-responsive',
    date: '2026-04-12',
    type: 'feature',
    title: 'モバイル対応 — レスポンシブ UI の全面改修',
    body: 'サイドバーのオーバーレイ表示、Topbar の設定メニュー、レスポンシブカラムレイアウトを追加。スマートフォンでも快適に操作できるようになりました。',
  },
  {
    id: '2026-04-12-density-toggle',
    date: '2026-04-12',
    type: 'feature',
    title: 'UI 密度トグル (Compact / Regular / Relaxed)',
    body: 'トップバーの密度トグルで UI 全体のサイズを一括調整できるようになりました。Compact で情報密度を高め、Relaxed でゆったり表示。テーブル・カード・チャット・フォーム全てに適用されます。',
  },
  {
    id: '2026-04-12-nl-query',
    date: '2026-04-12',
    type: 'feature',
    title: '自然言語検索に対応',
    body: '「ニッケル合金で硬度300以上の承認済」のような自然言語クエリを入力すると、カテゴリ・数値範囲・ステータスなどのフィルタ条件に自動変換されます。',
  },
  {
    id: '2026-04-12-empirical-sim',
    date: '2026-04-12',
    type: 'feature',
    title: '経験式シミュレーション (4式)',
    body: 'Hall-Petch (結晶粒径→降伏応力)、Larson-Miller (クリープ寿命)、JMAK (変態分率)、複合則 (ROM) の 4 つの経験式を対話的にシミュレーション。パラメータ調整とグラフ表示がリアルタイムで連動します。',
  },
  {
    id: '2026-04-12-similar-improved',
    date: '2026-04-12',
    type: 'fix',
    title: '類似材料検索のヒット率を改善',
    body: 'Embedding テキストに硬度・引張強度・密度などの数値特性を追加し、検索精度を向上。しきい値のデフォルトを緩和し、結果ゼロ時のガイド UI も追加しました。',
  },
  {
    id: '2026-04-12-error-feedback',
    date: '2026-04-12',
    type: 'fix',
    title: '操作レスポンスの改善',
    body: 'AI 呼び出しエラー時の toast 通知、ベクトル検索の状態表示、一括削除の確認ダイアログなど、操作に対するフィードバックを全面的に強化しました。',
  },
  {
    id: '2026-04-12-pnml-import',
    date: '2026-04-12',
    type: 'feature',
    title: 'PNML インポート機能',
    body: 'ペトリネットページの「インポート」ボタンから .pnml / .xml ファイルを読み込み、トークン配置を復元できるようになりました。',
  },
  {
    id: '2026-04-12-bayes-2d',
    date: '2026-04-12',
    type: 'feature',
    title: '2D ベイズ最適化',
    body: '1D に加え 2D 特徴量空間でのガウス過程回帰に対応。グリッドスキャンで最適実験点を提案します。',
  },
  {
    id: '2026-04-12-provenance',
    date: '2026-04-12',
    type: 'feature',
    title: 'データ出所 (Provenance) バッジ',
    body: '材料データの出所（装置計測/手入力/AI推定/シミュレーション）を記録・表示できるようになりました。詳細ページで色付きバッジとして確認できます。',
  },
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
