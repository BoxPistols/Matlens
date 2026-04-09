import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'
import { fn } from '@storybook/test'
import { Card, Badge, Button } from '../../components/atoms'
import { SearchBox, FilterChip, VecCard } from '../../components/molecules'
import { Icon } from '../../components/Icon'

const RESULTS = [
  { name: 'Ti-6Al-4V', category: '金属合金', hardness: '330 HV', tensile: '950 MPa', status: '承認済', score: 0.98 },
  { name: 'Ti-6Al-7Nb', category: '金属合金', hardness: '310 HV', tensile: '900 MPa', status: '承認済', score: 0.92 },
  { name: 'Ti-5Al-2.5Sn', category: '金属合金', hardness: '300 HV', tensile: '830 MPa', status: 'レビュー待', score: 0.87 },
] as const

const SearchResultsPattern = () => {
  const [query, setQuery] = React.useState('チタン合金 航空宇宙')

  return (
    <div style={{ maxWidth: 640, fontFamily: 'var(--font-ui)', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SearchBox value={query} onChange={setQuery} placeholder="材料名・組成・用途で検索..." />

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <FilterChip label="カテゴリ: 金属合金" onRemove={fn()} />
        <FilterChip label="硬度: 300+ HV" onRemove={fn()} />
      </div>

      <VecCard>
        ベクトル検索結果: 「{query}」に類似する材料を 3 件検出しました。コサイン類似度順に表示しています。
      </VecCard>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {RESULTS.map(r => (
          <Card key={r.name} className="p-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-hi)' }}>{r.name}</span>
                  <Badge>{r.status}</Badge>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-lo)' }}>{r.category}</div>
                <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-md)' }}>硬度: <strong>{r.hardness}</strong></span>
                  <span style={{ fontSize: 12, color: 'var(--text-md)' }}>引張強さ: <strong>{r.tensile}</strong></span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--vec)',
                    background: 'var(--vec-dim)',
                    padding: '2px 8px',
                    borderRadius: 4,
                  }}
                >
                  {r.score.toFixed(2)}
                </span>
                <Button variant="ghost" size="xs"><Icon name="similar" size={12} />詳細</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

const meta: Meta<typeof SearchResultsPattern> = {
  title: 'Patterns/SearchResults',
  component: SearchResultsPattern,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: '検索結果パターン。SearchBox + FilterChip + VecCard + 結果リストの組み合わせ例。類似度スコア表示付き。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof SearchResultsPattern>

export const Default: Story = {}
