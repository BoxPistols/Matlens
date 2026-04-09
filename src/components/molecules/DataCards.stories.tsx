import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { AIInsightCard, VecCard, KpiCard, SearchBox, FilterChip, MarkdownBubble } from './molecules';
import React from 'react';

const DataCardsShowcase = () => <div />;

const meta: Meta<typeof AIInsightCard> = {
  title: 'Components/Molecules/DataCards',
  component: AIInsightCard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'データ表示系のMoleculeコンポーネント群。AIInsightCard / VecCard / KpiCard / SearchBox / FilterChip / MarkdownBubble を含む。',
      },
    },
  },
  argTypes: {
    loading: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: {
    loading: false,
    children: 'Ti-6Al-4V は航空宇宙用途で最も広く使われるチタン合金です。高い比強度と優れた耐食性を持ちます。',
    chips: [
      { label: '類似材料を検索', onClick: fn() },
      { label: '特性を比較', onClick: fn() },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof AIInsightCard>;

/** AIInsightCard の Controls 操作 */
export const AIInsight: Story = {};

/** 全カードタイプの一覧 */
export const AllCards: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        AI Insight Card
      </div>
      <AIInsightCard
        chips={[
          { label: '組成を分析', onClick: fn() },
          { label: '用途を提案', onClick: fn() },
        ]}
      >
        この材料は高い硬度（1800 HV）を持つアルミナ基板です。電子基板や耐摩耗部品に適しています。
      </AIInsightCard>

      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        AI Insight Card（読み込み中）
      </div>
      <AIInsightCard loading />

      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        Vec Card
      </div>
      <VecCard>
        コサイン類似度 0.92 で最も近い材料は SUS316L です。組成と機械特性の類似性が高く、耐食性用途では代替候補となります。
      </VecCard>

      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-lo)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
        KPI Cards
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <KpiCard label="総登録数" value="247" delta="+12 今月" deltaUp />
        <KpiCard label="承認率" value="89%" delta="-2.1%" deltaUp={false} color="var(--accent)" />
        <KpiCard label="ベクトル索引" value="15" delta="Ready" color="var(--vec)" />
      </div>
    </div>
  ),
};

/** 検索ボックス + フィルタチップ */
export const SearchAndFilter: Story = {
  render: () => {
    const [query, setQuery] = React.useState('チタン合金');
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 480 }}>
        <SearchBox value={query} onChange={setQuery} placeholder="材料名・組成・IDで検索..." />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <FilterChip label="カテゴリ: 金属合金" onRemove={fn()} />
          <FilterChip label="ステータス: 承認済" onRemove={fn()} />
          <FilterChip label="バッチ: B-038" onRemove={fn()} />
        </div>
      </div>
    );
  },
};

/** Markdown レンダリング */
export const Markdown: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <MarkdownBubble
        text={`## Ti-6Al-4V 分析結果

この材料は**航空宇宙グレード**のチタン合金です。

### 主要特性
| 項目 | 値 | 評価 |
|------|-----|------|
| 硬度 | 330 HV | 良好 |
| 引張強さ | 950 MPa | 優秀 |
| 弾性率 | 114 GPa | 標準 |

### 推奨用途
- タービンブレード
- 医療インプラント
- 高温配管

> 注: 加工性はやや低いため、切削条件の最適化が必要です。

\`\`\`
密度: 4.43 g/cm3
融点: ~1660 ℃
\`\`\``}
        onSpeak={fn()}
      />
    </div>
  ),
};
