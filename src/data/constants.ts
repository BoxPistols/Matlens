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
  { id:'simulate',label:'経験式シミュレーション', icon:'info' },
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
  {id:'maiml',term:'MaiML',en:'Measurement and Instrument Markup Language (JIS K 0200:2024)',cat:'sys',catLabel:'システム',catVariant:'green',body:'分析化学・材料試験の計測データを記述する XML フォーマット。JIS K 0200:2024 で規定。試料情報・測定条件・結果値を構造化して記述する。Matlens では材料データのエクスポート/インポートに対応しており、ラボ計測器との連携に使用する。',related:'エクスポート、PNML'},
  {id:'nde',term:'NDE（非破壊評価）',en:'Non-Destructive Evaluation',cat:'mat',catLabel:'材料工学',catVariant:'blue',body:'材料や構造物を破壊せずに内部欠陥・特性を評価する技術の総称。X 線 CT、超音波探傷、透過 X 線などの手法がある。航空機エンジン部品の品質保証に不可欠。Matlens では試験方法 (testMethod) フィールドで NDE 手法を記録できる。',related:'X線回折、試験方法'},
  {id:'provenance',term:'データ出所（Provenance）',en:'Data Provenance',cat:'sys',catLabel:'システム',catVariant:'green',body:'材料データがどのように生成されたかを示すメタデータ。装置計測 (instrument)・手入力 (manual)・AI 推定 (ai)・シミュレーション (simulation) の 4 種類。データの信頼性評価や品質管理に使用する。詳細ページで色付きバッジとして表示される。',related:'品質管理、MaiML'},
  {id:'facet-search',term:'ファセット検索',en:'Faceted Search',cat:'ops',catLabel:'操作ガイド',catVariant:'amber',body:'複数の分類軸（カテゴリ・ステータス・バッチ・データ出所）で同時に絞り込む検索方式。各軸の値に該当件数 (facet count) が表示され、マルチセレクト可能。「詳細条件」パネルで全軸のフィルタを展開し、プリセットで保存・呼び出しもできる。',related:'複合フィルタ検索、プリセット'},
  {id:'step-wizard',term:'ステップ式入力ウィザード',en:'Step Wizard',cat:'ops',catLabel:'操作ガイド',catVariant:'amber',body:'材料データの新規登録を 3 ステップ (基本情報→物性データ→確認) に分割した入力フォーム。各ステップにバリデーションがあり、カテゴリ選択でプレースホルダーが自動切替される。確認画面で全入力値と入力済み項目数が表示される。',related:'新規登録、カテゴリ別テンプレート'},
  {id:'bayes-opt',term:'ベイズ最適化',en:'Bayesian Optimization',cat:'ai',catLabel:'AI / ML',catVariant:'ai',body:'ガウス過程回帰 (GP) で材料特性の予測分布を推定し、Expected Improvement (EI) 獲得関数で「次に試すべき実験点」を提案する手法。Matlens では 1D・2D の特徴量空間に対応。少ないデータ点で効率的に最適パラメータを探索できる。',related:'ガウス過程回帰、経験式シミュレーション'},
  {id:'empirical-sim',term:'経験式シミュレーション',en:'Empirical Formula Simulation',cat:'ai',catLabel:'AI / ML',catVariant:'ai',body:'材料科学の代表的な経験式を対話的に計算する機能。Hall-Petch（結晶粒径→降伏応力）、Larson-Miller（温度・時間→クリープ破断）、JMAK（変態速度論）、ROM（複合則）の 4 式に対応。パラメータをスライダーで調整し、即座にグラフで確認できる。',related:'ベイズ最適化、材料特性'},
  {id:'workflow-nav',term:'ワークフロー連動ナビゲーション',en:'Workflow-Linked Navigation',cat:'ops',catLabel:'操作ガイド',catVariant:'amber',body:'ペトリネットの各工程 (Place) をクリックすると対応するシステム画面に直接遷移する機能。「計画中」→新規登録、「一次加工済」→シミュレーション、「評価済」→ベイズ最適化、「破面解析済」→類似検索など。研究者が「今この工程で使うべき画面」を直感的に把握できる。',related:'ペトリネット、ナビゲーション'},
  {id:'hall-petch',term:'Hall-Petch 式',en:'Hall-Petch Equation',cat:'mat',catLabel:'材料工学',catVariant:'blue',body:'結晶粒径と降伏応力の関係を記述する経験式。σ_y = σ_0 + k / √d。粒径が小さいほど降伏応力が高くなる。金属合金の微細化強化メカニズムの基礎。Matlens の経験式シミュレーション機能で対話的に計算可能。',related:'降伏応力、経験式シミュレーション'},
  {id:'larson-miller',term:'Larson-Miller パラメータ',en:'Larson-Miller Parameter',cat:'mat',catLabel:'材料工学',catVariant:'blue',body:'温度と時間からクリープ破断寿命を推定するパラメータ。LMP = T × (C + log₁₀(t))。高温環境での材料寿命予測に使用。航空機エンジンのタービンブレード等のクリープ設計に不可欠。',related:'クリープ試験、経験式シミュレーション'},
];

export const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: 'データはどこに保存されますか？', a: '現在はブラウザのメモリ上に保持されます。ページをリロードするとサンプルデータにリセットされます。CSV/JSON でエクスポート可能です。' },
  { q: 'ベクトル検索とは何ですか？', a: 'TensorFlow.js の Universal Sentence Encoder でテキストをベクトル化し、意味的に類似した材料をコサイン類似度で検索します。ブラウザ内で完結します。' },
  { q: 'AI 機能は無料ですか？', a: 'GPT-5.4 nano と Gemini 2.5 Flash は 1日30回まで無料です。自分の OpenAI API キーを設定すると GPT-5.4 mini が無制限で使えます。' },
  { q: '4つのテーマの違いは？', a: 'Light（標準）、Dark（暗色）、Eng（端末風）、CAE（解析風）の4種。トップバーで切替できます。' },
  { q: 'オフラインで使えますか？', a: 'CDN の読み込みにインターネット接続が必要です。初回読み込み後はブラウザキャッシュで一部動作しますが、AI 機能は接続が必要です。' },
  { q: '試験フロー可視化で工程を戻せますか？', a: 'ペトリネットは本来順方向発火のみですが、Matlens では 2 通りの「戻る」動作を用意しています。(1)「再加工」トランジション t4 — 後加工済 → 一次加工済 の物理的に意味のあるフィードバックループをネット上で定義済み。(2)「1 手戻る」ボタン — 直前の発火／サンプル追加を UI レベルで Undo（最大 20 手まで）。不可逆な工程（破壊試験後など）は設計上戻せません。' },
  { q: 'PNML ファイルはどこで使えますか？', a: 'PNML は ISO/IEC 15909-2 準拠のペトリネット標準交換フォーマット。試験フロー可視化ページの「PNML」ボタンでダウンロードすると、PIPE・GreatSPN・CPN Tools 等の外部ツールに読み込んで到達可能性解析やデッドロック検出ができます。' },
  { q: '言語を英語に切り替えるには？', a: 'トップバーの JP/EN ボタンで切替できます。設定はブラウザに保存され、次回アクセス時も維持されます。' },
  { q: 'ファセット検索のプリセットとは？', a: '「プリセット」ボタンでよく使うフィルタ条件を保存・呼び出しできます。デフォルトで「承認済み金属合金」「高硬度材」「レビュー待ち」「CFRP 系」の 4 件が用意されています。カスタムプリセットも作成可能です。' },
  { q: 'ステップ式入力で途中のデータは保持されますか？', a: 'ステップ間の移動ではデータは保持されます。ただしページを離れるとリセットされます。下書き保存機能は今後のアップデートで追加予定です。' },
  { q: 'ワークフロー図から画面に遷移できますか？', a: 'はい。ペトリネットの各工程 (Place) をクリックすると対応するシステム画面に直接遷移します。クリック可能な工程はラベルが青色リンクで表示されます。' },
];

export const SUPPORT_TABS: { id: string; label: string; icon: string }[] = [
  { id: 'help', label: 'ヘルプ', icon: 'help' },
  { id: 'news', label: 'お知らせ', icon: 'spark' },
  { id: 'faq',  label: 'Q&A',   icon: 'info' },
  { id: 'ai',   label: 'AI設定', icon: 'ai' },
];
