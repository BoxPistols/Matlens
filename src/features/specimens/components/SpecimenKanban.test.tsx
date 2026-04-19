import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import type { Specimen } from '@/domain/types';
import { SpecimenKanban } from './SpecimenKanban';

const makeSpecimen = (id: string, overrides: Partial<Specimen> = {}): Specimen => ({
  id,
  code: `SPC-${id}`,
  projectId: 'prj_0001',
  materialId: 'mat_sus304',
  dimensions: { shape: 'bar', length: 100, diameter: 10 },
  cutFrom: { parentPart: null, location: null, direction: null },
  receivedAt: '2026-03-10',
  location: 'A-1',
  status: 'received',
  notes: null,
  createdAt: '2026-03-10T10:00:00Z',
  updatedAt: '2026-03-10T10:00:00Z',
  createdBy: 'usr_op_001',
  updatedBy: 'usr_op_001',
  ...overrides,
});

describe('SpecimenKanban', () => {
  it('5 カラム（受入・準備・試験中・試験済・保管）に振り分けられる', () => {
    const specimens = [
      makeSpecimen('a', { status: 'received' }),
      makeSpecimen('b', { status: 'prepared' }),
      makeSpecimen('c', { status: 'testing' }),
      makeSpecimen('d', { status: 'tested' }),
      makeSpecimen('e', { status: 'stored' }),
    ];
    const { getByLabelText } = render(
      <SpecimenKanban
        specimens={specimens}
        projectsById={undefined}
        materialsById={undefined}
      />
    );
    expect(getByLabelText('受入 1 件')).toBeTruthy();
    expect(getByLabelText('準備 1 件')).toBeTruthy();
    expect(getByLabelText('試験中 1 件')).toBeTruthy();
    expect(getByLabelText('試験済 1 件')).toBeTruthy();
    expect(getByLabelText('保管 1 件')).toBeTruthy();
  });

  it('includeDiscarded=false なら廃棄カラムを表示しない', () => {
    const { queryByLabelText } = render(
      <SpecimenKanban
        specimens={[makeSpecimen('x', { status: 'discarded' })]}
        projectsById={undefined}
        materialsById={undefined}
      />
    );
    expect(queryByLabelText(/廃棄.*件/)).toBeNull();
  });

  it('includeDiscarded=true で廃棄カラムが追加される', () => {
    const { getByLabelText } = render(
      <SpecimenKanban
        specimens={[makeSpecimen('x', { status: 'discarded' })]}
        projectsById={undefined}
        materialsById={undefined}
        includeDiscarded
      />
    );
    expect(getByLabelText('廃棄 1 件')).toBeTruthy();
  });

  it('カードクリックで onSelect が呼ばれる', () => {
    const onSelect = vi.fn();
    const { container } = render(
      <SpecimenKanban
        specimens={[makeSpecimen('abc')]}
        projectsById={undefined}
        materialsById={undefined}
        onSelect={onSelect}
      />
    );
    const card = container.querySelector('[role="button"][aria-label^="試験片"]');
    expect(card).not.toBeNull();
    fireEvent.click(card!);
    expect(onSelect).toHaveBeenCalledWith('abc');
  });
});
