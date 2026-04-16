// 規格マスタ（代表的な試験規格）

import type { Standard } from '@/domain/types';

export const seedStandards = (): Standard[] => [
  { id: 'std_jis_z2241', code: 'JIS Z 2241', org: 'JIS', title: '金属材料引張試験方法', titleEn: 'Metallic materials - Tensile testing', category: 'mechanical', relatedTestTypeIds: ['tt_tensile'], url: null },
  { id: 'std_jis_z2242', code: 'JIS Z 2242', org: 'JIS', title: '金属材料のシャルピー衝撃試験方法', titleEn: 'Metallic materials - Charpy pendulum impact test', category: 'mechanical', relatedTestTypeIds: ['tt_charpy'], url: null },
  { id: 'std_jis_z2244', code: 'JIS Z 2244', org: 'JIS', title: 'ビッカース硬さ試験', titleEn: 'Vickers hardness test', category: 'mechanical', relatedTestTypeIds: ['tt_hardness'], url: null },
  { id: 'std_jis_z2248', code: 'JIS Z 2248', org: 'JIS', title: '金属材料曲げ試験方法', titleEn: 'Metallic materials - Bend test', category: 'mechanical', relatedTestTypeIds: ['tt_bend'], url: null },
  { id: 'std_jis_z2271', code: 'JIS Z 2271', org: 'JIS', title: 'クリープ試験方法', titleEn: 'Creep testing of metallic materials', category: 'thermal', relatedTestTypeIds: ['tt_creep'], url: null },
  { id: 'std_jis_z2273', code: 'JIS Z 2273', org: 'JIS', title: '金属材料の疲れ試験方法通則', titleEn: 'General rules for fatigue testing', category: 'mechanical', relatedTestTypeIds: ['tt_fatigue'], url: null },
  { id: 'std_jis_z2371', code: 'JIS Z 2371', org: 'JIS', title: '塩水噴霧試験方法', titleEn: 'Salt spray testing', category: 'corrosion', relatedTestTypeIds: ['tt_corrosion'], url: null },
  { id: 'std_jis_g0553', code: 'JIS G 0553', org: 'JIS', title: '鋼のマクロ組織試験方法', titleEn: 'Macrostructure testing of steel', category: 'metallographic', relatedTestTypeIds: ['tt_metallo'], url: null },
  { id: 'std_jis_g4051', code: 'JIS G 4051', org: 'JIS', title: '機械構造用炭素鋼鋼材', titleEn: 'Carbon steels for machine structural use', category: 'material', relatedTestTypeIds: [], url: null },
  { id: 'std_jis_g4053', code: 'JIS G 4053', org: 'JIS', title: '機械構造用合金鋼鋼材', titleEn: 'Alloy steels for machine structural use', category: 'material', relatedTestTypeIds: [], url: null },
  { id: 'std_jis_g4305', code: 'JIS G 4305', org: 'JIS', title: '冷間圧延ステンレス鋼板', titleEn: 'Cold-rolled stainless steel plates', category: 'material', relatedTestTypeIds: [], url: null },
  { id: 'std_jis_h3100', code: 'JIS H 3100', org: 'JIS', title: '銅及び銅合金の板', titleEn: 'Copper and copper alloy sheets', category: 'material', relatedTestTypeIds: [], url: null },
  { id: 'std_jis_h4000', code: 'JIS H 4000', org: 'JIS', title: 'アルミニウム及びアルミニウム合金の板', titleEn: 'Aluminium alloy sheets', category: 'material', relatedTestTypeIds: [], url: null },
  { id: 'std_astm_e8', code: 'ASTM E8/E8M', org: 'ASTM', title: 'Standard Test Methods for Tension Testing of Metallic Materials', titleEn: 'Standard Test Methods for Tension Testing of Metallic Materials', category: 'mechanical', relatedTestTypeIds: ['tt_tensile'], url: null },
  { id: 'std_astm_e9', code: 'ASTM E9', org: 'ASTM', title: 'Standard Test Methods of Compression Testing', titleEn: 'Standard Test Methods of Compression Testing', category: 'mechanical', relatedTestTypeIds: ['tt_compress'], url: null },
  { id: 'std_astm_e23', code: 'ASTM E23', org: 'ASTM', title: 'Notched Bar Impact Testing of Metallic Materials', titleEn: 'Notched Bar Impact Testing of Metallic Materials', category: 'mechanical', relatedTestTypeIds: ['tt_charpy'], url: null },
  { id: 'std_astm_e139', code: 'ASTM E139', org: 'ASTM', title: 'Conducting Creep, Creep-Rupture, and Stress-Rupture Tests', titleEn: 'Conducting Creep, Creep-Rupture, and Stress-Rupture Tests', category: 'thermal', relatedTestTypeIds: ['tt_creep'], url: null },
  { id: 'std_astm_e466', code: 'ASTM E466', org: 'ASTM', title: 'Force Controlled Constant Amplitude Axial Fatigue Tests', titleEn: 'Force Controlled Constant Amplitude Axial Fatigue Tests', category: 'mechanical', relatedTestTypeIds: ['tt_fatigue'], url: null },
  { id: 'std_astm_g48', code: 'ASTM G48', org: 'ASTM', title: 'Pitting and Crevice Corrosion Resistance Tests', titleEn: 'Pitting and Crevice Corrosion Resistance Tests', category: 'corrosion', relatedTestTypeIds: ['tt_corrosion'], url: null },
  { id: 'std_astm_a240', code: 'ASTM A240', org: 'ASTM', title: 'Chromium and Chromium-Nickel Stainless Steel Plate', titleEn: 'Chromium and Chromium-Nickel Stainless Steel Plate', category: 'material', relatedTestTypeIds: [], url: null },
  { id: 'std_astm_b265', code: 'ASTM B265', org: 'ASTM', title: 'Titanium and Titanium Alloy Strip, Sheet, and Plate', titleEn: 'Titanium and Titanium Alloy Strip, Sheet, and Plate', category: 'material', relatedTestTypeIds: [], url: null },
  { id: 'std_astm_b637', code: 'ASTM B637', org: 'ASTM', title: 'Precipitation-Hardening and Cold-Worked Nickel Alloy Bars', titleEn: 'Precipitation-Hardening and Cold-Worked Nickel Alloy Bars', category: 'material', relatedTestTypeIds: [], url: null },
];
