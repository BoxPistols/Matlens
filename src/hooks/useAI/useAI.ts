import { useState, useEffect, useCallback } from 'react';
import { PROVIDERS, OWN_KEY_STORAGE } from '../../data/constants';
import type { AIHook, Provider, RateInfo } from '../../types';

const isDev = import.meta.env.DEV;

function loadOwnKey(): string { try { return localStorage.getItem(OWN_KEY_STORAGE) || ''; } catch(e) { return ''; } }
function saveOwnKey(k: string): void { try { if (k) localStorage.setItem(OWN_KEY_STORAGE, k); else localStorage.removeItem(OWN_KEY_STORAGE); } catch(e) {} }

function devFallback(prompt: string): string {
  const trimmed = prompt.slice(0, 120) + (prompt.length > 120 ? '...' : '');
  return `### ローカル開発モード\n\nAPI サーバー（Vercel Functions）に接続できないため、デモ応答を表示しています。\n\n本番環境（Vercel）へのデプロイ、またはAPIキーを設定すると、AIによる実際の回答が得られます。\n\n---\n\n受信したプロンプト:\n\n> ${trimmed}`;
}

export function useAI(): AIHook {
  const [provider, setProvider] = useState<string>('openai-nano');
  const [ownKey, setOwnKeyState] = useState<string>(loadOwnKey);
  const [rateInfo, setRateInfo] = useState<RateInfo>({ remaining: null, limit: null });
  const providerDef = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];
  const hasOwnKey = !!ownKey;

  useEffect(() => {
    fetch('/api/ai').then(r => r.json()).then(d => setRateInfo({ remaining: d.remaining, limit: d.limit })).catch(() => {
      if (isDev) setRateInfo({ remaining: 30, limit: 30 });
    });
  }, []);

  const setOwnKey = useCallback((key: string) => {
    saveOwnKey(key);
    setOwnKeyState(key);
    if (key) setProvider('openai-mini');
    else if (provider === 'openai-mini') setProvider('openai-nano');
  }, [provider]);

  const call = useCallback(async (prompt: string, system?: string): Promise<string> => {
    const sys = system || 'あなたは材料科学の専門家AIアシスタントです。Matlens に組み込まれています。Markdown形式で簡潔・実用的な日本語で回答してください。';

    if (hasOwnKey && (provider === 'openai-mini' || provider === 'openai-nano')) {
      try {
        const model = provider === 'openai-mini' ? 'gpt-4.1-mini' : 'gpt-4.1-nano';
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ownKey}` },
          body: JSON.stringify({ model, max_tokens: 1000, messages: [{ role: 'system', content: sys }, { role: 'user', content: prompt }] })
        });
        const d = await res.json();
        if (d.error) return `OpenAI エラー: ${d.error.message}`;
        return d.choices?.[0]?.message?.content || '応答を取得できませんでした。';
      } catch (e) { return `API接続エラー: ${(e as Error).message}`; }
    }

    const effectiveProvider = provider === 'gemini-flash' ? 'gemini' : provider;
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: effectiveProvider, prompt, system })
      });
      const d = await res.json();
      if (d.remaining !== undefined) setRateInfo({ remaining: d.remaining, limit: d.limit });
      if (d.error) {
        // Dev mode: server has no API key configured — show fallback
        if (isDev) return devFallback(prompt);
        return `APIエラー: ${d.error}`;
      }
      return d.text || '応答を取得できませんでした。';
    } catch (e) {
      if (isDev) return devFallback(prompt);
      return `API接続エラー: ${(e as Error).message}`;
    }
  }, [provider, hasOwnKey, ownKey]);

  return { call, provider, setProvider, providerDef, providers: PROVIDERS, hasOwnKey, ownKey, setOwnKey, rateInfo };
}
