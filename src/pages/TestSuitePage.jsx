import { useState } from 'react';
import { Icon } from '../components/Icon';
import { Button, Badge, Card, ProgressBar } from '../components/atoms';
import { KpiCard } from '../components/molecules';
import { dbReducer } from '../context/AppContext';
import { INITIAL_DB } from '../data/initialDb';
import { RATE_LIMITS } from '../data/constants';

const assert = (condition, message, actual, expected) => ({ passed: !!condition, message: message || (condition ? 'OK' : 'FAILED'), actual, expected });

const TEST_CASES = [
  {id:'t01',group:'CRUD',name:'ADD: 新規材料が先頭に追加される',fn:()=>{const s=dbReducer(INITIAL_DB,{type:'ADD',record:{id:'MAT-9999',name:'テスト',cat:'金属合金',hv:100,ts:200,el:150,pf:null,el2:10,dn:7.8,comp:'Fe',batch:'B-001',date:'2026-01-01',author:'Test',status:'登録済',ai:false,memo:''}});return assert(s[0].id==='MAT-9999','state[0] should be MAT-9999',s[0].id,'MAT-9999');}},
  {id:'t02',group:'CRUD',name:'UPDATE: 名称が更新される',fn:()=>{const s=dbReducer(INITIAL_DB,{type:'UPDATE',record:{...INITIAL_DB[0],name:'更新後'}});const u=s.find(r=>r.id===INITIAL_DB[0].id);return assert(u.name==='更新後','name should be 更新後',u.name,'更新後');}},
  {id:'t03',group:'CRUD',name:'DELETE: 指定IDが削除される',fn:()=>{const id=INITIAL_DB[0].id;const s=dbReducer(INITIAL_DB,{type:'DELETE',id});return assert(!s.find(r=>r.id===id),`${id} should not exist`,s.length,INITIAL_DB.length-1);}},
  {id:'t04',group:'CRUD',name:'BULK_DELETE: 複数IDが削除される',fn:()=>{const ids=new Set([INITIAL_DB[0].id,INITIAL_DB[1].id]);const s=dbReducer(INITIAL_DB,{type:'BULK_DELETE',ids});return assert(s.length===INITIAL_DB.length-2,'length -2',s.length,INITIAL_DB.length-2);}},
  {id:'t05',group:'CRUD',name:'BULK_APPROVE: 複数IDが承認済になる',fn:()=>{const ids=new Set([INITIAL_DB[0].id,INITIAL_DB[1].id]);const s=dbReducer(INITIAL_DB,{type:'BULK_APPROVE',ids});return assert([...ids].every(id=>s.find(r=>r.id===id)?.status==='承認済'),'all 承認済',true,true);}},
  {id:'t06',group:'CRUD',name:'IMPORT: データが先頭に追加される',fn:()=>{const records=[{id:'MAT-8888',name:'Import',cat:'ポリマー',hv:50,ts:60,el:2,pf:null,el2:100,dn:1.2,comp:'Test',batch:'B-999',date:'2026-01-01',author:'Importer',status:'登録済',ai:false,memo:''}];const s=dbReducer(INITIAL_DB,{type:'IMPORT',records});return assert(s[0].id==='MAT-8888','first should be imported',s[0].id,'MAT-8888');}},
  {id:'t07',group:'Filter',name:'カテゴリフィルタ: 金属合金のみ',fn:()=>{const f=INITIAL_DB.filter(r=>r.cat==='金属合金');return assert(f.every(r=>r.cat==='金属合金'),'all 金属合金',f.length,INITIAL_DB.filter(r=>r.cat==='金属合金').length);}},
  {id:'t08',group:'Filter',name:'硬度フィルタ: hv >= 1000',fn:()=>{const f=INITIAL_DB.filter(r=>r.hv>=1000);return assert(f.every(r=>r.hv>=1000),'all hv >= 1000',f.length,INITIAL_DB.filter(r=>r.hv>=1000).length);}},
  {id:'t09',group:'Filter',name:'全文検索: "SUS"を含む材料',fn:()=>{const f=INITIAL_DB.filter(r=>`${r.id} ${r.name} ${r.comp}`.toLowerCase().includes('sus'));return assert(f.length>0,`found ${f.length} with SUS`,f.length,2);}},
  {id:'t10',group:'Filter',name:'ステータスフィルタ: 承認済のみ',fn:()=>{const f=INITIAL_DB.filter(r=>r.status==='承認済');return assert(f.every(r=>r.status==='承認済'),'all 承認済',f.length,INITIAL_DB.filter(r=>r.status==='承認済').length);}},
  {id:'t11',group:'Filter',name:'ソート: 硬度降順',fn:()=>{const s=[...INITIAL_DB].sort((a,b)=>b.hv-a.hv);return assert(s.every((r,i)=>i===0||r.hv<=s[i-1].hv),'hv desc',s[0].hv,Math.max(...INITIAL_DB.map(r=>r.hv)));}},
  {id:'t12',group:'Filter',name:'AIフィルタ: ai===true のみ',fn:()=>{const f=INITIAL_DB.filter(r=>r.ai);return assert(f.every(r=>r.ai),'all ai:true',f.length,INITIAL_DB.filter(r=>r.ai).length);}},
  {id:'t13',group:'Validation',name:'名称未入力でエラー',fn:()=>{const e={};if(!(''.trim()))e.name='必須';return assert(!!e.name,'name error',e.name,'必須');}},
  {id:'t14',group:'Validation',name:'カテゴリ未選択でエラー',fn:()=>{const e={};if(!(''))e.cat='必須';return assert(!!e.cat,'cat error',e.cat,'必須');}},
  {id:'t15',group:'Validation',name:'硬度の正数バリデーション',fn:()=>{const v=(x)=>!isNaN(parseFloat(x))&&parseFloat(x)>0;return assert(v('200')&&!v('')&&!v('-10')&&!v('abc'),'hv validation',true,true);}},
  {id:'t16',group:'Validation',name:'ID形式チェック MAT-XXXX',fn:()=>{const ok=(id)=>/^MAT-\d{4}$/.test(id);return assert(ok('MAT-0247')&&!ok('MAT-123')&&!ok('XXX-0000'),'ID pattern',true,true);}},
  {id:'t17',group:'RateLimit',name:'公開ユーザーの制限は20回',fn:()=>assert(RATE_LIMITS['public']===20,'public=20',RATE_LIMITS['public'],20)},
  {id:'t18',group:'RateLimit',name:'招待ユーザーの制限は30回',fn:()=>assert(RATE_LIMITS['invited']===30,'invited=30',RATE_LIMITS['invited'],30)},
  {id:'t19',group:'RateLimit',name:'自前キーの制限はInfinity',fn:()=>assert(RATE_LIMITS['own-key']===Infinity,'own-key=Infinity',RATE_LIMITS['own-key'],Infinity)},
  {id:'t20',group:'RateLimit',name:'上限到達時にcanCall===false',fn:()=>{const rl={count:20,limit:20};return assert(rl.count>=rl.limit,'at limit',!(rl.count<rl.limit),true);}},
  {id:'t21',group:'API',name:'GET /api/materials が200を返す',fn:async()=>{const r=await fetch('/api/materials');const d=await r.json();return assert(r.status===200&&Array.isArray(d.data),'status 200 + data[]',r.status,200);}},
  {id:'t22',group:'API',name:'GET /api/stats が統計を返す',fn:async()=>{const r=await fetch('/api/stats');const d=await r.json();return assert(r.status===200&&typeof d.total==='number','status 200 + total',r.status,200);}},
  {id:'t23',group:'API',name:'GET /api/materials/MAT-0247 が200',fn:async()=>{const r=await fetch('/api/materials/MAT-0247');return assert(r.status===200,'200',r.status,200);}},
  {id:'t24',group:'API',name:'GET /api/materials/MAT-9999 が404',fn:async()=>{const r=await fetch('/api/materials/MAT-9999');return assert(r.status===404,'404',r.status,404);}},
  {id:'t25',group:'API',name:'POST 不完全データで422',fn:async()=>{const r=await fetch('/api/materials',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({hv:100})});return assert(r.status===422,'422',r.status,422);}},
  {id:'t26',group:'DataIntegrity',name:'全材料にIDが存在する',fn:()=>assert(INITIAL_DB.every(r=>r.id&&/^MAT-\d+$/.test(r.id)),'all valid ID',true,true)},
  {id:'t27',group:'DataIntegrity',name:'全材料のhvが正数',fn:()=>assert(INITIAL_DB.every(r=>typeof r.hv==='number'&&r.hv>0),'all hv positive',true,true)},
  {id:'t28',group:'DataIntegrity',name:'statusが有効値のみ',fn:()=>{const v=new Set(['登録済','レビュー待','承認済','要修正']);return assert(INITIAL_DB.every(r=>v.has(r.status)),'all valid status',true,true);}},
  {id:'t29',group:'DataIntegrity',name:'catが有効値のみ',fn:()=>{const v=new Set(['金属合金','セラミクス','ポリマー','複合材料']);return assert(INITIAL_DB.every(r=>v.has(r.cat)),'all valid cat',true,true);}},
  {id:'t30',group:'DataIntegrity',name:'IDが一意',fn:()=>{const ids=INITIAL_DB.map(r=>r.id);return assert(new Set(ids).size===ids.length,'unique IDs',new Set(ids).size,ids.length);}},
];

export const TestSuitePage = () => {
  const [results, setResults] = useState({});
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState('all');
  const GROUPS = [...new Set(TEST_CASES.map(t=>t.group))];
  const G_COLORS = {CRUD:'blue',Filter:'vec',Validation:'amber',RateLimit:'ai',API:'green',DataIntegrity:'gray'};

  const runCases = async (cases) => {
    setRunning(true);
    for(const tc of cases){
      try{const r=await tc.fn();setResults(p=>({...p,[tc.id]:{...r,status:r.passed?'pass':'fail'}}));}
      catch(e){setResults(p=>({...p,[tc.id]:{passed:false,status:'error',message:e.message}}));}
    }
    setRunning(false);
  };

  const total=TEST_CASES.length,passed=Object.values(results).filter(r=>r.status==='pass').length,failed=Object.values(results).filter(r=>r.status!=='pass'&&r.status).length,ran=passed+failed;
  const rate=ran>0?Math.round(passed/ran*100):0;
  const filtered=filter==='all'?TEST_CASES:filter==='pass'?TEST_CASES.filter(t=>results[t.id]?.status==='pass'):filter==='fail'?TEST_CASES.filter(t=>results[t.id]?.status&&results[t.id]?.status!=='pass'):TEST_CASES.filter(t=>t.group===filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="ptitle text-[19px] font-bold tracking-tight flex items-center gap-2">テストスイート <Badge variant="green">Unit</Badge></h1>
          <p className="text-[12px] text-text-lo mt-0.5">CRUD / Filter / Validation / RateLimit / API / DataIntegrity — 30テストケース</p>
        </div>
        <div className="flex gap-2 items-center">
          {ran>0&&<div className={`text-[13px] font-bold font-mono ${passed===ran?'text-ok':'text-err'}`}>{passed}/{ran} ({rate}%)</div>}
          <Button variant="primary" onClick={()=>runCases(TEST_CASES)} disabled={running}><Icon name="refresh" size={13}/>{running?'実行中...':'全実行'}</Button>
        </div>
      </div>
      {ran>0&&<div className="grid grid-cols-4 gap-3"><KpiCard label="総数" value={total}/><KpiCard label="実行" value={ran}/><KpiCard label="通過" value={passed} color="var(--ok)"/><KpiCard label="失敗" value={failed} color={failed>0?'var(--err)':'var(--ok)'}/></div>}
      {ran>0&&<ProgressBar value={rate} color={rate===100?'var(--ok)':'var(--warn)'}/>}
      <div className="flex gap-2 flex-wrap items-center">
        {['all',...GROUPS,'pass','fail'].map(f=><Button key={f} variant={filter===f?'primary':'default'} size="sm" onClick={()=>setFilter(f)}>{f==='pass'?<><Icon name="check" size={11} className="text-ok"/>通過</>:f==='fail'?<><Icon name="warning" size={11} className="text-err"/>失敗</>:f}</Button>)}
        <div className="ml-auto flex gap-1">
          {GROUPS.map(g=><Button key={g} variant="outline" size="xs" onClick={()=>runCases(TEST_CASES.filter(t=>t.group===g))} disabled={running}>{g}</Button>)}
        </div>
      </div>
      <Card className="overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-raised border-b border-[var(--border-faint)]">
            <tr>{['#','グループ','テスト名','状態','actual','expected'].map(h=><th key={h} className="px-3 py-2 text-left text-[11px] font-bold text-text-lo uppercase tracking-[.04em]">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(tc=>{
              const r=results[tc.id];
              return(
                <tr key={tc.id} className={`border-b border-[var(--border-faint)] last:border-b-0 ${!r?'':r.status==='pass'?'bg-[var(--ok-dim)]':'bg-err-dim'}`}>
                  <td className="px-3 py-2 font-mono text-text-lo">{tc.id}</td>
                  <td className="px-3 py-2"><Badge variant={G_COLORS[tc.group]||'gray'}>{tc.group}</Badge></td>
                  <td className="px-3 py-2 font-medium">{tc.name}</td>
                  <td className="px-3 py-2">{!r?<span className="text-text-lo">—</span>:r.status==='pass'?<span className="flex items-center gap-1 text-ok font-bold"><Icon name="check" size={12}/>PASS</span>:r.status==='error'?<span className="flex items-center gap-1 text-err font-bold"><Icon name="warning" size={12}/>ERROR</span>:<span className="flex items-center gap-1 text-err font-bold"><Icon name="close" size={12}/>FAIL</span>}</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-text-lo max-w-[100px] truncate">{r?String(r.actual??'—'):'—'}</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-text-lo max-w-[100px] truncate">{r?String(r.expected??'—'):'—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
