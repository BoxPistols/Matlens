import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CellTestList } from './CellTestList';
import type { DamageFinding, Specimen, Test } from '@/domain/types';

const audit = {
  createdAt: '2026-04-17T10:00:00+09:00',
  updatedAt: '2026-04-17T10:00:00+09:00',
  createdBy: 'u',
  updatedBy: 'u',
};

const specimen: Specimen = {
  id: 'spec-1',
  code: 'SP-001',
  projectId: 'p-1',
  materialId: 'm-1',
  dimensions: { shape: 'bar', diameter: 10 },
  cutFrom: { parentPart: null, location: null, direction: null },
  receivedAt: '2026-04-01',
  location: 'R1',
  status: 'tested',
  notes: null,
  ...audit,
};

const test1: Test = {
  id: 'test-1',
  specimenId: 'spec-1',
  testTypeId: 'tt-tensile',
  condition: { temperature: { value: 25, unit: 'C' }, atmosphere: 'air' },
  standardIds: [],
  performedAt: '2026-04-10T10:00:00+09:00',
  operatorId: 'u',
  equipmentId: null,
  status: 'completed',
  resultMetrics: [],
  rawDataRefs: [],
  observations: [],
  ...audit,
};

const test2: Test = { ...test1, id: 'test-2', performedAt: '2026-04-12T10:00:00+09:00' };

const damage: DamageFinding = {
  id: 'd-1',
  reportId: 'r-1',
  testId: 'test-1',
  type: 'fatigue',
  location: 'fillet',
  rootCauseHypothesis: '',
  confidenceLevel: 'medium',
  images: [],
  similarCaseIds: [],
  tags: [],
  ...audit,
};

describe('CellTestList', () => {
  it('renders "no tests" message when empty', () => {
    render(
      <CellTestList
        tests={[]}
        specimens={[]}
        damages={[]}
        onExportSingle={vi.fn()}
        onExportAll={vi.fn()}
      />,
    );
    expect(screen.getByText(/過去試験はまだありません/)).toBeInTheDocument();
  });

  it('lists each test with its specimen code and damage count', () => {
    render(
      <CellTestList
        tests={[test1, test2]}
        specimens={[specimen]}
        damages={[damage]}
        onExportSingle={vi.fn()}
        onExportAll={vi.fn()}
      />,
    );
    expect(screen.getByText('test-1')).toBeInTheDocument();
    expect(screen.getByText('test-2')).toBeInTheDocument();
    expect(screen.getAllByText(/試験片 SP-001/).length).toBeGreaterThan(0);
    expect(screen.getByText('損傷 1 件')).toBeInTheDocument();
  });

  it('invokes onExportSingle with the row test id', () => {
    const onExportSingle = vi.fn();
    render(
      <CellTestList
        tests={[test1, test2]}
        specimens={[specimen]}
        damages={[]}
        onExportSingle={onExportSingle}
        onExportAll={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText('test-2 を MaiML エクスポート'));
    expect(onExportSingle).toHaveBeenCalledWith('test-2');
  });

  it('invokes onExportAll on the bulk button', () => {
    const onExportAll = vi.fn();
    render(
      <CellTestList
        tests={[test1]}
        specimens={[specimen]}
        damages={[]}
        onExportSingle={vi.fn()}
        onExportAll={onExportAll}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '全件 MaiML' }));
    expect(onExportAll).toHaveBeenCalledTimes(1);
  });
});
