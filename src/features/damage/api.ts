import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '@/app/providers';
import type { ID } from '@/domain/types';
import type { DamageQuery } from '@/infra/repositories/interfaces';

export const damageKeys = {
  all: ['damage'] as const,
  lists: () => [...damageKeys.all, 'list'] as const,
  list: (query?: DamageQuery) => [...damageKeys.lists(), query] as const,
  detail: (id: ID) => [...damageKeys.all, 'detail', id] as const,
  similar: (id: ID) => [...damageKeys.all, 'similar', id] as const,
};

export const useDamages = (query?: DamageQuery) => {
  const { damage } = useRepositories();
  return useQuery({
    queryKey: damageKeys.list(query),
    queryFn: () => damage.list(query),
    staleTime: 60_000,
  });
};

export const useDamage = (id: ID | null) => {
  const { damage } = useRepositories();
  return useQuery({
    queryKey: id ? damageKeys.detail(id) : [...damageKeys.all, 'detail', 'none'],
    queryFn: () => (id ? damage.findById(id) : Promise.resolve(null)),
    enabled: !!id,
  });
};

export const useSimilarDamages = (id: ID | null) => {
  const { damage } = useRepositories();
  return useQuery({
    queryKey: id ? damageKeys.similar(id) : [...damageKeys.all, 'similar', 'none'],
    queryFn: () => (id ? damage.findSimilar(id, 8) : Promise.resolve([])),
    enabled: !!id,
  });
};
