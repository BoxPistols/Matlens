import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '@/app/providers';
import type { SearchQuery } from '@/infra/repositories/interfaces';

export const searchKeys = {
  all: ['semantic-search'] as const,
  query: (q: SearchQuery) => [...searchKeys.all, 'query', q] as const,
};

export const useSemanticSearch = (query: SearchQuery | null) => {
  const { search } = useRepositories();
  return useQuery({
    queryKey: query ? searchKeys.query(query) : [...searchKeys.all, 'none'],
    queryFn: () => (query ? search.semantic(query) : Promise.resolve([])),
    enabled: !!query && query.query.trim().length > 0,
    staleTime: 30_000,
  });
};
