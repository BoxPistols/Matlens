import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DueTimeline } from './DueTimeline';

describe('DueTimeline', () => {
  const NOW = new Date('2026-04-15T00:00:00+09:00');

  it('納期未超過では「残り N 日」を表示', () => {
    render(
      <DueTimeline
        startedAt="2026-04-01"
        dueAt="2026-04-20"
        completedAt={null}
        now={NOW}
      />,
    );
    expect(screen.getByRole('img', { name: '納期タイムライン' })).toBeInTheDocument();
    // 残 5 日（04-15 → 04-20）
    expect(screen.getByText('残り 5 日')).toBeInTheDocument();
  });

  it('納期超過では「納期超過 N 日」を表示', () => {
    render(
      <DueTimeline
        startedAt="2026-03-01"
        dueAt="2026-04-10"
        completedAt={null}
        now={NOW}
      />,
    );
    expect(screen.getByText('納期超過 5 日')).toBeInTheDocument();
  });

  it('completedAt がある場合は残日数表示は出さない', () => {
    render(
      <DueTimeline
        startedAt="2026-03-01"
        dueAt="2026-04-20"
        completedAt="2026-04-10"
        now={NOW}
      />,
    );
    expect(screen.queryByText(/残り.*日/)).not.toBeInTheDocument();
    expect(screen.queryByText(/納期超過/)).not.toBeInTheDocument();
  });

  it('startedAt が解釈不能なら「開始日情報なし」を表示', () => {
    render(
      <DueTimeline
        startedAt="invalid"
        dueAt="2026-04-20"
        completedAt={null}
        now={NOW}
      />,
    );
    expect(screen.getByText('開始日情報なし')).toBeInTheDocument();
  });

  it('dueAt が null でもレンダリングできる（開始日以降のバーのみ描画）', () => {
    render(
      <DueTimeline
        startedAt="2026-03-01"
        dueAt={null}
        completedAt={null}
        now={NOW}
      />,
    );
    expect(screen.getByRole('img', { name: '納期タイムライン' })).toBeInTheDocument();
    // 残日数表示は出ない（dueAt なし）
    expect(screen.queryByText(/残り.*日/)).not.toBeInTheDocument();
  });
});
