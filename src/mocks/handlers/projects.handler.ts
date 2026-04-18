import { http, HttpResponse } from 'msw';
import { getMockDatabase } from '../database';
import { projectEndpoints } from '@/infra/api/endpoints';
import { projectMapper } from '@/infra/mappers/project.mapper';
import type { Project, ProjectStatus } from '@/domain/types';
import { paginate } from '@/shared/utils/pagination';

const filterProjects = (items: Project[], url: URL): Project[] => {
  const status = url.searchParams.get('status')?.split(',') as ProjectStatus[] | undefined;
  const customerId = url.searchParams.get('customer_id') ?? undefined;
  const search = url.searchParams.get('search');
  return items.filter((p) => {
    if (status && !status.includes(p.status)) return false;
    if (customerId && p.customerId !== customerId) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!p.title.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) return false;
    }
    return true;
  });
};

export const projectHandlers = [
  http.get(projectEndpoints.list, ({ request }) => {
    const url = new URL(request.url);
    const parsePositiveInt = (value: string | null, fallback: number): number => {
      if (value === null) return fallback;
      const n = Number(value);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
    };
    const page = parsePositiveInt(url.searchParams.get('page'), 1);
    const pageSize = parsePositiveInt(url.searchParams.get('page_size'), 20);
    const items = filterProjects(getMockDatabase().projects.getAll(), url);
    const paged = paginate(items, page, pageSize);
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
