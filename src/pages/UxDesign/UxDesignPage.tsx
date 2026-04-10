import { useState } from 'react';
import React from 'react';
import { Icon, IconName } from '../../components/Icon';
import { Badge, Card, SectionCard, FormGroup } from '../../components/atoms';
import { AIInsightCard, VecCard } from '../../components/molecules';

export const UxDesignPage = () => {
  const [section, setSection] = useState('info-arch');
  const SECTIONS = [
    {id:'info-arch',title:'情報設計 (IA)',icon:'filter'},
    {id:'nav-design',title:'ナビゲーション',icon:'list'},
    {id:'form-design',title:'フォーム設計',icon:'plus'},
    {id:'list-design',title:'一覧・フィルタ',icon:'sort'},
    {id:'feedback',title:'フィードバック',icon:'check'},
    {id:'a11y',title:'A11y (WCAG)',icon:'info'},
    {id:'btob',title:'BtoB原則',icon:'about'},
    {id:'design-system',title:'デザインシステム',icon:'scan'},
  ];

  const CONTENT = {
    'info-arch': <>
      <AIInsightCard loading={false} chips={[]}><strong>情報設計</strong>は「どこに何があるか」をユーザーが直感的に理解できる構造を作るプロセス。BtoBではユーザーのメンタルモデル（業務フロー）と画面構成を合致させることが最重要です。</AIInsightCard>
      <div className="grid gap-3" style={{gridTemplateColumns:'1fr 1fr'}}>
        <SectionCard title="Matlens の IA 原則">
          {[['ユーザーゴール優先','「何をしたいか」から設計。材料検索→詳細→編集をワンアクションで辿れる。'],['段階的開示','最初は重要情報のみ。詳細条件は「詳細」展開で。認知負荷を段階的に。'],['コンテキスト維持','一覧→詳細→編集の遷移でフィルタ状態を維持。作業文脈を失わない。'],['エラー防止','削除確認ダイアログ。AI異常値検出による事前警告。リアルタイムバリデーション。']].map(([t,d])=>(
            <div key={t} className="flex gap-2.5 py-2 border-b border-[var(--border-faint)] last:border-b-0"><Icon name="check" size={13} className="text-ok flex-shrink-0 mt-0.5"/><div><div className="text-[13px] font-bold text-text-hi">{t}</div><div className="text-[12px] text-text-md mt-0.5">{d}</div></div></div>
          ))}
        </SectionCard>
        <SectionCard title="サイトマップ（現行）">
          <pre className="font-mono text-[11px] bg-sunken p-3 rounded border border-[var(--border-faint)] leading-[1.9]">{`Matlens
├── 概要
│   ├── ダッシュボード (KPI + AI分析 + Chart.js)
│   ├── 材料データ一覧 (テーブル/カード/コンパクト切替)
│   └── 材料カタログ (CSSビジュアル + グリッド)
├── データ入力
│   └── 新規登録 / 編集フォーム
├── AI 分析・検索
│   ├── 意味検索 (TF.js Embedding)
│   ├── AI チャット (RAG)
│   └── 類似材料を比較
├── ヘルプ・情報
│   ├── ヘルプ・用語集
│   └── 技術スタック ← 現在地
├── 開発者向け
│   ├── API テスト (Mock REST)
│   ├── テストスイート (Vitest)
│   └── UX設計ノート
└── 設定
    └── カテゴリ・バッチ管理`}</pre>
        </SectionCard>
      </div>
    </>,
    'nav-design': <>
      <div className="grid gap-3" style={{gridTemplateColumns:'1fr 1fr'}}>
        <SectionCard title="ナビゲーション設計原則">
          {[['現在地の明示','アクティブアイテムを左ボーダー+背景色で強調。詳細画面ではbreadcrumb + prev/next ナビ。'],['折り畳みによる空間確保','サイドバートグルで作業領域を最大化。アイコン+ツールチップで折り畳み時も操作可能。'],['グローバル検索','トップバー中央に検索バー。Enter で材料一覧にフィルタ適用して遷移。IME対応済み。'],['セクション分け','概要/データ入力/AI分析/ヘルプ/開発者向け/設定の6セクションで機能の文脈を伝える。']].map(([t,d])=>(
            <div key={t} className="bg-raised border border-[var(--border-faint)] rounded p-3 mb-2 last:mb-0"><div className="text-[13px] font-bold text-text-hi mb-1">{t}</div><div className="text-[12px] text-text-md">{d}</div></div>
          ))}
        </SectionCard>
        <SectionCard title="ナビパターン比較">
          <table className="w-full text-[12px]"><thead><tr className="border-b border-[var(--border-faint)]"><th className="px-2 py-2 text-left font-bold text-text-lo">パターン</th><th className="px-2 py-2 text-left font-bold text-text-lo">Matlensでの採用</th></tr></thead>
          <tbody>{[['サイドバーナビ','採用 — 主ナビ'],['ページヘッダー+CTA','採用 — アクション配置'],['タブ','採用 — API・ヘルプ'],['ブレッドクラム','採用 — 詳細画面'],['行レベルアクション','採用 — テーブル'],['モーダル確認','採用 — 削除確認']].map(([p,a])=>(
            <tr key={p} className="border-b border-[var(--border-faint)] hover:bg-hover"><td className="px-2 py-2 font-semibold">{p}</td><td className="px-2 py-2"><Badge variant="green">{a}</Badge></td></tr>
          ))}</tbody></table>
        </SectionCard>
      </div>
    </>,
    'form-design': <>
      <div className="grid gap-3" style={{gridTemplateColumns:'1fr 1fr'}}>
        <SectionCard title="フォーム設計7原則">
          {[['ラベルは常に表示','プレースホルダーだけでなく、常時表示のラベルを必ず配置。'],['必須・任意を明示','* で必須を示し、任意には（任意）と記載。'],['リアルタイムバリデーション','onBlur時にその場でエラー表示。送信まで待たない。'],['インラインエラー','フィールド直下に赤色+アイコン+説明文でエラーを表示。'],['適切なinput種別','数値はnumber+単位。選択肢はselect or radio。'],['グルーピング','関連フィールドを視覚的にまとめる（枠・見出し）。'],['AIアシスト','組成入力で物性値を自動提案。入力工数を大幅削減。']].map(([t,d])=>(
            <div key={t} className="flex gap-2 py-1.5 border-b border-[var(--border-faint)] last:border-b-0 text-[12px]"><Icon name="check" size={12} className="text-ok flex-shrink-0 mt-0.5"/><div><strong className="text-text-hi">{t}</strong> — {d}</div></div>
          ))}
        </SectionCard>
        <SectionCard title="バリデーション設計">
          <div className="text-[12px] text-text-md leading-[1.8]">
            <div className="font-bold text-text-hi mb-2">タイミング</div>
            {[['onChange','入力中リアルタイム（数値範囲）'],['onBlur','フォーカスアウト時（必須・形式）'],['onSubmit','送信時最終チェック']].map(([t,d])=>(
              <div key={t} className="flex gap-2 mb-2"><code className="text-[11px] bg-raised px-1.5 py-0.5 rounded border border-[var(--border-faint)] text-accent w-20 text-center flex-shrink-0">{t}</code><span>{d}</span></div>
            ))}
            <div className="font-bold text-text-hi mb-2 mt-3">エラーメッセージ</div>
            <div className="bg-err-dim border border-[var(--err)] rounded p-2 text-err text-[12px] mb-2"><strong>悪:</strong> 「無効な値です」</div>
            <div className="bg-[var(--ok-dim)] border border-ok rounded p-2 text-ok text-[12px]"><strong>良:</strong> 「硬度は 0〜5000 HV の範囲で入力してください」</div>
          </div>
        </SectionCard>
      </div>
    </>,
    'list-design': <>
      <SectionCard title="一覧・フィルタ設計パターン">
        <div className="grid gap-3" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          {[['全文検索','名称・ID・組成・備考を横断検索。デバウンスで入力遅延防止。'],['ファセットフィルタ','カテゴリ・ステータス・バッチのドロップダウン。AND絞り込み。'],['数値範囲フィルタ','最小〜最大の範囲指定。詳細パネルに隠して初期表示簡潔化。'],['アクティブタグ','有効なフィルタをタグ表示。個別・一括解除対応。'],['ソート','列単位の昇降順。現在ソートを視覚的に表示。'],['ページネーション','大量データを分割表示。件数/ページも変更可能。']].map(([t,d])=>(
            <div key={t} className="bg-raised border border-[var(--border-faint)] rounded p-3"><div className="text-[13px] font-bold text-text-hi mb-1">{t}</div><div className="text-[12px] text-text-md">{d}</div></div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="テーブル設計ガイドライン">
        <table className="w-full text-[12px]"><thead><tr className="border-b border-[var(--border-faint)]"><th className="px-3 py-2 text-left font-bold text-text-lo">項目</th><th className="px-3 py-2 text-left font-bold text-text-lo">方針</th><th className="px-3 py-2 text-left font-bold text-text-lo">実装</th></tr></thead>
        <tbody>{[['列幅','固定幅(colgroup)で数値・ステータス列を制御','tableLayout:fixed'],['数値表示','右揃え + toLocaleString()','text-right font-mono'],['テキスト省略','ellipsis + title属性','truncate + title'],['行選択','チェックボックス + 行クリック','bg-accent-dim selected'],['空状態','0件時に空状態UIを表示','Empty component'],].map(([t,p,e])=>(
          <tr key={t} className="border-b border-[var(--border-faint)] hover:bg-hover"><td className="px-3 py-2 font-semibold">{t}</td><td className="px-3 py-2 text-text-md">{p}</td><td className="px-3 py-2 font-mono text-[11px] text-text-lo">{e}</td></tr>
        ))}</tbody></table>
      </SectionCard>
    </>,
    'feedback': <>
      <SectionCard title="フィードバック設計の4層">
        <div className="grid gap-3" style={{gridTemplateColumns:'1fr 1fr'}}>
          {[['即時 (<100ms)','ボタン押下のvisual feedback。hover/focus状態。','accent'],['短期 (〜2s)','ローディング・Typing インジケーター（AI応答待ち）。','ai'],['操作完了','Toast通知（登録・更新・削除）。3秒後自動消去。','ok'],['エラー・警告','モーダル（削除確認）。インラインエラー。バナー。','warn']].map(([t,d,c])=>(
            <div key={t} className={`bg-[var(--${c}-dim)] border border-[var(--${c})] rounded p-3`}><div className="text-[13px] font-bold text-text-hi mb-1.5">{t}</div><div className="text-[12px] text-text-md">{d}</div></div>
          ))}
        </div>
      </SectionCard>
    </>,
    'a11y': <>
      <div className="grid gap-3" style={{gridTemplateColumns:'1fr 1fr'}}>
        <SectionCard title="WCAG 2.1 AA チェックリスト">
          {[['コントラスト比 4.5:1以上'],['focus-visible フォーカスリング'],['キーボード完全操作'],['aria-label / role / aria-current'],['スキップナビゲーション'],['最小フォントサイズ 12px'],['色+アイコン+テキストのセット'],['ラベルのフォームコントロール関連付け']].map(([t])=>(
            <div key={t} className="flex gap-2 py-1.5 border-b border-[var(--border-faint)] last:border-b-0 text-[12px]"><Icon name="check" size={12} className="text-ok flex-shrink-0 mt-0.5"/><span className="text-text-hi">{t}</span></div>
          ))}
        </SectionCard>
        <SectionCard title="実装コード例">
          <pre className="bg-sunken rounded p-3 font-mono text-[11px] leading-[1.9] border border-[var(--border-faint)]">{`/* focus-visible */
:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
}

/* ARIA */
<nav aria-label="メインナビゲーション">
<button aria-current="page">一覧</button>
<input aria-required="true"
  aria-describedby="hint-01">
<div role="alert" aria-live="polite">

/* スキップナビ */
<a href="#main" class="skip-nav">
  コンテンツへスキップ
</a>

/* 色+形の組み合わせ */
// OK: <Badge>承認済</Badge>  ← 色+テキスト
// NG: 色のみで状態を表現`}</pre>
        </SectionCard>
      </div>
    </>,
    'btob': <>
      <SectionCard title="BtoB業務システム設計の固有原則">
        <div className="grid gap-3" style={{gridTemplateColumns:'1fr 1fr 1fr'}}>
          {[['情報密度','BtoBは高密度が正義。1画面で多くのデータを見渡せることを優先。余白はBtoCほど取らない。','about'],['操作効率','繰り返し操作（一括処理・ショートカット）を重視。熟練者の生産性を最大化。','filter'],['エラー耐性','データ損失・誤操作の影響が大きい。削除確認・下書き・変更履歴を必ず設計。','warning'],['権限管理','閲覧・編集・承認のロール分離。ステータスワークフロー設計。','check'],['バルク操作','複数レコードへの一括操作（承認・削除・CSV出力）はBtoB必須機能。','list'],['監査ログ','いつ・誰が・何を変更したかの証跡。コンプライアンス要件への対応。','info']].map(([t,d,ico])=>(
            <div key={t} className="bg-raised border border-[var(--border-faint)] rounded p-3"><div className="flex items-center gap-2 mb-1.5"><Icon name={ico as IconName} size={13} className="text-accent"/><div className="text-[13px] font-bold text-text-hi">{t}</div></div><div className="text-[12px] text-text-md">{d}</div></div>
          ))}
        </div>
      </SectionCard>
    </>,
    'design-system': <>
      <SectionCard title="デザイントークン — カラーロール">
        <div className="grid gap-2" style={{gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))'}}>
          {[['--accent','プライマリ操作'],['--ai-col','AI機能'],['--vec','Vector/Embedding'],['--ok','成功・承認'],['--warn','警告・要レビュー'],['--err','エラー・要修正']].map(([token,role])=>(
            <div key={token} className="p-2 bg-raised border border-[var(--border-faint)] rounded">
              <div className="w-full h-5 rounded mb-1.5" style={{background:`var(${token})`}}/>
              <div className="text-[10px] font-mono text-text-lo">{token}</div>
              <div className="text-[12px] font-semibold text-text-hi">{role}</div>
            </div>
          ))}
        </div>
      </SectionCard>
      <div className="grid gap-3" style={{gridTemplateColumns:'1fr 1fr'}}>
        <SectionCard title="タイポグラフィ スケール">
          {[['10px','補助ラベル・バッジ'],['11px','表ヘッダー・メタ'],['12px','ボディ小・補足'],['13px','ボディ標準・フォーム'],['14px','ボディ大・インプット'],['17px','ページタイトル小'],['19px','セクションタイトル']].map(([size,usage])=>(
            <div key={size} className="flex items-baseline gap-3 mb-1.5"><span className="w-10 font-mono text-[11px] text-text-lo">{size}</span><span style={{fontSize:size}} className="text-text-hi">あAaBb 123</span><span className="text-[11px] text-text-lo">{usage}</span></div>
          ))}
        </SectionCard>
        <SectionCard title="コンポーネント構成 (Atomic Design)">
          <div className="flex flex-col gap-2 text-[12px]">
            {[['Atoms','Button·Icon·Badge·Input·Select·Textarea·UnitInput·Checkbox·ProgressBar·Typing','accent'],['Molecules','SearchBox·FilterChip·Modal·Toast·KpiCard·AIInsightCard·VecCard·MarkdownBubble·ExportModal','ai'],['Organisms','Topbar·Sidebar·VoicePanel','vec'],['Pages','Dashboard·List·Form·Detail·VecSearch·RAGChat·Similar·Voice·API·Tests·UX·Help·About','ok']].map(([name,items,color])=>(
              <div key={name} className="py-1.5 border-b border-[var(--border-faint)] last:border-b-0"><div className={`text-[11px] font-bold uppercase tracking-[.04em] text-[var(--${color})] mb-0.5`}>{name}</div><div className="text-text-lo">{items}</div></div>
            ))}
          </div>
        </SectionCard>
      </div>
    </>,
  };

  return (
    <div className="flex flex-col gap-4">
      <div><h1 className="ptitle text-[19px] font-bold tracking-tight">UX 設計ガイド</h1><p className="text-[12px] text-text-lo mt-0.5">BtoB業務システムにおける情報設計・ナビゲーション・フォーム・A11y のベストプラクティス</p></div>
      <div className="grid gap-4" style={{gridTemplateColumns:'180px 1fr'}}>
        <div className="flex flex-col gap-0.5">
          {SECTIONS.map(s=>(
            <button key={s.id} onClick={()=>setSection(s.id)} className={`flex items-center gap-2 px-3 py-2 rounded text-[13px] text-left transition-colors font-ui border-l-2 ${section===s.id?'bg-accent-dim text-accent border-accent font-semibold':'text-text-md border-transparent hover:bg-hover'}`}>
              <Icon name={s.icon as IconName} size={12} className="flex-shrink-0 opacity-70"/><span className="leading-tight">{s.title}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">{(CONTENT as Record<string, React.ReactNode>)[section]}</div>
      </div>
    </div>
  );
};
