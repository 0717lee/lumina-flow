import { Camera, ImageUp, Monitor, Moon, Redo2, Sun, Undo2 } from 'lucide-react';
import { getNodesBounds, getViewportForBounds, useReactFlow } from '@xyflow/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { translations } from '@/i18n/translations';
import useFlowStore, { selectActiveBoard } from '@/store/flowStore';
import { useFlowUiStore } from '@/store/uiStore';

export default function Toolbar() {
  const activeBoard = useFlowStore(selectActiveBoard);
  const language = useFlowStore((state) => state.language);
  const theme = useFlowStore((state) => state.theme);
  const setTheme = useFlowStore((state) => state.setTheme);
  const undo = useFlowStore((state) => state.undo);
  const redo = useFlowStore((state) => state.redo);
  const canUndo = useFlowStore((state) => state.history.past.length > 0);
  const canRedo = useFlowStore((state) => state.history.future.length > 0);
  const resetCanvasUi = useFlowUiStore((state) => state.resetCanvasUi);
  const { getViewport } = useReactFlow();
  const [exportMode, setExportMode] = useState<'current' | 'full' | null>(null);
  const t = translations[language];

  const handleCurrentSnapshot = async (): Promise<void> => {
    const flowElement = document.querySelector('.react-flow__viewport') as HTMLElement | null;

    if (!flowElement || exportMode) {
      return;
    }

    setExportMode('current');

    try {
      const { toPng } = await import('html-to-image');
      const viewport = getViewport();
      const dataUrl = await toPng(flowElement, {
        backgroundColor: getCanvasBackground(theme),
        width: flowElement.offsetWidth,
        height: flowElement.offsetHeight,
        pixelRatio: 2,
        style: {
          width: `${flowElement.offsetWidth}px`,
          height: `${flowElement.offsetHeight}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      });

      downloadImage(dataUrl, `${activeBoard.name}-view.png`);
    } finally {
      setExportMode(null);
    }
  };

  const handleFullSnapshot = async (): Promise<void> => {
    const flowElement = document.querySelector('.react-flow__viewport') as HTMLElement | null;

    if (!flowElement || exportMode || activeBoard.nodes.length === 0) {
      return;
    }

    setExportMode('full');

    try {
      const { toPng } = await import('html-to-image');
      const bounds = getNodesBounds(activeBoard.nodes);
      const imageWidth = Math.max(1280, Math.ceil(bounds.width + 240));
      const imageHeight = Math.max(960, Math.ceil(bounds.height + 240));
      const viewport = getViewportForBounds(bounds, imageWidth, imageHeight, 0.2, 1.5, 0.12);
      const dataUrl = await toPng(flowElement, {
        backgroundColor: getCanvasBackground(theme),
        width: imageWidth,
        height: imageHeight,
        pixelRatio: 2,
        style: {
          width: `${imageWidth}px`,
          height: `${imageHeight}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      });

      downloadImage(dataUrl, `${activeBoard.name}-board.png`);
    } finally {
      setExportMode(null);
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 z-50 flex w-[calc(100%-1.5rem)] max-w-max -translate-x-1/2 gap-2 sm:bottom-6 sm:w-auto">
      <div className="flex w-full items-center justify-center overflow-x-auto bg-space-800/90 backdrop-blur-xl border border-space-600 rounded-full p-1.5 shadow-2xl ring-1 ring-white/10 sm:w-auto">
        <ThemeSegmented theme={theme} setTheme={setTheme} labels={{ light: t.light, dark: t.dark, system: t.system, theme: t.theme }} />

        <Divider />

        <ToolbarButton
          onClick={() => {
            resetCanvasUi();
            undo();
          }}
          title={t.undo}
          disabled={!canUndo}
        >
          <Undo2 size={18} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => {
            resetCanvasUi();
            redo();
          }}
          title={t.redo}
          disabled={!canRedo}
        >
          <Redo2 size={18} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton onClick={handleCurrentSnapshot} title={t.snapshot} disabled={exportMode !== null}>
          <Camera size={20} className={exportMode === 'current' ? 'animate-pulse' : ''} />
        </ToolbarButton>

        <ToolbarButton onClick={handleFullSnapshot} title={t.fullSnapshot} disabled={exportMode !== null}>
          <ImageUp size={20} className={exportMode === 'full' ? 'animate-pulse' : ''} />
        </ToolbarButton>
      </div>
    </div>
  );
}

function ToolbarButton(props: {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      className="p-3 rounded-full text-starlight-400 hover:text-nebula-400 hover:bg-space-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-500 focus-visible:ring-offset-2 focus-visible:ring-offset-space-800"
      title={props.title}
      aria-label={props.title}
    >
      {props.children}
    </button>
  );
}

function ThemeSegmented(props: {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  labels: { light: string; dark: string; system: string; theme: string };
}) {
  const options: Array<{ value: 'light' | 'dark' | 'system'; icon: ReactNode; label: string }> = [
    { value: 'light', icon: <Sun size={16} />, label: props.labels.light },
    { value: 'dark', icon: <Moon size={16} />, label: props.labels.dark },
    { value: 'system', icon: <Monitor size={16} />, label: props.labels.system },
  ];

  return (
    <div className="flex items-center gap-0.5" role="radiogroup" aria-label={props.labels.theme}>
      {options.map((option) => {
        const active = props.theme === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${props.labels.theme}: ${option.label}`}
            title={`${props.labels.theme}: ${option.label}`}
            onClick={() => props.setTheme(option.value)}
            className={
              active
                ? 'flex items-center justify-center w-9 h-9 rounded-full bg-space-700 text-nebula-400 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-500 focus-visible:ring-offset-2 focus-visible:ring-offset-space-800 transition-colors'
                : 'flex items-center justify-center w-9 h-9 rounded-full text-starlight-400 hover:text-starlight-100 hover:bg-space-700/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-500 focus-visible:ring-offset-2 focus-visible:ring-offset-space-800 transition-colors'
            }
          >
            {option.icon}
          </button>
        );
      })}
    </div>
  );
}

function Divider() {
  return <div className="w-px h-8 bg-space-700 mx-1" />;
}

function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement('a');

  link.href = dataUrl;
  link.download = filename.replace(/\s+/g, '-').toLowerCase();
  link.click();
}

function getCanvasBackground(theme: 'dark' | 'light' | 'system'): string {
  if (theme === 'light') {
    return '#f1f5f9';
  }

  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? '#050508' : '#f1f5f9';
  }

  return '#050508';
}
