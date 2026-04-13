import type { Provider } from '../types';

export const PROVIDERS: Provider[] = [
  { id: 'openai-nano',  label: 'GPT-5.4 nano',    model: 'gpt-5.4-nano',  free: true },
  { id: 'gemini-flash', label: 'Gemini 2.5 Flash', model: 'gemini-2.5-flash', free: true },
  { id: 'openai-mini',  label: 'GPT-5.4 mini',    model: 'gpt-5.4-mini',  free: false, requiresKey: true },
];

export const RATE_LIMITS: Record<string, number> = {
  'public': 20,
  'invited': 30,
  'own-key': Infinity,
};

export const OWN_KEY_STORAGE = 'matlens_own_openai_key';
