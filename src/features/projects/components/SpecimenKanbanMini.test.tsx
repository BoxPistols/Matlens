import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpecimenKanbanMini } from './SpecimenKanbanMini';
import type { Specimen } from '@/domain/types';

const makeSpecimen = (id: string, status: Specimen['status']): Specimen => ({
  id,
  code: `SPC-${id}`,
  projectId: 'proj',
  materialId: 'mat',
  dimensions: { shape: 'bar', length: 100, diameter: 10 },
  cutFrom: { parentPart: null, location: null, direction: null },
  receivedAt: '2026-03-01',
  location: 'A-1',
  status,
  notes: null,
  createdAt: '2026-03-01',
  updatedAt: '2026-03-01',
  createdBy: 'u',
  updatedBy: 'u',
});

describe('SpecimenKanbanMini', () => {
  it('6 ステータス列を常に描画し、ステータスごとの件数を表示', () => {
    const specimens = [
      makeSpecimen('a1', 'received'),
      makeSpecimen('a2', 'received'),
      makeSpecimen('b1', 'testing'),
      makeSpecimen('c1', 'stored'),
      makeSpecimen('c2', 'stored'),
      makeSpecimen('c3', 'stored'),
    ];
    render(<SpecimenKanbanMini specimens={specimens} />);
    // 6 列のラベル
    expect(screen.getByText('受入')).toBeInTheDocument();
    expect(screen.getByText('準備')).toBeInTheDocument();
    expect(screen.getByText('試験中')).toBeInTheDocument();
    expect(screen.getByText('試験済')).toBeInTheDocument();
    expect(screen.getByText('保管')).toBeInTheDocument();
    expect(screen.getByText('廃棄')).toBeInTheDocument();
    // 件数
    expect(screen.getByRole('group', { name: '試験片ステータス別件数' })).toBeInTheDocument();
  });

  it('specimens 空でも 6 列 0 件で描画する（破綻しない）', () => {
    render(<SpecimenKanbanMini specimens={[]} />);
    // 受入ラベルの下に 0 があることを確認
    const group = screen.getByRole('group', { name: '試験片ステータス別件数' });
    expect(group.querySelectorAll('.text-\\[11px\\]').length).toBeGreaterThan(0);
  });
});
