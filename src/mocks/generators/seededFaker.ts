// seed固定のfakerインスタンスを提供（ja_JP ロケール）

import { Faker, ja, en } from '@faker-js/faker';

export const createSeededFaker = (seed = 20260417): Faker => {
  const faker = new Faker({ locale: [ja, en] });
  faker.seed(seed);
  return faker;
};

export const pickByHash = <T>(key: string, items: readonly T[]): T => {
  let h = 0;
  for (let i = 0; i < key.length; i++) {
    h = (h * 31 + key.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(h) % items.length;
  return items[idx]!;
};
