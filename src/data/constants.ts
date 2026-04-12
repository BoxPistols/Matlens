import type { Provider, NavItem } from '../types';

export const PROVIDERS: Provider[] = [
  { id: 'openai-nano',  label: 'GPT-5.4 nano',    model: 'gpt-5.4-nano',  free: true },
  { id: 'gemini-flash', label: 'Gemini 2.5 Flash', model: 'gemini-2.5-flash', free: true },
  { id: 'openai-mini',  label: 'GPT-5.4 mini',    model: 'gpt-5.4-mini',  free: false, requiresKey: true },
];

export const RATE_LIMITS: Record<string, number> = {
  'public': 20,
  'invited': 30,
  'own-key': Infinity,
};

export const OWN_KEY_STORAGE = 'matlens_own_openai_key';

export const STORYBOOK_URL = 'https://matlens-storybook.vercel.app';

export const NAV_ITEMS: NavItem[] = [
  { section: '概要' },
  { id:'dash',    label:'ダッシュボード',    icon:'dashboard' },
  { id:'list',    label:'材料データ一覧',    icon:'list',    badge: true },
  { id:'catalog', label:'材料カタログ',      icon:'embed',   badgeLabel:'3D', badgeVariant:'vec' },
  { section: 'データ入力' },
  { id:'new',     label:'新規登録',         icon:'plus' },
  { section: 'ワークフロー' },
  { id:'petri',   label:'試験フロー可視化', icon:'workflow' },
  { id:'bayes',   label:'ベイズ最適化',    icon:'spark',   badgeLabel:'AI', badgeVariant:'ai', cls:'ai-nav' },
  { section: 'AI 分析・検索' },
  { id:'vsearch', label:'意味検索',         icon:'vecSearch', badgeLabel:'AI', badgeVariant:'vec', cls:'vec-nav' },
  { id:'rag',     label:'AI チャット',      icon:'rag',     badgeLabel:'AI',  badgeVariant:'ai',  cls:'ai-nav' },
  { id:'sim',     label:'類似材料を比較',   icon:'similar' },
  { section: 'ヘルプ・情報' },
  { id:'help',    label:'ヘルプ・用語集',   icon:'help' },
  { id:'about',   label:'技術スタック',     icon:'about' },
  { section: '開発者向け' },
  { id:'api',     label:'API テスト',       icon:'scan',    badgeLabel:'Dev', badgeVariant:'vec' },
  { id:'tests',   label:'テストスイート',   icon:'check',   badgeLabel:'Dev', badgeVariant:'green' },
  { id:'uxdesign',label:'UX設計ノート',     icon:'info' },
  { section: '設定' },
  { id:'settings',label:'カテゴリ・バッチ管理', icon:'settings' },
];

export const HELP_TERMS: { id: string; term: string; en: string; cat: string; catLabel: string; catVariant: string; body: string; related: string }[] = [
  {id:'hv',term:'硬度（ビッカース硬さ）',en:'Hardness (Vickers)',cat:'mat',catLabel:'材料工学',catVariant:'blue',body:'材料表面にダイヤモンド圧子を押し込み、生じたくぼみから算出する硬さの指標。単位は HV。値が大きいほど硬い。金属合金では 100〜1000 HV 程度が一般的。',related:'引張強さ、弾性率'},
  {id:'ts',term:'引張強さ',en:'Tensile Strength (UTS)',cat:'mat',catLabel:'材料工学',catVariant:'blue',body:'材料を引っ張ったとき、破断せずに耐えられる最大応力。単位は MPa。設計の基本的な強度指標。SUS304 で約 520 MPa、Ti-6Al-4V で約 950 MPa。',related:'耐力、伸び'},
  {id:'el',term:'弾性率（ヤング率）',en:"Young's Modulus",cat:'mat',catLabel:'材料工学',catVariant:'blue',body:'応力とひずみの比。材料の変形しにくさを示す。単位は GPa。材料固有の値で熱処理によらずほぼ一定。鋼鉄: 約 210 GPa、アルミ: 約 70 GPa、チタン: 約 110 GPa。',related:'耐力、弾性変形'},
  {id:'cae',term:'CAE（数値解析）',en:'Computer-Aided Engineering',cat:'mat',catLabel:'材料工学',catVariant:'blue',body:'コンピューターを用いた構造・流体・熱解析の総称。Matlens の材料特性値（弾性率・密度・熱伝導率など）は ANSYS・ABAQUS・LS-DYNA などの CAE ソフトの材料定義に直接使用される。',related:'弾性率、密度'},
  {id:'emb',term:'Embedding（埋め込み表現）',en:'Embedding / Word Vector',cat:'ai',catLabel:'AI / ML',catVariant:'ai',body:'テキストを数値ベクトルに変換したもの。意味的に似たデータは近い位置に配置されるため類似度計算が可能。Matlens では材料名・組成・特性テキストを 512 次元ベクトルに変換してインメモリインデックスに格納する。',related:'コサイン類似度、VSS'},
  {id:'cos',term:'コサイン類似度',en:'Cosine Similarity',cat:'ai',catLabel:'AI / ML',catVariant:'ai',body:'2つのベクトルがどれだけ同じ方向を向いているかを -1〜1 で表す類似度指標。方向のみ評価するためベクトルの大きさの影響を受けない。1.0=完全一致、0=無関係。ベクトル検索では上位スコア材料をランキング表示する。',related:'Embedding、ベクトル検索'},
  {id:'rag',term:'RAG（検索拡張生成）',en:'Retrieval-Augmented Generation',cat:'ai',catLabel:'AI / ML',catVariant:'ai',body:'LLM の回答生成前に関連文書を検索してコンテキストとして注入する手法。ハルシネーション（でたらめな回答）を減らし根拠のある回答を実現する。Matlens では類似度上位 4 件の材料データを Claude に渡してから回答させる。',related:'Embedding、Claude API'},
  {id:'crud',term:'CRUD',en:'Create, Read, Update, Delete',cat:'sys',catLabel:'システム',catVariant:'green',body:'データ操作の4基本操作の頭文字。Create=新規登録、Read=閲覧、Update=編集、Delete=削除。Matlens は全 CRUD 操作に対応。削除は誤操作防止のため確認ダイアログを挟む。',related:'データ登録、編集'},
  {id:'wcag',term:'WCAG（ウェブアクセシビリティ）',en:'Web Content Accessibility Guidelines',cat:'sys',catLabel:'システム',catVariant:'green',body:'W3C が策定したウェブアクセシビリティのガイドライン。Matlens は AA 準拠を目標。対応項目: コントラスト比 4.5:1 以上、フォーカスリング表示、スキップナビゲーション、aria-label / role 属性、最小フォントサイズ 12px。',related:'フォーカスリング、aria-label'},
  {id:'op-filter',term:'複合フィルタ検索',en:'Advanced Filter',cat:'ops',catLabel:'操作ガイド',catVariant:'amber',body:'材料データ一覧で使える多条件フィルタ。全文検索（名称・ID・組成・備考・登録者）、カテゴリ・ステータス・バッチ番号のドロップダウン絞り込み、詳細条件での硬度数値範囲指定が可能。アクティブなフィルタはタグとして表示され個別解除できる。',related:'一覧画面、ベクトル検索'},
  {id:'petri',term:'ペトリネット',en:'Petri Net (P/T net)',cat:'sys',catLabel:'システム',catVariant:'green',body:'Place（丸）・Transition（四角）・トークン（●）で並行システムの状態遷移を表すモデル。複数サンプルの並行進行・再加工ループ（サイクル）・合流/分岐を一つのモデルで記述できる。DAG（有向非巡回グラフ）では表現できないフィードバック（例: 後加工済→一次加工済 の再加工）を扱えるのが決定的な採用理由。Matlens では金属試験 11 工程を 12 place / 12 transition で定義し、長時間試験 place には capacity=2 を設定している。原則として順方向発火のみだが、(1) 再加工 t4 のような物理的な逆方向トランジションを定義できる、(2) UI の「1 手戻る」で直前の操作を Undo できる、の 2 通りで戻る動作を表現する。',related:'PNML、MaiML'},
  {id:'pnml',term:'PNML',en:'Petri Net Markup Language (ISO/IEC 15909-2)',cat:'sys',catLabel:'システム',catVariant:'green',body:'ペトリネットを記述する XML ベースの標準交換フォーマット。ISO/IEC 15909-2 で規定。place / transition / arc と初期マーキング・capacity・座標を保持する。Matlens のワークフロー可視化ページから PNML エクスポートすると、PIPE・GreatSPN・CPN Tools 等の解析ツールに読み込んで到達可能性解析・デッドロック検出などが行える。',related:'ペトリネット、エクスポート'},
  {id:'guide-dash',term:'ダッシュボード',en:'Dashboard',cat:'guide',catLabel:'ページガイド',catVariant:'blue',body:'アプリを開いて最初に表示される概要画面です。登録データの総数・ステータス分布・カテゴリ構成をグラフで確認できます。AIインサイトパネルでは、データ全体の傾向分析と推奨アクションが自動生成されます。「レポート」ボタンでサマリーをダウンロードできます。',related:'材料データ一覧、AI チャット'},
  {id:'guide-list',term:'材料データ一覧',en:'Material List',cat:'guide',catLabel:'ページガイド',catVariant:'blue',body:'登録済みの全材料データをテーブル・カード・コンパクトの3表示で閲覧できます。上部の検索バーで名称・ID・組成による全文検索、「詳細条件」でカテゴリ・ステータス・硬度範囲などのファセット検索が可能です。「プリセット」によく使う検索条件を保存できます。行クリックで詳細ページ、チェックボックスで一括操作（承認・削除）ができます。',related:'ファセット検索、新規登録'},
  {id:'guide-new',term:'新規登録（ステップウィザード）',en:'New Entry (Step Wizard)',cat:'guide',catLabel:'ページガイド',catVariant:'blue',body:'材料データの新規登録を3ステップで行います。Step1: 材料名・カテゴリ・組成などの基本情報を入力。カテゴリを選ぶと物性値のプレースホルダーが自動切替されます。Step2: 硬度・引張強さ・弾性率などの物性データと、データ出所・試験方法を入力。「物性値をAIで推定」ボタンで組成からの推定値を自動入力できます。Step3: 全入力内容を確認して登録。入力途中のデータはブラウザに自動保存され、次回アクセス時に復元できます。',related:'ステップ式入力ウィザード、AI インサイト'},
  {id:'guide-detail',term:'材料詳細',en:'Material Detail',cat:'guide',catLabel:'ページガイド',catVariant:'blue',body:'個別の材料データを詳しく確認するページです。物性値一覧、同カテゴリとの硬度比較グラフ、AI による特徴分析が表示されます。「前へ/次へ」で隣のレコードに移動できます。CSV・JSON・MaiML形式でのダウンロード、「AIチャットで詳しく」から材料コンテキスト付きのAI対話、「類似材料を探す」から類似検索への遷移が可能です。',related:'材料データ一覧、エクスポート'},
  {id:'guide-petri',term:'試験フロー可視化',en:'Workflow Visualization',cat:'guide',catLabel:'ページガイド',catVariant:'blue',body:'金属試験の11工程（計画→材料選定→加工→試験→レポート）をペトリネット図で可視化します。丸(Place)がサンプルの状態、四角(Transition)が工程操作を表します。●トークンをクリックで発火させて工程を進められます。再加工ループにも対応。各工程をクリックすると対応する画面に直接遷移できます（ワークフロー連動ナビゲーション）。PNML形式でエクスポート/インポートし、外部解析ツール(PIPE等)と連携可能です。',related:'ペトリネット、PNML、ワークフロー連動ナビゲーション'},
  {id:'guide-bayes',term:'ベイズ最適化',en:'Bayesian Optimization',cat:'guide',catLabel:'ページガイド',catVariant:'blue',body:'「次にどのパラメータで実験すべきか」をAIが提案するページです。特徴変数（例: 硬度）と目的変数（例: 引張強さ）を選ぶと、ガウス過程回帰で予測分布を計算し、Expected Improvement（改善期待値）が最大の点を次実験候補として提示します。1D（1変数）と2D（2変数）に対応。グラフの青帯は予測の不確実性（±2σ）を示します。',related:'ベイズ最適化、ガウス過程回帰'},
  {id:'guide-sim',term:'経験式シミュレーション',en:'Empirical Simulation',cat:'guide',catLabel:'ページガイド',catVariant:'blue',body:'材料科学の代表的な4つの経験式を対話的にシミュレーションします。Hall-Petch式（結晶粒径→降伏応力）、Larson-Millerパラメータ（クリープ寿命）、JMAK式（変態分率）、複合則ROM（複合材料の弾性率）。パラメータをスライダーで調整すると即座にグラフが更新されます。結果は全て参考値です。',related:'Hall-Petch 式、Larson-Miller パラメータ'},
  {id:'guide-vsearch',term:'意味検索（ベクトル検索）',en:'Semantic Search',cat:'guide',catLabel:'ページガイド',catVariant:'blue',body:'自然言語で材料を検索できるページです。例えば「耐熱性の高いニッケル合金」のような文章で検索すると、テキストの意味を理解してコサイン類似度でランキング表示します。内部ではTensorFlow.jsのUniversal Sentence Encoderが動作し、ブラウザ内で完結します（サーバー不要）。検索結果からAIチャットや詳細ページに遷移できます。',related:'Embedding、コサイン類似度'},
  {id:'guide-rag',term:'AIチャット（RAG）',en:'AI Chat (RAG)',cat:'guide',catLabel:'ページガイド',catVariant:'blue',body:'材料データベースの内容をもとにAIと対話できるページです。質問すると、まずベクトル検索で関連する材料データ上位4件を取得し、それをコンテキストとしてAIに渡して回答を生成します（RAG: 検索拡張生成）。これにより、AIの一般知識ではなくMatlensに登録されたデータに基づいた根拠ある回答が得られます。Cmd+Enter（Mac）/ Ctrl+Enter（Win）で送信します。',related:'RAG、Embedding'},
  {id:'guide-similar',term:'類似材料探索',en:'Similar Materials',cat:'guide',catLabel:'ページガイド',catVariant:'blue',body:'基準となる材料IDまたは名称を入力して、データベースから類似する材料を探します。Embeddingベクトルのコサイン類似度でランキングし、AIが選定ポイントと用途別の使い分けをアドバイスします。しきい値スライダーで候補の絞り込みが可能です。詳細ページの「類似材料を探す」ボタンからも遷移できます。',related:'コサイン類似度、Embedding'},
  {id:'guide-help',term:'ヘルプ・用語集',en:'Help & Glossary',cat:'guide',catLabel:'ページガイド',catVariant:'blue',body:'今ご覧のこのページです。Matlensで使われる専門用語、各ページの使い方ガイド、操作方法のリファレンスを検索・閲覧できます。カテゴリタブ（材料工学/AI・ML/システム/操作ガイド/ページガイド）で絞り込み、上部の検索ボックスでキーワード検索ができます。',related:'FAQ、サポート'},
  {id:'guide-settings',term:'カテゴリ・バッチ管理',en:'Categories & Batches',cat:'guide',catLabel:'ページガイド',catVariant:'blue',body:'登録データのカテゴリ別・ステータス別の分布を確認するページです。各カテゴリの件数割合をプログレスバーで可視化します。バッチ番号ごとのデータ件数や、登録者ごとの担当件数も確認できます。データの管理状況の全体像を把握するのに便利です。',related:'材料データ一覧'},
];

export interface PageGuide {
  id: string;
  icon: string;
  title: string;
  titleEn: string;
  summary: string;
  summaryEn: string;
  features: string[];
  featuresEn: string[];
  tips: string[];
  tipsEn: string[];
  related: string[];
}

export const PAGE_GUIDES: PageGuide[] = [
  {
    id: 'dash', icon: 'dashboard',
    title: 'ダッシュボード', titleEn: 'Dashboard',
    summary: 'アプリを開いて最初に表示される概要画面です。登録データ全体の状況を俯瞰し、次のアクションを見つける起点になります。',
    summaryEn: 'The overview screen shown when you open the app. Provides a bird\'s-eye view of all registered data and helps you decide what to do next.',
    features: [
      '登録データの総数・ステータス分布をグラフで確認',
      'AI インサイトでデータ全体の傾向分析を自動生成',
      '「レポート」ボタンでサマリーをダウンロード',
      'カテゴリ別・ステータス別の 2 種類の円グラフ',
    ],
    featuresEn: [
      'View total data count and status distribution in charts',
      'Auto-generate trend analysis with AI Insights',
      'Download a summary via the Report button',
      'Two pie charts: by category and by status',
    ],
    tips: [
      'グラフはカテゴリ別・ステータス別の2種類が表示される',
      'AI インサイトはページ読込時に自動生成される',
      'お知らせバナーから最新の更新情報を確認できる',
    ],
    tipsEn: [
      'Two chart types are shown: by category and by status',
      'AI Insights are auto-generated on page load',
      'Check the announcement banner for latest updates',
    ],
    related: ['list', 'rag'],
  },
  {
    id: 'list', icon: 'list',
    title: '材料データ一覧', titleEn: 'Material List',
    summary: '全登録材料をテーブル・カード・コンパクトの3表示モードで閲覧できる中核画面です。強力な検索・フィルタ機能で目的のデータに素早くアクセスできます。',
    summaryEn: 'The central screen for browsing all registered materials in three view modes (table, card, compact). Powerful search and filter features help you find data quickly.',
    features: [
      'テーブル・カード・コンパクトの3表示モード切替',
      '全文検索バーで名称・ID・組成・備考・登録者を横断検索',
      'ファセット検索（カテゴリ・ステータス・バッチ・数値範囲）',
      '検索プリセットの保存・呼び出し',
      'チェックボックスで選択→一括削除・一括エクスポート',
    ],
    featuresEn: [
      'Switch between table, card, and compact view modes',
      'Full-text search across name, ID, composition, notes, and registrant',
      'Faceted search (category, status, batch, numeric ranges)',
      'Save and recall search presets',
      'Select with checkboxes for bulk delete or export',
    ],
    tips: [
      '行クリックで詳細ページに遷移',
      '「詳細条件」パネルでファセットフィルタを展開',
      'アクティブなフィルタはタグ表示され個別に解除可能',
      '自然言語クエリにも対応（例:「ニッケル合金で硬度300以上」）',
    ],
    tipsEn: [
      'Click a row to navigate to the detail page',
      'Expand the Advanced Filters panel for faceted search',
      'Active filters are shown as tags and can be removed individually',
      'Natural language queries are supported (e.g., "nickel alloy with hardness over 300")',
    ],
    related: ['new', 'vsearch', 'detail'],
  },
  {
    id: 'new', icon: 'plus',
    title: '新規登録', titleEn: 'New Entry',
    summary: '3ステップのウィザード形式で材料データを登録します。AI による物性値推定やカテゴリ別テンプレートで入力を効率化できます。',
    summaryEn: 'Register material data in a 3-step wizard. AI property estimation and category templates streamline data entry.',
    features: [
      'Step1: 材料名・カテゴリ・組成の基本情報入力',
      'Step2: 硬度・引張強さ等の物性データ入力',
      'Step3: 全入力値を確認して登録',
      '「AIで推定」ボタンで組成から物性値の目安を自動入力',
      'カテゴリ選択でプレースホルダーが自動切替',
    ],
    featuresEn: [
      'Step 1: Enter basic info — name, category, composition',
      'Step 2: Enter properties — hardness, tensile strength, etc.',
      'Step 3: Review all inputs and register',
      'Auto-fill property estimates from composition via AI',
      'Placeholders change automatically based on selected category',
    ],
    tips: [
      '入力途中でもブラウザに自動保存（下書き機能）',
      '各ステップにバリデーションあり、未入力項目はハイライト表示',
      '確認画面で入力済み項目数が表示される',
    ],
    tipsEn: [
      'Auto-saved to browser as you type (draft feature)',
      'Each step has validation; unfilled fields are highlighted',
      'The review screen shows the count of filled fields',
    ],
    related: ['list', 'detail'],
  },
  {
    id: 'detail', icon: 'info',
    title: '材料詳細', titleEn: 'Material Detail',
    summary: '個別材料の物性値一覧、同カテゴリ比較グラフ、AI 特徴分析を表示するページです。他ページへの起点としても機能します。',
    summaryEn: 'Displays property values, same-category comparison charts, and AI feature analysis for individual materials. Also serves as a hub for navigation.',
    features: [
      '物性値一覧をカード形式で表示',
      '同カテゴリ内の硬度比較グラフ',
      'AI が材料の特徴を自動分析・要約',
      'CSV / JSON / MaiML 形式でダウンロード',
      '「AIチャットで詳しく」「類似材料を探す」への遷移ボタン',
    ],
    featuresEn: [
      'Property values displayed in card format',
      'Hardness comparison chart within the same category',
      'AI auto-analyzes and summarizes material characteristics',
      'Download in CSV / JSON / MaiML formats',
      'Navigation buttons to AI Chat and Similar Materials',
    ],
    tips: [
      '前後レコードボタンで一覧を順に閲覧できる',
      'ダウンロード前にプレビュー確認モーダルが表示される',
      '編集ボタンでそのままフォーム画面に遷移',
    ],
    tipsEn: [
      'Use prev/next buttons to browse records sequentially',
      'A preview confirmation modal appears before download',
      'Click the edit button to jump directly to the form',
    ],
    related: ['list', 'rag', 'sim'],
  },
  {
    id: 'petri', icon: 'workflow',
    title: '試験フロー可視化', titleEn: 'Workflow Visualization',
    summary: '金属試験の 11 工程をペトリネット図で可視化するページです。トークン発火で工程を進行し、再加工ループも表現できます。',
    summaryEn: 'Visualizes 11 metal testing steps as a Petri net diagram. Advance workflow by firing tokens, with support for rework loops.',
    features: [
      '丸（Place）が状態、四角（Transition）が工程を表現',
      'トークンクリックで工程を発火・進行',
      '再加工ループ（サイクル）に対応',
      '各工程クリックで対応画面に直接遷移（ワークフロー連動ナビ）',
      'PNML 形式でエクスポート・インポート可能',
    ],
    featuresEn: [
      'Circles (Places) represent states; rectangles (Transitions) represent steps',
      'Click tokens to fire and advance the workflow',
      'Supports rework loops (cycles)',
      'Click each step to navigate directly to the corresponding page',
      'Export and import in PNML format',
    ],
    tips: [
      '青枠の Transition がクリック可能（発火条件を満たしている）',
      '「1手戻る」ボタンで直前の操作を Undo できる',
      'Place をクリックすると関連ページに遷移する',
    ],
    tipsEn: [
      'Blue-bordered Transitions are clickable (firing conditions met)',
      'Use the Undo button to revert the last action',
      'Clicking a Place navigates to the related page',
    ],
    related: ['new', 'simulate', 'bayes'],
  },
  {
    id: 'bayes', icon: 'spark',
    title: 'ベイズ最適化', titleEn: 'Bayesian Optimization',
    summary: 'ガウス過程回帰（GP）で予測分布を推定し、Expected Improvement が最大の点を「次に試すべき実験」として提案します。',
    summaryEn: 'Estimates predictive distributions via Gaussian Process regression and suggests the next experiment point by maximizing Expected Improvement.',
    features: [
      '特徴変数と目的変数を選択して最適化を実行',
      'ガウス過程回帰による予測分布の可視化',
      'Expected Improvement（EI）獲得関数で次実験候補を提示',
      '1D / 2D の特徴量空間に対応',
    ],
    featuresEn: [
      'Select feature and target variables to run optimization',
      'Visualize predictive distributions via Gaussian Process regression',
      'Suggest next experiment candidate using Expected Improvement (EI)',
      'Supports 1D and 2D feature spaces',
    ],
    tips: [
      '青帯は予測不確実性（±2σ）を表す',
      'データ点が少なくても有効（少数データ向き）',
      '赤い★マークが次実験の推奨ポイント',
    ],
    tipsEn: [
      'The blue band represents prediction uncertainty (+-2 sigma)',
      'Effective even with few data points (designed for small datasets)',
      'The red star marks the recommended next experiment point',
    ],
    related: ['simulate', 'list'],
  },
  {
    id: 'simulate', icon: 'info',
    title: '経験式シミュレーション', titleEn: 'Empirical Simulation',
    summary: '材料科学の代表的な 4 つの経験式を対話的にシミュレーションできます。パラメータをスライダーで調整し、即座にグラフで確認。',
    summaryEn: 'Interactively simulate four classic empirical formulas in materials science. Adjust parameters with sliders and see results in real-time charts.',
    features: [
      'Hall-Petch 式: 結晶粒径 → 降伏応力',
      'Larson-Miller パラメータ: 温度・時間 → クリープ破断寿命',
      'JMAK 式: 変態分率の時間発展',
      '複合則 ROM: 体積分率 → 弾性率',
    ],
    featuresEn: [
      'Hall-Petch: grain size to yield stress',
      'Larson-Miller: temperature and time to creep rupture life',
      'JMAK: transformation fraction over time',
      'Rule of Mixtures: volume fraction to elastic modulus',
    ],
    tips: [
      'スライダーで各パラメータを調整するとグラフが即座に更新',
      'プリセットボタンで代表的な材料の値に一括セット',
      '全て参考値 — 実設計では実測データと照合してください',
    ],
    tipsEn: [
      'Adjust each parameter with sliders for instant graph updates',
      'Use preset buttons to load typical material values',
      'All values are reference only — cross-check with measured data for real design',
    ],
    related: ['bayes', 'list'],
  },
  {
    id: 'vsearch', icon: 'vecSearch',
    title: '意味検索', titleEn: 'Semantic Search',
    summary: '自然言語で材料を検索できるベクトル検索ページです。TensorFlow.js がブラウザ内で動作するため、サーバー通信は不要です。',
    summaryEn: 'Search materials using natural language. TensorFlow.js runs in-browser, so no server communication is needed.',
    features: [
      '「耐熱性の高いニッケル合金」のような文章で検索可能',
      'Embedding によるコサイン類似度ランキング表示',
      '各結果にスコア（類似度）を表示',
      '検索結果から AI チャットや詳細ページに遷移可能',
    ],
    featuresEn: [
      'Search with natural sentences like "high heat-resistant nickel alloy"',
      'Ranked by cosine similarity via Embeddings',
      'Each result shows a similarity score',
      'Navigate from results to AI Chat or Detail pages',
    ],
    tips: [
      '初回ロード時にモデルをダウンロード（数秒かかる場合あり）',
      'キーワードだけでなく文章で検索すると精度が上がる',
      'スコアが低い場合は通常のフィルタ検索にフォールバック',
    ],
    tipsEn: [
      'The model is downloaded on first load (may take a few seconds)',
      'Full sentences yield better accuracy than single keywords',
      'Falls back to standard filter search when scores are low',
    ],
    related: ['rag', 'list'],
  },
  {
    id: 'rag', icon: 'rag',
    title: 'AI チャット', titleEn: 'AI Chat',
    summary: '材料データベースをコンテキストに AI と対話できる RAG（検索拡張生成）チャットです。登録データに基づいた根拠ある回答が得られます。',
    summaryEn: 'A RAG (Retrieval-Augmented Generation) chat that uses your material database as context. Get grounded answers based on registered data.',
    features: [
      '質問するとベクトル検索で関連材料 4 件を自動取得',
      '取得データをコンテキストとして AI に渡して回答生成',
      'プロバイダー切替（GPT-5.4 nano / Gemini 2.5 Flash）',
      'チャット履歴をセッション内で保持',
    ],
    featuresEn: [
      'Automatically retrieves 4 related materials via vector search on each query',
      'Injects retrieved data as context for AI-generated answers',
      'Switch providers (GPT-5.4 nano / Gemini 2.5 Flash)',
      'Chat history is kept within the session',
    ],
    tips: [
      'Cmd+Enter / Ctrl+Enter で送信',
      '具体的な材料名や特性値を含めると精度が上がる',
      '詳細ページの「AIチャットで詳しく」から遷移すると初期クエリ付きで開く',
    ],
    tipsEn: [
      'Send with Cmd+Enter / Ctrl+Enter',
      'Including specific material names or property values improves accuracy',
      'Navigating from Detail page\'s "Ask AI" opens with an initial query',
    ],
    related: ['vsearch', 'sim'],
  },
  {
    id: 'sim', icon: 'similar',
    title: '類似材料探索', titleEn: 'Similar Materials',
    summary: '基準材料を指定して Embedding 類似度でランキングし、AI が選定ポイントと使い分けをアドバイスします。',
    summaryEn: 'Specify a reference material, rank by Embedding similarity, and get AI advice on selection criteria and usage.',
    features: [
      '基準材料 ID または名称を入力して検索',
      'Embedding 類似度でランキング表示',
      'AI が選定ポイントと使い分けをアドバイス',
      'しきい値スライダーで候補を絞り込み',
    ],
    featuresEn: [
      'Enter a reference material ID or name to search',
      'Results ranked by Embedding similarity',
      'AI provides advice on selection criteria and usage',
      'Filter candidates with the threshold slider',
    ],
    tips: [
      '詳細ページの「類似材料を探す」ボタンから遷移すると基準材料が自動入力される',
      'しきい値を下げると候補が増え、上げると厳選される',
      '結果の各行をクリックで詳細ページに遷移',
    ],
    tipsEn: [
      'Navigating from Detail\'s "Find Similar" auto-fills the reference material',
      'Lowering the threshold shows more candidates; raising it narrows results',
      'Click any result row to go to the detail page',
    ],
    related: ['vsearch', 'detail'],
  },
  {
    id: 'catalog', icon: 'embed',
    title: '材料カタログ', titleEn: 'Material Catalog',
    summary: '登録材料をビジュアルカード形式で一覧表示するページです。CSS/SVG ビジュアルで材料の種類を直感的に把握できます。',
    summaryEn: 'Browse registered materials as visual cards. CSS/SVG visuals help you intuitively grasp material types.',
    features: [
      '組成・カテゴリに応じた CSS/SVG ビジュアルカード',
      'クリックで詳細ページに遷移',
      'テーブル一覧よりも視覚的に把握しやすい',
    ],
    featuresEn: [
      'Visual cards with CSS/SVG based on composition and category',
      'Click to navigate to the detail page',
      'More visual than the table list view',
    ],
    tips: [
      'カードの色やパターンはカテゴリを反映している',
      '多数のデータがある場合はスクロールして閲覧',
    ],
    tipsEn: [
      'Card colors and patterns reflect the category',
      'Scroll to browse when there are many entries',
    ],
    related: ['list', 'detail'],
  },
  {
    id: 'help', icon: 'help',
    title: 'ヘルプ・用語集', titleEn: 'Help / Glossary',
    summary: 'このページです。専門用語解説、各ページの使い方ガイド、操作リファレンスを検索・閲覧できます。',
    summaryEn: 'This page. Search and browse technical term explanations, page guides, and operation references.',
    features: [
      'カテゴリタブで絞り込み（ページガイド・材料工学・AI/ML・システム・操作ガイド）',
      '検索ボックスでキーワード検索',
      'FAQ セクションでよくある質問に回答',
    ],
    featuresEn: [
      'Filter by category tab (Page Guide, Materials, AI/ML, System, Operations)',
      'Keyword search via search box',
      'FAQ section answers common questions',
    ],
    tips: [
      '「ページガイド」タブで全画面の操作説明を確認',
      '英語名も検索対象に含まれる',
    ],
    tipsEn: [
      'Check the Page Guide tab for instructions on all screens',
      'English names are also included in search results',
    ],
    related: ['about'],
  },
  {
    id: 'settings', icon: 'settings',
    title: 'カテゴリ・バッチ管理', titleEn: 'Categories & Batches',
    summary: '登録データのカテゴリ別・ステータス別分布をプログレスバーで可視化し、データ管理状況の全体像を把握できます。',
    summaryEn: 'Visualize category and status distributions with progress bars, providing an overview of data management status.',
    features: [
      'カテゴリ別・ステータス別の分布プログレスバー',
      'バッチ番号ごとのデータ件数表示',
      '登録者ごとの担当件数確認',
    ],
    featuresEn: [
      'Distribution progress bars by category and status',
      'Data count per batch number',
      'Entry count per registrant',
    ],
    tips: [
      'データの偏りや未処理件数の把握に便利',
      'ダッシュボードのグラフと併せて管理状況を確認',
    ],
    tipsEn: [
      'Useful for spotting data imbalances and unprocessed items',
      'Check alongside dashboard charts for a complete management overview',
    ],
    related: ['dash', 'list'],
  },
];

export const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: '初めて使います。何から始めればいいですか？', a: 'まず「ダッシュボード」で全体像を確認し、「材料データ一覧」でサンプルデータを閲覧してみてください。次に「新規登録」で自分のデータを登録し、「AIチャット」や「ベイズ最適化」を試すのがおすすめです。' },
  { q: 'ページ間の移動方法は？', a: '左のサイドバーから各ページに移動できます。モバイルでは左上のハンバーガーメニュー (≡) をタップしてください。ペトリネットの工程クリックからも対応ページに遷移できます。' },
  { q: 'データを登録するには？', a: 'サイドバーの「新規登録」をクリックします。3ステップのウィザード形式で、基本情報→物性データ→確認の順に入力します。組成を入力するとAIが物性値の目安を提案してくれます。' },
  { q: 'データをエクスポートするには？', a: '材料一覧ページの「エクスポート」ボタンから CSV / JSON / MaiML 形式で一括出力できます。個別データは詳細ページから MaiML / CSV / JSON でダウンロードできます。' },
  { q: 'テーマや表示密度を変えるには？', a: 'トップバーの Light/Dark/Eng/CAE ボタンでテーマを、Compact/Regular/Relaxed ボタンで表示密度を切り替えられます。モバイルでは右上の「⋯」メニューから設定できます。設定はブラウザに保存されます。' },
  { q: 'ペトリネットの使い方は？', a: '丸（Place）がサンプルの状態、四角（Transition）が工程です。青枠のTransitionをクリックすると工程が進みます。●トークンがサンプルの位置を表します。「1手戻る」で操作を取り消せます。各Placeをクリックすると対応するシステム画面に遷移します。' },
  { q: 'ベイズ最適化の結果の見方は？', a: '青い実線がガウス過程の予測平均、水色の帯が不確実性（±2σ）です。赤い★マークが「次に試すべき実験点」の提案です。データ点が少ない領域ほど不確実性が大きくなり、そこが探索候補になります。' },
  { q: 'データはどこに保存されますか？', a: '現在はブラウザのメモリ上に保持されます。ページをリロードするとサンプルデータにリセットされます。CSV/JSON でエクスポート可能です。' },
  { q: 'ベクトル検索とは何ですか？', a: 'TensorFlow.js の Universal Sentence Encoder でテキストをベクトル化し、意味的に類似した材料をコサイン類似度で検索します。ブラウザ内で完結します。' },
  { q: 'AI 機能は無料ですか？', a: 'GPT-5.4 nano と Gemini 2.5 Flash は 1日30回まで無料です。自分の OpenAI API キーを設定すると GPT-5.4 mini が無制限で使えます。' },
  { q: '4つのテーマの違いは？', a: 'Light（標準）、Dark（暗色）、Eng（端末風）、CAE（解析風）の4種。トップバーで切替できます。' },
  { q: 'オフラインで使えますか？', a: 'CDN の読み込みにインターネット接続が必要です。初回読み込み後はブラウザキャッシュで一部動作しますが、AI 機能は接続が必要です。' },
  { q: '試験フロー可視化で工程を戻せますか？', a: 'ペトリネットは本来順方向発火のみですが、Matlens では 2 通りの「戻る」動作を用意しています。(1)「再加工」トランジション t4 — 後加工済 → 一次加工済 の物理的に意味のあるフィードバックループをネット上で定義済み。(2)「1 手戻る」ボタン — 直前の発火／サンプル追加を UI レベルで Undo（最大 20 手まで）。不可逆な工程（破壊試験後など）は設計上戻せません。' },
  { q: 'PNML ファイルはどこで使えますか？', a: 'PNML は ISO/IEC 15909-2 準拠のペトリネット標準交換フォーマット。試験フロー可視化ページの「PNML」ボタンでダウンロードすると、PIPE・GreatSPN・CPN Tools 等の外部ツールに読み込んで到達可能性解析やデッドロック検出ができます。' },
];

export const SUPPORT_TABS: { id: string; label: string; icon: string }[] = [
  { id: 'help', label: 'ヘルプ', icon: 'help' },
  { id: 'news', label: 'お知らせ', icon: 'spark' },
  { id: 'faq',  label: 'Q&A',   icon: 'info' },
  { id: 'ai',   label: 'AI設定', icon: 'ai' },
];
