import { useState, useContext } from 'react';
import { renderSafeMarkdown } from '../../services/safeMarkdown';
import { Icon } from '../../components/Icon';
import { Card, Input, Select, Textarea, UnitInput, FormGroup } from '../../components/atoms';
import { AIInsightCard, StepWizard } from '../../components/molecules';
import type { WizardStep } from '../../components/molecules';
import { AppCtx } from '../../context/AppContext';
import { getNextId, incrementNextId } from '../../data/initialDb';
import type { Material, MaterialCategory, Provenance, AIHook, EmbeddingHook, AppContextValue } from '../../types';

interface MaterialFormPageProps {
  db: Material[];
  dispatch: React.Dispatch<any>;
  editId: string | null;
  onCancel: () => void;
  onSuccess: () => void;
  claude: AIHook;
  embedding: EmbeddingHook;
}

// ─── カテゴリ別テンプレート ────────────────────────────────────────────────

interface CategoryTemplate {
  placeholders: Record<string, string>;
  compHint: string;
}

const CATEGORY_TEMPLATES: Record<MaterialCategory, CategoryTemplate> = {
  '金属合金': {
    placeholders: { hv: '200', ts: '520', el: '190', pf: '170', el2: '40', dn: '7.9' },
    compHint: '例: Fe-18Cr-8Ni-0.03C (wt%)',
  },
  'セラミクス': {
    placeholders: { hv: '1500', ts: '300', el: '380', pf: '', el2: '0.1', dn: '3.9' },
    compHint: '例: Al₂O₃ 99.5%, ZrO₂-3Y₂O₃',
  },
  'ポリマー': {
    placeholders: { hv: '15', ts: '70', el: '3', pf: '', el2: '200', dn: '1.2' },
    compHint: '例: PA6-GF30 (ガラス繊維30%)',
  },
  '複合材料': {
    placeholders: { hv: '300', ts: '1500', el: '140', pf: '', el2: '1.5', dn: '1.6' },
    compHint: '例: T800/3900-2 CFRP [0/90]s',
  },
};

const PROVENANCE_OPTIONS: { value: Provenance; label: string }[] = [
  { value: 'instrument', label: '装置計測' },
  { value: 'manual', label: '手入力' },
  { value: 'ai', label: 'AI 推定' },
  { value: 'simulation', label: 'シミュレーション' },
];

// ─── Component ────────────────────────────────────────────────────────────

export const MaterialFormPage = ({ db, dispatch, editId, onCancel, onSuccess, claude, embedding }: MaterialFormPageProps) => {
  const editing = editId ? db.find(r => r.id === editId) : null;
  const [form, setForm] = useState({
    name: editing?.name || '', cat: editing?.cat || '',
    comp: editing?.comp || '', batch: editing?.batch || '',
    hv: editing?.hv || '', ts: editing?.ts || '', el: editing?.el || '',
    pf: editing?.pf || '', el2: editing?.el2 || '', dn: editing?.dn || '',
    temp: '', memo: editing?.memo || '',
    provenance: editing?.provenance || '' as string,
    microstructure: editing?.microstructure || '',
    testMethod: editing?.testMethod || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [aiBody, setAiBody] = useState('組成式を入力すると物性値の目安を提案します。');
  const [aiLoading, setAiLoading] = useState(false);
  const [compTimer, setCompTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [wizardStep, setWizardStep] = useState(0);
  const { addToast } = useContext(AppCtx) as AppContextValue;

  const newId = getNextId();
  const tpl = form.cat ? CATEGORY_TEMPLATES[form.cat as MaterialCategory] : null;
  const ph = (field: string) => tpl?.placeholders[field] || '';

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

  // ─── Validation (per-step) ─────────────────────────────────────────────

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = '必須項目です';
    if (!form.cat) e.cat = '必須項目です';
    if (!form.comp.trim()) e.comp = '必須項目です';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = (): boolean => {
    const e: Record<string, string> = {};
    const hv = parseFloat(String(form.hv));
    const ts = parseFloat(String(form.ts));
    if (hv > 5000) e.hv = '硬度が異常に高い値です';
    if (ts > 5000) e.ts = '引張強さが異常に高い値です';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ─── Submit ────────────────────────────────────────────────────────────

  const submit = async () => {
    const record: Material = {
      id: editing ? editId! : newId,
      name: form.name, cat: form.cat as Material['cat'], comp: form.comp,
      hv: parseFloat(String(form.hv))||0, ts: parseFloat(String(form.ts))||0, el: parseFloat(String(form.el))||0,
      pf: parseFloat(String(form.pf))||null, el2: parseFloat(String(form.el2))||0, dn: parseFloat(String(form.dn))||0,
      batch: form.batch || 'B-未分類',
      date: new Date().toISOString().slice(0,10),
      author: '木村 研一', status: editing?.status || '登録済' as Material['status'], ai: editing?.ai || false,
      memo: form.memo,
      provenance: (form.provenance || undefined) as Provenance | undefined,
      microstructure: form.microstructure || undefined,
      testMethod: form.testMethod || undefined,
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

  // ─── Wizard steps ──────────────────────────────────────────────────────

  const steps: WizardStep[] = [
    { id: 'basic', label: '基本情報', validate: validateStep1 },
    { id: 'props', label: '物性データ', validate: validateStep2 },
    { id: 'confirm', label: '確認・登録' },
  ];

  const anomalyHv = parseFloat(String(form.hv)) > 3500;
  const anomalyTs = parseFloat(String(form.ts)) > 3000;

  // ─── Step renderers ────────────────────────────────────────────────────

  const renderStep1 = () => (
    <Card className="p-4">
      <div className="text-[12px] font-bold text-text-lo tracking-[.04em] uppercase mb-4 pb-2.5 border-b border-[var(--border-faint)]">基本情報</div>
      <div className="grid grid-cols-2 gap-3">
        <FormGroup label="材料名称" required error={errors.name}>
          <Input value={form.name} onChange={setV('name')} placeholder="例: SUS304-L 改良型" error={!!errors.name} />
        </FormGroup>
        <FormGroup label="カテゴリ" required error={errors.cat}>
          <Select value={form.cat} onChange={setV('cat')} className={`w-full ${errors.cat ? 'border-err' : ''}`}>
            <option value="">選択してください</option>
            {(['金属合金', 'セラミクス', 'ポリマー', '複合材料'] as MaterialCategory[]).map(c => <option key={c}>{c}</option>)}
          </Select>
        </FormGroup>
        <FormGroup label="サンプルID" hint="自動採番">
          <Input value={editing ? editId! : newId} readOnly className="bg-sunken text-text-lo cursor-default" />
        </FormGroup>
        <FormGroup label="バッチ番号">
          <Input value={form.batch} onChange={setV('batch')} placeholder="例: B-038" />
        </FormGroup>
        <FormGroup label="登録者">
          <Input value="木村 研一" readOnly className="bg-sunken text-text-lo cursor-default" />
        </FormGroup>
        <FormGroup label="試験温度">
          <UnitInput unit="℃" inputProps={{ value: form.temp, onChange: setV('temp'), placeholder: '25' }} />
        </FormGroup>
        <FormGroup label="組成・配合" required error={errors.comp} className="col-span-2">
          <Input value={form.comp} onChange={e => onCompChange(e.target.value)} placeholder={tpl?.compHint || '例: Fe-18Cr-8Ni-0.03C (wt%)'} error={!!errors.comp} />
        </FormGroup>
      </div>
      {form.cat && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-md bg-accent-dim text-[12px] text-accent">
          <Icon name="info" size={14} />
          <span>カテゴリ「{form.cat}」を選択 — 物性データのプレースホルダーが自動調整されます</span>
        </div>
      )}
    </Card>
  );

  const renderStep2 = () => (
    <Card className="p-4">
      <div className="flex items-center mb-4 pb-2.5 border-b border-[var(--border-faint)]">
        <span className="text-[12px] font-bold text-text-lo tracking-[.04em] uppercase">物性データ</span>
        {(anomalyHv || anomalyTs) && (
          <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] bg-err-dim text-err">
            <Icon name="warning" size={12} />AI: 異常値候補
          </span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <FormGroup label="硬度" hint={anomalyHv ? '通常範囲外の値です' : undefined} error={errors.hv}>
          <UnitInput unit="HV" inputProps={{ value: form.hv, onChange: setV('hv'), placeholder: ph('hv') || '200', type: 'number' }} />
        </FormGroup>
        <FormGroup label="引張強さ" hint={anomalyTs ? '標準範囲を超えています' : undefined} error={errors.ts}>
          <UnitInput unit="MPa" inputProps={{ value: form.ts, onChange: setV('ts'), placeholder: ph('ts') || '520', type: 'number' }} />
        </FormGroup>
        <FormGroup label="弾性率">
          <UnitInput unit="GPa" inputProps={{ value: form.el, onChange: setV('el'), placeholder: ph('el') || '190', type: 'number' }} />
        </FormGroup>
        <FormGroup label="疲労強度">
          <UnitInput unit="MPa" inputProps={{ value: form.pf, onChange: setV('pf'), placeholder: ph('pf') || '170', type: 'number' }} />
        </FormGroup>
        <FormGroup label="伸び">
          <UnitInput unit="%" inputProps={{ value: form.el2, onChange: setV('el2'), placeholder: ph('el2') || '40', type: 'number' }} />
        </FormGroup>
        <FormGroup label="密度">
          <UnitInput unit="g/cm³" inputProps={{ value: form.dn, onChange: setV('dn'), placeholder: ph('dn') || '7.9', type: 'number', step: '0.1' }} />
        </FormGroup>
      </div>
      <div className="mt-4 pt-3 border-t border-[var(--border-faint)]">
        <div className="text-[12px] font-bold text-text-lo tracking-[.04em] uppercase mb-3">拡張情報</div>
        <div className="grid grid-cols-3 gap-3">
          <FormGroup label="データ出所">
            <Select value={form.provenance} onChange={setV('provenance')} className="w-full">
              <option value="">未指定</option>
              {PROVENANCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="試験方法">
            <Input value={form.testMethod} onChange={setV('testMethod')} placeholder="例: JIS Z 2244, ASTM E8" />
          </FormGroup>
          <FormGroup label="金属組織">
            <Input value={form.microstructure} onChange={setV('microstructure')} placeholder="例: オーステナイト組織" />
          </FormGroup>
        </div>
      </div>
      <FormGroup label="備考" className="mt-3">
        <Textarea value={form.memo} onChange={setV('memo')} placeholder="試験条件、観察事項など..." rows={2} />
      </FormGroup>
    </Card>
  );

  const renderStep3 = () => {
    const fields = [
      { label: '材料名称', value: form.name },
      { label: 'カテゴリ', value: form.cat },
      { label: 'サンプルID', value: editing ? editId! : newId },
      { label: 'バッチ番号', value: form.batch || 'B-未分類' },
      { label: '組成', value: form.comp },
      { label: '硬度', value: form.hv ? `${form.hv} HV` : '—' },
      { label: '引張強さ', value: form.ts ? `${form.ts} MPa` : '—' },
      { label: '弾性率', value: form.el ? `${form.el} GPa` : '—' },
      { label: '疲労強度', value: form.pf ? `${form.pf} MPa` : '—' },
      { label: '伸び', value: form.el2 ? `${form.el2} %` : '—' },
      { label: '密度', value: form.dn ? `${form.dn} g/cm³` : '—' },
      { label: 'データ出所', value: PROVENANCE_OPTIONS.find(o => o.value === form.provenance)?.label || '未指定' },
      { label: '試験方法', value: form.testMethod || '—' },
      { label: '金属組織', value: form.microstructure || '—' },
      { label: '備考', value: form.memo || '—' },
    ];
    const filledCount = fields.filter(f => f.value && f.value !== '—' && f.value !== '未指定' && f.value !== 'B-未分類').length;
    return (
      <Card className="p-4">
        <div className="flex items-center mb-4 pb-2.5 border-b border-[var(--border-faint)]">
          <span className="text-[12px] font-bold text-text-lo tracking-[.04em] uppercase">登録内容の確認</span>
          <span className="ml-auto text-[12px] text-text-lo">{filledCount} / {fields.length} 項目入力済み</span>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {fields.map(f => (
            <div key={f.label} className="flex items-baseline gap-2 py-1.5 border-b border-[var(--border-faint)]">
              <span className="text-[12px] text-text-lo w-24 flex-shrink-0">{f.label}</span>
              <span className={`text-[13px] font-medium ${f.value === '—' || f.value === '未指定' ? 'text-text-lo' : 'text-text-hi'}`}>{f.value}</span>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const stepContent = [renderStep1, renderStep2, renderStep3];

  // renderSafeMarkdown は isomorphic-dompurify でサニタイズ済み
  const renderAiContent = () => {
    if (aiLoading) return null;
    if (aiBody) {
      const sanitizedHtml = renderSafeMarkdown(aiBody);
      return <div className="md-preview" dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />;
    }
    return (
      <div className="text-[12px] text-text-lo space-y-1.5">
        <p><strong className="text-text-md">物性値をAIで推定</strong>：入力した組成式やカテゴリを元に、硬度・引張強度・弾性率・密度の典型値を<strong>入力欄に自動反映</strong>します。</p>
        <p><strong className="text-text-md">組成例を表示</strong>：選択中のカテゴリで代表的な組成式を3件、参考表示します（自動反映はされません）。</p>
      </div>
    );
  };

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="ptitle text-[19px] font-bold tracking-tight">{editing ? `データ編集 — ${editId}` : '材料データ 新規登録'}</h1>
          <p className="text-[12px] text-text-lo mt-0.5">ステップ形式で入力 — AI が各ステップをリアルタイムサポートします</p>
        </div>
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 320px', alignItems: 'start' }}>
        <StepWizard
          steps={steps}
          current={wizardStep}
          onStepChange={setWizardStep}
          onSubmit={submit}
          onCancel={onCancel}
          submitLabel={editing ? '更新する' : '登録する'}
        >
          {stepContent[wizardStep]!()}
        </StepWizard>

        <div className="flex flex-col gap-3 sticky top-0">
          <AIInsightCard loading={aiLoading} subtitle="組成やカテゴリから、AIが物性値を推定・組成例を提案します。入力補助のみで、必ず実測値で検証してください。" chips={[
            { label: '物性値をAIで推定', onClick: aiAutofill },
            { label: '組成例を表示', onClick: async () => {
              setAiLoading(true);
              const res = await claude.call(`${form.cat||'金属合金'}の代表的な組成式を3種類、材料名付きで各1行で教えてください。`);
              setAiBody(res); setAiLoading(false);
            }},
          ]}>
            {renderAiContent()}
          </AIInsightCard>
          <Card className="p-4">
            <div className="text-[12px] font-bold text-text-lo tracking-[.04em] uppercase mb-3">登録フロー</div>
            {[
              { label: '基本情報・組成を入力', step: 0 },
              { label: '物性値・拡張情報を入力', step: 1 },
              { label: '確認して登録', step: 2 },
              { label: '担当者レビュー → 承認', step: -1 },
            ].map((item, i) => {
              const active = item.step === wizardStep;
              const done = item.step >= 0 && item.step < wizardStep;
              return (
                <div key={i} className="flex items-center gap-2.5 py-1.5 text-[12px]">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${
                    done ? 'bg-ok text-white' : active ? 'bg-accent text-white' : 'bg-raised text-text-lo border border-[var(--border-default)]'
                  }`}>
                    {done ? <Icon name="check" size={10} /> : i + 1}
                  </div>
                  <span className={active ? 'text-text-hi font-semibold' : done ? 'text-ok' : 'text-text-md'}>{item.label}</span>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
};
