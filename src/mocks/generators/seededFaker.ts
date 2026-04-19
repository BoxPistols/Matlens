// seed固定のfakerインスタンスを提供（ja_JP ロケール）

import { Faker, ja, en } from '@faker-js/faker';

export const createSeededFaker = (seed = 20260417): Faker => {
  const faker = new Faker({ locale: [ja, en] });
  faker.seed(seed);
  return faker;
};

export const pickByHash = <T>(key: string, items: readonly T[]): T => {
  if (items.length === 0) {
    throw new Error('pickByHash: items must not be empty');
  }
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  const n = items.length;
  const idx = ((h % n) + n) % n;
  return items[idx]!;
};
