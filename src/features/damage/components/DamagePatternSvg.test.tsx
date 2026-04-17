import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { DamagePatternSvg } from './DamagePatternSvg';

describe('DamagePatternSvg', () => {
  it('同一IDは同一パターンを描画する（決定論的）', () => {
    const { container: c1 } = render(<DamagePatternSvg id="dmg_abc" type="fatigue" />);
    const { container: c2 } = render(<DamagePatternSvg id="dmg_abc" type="fatigue" />);
    expect(c1.innerHTML).toBe(c2.innerHTML);
  });

  it('異なるIDは異なるパターンを描画する', () => {
    const { container: c1 } = render(<DamagePatternSvg id="dmg_a" type="fatigue" />);
    const { container: c2 } = render(<DamagePatternSvg id="dmg_b" type="fatigue" />);
    expect(c1.innerHTML).not.toBe(c2.innerHTML);
  });

  it('ariaLabel を付与する', () => {
    const { container } = render(
      <DamagePatternSvg id="dmg_1" type="corrosion" ariaLabel="腐食サンプル" />
    );
    expect(container.querySelector('svg')?.getAttribute('aria-label')).toBe('腐食サンプル');
  });
});
