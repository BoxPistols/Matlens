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

export const NAV_ITEMS: NavItem[] = [
  { section: '概要' },
  { id:'dash',    label:'ダッシュボード',    icon:'dashboard' },
  { id:'list',    label:'材料データ一覧',    icon:'list',    badge: true },
  { id:'catalog', label:'材料カタログ',      icon:'embed',   badgeLabel:'3D', badgeVariant:'vec' },
  { section: 'データ入力' },
  { id:'new',     label:'新規登録',         icon:'plus' },
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
];

export const FAQ_ITEMS: { q: string; a: string }[] = [
  { q: 'データはどこに保存されますか？', a: '現在はブラウザのメモリ上に保持されます。ページをリロードするとサンプルデータにリセットされます。CSV/JSON でエクスポート可能です。' },
  { q: 'ベクトル検索とは何ですか？', a: 'TensorFlow.js の Universal Sentence Encoder でテキストをベクトル化し、意味的に類似した材料をコサイン類似度で検索します。ブラウザ内で完結します。' },
  { q: 'AI 機能は無料ですか？', a: 'GPT-5.4 nano と Gemini 2.5 Flash は 1日30回まで無料です。自分の OpenAI API キーを設定すると GPT-5.4 mini が無制限で使えます。' },
  { q: '4つのテーマの違いは？', a: 'Light（標準）、Dark（暗色）、Engineering（端末風）、CAE（解析風）の4種。トップバーで切替できます。' },
  { q: 'オフラインで使えますか？', a: 'CDN の読み込みにインターネット接続が必要です。初回読み込み後はブラウザキャッシュで一部動作しますが、AI 機能は接続が必要です。' },
];

export const SUPPORT_TABS: { id: string; label: string; icon: string }[] = [
  { id: 'help', label: 'ヘルプ', icon: 'help' },
  { id: 'faq',  label: 'Q&A',   icon: 'info' },
  { id: 'ai',   label: 'AI設定', icon: 'ai' },
];
