import type { Meta, StoryObj } from '@storybook/react-vite'
import { StoryCode } from '../_shared/StoryCode'

// Storybook という道具そのものの解説。プロダクトの中身より前に「何を見ている画面なのか」を揃えるためのページ。

const Section = ({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: 32 }}>
    <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-hi)', marginBottom: 4 }}>{title}</h2>
    {lead && <p style={{ fontSize: 13, color: 'var(--text-lo)', lineHeight: 1.7, marginBottom: 12 }}>{lead}</p>}
    {children}
  </section>
)

const Panel = ({ num, name, where, purpose }: { num: string; name: string; where: string; purpose: string }) => (
  <div
    style={{
      display: 'grid', gridTemplateColumns: '40px 1fr', gap: 12,
      padding: '12px 14px', borderRadius: 10,
      background: 'var(--bg-surface)', boxShadow: 'var(--shadow-xs)',
    }}
  >
    <div
      style={{
        width: 32, height: 32, borderRadius: 8,
        background: 'var(--accent-dim)', color: 'var(--accent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 800,
      }}
    >
      {num}
    </div>
    <div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-hi)' }}>{name}</div>
      <div style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>{where}</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-md)', lineHeight: 1.7, marginTop: 4 }}>{purpose}</div>
    </div>
  </div>
)

const StorybookTutorial = () => (
  <div style={{ maxWidth: 720, fontFamily: 'var(--font-ui)' }}>
    {/* Hero */}
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          fontSize: 12, fontWeight: 700, color: 'var(--accent)',
          letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 6,
        }}
      >
        Storybook Tutorial
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-hi)', marginBottom: 8, letterSpacing: '-0.02em' }}>
        この画面の見方
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-md)', lineHeight: 1.8 }}>
        ここは <strong>Storybook</strong> という、UI 部品 (コンポーネント) を 1 つずつ単独で確認できるカタログツールです。
        アプリ本体を開かずに、個々のボタンや入力欄、カードの振る舞いを独立して試せます。
      </p>
    </div>

    {/* Storybook とは */}
    <Section title="Storybook とは" lead="1 つ 1 つの UI 部品を「ストーリー」として展示するコンポーネントカタログ。">
      <ul style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
        <li>アプリ起動不要で UI を確認できる → デザインレビューが高速化</li>
        <li>Props 変更を GUI で試せる → 仕様議論の共通土台</li>
        <li>自動ドキュメント生成 → 新規参加者のキャッチアップを短縮</li>
        <li>a11y / ビジュアルリグレッションの自動チェック基盤</li>
      </ul>
    </Section>

    {/* 画面構成 */}
    <Section title="画面構成" lead="サイドバー (左) / Canvas (中央) / アドオンパネル (下または右) の 3 ペイン。">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Panel
          num='1'
          name='サイドバー'
          where='左カラム'
          purpose='階層ツリーでコンポーネントと Story を選択。検索は K キー。'
        />
        <Panel
          num='2'
          name='Canvas タブ'
          where='中央・上部 [Canvas]'
          purpose='Story をそのまま描画。コンポーネントの実物がここに出る。'
        />
        <Panel
          num='3'
          name='Docs タブ'
          where='中央・上部 [Docs]'
          purpose='MDX 手書きドキュメント or autodocs 自動生成。props 表と使用例を一覧できる。'
        />
        <Panel
          num='4'
          name='Controls パネル'
          where='下部 [Controls]'
          purpose='Props をリアルタイムに変更。数値・色・セレクト・真偽値を GUI で触れる。'
        />
        <Panel
          num='5'
          name='Actions パネル'
          where='下部 [Actions]'
          purpose='onClick などの呼び出しが起きるとログとして記録される。'
        />
        <Panel
          num='6'
          name='Accessibility パネル'
          where='下部 [Accessibility]'
          purpose='axe-core による a11y 自動チェック結果。違反・注意・合格を色別表示。'
        />
      </div>
    </Section>

    {/* Canvas vs Docs */}
    <Section title="Canvas と Docs の違い" lead="どちらも同じ Story を元にしているが、見せ方が異なる。">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-surface)', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>Canvas</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-md)', lineHeight: 1.7 }}>
            単一 Story を画面いっぱいに描画。Controls で Props を変えながら動作を確認するモード。
          </div>
        </div>
        <div style={{ padding: 14, borderRadius: 10, background: 'var(--bg-surface)', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ai-col)', marginBottom: 6 }}>Docs</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-md)', lineHeight: 1.7 }}>
            コンポーネント全体の紹介ページ。Props 表・複数 Story・使用例が縦に並ぶドキュメント。
          </div>
        </div>
      </div>
    </Section>

    {/* サイドバーアイコン */}
    <Section title="サイドバーのアイコン">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { icon: '📁', name: 'Component', desc: '複数の Story を束ねる単位。通常は 1 コンポーネント = 1 エントリ。' },
          { icon: '📄', name: 'Docs', desc: 'そのコンポーネントのドキュメントページ (MDX または autodocs)。' },
          { icon: '●', name: 'Story', desc: '具体的な Props 設定のスナップショット。Default / Disabled 等。' },
        ].map(item => (
          <div key={item.name} style={{ display: 'flex', gap: 12, fontSize: 13, color: 'var(--text-md)' }}>
            <span style={{ minWidth: 28, textAlign: 'center' }}>{item.icon}</span>
            <span style={{ minWidth: 90, fontWeight: 700, color: 'var(--text-hi)' }}>{item.name}</span>
            <span style={{ color: 'var(--text-lo)' }}>{item.desc}</span>
          </div>
        ))}
      </div>
    </Section>

    {/* Story ファイルの構造 */}
    <Section title="Story ファイルの最小構造" lead="コンポーネントファイルと同階層に *.stories.tsx を置く。">
      <StoryCode lang='tsx'>{`// Button.stories.tsx
import { Button } from './Button'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof Button> = {
  title: 'Components/Atoms/Button',  // サイドバー階層
  component: Button,
  tags: ['autodocs'],                // Docs ページを自動生成
}
export default meta

type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: { label: '保存', variant: 'primary' },
}`}</StoryCode>
      <ul style={{ fontSize: 12.5, color: 'var(--text-md)', lineHeight: 1.9, paddingLeft: 20, margin: '12px 0 0 0' }}>
        <li><code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>title</code>: スラッシュ区切りでサイドバーの階層を決める</li>
        <li><code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>args</code>: Controls パネルの初期値 (= Props のデフォルト)</li>
        <li><code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>tags: ['autodocs']</code>: 付けると Docs タブが自動生成</li>
      </ul>
    </Section>

    {/* キーボードショートカット */}
    <Section title="主要キーボードショートカット">
      <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)' }}>
        <table style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-raised)' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase' }}>キー</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {([
              ['K', 'コンポーネント検索'],
              ['S', 'サイドバー表示/非表示'],
              ['A', 'アドオンパネル表示/非表示'],
              ['D', 'アドオンパネルの向きを切替'],
              ['F', 'フルスクリーン切替'],
              ['Alt + ←/→', '前/次のストーリー'],
            ] as const).map(([k, desc]) => (
              <tr key={k} style={{ borderTop: '1px solid var(--border-faint)' }}>
                <td style={{ padding: '8px 12px' }}>
                  <code
                    style={{
                      fontFamily: 'var(--font-mono)', fontSize: 12,
                      color: 'var(--accent)', padding: '2px 8px',
                      borderRadius: 4, background: 'var(--bg-raised)',
                      border: '1px solid var(--border-faint)',
                    }}
                  >
                    {k}
                  </code>
                </td>
                <td style={{ padding: '8px 12px', color: 'var(--text-md)' }}>{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>

    {/* Storybook 公式リンク */}
    <Section title="さらに学ぶ">
      <ul style={{ fontSize: 13, color: 'var(--text-md)', lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
        <li>
          <a href='https://storybook.js.org/docs' target='_blank' rel='noopener noreferrer' style={{ color: 'var(--accent)' }}>
            Storybook 公式ドキュメント
          </a> — API リファレンス全般
        </li>
        <li>
          <a href='https://storybook.js.org/tutorials/' target='_blank' rel='noopener noreferrer' style={{ color: 'var(--accent)' }}>
            Storybook Tutorials
          </a> — 段階的チュートリアル
        </li>
      </ul>
    </Section>

    {/* 次に読むページ */}
    <Section title="次に読むページ">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { label: 'Guide / Introduction', note: 'Matlens デザインシステムの概要' },
          { label: 'Guide / DomainPrimer', note: '金属・物質研究データのドメイン語彙' },
          { label: 'Guide / HowToUse', note: 'Matlens での具体的な使い方 (起動・インポート)' },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text-md)' }}>
            <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', minWidth: 220 }}>{r.label}</code>
            <span style={{ color: 'var(--text-lo)' }}>{r.note}</span>
          </div>
        ))}
      </div>
    </Section>
  </div>
)

const meta: Meta<typeof StorybookTutorial> = {
  title: 'Guide/StorybookTutorial',
  component: StorybookTutorial,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Storybook という道具そのものの見方。画面構成・Canvas と Docs の違い・Story ファイルの構造・ショートカット。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof StorybookTutorial>
export const Default: Story = {}
