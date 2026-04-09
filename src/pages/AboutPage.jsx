import React from 'react';
import { Icon } from '../components/Icon';
import { Badge, Card, SectionCard } from '../components/atoms';
import { AIInsightCard, VecCard } from '../components/molecules';

export const AboutPage = () => {
  const TECH = [
    {icon:'ai',name:'React 18',cat:'フレームワーク',tag:'コア',desc:'Babel CDN で JSX を直接実行するシングルHTMLファイル構成。hooks + Context API でステート管理。'},
    {icon:'about',name:'CSS Variables + Tailwind',cat:'スタイリング',tag:'デザインシステム',desc:'4テーマを CSS カスタムプロパティで管理。Tailwind ユーティリティクラスと共存。'},
    {icon:'spark',name:'Claude claude-sonnet-4-20250514',cat:'AI / LLM',tag:'Anthropic',desc:'Anthropic の最新 Claude モデル。RAG コンテキストと組み合わせて根拠ある回答を生成。'},
    {icon:'embed',name:'TensorFlow.js + USE',cat:'機械学習',tag:'Google',desc:'ブラウザで512次元 Embedding を生成。コサイン類似度でインメモリ VSS を実現。'},
    {icon:'report',name:'Chart.js 4',cat:'データ可視化',tag:'OSS',desc:'折れ線・ドーナツ・積み上げ棒・散布図の 4 種グラフをダッシュボードに実装。'},
    {icon:'mic',name:'Web Speech API',cat:'音声',tag:'ブラウザ標準',desc:'SpeechRecognition（ASR）と SpeechSynthesis（TTS）によるハンズフリーワークフロー。'},
    {icon:'check',name:'WCAG 2.1 AA',cat:'アクセシビリティ',tag:'W3C準拠',desc:'コントラスト比 4.5:1 以上、focus-visible、スキップナビ、aria 属性、min 12px を実装。'},
    {icon:'filter',name:'Atomic Design',cat:'設計手法',tag:'アーキテクチャ',desc:'atoms → molecules → organisms → pages の階層でコンポーネントを設計・分離。'},
  ];
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="ptitle text-[19px] font-bold tracking-tight">技術スタック &amp; About</h1>
        <p className="text-[12px] text-text-lo mt-0.5">Matlens のアーキテクチャ・使用技術・設計思想</p>
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns:'1fr 1fr' }}>
        <AIInsightCard loading={false} chips={[]}>
          <strong className="text-text-hi">Matlens</strong> は、重工業・エンジニアリング分野に強みを持つシステムインテグレーター向けに設計された、研究・実験向け材料データ管理システムのプロトタイプです。<br /><br />
          CAE 前処理として必要な材料特性値を一元管理し、AI ベクトル検索と RAG によってエンジニアの意思決定を支援します。
        </AIInsightCard>
        <VecCard>
          <div className="font-bold text-text-hi mb-1.5 text-[13px]">対象ユーザー &amp; 用途</div>
          <ul className="text-[12px] leading-[1.9] text-text-md">
            <li>材料研究者、設計エンジニア、CAE 担当者</li>
            <li>実験データの登録・検索・共有</li>
            <li>CAE 解析用材料特性値の参照</li>
            <li>自然言語による意味的材料検索</li>
            <li>AI を活用した材料提案・比較</li>
          </ul>
          <div className="mt-2 text-[12px] text-text-lo font-semibold">開発フェーズ: PoC v3 — 面談デモ用プロトタイプ</div>
        </VecCard>
      </div>

      <SectionCard title="技術スタック">
        <div className="grid gap-3" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))' }}>
          {TECH.map(t=>(
            <div key={t.name} className="bg-raised border border-[var(--border-faint)] rounded-md p-3.5">
              <Icon name={t.icon} size={20} className="text-accent mb-2" />
              <div className="text-[13px] font-bold text-text-hi mb-0.5">{t.name}</div>
              <div className="text-[12px] text-text-lo mb-1.5">{t.cat}</div>
              <div className="text-[12px] text-text-md leading-relaxed">{t.desc}</div>
              <Badge variant="blue" className="mt-2">{t.tag}</Badge>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="コンポーネント設計（Atomic Design）">
        <div className="flex items-stretch gap-0 overflow-x-auto py-2">
          {[['Atoms','Button · Icon · Badge · Input · Select · Textarea · UnitInput · Checkbox · ProgressBar · Divider · FormGroup · Typing · Kbd','accent'],['Molecules','SearchBox · FilterChip · Modal · Toast · KpiCard · AIInsightCard · VecCard · MarkdownBubble · ExportModal','ai'],['Organisms','Topbar · Sidebar · VoicePanel','vec'],['Pages','Dashboard · List · Form · Detail · VecSearch · RAGChat · Similar · Voice · Help · About','ok']].map(([name,items,color],i,arr)=>(
            <React.Fragment key={name}>
              <div className="flex-1 min-w-[160px] flex flex-col gap-2 px-4 border-r border-[var(--border-faint)] last:border-r-0">
                <div className={`text-[11px] font-bold uppercase tracking-[.05em] text-[var(--${color})]`}>{name}</div>
                <div className="text-[12px] text-text-md leading-[1.7]">{items.split(' · ').map(c=><span key={c} className="inline-block"><code className="text-[11px] bg-raised px-1 py-0.5 rounded border border-[var(--border-faint)]">{c}</code>{' '}</span>)}</div>
              </div>
              {i < arr.length-1 && <div className="flex items-center px-1 text-text-lo flex-shrink-0"><Icon name="chevronRight" size={14} /></div>}
            </React.Fragment>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="制限事項（PoC）">
        <div className="grid grid-cols-2 gap-2 text-[13px] text-text-md leading-relaxed">
          {[['データはメモリのみ（リロードで消失）','warn'],['APIキーなしでは Claude 応答がダミー','warn'],['USE モデルは CDN 依存（オフライン非対応）','warn'],['Embedding は起動時に全件計算','warn'],['認証・権限管理は未実装','warn'],['本番は Next.js + REST API + PostgreSQL/pgvector を推奨','ok']].map(([txt,color])=>(
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
