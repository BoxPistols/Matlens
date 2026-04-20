import React from 'react';
import { Icon, IconName } from '../../components/Icon';
import { Badge, Card, SectionCard } from '../../components/atoms';
import { AIInsightCard, VecCard } from '../../components/molecules';
import { STORYBOOK_URL } from '../../data/constants';

export const AboutPage = () => {
  const TECH = [
    {icon:'dashboard',name:'Vite 5 + React 18',cat:'ビルド / UI',tag:'コア',desc:'高速HMR開発サーバー。TypeScriptで型安全。hooks + Context API + useReducer でステート管理。'},
    {icon:'about',name:'Tailwind CSS 3 + CSS Variables',cat:'スタイリング',tag:'デザインシステム',desc:'4テーマ（Light/Dark/Eng/CAE）をCSS変数で管理。Tailwind ユーティリティと共存。'},
    {icon:'spark',name:'OpenAI GPT-5.4 / Gemini 2.5',cat:'AI / LLM',tag:'マルチプロバイダ',desc:'サーバーサイドプロキシ（Vercel Functions）経由。IP単位レートリミット付き無料枠 + 自前キーで無制限。'},
    {icon:'embed',name:'TensorFlow.js + USE',cat:'ベクトル検索',tag:'ブラウザ内ML',desc:'Universal Sentence Encoder で512次元ベクトル生成。コサイン類似度によるインメモリ意味検索。'},
    {icon:'report',name:'Chart.js 4',cat:'データ可視化',tag:'OSS',desc:'折れ線・ドーナツ・積み上げ棒・散布図の4種グラフをダッシュボードに実装。'},
    {icon:'search',name:'Lucide React',cat:'アイコン',tag:'OSS',desc:'軽量SVGアイコンライブラリ。34種のアイコンをマッピング。tree-shaking対応。'},
    {icon:'check',name:'Vitest + Storybook 10',cat:'テスト / ドキュメント',tag:'品質管理',desc:'ユニットテスト（Vitest）+ コンポーネントカタログ（Storybook）。コロケーション構成。'},
    {icon:'settings',name:'Vercel + Serverless Functions',cat:'デプロイ',tag:'インフラ',desc:'GitHubプッシュで自動デプロイ。api/ai.js がAPIプロキシとしてAPIキーを安全に管理。'},
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="ptitle text-[19px] font-bold tracking-tight">技術スタック</h1>
        <p className="text-[12px] text-text-lo mt-0.5">Matlens v3 のアーキテクチャ・使用技術・設計思想</p>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns:'1fr 1fr' }}>
        <AIInsightCard loading={false} chips={[]}>
          <strong className="text-text-hi">Matlens</strong> は、材料研究者・実験担当者向けのデータ管理システムです。
          材料特性値の登録・検索・比較に加え、AIベクトル検索とRAGチャットで意思決定を支援します。
          <br /><br />
          オープンソースとして公開。デモ用サンプルデータ（68種）を搭載。
        </AIInsightCard>
        <VecCard>
          <div className="font-bold text-text-hi mb-1.5 text-[13px]">プロジェクト構成</div>
          <pre className="font-mono text-[11px] bg-sunken p-3 rounded border border-[var(--border-faint)] leading-[1.8] overflow-x-auto">{`Matlens/
├── src/
│   ├── components/   UI (コロケーション)
│   │   ├── atoms/    Button, Badge, Input...
│   │   ├── molecules/ Modal, SearchBox...
│   │   ├── Icon/     Lucide React ラッパー
│   │   ├── Topbar/   ヘッダー + グローバル検索
│   │   └── Sidebar/  サイドナビ
│   ├── pages/        15ページ (各フォルダ)
│   ├── hooks/        useAI, useEmbedding...
│   ├── data/         定数 + サンプルDB (68件)
│   ├── context/      React Context
│   └── services/     Mock API
├── api/ai.js         Vercel Serverless Function
├── public/           favicon, manifest
└── dist/             ビルド出力`}</pre>
        </VecCard>
      </div>

      <SectionCard title="技術スタック">
        <div className="grid gap-3" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))' }}>
          {TECH.map(t=>(
            <div key={t.name} className="bg-raised border border-[var(--border-faint)] rounded-md p-3.5">
              <Icon name={t.icon as IconName} size={20} className="text-accent mb-2" />
              <div className="text-[13px] font-bold text-text-hi mb-0.5">{t.name}</div>
              <div className="text-[12px] text-text-lo mb-1.5">{t.cat}</div>
              <div className="text-[12px] text-text-md leading-relaxed">{t.desc}</div>
              <Badge variant="blue" className="mt-2">{t.tag}</Badge>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="コンポーネント設計（Atomic Design + コロケーション）">
        <div className="flex items-stretch gap-0 overflow-x-auto py-2">
          {([
            ['Atoms','Button / Badge / Card / Input / Select / Textarea / Checkbox / ProgressBar / Typing / Kbd','accent'],
            ['Molecules','Modal / SearchBox / FilterChip / Toast / KpiCard / AIInsightCard / VecCard / MarkdownBubble / ExportModal','ai'],
            ['Organisms','Topbar / Sidebar / SupportPanel / DataDisclaimer / MaterialVisual','vec'],
            ['Pages','Dashboard / MaterialList / Detail / Catalog / VectorSearch / RAGChat / Similar / MaterialForm / ApiDebug / TestSuite / Help / About / MasterSettings / UxDesign / Voice','ok'],
          ] as const).map(([name,items,color],i,arr)=>(
            <React.Fragment key={name}>
              <div className="flex-1 min-w-[160px] flex flex-col gap-2 px-4 border-r border-[var(--border-faint)] last:border-r-0">
                <div
                  className="text-[11px] font-bold uppercase tracking-[.05em]"
                  style={{ color: `var(--${color})` }}
                >
                  {name}
                </div>
                <div className="text-[12px] text-text-md leading-[1.7]">{items.split(' / ').map(c=><span key={c} className="inline-block"><code className="text-[11px] bg-raised px-1 py-0.5 rounded border border-[var(--border-faint)]">{c}</code>{' '}</span>)}</div>
              </div>
              {i < arr.length-1 && <div className="flex items-center px-1 text-text-lo flex-shrink-0"><Icon name="chevronRight" size={14} /></div>}
            </React.Fragment>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-3" style={{ gridTemplateColumns:'1fr 1fr' }}>
        <SectionCard title="AI 機能の構成">
          <div className="flex flex-col gap-2">
            {[
              ['無料枠（サーバープロキシ）','GPT-5.4 nano / Gemini 2.5 Flash。Vercel Functions 経由。IP単位で1日30回。OPENAI_API_KEY / GEMINI_API_KEY を環境変数で管理。'],
              ['自前キー（ブラウザ直接）','ユーザーがOpenAI APIキーを入力するとブラウザから直接API呼び出し。サーバーを経由しない。GPT-5.4 mini が解放される。'],
              ['ベクトル検索','TF.js Universal Sentence Encoder がブラウザ内で動作。68件の材料テキストを512次元ベクトルに変換しコサイン類似度で検索。'],
              ['RAGチャット','ベクトル検索で上位4件を取得し、LLMのコンテキストとして注入。材料データに基づいた根拠ある回答を生成。'],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-2.5 py-2 border-b border-[var(--border-faint)] last:border-b-0">
                <Icon name="check" size={13} className="text-ok flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[13px] font-bold text-text-hi">{title}</div>
                  <div className="text-[12px] text-text-md mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="デプロイ・開発環境">
          <div className="flex flex-col gap-2">
            {[
              ['Vercel (本番)','GitHubプッシュで自動デプロイ。静的ファイル + Serverless Functions。環境変数でAPIキー管理。'],
              ['Vite dev server (ローカル)','npm run dev で起動。/api/ai は開発モードでデモ応答を返す。自前キー設定時は直接API。'],
              ['Vitest','npm run test でユニットテスト実行。各モジュールと同じフォルダにテストファイルを配置。'],
            ].map(([title, desc]) => (
              <div key={title} className="flex gap-2.5 py-2 border-b border-[var(--border-faint)] last:border-b-0">
                <Icon name="settings" size={13} className="text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-[13px] font-bold text-text-hi">{title}</div>
                  <div className="text-[12px] text-text-md mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
            <a
              href={STORYBOOK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 mt-1 rounded-md border border-[#FF4785]/40 bg-[#FF4785]/8 hover:bg-[#FF4785]/15 hover:border-[#FF4785] transition-all"
              aria-label="Storybook を新しいタブで開く"
            >
              <span className="w-10 h-10 rounded-md bg-[#FF4785] flex items-center justify-center text-white font-black text-[18px] flex-shrink-0 shadow-sm">M</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-text-hi flex items-center gap-1.5">
                  Storybook 10 <span className="text-[11px] text-text-lo">（公開中）</span>
                  <span className="text-[11px] opacity-70">↗</span>
                </div>
                <div className="text-[12px] text-text-md mt-0.5 truncate">{STORYBOOK_URL}</div>
                <div className="text-[11px] text-text-lo mt-0.5">コンポーネントカタログ・デザイン原則・ストーリー一覧を参照</div>
              </div>
            </a>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="制限事項（現行バージョン）">
        <div className="grid grid-cols-2 gap-2 text-[13px] text-text-md leading-relaxed">
          {[
            ['データはブラウザメモリのみ（リロードでサンプルデータにリセット）','warn'],
            ['材料物性値はデモ用サンプル（設計・研究には一次ソースで要検証）','warn'],
            ['サーバーサイドレートリミットはインメモリ（コールドスタートでリセット）','warn'],
            ['認証・権限管理は未実装','warn'],
            ['Embedding はページ読み込み時に全件計算（データ量増で要最適化）','warn'],
            ['本番運用にはDB永続化（PostgreSQL + pgvector 等）が必要','ok'],
          ].map(([txt,color])=>(
            <div key={txt} className="flex items-start gap-2 py-1 border-b border-[var(--border-faint)] last:border-b-0">
              <Icon name={color==='ok'?'check':'warning'} size={13} className={`text-${color} flex-shrink-0 mt-0.5`} />
              <span>{txt}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
};
