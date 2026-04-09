import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { AIInsightCard, VecCard, KpiCard, SearchBox, FilterChip, MarkdownBubble } from '../../components/molecules';

const meta = {
  title: 'Molecules/DataCards',
  component: AIInsightCard,
  tags: ['autodocs'],
} satisfies Meta<typeof AIInsightCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** AIInsightCard — Controls で loading/chips を切替 */
export const AIInsight: Story = {
  args: {
    loading: false,
    children: 'Ti-6Al-4V チタン合金は高強度・低密度で、航空宇宙用途に最適な材料です。',
    chips: [
      { label: '金属合金を表示', onClick: fn() },
      { label: 'セラミクスと比較', onClick: fn() },
    ],
  },
};

/** 全カード系コンポーネントの一覧 */
export const AllCards: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <AIInsightCard loading={false} chips={[{ label: 'RAGで詳しく', onClick: fn() }]}>
        材料DB: 総16件、レビュー待2件。AI検出3件。研究リーダーへの推奨: レビュー待ちデータの優先対応。
      </AIInsightCard>

      <AIInsightCard loading={true} />

      <VecCard>
        各材料テキストを <strong style={{ color: 'var(--text-hi)' }}>TF.js Universal Sentence Encoder</strong> で 512次元ベクトルに変換。
        クエリとの <strong style={{ color: 'var(--text-hi)' }}>コサイン類似度</strong> を計算してランキング表示。
      </VecCard>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <KpiCard label="総データ件数" value={16} delta="▲ 12件（今月）" deltaUp={true} />
        <KpiCard label="実験バッチ数" value={38} delta="▲ 3バッチ" deltaUp={true} />
        <KpiCard label="レビュー待ち" value={2} delta="▼ 要対応" deltaUp={false} />
        <KpiCard label="AI 検出" value={3} delta="異常値候補あり" color="var(--ai-col)" />
      </div>
    </div>
  ),
};

/** SearchBox + FilterChip */
export const SearchAndFilter: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
      <SearchBox value="" onChange={fn()} placeholder="材料名・ID・組成で検索..." />
      <SearchBox value="SUS304" onChange={fn()} />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <FilterChip label="金属合金" onRemove={fn()} />
        <FilterChip label="承認済" onRemove={fn()} />
        <FilterChip label="HV: 100〜500" onRemove={fn()} />
      </div>
    </div>
  ),
};

/** MarkdownBubble — AI回答表示 */
export const MarkdownRendering: Story = {
  render: () => (
    <div style={{ maxWidth: 600 }}>
      <MarkdownBubble
        text={`## Ti-6Al-4V チタン合金

**主な特性:**
- 引張強さ: **950 MPa**
- 弾性率: 114 GPa
- 密度: 4.43 g/cm³

\`\`\`
組成: Ti-6Al-4V (wt%)
\`\`\`

> 航空宇宙用途に最適な高比強度材料`}
        onSpeak={fn()}
      />
    </div>
  ),
};
