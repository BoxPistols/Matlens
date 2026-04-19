import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectStatusPill, projectStatusLabel } from './ProjectStatusPill';

describe('ProjectStatusPill', () => {
  it('日本語ラベルを表示する', () => {
    render(<ProjectStatusPill status="in_progress" />);
    expect(screen.getByText('進行中')).toBeInTheDocument();
  });

  it('projectStatusLabel は各ステータスに対応するラベルを返す', () => {
    expect(projectStatusLabel('inquiry')).toBe('問合せ');
    expect(projectStatusLabel('completed')).toBe('完了');
    expect(projectStatusLabel('archived')).toBe('アーカイブ');
  });
});
