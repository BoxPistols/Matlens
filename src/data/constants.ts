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
