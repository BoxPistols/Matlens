import type { ID, Paginated, User } from '@/domain/types';

export interface UserRepository {
  /** 全ユーザー一覧。現状はページング不要な規模のみを扱う。 */
  list(): Promise<Paginated<User>>;
  findById(id: ID): Promise<User | null>;
}
