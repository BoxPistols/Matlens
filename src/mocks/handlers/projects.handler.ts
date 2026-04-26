import { http, HttpResponse } from 'msw';
import { getMockDatabase } from '../database';
import { projectEndpoints } from '@/infra/api/endpoints';
import { projectMapper } from '@/infra/mappers/project.mapper';
import type { Project, ProjectStatus } from '@/domain/types';
import type { ProjectQuery } from '@/infra/repositories/interfaces';
import {
  applyProjectSort,
  matchProjectFilter,
} from '@/infra/repositories/mock/filters/project.filter';
import { paginate, parseCsvList, parsePositiveInt } from '@/shared/utils';

// 並び替え可能なフィールドのホワイトリスト。
// URL から渡される任意の field 文字列をそのまま keyof Project にキャストすると、
// __proto__ など想定外キーで applyProjectSort が undefined 比較の不正動作を起こす。
const SORTABLE_FIELDS = ['code', 'title', 'startedAt', 'dueAt', 'status'] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];
const isSortableField = (v: string): v is SortableField =>
  (SORTABLE_FIELDS as readonly string[]).includes(v);

// クエリ文字列（snake_case）を ProjectQuery に逆変換する。
// mapper.queryToParams と対のロジック。
const queryFromSearchParams = (url: URL): ProjectQuery => {
  const status = parseCsvList(url.searchParams.get('status')) as
    | ProjectStatus[]
    | undefined;
  const customerId = url.searchParams.get('customer_id') ?? undefined;
  const industryTagIds = parseCsvList(url.searchParams.get('industry_tag_ids'));
  const dueBefore = url.searchParams.get('due_before') ?? undefined;
  const search = url.searchParams.get('search') ?? undefined;
  const sortRaw = url.searchParams.get('sort');
  const sort = sortRaw
    ? (() => {
        const [field, order] = sortRaw.split(':');
        if (!field || (order !== 'asc' && order !== 'desc')) return undefined;
        if (!isSortableField(field)) return undefined;
        return { field, order } satisfies { field: keyof Project & string; order: 'asc' | 'desc' };
      })()
    : undefined;
  return {
    filter: { status, customerId, industryTagIds, dueBefore, search },
    sort,
  };
};

export const projectHandlers = [
  http.get(projectEndpoints.list, ({ request }) => {
    const url = new URL(request.url);
    const page = parsePositiveInt(url.searchParams.get('page'), 1);
    const pageSize = parsePositiveInt(url.searchParams.get('page_size'), 20);
    const query = queryFromSearchParams(url);
    const filtered = getMockDatabase()
      .projects.getAll()
      .filter((p) => matchProjectFilter(p, query));
    const sorted = applyProjectSort(filtered, query);
    const paged = paginate(sorted, page, pageSize);
    return HttpResponse.json({
      items: paged.items.map((p) => projectMapper.toDTO(p)),
      pagination: {
        page: paged.pagination.page,
        page_size: paged.pagination.pageSize,
        total: paged.pagination.total,
        total_pages: paged.pagination.totalPages,
      },
    });
  }),

  http.get(`${projectEndpoints.list}/:id`, ({ params }) => {
    const project = getMockDatabase().projects.getById(params.id as string);
    if (!project) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'project not found' } },
        { status: 404 }
      );
    }
    return HttpResponse.json(projectMapper.toDTO(project));
  }),
];
