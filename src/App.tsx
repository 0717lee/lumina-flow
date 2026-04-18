import { ChevronLeft, ChevronRight, Layers3, SlidersHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useEffect } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import BoardManager from '@/components/BoardManager';
import FlowCanvas from '@/components/FlowCanvas';
import InspectorPanel from '@/components/InspectorPanel';
import SearchBar from '@/components/SearchBar';
import ShortcutHelpOverlay from '@/components/ShortcutHelpOverlay';
import ToastViewport from '@/components/Toast';
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
  const helpOverlayOpen = useFlowUiStore((state) => state.helpOverlayOpen);
  const setWorkspaceOpen = useFlowUiStore((state) => state.setWorkspaceOpen);
  const setInspectorOpen = useFlowUiStore((state) => state.setInspectorOpen);
  const setHelpOverlayOpen = useFlowUiStore((state) => state.setHelpOverlayOpen);
  const t = translations[language];
  const closePanels = useCallback(() => {
    setWorkspaceOpen(false);
    setInspectorOpen(false);
  }, [setInspectorOpen, setWorkspaceOpen]);
  const closeHelpOverlay = useCallback(() => setHelpOverlayOpen(false), [setHelpOverlayOpen]);
  const toggleWorkspace = useCallback(() => {
    const nextOpen = !workspaceOpen;

    if (nextOpen && window.innerWidth < 768) {
      setInspectorOpen(false);
    }

    setWorkspaceOpen(nextOpen);
  }, [setInspectorOpen, setWorkspaceOpen, workspaceOpen]);
  const toggleInspector = useCallback(() => {
    const nextOpen = !inspectorOpen;

    if (nextOpen && window.innerWidth < 768) {
      setWorkspaceOpen(false);
    }

    setInspectorOpen(nextOpen);
  }, [inspectorOpen, setInspectorOpen, setWorkspaceOpen]);
  const mobilePanelOpen = workspaceOpen || inspectorOpen;

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
      if (window.innerWidth < 768) {
        setWorkspaceOpen(false);
      }

      setInspectorOpen(true);
    }
  }, [selectedNodeId, setInspectorOpen, setWorkspaceOpen]);

  useEffect(() => {
    const syncMobilePanels = (): void => {
      if (window.innerWidth >= 768 || !workspaceOpen || !inspectorOpen) {
        return;
      }

      if (selectedNodeId) {
        setWorkspaceOpen(false);
        return;
      }

      setInspectorOpen(false);
    };

    syncMobilePanels();
    window.addEventListener('resize', syncMobilePanels);
    return () => window.removeEventListener('resize', syncMobilePanels);
  }, [inspectorOpen, selectedNodeId, setInspectorOpen, setWorkspaceOpen, workspaceOpen]);

  return (
    <div className="relative w-full h-screen bg-space-900 text-starlight-200 overflow-hidden font-sans">
      <div className="absolute top-6 left-6 z-50 pointer-events-none select-none">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-nebula-400 to-amber-300 tracking-tight filter drop-shadow-lg sm:text-4xl">
          {t.title}
        </h1>
        <p
          className={
            language === 'zh'
              ? 'mt-1 hidden text-sm text-starlight-400 sm:block'
              : 'mt-1 hidden text-sm uppercase tracking-widest text-starlight-400 sm:block'
          }
        >
          {t.subtitle}
        </p>
      </div>

      <PanelToggle
        side="left"
        isOpen={workspaceOpen}
        text={t.workspace}
        label={workspaceOpen ? t.hideWorkspace : t.showWorkspace}
        onClick={toggleWorkspace}
        icon={workspaceOpen ? <ChevronLeft size={16} /> : <Layers3 size={16} />}
      />
      <PanelToggle
        side="right"
        isOpen={inspectorOpen}
        text={t.inspector}
        label={inspectorOpen ? t.hideInspector : t.showInspector}
        onClick={toggleInspector}
        icon={inspectorOpen ? <ChevronRight size={16} /> : <SlidersHorizontal size={16} />}
      />

      {mobilePanelOpen ? (
        <button
          type="button"
          aria-label={t.close}
          className="absolute inset-0 z-40 bg-space-950/50 backdrop-blur-[1px] md:hidden"
          onClick={closePanels}
        />
      ) : null}

      <BoardManager />
      <SearchBar key={activeBoardId} />
      <InspectorPanel />
      <Toolbar />
      <FlowCanvas />

      <ToastViewport />
      <ShortcutHelpOverlay open={helpOverlayOpen} onClose={closeHelpOverlay} />
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
        'absolute top-24 z-50 flex items-center gap-2 rounded-full border border-space-700 bg-space-800/90 px-3 py-2 text-sm text-starlight-100 shadow-xl backdrop-blur-2xl transition-all hover:border-nebula-500 hover:text-nebula-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-500/80 focus-visible:ring-offset-1 focus-visible:ring-offset-space-900 sm:px-4 sm:py-2.5',
        props.side === 'left' ? 'left-4 sm:left-6' : 'right-4 sm:right-6 flex-row-reverse',
      ].join(' ')}
      title={props.label}
      aria-label={props.label}
    >
      {props.icon}
      <span className="hidden sm:inline">{props.text}</span>
    </button>
  );
}
