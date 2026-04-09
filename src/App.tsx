import { useState, useEffect, useReducer, useCallback } from 'react';
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
import { ToastHub } from './components/molecules';
import { DashboardPage } from './pages/DashboardPage';
import { MaterialListPage } from './pages/MaterialListPage';
import { MaterialFormPage } from './pages/MaterialFormPage';
import { VectorSearchPage } from './pages/VectorSearchPage';
import { RAGChatPage } from './pages/RAGChatPage';
import { DetailPage } from './pages/DetailPage';
import { SimilarPage } from './pages/SimilarPage';
import { VoicePage } from './pages/VoicePage';
import { HelpPage } from './pages/HelpPage';
import { MasterSettingsPage } from './pages/MasterSettingsPage';
import { AboutPage } from './pages/AboutPage';
import { ApiDebugPage } from './pages/ApiDebugPage';
import { UxDesignPage } from './pages/UxDesignPage';
import { TestSuitePage } from './pages/TestSuitePage';

export function App() {
  const [db, dispatch] = useReducer(dbReducer, INITIAL_DB);
  const [page, setPage] = useState('dash');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { theme, setTheme } = useTheme();
  const embedding = useEmbedding(db);
  const ai = useAI();
  const claude = ai;
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');

  useEffect(() => { installMockAPI(() => db, dispatch); }, []);

  const voice = useVoice();

  const addToast = useCallback((msg: string, type = 'ok') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);

  const navTo = (p: string) => {
    if (p.startsWith('edit_')) { setDetailId(p.slice(5)); setPage('edit'); return; }
    setPage(p); if (p !== 'detail') setDetailId(null);
  };
  const showDetail = (id: string) => { setDetailId(id); setPage('detail'); };
  const handleGlobalSearch = useCallback((q: string) => { setGlobalQuery(q); setPage('list'); }, []);

  const renderPage = () => {
    const commonProps = { db, dispatch, onNav: navTo, claude, embedding, voice };
    switch(page) {
      case 'dash':    return <DashboardPage {...commonProps} />;
      case 'list':    return <MaterialListPage {...commonProps} onDetail={showDetail} search={embedding.search} />;
      case 'new':     return <MaterialFormPage {...commonProps} editId={null} onCancel={() => setPage('list')} onSuccess={() => setPage('list')} />;
      case 'edit':    return <MaterialFormPage {...commonProps} editId={detailId} onCancel={() => setPage(detailId ? 'detail' : 'list')} onSuccess={() => { if(detailId) setPage('detail'); else setPage('list'); }} />;
      case 'detail':  return <DetailPage {...commonProps} recordId={detailId!} onBack={() => setPage('list')} onEdit={() => navTo('edit_'+detailId)} />;
      case 'vsearch': return <VectorSearchPage {...commonProps} />;
      case 'rag':     return <RAGChatPage {...commonProps} />;
      case 'sim':     return <SimilarPage {...commonProps} />;
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
          embStatus={embedding.status} embCount={embedding.embCount}
          onGlobalSearch={handleGlobalSearch} globalQuery={globalQuery} setGlobalQuery={setGlobalQuery}
        />
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
      <SupportPanel ai={ai} visible={settingsVisible} onClose={() => setSettingsVisible(false)} onNav={navTo} />
      <button onClick={() => setSettingsVisible(v => !v)}
        className="fixed bottom-6 right-6 z-[2000] flex items-center justify-center w-12 h-12 rounded-full bg-accent text-white shadow-lg hover:bg-[var(--accent-hover)] transition-all"
        title="サポート / ヘルプ / AI設定">
        <Icon name={settingsVisible ? 'close' : 'help'} size={20} />
      </button>
      <ToastHub />
    </AppCtx.Provider>
  );
}
