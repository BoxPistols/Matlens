import type { Meta, StoryObj } from '@storybook/react-vite'

// プロダクトが扱うドメイン (金属・物質研究) の最小語彙。
// 特定企業・業界を前提とせず、材料 R&D 一般の共通土台として記述する。

const Section = ({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 40 }}>
    <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 4, letterSpacing: '-0.01em' }}>{title}</h2>
    {lead && (
      <p style={{ fontSize: 13, color: 'var(--text-lo)', lineHeight: 1.7, marginBottom: 14 }}>{lead}</p>
    )}
    {children}
  </section>
)

const Grid2 = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
    {children}
  </div>
)

const Card = ({ title, subtitle, tone = 'neutral', children }: {
  title: string; subtitle?: string; tone?: 'neutral' | 'accent' | 'vec' | 'ai' | 'warn';
  children: React.ReactNode;
}) => {
  const colorVar = {
    neutral: 'var(--text-lo)',
    accent: 'var(--accent)',
    vec: 'var(--vec)',
    ai: 'var(--ai-col)',
    warn: 'var(--warn)',
  }[tone]
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 10,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-faint)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: colorVar }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-hi)' }}>{title}</span>
        {subtitle && (
          <span style={{ fontSize: 12, color: 'var(--text-lo)', fontFamily: 'var(--font-mono)' }}>{subtitle}</span>
        )}
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-md)', lineHeight: 1.7 }}>{children}</div>
    </div>
  )
}

const Flow = ({ steps }: { steps: string[] }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
    {steps.map((s, i) => (
      <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            background: 'var(--bg-raised)',
            border: '1px solid var(--border-default)',
            fontSize: 12,
            color: 'var(--text-hi)',
            fontWeight: 600,
          }}
        >
          {s}
        </span>
        {i < steps.length - 1 && (
          <span style={{ color: 'var(--text-lo)', fontSize: 14 }}>→</span>
        )}
      </span>
    ))}
  </div>
)

const DomainPrimer = () => (
  <div style={{ maxWidth: 760, fontFamily: 'var(--font-ui)' }}>
    {/* Hero */}
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--accent)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        Domain Primer
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-hi)', marginBottom: 8, letterSpacing: '-0.02em' }}>
        金属・物質研究データの最小知識
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-md)', lineHeight: 1.8 }}>
        本プロダクトは材料 (金属・セラミクス・複合材など) の特性データを登録・検索・解析するための UI です。
        新規参加者が材料 R&D の語彙を短時間で揃えるためのページです。
      </p>
    </div>

    {/* 材料カテゴリ */}
    <Section title="扱う材料カテゴリ" lead="構造・機能に応じて採用材料が分かれる。プロダクトはいずれも同じデータスキーマで扱う。">
      <Grid2>
        <Card title="金属 (Metals)" subtitle="Ti / Ni / Al / 鋼" tone="accent">
          構造部材の主力。機械的特性・疲労・クリープ等を扱う。
        </Card>
        <Card title="セラミクス" subtitle="酸化物 / 窒化物" tone="warn">
          耐熱・絶縁・硬質用途。熱伝導・熱膨張・破壊靭性が関心領域。
        </Card>
        <Card title="複合材 (CFRP / CMC)" tone="vec">
          軽量化と異方性が特徴。繊維配向・層構成と強度の相関を扱う。
        </Card>
        <Card title="高分子・機能材料" tone="ai">
          粘弾性・電気特性・光学特性など、用途依存の物性が多様。
        </Card>
      </Grid2>
    </Section>

    {/* 製造プロセス */}
    <Section title="標準プロセスフロー" lead="上流の条件が下流の特性に大きく効く。プロセスと試験データの紐付けを保持する。">
      <Flow steps={['原料・合成', '成形・加工', '熱処理', '検査・試験', '出荷/蓄積']} />
    </Section>

    {/* 試験手法 */}
    <Section title="主な評価・試験" lead="破壊/非破壊・機械的/物理的など、試験種別ごとにデータ粒度とスキーマが異なる。">
      <Grid2>
        <Card title="機械試験" tone="accent">引張・圧縮・曲げ・硬さ・疲労。応力-歪み系列を主要データとする。</Card>
        <Card title="非破壊検査 (NDE)" tone="vec">X 線 CT・超音波・透過 X 線。内部欠陥と 3D 構造の評価。</Card>
        <Card title="物性測定" tone="ai">熱伝導率・比熱・密度・電気伝導率など。温度依存性の系列データ。</Card>
        <Card title="組織観察" tone="warn">SEM / EBSD / 光学顕微鏡。画像と結晶構造パラメータ。</Card>
      </Grid2>
    </Section>

    {/* 品質基準 */}
    <Section title="参照される規格" lead="業界・用途ごとに要求規格が異なるため、プロダクトは規格メタを材料データに紐付けて保持する。">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { label: 'JIS', full: 'JIS K 0200:2024 系', note: '国内標準 (計測データ標準を含む)' },
          { label: 'ASTM', full: 'ASTM E / F シリーズ', note: '機械試験・材料評価の国際標準' },
          { label: 'ISO', full: 'ISO 材料評価群', note: '国際互換用途' },
        ].map(g => (
          <div
            key={g.label}
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--border-default)',
              background: 'var(--bg-surface)',
              minWidth: 200,
              flex: '1 1 200px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
              <code style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                {g.label}
              </code>
              <span style={{ fontSize: 12, color: 'var(--text-lo)' }}>{g.full}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-md)', lineHeight: 1.6 }}>{g.note}</div>
          </div>
        ))}
      </div>
    </Section>

    {/* MaiML */}
    <Section title="MaiML — 計測データ標準" lead="JIS K 0200:2024。計測装置の出力をベンダー中立に記述する XML ベースの汎用フォーマット。">
      <div
        style={{
          padding: 14,
          borderRadius: 8,
          background: 'var(--bg-raised)',
          border: '1px solid var(--border-faint)',
          fontSize: 13,
          color: 'var(--text-md)',
          lineHeight: 1.8,
        }}
      >
        プロダクトでは MaiML 相当のフィールド構造 (測定条件・装置メタ・系列データ) を扱い、
        UI 側で「この値は測定器由来か手入力か」を provenance バッジで示す。
      </div>
    </Section>

    {/* 国際連携 */}
    <Section title="国際利用と言語" lead="海外拠点・国際共同研究を想定し、UI は 日本語 / 英語 のバイリンガル前提。">
      <div style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.8 }}>
        用語辞書 (<code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>src/i18n</code>) で日英の用語統制を行い、
        データラベル・検索ファセット・エラーメッセージを一括切替する。
      </div>
    </Section>

    {/* 想定課題 */}
    <Section title="プロダクトが解きに行く課題" lead="材料研究の現場で共通して出やすい UI / UX の論点。">
      <ul style={{ fontSize: 13.5, color: 'var(--text-md)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
        <li>入力項目が多く煩雑で、登録完了までの心理的コストが高い</li>
        <li>蓄積データが多くても検索性が低く、類似材料にたどり着けない</li>
        <li>研究の業務フローと画面の流れが一致せず、発見性が低い</li>
        <li>どこで何ができるかの全体像がつかみにくい</li>
      </ul>
    </Section>

    {/* 次のステップ */}
    <Section title="次に読むページ">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { label: 'Guide / ApplicationGuide', note: 'プロダクトが提供する画面と機能のスコープ' },
          { label: 'Design Philosophy / Overview', note: '設計原則と 4 テーマ戦略' },
          { label: 'DesignTokens / TokenList', note: 'トークン駆動の配色・間隔基盤' },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-md)' }}>
            <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', minWidth: 240 }}>{r.label}</code>
            <span style={{ color: 'var(--text-lo)' }}>{r.note}</span>
          </div>
        ))}
      </div>
    </Section>
  </div>
)

const meta: Meta<typeof DomainPrimer> = {
  title: 'Guide/DomainPrimer',
  component: DomainPrimer,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '金属・物質研究データの最小知識 (材料カテゴリ・プロセス・試験・規格・MaiML)。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof DomainPrimer>

export const Default: Story = {}
