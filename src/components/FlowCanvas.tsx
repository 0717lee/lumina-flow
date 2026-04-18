import { Background, BackgroundVariant, ReactFlow, useOnSelectionChange, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Maximize, Minus, Plus, Workflow } from 'lucide-react';
import type { MouseEvent, ReactNode } from 'react';
import { startTransition, useEffect, useState } from 'react';
import { translations } from '@/i18n/translations';
import GlassNode from '@/nodes/GlassNode';
import useFlowStore, { selectActiveBoard } from '@/store/flowStore';
import { useFlowUiStore } from '@/store/uiStore';
import EmptyState from '@/components/EmptyState';
import type { FlowEdge } from '@/types/flow';

const nodeTypes = {
  glass: GlassNode,
};

export default function FlowCanvas() {
  const activeBoardId = useFlowStore((state) => state.activeBoardId);
  const nodes = useFlowStore((state) => selectActiveBoard(state).nodes);
  const edges = useFlowStore((state) => selectActiveBoard(state).edges);
  const language = useFlowStore((state) => state.language);
  const theme = useFlowStore((state) => state.theme);
  const onNodesChange = useFlowStore((state) => state.onNodesChange);
  const onEdgesChange = useFlowStore((state) => state.onEdgesChange);
  const onConnect = useFlowStore((state) => state.onConnect);
  const createNodeAt = useFlowStore((state) => state.createNodeAt);
  const createLinkedNode = useFlowStore((state) => state.createLinkedNode);
  const deleteNode = useFlowStore((state) => state.deleteNode);
  const applyLayout = useFlowStore((state) => state.applyLayout);
  const startDragHistory = useFlowStore((state) => state.startDragHistory);
  const commitDragHistory = useFlowStore((state) => state.commitDragHistory);
  const undo = useFlowStore((state) => state.undo);
  const redo = useFlowStore((state) => state.redo);
  const selectedNodeId = useFlowUiStore((state) => state.selectedNodeId);
  const helpOverlayOpen = useFlowUiStore((state) => state.helpOverlayOpen);
  const requestNodeFocus = useFlowUiStore((state) => state.requestNodeFocus);
  const resetCanvasUi = useFlowUiStore((state) => state.resetCanvasUi);
  const setSelection = useFlowUiStore((state) => state.setSelection);
  const requestSearchFocus = useFlowUiStore((state) => state.requestSearchFocus);
  const setHelpOverlayOpen = useFlowUiStore((state) => state.setHelpOverlayOpen);
  const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow();
  const [isLayouting, setIsLayouting] = useState(false);
  const t = translations[language];

  useOnSelectionChange({
    onChange: ({ nodes: selectedNodes }) => {
      const selectedId = selectedNodes[0]?.id ?? null;
      const connectedNodeIds = selectedId ? collectConnectedNodeIds(selectedNodes, edges) : [];

      setSelection(selectedId, connectedNodeIds);
    },
  });

  useEffect(() => {
    resetCanvasUi();
    window.requestAnimationFrame(() => fitView({ duration: 450, padding: 0.25 }));
  }, [activeBoardId, fitView, resetCanvasUi]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (helpOverlayOpen) {
        return;
      }

      if (isEditableTarget(event.target)) {
        return;
      }

      const isSearchFocusShortcut =
        event.key === '/' || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k');

      if (isSearchFocusShortcut) {
        event.preventDefault();
        requestSearchFocus();
        return;
      }

      if (event.key === '?') {
        event.preventDefault();
        setHelpOverlayOpen(true);
        return;
      }

      const isUndoShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z';

      if (isUndoShortcut) {
        event.preventDefault();
        resetCanvasUi();

        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }

        return;
      }

      if (!selectedNodeId) {
        return;
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        const nodeId = createLinkedNode(selectedNodeId, 'child');

        if (nodeId) {
          requestNodeFocus(nodeId);
        }
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        const nodeId = createLinkedNode(selectedNodeId, 'sibling');

        if (nodeId) {
          requestNodeFocus(nodeId);
        }
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        deleteNode(selectedNodeId);
        resetCanvasUi();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createLinkedNode, deleteNode, helpOverlayOpen, redo, requestNodeFocus, requestSearchFocus, resetCanvasUi, selectedNodeId, setHelpOverlayOpen, undo]);

  const onPaneDoubleClick = (event: MouseEvent<HTMLDivElement>): void => {
    const target = event.target as HTMLElement;

    if (target.closest('.react-flow__node') || target.closest('button') || target.closest('input') || target.closest('textarea')) {
      return;
    }

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    const nodeId = createNodeAt(position);

    requestNodeFocus(nodeId);
  };

  const onLayout = async (): Promise<void> => {
    if (isLayouting || nodes.length < 2) {
      return;
    }

    setIsLayouting(true);

    try {
      const { getLayoutedElements } = await import('@/utils/layout');
      const { nodes: layoutedNodes } = getLayoutedElements(nodes, edges);

      startTransition(() => {
        applyLayout(layoutedNodes);
      });

      window.requestAnimationFrame(() => fitView({ duration: 850, padding: 0.25 }));
    } finally {
      setIsLayouting(false);
    }
  };

  const effectiveTheme = theme === 'system'
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    : theme;
  const gridColor = effectiveTheme === 'light' ? '#64748b' : '#818cf8';

  return (
    <div className="w-full h-full bg-space-950">
      {nodes.length === 0 ? <EmptyState /> : null}
      <div className="w-full h-full" onDoubleClick={onPaneDoubleClick}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDragStart={startDragHistory}
          onNodeDragStop={commitDragHistory}
          deleteKeyCode={null}
          zoomOnDoubleClick={false}
          fitView
          className="touch-none"
          minZoom={0.45}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: false,
            style: {
              stroke: effectiveTheme === 'light' ? '#4f46e5' : '#818cf8',
              strokeWidth: 2.5,
            },
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            color={gridColor}
            gap={24}
            size={3}
            className="opacity-40 transition-colors duration-300"
          />

          <div className="absolute bottom-24 left-4 z-50 flex flex-col gap-1 rounded-2xl border border-space-700 bg-space-800/90 p-1.5 shadow-xl backdrop-blur-xl sm:bottom-6 sm:left-6">
            <ControlButton onClick={() => zoomIn()} title={t.zoomIn}>
              <Plus size={16} />
            </ControlButton>
            <Divider />
            <ControlButton onClick={() => zoomOut()} title={t.zoomOut}>
              <Minus size={16} />
            </ControlButton>
            <Divider />
            <ControlButton onClick={() => fitView({ duration: 500, padding: 0.25 })} title={t.fitView}>
              <Maximize size={16} />
            </ControlButton>
            <Divider />
            <ControlButton onClick={onLayout} title={isLayouting ? t.layoutPending : t.autoLayout} disabled={isLayouting}>
              <Workflow size={16} className={isLayouting ? 'animate-pulse' : ''} />
            </ControlButton>
          </div>
        </ReactFlow>
      </div>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-space-gradient opacity-50 mix-blend-overlay" />
    </div>
  );
}

function ControlButton(props: {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      className="rounded-xl p-2 text-nebula-400 transition-colors hover:bg-space-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-500/80 focus-visible:ring-offset-1 focus-visible:ring-offset-space-900"
      title={props.title}
      aria-label={props.title}
    >
      {props.children}
    </button>
  );
}

function Divider() {
  return <div className="h-px w-full bg-space-700" />;
}

function collectConnectedNodeIds(selectedNodes: Array<{ id: string }>, edges: FlowEdge[]): string[] {
  const connectedIds = new Set<string>();

  selectedNodes.forEach((node) => {
    connectedIds.add(node.id);

    edges.forEach((edge) => {
      if (edge.source === node.id) {
        connectedIds.add(edge.target);
      }

      if (edge.target === node.id) {
        connectedIds.add(edge.source);
      }
    });
  });

  return Array.from(connectedIds);
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}
