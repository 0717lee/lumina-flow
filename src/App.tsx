import { ReactFlowProvider } from '@xyflow/react';
import FlowCanvas from '@/components/FlowCanvas';
import SearchBar from '@/components/SearchBar';
import useFlowStore from '@/store/flowStore';
import { translations } from '@/i18n/translations';
import Toolbar from '@/components/Toolbar';
import { useEffect } from 'react';

function AppContent() {
  const { language, theme } = useFlowStore();
  const t = translations[language];

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <div className="w-full h-screen bg-space-900 text-starlight-200 overflow-hidden font-sans">
      <div className="absolute top-6 left-6 z-50 pointer-events-none select-none">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-nebula-400 to-purple-400 tracking-tight filter drop-shadow-lg">
          {t.title}
        </h1>
        <p className="text-sm text-space-600 tracking-widest uppercase mt-1">{t.subtitle}</p>
      </div>

      <SearchBar />
      <Toolbar />
      <FlowCanvas />
    </div>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <AppContent />
    </ReactFlowProvider>
  )
}

export default App
