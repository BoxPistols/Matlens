import { useState, useEffect, useReducer, useCallback, lazy, Suspense } from 'react';
import type { Toast, AppContextValue } from './types';
import { AppCtx, dbReducer } from './context/AppContext';
import { INITIAL_DB } from './data/initialDb';
import { useTheme } from './hooks/useTheme';
import { useEmbedding } from './hooks/useEmbedding';
import { useAI } from './hooks/useAI';
import { useVoice } from './hooks/useVoice';
import { installMockAPI } from './services/mockApi';
import { Icon } from './components/Icon';
import { Topbar } from './components/Topbar';
import { Sidebar } from './components/Sidebar';
import { SupportPanel } from './components/SupportPanel';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { ToastHub } from './components/molecules';
import { Typing } from './components/atoms';
import { useAnnouncements } from './hooks/useAnnouncements';
import { DashboardPage } from './pages/Dashboard';
import { MaterialListPage } from './pages/MaterialList';
import { MaterialFormPage } from './pages/MaterialForm';
import { VectorSearchPage } from './pages/VectorSearch';
import { RAGChatPage } from './pages/RAGChat';
import { DetailPage } from './pages/Detail';
import { SimilarPage } from './pages/Similar';
import { VoicePage } from './pages/Voice';
import { HelpPage } from './pages/Help';
import { MasterSettingsPage } from './pages/MasterSettings';
import { AboutPage } from './pages/About';
import { ApiDebugPage } from './pages/ApiDebug';
import { UxDesignPage } from './pages/UxDesign';
import { TestSuitePage } from './pages/TestSuite';

// Lazy load Three.js heavy page to avoid blocking app startup
const CatalogPage = lazy(() => import('./pages/Catalog/CatalogPage').then(m => ({ default: m.CatalogPage })));

const LazyFallback = () => (
  <div className="flex items-center justify-center h-64 text-text-lo">
    <Typing /> <span className="ml-2 text-[13px]">3D カタログを読み込み中...</span>
  </div>
);

type NavEntry = { page: string; detailId: string | null };

export function App() {
  const [db, dispatch] = useReducer(dbReducer, INITIAL_DB);
  const [page, setPage] = useState('dash');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [history, setHistory] = useState<NavEntry[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { theme, setTheme } = useTheme();
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

  // Push the current page onto history before navigating to a new one
  const pushHistory = () => {
    setHistory(h => {
      const last = h[h.length - 1];
      // Avoid pushing duplicate consecutive entries
      if (last && last.page === page && last.detailId === detailId) return h;
      return [...h, { page, detailId }];
    });
  };

  const navTo = (p: string) => {
    pushHistory();
    if (p.startsWith('edit_')) { setDetailId(p.slice(5)); setPage('edit'); return; }
    if (p.startsWith('detail_')) { setDetailId(p.slice(7)); setPage('detail'); return; }
    if (p.startsWith('rag:')) { setRagInitialQuery(p.slice(4)); setPage('rag'); return; }
    if (p.startsWith('sim:')) { setSimInitialBase(p.slice(4)); setPage('sim'); return; }
    setPage(p); if (p !== 'detail') setDetailId(null);
  };

  const goBack = () => {
    setHistory(h => {
      if (h.length === 0) { setPage('list'); setDetailId(null); return h; }
      const prev = h[h.length - 1];
      setPage(prev.page);
      setDetailId(prev.detailId);
      return h.slice(0, -1);
    });
  };

  const showDetail = (id: string) => { pushHistory(); setDetailId(id); setPage('detail'); };
  const handleGlobalSearch = useCallback((q: string) => { setGlobalQuery(q); setPage('list'); }, []);

  const renderPage = () => {
    const commonProps = { db, dispatch, onNav: navTo, claude, embedding, voice };
    switch(page) {
      case 'dash':    return <DashboardPage {...commonProps} />;
      case 'list':    return <MaterialListPage {...commonProps} onDetail={showDetail} search={embedding.search} />;
      case 'new':     return <MaterialFormPage {...commonProps} editId={null} onCancel={() => setPage('list')} onSuccess={() => setPage('list')} />;
      case 'edit':    return <MaterialFormPage {...commonProps} editId={detailId} onCancel={() => setPage(detailId ? 'detail' : 'list')} onSuccess={() => { if(detailId) setPage('detail'); else setPage('list'); }} />;
      case 'detail':  return <DetailPage {...commonProps} recordId={detailId!} onBack={goBack} onEdit={() => navTo('edit_'+detailId)} />;
      case 'vsearch': return <VectorSearchPage {...commonProps} />;
      case 'rag':     return <RAGChatPage {...commonProps} initialQuery={ragInitialQuery} clearInitialQuery={() => setRagInitialQuery('')} />;
      case 'sim':     return <SimilarPage {...commonProps} initialBase={simInitialBase} clearInitialBase={() => setSimInitialBase('')} />;
      case 'catalog': return <Suspense fallback={<LazyFallback />}><CatalogPage db={db} onNav={navTo} onDetail={showDetail} /></Suspense>;
      case 'voice':   return <VoicePage />;
      case 'api':     return <ApiDebugPage db={db} dispatch={dispatch} />;
      case 'tests':   return <TestSuitePage />;
      case 'uxdesign':return <UxDesignPage />;
      case 'help':    return <HelpPage />;
      case 'settings': return <MasterSettingsPage db={db} />;
      case 'about':   return <AboutPage />;
      default:        return <DashboardPage {...commonProps} />;
    }
  };

  return (
    <AppCtx.Provider value={{ db, dispatch, addToast, toasts, theme } satisfies AppContextValue}>
      <a href="#main" className="skip-nav">コンテンツへスキップ</a>
      <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
        <Topbar
          theme={theme} setTheme={setTheme}
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
          <main id="main" className="flex-1 overflow-y-auto p-6 flex flex-col min-h-0" role="main" aria-label="メインコンテンツ">
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
