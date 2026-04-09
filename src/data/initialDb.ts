import type { Material } from '../types';

/**
 * DISCLAIMER / 免責事項
 *
 * このデータはデモンストレーション用のサンプルデータです。
 * 値は ASM Handbook, JIS規格, MatWeb 等の公開情報を参考に
 * 設定していますが、特定のロット・熱処理条件・試験規格に
 * 基づく実測値ではありません。
 *
 * 設計・研究に使用する場合は、必ず以下の一次ソースで検証してください:
 * - JIS規格書 (日本規格協会) https://www.jsa.or.jp/
 * - ASM International https://www.asminternational.org/
 * - MatWeb https://www.matweb.com/
 * - 各材料メーカーのデータシート
 *
 * 特にセラミクス・複合材料は製造条件で値が大きく変動するため、
 * 単一の代表値として扱うことは不適切です。
 */

export const DATA_DISCLAIMER = {
  ja: 'このデータはデモ用サンプルです。設計・研究には一次ソース（JIS規格書, ASM Handbook, MatWeb, メーカーデータシート）で検証してください。',
  en: 'Sample data for demonstration only. Verify with primary sources (JIS standards, ASM Handbook, MatWeb, manufacturer datasheets) before use in design or research.',
  sources: [
    { name: 'JIS規格 (日本規格協会)', url: 'https://www.jsa.or.jp/' },
    { name: 'ASM International', url: 'https://www.asminternational.org/' },
    { name: 'MatWeb Material Property Data', url: 'https://www.matweb.com/' },
    { name: 'NIMS Materials Database (MatNavi)', url: 'https://mits.nims.go.jp/' },
  ],
};

export const INITIAL_DB: Material[] = [
  // === 金属合金 — 鉄鋼 ===
  {id:'MAT-0301',name:'SS400 一般構造用圧延鋼',cat:'金属合金',hv:155,ts:400,el:206,pf:245,el2:21,dn:7.85,comp:'Fe-0.27C-1.5Mn (max)',batch:'B-040',date:'2026-04-08',author:'田中 実',status:'承認済',ai:false,memo:'最も汎用的な構造用鋼材'},
  {id:'MAT-0302',name:'S45C 機械構造用炭素鋼',cat:'金属合金',hv:220,ts:570,el:210,pf:345,el2:17,dn:7.85,comp:'Fe-0.45C-0.7Mn-0.25Si',batch:'B-040',date:'2026-04-08',author:'山田 研',status:'承認済',ai:false,memo:'焼入れ焼戻し鋼'},
  {id:'MAT-0303',name:'SCM435 クロムモリブデン鋼',cat:'金属合金',hv:300,ts:932,el:210,pf:785,el2:15,dn:7.85,comp:'Fe-0.35C-1Cr-0.2Mo',batch:'B-040',date:'2026-04-07',author:'鈴木 誠',status:'承認済',ai:false,memo:'高強度ボルト用'},
  {id:'MAT-0304',name:'SKD11 冷間工具鋼',cat:'金属合金',hv:650,ts:740,el:210,pf:null,el2:0,dn:7.85,comp:'Fe-1.5C-12Cr-1Mo-0.3V',batch:'B-040',date:'2026-04-07',author:'田中 実',status:'承認済',ai:false,memo:'金型・打抜き工具用'},
  {id:'MAT-0305',name:'SKH51 ハイス（高速度工具鋼）',cat:'金属合金',hv:830,ts:850,el:220,pf:null,el2:0,dn:8.16,comp:'Fe-0.85C-6W-5Mo-4Cr-2V',batch:'B-039',date:'2026-04-06',author:'山田 研',status:'承認済',ai:true,memo:'切削工具、ドリル用'},
  {id:'MAT-0306',name:'SUJ2 高炭素クロム軸受鋼',cat:'金属合金',hv:750,ts:700,el:208,pf:null,el2:0,dn:7.83,comp:'Fe-1.0C-1.5Cr-0.35Mn',batch:'B-039',date:'2026-04-06',author:'鈴木 誠',status:'承認済',ai:false,memo:'ベアリング用'},
  {id:'MAT-0307',name:'SUS430 フェライト系ステンレス',cat:'金属合金',hv:160,ts:450,el:200,pf:205,el2:22,dn:7.70,comp:'Fe-17Cr',batch:'B-039',date:'2026-04-05',author:'田中 実',status:'承認済',ai:false,memo:'磁性あり、安価なステンレス'},
  // === 金属合金 — ステンレス鋼 ===
  {id:'MAT-0308',name:'SUS304 オーステナイト系ステンレス',cat:'金属合金',hv:185,ts:520,el:193,pf:205,el2:40,dn:7.93,comp:'Fe-18Cr-8Ni',batch:'B-039',date:'2026-04-05',author:'田中 実',status:'承認済',ai:false,memo:'最も汎用的なステンレス鋼'},
  {id:'MAT-0309',name:'SUS316L 低炭素ステンレス',cat:'金属合金',hv:186,ts:485,el:193,pf:170,el2:40,dn:7.98,comp:'Fe-17Cr-12Ni-2Mo-0.03C',batch:'B-038',date:'2026-04-04',author:'山田 研',status:'承認済',ai:false,memo:'耐食性が高く医療機器に多用'},
  {id:'MAT-0310',name:'SUS630 析出硬化系ステンレス',cat:'金属合金',hv:375,ts:1310,el:197,pf:1170,el2:10,dn:7.78,comp:'Fe-17Cr-4Ni-4Cu-0.3Nb',batch:'B-038',date:'2026-04-04',author:'鈴木 誠',status:'レビュー待',ai:true,memo:'17-4PH。航空・医療向け'},
  {id:'MAT-0311',name:'SUS329J4L 二相ステンレス',cat:'金属合金',hv:260,ts:620,el:200,pf:450,el2:25,dn:7.80,comp:'Fe-25Cr-7Ni-3Mo-0.03C',batch:'B-038',date:'2026-04-03',author:'田中 実',status:'承認済',ai:false,memo:'耐孔食性・応力腐食割れ性に優れる'},
  // === 金属合金 — アルミニウム ===
  {id:'MAT-0312',name:'A1050 純アルミニウム',cat:'金属合金',hv:23,ts:75,el:69,pf:30,el2:35,dn:2.71,comp:'Al 99.5%',batch:'B-038',date:'2026-04-03',author:'山田 研',status:'承認済',ai:false,memo:'電気導体、化学装置'},
  {id:'MAT-0313',name:'A2024 ジュラルミン',cat:'金属合金',hv:137,ts:470,el:73,pf:325,el2:18,dn:2.77,comp:'Al-4.5Cu-1.5Mg-0.6Mn',batch:'B-037',date:'2026-04-02',author:'鈴木 誠',status:'承認済',ai:false,memo:'航空機リベット・外板'},
  {id:'MAT-0314',name:'A5052 耐食アルミ合金',cat:'金属合金',hv:68,ts:230,el:70,pf:195,el2:12,dn:2.68,comp:'Al-2.5Mg-0.25Cr',batch:'B-037',date:'2026-04-02',author:'田中 実',status:'承認済',ai:false,memo:'船舶・車両・建材'},
  {id:'MAT-0315',name:'A6061-T6 構造用アルミ合金',cat:'金属合金',hv:107,ts:310,el:69,pf:276,el2:12,dn:2.70,comp:'Al-1Mg-0.6Si-0.28Cu-0.2Cr',batch:'B-037',date:'2026-04-01',author:'山田 研',status:'承認済',ai:false,memo:'T6時効処理後。自転車フレーム等'},
  {id:'MAT-0316',name:'A7075-T6 超々ジュラルミン',cat:'金属合金',hv:175,ts:572,el:72,pf:503,el2:11,dn:2.81,comp:'Al-5.6Zn-2.5Mg-1.6Cu-0.23Cr',batch:'B-037',date:'2026-04-01',author:'山田 研',status:'承認済',ai:false,memo:'航空機構造材。T6処理後'},
  // === 金属合金 — チタン ===
  {id:'MAT-0317',name:'純チタン Grade 1',cat:'金属合金',hv:120,ts:240,el:103,pf:170,el2:24,dn:4.51,comp:'Ti-0.2Fe-0.18O (max)',batch:'B-036',date:'2026-03-31',author:'鈴木 誠',status:'承認済',ai:false,memo:'最も軟質な純チタン。溶接性良好'},
  {id:'MAT-0318',name:'純チタン Grade 2',cat:'金属合金',hv:145,ts:345,el:103,pf:275,el2:20,dn:4.51,comp:'Ti-0.3Fe-0.25O (max)',batch:'B-036',date:'2026-03-31',author:'鈴木 誠',status:'承認済',ai:false,memo:'生体適合性。医療インプラント'},
  {id:'MAT-0319',name:'Ti-6Al-4V チタン合金',cat:'金属合金',hv:330,ts:950,el:114,pf:880,el2:14,dn:4.43,comp:'Ti-6Al-4V (wt%)',batch:'B-036',date:'2026-03-30',author:'山田 研',status:'承認済',ai:true,memo:'最も汎用的なα+β型チタン合金'},
  {id:'MAT-0320',name:'Ti-6Al-2Sn-4Zr-2Mo',cat:'金属合金',hv:350,ts:1000,el:120,pf:910,el2:10,dn:4.54,comp:'Ti-6Al-2Sn-4Zr-2Mo',batch:'B-036',date:'2026-03-30',author:'鈴木 誠',status:'レビュー待',ai:false,memo:'高温クリープ特性に優れるα型チタン'},
  // === 金属合金 — 銅 ===
  {id:'MAT-0321',name:'C1020 無酸素銅',cat:'金属合金',hv:45,ts:220,el:117,pf:70,el2:45,dn:8.94,comp:'Cu 99.96%',batch:'B-035',date:'2026-03-29',author:'田中 実',status:'承認済',ai:false,memo:'高導電性。半導体リードフレーム'},
  {id:'MAT-0322',name:'C2600 黄銅（真鍮 7:3）',cat:'金属合金',hv:65,ts:320,el:110,pf:120,el2:55,dn:8.53,comp:'Cu-30Zn',batch:'B-035',date:'2026-03-29',author:'田中 実',status:'承認済',ai:false,memo:'装飾品・水栓金具'},
  {id:'MAT-0323',name:'C5210 りん青銅',cat:'金属合金',hv:200,ts:700,el:110,pf:640,el2:5,dn:8.78,comp:'Cu-8Sn-0.2P',batch:'B-035',date:'2026-03-28',author:'山田 研',status:'承認済',ai:false,memo:'コネクタ端子・バネ'},
  {id:'MAT-0324',name:'BeCu ベリリウム銅',cat:'金属合金',hv:380,ts:1250,el:128,pf:1100,el2:3,dn:8.25,comp:'Cu-1.9Be-0.25Co',batch:'B-035',date:'2026-03-28',author:'鈴木 誠',status:'承認済',ai:true,memo:'非磁性バネ。防爆工具'},
  // === 金属合金 — ニッケル超合金 ===
  {id:'MAT-0325',name:'Inconel 625',cat:'金属合金',hv:185,ts:830,el:205,pf:415,el2:50,dn:8.44,comp:'Ni-22Cr-9Mo-3.5Nb-5Fe',batch:'B-034',date:'2026-03-27',author:'山田 研',status:'承認済',ai:false,memo:'耐食・耐熱。化学プラント'},
  {id:'MAT-0326',name:'Inconel 718 ニッケル超合金',cat:'金属合金',hv:420,ts:1380,el:200,pf:1180,el2:12,dn:8.19,comp:'Ni-19Cr-18Fe-5Nb-3Mo-1Ti-0.5Al',batch:'B-034',date:'2026-03-27',author:'鈴木 誠',status:'承認済',ai:true,memo:'航空エンジン・ガスタービン'},
  {id:'MAT-0327',name:'Hastelloy C-276',cat:'金属合金',hv:210,ts:790,el:205,pf:365,el2:55,dn:8.89,comp:'Ni-16Cr-16Mo-5Fe-4W',batch:'B-034',date:'2026-03-26',author:'田中 実',status:'承認済',ai:false,memo:'極限耐食合金。塩酸・硫酸環境'},
  {id:'MAT-0328',name:'Monel 400',cat:'金属合金',hv:130,ts:550,el:180,pf:240,el2:40,dn:8.83,comp:'Ni-33Cu-2Fe',batch:'B-034',date:'2026-03-26',author:'山田 研',status:'承認済',ai:false,memo:'海水環境に強い。海洋構造物'},
  // === 金属合金 — その他 ===
  {id:'MAT-0329',name:'AZ31B マグネシウム合金',cat:'金属合金',hv:55,ts:260,el:45,pf:200,el2:15,dn:1.77,comp:'Mg-3Al-1Zn',batch:'B-033',date:'2026-03-25',author:'鈴木 誠',status:'承認済',ai:false,memo:'最も軽量な構造用金属'},
  {id:'MAT-0330',name:'WC-Co 超硬合金',cat:'金属合金',hv:1600,ts:900,el:600,pf:null,el2:0,dn:14.95,comp:'WC-10Co (wt%)',batch:'B-033',date:'2026-03-25',author:'田中 実',status:'承認済',ai:true,memo:'切削工具チップ。最高硬度金属材'},
  {id:'MAT-0331',name:'W 純タングステン',cat:'金属合金',hv:350,ts:1510,el:411,pf:750,el2:0,dn:19.30,comp:'W 99.95%',batch:'B-033',date:'2026-03-24',author:'山田 研',status:'承認済',ai:false,memo:'最高融点金属(3422°C)。X線遮蔽'},
  {id:'MAT-0332',name:'Kovar コバール',cat:'金属合金',hv:150,ts:520,el:138,pf:345,el2:30,dn:8.36,comp:'Fe-29Ni-17Co',batch:'B-033',date:'2026-03-24',author:'鈴木 誠',status:'承認済',ai:false,memo:'ガラス封着用低膨張合金'},

  // === セラミクス ===
  {id:'MAT-0333',name:'Al2O3 アルミナ 99.5%',cat:'セラミクス',hv:1800,ts:280,el:380,pf:null,el2:0,dn:3.97,comp:'Al2O3 99.5%',batch:'B-033',date:'2026-03-23',author:'田中 実',status:'承認済',ai:false,memo:'最も汎用的なファインセラミクス'},
  {id:'MAT-0334',name:'ZrO2 ジルコニア(3Y-TZP)',cat:'セラミクス',hv:1200,ts:900,el:210,pf:null,el2:0,dn:5.68,comp:'ZrO2-3Y2O3',batch:'B-032',date:'2026-03-22',author:'鈴木 誠',status:'承認済',ai:false,memo:'高靱性セラミクス。人工関節'},
  {id:'MAT-0335',name:'Si3N4 窒化ケイ素',cat:'セラミクス',hv:1580,ts:700,el:300,pf:null,el2:0,dn:3.20,comp:'Si3N4 + sintering aids',batch:'B-032',date:'2026-03-22',author:'田中 実',status:'承認済',ai:false,memo:'ターボチャージャーローター'},
  {id:'MAT-0336',name:'SiC 炭化ケイ素',cat:'セラミクス',hv:2500,ts:400,el:410,pf:null,el2:0,dn:3.10,comp:'SiC (sintered)',batch:'B-032',date:'2026-03-21',author:'山田 研',status:'承認済',ai:true,memo:'半導体ウエハー・耐摩耗部品'},
  {id:'MAT-0337',name:'BN 窒化ホウ素 (h-BN)',cat:'セラミクス',hv:20,ts:40,el:30,pf:null,el2:0,dn:2.27,comp:'BN (hexagonal)',batch:'B-032',date:'2026-03-21',author:'鈴木 誠',status:'承認済',ai:false,memo:'固体潤滑剤。白いグラファイト'},
  {id:'MAT-0338',name:'cBN 立方晶窒化ホウ素',cat:'セラミクス',hv:4500,ts:700,el:680,pf:null,el2:0,dn:3.48,comp:'BN (cubic)',batch:'B-031',date:'2026-03-20',author:'田中 実',status:'承認済',ai:true,memo:'ダイヤモンド次ぐ硬度。鉄系切削'},
  {id:'MAT-0339',name:'PZT 圧電セラミクス',cat:'セラミクス',hv:500,ts:75,el:70,pf:null,el2:0,dn:7.60,comp:'Pb(Zr,Ti)O3',batch:'B-031',date:'2026-03-20',author:'山田 研',status:'承認済',ai:false,memo:'圧電素子。超音波センサ'},
  {id:'MAT-0340',name:'HA ハイドロキシアパタイト',cat:'セラミクス',hv:350,ts:45,el:80,pf:null,el2:0,dn:3.16,comp:'Ca10(PO4)6(OH)2',batch:'B-031',date:'2026-03-19',author:'鈴木 誠',status:'承認済',ai:false,memo:'人工骨。生体親和性セラミクス'},
  {id:'MAT-0341',name:'MgO マグネシア',cat:'セラミクス',hv:600,ts:100,el:300,pf:null,el2:0,dn:3.58,comp:'MgO',batch:'B-031',date:'2026-03-19',author:'田中 実',status:'承認済',ai:false,memo:'耐火物。製鋼炉ライニング'},
  {id:'MAT-0342',name:'BaTiO3 チタン酸バリウム',cat:'セラミクス',hv:450,ts:60,el:110,pf:null,el2:0,dn:5.85,comp:'BaTiO3',batch:'B-031',date:'2026-03-18',author:'山田 研',status:'承認済',ai:false,memo:'積層セラミックコンデンサ(MLCC)'},
  {id:'MAT-0343',name:'コーディエライト',cat:'セラミクス',hv:700,ts:50,el:70,pf:null,el2:0,dn:2.60,comp:'2MgO-2Al2O3-5SiO2',batch:'B-030',date:'2026-03-17',author:'鈴木 誠',status:'承認済',ai:false,memo:'自動車触媒担体。超低熱膨張'},
  {id:'MAT-0344',name:'AlN 窒化アルミニウム',cat:'セラミクス',hv:1100,ts:350,el:320,pf:null,el2:0,dn:3.26,comp:'AlN',batch:'B-030',date:'2026-03-17',author:'田中 実',status:'承認済',ai:false,memo:'高熱伝導セラミクス(170W/mK)。パワー半導体基板'},

  // === ポリマー ===
  {id:'MAT-0345',name:'PE-HD 高密度ポリエチレン',cat:'ポリマー',hv:60,ts:30,el:1.0,pf:26,el2:700,dn:0.95,comp:'Polyethylene (HDPE)',batch:'B-030',date:'2026-03-16',author:'山田 研',status:'承認済',ai:false,memo:'容器・パイプ。最も生産量が多い樹脂'},
  {id:'MAT-0346',name:'PP ポリプロピレン',cat:'ポリマー',hv:80,ts:35,el:1.5,pf:30,el2:200,dn:0.91,comp:'Polypropylene (isotactic)',batch:'B-030',date:'2026-03-16',author:'田中 実',status:'承認済',ai:false,memo:'自動車バンパー・食品容器'},
  {id:'MAT-0347',name:'PET ポリエチレンテレフタレート',cat:'ポリマー',hv:84,ts:55,el:2.8,pf:50,el2:300,dn:1.38,comp:'Polyethylene terephthalate',batch:'B-030',date:'2026-03-15',author:'鈴木 誠',status:'承認済',ai:false,memo:'ペットボトル・フィルム'},
  {id:'MAT-0348',name:'PA66 ナイロン66',cat:'ポリマー',hv:82,ts:80,el:2.8,pf:72,el2:60,dn:1.14,comp:'Polyamide 6,6',batch:'B-029',date:'2026-03-14',author:'山田 研',status:'承認済',ai:false,memo:'ギア・ベアリング。耐摩耗性'},
  {id:'MAT-0349',name:'POM ポリアセタール',cat:'ポリマー',hv:85,ts:67,el:2.9,pf:60,el2:40,dn:1.41,comp:'Polyoxymethylene (copolymer)',batch:'B-029',date:'2026-03-14',author:'田中 実',status:'承認済',ai:false,memo:'精密ギア。低摩擦・高剛性'},
  {id:'MAT-0350',name:'ABS 樹脂',cat:'ポリマー',hv:70,ts:45,el:2.3,pf:40,el2:20,dn:1.05,comp:'Acrylonitrile-butadiene-styrene',batch:'B-029',date:'2026-03-13',author:'鈴木 誠',status:'承認済',ai:false,memo:'家電筐体・3Dプリンタ材料'},
  {id:'MAT-0351',name:'PC ポリカーボネート',cat:'ポリマー',hv:75,ts:65,el:2.4,pf:55,el2:120,dn:1.20,comp:'Bisphenol-A polycarbonate',batch:'B-029',date:'2026-03-13',author:'木村 研一',status:'承認済',ai:false,memo:'透明・高衝撃性。防弾ガラス'},
  {id:'MAT-0352',name:'PMMA アクリル',cat:'ポリマー',hv:90,ts:72,el:3.1,pf:60,el2:5,dn:1.19,comp:'Poly(methyl methacrylate)',batch:'B-028',date:'2026-03-12',author:'山田 研',status:'承認済',ai:false,memo:'有機ガラス。光学レンズ'},
  {id:'MAT-0353',name:'PEEK 熱可塑性樹脂',cat:'ポリマー',hv:88,ts:100,el:3.6,pf:91,el2:50,dn:1.32,comp:'Polyether ether ketone',batch:'B-028',date:'2026-03-12',author:'田中 実',status:'承認済',ai:false,memo:'高耐熱(260°C連続)エンプラ'},
  {id:'MAT-0354',name:'PPS ポリフェニレンサルファイド',cat:'ポリマー',hv:95,ts:85,el:3.5,pf:75,el2:3,dn:1.35,comp:'Poly(p-phenylene sulfide)',batch:'B-028',date:'2026-03-11',author:'鈴木 誠',status:'承認済',ai:false,memo:'耐薬品性。自動車電装部品'},
  {id:'MAT-0355',name:'PI ポリイミド (Kapton)',cat:'ポリマー',hv:92,ts:230,el:3.0,pf:72,el2:80,dn:1.42,comp:'Polyimide film',batch:'B-028',date:'2026-03-11',author:'山田 研',status:'承認済',ai:true,memo:'耐熱フィルム(400°C)。FPC基材'},
  {id:'MAT-0356',name:'PTFE フッ素樹脂(テフロン)',cat:'ポリマー',hv:55,ts:20,el:0.4,pf:null,el2:300,dn:2.17,comp:'Polytetrafluoroethylene',batch:'B-027',date:'2026-03-10',author:'山田 研',status:'承認済',ai:false,memo:'最低摩擦係数(0.04)。化学不活性'},
  {id:'MAT-0357',name:'シリコーンゴム',cat:'ポリマー',hv:30,ts:10,el:0.005,pf:null,el2:600,dn:1.10,comp:'Polydimethylsiloxane (PDMS)',batch:'B-027',date:'2026-03-10',author:'田中 実',status:'承認済',ai:false,memo:'耐熱ゴム(-60〜200°C)'},
  {id:'MAT-0358',name:'エポキシ樹脂',cat:'ポリマー',hv:85,ts:80,el:3.2,pf:null,el2:4,dn:1.20,comp:'Bisphenol-A / Amine hardener',batch:'B-027',date:'2026-03-09',author:'鈴木 誠',status:'承認済',ai:false,memo:'接着剤・CFRP母材'},

  // === 複合材料 ===
  {id:'MAT-0359',name:'CFRP 炭素繊維強化プラスチック',cat:'複合材料',hv:65,ts:600,el:70,pf:null,el2:1.5,dn:1.60,comp:'CF 60vol% / Epoxy 40vol%',batch:'B-027',date:'2026-03-09',author:'木村 研一',status:'承認済',ai:false,memo:'0/90積層。航空機・F1マシン'},
  {id:'MAT-0360',name:'GFRP ガラス繊維強化プラスチック',cat:'複合材料',hv:45,ts:300,el:25,pf:null,el2:2.0,dn:1.80,comp:'E-glass 50vol% / Polyester',batch:'B-026',date:'2026-03-08',author:'山田 研',status:'承認済',ai:false,memo:'船舶・浴槽・タンク'},
  {id:'MAT-0361',name:'アラミド繊維/エポキシ複合材',cat:'複合材料',hv:40,ts:500,el:30,pf:null,el2:2.5,dn:1.38,comp:'Kevlar 49 / Epoxy',batch:'B-026',date:'2026-03-08',author:'鈴木 誠',status:'承認済',ai:false,memo:'防弾ベスト・ヘルメット'},
  {id:'MAT-0362',name:'SiC/SiC CMC',cat:'複合材料',hv:2800,ts:350,el:200,pf:null,el2:0.2,dn:2.70,comp:'SiC fiber / SiC matrix',batch:'B-026',date:'2026-03-07',author:'山田 研',status:'レビュー待',ai:true,memo:'航空エンジンタービン翼'},
  {id:'MAT-0363',name:'C/C コンポジット',cat:'複合材料',hv:100,ts:250,el:30,pf:null,el2:1.0,dn:1.65,comp:'Carbon fiber / Carbon matrix',batch:'B-026',date:'2026-03-07',author:'田中 実',status:'承認済',ai:false,memo:'ブレーキディスク。2000°C耐熱'},
  {id:'MAT-0364',name:'TiC/TiN サーメット',cat:'複合材料',hv:1600,ts:1200,el:400,pf:null,el2:0,dn:6.50,comp:'TiC-TiN 70% / Ni-Co binder 30%',batch:'B-025',date:'2026-03-06',author:'鈴木 誠',status:'承認済',ai:true,memo:'高速仕上げ切削用工具。WC-Coより軽量'},
  {id:'MAT-0365',name:'Al-SiC MMC',cat:'複合材料',hv:150,ts:450,el:120,pf:350,el2:5,dn:2.90,comp:'Al6061 + SiC 20vol%',batch:'B-025',date:'2026-03-06',author:'山田 研',status:'承認済',ai:false,memo:'高剛性軽量。電子パッケージ基板'},
  {id:'MAT-0366',name:'サンドイッチパネル (Al/ハニカム)',cat:'複合材料',hv:80,ts:200,el:45,pf:null,el2:3,dn:0.30,comp:'Al 5052 skin / Al honeycomb core',batch:'B-025',date:'2026-03-05',author:'田中 実',status:'承認済',ai:false,memo:'航空機内装・建築パネル'},
  {id:'MAT-0367',name:'GLARE ガラスアルミ積層材',cat:'複合材料',hv:95,ts:450,el:55,pf:null,el2:4,dn:2.45,comp:'Al 2024 + S2-glass/epoxy',batch:'B-025',date:'2026-03-05',author:'鈴木 誠',status:'承認済',ai:false,memo:'A380 上部胴体。耐疲労'},
  {id:'MAT-0368',name:'FRM チタン基複合材',cat:'複合材料',hv:400,ts:1500,el:200,pf:null,el2:0.8,dn:4.10,comp:'Ti-6Al-4V + SiC fiber',batch:'B-024',date:'2026-03-04',author:'山田 研',status:'レビュー待',ai:true,memo:'次世代航空エンジン構造材'},
];

export let nextId: number = 369;
export function getNextId(): string {
  const id = `MAT-0${nextId}`;
  return id;
}
export function incrementNextId(): void { nextId++; }
