import ReactDOM from 'react-dom/client';
import { App } from './App';
import { QueryProvider, RepositoryProvider } from './app/providers';
import './index.css';

// MSW を起動するか（.env.local で VITE_MSW_ENABLED=true）
const enableMocking = async () => {
  if (import.meta.env.VITE_MSW_ENABLED !== 'true') return;
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
};

enableMocking()
  .catch((err) => {
    // VITE_MSW_ENABLED=true で起動に失敗したときに黙殺しない
    console.error('[MSW] failed to start worker:', err);
  })
  .finally(() => {
    const root = document.getElementById('root');
    if (!root) throw new Error('Root element #root not found');
    ReactDOM.createRoot(root).render(
      <QueryProvider>
        <RepositoryProvider>
          <App />
        </RepositoryProvider>
      </QueryProvider>
    );
  });
