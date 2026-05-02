import { describe, it, expect } from 'vitest';
import { diffLines } from './maimlDiff';

describe('diffLines', () => {
  it('returns all equals when inputs are identical', () => {
    const a = 'a\nb\nc';
    const r = diffLines(a, a);
    expect(r.summary.equal).toBe(3);
    expect(r.summary.added).toBe(0);
    expect(r.summary.removed).toBe(0);
  });

  it('handles pure additions', () => {
    const r = diffLines('a\nb', 'a\nb\nc');
    expect(r.summary.added).toBe(1);
    expect(r.summary.removed).toBe(0);
    expect(r.lines[2]).toEqual({ op: 'added', lineA: null, lineB: 3, text: 'c' });
  });

  it('handles pure removals', () => {
    const r = diffLines('a\nb\nc', 'a\nb');
    expect(r.summary.removed).toBe(1);
    expect(r.summary.added).toBe(0);
    expect(r.lines[2]).toEqual({ op: 'removed', lineA: 3, lineB: null, text: 'c' });
  });

  it('handles modifications as add+remove pairs', () => {
    const r = diffLines('a\nb\nc', 'a\nB\nc');
    expect(r.summary.added).toBe(1);
    expect(r.summary.removed).toBe(1);
    expect(r.summary.equal).toBe(2);
  });

  it('treats CRLF and LF identically', () => {
    const r = diffLines('a\r\nb\r\n', 'a\nb\n');
    expect(r.summary.equal).toBe(2);
    expect(r.summary.added).toBe(0);
    expect(r.summary.removed).toBe(0);
  });

  it('handles empty inputs', () => {
    expect(diffLines('', '').summary.total).toBe(0);
    expect(diffLines('a', '').summary.removed).toBe(1);
    expect(diffLines('', 'b').summary.added).toBe(1);
  });

  it('preserves correct line numbers for both sides', () => {
    const r = diffLines('a\nb\nc', 'a\nx\ny\nc');
    const removedB = r.lines.find((l) => l.op === 'removed' && l.text === 'b');
    expect(removedB?.lineA).toBe(2);
    expect(removedB?.lineB).toBeNull();
    const addedY = r.lines.find((l) => l.op === 'added' && l.text === 'y');
    expect(addedY?.lineA).toBeNull();
    expect(addedY?.lineB).toBe(3);
  });
});
