import { useState, useEffect } from 'react';
import { Icon } from '../components/Icon';
import { Tooltip } from '../components/Tooltip';
import { Button, Badge, Card, SectionCard, Input, Select, Textarea, FormGroup, UnitInput } from '../components/atoms';
import { AIInsightCard } from '../components/molecules';
import { onApiLog, getApiLogs, MOCK_CONFIG, clearApiLogs } from '../services/mockApi';
import type { Material, ApiLog } from '../types';

interface ApiDebugPageProps {
  db: Material[];
  dispatch: React.Dispatch<any>;
}

const statusColor = (s: number) => s >= 500 ? 'text-err' : s >= 400 ? 'text-warn' : s >= 200 ? 'text-ok' : 'text-text-lo';
const methodColor = (m: string) => ({ GET:'text-ok', POST:'text-accent', PUT:'text-warn', PATCH:'text-ai', DELETE:'text-err' } as Record<string, string>)[m] || 'text-text-md';

// TypeScript type definition string constant (avoids Babel misinterpreting <T> in JSX)
const TS_TYPE_DEF = [
  "type MaterialCategory =",
  "  '\u91D1\u5C5E\u5408\u91D1' | '\u30BB\u30E9\u30DF\u30AF\u30B9' |",
  "  '\u30DD\u30EA\u30DE\u30FC' | '\u8907\u5408\u6750\u6599';",
  "",
  "type MaterialStatus =",
  "  '\u767B\u9332\u6E08' | '\u30EC\u30D3\u30E5\u30FC\u5F85' |",
  "  '\u627F\u8A8D\u6E08' | '\u8981\u4FEE\u6B63';",
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
    { label:'GET \u5168\u6750\u6599\u4E00\u89A7', method:'GET', path:'/api/materials' },
    { label:'GET \u30DA\u30FC\u30B8\u30F3\u30B0', method:'GET', path:'/api/materials?page=1&limit=5' },
    { label:'GET \u91D1\u5C5E\u5408\u91D1\u306E\u307F', method:'GET', path:'/api/materials?cat=\u91D1\u5C5E\u5408\u91D1' },
    { label:'GET \u7D71\u8A08', method:'GET', path:'/api/stats' },
    { label:'GET \u7279\u5B9A\u6750\u6599', method:'GET', path:'/api/materials/MAT-0247' },
    { label:'POST \u65B0\u898F\u767B\u9332', method:'POST', path:'/api/materials', body:JSON.stringify({name:'\u30C6\u30B9\u30C8\u6750\u6599',cat:'\u91D1\u5C5E\u5408\u91D1',comp:'Fe-100',hv:200,ts:400,el:200,el2:20,dn:7.8,batch:'B-039',memo:''}) },
    { label:'PATCH \u30B9\u30C6\u30FC\u30BF\u30B9\u5909\u66F4', method:'PATCH', path:'/api/materials/MAT-0247/status', body:JSON.stringify({status:'\u627F\u8A8D\u6E08'}) },
    { label:'DELETE \u524A\u9664', method:'DELETE', path:'/api/materials/MAT-0247' },
  ];

  const API_SPEC = [
    {method:'GET',  path:'/api/materials',desc:'\u6750\u6599\u4E00\u89A7\u53D6\u5F97',params:'cat,status,q,hv_min,hv_max,page,limit',response:'{ data:Material[], meta:{total,page,limit,pages} }'},
    {method:'GET',  path:'/api/materials/:id',desc:'\u7279\u5B9A\u6750\u6599',params:'\u2014',response:'Material | 404'},
    {method:'POST', path:'/api/materials',desc:'\u65B0\u898F\u767B\u9332',params:'Body: Partial<Material>',response:'201 Material | 422 {error,fields}'},
    {method:'PUT',  path:'/api/materials/:id',desc:'\u5168\u9805\u76EE\u66F4\u65B0',params:'Body: Material',response:'Material | 404'},
    {method:'PATCH',path:'/api/materials/:id/status',desc:'\u30B9\u30C6\u30FC\u30BF\u30B9\u5909\u66F4',params:'Body:{status}',response:'{id,status}|404'},
    {method:'DELETE',path:'/api/materials/:id',desc:'\u524A\u9664',params:'\u2014',response:'204 | 404'},
    {method:'GET',  path:'/api/stats',desc:'\u96C6\u8A08\u7D71\u8A08',params:'\u2014',response:'{total,byStatus,byCategory,aiDetected}'},
    {method:'GET',  path:'/api/materials/:id/similar',desc:'\u985E\u4F3C\u6750\u6599',params:'\u2014',response:'{data:Material[]}'},
  ];

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <div className="flex items-start gap-3 flex-shrink-0">
        <div className="flex-1">
          <h1 className="ptitle text-[19px] font-bold tracking-tight flex items-center gap-2">API \u30C7\u30D0\u30C3\u30B0\u30B3\u30F3\u30BD\u30FC\u30EB <Badge variant="vec">Mock</Badge></h1>
          <p className="text-[12px] text-text-lo mt-0.5">fetch interceptor \u306B\u3088\u308B Mock REST API \u2014 \u672C\u756A\u3067\u306F Python FastAPI + Amazon Aurora \u306B\u5207\u308A\u66FF\u3048</p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" size="sm" onClick={() => { clearApiLogs(); setLogs([]); }}><Icon name="trash" size={12}/>\u30ED\u30B0\u30AF\u30EA\u30A2</Button>
          <Badge variant="green">{logs.length} req</Badge>
        </div>
      </div>

      <div className="flex gap-1 border-b border-[var(--border-faint)]">
        {[['logs','\u30EA\u30AF\u30A8\u30B9\u30C8\u30ED\u30B0'],['composer','\u30EA\u30AF\u30A8\u30B9\u30C8\u9001\u4FE1'],['spec','API\u4ED5\u69D8\u66F8'],['config','\u30E2\u30C3\u30AF\u8A2D\u5B9A']].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors -mb-px font-ui ${tab===id?'border-accent text-accent':'border-transparent text-text-md hover:text-text-hi'}`}>{label}</button>
        ))}
      </div>

      {tab==='logs' && (
        <div className="grid gap-3" style={{gridTemplateColumns:selected?'1fr 1fr':'1fr'}}>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto flex-1">
              <table className="w-full text-[12px]">
                <thead className="sticky top-0 bg-raised z-10 border-b border-[var(--border-faint)]">
                  <tr>{['\u6642\u523B','Method','\u30D1\u30B9','Status','\u30EC\u30A4\u30C6\u30F3\u30B7'].map(h=><th key={h} className="px-3 py-2 text-left text-[11px] font-bold text-text-lo uppercase tracking-[.04em]">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {logs.length===0&&<tr><td colSpan={5} className="text-center py-10 text-text-lo"><Icon name="info" size={20} className="mx-auto mb-2 opacity-30"/><div>\u30EA\u30AF\u30A8\u30B9\u30C8\u306A\u3057 \u2014 \u9001\u4FE1\u30BF\u30D6\u304B\u3089\u5B9F\u884C\u3057\u3066\u304F\u3060\u3055\u3044</div></td></tr>}
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
              <div><div className="font-bold text-text-lo uppercase tracking-[.04em] text-[11px] mb-1">cURL</div><pre className="bg-sunken rounded p-3 font-mono text-[11px] border border-[var(--border-faint)]">{generateCurl(selected)}</pre><Button variant="ghost" size="xs" className="mt-1" onClick={()=>navigator.clipboard.writeText(generateCurl(selected))}><Icon name="copy" size={11}/>\u30B3\u30D4\u30FC</Button></div>
            </Card>
          )}
        </div>
      )}

      {tab==='composer'&&(
        <div className="grid gap-4" style={{gridTemplateColumns:'1fr 300px'}}>
          <div className="flex flex-col gap-3">
            <SectionCard title="\u30EA\u30AF\u30A8\u30B9\u30C8\u9001\u4FE1">
              <div className="flex gap-2 mb-3">
                <Select value={customMethod} onChange={e=>setCustomMethod(e.target.value)} className="w-24 font-mono">{['GET','POST','PUT','PATCH','DELETE'].map(m=><option key={m}>{m}</option>)}</Select>
                <Input value={customPath} onChange={e=>setCustomPath(e.target.value)} placeholder="/api/materials" className="flex-1 font-mono"/>
                <Button variant="primary" onClick={runRequest} disabled={sending}><Icon name="chevronRight" size={13}/>{sending?'\u9001\u4FE1\u4E2D...':'\u9001\u4FE1'}</Button>
              </div>
              {['POST','PUT','PATCH'].includes(customMethod)&&<FormGroup label="Request Body (JSON)"><Textarea value={customBody} onChange={e=>setCustomBody(e.target.value)} rows={4} className="font-mono text-[12px]" placeholder='{"name":"\u6750\u6599\u540D","cat":"\u91D1\u5C5E\u5408\u91D1"}'/></FormGroup>}
            </SectionCard>
            {customResult&&<SectionCard title="\u30EC\u30B9\u30DD\u30F3\u30B9">
              <div className={`font-bold font-mono text-[14px] mb-2 ${statusColor(customResult.status!)}`}>HTTP {customResult.status}</div>
              {customResult.error?<div className="text-err text-[13px]">{customResult.error}</div>:<pre className="bg-sunken rounded p-3 font-mono text-[11px] border border-[var(--border-faint)] max-h-60 overflow-auto">{JSON.stringify(customResult.body,null,2)}</pre>}
            </SectionCard>}
          </div>
          <SectionCard title="\u30AF\u30A4\u30C3\u30AF\u30EA\u30AF\u30A8\u30B9\u30C8">
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
            <strong>Mock REST API</strong> \u2014 fetch\u30A4\u30F3\u30BF\u30FC\u30BB\u30D7\u30BF\u30FC\u3067\u5B9F\u88C5\u3002\u672C\u756A\u3067\u306F<code>window.fetch</code>\u306E\u5DEE\u3057\u66FF\u3048\u3092\u89E3\u9664\u3057\u3001<code>https://api.yourbackend.com</code>\u7B49\u306B\u5411\u3051\u308B\u3060\u3051\u3067\u52D5\u4F5C\u3002\u30D0\u30C3\u30AF\u30A8\u30F3\u30C9\u306F<strong>Python FastAPI + Amazon Aurora (PostgreSQL\u4E92\u63DB)</strong>\u60F3\u5B9A\u3002pgvector\u3067Embedding\u3082\u540C\u4E00DB\u3067\u7BA1\u7406\u53EF\u80FD\u3002
          </AIInsightCard>
          <SectionCard title="\u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8\u4E00\u89A7">
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead><tr className="border-b border-[var(--border-faint)]">{['Method','\u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8','\u8AAC\u660E','\u30AF\u30A8\u30EA/\u30DC\u30C7\u30A3','\u30EC\u30B9\u30DD\u30F3\u30B9'].map(h=><th key={h} className="px-3 py-2 text-left text-[11px] font-bold text-text-lo uppercase tracking-[.04em]">{h}</th>)}</tr></thead>
                <tbody>{API_SPEC.map((s,i)=><tr key={i} className="border-b border-[var(--border-faint)] hover:bg-hover"><td className={`px-3 py-2 font-bold font-mono ${methodColor(s.method)}`}>{s.method}</td><td className="px-3 py-2 font-mono text-[11px]">{s.path}</td><td className="px-3 py-2">{s.desc}</td><td className="px-3 py-2 font-mono text-[11px] text-text-lo">{s.params}</td><td className="px-3 py-2 font-mono text-[11px] text-text-lo">{s.response}</td></tr>)}</tbody>
              </table>
            </div>
          </SectionCard>
          <div className="grid gap-3" style={{gridTemplateColumns:'1fr 1fr'}}>
            <SectionCard title="TypeScript \u578B\u5B9A\u7FA9">
              <pre className="bg-sunken rounded p-3 font-mono text-[11px] leading-relaxed border border-[var(--border-faint)] overflow-x-auto">{TS_TYPE_DEF}</pre>
            </SectionCard>
            <SectionCard title="\u30D0\u30C3\u30AF\u30A8\u30F3\u30C9\u69CB\u6210 (AWS)">
              <div className="text-[12px] text-text-md leading-[1.9]">
                {[['API','Python FastAPI / Django REST Framework'],['DB','Amazon Aurora (PostgreSQL\u4E92\u63DB)'],['Vector','pgvector \u62E1\u5F35 | Pinecone'],['Auth','Amazon Cognito / JWT'],['Deploy','AWS Lambda + API Gateway'],['Storage','S3 (\u6DFB\u4ED8\u30D5\u30A1\u30A4\u30EB)'],['CDN','CloudFront']].map(([k,v])=>(
                  <div key={k} className="flex gap-2 border-b border-[var(--border-faint)] py-1.5 last:border-b-0"><span className="w-14 font-bold text-text-lo flex-shrink-0">{k}</span><span>{v}</span></div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {tab==='config'&&(
        <SectionCard title="\u30E2\u30C3\u30AF\u8A2D\u5B9A">
          <div className="grid grid-cols-3 gap-4">
            <FormGroup label="\u57FA\u672C\u30EC\u30A4\u30C6\u30F3\u30B7"><UnitInput unit="ms" inputProps={{type:'number',value:config.baseLatency,onChange:e=>{const v=parseInt(e.target.value)||0;setConfig(c=>({...c,baseLatency:v}));MOCK_CONFIG.baseLatency=v;}}}/></FormGroup>
            <FormGroup label="\u30B8\u30C3\u30BF\u30FC"><UnitInput unit="ms" inputProps={{type:'number',value:config.jitter,onChange:e=>{const v=parseInt(e.target.value)||0;setConfig(c=>({...c,jitter:v}));MOCK_CONFIG.jitter=v;}}}/></FormGroup>
            <FormGroup label="\u30A8\u30E9\u30FC\u7387" hint="0\u301C100%\u3067\u30E9\u30F3\u30C0\u30E0500\u30A8\u30E9\u30FC"><UnitInput unit="%" inputProps={{type:'number',min:0,max:100,value:config.errorRate,onChange:e=>{const v=parseInt(e.target.value)||0;setConfig(c=>({...c,errorRate:v}));MOCK_CONFIG.errorRate=v;}}}/></FormGroup>
          </div>
          <div className="mt-3 bg-sunken p-3 rounded font-mono text-[11px] border border-[var(--border-faint)]">
            baseLatency: {config.baseLatency}ms | jitter: {config.jitter}ms | errorRate: {config.errorRate}% | range: {config.baseLatency}\u301C{config.baseLatency+config.jitter}ms
          </div>
        </SectionCard>
      )}
    </div>
  );
};
