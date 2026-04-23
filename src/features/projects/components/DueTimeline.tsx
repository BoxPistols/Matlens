// 納期タイムライン。純 SVG で startedAt → 今日 → dueAt の位置関係を可視化。
// ADR-009 純 SVG 方針。

interface DueTimelineProps {
  startedAt: string; // YYYY-MM-DD or ISO
  dueAt: string | null;
  completedAt: string | null;
  now?: Date;
}

const parseDate = (s: string | null | undefined): Date | null => {
  if (!s) return null;
  const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(s);
  const d = new Date(isoDateOnly ? `${s}T00:00:00+09:00` : s);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const DueTimeline = ({ startedAt, dueAt, completedAt, now }: DueTimelineProps) => {
  const start = parseDate(startedAt);
  const due = parseDate(dueAt);
  const completed = parseDate(completedAt);
  const today = now ?? new Date();

  if (!start) {
    return (
      <div className="text-[12px] text-[var(--text-lo)]">開始日情報なし</div>
    );
  }

  // 全体レンジ: start 〜 (due または completed または today のうち最新)
  const endRef = [due, completed, today].filter((d): d is Date => d !== null).sort(
    (a, b) => b.getTime() - a.getTime()
  )[0]!;
  const totalMs = endRef.getTime() - start.getTime();
  if (totalMs <= 0) {
    return (
      <div className="text-[12px] text-[var(--text-lo)]">
        タイムラインの表示に必要な期間情報が不足しています
      </div>
    );
  }

  const width = 640;
  const height = 80;
  const barY = 40;
  const barHeight = 10;
  const barLeft = 40;
  const barRight = width - 40;
  const barWidth = barRight - barLeft;

  const posFor = (d: Date) => {
    const ratio = Math.max(0, Math.min(1, (d.getTime() - start.getTime()) / totalMs));
    return barLeft + ratio * barWidth;
  };

  const todayX = posFor(today);
  const dueX = due ? posFor(due) : null;
  const completedX = completed ? posFor(completed) : null;

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysLeft = due
    ? Math.floor((due.getTime() - today.getTime()) / msPerDay)
    : null;
  const overdue = daysLeft !== null && daysLeft < 0;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="納期タイムライン"
      className="max-w-full h-auto"
    >
      <title>納期タイムライン</title>

      {/* 背景バー（経過期間） */}
      <rect
        x={barLeft}
        y={barY}
        width={barWidth}
        height={barHeight}
        rx={barHeight / 2}
        fill="var(--border-faint,#e5e7eb)"
      />

      {/* 経過部（start → today） */}
      <rect
        x={barLeft}
        y={barY}
        width={Math.max(0, todayX - barLeft)}
        height={barHeight}
        rx={barHeight / 2}
        fill="var(--accent,#2563eb)"
        opacity={0.8}
      />

      {/* 開始マーカー */}
      <g>
        <circle cx={barLeft} cy={barY + barHeight / 2} r={5} fill="var(--accent,#2563eb)" />
        <text
          x={barLeft}
          y={barY - 8}
          fontSize={10}
          fill="var(--text-lo)"
          textAnchor="start"
        >
          開始 {formatDate(start)}
        </text>
      </g>

      {/* 今日マーカー */}
      <g>
        <line
          x1={todayX}
          x2={todayX}
          y1={barY - 6}
          y2={barY + barHeight + 6}
          stroke="var(--ok,#22c55e)"
          strokeWidth={2}
        />
        <text
          x={todayX}
          y={barY + barHeight + 20}
          fontSize={10}
          fill="var(--ok,#22c55e)"
          textAnchor="middle"
          fontWeight={600}
        >
          今日
        </text>
      </g>

      {/* 納期マーカー */}
      {due && dueX !== null && (
        <g>
          <circle
            cx={dueX}
            cy={barY + barHeight / 2}
            r={6}
            fill={overdue ? 'var(--err,#dc2626)' : 'var(--warn,#d97706)'}
            stroke="var(--bg-raised,#fff)"
            strokeWidth={2}
          />
          <text
            x={dueX}
            y={barY - 8}
            fontSize={10}
            fill={overdue ? 'var(--err,#dc2626)' : 'var(--warn,#d97706)'}
            textAnchor="end"
            fontWeight={600}
          >
            納期 {formatDate(due)}
          </text>
        </g>
      )}

      {/* 完了マーカー */}
      {completed && completedX !== null && (
        <g>
          <rect
            x={completedX - 5}
            y={barY - 1}
            width={10}
            height={barHeight + 2}
            fill="var(--ok,#22c55e)"
            stroke="var(--bg-raised,#fff)"
            strokeWidth={1}
          />
        </g>
      )}

      {/* 残日数 / 遅延日数テキスト */}
      {daysLeft !== null && !completed && (
        <text
          x={width / 2}
          y={height - 6}
          fontSize={11}
          textAnchor="middle"
          fill={overdue ? 'var(--err,#dc2626)' : 'var(--text-md)'}
          fontWeight={overdue ? 700 : 400}
        >
          {overdue ? `納期超過 ${Math.abs(daysLeft)} 日` : `残り ${daysLeft} 日`}
        </text>
      )}
    </svg>
  );
};
