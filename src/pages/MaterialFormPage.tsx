import { useState, useContext } from 'react';
import { marked } from 'marked';
import { Icon } from '../components/Icon';
import { Button, Card, Input, Select, Textarea, UnitInput, FormGroup } from '../components/atoms';
import { AIInsightCard, VecCard } from '../components/molecules';
import { AppCtx } from '../context/AppContext';
import { getNextId, incrementNextId } from '../data/initialDb';
import type { Material, AIHook, EmbeddingHook, AppContextValue } from '../types';

interface MaterialFormPageProps {
  db: Material[];
  dispatch: React.Dispatch<any>;
  editId: string | null;
  onCancel: () => void;
  onSuccess: () => void;
  claude: AIHook;
  embedding: EmbeddingHook;
}

export const MaterialFormPage = ({ db, dispatch, editId, onCancel, onSuccess, claude, embedding }: MaterialFormPageProps) => {
  const editing = editId ? db.find(r => r.id === editId) : null;
  const [form, setForm] = useState({
    name: editing?.name || '', cat: editing?.cat || '',
    comp: editing?.comp || '', batch: editing?.batch || '',
    hv: editing?.hv || '', ts: editing?.ts || '', el: editing?.el || '',
    pf: editing?.pf || '', el2: editing?.el2 || '', dn: editing?.dn || '',
    temp: '', memo: editing?.memo || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiBody, setAiBody] = useState('組成式を入力すると物性値の目安を提案します。');
  const [aiLoading, setAiLoading] = useState(false);
  const [compTimer, setCompTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const { addToast } = useContext(AppCtx) as AppContextValue;

  const newId = getNextId();

  const set = (k: string) => (v: any) => setForm(f => ({...f, [k]: v}));
  const setV = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => set(k)(e.target.value);

  const onCompChange = (v: string) => {
    set('comp')(v);
    if (compTimer) clearTimeout(compTimer);
    if (v.length < 3) return;
    const t = setTimeout(async () => {
      setAiLoading(true);
      const res = await claude.call(`材料組成「${v}」の典型的な硬度・引張強さ・弾性率を3行（各「硬度: 180〜220 HV」形式）で教えてください。`);
      setAiBody(res); setAiLoading(false);
    }, 700);
    setCompTimer(t);
  };

  const aiAutofill = async () => {
    const c = form.comp || form.cat || '金属合金';
    setAiLoading(true);
    const res = await claude.call(`材料「${c}」の典型的な物性値をJSONのみで返してください（単位なし数値）: {"hv":数値,"ts":数値,"el":数値,"dn":数値}`);
    try {
      const j = JSON.parse(res.replace(/```json?|```/g,'').trim());
      setForm(f => ({...f, hv:j.hv||f.hv, ts:j.ts||f.ts, el:j.el||f.el, dn:j.dn||f.dn}));
      setAiBody('物性値を補完しました。実測値で確認してください。');
      addToast('AI 補完完了');
    } catch(e) { setAiBody(res); }
    setAiLoading(false);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = '必須項目です';
    if (!form.cat) e.cat = '必須項目です';
    if (!form.comp.trim()) e.comp = '必須項目です';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) { addToast('必須項目を入力してください', 'warn'); return; }
    const record: Material = {
      id: editing ? editId! : newId,
      name: form.name, cat: form.cat as Material['cat'], comp: form.comp,
      hv: parseFloat(String(form.hv))||0, ts: parseFloat(String(form.ts))||0, el: parseFloat(String(form.el))||0,
      pf: parseFloat(String(form.pf))||null, el2: parseFloat(String(form.el2))||0, dn: parseFloat(String(form.dn))||0,
      batch: form.batch || 'B-未分類',
      date: new Date().toISOString().slice(0,10),
      author: '木村 研一', status: editing?.status || '登録済' as Material['status'], ai: editing?.ai || false,
      memo: form.memo,
    };
    if (editing) {
      dispatch({ type: 'UPDATE', record });
      addToast(`${editId} を更新しました`);
    } else {
      dispatch({ type: 'ADD', record });
      incrementNextId();
      embedding.addToIndex(record);
      addToast(`${newId} を登録しました`);
    }
    onSuccess();
  };

  const anomalyHv = parseFloat(String(form.hv)) > 3500;
  const anomalyTs = parseFloat(String(form.ts)) > 3000;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="ptitle text-[19px] font-bold tracking-tight">{editing ? `データ編集 — ${editId}` : '材料データ 新規登録'}</h1>
          <p className="text-[12px] text-text-lo mt-0.5">AI が入力をリアルタイムサポートします</p>
        </div>
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 320px', alignItems: 'start' }}>
        <div className="flex flex-col gap-4">
          <Card className="p-4">
            <div className="text-[12px] font-bold text-text-lo tracking-[.04em] uppercase mb-4 pb-2.5 border-b border-[var(--border-faint)]">基本情報</div>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="材料名称" required error={errors.name}><Input value={form.name} onChange={setV('name')} placeholder="例: SUS304-L 改良型" error={!!errors.name} /></FormGroup>
              <FormGroup label="カテゴリ" required error={errors.cat}>
                <Select value={form.cat} onChange={setV('cat')} className={`w-full ${errors.cat ? 'border-err' : ''}`}>
                  <option value="">選択してください</option>
                  {['金属合金','セラミクス','ポリマー','複合材料'].map(c=><option key={c}>{c}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="サンプルID" hint="自動採番"><Input value={editing ? editId! : newId} readOnly className="bg-sunken text-text-lo cursor-default" /></FormGroup>
              <FormGroup label="バッチ番号"><Input value={form.batch} onChange={setV('batch')} placeholder="例: B-038" /></FormGroup>
              <FormGroup label="登録者"><Input value="木村 研一" readOnly className="bg-sunken text-text-lo cursor-default" /></FormGroup>
              <FormGroup label="試験温度"><UnitInput unit="℃" inputProps={{ value: form.temp, onChange: setV('temp'), placeholder: '25' }} /></FormGroup>
              <FormGroup label="組成・配合" required error={errors.comp} className="col-span-2"><Input value={form.comp} onChange={e => onCompChange(e.target.value)} placeholder="例: Fe-18Cr-8Ni-0.03C (wt%)" error={!!errors.comp} /></FormGroup>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center mb-4 pb-2.5 border-b border-[var(--border-faint)]">
              <span className="text-[12px] font-bold text-text-lo tracking-[.04em] uppercase">物性データ</span>
              {(anomalyHv || anomalyTs) && (
                <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] bg-err-dim text-err"><Icon name="warning" size={12} />AI: 異常値候補</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FormGroup label="硬度" hint={anomalyHv ? '通常範囲外の値です' : undefined}><UnitInput unit="HV" inputProps={{ value: form.hv, onChange: setV('hv'), placeholder: '200', type: 'number' }} /></FormGroup>
              <FormGroup label="引張強さ" hint={anomalyTs ? '標準範囲を超えています' : undefined}><UnitInput unit="MPa" inputProps={{ value: form.ts, onChange: setV('ts'), placeholder: '520', type: 'number' }} /></FormGroup>
              <FormGroup label="弾性率"><UnitInput unit="GPa" inputProps={{ value: form.el, onChange: setV('el'), placeholder: '190', type: 'number' }} /></FormGroup>
              <FormGroup label="耐力 0.2%"><UnitInput unit="MPa" inputProps={{ value: form.pf, onChange: setV('pf'), placeholder: '170', type: 'number' }} /></FormGroup>
              <FormGroup label="伸び"><UnitInput unit="%" inputProps={{ value: form.el2, onChange: setV('el2'), placeholder: '40', type: 'number' }} /></FormGroup>
              <FormGroup label="密度"><UnitInput unit="g/cm³" inputProps={{ value: form.dn, onChange: setV('dn'), placeholder: '7.9', type: 'number', step: '0.1' }} /></FormGroup>
              <FormGroup label="備考" className="col-span-3"><Textarea value={form.memo} onChange={setV('memo')} placeholder="試験条件、観察事項など..." rows={2} /></FormGroup>
            </div>
            <div className="flex justify-end gap-2 pt-3 mt-1 border-t border-[var(--border-faint)]">
              <Button variant="default" onClick={onCancel}>キャンセル</Button>
              <Button variant="default" onClick={() => addToast('下書き保存しました')}>下書き</Button>
              <Button variant="primary" onClick={submit}>{editing ? '更新する' : '登録する'}</Button>
            </div>
          </Card>
        </div>
        <div className="flex flex-col gap-3 sticky top-0">
          <AIInsightCard loading={aiLoading} subtitle="入力中の材料に関する補足情報や組成の提案を行います。" chips={[
            { label: '物性値を補完', onClick: aiAutofill },
            { label: '組成テンプレ', onClick: async () => {
              setAiLoading(true);
              const res = await claude.call(`${form.cat||'金属合金'}の代表的な組成式を3種類、材料名付きで各1行で教えてください。`);
              setAiBody(res); setAiLoading(false);
            }},
          ]}>
            {!aiLoading && <div className="md-preview" dangerouslySetInnerHTML={{ __html: marked.parse(aiBody) as string }} />}
          </AIInsightCard>
          <Card className="p-4">
            <div className="text-[12px] font-bold text-text-lo tracking-[.04em] uppercase mb-3">登録フロー</div>
            {[['基本情報・組成を入力','accent',true],['AI が物性値の妥当性を検証','bg-raised text-text-lo',false],['Embedding 生成・索引更新','bg-raised text-text-lo',false],['担当者レビュー → 承認','bg-raised text-text-lo',false]].map(([label,style,active],i) => (
              <div key={i} className="flex items-center gap-2.5 py-1.5 text-[12px]">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${active ? 'bg-accent text-white' : 'bg-raised text-text-lo border border-[var(--border-default)]'}`}>{i+1}</div>
                <span className={active ? 'text-text-hi font-semibold' : 'text-text-md'}>{label}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};
