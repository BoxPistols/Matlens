import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OwnerLoadSummary } from './OwnerLoadSummary';
import type { Project, User } from '@/domain/types';

const makeProject = (
  id: string,
  status: Project['status'],
  pmId: string,
  leadEngineerId: string
): Project => ({
  id,
  code: `IIC-${id}`,
  title: 'test',
  customerId: 'cst',
  industryTagIds: [],
  status,
  startedAt: '2026-03-01',
  dueAt: null,
  completedAt: null,
  specimenCount: 0,
  testCount: 0,
  pmId,
  leadEngineerId,
  description: null,
  createdAt: '2026-03-01',
  updatedAt: '2026-03-01',
  createdBy: 'u',
  updatedBy: 'u',
});

const makeUser = (id: string, name: string): User => ({
  id,
  name,
  email: 'x@x',
  role: 'pm',
  avatarUrl: null,
  createdAt: '2026-03-01',
  updatedAt: '2026-03-01',
});

describe('OwnerLoadSummary', () => {
  it('PM / リードエンジニア それぞれの進行中案件数を表示', () => {
    const current = makeProject('p1', 'in_progress', 'u_pm', 'u_eng');
    const allProjects = [
      current,
      makeProject('p2', 'in_progress', 'u_pm', 'u_other'),
      makeProject('p3', 'reviewing', 'u_other', 'u_eng'),
      makeProject('p4', 'completed', 'u_pm', 'u_eng'), // completed は含めない
    ];
    const users = new Map<string, User>([
      ['u_pm', makeUser('u_pm', '佐藤 隆志')],
      ['u_eng', makeUser('u_eng', '鈴木 誠')],
    ]);

    render(<OwnerLoadSummary project={current} allProjects={allProjects} users={users} />);

    expect(screen.getByText('PM')).toBeInTheDocument();
    expect(screen.getByText('リードエンジニア')).toBeInTheDocument();
    expect(screen.getByText('佐藤 隆志')).toBeInTheDocument();
    expect(screen.getByText('鈴木 誠')).toBeInTheDocument();
    // PM: p1 + p2 = 2 案件
    // Eng: p1 + p3 = 2 案件
    expect(screen.getAllByText('2').length).toBe(2);
  });

  it('PM = リードエンジニアなら同一カウント', () => {
    const current = makeProject('p1', 'in_progress', 'u_same', 'u_same');
    const allProjects = [
      current,
      makeProject('p2', 'in_progress', 'u_same', 'u_same'),
    ];
    const users = new Map<string, User>([['u_same', makeUser('u_same', '田中 一郎')]]);
    render(<OwnerLoadSummary project={current} allProjects={allProjects} users={users} />);
    // 両カードに 2 が表示される（同一ユーザー）
    expect(screen.getAllByText('2').length).toBe(2);
    expect(screen.getAllByText('田中 一郎').length).toBe(2);
  });

  it('users index に無い担当者は ID のまま表示', () => {
    const current = makeProject('p1', 'in_progress', 'u_missing', 'u_also_missing');
    render(
      <OwnerLoadSummary project={current} allProjects={[current]} users={new Map()} />,
    );
    expect(screen.getByText('u_missing')).toBeInTheDocument();
    expect(screen.getByText('u_also_missing')).toBeInTheDocument();
  });
});
