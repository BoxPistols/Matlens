import type { Report } from '@/domain/types';
import { delay, paginate } from '@/shared/utils';
import { getMockDatabase } from '@/mocks/database';
import type {
  ReportQuery,
  ReportRepository,
} from '../interfaces/report.repo';

// 削除後の再作成でも採番が衝突しないよう単調増加カウンタを使う
let reportSeq = 0;
const ID_PATTERN = /^rpt_(\d+)$/;
const nextReportSeq = (): number => {
  if (reportSeq === 0) {
    const existing = getMockDatabase()
      .reports.getAll()
      .map((r) => {
        const match = r.id.match(ID_PATTERN);
        return match ? Number(match[1]) : 0;
      });
    reportSeq = existing.length > 0 ? Math.max(...existing) : 0;
  }
  reportSeq += 1;
  return reportSeq;
};

const applySort = (items: Report[], query?: ReportQuery): Report[] => {
  if (!query?.sort) return items;
  const { field, order } = query.sort;
  const sign = order === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (av === bv) return 0;
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    return av > bv ? sign : -sign;
  });
};

const matchFilter = (r: Report, query?: ReportQuery): boolean => {
  const f = query?.filter;
  if (!f) return true;
  if (f.projectId && r.projectId !== f.projectId) return false;
  if (f.testId && !r.testIds.includes(f.testId)) return false;
  if (f.kind && f.kind.length > 0 && !f.kind.includes(r.kind)) return false;
  if (f.status && f.status.length > 0 && !f.status.includes(r.status)) return false;
  if (f.authorId && r.authorId !== f.authorId) return false;
  if (f.tags && f.tags.length > 0 && !f.tags.some((t) => r.tags.includes(t))) return false;
  if (f.search) {
    const q = f.search.toLowerCase();
    if (
      !r.title.toLowerCase().includes(q) &&
      !r.code.toLowerCase().includes(q) &&
      !r.summary.toLowerCase().includes(q)
    ) {
      return false;
    }
  }
  return true;
};

export const createMockReportRepository = (): ReportRepository => ({
  async list(query) {
    await delay(150);
    const filtered = getMockDatabase()
      .reports.getAll()
      .filter((r) => matchFilter(r, query));
    const sorted = applySort(filtered, query);
    return paginate(sorted, query?.page ?? 1, query?.pageSize ?? 20);
  },

  async findById(id) {
    await delay(80);
    return getMockDatabase().reports.getById(id);
  },

  async create(input) {
    await delay(180);
    const db = getMockDatabase();
    const now = new Date('2026-04-20T10:00:00Z').toISOString();
    const seq = nextReportSeq();
    const year = new Date().getFullYear();
    const code = input.code ?? `RPT-${year}-${String(seq).padStart(4, '0')}`;
    const report: Report = {
      id: `rpt_${String(seq).padStart(6, '0')}`,
      code,
      title: input.title,
      titleEn: input.titleEn ?? input.title,
      kind: input.kind,
      status: 'draft',
      projectId: input.projectId ?? null,
      testIds: input.testIds ?? [],
      specimenIds: input.specimenIds ?? [],
      damageIds: input.damageIds ?? [],
      issuedAt: null,
      authorId: input.authorId,
      reviewerId: null,
      approverId: null,
      body: input.body,
      summary: input.summary,
      tags: input.tags ?? [],
      createdAt: now,
      updatedAt: now,
      createdBy: input.authorId,
      updatedBy: input.authorId,
    };
    return db.reports.upsert(report);
  },

  async update(id, input) {
    await delay(140);
    return getMockDatabase().reports.update(id, input);
  },

  async delete(id) {
    await delay(100);
    getMockDatabase().reports.delete(id);
  },
});
