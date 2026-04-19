import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '@/app/providers';
import type { ID } from '@/domain/types';
import type { ProjectQuery } from '@/infra/repositories/interfaces';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (query?: ProjectQuery) => [...projectKeys.lists(), query] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: ID) => [...projectKeys.details(), id] as const,
};

export const useProjects = (query?: ProjectQuery) => {
  const { projects } = useRepositories();
  return useQuery({
    queryKey: projectKeys.list(query),
    queryFn: () => projects.list(query),
    staleTime: 60_000,
  });
};

export const useProject = (id: ID | null) => {
  const { projects } = useRepositories();
  return useQuery({
    queryKey: id ? projectKeys.detail(id) : [...projectKeys.details(), 'none'],
    queryFn: () => (id ? projects.findById(id) : Promise.resolve(null)),
    enabled: !!id,
  });
};

export const useCustomersIndex = () => {
  const { customers } = useRepositories();
  return useQuery({
    queryKey: ['customers', 'index'],
    queryFn: async () => {
      const page = await customers.list();
      return new Map(page.items.map((c) => [c.id, c]));
    },
    staleTime: 5 * 60_000,
  });
};
