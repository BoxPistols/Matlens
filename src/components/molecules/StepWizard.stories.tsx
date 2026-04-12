import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from '@storybook/test';
import { useState } from 'react';
import { StepWizard } from './StepWizard';
import type { WizardStep } from './StepWizard';
import { Card } from '../atoms';

// ─── ステップコンテンツのダミー ──────────────────────────────────────────

const StepContent = ({ step }: { step: number }) => {
  const contents = [
    <Card className="p-4">
      <div className="text-[12px] font-bold text-text-lo tracking-[.04em] uppercase mb-3">基本情報</div>
      <div className="grid grid-cols-2 gap-3 text-[13px]">
        <div><span className="text-text-lo">材料名称:</span> SUS316L 改良型</div>
        <div><span className="text-text-lo">カテゴリ:</span> 金属合金</div>
        <div><span className="text-text-lo">組成:</span> Fe-18Cr-12Ni-2.5Mo</div>
        <div><span className="text-text-lo">バッチ:</span> B-042</div>
      </div>
    </Card>,
    <Card className="p-4">
      <div className="text-[12px] font-bold text-text-lo tracking-[.04em] uppercase mb-3">物性データ</div>
      <div className="grid grid-cols-3 gap-3 text-[13px]">
        <div><span className="text-text-lo">硬度:</span> 180 HV</div>
        <div><span className="text-text-lo">引張強さ:</span> 520 MPa</div>
        <div><span className="text-text-lo">弾性率:</span> 193 GPa</div>
        <div><span className="text-text-lo">伸び:</span> 40%</div>
        <div><span className="text-text-lo">密度:</span> 7.98 g/cm³</div>
      </div>
    </Card>,
    <Card className="p-4">
      <div className="text-[12px] font-bold text-text-lo tracking-[.04em] uppercase mb-3">登録内容の確認</div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
        {[
          ['材料名称', 'SUS316L 改良型'], ['カテゴリ', '金属合金'],
          ['組成', 'Fe-18Cr-12Ni-2.5Mo'], ['硬度', '180 HV'],
          ['引張強さ', '520 MPa'], ['弾性率', '193 GPa'],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-2 py-1.5 border-b border-[var(--border-faint)]">
            <span className="text-[12px] text-text-lo w-20 flex-shrink-0">{k}</span>
            <span className="font-medium text-text-hi">{v}</span>
          </div>
        ))}
      </div>
    </Card>,
  ];
  return contents[step] ?? null;
};

// ─── 共通 steps 定義 ────────────────────────────────────────────────────

const BASE_STEPS: WizardStep[] = [
  { id: 'basic', label: '基本情報' },
  { id: 'props', label: '物性データ' },
  { id: 'confirm', label: '確認・登録' },
];

// ─── Interactive wrapper ─────────────────────────────────────────────────

const InteractiveWizard = ({
  initialStep = 0,
  steps = BASE_STEPS,
  submitDisabled,
}: {
  initialStep?: number;
  steps?: WizardStep[];
  submitDisabled?: boolean;
}) => {
  const [current, setCurrent] = useState(initialStep);
  return (
    <div style={{ maxWidth: 640 }}>
      <StepWizard
        steps={steps}
        current={current}
        onStepChange={setCurrent}
        onSubmit={fn()}
        onCancel={fn()}
        submitDisabled={submitDisabled}
      >
        <StepContent step={current} />
      </StepWizard>
    </div>
  );
};

// ─── Meta ────────────────────────────────────────────────────────────────

const meta: Meta<typeof StepWizard> = {
  title: 'Components/Molecules/StepWizard',
  component: StepWizard,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'ステップ形式の入力ウィザード。ProgressBar + ステップインジケータでナビゲーションし、各ステップに validate を設定できる。',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StepWizard>;

/** 3ステップの基本表示 (Step1 active) */
export const Default: Story = {
  render: () => <InteractiveWizard />,
};

/** Step2 active (Step1 は完了マーク) */
export const SecondStep: Story = {
  render: () => <InteractiveWizard initialStep={1} />,
};

/** Step3 active (確認画面) */
export const FinalStep: Story = {
  render: () => <InteractiveWizard initialStep={2} />,
};

/** バリデーション失敗で進めない例 */
export const WithValidation: Story = {
  render: () => {
    const stepsWithValidation: WizardStep[] = [
      { id: 'basic', label: '基本情報', validate: () => false },
      { id: 'props', label: '物性データ' },
      { id: 'confirm', label: '確認・登録' },
    ];
    return (
      <div style={{ maxWidth: 640 }}>
        <div className="mb-3 px-3 py-2 rounded-md bg-err-dim text-err text-[12px] flex items-center gap-2">
          ⚠ Step1 の validate が常に false を返すため「次へ」を押しても進めません
        </div>
        <InteractiveWizard steps={stepsWithValidation} />
      </div>
    );
  },
};
