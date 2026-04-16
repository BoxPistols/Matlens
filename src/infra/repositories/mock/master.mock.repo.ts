import { delay, paginate } from '@/shared/utils';
import { getMockDatabase } from '@/mocks/database';
import type {
  CustomerRepository,
  MaterialFilter,
  MaterialRepository,
  StandardFilter,
  StandardRepository,
} from '../interfaces/master.repo';

export const createMockMaterialRepository = (): MaterialRepository => ({
  async list(filter?: MaterialFilter) {
    await delay(80);
    let items = getMockDatabase().materials.getAll();
    if (filter?.category) items = items.filter((m) => m.category === filter.category);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter((m) => m.designation.toLowerCase().includes(q));
    }
    return items;
  },
  async findById(id) {
    await delay(40);
    return getMockDatabase().materials.getById(id);
  },
});

export const createMockStandardRepository = (): StandardRepository => ({
  async list(filter?: StandardFilter) {
    await delay(80);
    let items = getMockDatabase().standards.getAll();
    if (filter?.org) items = items.filter((s) => s.org === filter.org);
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter(
        (s) => s.code.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)
      );
    }
    return items;
  },
  async findById(id) {
    await delay(40);
    return getMockDatabase().standards.getById(id);
  },
});

export const createMockCustomerRepository = (): CustomerRepository => ({
  async list() {
    await delay(80);
    const items = getMockDatabase().customers.getAll();
    return paginate(items, 1, 100);
  },
  async findById(id) {
    await delay(40);
    return getMockDatabase().customers.getById(id);
  },
});
