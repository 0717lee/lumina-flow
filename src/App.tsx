import { ChevronLeft, ChevronRight, Layers3, SlidersHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import BoardManager from '@/components/BoardManager';
import FlowCanvas from '@/components/FlowCanvas';
import InspectorPanel from '@/components/InspectorPanel';
import SearchBar from '@/components/SearchBar';
import Toolbar from '@/components/Toolbar';
import { translations } from '@/i18n/translations';
import useFlowStore from '@/store/flowStore';
import { useFlowUiStore } from '@/store/uiStore';

function AppContent() {
  const language = useFlowStore((state) => state.language);
  const theme = useFlowStore((state) => state.theme);
  const activeBoardId = useFlowStore((state) => state.activeBoardId);
  const selectedNodeId = useFlowUiStore((state) => state.selectedNodeId);
  const workspaceOpen = useFlowUiStore((state) => state.workspaceOpen);
  const inspectorOpen = useFlowUiStore((state) => state.inspectorOpen);
  const setWorkspaceOpen = useFlowUiStore((state) => state.setWorkspaceOpen);
  const setInspectorOpen = useFlowUiStore((state) => state.setInspectorOpen);
  const t = translations[language];

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (): void => {
      root.classList.remove('light', 'dark');

      if (theme === 'system') {
        const resolvedTheme = mediaQuery.matches ? 'dark' : 'light';
        root.classList.add(resolvedTheme);
        root.style.colorScheme = resolvedTheme;
        return;
      }

      root.classList.add(theme);
      root.style.colorScheme = theme;
    };

    applyTheme();

    if (theme !== 'system') {
      return;
    }

    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [theme]);

  useEffect(() => {
    if (selectedNodeId) {
      setInspectorOpen(true);
    }
  }, [selectedNodeId, setInspectorOpen]);

  return (
    <div className="relative w-full h-screen bg-space-900 text-starlight-200 overflow-hidden font-sans">
      <div className="absolute top-6 left-6 z-50 pointer-events-none select-none">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-nebula-400 to-amber-300 tracking-tight filter drop-shadow-lg">
          {t.title}
        </h1>
        <p className="text-sm text-space-600 tracking-widest uppercase mt-1">{t.subtitle}</p>
      </div>

      <PanelToggle
        side="left"
        isOpen={workspaceOpen}
        text={t.workspace}
        label={workspaceOpen ? t.hideWorkspace : t.showWorkspace}
        onClick={() => setWorkspaceOpen(!workspaceOpen)}
        icon={workspaceOpen ? <ChevronLeft size={16} /> : <Layers3 size={16} />}
      />
      <PanelToggle
        side="right"
        isOpen={inspectorOpen}
        text={t.inspector}
        label={inspectorOpen ? t.hideInspector : t.showInspector}
        onClick={() => setInspectorOpen(!inspectorOpen)}
        icon={inspectorOpen ? <ChevronRight size={16} /> : <SlidersHorizontal size={16} />}
      />

      <BoardManager />
      <SearchBar key={activeBoardId} />
      <InspectorPanel />
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
  );
}

export default App;

function PanelToggle(props: {
  side: 'left' | 'right';
  isOpen: boolean;
  text: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={props.onClick}
      className={[
        'absolute top-24 z-50 flex items-center gap-2 rounded-full border border-space-700 bg-space-800/90 px-4 py-2.5 text-sm text-starlight-100 shadow-xl backdrop-blur-2xl transition-all hover:border-nebula-500 hover:text-nebula-400',
        props.side === 'left' ? 'left-6' : 'right-6 flex-row-reverse',
      ].join(' ')}
      title={props.label}
    >
      {props.icon}
      <span>{props.text}</span>
    </button>
  );
}
