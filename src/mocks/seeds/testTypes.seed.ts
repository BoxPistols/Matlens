// 試験種別マスタ

import type { TestType } from '@/domain/types';

export const seedTestTypes = (): TestType[] => [
  { id: 'tt_tensile', name: '引張試験', nameEn: 'Tensile Test', category: 'mechanical', defaultStandardIds: ['std_jis_z2241', 'std_astm_e8'], iconKey: 'tensile', description: '材料の引張強さ・降伏応力・伸び・絞りを測定' },
  { id: 'tt_fatigue', name: '疲労試験', nameEn: 'Fatigue Test', category: 'mechanical', defaultStandardIds: ['std_jis_z2273', 'std_astm_e466'], iconKey: 'fatigue', description: '繰返し負荷下での疲労限・S-N特性' },
  { id: 'tt_charpy', name: 'シャルピー衝撃試験', nameEn: 'Charpy Impact', category: 'mechanical', defaultStandardIds: ['std_jis_z2242', 'std_astm_e23'], iconKey: 'impact', description: '衝撃吸収エネルギー・延性脆性遷移' },
  { id: 'tt_bend', name: '曲げ試験', nameEn: 'Bending Test', category: 'mechanical', defaultStandardIds: ['std_jis_z2248'], iconKey: 'bend', description: '3点・4点曲げによる曲げ強度' },
  { id: 'tt_compress', name: '圧縮試験', nameEn: 'Compression Test', category: 'mechanical', defaultStandardIds: ['std_astm_e9'], iconKey: 'compress', description: '圧縮強度・座屈挙動' },
  { id: 'tt_creep', name: 'クリープ試験', nameEn: 'Creep Test', category: 'thermal', defaultStandardIds: ['std_jis_z2271', 'std_astm_e139'], iconKey: 'creep', description: '高温一定荷重下の時間依存変形' },
  { id: 'tt_corrosion', name: '腐食試験', nameEn: 'Corrosion Test', category: 'corrosion', defaultStandardIds: ['std_jis_z2371', 'std_astm_g48'], iconKey: 'corrosion', description: '塩水噴霧・浸漬・応力腐食試験' },
  { id: 'tt_metallo', name: '金相試験', nameEn: 'Metallography', category: 'metallographic', defaultStandardIds: ['std_jis_g0553'], iconKey: 'metallo', description: '組織観察・結晶粒度・介在物評価' },
  { id: 'tt_xrf', name: '蛍光X線分析 (XRF)', nameEn: 'XRF', category: 'chemical', defaultStandardIds: [], iconKey: 'xrf', description: '元素組成の非破壊定量' },
  { id: 'tt_ftir', name: 'FTIR分析', nameEn: 'FTIR', category: 'chemical', defaultStandardIds: [], iconKey: 'ftir', description: '赤外分光による化学構造同定' },
  { id: 'tt_tgdta', name: 'TG-DTA', nameEn: 'TG-DTA', category: 'thermal', defaultStandardIds: [], iconKey: 'tgdta', description: '熱重量・示差熱分析' },
  { id: 'tt_hardness', name: '硬さ試験', nameEn: 'Hardness', category: 'mechanical', defaultStandardIds: ['std_jis_z2244'], iconKey: 'hardness', description: 'ビッカース・ロックウェル・ブリネル硬さ' },
  { id: 'tt_ut', name: '超音波探傷試験 (UT)', nameEn: 'UT', category: 'non_destructive', defaultStandardIds: [], iconKey: 'ut', description: '内部欠陥の非破壊探傷' },
  { id: 'tt_seismic', name: '耐震試験', nameEn: 'Seismic Test', category: 'environmental', defaultStandardIds: [], iconKey: 'seismic', description: '振動・加振による耐震評価' },
  { id: 'tt_emc', name: 'EMC試験', nameEn: 'EMC', category: 'environmental', defaultStandardIds: [], iconKey: 'emc', description: '電磁両立性・放射・耐性試験' },
];
