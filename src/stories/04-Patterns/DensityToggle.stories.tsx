import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';
import { Card, Badge, Button, Input, FormGroup } from '../../components/atoms';

/**
 * UI 密度トグルの視覚的な比較ストーリー。
 * data-density 属性を切り替えて Compact / Regular / Relaxed の見た目差を確認する。
 */

const DensityDemo = ({ density }: { density: 'compact' | 'regular' | 'relaxed' }) => {
  useEffect(() => {
    document.documentElement.setAttribute('data-density', density);
    return () => document.documentElement.setAttribute('data-density', 'regular');
  }, [density]);

  return (
    <div className="density-scale flex flex-col gap-4 max-w-2xl">
      <h2 className="text-[16px] font-bold text-text-hi">
        Density: {density} — {density === 'compact' ? 'scale(0.92)' : density === 'relaxed' ? 'scale(1.08)' : 'scale(1.0)'}
      </h2>

      {/* テーブル */}
      <Card className="overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-raised">
              <th className="px-3 py-2 text-left text-[11px] font-bold text-text-lo uppercase border-b border-[var(--border-faint)]">ID</th>
              <th className="px-3 py-2 text-left text-[11px] font-bold text-text-lo uppercase border-b border-[var(--border-faint)]">Material</th>
              <th className="px-3 py-2 text-left text-[11px] font-bold text-text-lo uppercase border-b border-[var(--border-faint)]">HV</th>
              <th className="px-3 py-2 text-left text-[11px] font-bold text-text-lo uppercase border-b border-[var(--border-faint)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { id: 'MT-0001', name: 'SUS316L', hv: 180, status: 'Approved' },
              { id: 'MT-0002', name: 'Ti-6Al-4V', hv: 340, status: 'Review Pending' },
              { id: 'MT-0003', name: 'Inconel 718', hv: 420, status: 'Registered' },
            ].map(r => (
              <tr key={r.id} className="border-b border-[var(--border-faint)]">
                <td className="px-3 py-2 text-text-lo">{r.id}</td>
                <td className="px-3 py-2 font-semibold">{r.name}</td>
                <td className="px-3 py-2 tabular-nums">{r.hv}</td>
                <td className="px-3 py-2"><Badge>{r.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* フォーム */}
      <Card className="p-4">
        <div className="grid grid-cols-2 gap-3">
          <FormGroup label="Material Name" required>
            <Input placeholder="e.g. SUS304-L" />
          </FormGroup>
          <FormGroup label="Hardness">
            <Input type="number" placeholder="200" />
          </FormGroup>
        </div>
        <div className="flex gap-2 mt-3">
          <Button variant="primary">Register</Button>
          <Button variant="default">Cancel</Button>
        </div>
      </Card>

      {/* チャット風 */}
      <Card className="p-4">
        <div className="flex flex-col gap-2">
          <div className="bg-raised rounded-lg p-3 text-[13px] text-text-md max-w-[80%]">
            SUS316L の典型的な硬度範囲を教えてください。
          </div>
          <div className="bg-accent-dim rounded-lg p-3 text-[13px] text-accent max-w-[80%] ml-auto">
            SUS316L (オーステナイト系ステンレス鋼) の硬度は一般的に 150〜220 HV です。
          </div>
        </div>
      </Card>
    </div>
  );
};

const meta: Meta<typeof DensityDemo> = {
  title: 'Patterns/DensityToggle',
  component: DensityDemo,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'UI 密度 (Compact / Regular / Relaxed) の視覚比較。data-density 属性で CSS transform scale を適用し、全テキスト・コンポーネントのサイズを一括制御する。',
      },
    },
  },
  argTypes: {
    density: {
      control: 'select',
      options: ['compact', 'regular', 'relaxed'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DensityDemo>;

export const Compact: Story = { args: { density: 'compact' } };
export const Regular: Story = { args: { density: 'regular' } };
export const Relaxed: Story = { args: { density: 'relaxed' } };

export const SideBySide: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <DensityDemo density="compact" />
      <hr className="border-[var(--border-faint)]" />
      <DensityDemo density="regular" />
      <hr className="border-[var(--border-faint)]" />
      <DensityDemo density="relaxed" />
    </div>
  ),
};
