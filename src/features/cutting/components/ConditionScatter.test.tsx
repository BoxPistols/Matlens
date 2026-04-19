import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import type { CuttingProcess } from '@/domain/types';
import { ConditionScatter } from './ConditionScatter';

const makeProcess = (id: string, overrides: Partial<CuttingProcess> = {}): CuttingProcess => ({
  id,
  code: `CUT-${id}`,
  specimenId: 'spc_0001',
  materialId: 'mat_sus304',
  toolId: 'tool_em_10_4f_altin',
  operation: 'milling_peripheral',
  condition: {
    cuttingSpeed: 150,
    feed: 0.15,
    feedUnit: 'mm/tooth',
    depthOfCut: 2,
    widthOfCut: 4,
    spindleSpeed: 4775,
    coolant: 'flood',
    notes: null,
  },
  machiningTimeSec: 120,
  cuttingDistanceMm: 25000,
  surfaceRoughnessRa: 1.2,
  toolWearVB: 0.1,
  chatterDetected: false,
  cuttingForceFc: 200,
  cuttingTemperatureC: 180,
  waveformIds: [],
  operatorId: 'usr_eng_001',
  machine: 'MC-01',
  performedAt: '2026-04-20T10:00:00Z',
  createdAt: '2026-04-20T10:00:00Z',
  updatedAt: '2026-04-20T10:00:00Z',
  createdBy: 'usr_eng_001',
  updatedBy: 'usr_eng_001',
  notes: null,
  ...overrides,
});

describe('ConditionScatter', () => {
  it('加工プロセス数ぶんの点をレンダリングする', () => {
    const processes = [
      makeProcess('p1'),
      makeProcess('p2', { condition: { ...makeProcess('p2').condition, cuttingSpeed: 220, feed: 0.2 } }),
      makeProcess('p3', { chatterDetected: true }),
    ];
    const { container } = render(
      <ConditionScatter processes={processes} selectedId={null} onSelect={() => {}} />
    );
    // 凡例の circle を除くため aria-label 付き（データ点のみ）を対象にする
    const dataPoints = container.querySelectorAll('circle[aria-label]');
    expect(dataPoints).toHaveLength(processes.length);
  });

  it('点クリックで onSelect が呼ばれる', () => {
    const processes = [makeProcess('p1')];
    const onSelect = vi.fn();
    const { container } = render(
      <ConditionScatter processes={processes} selectedId={null} onSelect={onSelect} />
    );
    const target = container.querySelector('circle[aria-label]');
    expect(target).not.toBeNull();
    fireEvent.click(target!);
    expect(onSelect).toHaveBeenCalledWith('p1');
  });

  it('選択中の点を再クリックすると onSelect(null) で解除される', () => {
    const processes = [makeProcess('p1')];
    const onSelect = vi.fn();
    const { container } = render(
      <ConditionScatter processes={processes} selectedId="p1" onSelect={onSelect} />
    );
    const target = container.querySelector('circle[aria-label]');
    fireEvent.click(target!);
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it('showStabilityLobe=false のとき概念曲線は描画されない', () => {
    const processes = [makeProcess('p1')];
    const { container } = render(
      <ConditionScatter
        processes={processes}
        selectedId={null}
        onSelect={() => {}}
        showStabilityLobe={false}
      />
    );
    expect(container.querySelector('[aria-label="安定性ローブ概念曲線"]')).toBeNull();
  });
});
