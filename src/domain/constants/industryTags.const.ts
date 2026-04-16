// 分野タグ（IHI検査計測の事業領域を参考）

import type { ID } from '../types/common';

export interface IndustryTag {
  id: ID;
  key: string;
  name: string;
  colorKey: string;
}

export const INDUSTRY_TAGS: readonly IndustryTag[] = Object.freeze([
  {
    id: 'ind_infra_energy',
    key: 'infra_energy',
    name: '社会インフラ・エネルギー',
    colorKey: 'sky',
  },
  {
    id: 'ind_auto_industrial',
    key: 'auto_industrial',
    name: '自動車・産業機械',
    colorKey: 'blue',
  },
  { id: 'ind_aerospace', key: 'aerospace', name: '航空・宇宙', colorKey: 'violet' },
  { id: 'ind_env_carbon', key: 'env_carbon', name: '環境・カーボン', colorKey: 'emerald' },
  { id: 'ind_safety', key: 'safety', name: '安心・安全', colorKey: 'amber' },
]);

export const findIndustryTag = (id: ID): IndustryTag | undefined =>
  INDUSTRY_TAGS.find((t) => t.id === id);
