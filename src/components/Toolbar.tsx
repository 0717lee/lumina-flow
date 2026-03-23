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
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-2">
      <div className="flex items-center bg-space-800/90 backdrop-blur-xl border border-space-600 rounded-full p-1.5 shadow-2xl ring-1 ring-white/10">
        <ToolbarButton
          onClick={() => {
            const next = theme === 'system' ? 'dark' : theme === 'dark' ? 'light' : 'system';
            setTheme(next);
          }}
          title={`${t.theme}: ${t[theme]}`}
        >
          {theme === 'light' ? <Sun size={20} /> : theme === 'dark' ? <Moon size={20} /> : <Monitor size={20} />}
        </ToolbarButton>

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
      className="p-3 rounded-full text-space-600 hover:text-nebula-400 hover:bg-space-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      title={props.title}
    >
      {props.children}
    </button>
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
