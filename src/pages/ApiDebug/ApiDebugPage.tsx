import { useState, useEffect } from 'react';
import { Icon } from '../../components/Icon';
import { Tooltip } from '../../components/Tooltip';
import { Button, Badge, Card, SectionCard, Input, Select, Textarea, FormGroup, UnitInput } from '../../components/atoms';
import { AIInsightCard } from '../../components/molecules';
import { onApiLog, getApiLogs, MOCK_CONFIG, clearApiLogs } from '../../services/mockApi';
import type { Material, ApiLog } from '../../types';

interface ApiDebugPageProps {
  db: Material[];
  dispatch: React.Dispatch<any>;
}

const statusColor = (s: number) => s >= 500 ? 'text-err' : s >= 400 ? 'text-warn' : s >= 200 ? 'text-ok' : 'text-text-lo';
const methodColor = (m: string) => ({ GET:'text-ok', POST:'text-accent', PUT:'text-warn', PATCH:'text-ai', DELETE:'text-err' } as Record<string, string>)[m] || 'text-text-md';

// TypeScript type definition string constant (avoids Babel misinterpreting <T> in JSX)
const TS_TYPE_DEF = [
  "type MaterialCategory =",
  "  '金属合金' | 'セラミクス' |",
  "  'ポリマー' | '複合材料';",
  "",
  "type MaterialStatus =",
  "  '登録済' | 'レビュー待' |",
  "  '承認済' | '要修正';",
  "",
  "interface Material {",
  "  id:     string;       // 'MAT-XXXX'",
  "  name:   string;",
  "  cat:    MaterialCategory;",
  "  hv:     number;       // [HV]",
  "  ts:     number;       // [MPa]",
  "  el:     number;       // [GPa]",
  "  pf:     number|null;  // [MPa]",
  "  el2:    number;       // [%]",
  "  dn:     number;       // [g/cm3]",
  "  comp:   string;",
  "  batch:  string;",
  "  date:   string;       // YYYY-MM-DD",
  "  author: string;",
  "  status: MaterialStatus;",
  "  ai:     boolean;",
  "  memo:   string;",
  "}",
  "",
  "interface ApiResponse<T> {",
  "  data: T;",
  "  meta?: { total:number; page:number;",
  "           limit:number; pages:number; };",
  "}",
  "",
  "interface ValidationError {",
  "  error: string;",
  "  fields: Partial<Record<keyof Material, string>>;",
  "}",
].join("\n");

export const ApiDebugPage = ({ db, dispatch }: ApiDebugPageProps) => {
  const [logs, setLogs] = useState<ApiLog[]>(() => getApiLogs());
  const [selected, setSelected] = useState<ApiLog | null>(null);
  const [tab, setTab] = useState('logs');
  const [config, setConfig] = useState({ ...MOCK_CONFIG });
  const [customMethod, setCustomMethod] = useState('GET');
  const [customPath, setCustomPath] = useState('/api/materials');
  const [customBody, setCustomBody] = useState('');
  const [customResult, setCustomResult] = useState<{ status?: number; body?: any; headers?: Record<string, string>; error?: string } | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => { const unsub = onApiLog(() => setLogs([...getApiLogs()])); return unsub; }, []);

  const runRequest = async () => {
    setSending(true);
    try {
      const opts: RequestInit = { method: customMethod, headers: { 'Content-Type': 'application/json' } };
      if (customBody && ['POST','PUT','PATCH'].includes(customMethod)) opts.body = customBody;
      const res = await fetch(customPath, opts);
      const text = await res.text();
      let body; try { body = JSON.parse(text); } catch(e) { body = text; }
      setCustomResult({ status: res.status, body, headers: Object.fromEntries([...res.headers.entries()]) });
    } catch (e) { setCustomResult({ error: (e as Error).message }); }
    setSending(false);
  };

  const generateCurl = (log: ApiLog) => {
    let cmd = `curl -X ${log.method} 'http://localhost:8000${log.path}'`;
    cmd += `\n  -H 'Content-Type: application/json'`;
    if (log.reqBody) cmd += `\n  -d '${JSON.stringify(log.reqBody)}'`;
    return cmd;
  };

  const QUICK_REQUESTS = [
    { label:'GET 全材料一覧', method:'GET', path:'/api/materials' },
    { label:'GET ページング', method:'GET', path:'/api/materials?page=1&limit=5' },
    { label:'GET 金属合金のみ', method:'GET', path:'/api/materials?cat=金属合金' },
    { label:'GET 統計', method:'GET', path:'/api/stats' },
    { label:'GET 特定材料', method:'GET', path:'/api/materials/MAT-0247' },
    { label:'POST 新規登録', method:'POST', path:'/api/materials', body:JSON.stringify({name:'テスト材料',cat:'金属合金',comp:'Fe-100',hv:200,ts:400,el:200,el2:20,dn:7.8,batch:'B-039',memo:''}) },
    { label:'PATCH ステータス変更', method:'PATCH', path:'/api/materials/MAT-0247/status', body:JSON.stringify({status:'承認済'}) },
    { label:'DELETE 削除', method:'DELETE', path:'/api/materials/MAT-0247' },
  ];

  const API_SPEC = [
    {method:'GET',  path:'/api/materials',desc:'材料一覧取得',params:'cat,status,q,hv_min,hv_max,page,limit',response:'{ data:Material[], meta:{total,page,limit,pages} }'},
    {method:'GET',  path:'/api/materials/:id',desc:'特定材料',params:'—',response:'Material | 404'},
    {method:'POST', path:'/api/materials',desc:'新規登録',params:'Body: Partial<Material>',response:'201 Material | 422 {error,fields}'},
    {method:'PUT',  path:'/api/materials/:id',desc:'全項目更新',params:'Body: Material',response:'Material | 404'},
    {method:'PATCH',path:'/api/materials/:id/status',desc:'ステータス変更',params:'Body:{status}',response:'{id,status}|404'},
    {method:'DELETE',path:'/api/materials/:id',desc:'削除',params:'—',response:'204 | 404'},
    {method:'GET',  path:'/api/stats',desc:'集計統計',params:'—',response:'{total,byStatus,byCategory,aiDetected}'},
    {method:'GET',  path:'/api/materials/:id/similar',desc:'類似材料',params:'—',response:'{data:Material[]}'},
  ];

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <div className="flex items-start gap-3 flex-shrink-0">
        <div className="flex-1">
          <h1 className="ptitle text-[19px] font-bold tracking-tight flex items-center gap-2">API デバッグコンソール <Badge variant="vec">Mock</Badge></h1>
          <p className="text-[12px] text-text-lo mt-0.5">fetch interceptor による Mock REST API — 本番では Python FastAPI + Amazon Aurora に切り替え</p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" size="sm" onClick={() => { clearApiLogs(); setLogs([]); }}><Icon name="trash" size={12}/>ログクリア</Button>
          <Badge variant="green">{logs.length} req</Badge>
        </div>
      </div>

      <div className="flex gap-1 border-b border-[var(--border-faint)]">
        {([['logs','リクエストログ'],['composer','リクエスト送信'],['spec','API仕様書'],['config','モック設定']] as const).map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors -mb-px font-ui ${tab===id?'border-accent text-accent':'border-transparent text-text-md hover:text-text-hi'}`}>{label}</button>
        ))}
      </div>

      {tab==='logs' && (
        <div className="grid gap-3" style={{gridTemplateColumns:selected?'1fr 1fr':'1fr'}}>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto flex-1">
              <table className="w-full text-[12px]">
                <thead className="sticky top-0 bg-raised z-10 border-b border-[var(--border-faint)]">
                  <tr>{['時刻','Method','パス','Status','レイテンシ'].map(h=><th key={h} className="px-3 py-2 text-left text-[11px] font-bold text-text-lo uppercase tracking-[.04em]">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {logs.length===0&&<tr><td colSpan={5} className="text-center py-10 text-text-lo"><Icon name="info" size={20} className="mx-auto mb-2 opacity-30"/><div>リクエストなし — 送信タブから実行してください</div></td></tr>}
                  {logs.map(log=>(
                    <tr key={log.id} onClick={()=>setSelected(selected?.id===log.id?null:log)} className={`border-b border-[var(--border-faint)] cursor-pointer ${selected?.id===log.id?'bg-accent-dim':'hover:bg-hover'}`}>
                      <td className="px-3 py-2 font-mono text-text-lo">{new Date(log.ts).toLocaleTimeString('ja-JP')}</td>
                      <td className={`px-3 py-2 font-bold font-mono ${methodColor(log.method)}`}>{log.method}</td>
                      <td className="px-3 py-2 font-mono">{log.path}</td>
                      <td className={`px-3 py-2 font-bold font-mono ${statusColor(log.status)}`}>{log.status}</td>
                      <td className="px-3 py-2 font-mono text-text-lo">{log.latency}ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          {selected&&(
            <Card className="p-4 max-h-[520px] overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <span className={`font-bold font-mono text-[13px] ${methodColor(selected.method)}`}>{selected.method}</span>
                <span className="font-mono text-[13px]">{selected.path}</span>
                <span className={`ml-auto font-bold font-mono ${statusColor(selected.status)}`}>{selected.status}</span>
                <span className="text-[12px] text-text-lo">{selected.latency}ms</span>
              </div>
              {!!selected.reqBody&&<div className="mb-3"><div className="font-bold text-text-lo uppercase tracking-[.04em] text-[11px] mb-1">Request Body</div><pre className="bg-sunken rounded p-3 font-mono text-[11px] border border-[var(--border-faint)] overflow-x-auto max-h-32">{String(JSON.stringify(selected.reqBody,null,2))}</pre></div>}
              <div className="mb-3"><div className="font-bold text-text-lo uppercase tracking-[.04em] text-[11px] mb-1">Response</div><pre className="bg-sunken rounded p-3 font-mono text-[11px] border border-[var(--border-faint)] overflow-x-auto max-h-40">{String(JSON.stringify(selected.resBody,null,2))}</pre></div>
              <div><div className="font-bold text-text-lo uppercase tracking-[.04em] text-[11px] mb-1">cURL</div><pre className="bg-sunken rounded p-3 font-mono text-[11px] border border-[var(--border-faint)]">{generateCurl(selected)}</pre><Button variant="ghost" size="xs" className="mt-1" onClick={()=>navigator.clipboard.writeText(generateCurl(selected))}><Icon name="copy" size={11}/>コピー</Button></div>
            </Card>
          )}
        </div>
      )}

      {tab==='composer'&&(
        <div className="grid gap-4" style={{gridTemplateColumns:'1fr 300px'}}>
          <div className="flex flex-col gap-3">
            <SectionCard title="リクエスト送信">
              <div className="flex gap-2 mb-3">
                <Select value={customMethod} onChange={e=>setCustomMethod(e.target.value)} className="w-24 font-mono">{['GET','POST','PUT','PATCH','DELETE'].map(m=><option key={m}>{m}</option>)}</Select>
                <Input value={customPath} onChange={e=>setCustomPath(e.target.value)} placeholder="/api/materials" className="flex-1 font-mono"/>
                <Button variant="primary" onClick={runRequest} disabled={sending}><Icon name="chevronRight" size={13}/>{sending?'送信中...':'送信'}</Button>
              </div>
              {['POST','PUT','PATCH'].includes(customMethod)&&<FormGroup label="Request Body (JSON)"><Textarea value={customBody} onChange={e=>setCustomBody(e.target.value)} rows={4} className="font-mono text-[12px]" placeholder='{"name":"材料名","cat":"金属合金"}'/></FormGroup>}
            </SectionCard>
            {customResult&&<SectionCard title="レスポンス">
              <div className={`font-bold font-mono text-[14px] mb-2 ${statusColor(customResult.status!)}`}>HTTP {customResult.status}</div>
              {customResult.error?<div className="text-err text-[13px]">{customResult.error}</div>:<pre className="bg-sunken rounded p-3 font-mono text-[11px] border border-[var(--border-faint)] max-h-60 overflow-auto">{JSON.stringify(customResult.body,null,2)}</pre>}
            </SectionCard>}
          </div>
          <SectionCard title="クイックリクエスト">
            {QUICK_REQUESTS.map(r=>(
              <button key={r.label} onClick={()=>{setCustomMethod(r.method);setCustomPath(r.path);setCustomBody(r.body||'');setTab('composer');}} className={`w-full text-left flex items-center gap-2 px-2.5 py-2 rounded text-[12px] hover:bg-hover transition-colors font-ui mb-0.5 ${r.method==='DELETE'?'text-err':''}`}>
                <span className={`font-bold font-mono w-12 flex-shrink-0 ${methodColor(r.method)}`}>{r.method}</span>
                <span className="text-text-md">{r.label}</span>
              </button>
            ))}
          </SectionCard>
        </div>
      )}

      {tab==='spec'&&(
        <div className="flex flex-col gap-4">
          <AIInsightCard loading={false} chips={[]}>
            <strong>Mock REST API</strong> — fetchインターセプターで実装。本番では<code>window.fetch</code>の差し替えを解除し、<code>https://api.yourbackend.com</code>等に向けるだけで動作。バックエンドは<strong>Python FastAPI + Amazon Aurora (PostgreSQL互換)</strong>想定。pgvectorでEmbeddingも同一DBで管理可能。
          </AIInsightCard>
          <SectionCard title="エンドポイント一覧">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead><tr className="border-b border-[var(--border-faint)]">{['Method','エンドポイント','説明','クエリ/ボディ','レスポンス'].map(h=><th key={h} className="px-3 py-2 text-left text-[11px] font-bold text-text-lo uppercase tracking-[.04em]">{h}</th>)}</tr></thead>
                <tbody>{API_SPEC.map((s,i)=><tr key={i} className="border-b border-[var(--border-faint)] hover:bg-hover"><td className={`px-3 py-2 font-bold font-mono ${methodColor(s.method)}`}>{s.method}</td><td className="px-3 py-2 font-mono text-[11px]">{s.path}</td><td className="px-3 py-2">{s.desc}</td><td className="px-3 py-2 font-mono text-[11px] text-text-lo">{s.params}</td><td className="px-3 py-2 font-mono text-[11px] text-text-lo">{s.response}</td></tr>)}</tbody>
              </table>
            </div>
          </SectionCard>
          <div className="grid gap-3" style={{gridTemplateColumns:'1fr 1fr'}}>
            <SectionCard title="TypeScript 型定義">
              <pre className="bg-sunken rounded p-3 font-mono text-[11px] leading-relaxed border border-[var(--border-faint)] overflow-x-auto">{TS_TYPE_DEF}</pre>
            </SectionCard>
            <SectionCard title="バックエンド構成 (AWS)">
              <div className="text-[12px] text-text-md leading-[1.9]">
                {[['API','Python FastAPI / Django REST Framework'],['DB','Amazon Aurora (PostgreSQL互換)'],['Vector','pgvector 拡張 | Pinecone'],['Auth','Amazon Cognito / JWT'],['Deploy','AWS Lambda + API Gateway'],['Storage','S3 (添付ファイル)'],['CDN','CloudFront']].map(([k,v])=>(
                  <div key={k} className="flex gap-2 border-b border-[var(--border-faint)] py-1.5 last:border-b-0"><span className="w-14 font-bold text-text-lo flex-shrink-0">{k}</span><span>{v}</span></div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {tab==='config'&&(
        <SectionCard title="モック設定">
          <div className="grid grid-cols-3 gap-4">
            <FormGroup label="基本レイテンシ"><UnitInput unit="ms" inputProps={{type:'number',value:config.baseLatency,onChange:e=>{const v=parseInt(e.target.value)||0;setConfig(c=>({...c,baseLatency:v}));MOCK_CONFIG.baseLatency=v;}}}/></FormGroup>
            <FormGroup label="ジッター"><UnitInput unit="ms" inputProps={{type:'number',value:config.jitter,onChange:e=>{const v=parseInt(e.target.value)||0;setConfig(c=>({...c,jitter:v}));MOCK_CONFIG.jitter=v;}}}/></FormGroup>
            <FormGroup label="エラー率" hint="0〜100%でランダム500エラー"><UnitInput unit="%" inputProps={{type:'number',min:0,max:100,value:config.errorRate,onChange:e=>{const v=parseInt(e.target.value)||0;setConfig(c=>({...c,errorRate:v}));MOCK_CONFIG.errorRate=v;}}}/></FormGroup>
          </div>
          <div className="mt-3 bg-sunken p-3 rounded font-mono text-[11px] border border-[var(--border-faint)]">
            baseLatency: {config.baseLatency}ms | jitter: {config.jitter}ms | errorRate: {config.errorRate}% | range: {config.baseLatency}〜{config.baseLatency+config.jitter}ms
          </div>
        </SectionCard>
      )}
    </div>
  );
};
