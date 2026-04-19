import { beforeEach, describe, expect, it } from 'vitest';
import { getMockDatabase, resetMockDatabase } from './database';

describe('mockDatabase', () => {
  beforeEach(() => {
    resetMockDatabase();
  });

  it('seed 固定で常に同じ件数を返す', () => {
    const db1 = getMockDatabase();
    const count1 = {
      projects: db1.projects.count(),
      specimens: db1.specimens.count(),
      tests: db1.tests.count(),
      damages: db1.damages.count(),
    };
    resetMockDatabase();
    const db2 = getMockDatabase();
    const count2 = {
      projects: db2.projects.count(),
      specimens: db2.specimens.count(),
      tests: db2.tests.count(),
      damages: db2.damages.count(),
    };
    expect(count1).toEqual(count2);
  });

  it('Project の specimenCount は specimens テーブルと整合する', () => {
    const db = getMockDatabase();
    const projects = db.projects.getAll();
    const specimens = db.specimens.getAll();
    const countMap = new Map<string, number>();
    specimens.forEach((s) => {
      countMap.set(s.projectId, (countMap.get(s.projectId) ?? 0) + 1);
    });
    projects.forEach((p) => {
      expect(p.specimenCount).toBe(countMap.get(p.id) ?? 0);
    });
  });
});
