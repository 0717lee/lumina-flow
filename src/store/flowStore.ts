import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import type { EdgeChange, NodeChange, OnConnect, OnEdgesChange, OnNodesChange, XYPosition } from '@xyflow/react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { translations } from '@/i18n/translations';
import type { FlowBoard, FlowEdge, FlowGraphSnapshot, FlowLanguage, FlowNode, FlowNodeData, FlowTheme } from '@/types/flow';
import { cloneSnapshot, createBoard, createBoardName, createFlowNode, createNodeData, normalizeBoard } from '@/utils/flowData';

const STORAGE_KEY = 'lumina-flow-storage';
const STORAGE_VERSION = 2;
const HISTORY_LIMIT = 50;
const STORAGE_DELAY_MS = 300;

type FlowHistoryState = {
  past: FlowGraphSnapshot[];
  future: FlowGraphSnapshot[];
  dragSnapshot: FlowGraphSnapshot | null;
};

type FlowPersistedState = {
  boards: FlowBoard[];
  activeBoardId: string;
  language: FlowLanguage;
  theme: FlowTheme;
};

type FlowStore = FlowPersistedState & {
  history: FlowHistoryState;
  onNodesChange: OnNodesChange<FlowNode>;
  onEdgesChange: OnEdgesChange<FlowEdge>;
  onConnect: OnConnect;
  startDragHistory: () => void;
  commitDragHistory: () => void;
  createNodeAt: (position: XYPosition, overrides?: Partial<FlowNodeData>) => string;
  createLinkedNode: (sourceNodeId: string, mode: 'child' | 'sibling') => string | null;
  updateNode: (id: string, updates: Partial<FlowNodeData>) => void;
  deleteNode: (id: string) => void;
  applyLayout: (nodes: FlowNode[]) => void;
  undo: () => void;
  redo: () => void;
  createBoard: () => string;
  renameBoard: (boardId: string, name: string) => void;
  deleteBoard: (boardId: string) => void;
  setActiveBoard: (boardId: string) => void;
  importBoards: (boards: FlowBoard[]) => string | null;
  toggleLanguage: () => void;
  setTheme: (theme: FlowTheme) => void;
};

const initialPersistedState = createInitialPersistedState('zh');

const useFlowStore = create<FlowStore>()(
  persist(
    (set, get) => ({
      ...initialPersistedState,
      history: createEmptyHistory(),
      onNodesChange: (changes) => {
        const shouldCaptureHistory = changes.some((change) => change.type === 'remove');

        updateActiveBoardGraph(set, get, {
          captureHistory: shouldCaptureHistory,
          nextGraph: (graph) => ({
            nodes: applyNodeChanges(changes as NodeChange<FlowNode>[], graph.nodes) as FlowNode[],
            edges: graph.edges,
          }),
        });
      },
      onEdgesChange: (changes) => {
        const shouldCaptureHistory = changes.some((change) => change.type === 'remove');

        updateActiveBoardGraph(set, get, {
          captureHistory: shouldCaptureHistory,
          nextGraph: (graph) => ({
            nodes: graph.nodes,
            edges: applyEdgeChanges(changes as EdgeChange<FlowEdge>[], graph.edges) as FlowEdge[],
          }),
        });
      },
      onConnect: (connection) => {
        updateActiveBoardGraph(set, get, {
          captureHistory: true,
          nextGraph: (graph) => ({
            nodes: graph.nodes,
            edges: addEdge({ ...connection, animated: false } as FlowEdge, graph.edges) as FlowEdge[],
          }),
        });
      },
      startDragHistory: () => {
        const state = get();

        if (state.history.dragSnapshot) {
          return;
        }

        set({
          history: {
            ...state.history,
            dragSnapshot: cloneSnapshot(selectActiveGraph(state)),
          },
        });
      },
      commitDragHistory: () => {
        const state = get();

        if (!state.history.dragSnapshot) {
          return;
        }

        const nextSnapshot = selectActiveGraph(state);
        const previousSnapshot = state.history.dragSnapshot;

        set({
          history: snapshotsEqual(previousSnapshot, nextSnapshot)
            ? {
                ...state.history,
                dragSnapshot: null,
              }
            : {
                past: pushHistoryEntry(state.history.past, previousSnapshot),
                future: [],
                dragSnapshot: null,
              },
        });
      },
      createNodeAt: (position, overrides) => {
        const state = get();
        const language = state.language;
        const newNode = createFlowNode({
          label: overrides?.label ?? translations[language].newNode,
          note: overrides?.note,
          tags: overrides?.tags,
          color: overrides?.color,
          status: overrides?.status,
          position,
          selected: true,
        });

        updateActiveBoardGraph(set, get, {
          captureHistory: true,
          nextGraph: (graph) => ({
            nodes: selectSingleNode([...graph.nodes, newNode], newNode.id),
            edges: graph.edges,
          }),
        });

        return newNode.id;
      },
      createLinkedNode: (sourceNodeId, mode) => {
        const state = get();
        const graph = selectActiveGraph(state);
        const sourceNode = graph.nodes.find((node) => node.id === sourceNodeId);

        if (!sourceNode) {
          return null;
        }

        const incomingEdge = graph.edges.find((edge) => edge.target === sourceNodeId);
        const parentId = incomingEdge?.source ?? sourceNodeId;
        const anchorNode = graph.nodes.find((node) => node.id === parentId) ?? sourceNode;
        const siblingCount = graph.edges.filter((edge) => edge.source === parentId).length;
        const childCount = graph.edges.filter((edge) => edge.source === sourceNodeId).length;

        const isSibling = mode === 'sibling' && Boolean(incomingEdge);
        const nextPosition = isSibling
          ? {
              x: sourceNode.position.x + 280,
              y: sourceNode.position.y + Math.max(0, siblingCount - 1) * 48,
            }
          : {
              x: anchorNode.position.x + childCount * 48,
              y: sourceNode.position.y + 180,
            };
        const newNode = createFlowNode({
          label: translations[state.language].newNode,
          position: nextPosition,
          selected: true,
        });
        const newEdge: FlowEdge = {
          id: `${parentId}-${newNode.id}`,
          source: parentId,
          target: newNode.id,
          animated: false,
        };

        updateActiveBoardGraph(set, get, {
          captureHistory: true,
          nextGraph: (currentGraph) => ({
            nodes: selectSingleNode([...currentGraph.nodes, newNode], newNode.id),
            edges: [...currentGraph.edges, newEdge],
          }),
        });

        return newNode.id;
      },
      updateNode: (id, updates) => {
        const state = get();
        const graph = selectActiveGraph(state);
        const currentNode = graph.nodes.find((node) => node.id === id);

        if (!currentNode) {
          return;
        }

        const nextData = {
          ...currentNode.data,
          ...updates,
          tags: updates.tags ?? currentNode.data.tags,
          label: updates.label ?? currentNode.data.label,
          note: updates.note ?? currentNode.data.note,
          color: updates.color ?? currentNode.data.color,
          status: updates.status ?? currentNode.data.status,
        };

        if (snapshotsEqual({ nodes: [{ ...currentNode, data: currentNode.data }], edges: [] }, { nodes: [{ ...currentNode, data: nextData }], edges: [] })) {
          return;
        }

        updateActiveBoardGraph(set, get, {
          captureHistory: true,
          nextGraph: (currentGraph) => ({
            nodes: currentGraph.nodes.map((node) => {
              if (node.id !== id) {
                return node;
              }

              return {
                ...node,
                data: createNodeData(nextData.label, nextData),
              };
            }),
            edges: currentGraph.edges,
          }),
        });
      },
      deleteNode: (id) => {
        updateActiveBoardGraph(set, get, {
          captureHistory: true,
          nextGraph: (graph) => ({
            nodes: graph.nodes.filter((node) => node.id !== id),
            edges: graph.edges.filter((edge) => edge.source !== id && edge.target !== id),
          }),
        });
      },
      applyLayout: (nodes) => {
        updateActiveBoardGraph(set, get, {
          captureHistory: true,
          nextGraph: (graph) => ({
            nodes,
            edges: graph.edges,
          }),
        });
      },
      undo: () => {
        const state = get();

        if (state.history.past.length === 0) {
          return;
        }

        const previousSnapshot = state.history.past[state.history.past.length - 1];
        const currentSnapshot = selectActiveGraph(state);

        set({
          boards: replaceActiveBoardGraph(state, previousSnapshot),
          history: {
            past: state.history.past.slice(0, -1),
            future: [cloneSnapshot(currentSnapshot), ...state.history.future],
            dragSnapshot: null,
          },
        });
      },
      redo: () => {
        const state = get();

        if (state.history.future.length === 0) {
          return;
        }

        const [nextSnapshot, ...future] = state.history.future;
        const currentSnapshot = selectActiveGraph(state);

        set({
          boards: replaceActiveBoardGraph(state, nextSnapshot),
          history: {
            past: pushHistoryEntry(state.history.past, currentSnapshot),
            future,
            dragSnapshot: null,
          },
        });
      },
      createBoard: () => {
        const state = get();
        const nextBoard = createBoard({
          name: createBoardName(state.language, state.boards.length + 1),
          starterLabel: translations[state.language].doubleClick,
        });

        set({
          boards: [...state.boards, nextBoard],
          activeBoardId: nextBoard.id,
          history: createEmptyHistory(),
        });

        return nextBoard.id;
      },
      renameBoard: (boardId, name) => {
        const trimmedName = name.trim();

        if (!trimmedName) {
          return;
        }

        const state = get();
        set({
          boards: state.boards.map((board) =>
            board.id === boardId
              ? {
                  ...board,
                  name: trimmedName,
                  updatedAt: new Date().toISOString(),
                }
              : board,
          ),
        });
      },
      deleteBoard: (boardId) => {
        const state = get();

        if (state.boards.length === 1) {
          const replacementBoard = createBoard({
            name: createBoardName(state.language, 1),
            starterLabel: translations[state.language].doubleClick,
          });

          set({
            boards: [replacementBoard],
            activeBoardId: replacementBoard.id,
            history: createEmptyHistory(),
          });
          return;
        }

        const remainingBoards = state.boards.filter((board) => board.id !== boardId);
        const activeBoardId = state.activeBoardId === boardId ? remainingBoards[0].id : state.activeBoardId;

        set({
          boards: remainingBoards,
          activeBoardId,
          history: createEmptyHistory(),
        });
      },
      setActiveBoard: (boardId) => {
        const state = get();

        if (!state.boards.some((board) => board.id === boardId)) {
          return;
        }

        set({
          activeBoardId: boardId,
          history: createEmptyHistory(),
        });
      },
      importBoards: (boards) => {
        if (boards.length === 0) {
          return null;
        }

        const state = get();
        const normalizedBoards = boards.map((board, index) =>
          normalizeBoard(board, createBoardName(state.language, state.boards.length + index + 1)),
        );

        const withUniqueIds = normalizedBoards.map((board) => ({
          ...board,
          id: state.boards.some((existingBoard) => existingBoard.id === board.id) ? `${board.id}-${Date.now()}` : board.id,
        }));
        const nextActiveBoardId = withUniqueIds[withUniqueIds.length - 1]?.id ?? null;

        set({
          boards: [...state.boards, ...withUniqueIds],
          activeBoardId: nextActiveBoardId ?? state.activeBoardId,
          history: createEmptyHistory(),
        });

        return nextActiveBoardId;
      },
      toggleLanguage: () => {
        const state = get();

        set({
          language: state.language === 'en' ? 'zh' : 'en',
        });
      },
      setTheme: (theme) => {
        set({ theme });
      },
    }),
    {
      name: STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => createDebouncedStorage(STORAGE_DELAY_MS)),
      partialize: (state) => ({
        boards: state.boards,
        activeBoardId: state.activeBoardId,
        language: state.language,
        theme: state.theme,
      }),
      migrate: (persistedState, version) => migratePersistedState(persistedState, version),
    },
  ),
);

export function selectActiveBoard(state: FlowStore): FlowBoard {
  return state.boards.find((board) => board.id === state.activeBoardId) ?? state.boards[0];
}

export function selectActiveGraph(state: FlowStore): FlowGraphSnapshot {
  const board = selectActiveBoard(state);
  return {
    nodes: board.nodes,
    edges: board.edges,
  };
}

export default useFlowStore;

function createInitialPersistedState(language: FlowLanguage): FlowPersistedState {
  const board = createBoard({
    name: createBoardName(language, 1),
    starterLabel: translations[language].doubleClick,
  });

  return {
    boards: [board],
    activeBoardId: board.id,
    language,
    theme: 'dark',
  };
}

function createEmptyHistory(): FlowHistoryState {
  return {
    past: [],
    future: [],
    dragSnapshot: null,
  };
}

function updateActiveBoardGraph(
  set: (partial: Partial<FlowStore>) => void,
  get: () => FlowStore,
  options: {
    captureHistory: boolean;
    nextGraph: (graph: FlowGraphSnapshot) => FlowGraphSnapshot;
  },
): void {
  const state = get();
  const currentGraph = selectActiveGraph(state);
  const nextGraph = options.nextGraph(currentGraph);

  set({
    boards: replaceActiveBoardGraph(state, nextGraph),
    history: options.captureHistory
      ? {
          past: pushHistoryEntry(state.history.past, currentGraph),
          future: [],
          dragSnapshot: null,
        }
      : state.history,
  });
}

function replaceActiveBoardGraph(state: FlowStore, graph: FlowGraphSnapshot): FlowBoard[] {
  return state.boards.map((board) =>
    board.id === state.activeBoardId
      ? {
          ...board,
          nodes: graph.nodes,
          edges: graph.edges,
          updatedAt: new Date().toISOString(),
        }
      : board,
  );
}

function pushHistoryEntry(entries: FlowGraphSnapshot[], snapshot: FlowGraphSnapshot): FlowGraphSnapshot[] {
  return [...entries, cloneSnapshot(snapshot)].slice(-HISTORY_LIMIT);
}

function selectSingleNode(nodes: FlowNode[], selectedId: string): FlowNode[] {
  return nodes.map((node) => ({
    ...node,
    selected: node.id === selectedId,
  }));
}

function snapshotsEqual(left: FlowGraphSnapshot, right: FlowGraphSnapshot): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function createDebouncedStorage(delay: number) {
  let timeoutId: number | null = null;
  let pendingKey: string | null = null;
  let pendingValue: string | null = null;

  return {
    getItem: (name: string) => window.localStorage.getItem(name),
    setItem: (name: string, value: string) => {
      pendingKey = name;
      pendingValue = value;

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      timeoutId = window.setTimeout(() => {
        if (pendingKey !== null && pendingValue !== null) {
          window.localStorage.setItem(pendingKey, pendingValue);
        }
      }, delay);
    },
    removeItem: (name: string) => window.localStorage.removeItem(name),
  };
}

function migratePersistedState(persistedState: unknown, version: number): FlowPersistedState {
  if (version === STORAGE_VERSION && isPersistedState(persistedState)) {
    return {
      ...persistedState,
      boards: persistedState.boards.map((board, index) =>
        normalizeBoard(board, createBoardName(persistedState.language, index + 1)),
      ),
    };
  }

  const state = isRecord(persistedState) ? persistedState : {};
  const language = state.language === 'en' ? 'en' : 'zh';
  const theme = state.theme === 'light' || state.theme === 'system' ? state.theme : 'dark';

  if (Array.isArray(state.boards)) {
    const boards = state.boards.map((board, index) => normalizeBoard(board, createBoardName(language, index + 1)));
    const activeBoardId =
      typeof state.activeBoardId === 'string' && boards.some((board) => board.id === state.activeBoardId)
        ? state.activeBoardId
        : boards[0]?.id ?? createInitialPersistedState(language).activeBoardId;

    return {
      boards,
      activeBoardId,
      language,
      theme,
    };
  }

  if (Array.isArray(state.nodes) && Array.isArray(state.edges)) {
    const board = normalizeBoard(
      {
        name: createBoardName(language, 1),
        nodes: state.nodes,
        edges: state.edges,
      },
      createBoardName(language, 1),
    );

    return {
      boards: [board],
      activeBoardId: board.id,
      language,
      theme,
    };
  }

  return createInitialPersistedState(language);
}

function isPersistedState(value: unknown): value is FlowPersistedState {
  return (
    isRecord(value) &&
    Array.isArray(value.boards) &&
    typeof value.activeBoardId === 'string' &&
    (value.language === 'en' || value.language === 'zh') &&
    (value.theme === 'dark' || value.theme === 'light' || value.theme === 'system')
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
