import { delay, paginate } from '@/shared/utils';
import { getMockDatabase } from '@/mocks/database';
import type { UserRepository } from '../interfaces/user.repo';

export const createMockUserRepository = (): UserRepository => ({
  async list() {
    await delay(60);
    const items = getMockDatabase().users.getAll();
    return paginate(items, 1, 100);
  },
  async findById(id) {
    await delay(30);
    return getMockDatabase().users.getById(id);
  },
});
