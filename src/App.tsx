import { useState, useEffect, useReducer, useCallback, useRef, lazy, Suspense, type ReactNode } from 'react';
import type { Toast, AppContextValue } from './types';
import { AppCtx, dbReducer } from './context/AppContext';
import { INITIAL_DB } from './data/initialDb';
import { useTheme } from './hooks/useTheme';
import { useDensity } from './hooks/useDensity';
import { useEmbedding } from './hooks/useEmbedding';
import { useAI } from './hooks/useAI';
import { useVoice } from './hooks/useVoice';
import { useLang } from './hooks/useLang';
import { installMockAPI } from './services/mockApi';
import { Icon } from './components/Icon';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { SupportPanel } from './components/SupportPanel';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { ToastHub } from './components/molecules';
import { Typing } from './components/atoms';
import { useAnnouncements } from './hooks/useAnnouncements';
// Eagerly loaded: the "hot path" pages a user is most likely to land on
// from a cold start (list, form, detail, vector search, RAG chat, similar).
// Everything else is dynamically imported so chart.js, prismjs, and the
// dev-only test/debug pages don't inflate the initial bundle.
import { MaterialListPage } from './pages/MaterialList';
import { MaterialFormPage } from './pages/MaterialForm';
import { VectorSearchPage } from './pages/VectorSearch';
import { RAGChatPage } from './pages/RAGChat';
import { DetailPage } from './pages/Detail';
import { SimilarPage } from './pages/Similar';

const DashboardPage = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.DashboardPage })));
const VoicePage = lazy(() => import('./pages/Voice').then(m => ({ default: m.VoicePage })));
const HelpPage = lazy(() => import('./pages/Help').then(m => ({ default: m.HelpPage })));
const MasterSettingsPage = lazy(() => import('./pages/MasterSettings').then(m => ({ default: m.MasterSettingsPage })));
const AboutPage = lazy(() => import('./pages/About').then(m => ({ default: m.AboutPage })));
const ApiDebugPage = lazy(() => import('./pages/ApiDebug').then(m => ({ default: m.ApiDebugPage })));
const UxDesignPage = lazy(() => import('./pages/UxDesign').then(m => ({ default: m.UxDesignPage })));
const TestSuitePage = lazy(() => import('./pages/TestSuite').then(m => ({ default: m.TestSuitePage })));
const CatalogPage = lazy(() => import('./pages/Catalog/CatalogPage').then(m => ({ default: m.CatalogPage })));
const PetriNetPage = lazy(() => import('./pages/PetriNet').then(m => ({ default: m.PetriNetPage })));
const BayesianOptPage = lazy(() => import('./pages/BayesianOpt').then(m => ({ default: m.BayesianOptPage })));
const SimulationPage = lazy(() => import('./pages/Simulation').then(m => ({ default: m.SimulationPage })));

const LazyFallback = ({ label = 'ページを読み込み中...' }: { label?: string }) => (
  <div className="flex items-center justify-center h-64 text-text-lo">
    <Typing /> <span className="ml-2 text-[13px]">{label}</span>
  </div>
);

// Hash routing — persisted in window.location so reload / browser back-forward
// / copy-paste URL all "just work". Detail / edit pages embed the record id as
// a second segment (#/detail/MAT-0368); everything else is a single segment.
// One-shot query state (rag initial query, sim base material) is intentionally
// NOT persisted — those are one-action kickstarts that would be annoying to
// replay on reload.
function parseHash(): { page: string; detailId: string | null } {
  if (typeof window === 'undefined') return { page: 'dash', detailId: null };
  const parts = window.location.hash.slice(1).split('/').filter(Boolean);
  const first = parts[0];
  if (!first) return { page: 'dash', detailId: null };
  return { page: first, detailId: parts[1] ?? null };
}

function buildHash(page: string, detailId: string | null): string {
  if (detailId && (page === 'detail' || page === 'edit')) {
    return `#/${page}/${detailId}`;
  }
  return `#/${page}`;
}

export function App() {
  const [db, dispatch] = useReducer(dbReducer, INITIAL_DB);
  const initialRoute = parseHash();
  const [page, setPage] = useState(initialRoute.page);
  const [detailId, setDetailId] = useState<string | null>(initialRoute.detailId);
  const isFirstRender = useRef(true);
  // Track how many hash navigations the app itself has pushed. Used by
  // goBack() to know whether window.history.back() will stay inside Matlens
  // or step off the site entirely (e.g. when the user landed on a shared
  // detail URL with no prior in-app navigation).
  const navDepth = useRef(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLang();
  const { density, setDensity } = useDensity();
  const embedding = useEmbedding(db);
  const ai = useAI();
  const claude = ai;
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState<string>('help');
  const [globalQuery, setGlobalQuery] = useState('');
  const [ragInitialQuery, setRagInitialQuery] = useState('');
  const [simInitialBase, setSimInitialBase] = useState('');
  const announcements = useAnnouncements();
  const [bannerHidden, setBannerHidden] = useState(false);

  const openSupportPanel = (tab: string = 'help') => {
    setSettingsInitialTab(tab);
    setSettingsVisible(true);
  };

  useEffect(() => { installMockAPI(() => db, dispatch); }, []);

  const voice = useVoice();

  const addToast = useCallback((msg: string, type = 'ok') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  // Write state back to location.hash so reload / back-forward buttons work.
  // The first render uses replaceState so we don't inject an extra history
  // entry for the initial paint.
  useEffect(() => {
    const nextHash = buildHash(page, detailId);
    if (window.location.hash === nextHash) return;
    if (isFirstRender.current) {
      window.history.replaceState(null, '', nextHash);
    } else {
      window.history.pushState(null, '', nextHash);
      navDepth.current += 1;
    }
  }, [page, detailId]);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  // Browser back / forward (including Cmd+[, Cmd+], and the buttons) fires
  // popstate — sync our React state back from the URL. Every popstate means
  // the user walked one entry in the browser history, so decrement the
  // counter (but never below zero — forward navigation is also popstate and
  // we don't track a separate forward depth).
  useEffect(() => {
    const handler = () => {
      const next = parseHash();
      setPage(next.page);
      setDetailId(next.detailId);
      navDepth.current = Math.max(0, navDepth.current - 1);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // Cmd+Arrow (macOS) / Alt+Arrow (Windows / Linux) should walk the browser
  // history just like the back/forward buttons, but only when the user isn't
  // editing a text field (Cmd+Left / Cmd+Right are also cursor navigation in
  // <input> on macOS, and we must not hijack them there).
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (target?.isContentEditable) return;
      if (!(e.metaKey || e.altKey)) return;
      if (e.ctrlKey || e.shiftKey) return;
      if (e.key === 'ArrowLeft' || e.key === '[') {
        e.preventDefault();
        window.history.back();
      } else if (e.key === 'ArrowRight' || e.key === ']') {
        e.preventDefault();
        window.history.forward();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const navTo = (p: string) => {
    if (p.startsWith('edit_')) { setDetailId(p.slice(5)); setPage('edit'); return; }
    if (p.startsWith('detail_')) { setDetailId(p.slice(7)); setPage('detail'); return; }
    if (p.startsWith('rag:')) { setRagInitialQuery(p.slice(4)); setPage('rag'); return; }
    if (p.startsWith('sim:')) { setSimInitialBase(p.slice(4)); setPage('sim'); return; }
    setPage(p); if (p !== 'detail') setDetailId(null);
  };

  const goBack = useCallback(() => {
    if (navDepth.current > 0) {
      window.history.back();
    } else {
      // No in-app navigations to pop (e.g. user opened a shared detail URL
      // directly). Route to the material list instead of letting back()
      // navigate off the site.
      setPage('list');
      setDetailId(null);
    }
  }, []);

  const showDetail = (id: string) => { setDetailId(id); setPage('detail'); };
  const handleGlobalSearch = useCallback((q: string) => { setGlobalQuery(q); setPage('list'); }, []);

  const renderPage = () => {
    const commonProps = { db, dispatch, onNav: navTo, claude, embedding, voice };
    // Wrap all lazy routes in a single Suspense so the fallback is consistent
    // and we don't re-create a Suspense boundary per route.
    const lazyPage = (node: ReactNode) => (
      <Suspense fallback={<LazyFallback />}>{node}</Suspense>
    );
    switch(page) {
      case 'dash':    return lazyPage(<DashboardPage {...commonProps} announcements={announcements} onOpenAnnouncements={() => openSupportPanel('news')} />);
      case 'list':    return <MaterialListPage {...commonProps} onDetail={showDetail} search={embedding.search} />;
      case 'new':     return <MaterialFormPage {...commonProps} editId={null} onCancel={() => setPage('list')} onSuccess={() => setPage('list')} />;
      case 'edit':    return <MaterialFormPage {...commonProps} editId={detailId} onCancel={() => setPage(detailId ? 'detail' : 'list')} onSuccess={() => { if(detailId) setPage('detail'); else setPage('list'); }} />;
      case 'detail':  return <DetailPage {...commonProps} recordId={detailId!} onBack={goBack} onEdit={() => navTo('edit_'+detailId)} />;
      case 'vsearch': return <VectorSearchPage {...commonProps} />;
      case 'rag':     return <RAGChatPage {...commonProps} initialQuery={ragInitialQuery} clearInitialQuery={() => setRagInitialQuery('')} />;
      case 'sim':     return <SimilarPage {...commonProps} initialBase={simInitialBase} clearInitialBase={() => setSimInitialBase('')} />;
      case 'catalog': return lazyPage(<CatalogPage db={db} onNav={navTo} onDetail={showDetail} />);
      case 'petri':   return lazyPage(<PetriNetPage onNav={navTo} />);
      case 'bayes':   return lazyPage(<BayesianOptPage db={db} />);
      case 'simulate': return lazyPage(<SimulationPage />);
      case 'voice':   return lazyPage(<VoicePage />);
      case 'api':     return lazyPage(<ApiDebugPage db={db} dispatch={dispatch} />);
      case 'tests':   return lazyPage(<TestSuitePage />);
      case 'uxdesign':return lazyPage(<UxDesignPage />);
      case 'help':    return lazyPage(<HelpPage />);
      case 'settings': return lazyPage(<MasterSettingsPage db={db} />);
      case 'about':   return lazyPage(<AboutPage />);
      default:        return lazyPage(<DashboardPage {...commonProps} />);
    }
  };

  return (
    <AppCtx.Provider value={{ db, dispatch, addToast, toasts, theme, lang, setLang, t } satisfies AppContextValue}>
      <a href="#main" className="skip-nav">コンテンツへスキップ</a>
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
        <Topbar
          theme={theme} setTheme={setTheme}
          density={density} setDensity={setDensity}
          lang={lang} setLang={setLang}
          onToggleSidebar={() => setSidebarCollapsed(c=>!c)}
          embStatus={embedding.status} embCount={embedding.embCount} embEngine={embedding.engine}
          onGlobalSearch={handleGlobalSearch} globalQuery={globalQuery} setGlobalQuery={setGlobalQuery}
          db={db} onDetail={showDetail}
          unreadNotifications={announcements.unreadCount}
          onOpenNotifications={() => openSupportPanel('news')}
        />
        {announcements.latestUnread && !bannerHidden && (
          <AnnouncementBanner
            announcement={announcements.latestUnread}
            unreadCount={announcements.unreadCount}
            onDismiss={() => { announcements.markAsSeen(); setBannerHidden(true); }}
            onOpenAll={() => { openSupportPanel('news'); setBannerHidden(true); }}
          />
        )}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            currentPage={page} onNav={navTo}
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(c => !c)}
            dbCount={db.length}
            embStatus={embedding.status} embCount={embedding.embCount}
          />
          <main id="main" className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 flex flex-col min-h-0" role="main" aria-label="メインコンテンツ">
            {renderPage()}
          </main>
        </div>
      </div>
      <SupportPanel
        ai={ai}
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onNav={navTo}
        initialTab={settingsInitialTab}
        announcements={announcements}
      />
      <button
        onClick={() => { if (settingsVisible) setSettingsVisible(false); else openSupportPanel('help'); }}
        className="fixed bottom-6 right-6 z-[2000] flex items-center justify-center w-12 h-12 rounded-full bg-accent text-white shadow-lg hover:bg-[var(--accent-hover)] transition-all"
        title={announcements.unreadCount > 0 ? `サポート / 未読 ${announcements.unreadCount} 件` : 'サポート / ヘルプ / AI設定'}
        aria-label={
          settingsVisible
            ? 'サポートパネルを閉じる'
            : announcements.unreadCount > 0
              ? `サポートパネルを開く (未読お知らせ ${announcements.unreadCount} 件)`
              : 'サポートパネルを開く'
        }
        aria-expanded={settingsVisible}
      >
        <Icon name={settingsVisible ? 'close' : 'help'} size={20} />
        {announcements.unreadCount > 0 && !settingsVisible && (
          <span
            aria-hidden="true"
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--err)] text-white text-[10px] font-bold flex items-center justify-center border-2 border-[var(--bg-base)]"
          >
            {announcements.unreadCount > 9 ? '9+' : announcements.unreadCount}
          </span>
        )}
      </button>
      <ToastHub />
    </AppCtx.Provider>
  );
}
