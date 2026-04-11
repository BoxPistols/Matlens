let _apiLogs: any[] = [];
const _apiLogListeners: any[] = [];
const notifyLog = (log: any) => { _apiLogs = [log, ..._apiLogs].slice(0, 200); _apiLogListeners.forEach(fn => fn(log)); };
export const onApiLog  = (fn: any) => { _apiLogListeners.push(fn); return () => { const i=_apiLogListeners.indexOf(fn); if(i>=0)_apiLogListeners.splice(i,1); }; };
export const getApiLogs = () => _apiLogs;
export const MOCK_CONFIG = { baseLatency: 120, jitter: 80, errorRate: 0 };
const mockDelay = () => new Promise(r => setTimeout(r, MOCK_CONFIG.baseLatency + Math.random() * MOCK_CONFIG.jitter));

// Note: nextId is managed via the module-level variable in initialDb.js
import { nextId } from '../data/initialDb';

export function installMockAPI(getDb: any, dispatch: any) {
  const originalFetch = window.fetch.bind(window);
  let localNextId = nextId;
  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : (input as Request).url;
    if (!url.startsWith('/api/') || url.startsWith('/api/ai')) return originalFetch(input, init);
    const start = Date.now();
    const method = (init.method || 'GET').toUpperCase();
    const path = url.replace(/\?.*$/, '');
    const query = url.includes('?') ? Object.fromEntries(new URLSearchParams(url.split('?')[1])) : {};
    let reqBody: any = null;
    try {
      if (init.body) reqBody = JSON.parse(init.body as string);
    } catch {
      // Body was empty or malformed — leave reqBody as null.
    }
    if (Math.random() < MOCK_CONFIG.errorRate / 100) {
      await mockDelay();
      const logE = { id: Math.random().toString(36).slice(2), ts: start, method, path, status: 500, latency: Date.now()-start, reqBody, resBody: { error: 'Internal Server Error (simulated)' }, error: 'Simulated 500' };
      notifyLog(logE);
      return new Response(JSON.stringify(logE.resBody), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    await mockDelay();
    let status = 200;
    // eslint-disable-next-line no-useless-assignment -- resBody is reassigned by every route branch below; the initial value is deliberate.
    let resBody: any = null;
    const db = getDb();
    if (method === 'GET' && path === '/api/materials') {
      let rows = [...db];
      if (query.cat)    rows = rows.filter(r => r.cat === query.cat);
      if (query.status) rows = rows.filter(r => r.status === query.status);
      if (query.q)      { const qLower = query.q.toLowerCase(); rows = rows.filter(r => `${r.name} ${r.id} ${r.comp}`.toLowerCase().includes(qLower)); }
      if (query.hv_min) { const hvMin = parseFloat(query.hv_min); rows = rows.filter(r => r.hv >= hvMin); }
      if (query.hv_max) { const hvMax = parseFloat(query.hv_max); rows = rows.filter(r => r.hv <= hvMax); }
      const page = parseInt(query.page || '1'), limit = parseInt(query.limit || '10');
      resBody = { data: rows.slice((page-1)*limit, page*limit), meta: { total: rows.length, page, limit, pages: Math.ceil(rows.length/limit) } };
    } else if (method === 'GET' && path.match(/^\/api\/materials\/MAT-\d+$/)) {
      const id = path.split('/').pop(), r = db.find((x: any) => x.id === id);
      if (r) { resBody = r; } else { status = 404; resBody = { error: `Material ${id} not found` }; }
    } else if (method === 'POST' && path === '/api/materials') {
      if (!reqBody || !reqBody.name || !reqBody.cat) { status = 422; resBody = { error: 'Validation failed', fields: { name: !reqBody?.name ? 'Required' : null, cat: !reqBody?.cat ? 'Required' : null } }; }
      else { const record = { ...reqBody, id: `MAT-0${localNextId++}`, date: new Date().toISOString().slice(0,10), status: '登録済', ai: false }; dispatch({ type: 'ADD', record }); status = 201; resBody = record; }
    } else if (method === 'PUT' && path.match(/^\/api\/materials\/MAT-\d+$/)) {
      const id = path.split('/').pop(), r = db.find((x: any) => x.id === id);
      if (!r) { status = 404; resBody = { error: `Material ${id} not found` }; }
      else { const updated = { ...r, ...reqBody, id }; dispatch({ type: 'UPDATE', record: updated }); resBody = updated; }
    } else if (method === 'PATCH' && path.match(/^\/api\/materials\/MAT-\d+\/status$/)) {
      const id = path.split('/')[3], r = db.find((x: any) => x.id === id);
      if (!r) { status = 404; resBody = { error: `Material ${id} not found` }; }
      else { dispatch({ type: 'UPDATE', record: { ...r, status: reqBody.status } }); resBody = { id, status: reqBody.status }; }
    } else if (method === 'DELETE' && path.match(/^\/api\/materials\/MAT-\d+$/)) {
      const id = path.split('/').pop(), r = db.find((x: any) => x.id === id);
      if (!r) { status = 404; resBody = { error: `Material ${id} not found` }; }
      else { dispatch({ type: 'DELETE', id }); status = 204; resBody = null; }
    } else if (method === 'GET' && path === '/api/stats') {
      resBody = { total: db.length, byStatus: Object.fromEntries(['登録済','レビュー待','承認済','要修正'].map((s: string)=>[s,db.filter((r: any)=>r.status===s).length])), byCategory: Object.fromEntries(['金属合金','セラミクス','ポリマー','複合材料'].map((c: string)=>[c,db.filter((r: any)=>r.cat===c).length])), aiDetected: db.filter((r: any)=>r.ai).length };
    } else if (method === 'GET' && path.match(/^\/api\/materials\/MAT-\d+\/similar$/)) {
      const id = path.split('/')[3], base = db.find((r: any) => r.id === id);
      resBody = { data: base ? db.filter((r: any)=>r.cat===base.cat&&r.id!==id).slice(0,5).map((r: any)=>({...r,score:0.7+Math.random()*.25})) : [] };
    } else { status = 404; resBody = { error: `Route ${method} ${path} not found` }; }
    const latency = Date.now() - start;
    const log = { id: Math.random().toString(36).slice(2), ts: start, method, path, status, latency, reqBody, resBody };
    notifyLog(log);
    return new Response(resBody !== null ? JSON.stringify(resBody) : '', { status, headers: { 'Content-Type': 'application/json', 'X-Mock-API': 'true', 'X-Response-Time': `${latency}ms` } });
  };
}

export function clearApiLogs() {
  _apiLogs.splice(0);
}
