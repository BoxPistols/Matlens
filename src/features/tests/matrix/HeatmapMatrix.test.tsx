import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeatmapMatrix } from './HeatmapMatrix';
import type { Material, TestType } from '@/domain/types';
import type { MatrixCell } from '@/infra/repositories/interfaces';

const materials: Material[] = [
  {
    id: 'mat_a',
    designation: 'SUS304',
    category: 'stainless',
    composition: [],
    standardRefs: [],
    properties: {},
    description: null,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'mat_b',
    designation: 'S45C',
    category: 'steel',
    composition: [],
    standardRefs: [],
    properties: {},
    description: null,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];

const testTypes: TestType[] = [
  {
    id: 'tt_tensile',
    name: '引張試験',
    nameEn: 'Tensile',
    category: 'mechanical',
    defaultStandardIds: [],
    iconKey: 'tensile',
    description: '',
  },
  {
    id: 'tt_fatigue',
    name: '疲労試験',
    nameEn: 'Fatigue',
    category: 'mechanical',
    defaultStandardIds: [],
    iconKey: 'fatigue',
    description: '',
  },
];

const cells: MatrixCell[] = [
  {
    materialId: 'mat_a',
    testTypeId: 'tt_tensile',
    count: 5,
    latestPerformedAt: '2026-03-15T10:00:00+09:00',
    representativeTemperature: 23,
    atmospheres: ['air'],
  },
];

describe('HeatmapMatrix', () => {
  it('材料行・試験種別列・合計列をレンダリングする', () => {
    render(<HeatmapMatrix materials={materials} testTypes={testTypes} cells={cells} />);
    expect(screen.getByText('SUS304')).toBeInTheDocument();
    expect(screen.getByText('S45C')).toBeInTheDocument();
    expect(screen.getByText('引張試験')).toBeInTheDocument();
    expect(screen.getByText('疲労試験')).toBeInTheDocument();
  });

  it('件数が 0 のセルは中黒表示、件数ありは数値表示', () => {
    render(<HeatmapMatrix materials={materials} testTypes={testTypes} cells={cells} />);
    expect(screen.getByLabelText('SUS304 × 引張試験: 5件')).toHaveTextContent('5');
    expect(screen.getByLabelText('SUS304 × 疲労試験: 0件')).toHaveTextContent('·');
  });

  it('セルクリックで onCellClick が呼ばれる', () => {
    const handler = vi.fn();
    render(
      <HeatmapMatrix
        materials={materials}
        testTypes={testTypes}
        cells={cells}
        onCellClick={handler}
      />
    );
    fireEvent.click(screen.getByLabelText('SUS304 × 引張試験: 5件'));
    expect(handler).toHaveBeenCalledWith('mat_a', 'tt_tensile');
  });
});
