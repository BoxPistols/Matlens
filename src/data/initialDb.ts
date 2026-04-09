import type { Material } from '../types';

export const INITIAL_DB: Material[] = [
  {id:'MAT-0247',name:'Ti-6Al-4V チタン合金',cat:'金属合金',hv:330,ts:950,el:114,pf:880,el2:14,dn:4.43,comp:'Ti-6Al-4V (wt%)',batch:'B-038',date:'2026-04-08',author:'山田 研',status:'登録済',ai:true,memo:'高強度・低密度。航空宇宙用途向け試験サンプル。'},
  {id:'MAT-0246',name:'Al2O3 アルミナ基板',cat:'セラミクス',hv:1800,ts:280,el:380,pf:null,el2:0,dn:3.97,comp:'Al2O3 99.5% (wt%)',batch:'B-038',date:'2026-04-07',author:'田中 実',status:'承認済',ai:false,memo:''},
  {id:'MAT-0245',name:'PEEK 熱可塑性樹脂',cat:'ポリマー',hv:88,ts:100,el:3.6,pf:91,el2:50,dn:1.32,comp:'Polyether ether ketone',batch:'B-038',date:'2026-04-06',author:'田中 実',status:'承認済',ai:false,memo:'高耐熱エンジニアリングプラスチック'},
  {id:'MAT-0244',name:'Inconel 718 ニッケル超合金',cat:'金属合金',hv:420,ts:1380,el:200,pf:1180,el2:12,dn:8.19,comp:'Ni-19Cr-18Fe-5Nb-3Mo-1Ti-0.5Al',batch:'B-037',date:'2026-04-05',author:'鈴木 誠',status:'レビュー待',ai:true,memo:'高温強度試験用'},
  {id:'MAT-0243',name:'SiC/SiC 複合材',cat:'複合材料',hv:2800,ts:350,el:200,pf:null,el2:0.2,dn:2.7,comp:'SiC fiber / SiC matrix CMC',batch:'B-037',date:'2026-04-04',author:'山田 研',status:'レビュー待',ai:true,memo:'航空エンジン用CMC'},
  {id:'MAT-0242',name:'CFRP 炭素繊維強化プラスチック',cat:'複合材料',hv:65,ts:600,el:70,pf:null,el2:1.5,dn:1.6,comp:'CF 60vol% / Epoxy 40vol%',batch:'B-037',date:'2026-04-03',author:'木村 研一',status:'承認済',ai:false,memo:'0/90積層 12プライ'},
  {id:'MAT-0241',name:'SS400 一般構造用圧延鋼',cat:'金属合金',hv:155,ts:400,el:206,pf:245,el2:21,dn:7.85,comp:'Fe-0.27C-1.5Mn (max)',batch:'B-036',date:'2026-04-02',author:'田中 実',status:'要修正',ai:false,memo:'引張試験値に疑義あり。再測定依頼中。'},
  {id:'MAT-0240',name:'ZrO2 ジルコニア',cat:'セラミクス',hv:1200,ts:900,el:210,pf:null,el2:0,dn:5.68,comp:'ZrO2-3Y2O3 (3Y-TZP)',batch:'B-036',date:'2026-04-01',author:'鈴木 誠',status:'承認済',ai:false,memo:''},
  {id:'MAT-0239',name:'PTFE フッ素樹脂',cat:'ポリマー',hv:55,ts:20,el:0.4,pf:null,el2:300,dn:2.17,comp:'Polytetrafluoroethylene',batch:'B-036',date:'2026-03-28',author:'山田 研',status:'承認済',ai:false,memo:'化学的不活性、低摩擦'},
  {id:'MAT-0238',name:'SUS304 ステンレス鋼',cat:'金属合金',hv:185,ts:520,el:193,pf:205,el2:40,dn:7.93,comp:'Fe-18Cr-8Ni (wt%)',batch:'B-035',date:'2026-03-27',author:'田中 実',status:'承認済',ai:false,memo:''},
  {id:'MAT-0237',name:'SUS316L 低炭素ステンレス',cat:'金属合金',hv:186,ts:485,el:193,pf:170,el2:40,dn:7.98,comp:'Fe-17Cr-12Ni-2Mo-0.03C',batch:'B-035',date:'2026-03-26',author:'山田 研',status:'承認済',ai:false,memo:'耐食性が高く医療機器に多用'},
  {id:'MAT-0236',name:'純チタン Grade 2',cat:'金属合金',hv:145,ts:345,el:103,pf:275,el2:20,dn:4.51,comp:'Ti-0.3Fe-0.25O (max)',batch:'B-035',date:'2026-03-25',author:'鈴木 誠',status:'承認済',ai:false,memo:'生体適合性あり'},
  {id:'MAT-0235',name:'Si3N4 窒化ケイ素',cat:'セラミクス',hv:1580,ts:700,el:300,pf:null,el2:0,dn:3.20,comp:'Si3N4 + sintering aids',batch:'B-035',date:'2026-03-24',author:'田中 実',status:'承認済',ai:false,memo:''},
  {id:'MAT-0234',name:'ポリカーボネート PC',cat:'ポリマー',hv:75,ts:65,el:2.4,pf:55,el2:120,dn:1.20,comp:'Bisphenol-A polycarbonate',batch:'B-034',date:'2026-03-20',author:'木村 研一',status:'承認済',ai:false,memo:'透明・高衝撃性'},
  {id:'MAT-0233',name:'Al-7075 超々ジュラルミン',cat:'金属合金',hv:175,ts:572,el:72,pf:503,el2:11,dn:2.81,comp:'Al-5.6Zn-2.5Mg-1.6Cu-0.23Cr',batch:'B-034',date:'2026-03-19',author:'山田 研',status:'承認済',ai:false,memo:'T6処理後。航空機構造材'},
];

export let nextId: number = 248;
export function getNextId(): string { return `MAT-0${nextId}`; }
export function incrementNextId(): void { nextId++; }
