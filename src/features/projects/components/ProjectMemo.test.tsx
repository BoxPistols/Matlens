import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ProjectMemo } from './ProjectMemo';

// vitest + @storybook/addon-vitest 由来の localStorage はテスト環境では使えないため、
// useTheme テストと同じパターンで in-memory stub を差し込む。
function createLocalStorageStub() {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      for (const k of Object.keys(store)) delete store[k];
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
}

describe('ProjectMemo', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: createLocalStorageStub(),
      writable: true,
      configurable: true,
    });
  });

  it('保存されたメモがない場合は空メッセージとメモを書くボタンを表示する', () => {
    render(<ProjectMemo projectId="prj-1" />);
    expect(screen.getByText(/まだメモはありません/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'メモを書く' })).toBeInTheDocument();
  });

  it('localStorage に保存済みのメモを表示する', () => {
    window.localStorage.setItem(
      'project-memo-prj-1',
      JSON.stringify({ text: '## 重要\n顧客から連絡', updatedAt: '2026-04-20T10:00:00.000Z' }),
    );
    render(<ProjectMemo projectId="prj-1" />);
    expect(screen.getByRole('heading', { level: 2, name: '重要' })).toBeInTheDocument();
    expect(screen.getByText('顧客から連絡')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '編集' })).toBeInTheDocument();
  });

  it('編集モードで保存すると localStorage に書き込まれ、表示モードに戻る', () => {
    render(<ProjectMemo projectId="prj-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'メモを書く' }));

    const textarea = screen.getByLabelText('案件メモ編集領域') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '# Hello' } });
    fireEvent.click(screen.getByRole('button', { name: '保存' }));

    expect(screen.getByRole('heading', { level: 1, name: 'Hello' })).toBeInTheDocument();
    const stored = window.localStorage.getItem('project-memo-prj-1');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored as string);
    expect(parsed.text).toBe('# Hello');
    expect(parsed.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('キャンセルすると編集内容は破棄される', () => {
    window.localStorage.setItem(
      'project-memo-prj-1',
      JSON.stringify({ text: 'original', updatedAt: '2026-04-20T10:00:00.000Z' }),
    );
    render(<ProjectMemo projectId="prj-1" />);
    fireEvent.click(screen.getByRole('button', { name: '編集' }));

    const textarea = screen.getByLabelText('案件メモ編集領域') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'changed' } });
    fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }));

    expect(screen.getByText('original')).toBeInTheDocument();
    const stored = JSON.parse(window.localStorage.getItem('project-memo-prj-1') as string);
    expect(stored.text).toBe('original');
  });

  it('projectId が変わると別キーのメモを読み込む', () => {
    window.localStorage.setItem(
      'project-memo-prj-1',
      JSON.stringify({ text: 'memo for prj-1', updatedAt: '2026-04-20T10:00:00.000Z' }),
    );
    window.localStorage.setItem(
      'project-memo-prj-2',
      JSON.stringify({ text: 'memo for prj-2', updatedAt: '2026-04-20T10:00:00.000Z' }),
    );
    const { rerender } = render(<ProjectMemo projectId="prj-1" />);
    expect(screen.getByText('memo for prj-1')).toBeInTheDocument();
    rerender(<ProjectMemo projectId="prj-2" />);
    expect(screen.getByText('memo for prj-2')).toBeInTheDocument();
  });
});
