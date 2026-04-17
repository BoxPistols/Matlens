import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DamageTypeChip, damageTypeLabel } from './DamageTypeChip';

describe('DamageTypeChip', () => {
  it('各タイプの日本語ラベルを表示する', () => {
    const { rerender } = render(<DamageTypeChip type="fatigue" />);
    expect(screen.getByText('疲労')).toBeInTheDocument();
    rerender(<DamageTypeChip type="stress_corrosion" />);
    expect(screen.getByText('応力腐食')).toBeInTheDocument();
  });

  it('damageTypeLabel は対応するラベルを返す', () => {
    expect(damageTypeLabel('corrosion')).toBe('腐食');
    expect(damageTypeLabel('thermal')).toBe('熱疲労');
  });
});
