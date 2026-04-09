import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Topbar } from './Topbar';

const defaultProps = {
  theme: 'light',
  setTheme: vi.fn(),
  onToggleSidebar: vi.fn(),
  embStatus: 'ready',
  embCount: 42,
  onGlobalSearch: vi.fn(),
  globalQuery: '',
  setGlobalQuery: vi.fn(),
};

const renderTopbar = (overrides = {}) =>
  render(<Topbar {...defaultProps} {...overrides} />);

describe('Topbar', () => {
  it('renders Matlens logo text', () => {
    renderTopbar();
    expect(screen.getByText('Matlens')).toBeInTheDocument();
  });

  it('renders as a banner landmark', () => {
    renderTopbar();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders all four theme buttons', () => {
    renderTopbar();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('CAE')).toBeInTheDocument();
  });

  it('calls setTheme when a theme button is clicked', async () => {
    const setTheme = vi.fn();
    renderTopbar({ setTheme });
    await userEvent.click(screen.getByText('Dark'));
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('calls setTheme with correct id for each theme', async () => {
    const setTheme = vi.fn();
    renderTopbar({ setTheme });

    await userEvent.click(screen.getByText('Light'));
    expect(setTheme).toHaveBeenCalledWith('light');

    await userEvent.click(screen.getByText('Engineering'));
    expect(setTheme).toHaveBeenCalledWith('eng');

    await userEvent.click(screen.getByText('CAE'));
    expect(setTheme).toHaveBeenCalledWith('cae');
  });

  it('marks current theme button as pressed', () => {
    renderTopbar({ theme: 'dark' });
    const darkBtn = screen.getByText('Dark');
    expect(darkBtn).toHaveAttribute('aria-pressed', 'true');
    const lightBtn = screen.getByText('Light');
    expect(lightBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('renders search input with placeholder', () => {
    renderTopbar();
    expect(screen.getByPlaceholderText('材料名・ID・組成を検索...（Enter）')).toBeInTheDocument();
  });

  it('calls setGlobalQuery on search input change', async () => {
    const setGlobalQuery = vi.fn();
    renderTopbar({ setGlobalQuery });
    const input = screen.getByPlaceholderText('材料名・ID・組成を検索...（Enter）');
    await userEvent.type(input, 'a');
    expect(setGlobalQuery).toHaveBeenCalled();
  });

  it('calls onGlobalSearch on Enter key', () => {
    const onGlobalSearch = vi.fn();
    renderTopbar({ globalQuery: 'SUS304', onGlobalSearch });
    const input = screen.getByPlaceholderText('材料名・ID・組成を検索...（Enter）');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onGlobalSearch).toHaveBeenCalledWith('SUS304');
  });

  it('shows clear button when globalQuery is not empty', () => {
    renderTopbar({ globalQuery: 'test' });
    // The clear button exists (it uses Icon name="close")
    const clearButtons = screen.getByPlaceholderText('材料名・ID・組成を検索...（Enter）')
      .parentElement!.querySelectorAll('button');
    expect(clearButtons.length).toBe(1);
  });

  it('does not show clear button when globalQuery is empty', () => {
    renderTopbar({ globalQuery: '' });
    const inputParent = screen.getByPlaceholderText('材料名・ID・組成を検索...（Enter）').parentElement!;
    const clearButtons = inputParent.querySelectorAll('button');
    expect(clearButtons.length).toBe(0);
  });

  it('renders embedding status as ready with count', () => {
    renderTopbar({ embStatus: 'ready', embCount: 42 });
    expect(screen.getByText('42件')).toBeInTheDocument();
  });

  it('renders embedding status as loading', () => {
    renderTopbar({ embStatus: 'loading', embCount: 0 });
    expect(screen.getByText('モデル読込中')).toBeInTheDocument();
  });

  it('renders embedding status as indexing', () => {
    renderTopbar({ embStatus: 'indexing', embCount: 0 });
    expect(screen.getByText('索引構築中')).toBeInTheDocument();
  });

  it('renders embedding status as fallback', () => {
    renderTopbar({ embStatus: 'fallback', embCount: 0 });
    expect(screen.getByText('キーワード検索')).toBeInTheDocument();
  });

  it('renders embedding status as idle', () => {
    renderTopbar({ embStatus: 'idle', embCount: 0 });
    expect(screen.getByText('初期化中')).toBeInTheDocument();
  });

  it('renders sidebar toggle button', () => {
    renderTopbar();
    expect(screen.getByLabelText('サイドバーを開閉する')).toBeInTheDocument();
  });

  it('calls onToggleSidebar when sidebar button clicked', async () => {
    const onToggleSidebar = vi.fn();
    renderTopbar({ onToggleSidebar });
    await userEvent.click(screen.getByLabelText('サイドバーを開閉する'));
    expect(onToggleSidebar).toHaveBeenCalledTimes(1);
  });

  it('renders theme group with aria-label', () => {
    renderTopbar();
    expect(screen.getByRole('group', { name: 'テーマ切替' })).toBeInTheDocument();
  });

  it('renders user avatar', () => {
    renderTopbar();
    expect(screen.getByLabelText('ログインユーザー')).toBeInTheDocument();
    expect(screen.getByText('KK')).toBeInTheDocument();
  });
});
