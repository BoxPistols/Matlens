import type { Meta, StoryObj } from '@storybook/react-vite'

const DoBox = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 14, borderRadius: 10, background: 'var(--ok-dim)', fontSize: 12, lineHeight: 1.6 }}>
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: 'var(--ok)', color: '#fff', fontWeight: 700, fontSize: 12, marginBottom: 6 }}>Do</span>
    <div style={{ color: 'var(--text-hi)', marginTop: 4 }}>{children}</div>
  </div>
)

const DontBox = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 14, borderRadius: 10, background: 'var(--err-dim)', fontSize: 12, lineHeight: 1.6 }}>
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, background: 'var(--err)', color: '#fff', fontWeight: 700, fontSize: 12, marginBottom: 6 }}>Don't</span>
    <div style={{ color: 'var(--text-hi)', marginTop: 4 }}>{children}</div>
  </div>
)

const CodeLine = ({ children }: { children: string }) => (
  <code style={{ display: 'block', padding: '6px 12px', borderRadius: 6, background: 'var(--bg-raised)', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-hi)', margin: '4px 0' }}>
    {children}
  </code>
)

const ComponentDesignGuide = () => (
  <div style={{ maxWidth: 720, fontFamily: 'var(--font-ui)' }}>
    {/* Hero */}
    <div
      style={{
        padding: '40px 36px',
        borderRadius: 16,
        background: 'linear-gradient(135deg, var(--accent-dim) 0%, var(--ai-dim) 100%)',
        marginBottom: 40,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Design Philosophy</div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-hi)', marginBottom: 8 }}>Component Design Guide</h1>
      <p style={{ fontSize: 14, color: 'var(--text-md)', lineHeight: 1.7, maxWidth: 500 }}>
        コンポーネント設計の6原則、UIステートスタック、レイアウト責任分離パターン。
      </p>
    </div>

    {/* 6 Principles */}
    <section style={{ marginBottom: 48 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Principles</div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-hi)' }}>6つの設計原則</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {[
          {
            num: '01', title: '間接化', subtitle: 'Indirection',
            desc: 'UIを直接ハードコードせずトークン・変数経由で制御する。テーマ対応の基盤。',
            doCode: ['color: var(--accent)', 'background: var(--bg-surface)'],
            dontCode: ['color: #004590', 'background: #ffffff'],
          },
          {
            num: '02', title: 'カプセル化', subtitle: 'Encapsulation',
            desc: '内部実装を隠し、公開APIだけで操作する。変更の影響範囲を限定する。',
            doCode: ['<Button variant="danger">削除</Button>'],
            dontCode: ['<button className="bg-red-600 ...">削除</button>'],
          },
          {
            num: '03', title: '制約', subtitle: 'Constraint',
            desc: '選択肢を意図的に狭めてミスを防ぐ。サイズは xs/sm/md/lg の4つのみ。',
            doCode: ["size: 'xs' | 'sm' | 'md' | 'lg'"],
            dontCode: ['size: number // 任意のpx指定'],
          },
          {
            num: '04', title: '意味の符号化', subtitle: 'Semantic Encoding',
            desc: '見た目ではなく意味で命名する。--accent は「ブランドカラー」であり「青」ではない。',
            doCode: ['--accent, --err, --ai-col'],
            dontCode: ['--blue, --red, --purple'],
          },
          {
            num: '05', title: '合成', subtitle: 'Composition',
            desc: '小さなコンポーネントを組み合わせて大きなUIを作る。',
            doCode: ['<SectionCard title="特性">', '  <FormGroup><UnitInput unit="MPa" /></FormGroup>', '</SectionCard>'],
            dontCode: ['<MaterialPropertyCard>', '  {/* 巨大なモノリシック */}', '</MaterialPropertyCard>'],
          },
          {
            num: '06', title: '慣習', subtitle: 'Convention',
            desc: 'チーム内の共通ルールを遵守する。命名、ファイル構成、propsの設計を統一する。',
            doCode: ["variant: 'primary' | 'danger' | 'ghost'", '// 全コンポーネントで統一'],
            dontCode: ["type: 'main' // Buttonだけ別の命名", "kind: 'warning' // Badgeも別の命名"],
          },
        ].map(p => (
          <div key={p.num}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)', opacity: 0.3, fontFamily: 'var(--font-mono)' }}>{p.num}</span>
              <div>
                <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-hi)' }}>{p.title}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginLeft: 8 }}>{p.subtitle}</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.7, marginBottom: 12, paddingLeft: 50 }}>{p.desc}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, paddingLeft: 50 }}>
              <DoBox>{p.doCode.map((c, i) => <CodeLine key={i}>{c}</CodeLine>)}</DoBox>
              <DontBox>{p.dontCode.map((c, i) => <CodeLine key={i}>{c}</CodeLine>)}</DontBox>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* State Stack */}
    <section style={{ marginBottom: 48 }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>State Stack</div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-hi)' }}>UIステートスタック</h2>
        <p style={{ fontSize: 13, color: 'var(--text-lo)', marginTop: 4 }}>全データ表示コンポーネントは以下の5状態を考慮する</p>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[
          { state: 'Empty', color: 'var(--text-lo)', icon: '○' },
          { state: 'Loading', color: 'var(--accent)', icon: '◔' },
          { state: 'Error', color: 'var(--err)', icon: '✕' },
          { state: 'Partial', color: 'var(--warn)', icon: '◑' },
          { state: 'Ideal', color: 'var(--ok)', icon: '●' },
        ].map(s => (
          <div
            key={s.state}
            style={{
              flex: 1,
              padding: '20px 12px',
              borderRadius: 12,
              background: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-xs)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, color: s.color, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.state}</div>
          </div>
        ))}
      </div>
    </section>

    {/* Layout Patterns */}
    <section>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Layout</div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-hi)' }}>サイジングパターン</h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
        {[
          { pattern: 'Fill', desc: '親の幅いっぱいに広がる', visual: '100%' },
          { pattern: 'Hug', desc: 'コンテンツに合わせて縮む', visual: 'fit' },
          { pattern: 'Fixed', desc: '固定幅', visual: '320px' },
        ].map(p => (
          <div
            key={p.pattern}
            style={{
              padding: '20px',
              borderRadius: 12,
              background: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-xs)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', opacity: 0.25, marginBottom: 4 }}>{p.visual}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 4 }}>{p.pattern}</div>
            <div style={{ fontSize: 12, color: 'var(--text-md)' }}>{p.desc}</div>
          </div>
        ))}
      </div>
    </section>
  </div>
)

const meta: Meta<typeof ComponentDesignGuide> = {
  title: 'Design Philosophy/ComponentDesignGuide',
  component: ComponentDesignGuide,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'コンポーネント設計の6原則（間接化・カプセル化・制約・意味の符号化・合成・慣習）、UIステートスタック、レイアウトパターン。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof ComponentDesignGuide>

export const Default: Story = {}
