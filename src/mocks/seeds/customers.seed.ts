// 顧客シード（20社、架空）

import type { Customer } from '@/domain/types';

const now = () => new Date('2026-01-01T00:00:00+09:00').toISOString();

const raw: Array<Pick<Customer, 'id' | 'name' | 'nameKana' | 'industryTagIds'>> = [
  { id: 'cst_001', name: '東日本電力株式会社', nameKana: 'ヒガシニホンデンリョク', industryTagIds: ['ind_infra_energy'] },
  { id: 'cst_002', name: '中部重工業株式会社', nameKana: 'チュウブジュウコウギョウ', industryTagIds: ['ind_infra_energy', 'ind_auto_industrial'] },
  { id: 'cst_003', name: '西日本自動車工業', nameKana: 'ニシニホンジドウシャコウギョウ', industryTagIds: ['ind_auto_industrial'] },
  { id: 'cst_004', name: 'スカイブリッジ航空機', nameKana: 'スカイブリッジコウクウキ', industryTagIds: ['ind_aerospace'] },
  { id: 'cst_005', name: '北海鉄鋼株式会社', nameKana: 'ホッカイテッコウ', industryTagIds: ['ind_auto_industrial'] },
  { id: 'cst_006', name: 'グリーンカーボン研究所', nameKana: 'グリーンカーボンケンキュウショ', industryTagIds: ['ind_env_carbon'] },
  { id: 'cst_007', name: '太平洋プラント工業', nameKana: 'タイヘイヨウプラントコウギョウ', industryTagIds: ['ind_infra_energy'] },
  { id: 'cst_008', name: '関東交通安全研究機構', nameKana: 'カントウコウツウアンゼンケンキュウキコウ', industryTagIds: ['ind_safety', 'ind_auto_industrial'] },
  { id: 'cst_009', name: 'ジェットコア航空', nameKana: 'ジェットコアコウクウ', industryTagIds: ['ind_aerospace'] },
  { id: 'cst_010', name: '中央石油化学', nameKana: 'チュウオウセキユカガク', industryTagIds: ['ind_infra_energy'] },
  { id: 'cst_011', name: 'アーバンインフラ建設', nameKana: 'アーバンインフラケンセツ', industryTagIds: ['ind_infra_energy', 'ind_safety'] },
  { id: 'cst_012', name: 'トーヨー精密機械', nameKana: 'トーヨーセイミツキカイ', industryTagIds: ['ind_auto_industrial'] },
  { id: 'cst_013', name: 'オーシャンエナジー', nameKana: 'オーシャンエナジー', industryTagIds: ['ind_env_carbon', 'ind_infra_energy'] },
  { id: 'cst_014', name: '宇宙開発機構外郭団体', nameKana: 'ウチュウカイハツキコウガイカクダンタイ', industryTagIds: ['ind_aerospace'] },
  { id: 'cst_015', name: 'ハイパーモビリティ', nameKana: 'ハイパーモビリティ', industryTagIds: ['ind_auto_industrial'] },
  { id: 'cst_016', name: 'グリーンポリマー工業', nameKana: 'グリーンポリマーコウギョウ', industryTagIds: ['ind_env_carbon'] },
  { id: 'cst_017', name: '東海素材工業', nameKana: 'トウカイソザイコウギョウ', industryTagIds: ['ind_auto_industrial'] },
  { id: 'cst_018', name: '北陸電機', nameKana: 'ホクリクデンキ', industryTagIds: ['ind_infra_energy'] },
  { id: 'cst_019', name: '九州素形材センター', nameKana: 'キュウシュウソケイザイセンター', industryTagIds: ['ind_auto_industrial'] },
  { id: 'cst_020', name: '海洋構造安全研究会', nameKana: 'カイヨウコウゾウアンゼンケンキュウカイ', industryTagIds: ['ind_infra_energy', 'ind_safety'] },
];

export const seedCustomers = (): Customer[] =>
  raw.map((c) => ({
    ...c,
    mainContact: {
      name: `${c.name.slice(0, 2)}担当者`,
      email: `contact@${c.id}.example.jp`,
      phone: null,
    },
    notes: null,
    createdAt: now(),
    updatedAt: now(),
  }));
