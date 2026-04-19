// 汎用 fetch ラッパー（REST実装のRepositoryから利用）

import { ApiError, AuthError, NetworkError } from './errors';

interface RequestOptions {
  params?: Record<string, string | number | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

// TODO(auth): PoC 用の簡易 localStorage 保管。本番では XSS 耐性のため
// HttpOnly Cookie + CSRF 対策、もしくは短命トークン + refresh へ移行する。
const TOKEN_STORAGE_KEY = 'matlens_token';

class ApiClient {
  constructor(private baseURL: string) {}

  private getToken(): string | null {
    try {
      return typeof localStorage !== 'undefined'
        ? localStorage.getItem(TOKEN_STORAGE_KEY)
        : null;
    } catch {
      return null;
    }
  }

  private buildURL(path: string, params?: RequestOptions['params']): string {
    const absoluteBase =
      this.baseURL.startsWith('http://') || this.baseURL.startsWith('https://')
        ? this.baseURL
        : `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost'}${this.baseURL}`;
    // URL 解決仕様上、baseURL 末尾は必ず "/"、path 先頭の "/" は剥がす
    const base = absoluteBase.endsWith('/') ? absoluteBase : `${absoluteBase}/`;
    const relPath = path.startsWith('/') ? path.slice(1) : path;
    const url = new URL(relPath, base);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined) url.searchParams.append(k, String(v));
      });
    }
    return url.toString();
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    let response: Response;
    try {
      response = await fetch(this.buildURL(path, options?.params), {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: options?.signal,
      });
    } catch (e) {
      throw new NetworkError(e instanceof Error ? e.message : 'network error');
    }

    if (!response.ok) {
      if (response.status === 401) throw new AuthError('Unauthorized');
      const errorBody: unknown = await response.json().catch(() => ({}));
      const message =
        (typeof errorBody === 'object' && errorBody && 'message' in errorBody
          ? String((errorBody as { message?: unknown }).message ?? '')
          : '') || response.statusText;
      throw new ApiError(response.status, message, errorBody);
    }

    if (response.status === 204) return undefined as T;
    // 空ボディ（200/201 でも起こり得る）で JSON.parse 例外を避けるため text 経由でパース
    const text = await response.text();
    return (text ? (JSON.parse(text) as T) : (undefined as T));
  }

  get<T>(path: string, options?: RequestOptions) {
    return this.request<T>('GET', path, undefined, options);
  }
  post<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>('POST', path, body, options);
  }
  patch<T>(path: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>('PATCH', path, body, options);
  }
  delete<T>(path: string, options?: RequestOptions) {
    return this.request<T>('DELETE', path, undefined, options);
  }
}

const DEFAULT_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api/v1';

export const apiClient = new ApiClient(DEFAULT_BASE);
