// Node（Vitest 等のテスト）用 MSW サーバ

import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
