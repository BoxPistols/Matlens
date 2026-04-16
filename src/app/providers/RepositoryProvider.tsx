// Repository DI Provider
// VITE_BACKEND_MODE に応じて Mock / REST / GraphQL を切り替える。

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  createRepositories,
  resolveBackendMode,
  type BackendMode,
  type RepositoryContainer,
} from '@/infra/repositories';

const RepositoryContext = createContext<RepositoryContainer | null>(null);

export interface RepositoryProviderProps {
  children: ReactNode;
  /** 外部からRepositoryを差し込む（テスト用） */
  value?: RepositoryContainer;
  /** 明示的にモード指定（省略時は env から解決） */
  mode?: BackendMode;
}

export const RepositoryProvider = ({ children, value, mode }: RepositoryProviderProps) => {
  const repositories = useMemo<RepositoryContainer>(() => {
    if (value) return value;
    return createRepositories(mode ?? resolveBackendMode());
  }, [value, mode]);

  return (
    <RepositoryContext.Provider value={repositories}>{children}</RepositoryContext.Provider>
  );
};

export const useRepositories = (): RepositoryContainer => {
  const ctx = useContext(RepositoryContext);
  if (!ctx) {
    throw new Error('useRepositories must be used within <RepositoryProvider>');
  }
  return ctx;
};
