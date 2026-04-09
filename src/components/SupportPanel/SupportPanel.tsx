import { useState, useContext } from 'react';
import { Icon, IconName } from '../Icon';
import { Button, Badge, Input, FormGroup, Divider, ProgressBar } from '../atoms';
import { AppCtx } from '../../context/AppContext';
import { PROVIDERS, SUPPORT_TABS, FAQ_ITEMS } from '../../data/constants';
import type { AIHook, AppContextValue } from '../../types';

interface SupportPanelProps {
  ai: AIHook;
  visible: boolean;
  onClose: () => void;
  onNav: (page: string) => void;
}

export const SupportPanel = ({ ai, visible, onClose, onNav }: SupportPanelProps) => {
  const [tab, setTab] = useState('help');
  const [keyInput, setKeyInput] = useState(ai.ownKey ? '••••••••' : '');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const { addToast } = useContext(AppCtx) as AppContextValue;

  const runConnectionTest = async () => {
    setTestStatus('testing');
    setTestMessage('');
    try {
      const result = await ai.call('接続テスト：「OK」とだけ返してください。');
      if (result.includes('ローカル開発モード') || result.includes('デモ応答')) {
        setTestStatus('error');
        setTestMessage('APIキーが未設定です。.env.local にキーを追加するか、上のフォームからキーを設定してください。');
      } else if (result.includes('エラー') || result.includes('error')) {
        setTestStatus('error');
        setTestMessage(result);
      } else {
        setTestStatus('ok');
        setTestMessage(`${ai.providerDef.label} — 接続成功`);
      }
    } catch {
      setTestStatus('error');
      setTestMessage('接続に失敗しました');
    }
  };
  if (!visible) return null;

  const { rateInfo, hasOwnKey } = ai;

  return (
    <div className="fixed bottom-20 right-6 z-[2500] w-[340px] max-h-[70vh] bg-surface border border-[var(--border-default)] rounded-xl flex flex-col overflow-hidden" style={{boxShadow:'var(--shadow-lg)'}}>
      <div className="flex items-center justify-between px-4 pt-3 pb-2 flex-shrink-0">
        <div className="text-[14px] font-bold">サポート</div>
        <button onClick={onClose} className="text-text-lo hover:text-text-hi"><Icon name="close" size={14}/></button>
      </div>
      <div className="flex border-b border-[var(--border-faint)] px-4 gap-1 flex-shrink-0">
        {SUPPORT_TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1 px-3 py-2 text-[12px] font-semibold border-b-2 transition-all font-ui ${tab === t.id ? 'border-accent text-accent' : 'border-transparent text-text-lo hover:text-text-md'}`}>
            <Icon name={t.icon as IconName} size={12} />{t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {tab === 'help' && (
          <div className="flex flex-col gap-3">
            <div className="text-[13px] text-text-md leading-relaxed"><strong className="text-text-hi">Matlens</strong> は材料研究者・実験担当者向けのデータ管理システムです。</div>
            <div className="flex flex-col gap-1.5">
              {[{icon:'dashboard',label:'ダッシュボード',desc:'KPI・グラフで全体を把握',page:'dash'},{icon:'list',label:'材料データ一覧',desc:'登録・フィルタ・一括操作',page:'list'},{icon:'vecSearch',label:'ベクトル検索',desc:'AIで意味的に類似材料を検索',page:'vsearch'},{icon:'rag',label:'RAG チャット',desc:'データを元にAIが回答',page:'rag'},{icon:'similar',label:'類似材料探索',desc:'材料間の類似度を比較',page:'sim'}].map(item => (
                <button key={item.page} onClick={() => { onNav(item.page); onClose(); }}
                  className="flex items-start gap-2.5 p-2.5 rounded-md border border-[var(--border-faint)] bg-raised hover:bg-hover hover:border-accent transition-all text-left">
                  <Icon name={item.icon as IconName} size={14} className="text-accent mt-0.5 flex-shrink-0" />
                  <div><div className="text-[12px] font-semibold text-text-hi">{item.label}</div><div className="text-[11px] text-text-lo">{item.desc}</div></div>
                </button>
              ))}
            </div>
            <Divider />
            <div className="flex gap-2">
              <Button variant="default" size="sm" onClick={() => { onNav('help'); onClose(); }}><Icon name="help" size={11} />詳細ヘルプ</Button>
              <Button variant="default" size="sm" onClick={() => { onNav('about'); onClose(); }}><Icon name="about" size={11} />技術スタック</Button>
            </div>
          </div>
        )}
        {tab === 'faq' && (
          <div className="flex flex-col gap-1.5">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="border border-[var(--border-faint)] rounded-md overflow-hidden">
                <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="flex items-center gap-2 w-full px-3 py-2.5 text-left text-[12px] font-semibold text-text-hi hover:bg-hover transition-all">
                  <Icon name={expandedFaq === i ? 'sort' : 'plus'} size={11} className="text-accent flex-shrink-0" />
                  <span className="flex-1">{item.q}</span>
                </button>
                {expandedFaq === i && <div className="px-3 pb-3 text-[12px] text-text-md leading-relaxed border-t border-[var(--border-faint)] pt-2 bg-raised">{item.a}</div>}
              </div>
            ))}
          </div>
        )}
        {tab === 'ai' && (
          <div className="flex flex-col gap-3">
            {!hasOwnKey && rateInfo.limit !== null && (
              <div className="bg-raised rounded p-3 border border-[var(--border-faint)]">
                <div className="flex justify-between text-[12px] mb-1.5">
                  <span className="text-text-md">本日の残り回数</span>
                  <span className={`font-bold font-mono ${rateInfo.remaining! < 5 ? 'text-err' : rateInfo.remaining! < 10 ? 'text-warn' : 'text-ok'}`}>{rateInfo.remaining}/{rateInfo.limit}</span>
                </div>
                <ProgressBar value={Math.round((rateInfo.remaining! / rateInfo.limit!) * 100)} color={rateInfo.remaining! < 5 ? 'var(--err)' : rateInfo.remaining! < 10 ? 'var(--warn)' : 'var(--ok)'} />
                <p className="text-[11px] text-text-lo mt-1.5">無料枠（{rateInfo.limit}回/日）</p>
              </div>
            )}
            {hasOwnKey && <div className="bg-[var(--ok-dim)] rounded p-3 border border-[var(--border-faint)]"><div className="text-[12px] text-ok font-semibold">自分のAPIキー設定済み — 無制限</div></div>}
            <FormGroup label="AIプロバイダ" className="mb-0">
              <div className="flex flex-col gap-1.5">
                {PROVIDERS.map(p => {
                  const disabled = p.requiresKey && !hasOwnKey;
                  return (
                    <button key={p.id} onClick={() => !disabled && ai.setProvider(p.id)} disabled={disabled}
                      className={`flex items-center gap-2 px-3 py-2 rounded border transition-all text-[12px] text-left font-ui ${ai.provider === p.id ? 'border-accent bg-accent-dim text-accent' : disabled ? 'border-[var(--border-faint)] bg-raised text-text-lo opacity-50 cursor-not-allowed' : 'border-[var(--border-default)] bg-raised text-text-md hover:bg-hover'}`}>
                      <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${ai.provider === p.id ? 'border-accent bg-accent' : 'border-text-lo'}`} />
                      <span className="font-semibold flex-1">{p.label}</span>
                      {p.free && <Badge variant="green" className="text-[10px]">無料</Badge>}
                      {p.requiresKey && <Badge variant={hasOwnKey ? 'blue' : 'gray'} className="text-[10px]">{hasOwnKey ? '有効' : '要キー'}</Badge>}
                    </button>
                  );
                })}
              </div>
            </FormGroup>
            <FormGroup label="OpenAI APIキー（無制限 + mini解放）">
              <div className="flex gap-1.5">
                <Input value={keyInput} onChange={e => setKeyInput(e.target.value)}
                  onFocus={() => { if (keyInput === '••••••••') setKeyInput(''); }}
                  placeholder="sk-..." type="password" className="flex-1 text-[12px]" />
                <Button variant="default" size="sm" onClick={() => {
                  const key = keyInput === '••••••••' ? ai.ownKey : keyInput;
                  ai.setOwnKey(key);
                  addToast(key ? 'APIキー設定済み（無制限）' : 'キー削除');
                  if (key) setKeyInput('••••••••');
                }}>保存</Button>
                {hasOwnKey && <Button variant="ghost" size="sm" onClick={() => { ai.setOwnKey(''); setKeyInput(''); addToast('キー削除'); }}>削除</Button>}
              </div>
              <p className="text-[11px] text-text-lo mt-1">キーはlocalStorage保存。共用PCでは削除推奨。</p>
            </FormGroup>
            <Divider />
            <div>
              <Button variant="default" size="sm" onClick={runConnectionTest} disabled={testStatus === 'testing'} className="w-full">
                <Icon name={testStatus === 'testing' ? 'refresh' : testStatus === 'ok' ? 'check' : testStatus === 'error' ? 'warning' : 'scan'} size={12} />
                {testStatus === 'testing' ? 'テスト中...' : '接続テスト（現状確認）'}
              </Button>
              {testStatus !== 'idle' && testStatus !== 'testing' && (
                <div className={`mt-1.5 text-[11px] px-2 py-1.5 rounded border ${testStatus === 'ok' ? 'bg-[var(--ok-dim)] border-[var(--ok)] text-ok' : 'bg-[var(--err-dim)] border-[var(--err)] text-err'}`}>
                  {testMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
