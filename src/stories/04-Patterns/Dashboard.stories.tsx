import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from '@storybook/test'
import { Card, SectionCard, Button, Badge, ProgressBar } from '../../components/atoms'
import { KpiCard, AIInsightCard, SearchBox, FilterChip } from '../../components/molecules'
import { Icon } from '../../components/Icon'

const DashboardPattern = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720, fontFamily: 'var(--font-ui)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-hi)' }}>ダッシュボード</h1>
      <div style={{ display: 'flex', gap: 6 }}>
        <Button variant="ghost" size="sm"><Icon name="refresh" size={14} />更新</Button>
        <Button variant="primary" size="sm"><Icon name="plus" size={14} />新規登録</Button>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      <KpiCard label="総登録数" value="247" delta="+12 今月" deltaUp />
      <KpiCard label="承認率" value="89%" delta="-2.1%" deltaUp={false} color="var(--accent)" />
      <KpiCard label="ベクトル索引" value="68" delta="Ready" color="var(--vec)" />
    </div>

    <AIInsightCard chips={[{ label: '詳細を表示', onClick: fn() }]}>
      今月の登録傾向：チタン合金の登録が前月比 +40%。航空宇宙部門からの材料データ集約が進行中です。
    </AIInsightCard>

    <SectionCard
      title="最近の登録"
      action={<Button variant="ghost" size="xs"><Icon name="filter" size={12} />フィルタ</Button>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          { name: 'Ti-6Al-4V', category: '金属合金', status: '承認済', progress: 100 },
          { name: 'Al₂O₃ 99.5%', category: 'セラミクス', status: 'レビュー待', progress: 60 },
          { name: 'CFRP T800', category: '複合材料', status: '登録済', progress: 85 },
        ].map(m => (
          <div
            key={m.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 0',
              borderBottom: '1px solid var(--border-faint)',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-hi)' }}>{m.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-lo)' }}>{m.category}</div>
            </div>
            <Badge>{m.status}</Badge>
            <div style={{ width: 80 }}>
              <ProgressBar value={m.progress} color="var(--accent)" />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  </div>
)

const meta: Meta<typeof DashboardPattern> = {
  title: 'Patterns/Dashboard',
  component: DashboardPattern,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'ダッシュボードパターン。KPI・AIインサイト・材料リストを組み合わせた典型的な画面構成例。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof DashboardPattern>

export const Default: Story = {}
