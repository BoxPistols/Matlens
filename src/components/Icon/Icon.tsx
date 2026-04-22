import {
  LayoutDashboard, List, PlusCircle, Search, ScanSearch, MessageSquare,
  GitCompareArrows, Mic, HelpCircle, BookOpen, Settings,
  ChevronLeft, ChevronRight, ChevronDown, X, Check,
  Pencil, Trash2, Download, Upload, Copy, Volume2,
  Square, RefreshCw, Play, Sparkles, Share2, AlertTriangle,
  Info, Filter, ArrowDownWideNarrow, FileText, Braces, FileSpreadsheet, ClipboardList,
  Sun, ScanLine, Workflow, Atom,
  Bot, Send, PanelRight, ExternalLink,
  type LucideIcon,
} from 'lucide-react';

export type IconName =
  | 'dashboard' | 'list' | 'plus' | 'search' | 'vecSearch' | 'rag'
  | 'similar' | 'mic' | 'help' | 'about' | 'settings'
  | 'chevronLeft' | 'chevronRight' | 'chevronDown' | 'close' | 'check'
  | 'edit' | 'trash' | 'download' | 'upload' | 'copy' | 'speaker'
  | 'stop' | 'refresh' | 'play' | 'spark' | 'embed' | 'warning'
  | 'info' | 'filter' | 'sort' | 'pdf' | 'json' | 'csv' | 'report'
  | 'ai' | 'scan'
  | 'bot' | 'send' | 'panelRight' | 'external'
  | 'workflow' | 'atom';

const ICON_MAP: Record<IconName, LucideIcon> = {
  dashboard:    LayoutDashboard,
  list:         List,
  plus:         PlusCircle,
  search:       Search,
  vecSearch:    ScanSearch,
  rag:          MessageSquare,
  similar:      GitCompareArrows,
  mic:          Mic,
  help:         HelpCircle,
  about:        BookOpen,
  settings:     Settings,
  chevronLeft:  ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown:  ChevronDown,
  close:        X,
  check:        Check,
  edit:         Pencil,
  trash:        Trash2,
  download:     Download,
  upload:       Upload,
  copy:         Copy,
  speaker:      Volume2,
  stop:         Square,
  refresh:      RefreshCw,
  play:         Play,
  spark:        Sparkles,
  embed:        Share2,
  warning:      AlertTriangle,
  info:         Info,
  filter:       Filter,
  sort:         ArrowDownWideNarrow,
  pdf:          FileText,
  json:         Braces,
  csv:          FileSpreadsheet,
  report:       ClipboardList,
  ai:           Sun,
  scan:         ScanLine,
  bot:          Bot,
  send:         Send,
  panelRight:   PanelRight,
  external:     ExternalLink,
  workflow:     Workflow,
  atom:         Atom,
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

export const Icon = ({ name, size = 16, className = '' }: IconProps) => {
  const LucideComponent = ICON_MAP[name];
  if (!LucideComponent) return null;
  return (
    <LucideComponent
      size={size}
      className={`inline-flex flex-shrink-0 ${className}`}
      strokeWidth={1.75}
    />
  );
};
