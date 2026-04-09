import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppCtx } from '../../context/AppContext';
import type { AppContextValue, Material, Toast } from '../../types';
import {
  Modal,
  ToastHub,
  AIInsightCard,
  VecCard,
  KpiCard,
  SearchBox,
  FilterChip,
  MarkdownBubble,
  ExportModal,
} from './molecules';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const defaultCtx: AppContextValue = {
  db: [],
  dispatch: vi.fn(),
  addToast: vi.fn(),
  toasts: [],
  theme: 'light',
};

const makeWrapper = (overrides: Partial<AppContextValue> = {}) => {
  const ctx = { ...defaultCtx, ...overrides };
  return ({ children }: { children: React.ReactNode }) => (
    <AppCtx.Provider value={ctx}>{children}</AppCtx.Provider>
  );
};

const sampleMaterial: Material = {
  id: 'M-001',
  name: 'SUS304',
  cat: '金属合金',
  hv: 200,
  ts: 520,
  el: 193,
  pf: null,
  el2: 40,
  dn: 7.93,
  comp: 'Fe-18Cr-8Ni',
  batch: 'B-2024-001',
  date: '2024-01-15',
  author: '木村',
  status: '承認済',
  ai: false,
  memo: 'Test material',
};

/* ------------------------------------------------------------------ */
/*  Modal                                                              */
/* ------------------------------------------------------------------ */
describe('Modal', () => {
  it('renders when open', () => {
    render(
      <Modal open onClose={vi.fn()} title="Test Modal">
        Modal body
      </Modal>
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal body')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Hidden">
        Hidden body
      </Modal>
    );
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden body')).not.toBeInTheDocument();
  });

  it('shows title text', () => {
    render(
      <Modal open onClose={vi.fn()} title="My Title">
        Body
      </Modal>
    );
    const heading = screen.getByText('My Title');
    expect(heading.tagName).toBe('H2');
  });

  it('calls onClose on backdrop click', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Backdrop">
        Content
      </Modal>
    );
    // The backdrop is the outer fixed div; clicking it directly triggers onClose
    const backdrop = screen.getByText('Content').closest('.fixed');
    fireEvent.click(backdrop!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking modal content', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="No close">
        Inner content
      </Modal>
    );
    fireEvent.click(screen.getByText('Inner content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose on Escape key press', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Esc">
        Body
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not listen for Escape when closed', () => {
    const onClose = vi.fn();
    render(
      <Modal open={false} onClose={onClose} title="No Esc">
        Body
      </Modal>
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders footer when provided', () => {
    render(
      <Modal open onClose={vi.fn()} title="With Footer" footer={<button>Save</button>}>
        Body
      </Modal>
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(
      <Modal open onClose={vi.fn()} title="Close btn">
        Body
      </Modal>
    );
    expect(screen.getByLabelText('閉じる')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  ToastHub                                                           */
/* ------------------------------------------------------------------ */
describe('ToastHub', () => {
  it('renders toasts from context', () => {
    const toasts: Toast[] = [
      { id: 1, msg: 'Saved successfully', type: 'ok' },
      { id: 2, msg: 'Something went wrong', type: 'warn' },
    ];
    render(<ToastHub />, { wrapper: makeWrapper({ toasts }) });
    expect(screen.getByText('Saved successfully')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders nothing when no toasts', () => {
    const { container } = render(<ToastHub />, { wrapper: makeWrapper({ toasts: [] }) });
    // The fixed container still exists but has no toast children
    const toastContainer = container.querySelector('.fixed');
    expect(toastContainer).toBeInTheDocument();
    // No toast message divs
    const toastItems = toastContainer!.querySelectorAll('.pointer-events-auto');
    expect(toastItems.length).toBe(0);
  });

  it('renders info toast with info icon styling', () => {
    const toasts: Toast[] = [{ id: 1, msg: 'Info message', type: 'info' }];
    render(<ToastHub />, { wrapper: makeWrapper({ toasts }) });
    expect(screen.getByText('Info message')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  AIInsightCard                                                      */
/* ------------------------------------------------------------------ */
describe('AIInsightCard', () => {
  it('renders children', () => {
    render(<AIInsightCard>Insight text here</AIInsightCard>);
    expect(screen.getByText('Insight text here')).toBeInTheDocument();
  });

  it('shows AI label', () => {
    render(<AIInsightCard>Content</AIInsightCard>);
    expect(screen.getByText('AI インサイト')).toBeInTheDocument();
  });

  it('shows loading state with typing dots instead of children', () => {
    const { container } = render(<AIInsightCard loading>Not shown</AIInsightCard>);
    // When loading, Typing component renders dots
    const dots = container.querySelectorAll('span.rounded-full');
    expect(dots.length).toBe(3);
    // The children text is not directly visible because Typing replaces it
  });

  it('renders chips', async () => {
    const chipClick = vi.fn();
    const chips = [
      { label: 'Similar materials', onClick: chipClick },
      { label: 'Composition', onClick: vi.fn() },
    ];
    render(<AIInsightCard chips={chips}>Text</AIInsightCard>);
    expect(screen.getByText('Similar materials')).toBeInTheDocument();
    expect(screen.getByText('Composition')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Similar materials'));
    expect(chipClick).toHaveBeenCalledTimes(1);
  });

  it('does not render chips area when chips is empty', () => {
    const { container } = render(<AIInsightCard chips={[]}>Text</AIInsightCard>);
    // The flex-wrap chip container should not be present
    const chipContainer = container.querySelector('.flex.gap-2.mt-2\\.5');
    expect(chipContainer).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  VecCard                                                            */
/* ------------------------------------------------------------------ */
describe('VecCard', () => {
  it('renders children', () => {
    render(<VecCard>Vector content</VecCard>);
    expect(screen.getByText('Vector content')).toBeInTheDocument();
  });

  it('shows vec label', () => {
    render(<VecCard>X</VecCard>);
    expect(screen.getByText('ベクトル / Embedding')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<VecCard className="mt-4">Y</VecCard>);
    expect(container.firstChild).toHaveClass('mt-4');
  });
});

/* ------------------------------------------------------------------ */
/*  KpiCard                                                            */
/* ------------------------------------------------------------------ */
describe('KpiCard', () => {
  it('renders label and value', () => {
    render(<KpiCard label="Total" value={42} />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(<KpiCard label="Status" value="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders delta when provided', () => {
    render(<KpiCard label="Growth" value="120" delta="+15%" deltaUp />);
    expect(screen.getByText('+15%')).toBeInTheDocument();
    expect(screen.getByText('+15%').className).toContain('text-ok');
  });

  it('renders delta down style', () => {
    render(<KpiCard label="Drop" value="80" delta="-10%" deltaUp={false} />);
    expect(screen.getByText('-10%')).toBeInTheDocument();
    expect(screen.getByText('-10%').className).toContain('text-err');
  });

  it('does not render delta when not provided', () => {
    const { container } = render(<KpiCard label="Simple" value="99" />);
    // No delta element
    const deltaElements = container.querySelectorAll('.text-ok, .text-err, .text-vec');
    expect(deltaElements.length).toBe(0);
  });

  it('applies custom color to value', () => {
    render(<KpiCard label="Colored" value="77" color="red" />);
    expect(screen.getByText('77').style.color).toBe('red');
  });
});

/* ------------------------------------------------------------------ */
/*  SearchBox                                                          */
/* ------------------------------------------------------------------ */
describe('SearchBox', () => {
  it('renders with placeholder', () => {
    render(<SearchBox value="" onChange={vi.fn()} placeholder="Search..." />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders with default placeholder', () => {
    render(<SearchBox value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('検索...')).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const onChange = vi.fn();
    render(<SearchBox value="" onChange={onChange} />);
    await userEvent.type(screen.getByPlaceholderText('検索...'), 'a');
    expect(onChange).toHaveBeenCalled();
  });

  it('displays current value', () => {
    render(<SearchBox value="SUS304" onChange={vi.fn()} />);
    expect(screen.getByDisplayValue('SUS304')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<SearchBox value="" onChange={vi.fn()} className="max-w-sm" />);
    expect(container.firstChild).toHaveClass('max-w-sm');
  });
});

/* ------------------------------------------------------------------ */
/*  FilterChip                                                         */
/* ------------------------------------------------------------------ */
describe('FilterChip', () => {
  it('renders label', () => {
    render(<FilterChip label="Metal" onRemove={vi.fn()} />);
    expect(screen.getByText('Metal')).toBeInTheDocument();
  });

  it('calls onRemove when remove button clicked', async () => {
    const onRemove = vi.fn();
    render(<FilterChip label="Filter" onRemove={onRemove} />);
    await userEvent.click(screen.getByLabelText('Filter を削除'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('has a remove button with proper aria-label', () => {
    render(<FilterChip label="Category" onRemove={vi.fn()} />);
    expect(screen.getByLabelText('Category を削除')).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  MarkdownBubble                                                     */
/* ------------------------------------------------------------------ */
describe('MarkdownBubble', () => {
  it('renders markdown text as HTML', () => {
    const { container } = render(<MarkdownBubble text="Hello **world**" />);
    const preview = container.querySelector('.md-preview');
    expect(preview).toBeInTheDocument();
    expect(preview!.innerHTML).toContain('Hello');
  });

  it('has a copy button', () => {
    render(<MarkdownBubble text="Some text" />);
    expect(screen.getByText('コピー')).toBeInTheDocument();
  });

  it('has a download/save button', () => {
    render(<MarkdownBubble text="Some text" />);
    expect(screen.getByText('保存')).toBeInTheDocument();
  });

  it('shows speak button when onSpeak is provided', () => {
    render(<MarkdownBubble text="Text" onSpeak={vi.fn()} />);
    expect(screen.getByText('読み上げ')).toBeInTheDocument();
  });

  it('does not show speak button when onSpeak is not provided', () => {
    render(<MarkdownBubble text="Text" />);
    expect(screen.queryByText('読み上げ')).not.toBeInTheDocument();
  });

  it('calls onSpeak when speak button is clicked', async () => {
    const onSpeak = vi.fn();
    render(<MarkdownBubble text="Read me" onSpeak={onSpeak} />);
    await userEvent.click(screen.getByText('読み上げ'));
    expect(onSpeak).toHaveBeenCalledWith('Read me');
  });

  it('copies text to clipboard on copy button click', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    render(<MarkdownBubble text="Copy me" />);
    await userEvent.click(screen.getByText('コピー'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Copy me');
  });
});

/* ------------------------------------------------------------------ */
/*  ExportModal                                                        */
/* ------------------------------------------------------------------ */
describe('ExportModal', () => {
  const materials = [sampleMaterial];

  it('renders export options when open', () => {
    render(
      <ExportModal open onClose={vi.fn()} db={materials} filtered={materials} />
    );
    expect(screen.getByText('データエクスポート')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('JSON')).toBeInTheDocument();
    expect(screen.getByText('PDF レポート')).toBeInTheDocument();
    expect(screen.getByText('全件 JSON')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <ExportModal open={false} onClose={vi.fn()} db={materials} filtered={materials} />
    );
    expect(screen.queryByText('データエクスポート')).not.toBeInTheDocument();
  });

  it('shows descriptions for export options', () => {
    render(
      <ExportModal open onClose={vi.fn()} db={materials} filtered={materials} />
    );
    expect(screen.getByText('Excel で開けるCSV形式')).toBeInTheDocument();
    expect(screen.getByText('システム連携用JSON')).toBeInTheDocument();
    expect(screen.getByText('印刷用フルレポート')).toBeInTheDocument();
    expect(screen.getByText('DBフル出力')).toBeInTheDocument();
  });

  it('renders a close button in footer', () => {
    render(
      <ExportModal open onClose={vi.fn()} db={materials} filtered={materials} />
    );
    // Footer has a "閉じる" button (separate from the modal X button)
    const closeButtons = screen.getAllByText('閉じる');
    expect(closeButtons.length).toBeGreaterThanOrEqual(1);
  });
});
