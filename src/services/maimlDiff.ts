// MaiML / 任意のテキスト 2 ファイルの行差分を計算する純関数。
// LCS（最長共通部分列）ベースで Myers アルゴリズム相当の挙動を行単位で再現。
// 軽量実装（DP テーブル）で外部依存ゼロ。
//
// 1 ファイル数 KB の MaiML 想定では DP テーブル O(n*m) でも数 ms で終わる。
// MB 級になる場合は将来 Myers の差分アルゴリズム or hash chunking に置換する余地あり。

export type DiffOp = 'equal' | 'added' | 'removed';

export interface DiffLine {
  op: DiffOp;
  /** A 側の行番号（1-origin、added の場合は null） */
  lineA: number | null;
  /** B 側の行番号（1-origin、removed の場合は null） */
  lineB: number | null;
  text: string;
}

export interface DiffSummary {
  added: number;
  removed: number;
  equal: number;
  total: number;
}

export interface DiffResult {
  lines: DiffLine[];
  summary: DiffSummary;
}

/**
 * 2 文字列を行単位で LCS 計算し、表示用の差分配列を返す。
 * 改行は LF / CRLF を吸収し、末尾の空行は drop する。
 */
export function diffLines(a: string, b: string): DiffResult {
  const aLines = splitLines(a);
  const bLines = splitLines(b);
  const lcs = computeLcsTable(aLines, bLines);
  const trace = backtrack(aLines, bLines, lcs);

  let added = 0;
  let removed = 0;
  let equal = 0;
  for (const line of trace) {
    if (line.op === 'added') added++;
    else if (line.op === 'removed') removed++;
    else equal++;
  }

  return {
    lines: trace,
    summary: { added, removed, equal, total: trace.length },
  };
}

function splitLines(s: string): string[] {
  const norm = s.replace(/\r\n/g, '\n');
  const arr = norm.split('\n');
  // 末尾改行のみの場合に空文字列が 1 個増えるので削る
  if (arr.length > 0 && arr[arr.length - 1] === '') arr.pop();
  return arr;
}

/**
 * 古典的な LCS DP テーブル。
 * dp[i][j] = a[0..i) と b[0..j) の LCS 長
 */
function computeLcsTable(a: string[], b: string[]): number[][] {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    const ai = a[i - 1]!;
    for (let j = 1; j <= m; j++) {
      if (ai === b[j - 1]!) {
        dp[i]![j] = dp[i - 1]![j - 1]! + 1;
      } else {
        dp[i]![j] = Math.max(dp[i - 1]![j]!, dp[i]![j - 1]!);
      }
    }
  }
  return dp;
}

function backtrack(a: string[], b: string[], dp: number[][]): DiffLine[] {
  const out: DiffLine[] = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      out.unshift({ op: 'equal', lineA: i, lineB: j, text: a[i - 1]! });
      i--;
      j--;
    } else if (dp[i - 1]![j]! >= dp[i]![j - 1]!) {
      out.unshift({ op: 'removed', lineA: i, lineB: null, text: a[i - 1]! });
      i--;
    } else {
      out.unshift({ op: 'added', lineA: null, lineB: j, text: b[j - 1]! });
      j--;
    }
  }
  while (i > 0) {
    out.unshift({ op: 'removed', lineA: i, lineB: null, text: a[i - 1]! });
    i--;
  }
  while (j > 0) {
    out.unshift({ op: 'added', lineA: null, lineB: j, text: b[j - 1]! });
    j--;
  }
  return out;
}
