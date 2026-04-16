import type { ID, Timestamps } from './common';

export type UserRole = 'admin' | 'pm' | 'engineer' | 'operator' | 'viewer';

export interface User extends Timestamps {
  id: ID;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
}
