import React from 'react';
import { Icon } from '../Icon';
import { Button, Card, ProgressBar } from '../atoms';

// ─── Types ───────────────────────────────────────────────────────────────

export interface WizardStep {
  id: string;
  label: string;
  icon?: string;
  /** ステップ内容のバリデーション。true を返すと次へ進める */
  validate?: () => boolean;
}

export interface StepWizardProps {
  steps: WizardStep[];
  current: number;
  onStepChange: (index: number) => void;
  children: React.ReactNode;
  /** 最終ステップの送信ボタンラベル */
  submitLabel?: string;
  onSubmit: () => void;
  onCancel: () => void;
  /** 送信ボタンの disabled 制御 */
  submitDisabled?: boolean;
  className?: string;
}

// ─── Stepper indicator ───────────────────────────────────────────────────

interface StepIndicatorProps {
  steps: WizardStep[];
  current: number;
  onStepClick: (index: number) => void;
}

const StepIndicator = ({ steps, current, onStepClick }: StepIndicatorProps) => {
  const progress = ((current + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col gap-3">
      <ProgressBar value={progress} />
      <div className="flex items-center gap-1">
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const clickable = i < current;
          return (
            <React.Fragment key={step.id}>
              {i > 0 && (
                <div
                  className={`flex-1 h-px transition-colors duration-300 ${
                    done ? 'bg-accent' : 'bg-[var(--border-faint)]'
                  }`}
                />
              )}
              <button
                type="button"
                onClick={() => clickable && onStepClick(i)}
                disabled={!clickable && !active}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-medium
                  transition-all duration-200 select-none whitespace-nowrap
                  ${active
                    ? 'bg-accent-dim text-accent border border-accent'
                    : done
                      ? 'bg-[var(--ok-dim)] text-ok border border-transparent cursor-pointer hover:brightness-95'
                      : 'bg-raised text-text-lo border border-[var(--border-faint)]'
                  }
                  ${!clickable && !active ? 'cursor-default' : ''}
                `}
                aria-current={active ? 'step' : undefined}
              >
                <span
                  className={`
                    w-5 h-5 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0
                    ${active
                      ? 'bg-accent text-white'
                      : done
                        ? 'bg-ok text-white'
                        : 'bg-raised text-text-lo border border-[var(--border-default)]'
                    }
                  `}
                >
                  {done ? <Icon name="check" size={12} /> : i + 1}
                </span>
                <span>{step.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// ─── StepWizard ──────────────────────────────────────────────────────────

export const StepWizard = ({
  steps,
  current,
  onStepChange,
  children,
  submitLabel = '登録する',
  onSubmit,
  onCancel,
  submitDisabled,
  className = '',
}: StepWizardProps) => {
  const isFirst = current === 0;
  const isLast = current === steps.length - 1;

  const goNext = () => {
    const step = steps[current] as WizardStep | undefined;
    if (step?.validate && !step.validate()) return;
    onStepChange(current + 1);
  };

  const goPrev = () => {
    if (current > 0) onStepChange(current - 1);
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <StepIndicator steps={steps} current={current} onStepClick={onStepChange} />

      <div className="min-h-[280px]">
        {children}
      </div>

      <Card className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-[12px] text-text-lo">
            ステップ {current + 1} / {steps.length}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="default" onClick={onCancel}>
              キャンセル
            </Button>
            {!isFirst && (
              <Button variant="default" onClick={goPrev}>
                <Icon name="chevronLeft" size={14} />
                戻る
              </Button>
            )}
            {isLast ? (
              <Button variant="primary" onClick={onSubmit} disabled={submitDisabled}>
                {submitLabel}
              </Button>
            ) : (
              <Button variant="primary" onClick={goNext}>
                次へ
                <Icon name="chevronRight" size={14} />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
