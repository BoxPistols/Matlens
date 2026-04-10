import React, { useState, useEffect, useContext, useMemo, memo } from 'react';
import { renderSafeMarkdown } from '../../services/safeMarkdown';
import {
  serializeMaterialsToMaiml,
  downloadMaimlFile,
  defaultMaimlFilename,
  parseMaimlToMaterials,
} from '../../services/maiml';
import { Icon, IconName } from '../Icon';
import { Tooltip } from '../Tooltip';
import { Button, Badge, Card, Input, SectionCard } from '../atoms';
import { AppCtx } from '../../context/AppContext';
import { Material, AppContextValue } from '../../types';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

interface AIInsightCardProps {
  children?: React.ReactNode;
  chips?: { label: string; onClick: () => void; }[];
  loading?: boolean;
  subtitle?: string;
}

interface VecCardProps {
  children: React.ReactNode;
  className?: string;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaUp?: boolean;
  color?: string;
}

interface SearchBoxProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

interface MarkdownBubbleProps {
  text: string;
  onSpeak?: (text: string) => void;
}

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  db: Material[];
  filtered: Material[];
}

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (materials: Material[]) => void;
}

interface TypingProps {
  color?: string;
}

export const Modal = ({ open, onClose, title, children, footer, width = 'max-w-lg' }: ModalProps) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 animate-fade-in" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`bg-surface border border-[var(--border-strong)] rounded-xl p-6 ${width} w-full mx-4 max-h-[85vh] overflow-y-auto`} style={{ boxShadow: 'var(--shadow-lg)', animation: 'modalIn .2s ease' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-bold text-text-hi">{title}</h2>
          <Tooltip label="閉じる" placement="top">
            <Button variant="ghost" size="xs" onClick={onClose} aria-label="閉じる"><Icon name="close" size={14} /></Button>
          </Tooltip>
        </div>
        <div className="text-[13px] text-text-md leading-relaxed mb-5">{children}</div>
        {footer && <div className="flex justify-end gap-2">{footer}</div>}
      </div>
      <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
@keyframes fade-in { from { opacity:0 } to { opacity:1 } }`}</style>
    </div>
  );
};

export const ToastHub = () => {
  const { toasts } = useContext(AppCtx) as AppContextValue;
  return (
    <div className="fixed bottom-5 right-5 z-[2000] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="flex items-center gap-2.5 px-4 py-2.5 bg-surface border border-[var(--border-default)] rounded-lg text-[13px] pointer-events-auto" style={{ boxShadow: 'var(--shadow-md)', animation: 'slideIn .24s ease' }}>
          <Icon name={t.type === 'warn' ? 'warning' : t.type === 'info' ? 'info' : 'check'} size={14} className={t.type === 'warn' ? 'text-warn' : t.type === 'info' ? 'text-text-md' : 'text-ok'} />
          <span className="text-text-hi">{t.msg}</span>
        </div>
      ))}
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(14px) } to { opacity:1; transform:translateX(0) } }`}</style>
    </div>
  );
};

export const AIInsightCard = ({ children, chips, loading, subtitle }: AIInsightCardProps) => (
  <div className="relative overflow-hidden rounded-lg border border-[var(--border-default)] p-4 mb-4" style={{ background: 'var(--ai-dim)' }}>
    <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg,transparent,var(--ai-mid),transparent)', backgroundSize: '200%', animation: 'scan 3s ease-in-out infinite' }} />
    <div className="flex items-center gap-2 mb-1">
      <Icon name="spark" size={13} className="text-ai" />
      <span className="text-[11px] font-bold text-ai tracking-[.06em] uppercase">AI インサイト</span>
    </div>
    <p className="text-[11px] text-text-lo mb-2">{subtitle || 'AIが材料データを分析し、要点や注意点をまとめます。'}</p>
    <div className="text-[13px] text-text-md leading-[1.65]">
      {loading ? <Typing /> : children}
    </div>
    {chips && chips.length > 0 && (
      <div className="flex gap-2 mt-2.5 flex-wrap">
        {chips.map((c, i) => (
          <button key={i} onClick={c.onClick} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] bg-surface text-ai border border-[var(--border-default)] hover:bg-ai hover:text-white hover:border-ai transition-all duration-150 font-ui">
            {c.label}
          </button>
        ))}
      </div>
    )}
  </div>
);

const Typing = ({ color = 'var(--ai-col)' }: TypingProps) => (
  <div className="flex items-center gap-1 py-0.5">
    {[0,1,2].map(i => (
      <span key={i} className="w-1 h-1 rounded-full inline-block" style={{ background: color, opacity: .4, animation: `dot 1.3s ease-in-out ${i * .2}s infinite` }} />
    ))}
    <style>{`@keyframes dot{0%,100%{opacity:.2;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}`}</style>
  </div>
);

export const VecCard = ({ children, className = '' }: VecCardProps) => (
  <div className={`border border-[var(--border-default)] rounded-lg p-4 ${className}`} style={{ background: 'var(--vec-dim)' }}>
    <div className="flex items-center gap-2 mb-2.5">
      <Icon name="embed" size={13} className="text-vec" />
      <span className="text-[11px] font-bold text-vec tracking-[.06em] uppercase">ベクトル / Embedding</span>
    </div>
    <div className="text-[13px] text-text-md leading-[1.65]">{children}</div>
  </div>
);

export const KpiCard = ({ label, value, delta, deltaUp, color }: KpiCardProps) => (
  <div className="bg-raised border border-[var(--border-faint)] rounded-md p-3.5">
    <div className="text-[11px] font-semibold text-text-lo tracking-[.04em] uppercase mb-1">{label}</div>
    <div className="text-2xl font-bold tracking-tight leading-none" style={color ? { color } : {}}>{value}</div>
    {delta && <div className={`text-[12px] mt-1 ${deltaUp === false ? 'text-err' : deltaUp ? 'text-ok' : 'text-vec'}`}>{delta}</div>}
  </div>
);

export const SearchBox = ({ value, onChange, placeholder = '検索...', className = '' }: SearchBoxProps) => (
  <div className={`relative flex-1 ${className}`}>
    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-lo pointer-events-none"><Icon name="search" size={14} /></span>
    <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="pl-8" />
  </div>
);

export const FilterChip = ({ label, onRemove }: FilterChipProps) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] bg-accent-dim text-accent border border-[var(--border-default)]">
    {label}
    <button onClick={onRemove} className="opacity-60 hover:opacity-100 ml-0.5" aria-label={`${label} を削除`}><Icon name="close" size={10} /></button>
  </span>
);

// React.memo keeps long RAG chat logs performant by skipping re-renders of
// every previous bubble whenever a new message streams in. MarkdownBubble
// is expensive (marked + DOMPurify on every render) so the win compounds.
// Props are primitive or stable-reference, so the default shallow-compare
// is enough — no custom equality function needed.
export const MarkdownBubble = memo(function MarkdownBubble({ text, onSpeak }: MarkdownBubbleProps) {
  const [copied, setCopied] = useState(false);
  const html = useMemo(() => renderSafeMarkdown(text), [text]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(text);
    a.download = `matlens-ai-${Date.now()}.txt`; a.click();
  };

  return (
    <div>
      <div className="md-preview" dangerouslySetInnerHTML={{ __html: html }} />
      <div className="flex gap-1.5 mt-2 flex-wrap">
        <button onClick={handleCopy} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] border transition-all duration-150 font-ui ${copied ? 'text-ok border-ok bg-[var(--ok-dim)]' : 'text-text-lo border-[var(--border-faint)] hover:text-text-hi hover:bg-hover'}`}>
          <Icon name="copy" size={11} />{copied ? 'コピー済み' : 'コピー'}
        </button>
        {onSpeak && (
          <Tooltip label="テキストを音声で読み上げる" placement="top">
            <button onClick={() => onSpeak(text)} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] border border-[var(--border-faint)] text-text-lo hover:text-text-hi hover:bg-hover transition-all duration-150 font-ui">
              <Icon name="speaker" size={11} />読み上げ
            </button>
          </Tooltip>
        )}
        <Tooltip label="テキストをファイルに保存" placement="top">
          <button onClick={handleDownload} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] border border-[var(--border-faint)] text-text-lo hover:text-text-hi hover:bg-hover transition-all duration-150 font-ui">
            <Icon name="download" size={11} />保存
          </button>
        </Tooltip>
      </div>
    </div>
  );
});

export const ExportModal = ({ open, onClose, db, filtered }: ExportModalProps) => {
  const exportCSV = () => {
    const h = ['ID','名称','カテゴリ','硬度HV','引張MPa','弾性GPa','組成','バッチ','登録日','ステータス','備考'];
    const rows = filtered.map(r => [r.id,`"${r.name}"`,r.cat,r.hv,r.ts,r.el,`"${r.comp}"`,r.batch,r.date,r.status,`"${r.memo||''}"`]);
    const csv = [h,...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,\uFEFF'+encodeURIComponent(csv);
    a.download = `matdb_${new Date().toISOString().slice(0,10)}.csv`; a.click(); onClose();
  };
  const exportJSON = () => {
    const a = document.createElement('a');
    a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({exported:new Date().toISOString(),count:db.length,data:db},null,2));
    a.download = `matdb_${new Date().toISOString().slice(0,10)}.json`; a.click(); onClose();
  };
  const exportPDF = () => {
    const rows = db.map(r => `<tr><td>${r.id}</td><td>${r.name}</td><td>${r.cat}</td><td>${r.hv}</td><td>${r.ts}</td><td>${r.status}</td></tr>`).join('');
    const win = window.open('','_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8"><title>Matlens レポート</title><style>body{font-family:sans-serif;font-size:11px;padding:20px}h1{font-size:16px;margin-bottom:4px}.meta{color:#666;font-size:11px;margin-bottom:16px}table{width:100%;border-collapse:collapse}th{background:#1e3050;color:#fff;padding:6px 8px;text-align:left;font-size:10px}td{padding:5px 8px;border-bottom:1px solid #e0e0e0;font-size:10px}tr:nth-child(even) td{background:#f7f7f5}</style></head><body><h1>Matlens 材料データレポート</h1><div class="meta">出力: ${new Date().toLocaleString('ja-JP')} ／ 総件数: ${db.length}件</div><table><thead><tr><th>ID</th><th>名称</th><th>カテゴリ</th><th>硬度HV</th><th>引張MPa</th><th>ステータス</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
    win.document.close(); setTimeout(() => win.print(), 400); onClose();
  };
  const exportMaiML = () => {
    const xml = serializeMaterialsToMaiml(filtered.length > 0 ? filtered : db);
    downloadMaimlFile(xml, defaultMaimlFilename('matlens'));
    onClose();
  };
  const exportMaiMLAll = () => {
    const xml = serializeMaterialsToMaiml(db);
    downloadMaimlFile(xml, `matlens_all_${new Date().toISOString().slice(0, 10)}.maiml`);
    onClose();
  };
  const exportMarkdown = () => {
    const rows = filtered.map(r => `| ${r.id} | ${r.name} | ${r.cat} | ${r.hv} | ${r.ts} | ${r.comp} | ${r.status} |`).join('\n');
    const md = `# Matlens 材料データ\n\n出力日時: ${new Date().toLocaleString('ja-JP')}  \n件数: ${filtered.length}件\n\n| ID | 名称 | カテゴリ | 硬度HV | 引張MPa | 組成 | ステータス |\n| --- | --- | --- | --- | --- | --- | --- |\n${rows}\n`;
    const a = document.createElement('a');
    a.href = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md);
    a.download = `matdb_${new Date().toISOString().slice(0, 10)}.md`; a.click(); onClose();
  };

  // MaiML is the platform's primary data format (JIS K 0200:2024), so it is
  // rendered first and visually promoted as the recommended option. The
  // secondary formats remain available for legacy tooling and ad-hoc sharing.
  const primary = {
    label: 'MaiML（推奨）',
    desc: 'JIS K 0200:2024 共通フォーマット — 他システム連携の基盤',
    action: exportMaiML,
  };
  const secondary: { icon: IconName; label: string; desc: string; action: () => void }[] = [
    { icon: 'report', label: 'MaiML（全件）', desc: 'DB全件を MaiML で出力', action: exportMaiMLAll },
    { icon: 'csv', label: 'CSV', desc: 'Excel で開けるCSV形式', action: exportCSV },
    { icon: 'json', label: 'JSON', desc: 'システム連携用JSON', action: exportJSON },
    { icon: 'report', label: 'Markdown', desc: 'ドキュメント共有用', action: exportMarkdown },
    { icon: 'pdf', label: 'PDF レポート', desc: '印刷用フルレポート', action: exportPDF },
  ];

  return (
    <Modal open={open} onClose={onClose} title="データエクスポート" footer={<Button variant="default" onClick={onClose}>閉じる</Button>}>
      <div className="flex flex-col gap-3">
        <button
          onClick={primary.action}
          className="flex items-center gap-3 p-4 rounded-md border-2 border-accent bg-accent-dim hover:bg-hover transition-all duration-150 text-left font-ui"
        >
          <div className="w-10 h-10 rounded-md bg-accent text-white flex items-center justify-center flex-shrink-0">
            <Icon name="embed" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-[14px] font-bold text-text-hi">{primary.label}</div>
              <Badge variant="blue" className="text-[10px]">PRIMARY</Badge>
            </div>
            <div className="text-[12px] text-text-md mt-0.5">{primary.desc}</div>
          </div>
        </button>
        <div className="grid grid-cols-2 gap-2.5">
          {secondary.map(item => (
            <button key={item.label} onClick={item.action} className="flex flex-col items-center gap-2 p-3 bg-raised border border-[var(--border-default)] rounded-md cursor-pointer hover:border-accent hover:bg-hover transition-all duration-150 text-center font-ui">
              <Icon name={item.icon} size={20} className="text-text-md" />
              <div>
                <div className="text-[12px] font-bold text-text-hi">{item.label}</div>
                <div className="text-[11px] text-text-lo mt-0.5">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};

// MaiML / JSON / CSV ファイルをアップロードして Material[] として返すモーダル。
// 親側 (MaterialListPage など) は onImport で dispatch し DB に反映する。
export const ImportModal = ({ open, onClose, onImport }: ImportModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [parsed, setParsed] = useState<Material[] | null>(null);
  const [filename, setFilename] = useState<string>('');

  const reset = () => {
    setError(null);
    setWarnings([]);
    setPreviewCount(null);
    setParsed(null);
    setFilename('');
  };

  const handleFile = async (file: File) => {
    reset();
    setFilename(file.name);
    const text = await file.text();
    const lower = file.name.toLowerCase();
    try {
      if (lower.endsWith('.maiml') || lower.endsWith('.xml') || text.trim().startsWith('<')) {
        const result = parseMaimlToMaterials(text);
        setParsed(result.materials);
        setPreviewCount(result.materials.length);
        setWarnings(result.warnings);
        return;
      }
      if (lower.endsWith('.json') || text.trim().startsWith('{')) {
        const json = JSON.parse(text);
        const list: Material[] = Array.isArray(json) ? json : (json.data ?? []);
        setParsed(list);
        setPreviewCount(list.length);
        return;
      }
      setError('対応していないファイル形式です（.maiml / .xml / .json を選択してください）');
    } catch (e) {
      setError(`読み込みエラー: ${(e as Error).message}`);
    }
  };

  const handleConfirm = () => {
    if (!parsed || parsed.length === 0) return;
    onImport(parsed);
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="データインポート"
      footer={
        <>
          <Button variant="default" onClick={() => { reset(); onClose(); }}>キャンセル</Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!parsed || parsed.length === 0}>
            <Icon name="upload" size={12} />{previewCount ? `${previewCount}件を取り込む` : '取り込む'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3 p-3 rounded-md border-2 border-accent bg-accent-dim">
          <div className="w-10 h-10 rounded-md bg-accent text-white flex items-center justify-center flex-shrink-0">
            <Icon name="embed" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="text-[14px] font-bold text-text-hi">MaiML（推奨）</div>
              <Badge variant="blue" className="text-[10px]">PRIMARY</Badge>
            </div>
            <div className="text-[12px] text-text-md mt-0.5">JIS K 0200:2024 共通フォーマットを優先的にサポート</div>
          </div>
        </div>

        <label className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-[var(--border-default)] rounded-md cursor-pointer hover:border-accent hover:bg-hover transition-all">
          <Icon name="upload" size={24} className="text-text-md" />
          <div className="text-[13px] font-semibold text-text-hi">ファイルを選択</div>
          <div className="text-[11px] text-text-lo">.maiml / .xml / .json 対応</div>
          <input
            type="file"
            accept=".maiml,.xml,.json,application/xml,text/xml,application/json"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>

        {filename && !error && (
          <div className="text-[12px] text-text-md">
            読み込みファイル: <strong className="font-mono">{filename}</strong>
          </div>
        )}
        {previewCount !== null && (
          <div className="text-[12px] p-2 rounded bg-[var(--ok-dim)] text-ok border border-[var(--ok)]">
            {previewCount} 件の材料データを検出しました
          </div>
        )}
        {warnings.length > 0 && (
          <div className="text-[11px] p-2 rounded bg-[var(--warn-dim)] text-warn border border-[var(--warn)]">
            <div className="font-bold mb-1">警告 ({warnings.length})</div>
            {warnings.slice(0, 5).map((w, i) => <div key={i}>• {w}</div>)}
            {warnings.length > 5 && <div>…他 {warnings.length - 5} 件</div>}
          </div>
        )}
        {error && (
          <div className="text-[12px] p-2 rounded bg-[var(--err-dim)] text-err border border-[var(--err)]">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
};
