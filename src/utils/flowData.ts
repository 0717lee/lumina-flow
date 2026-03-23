import type { FlowBoard, FlowEdge, FlowGraphSnapshot, FlowLanguage, FlowNode, FlowNodeColor, FlowNodeData, FlowNodeStatus } from '@/types/flow';

const DEFAULT_NODE_WIDTH = 220;
const DEFAULT_NODE_HEIGHT = 132;

const VALID_COLORS: FlowNodeColor[] = ['nebula', 'sun', 'mint', 'rose'];
const VALID_STATUSES: FlowNodeStatus[] = ['idea', 'question', 'todo', 'done'];

export function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createNodeData(label: string, overrides: Partial<FlowNodeData> = {}): FlowNodeData {
  return {
    label,
    note: overrides.note ?? '',
    tags: normalizeTagList(overrides.tags),
    color: normalizeNodeColor(overrides.color),
    status: normalizeNodeStatus(overrides.status),
  };
}

export function createFlowNode(input: {
  label: string;
  position: { x: number; y: number };
  note?: string;
  tags?: string[];
  color?: FlowNodeColor;
  status?: FlowNodeStatus;
  selected?: boolean;
}): FlowNode {
  return {
    id: createId('node'),
    type: 'glass',
    position: input.position,
    selected: input.selected,
    data: createNodeData(input.label, {
      note: input.note,
      tags: input.tags,
      color: input.color,
      status: input.status,
    }),
    style: {
      width: DEFAULT_NODE_WIDTH,
      minHeight: DEFAULT_NODE_HEIGHT,
    },
  };
}

export function createBoardName(language: FlowLanguage, index: number): string {
  return language === 'zh' ? `画布 ${index}` : `Board ${index}`;
}

export function createBoard(input: {
  name: string;
  starterLabel: string;
  starterPosition?: { x: number; y: number };
}): FlowBoard {
  const now = new Date().toISOString();
  const starterNode = createFlowNode({
    label: input.starterLabel,
    position: input.starterPosition ?? { x: 0, y: 0 },
  });

  return {
    id: createId('board'),
    name: input.name,
    createdAt: now,
    updatedAt: now,
    nodes: [starterNode],
    edges: [],
  };
}

export function toGraphSnapshot(board: FlowBoard): FlowGraphSnapshot {
  return {
    nodes: cloneValue(board.nodes),
    edges: cloneValue(board.edges),
  };
}

export function cloneSnapshot(snapshot: FlowGraphSnapshot): FlowGraphSnapshot {
  return cloneValue(snapshot);
}

export function normalizeBoard(input: unknown, fallbackName: string): FlowBoard {
  const board = isRecord(input) ? input : {};
  const now = new Date().toISOString();

  const nodes = Array.isArray(board.nodes)
    ? board.nodes.map((node, index) => normalizeNode(node, index))
    : [];
  const edges = Array.isArray(board.edges)
    ? board.edges.map((edge, index) => normalizeEdge(edge, index))
    : [];

  return {
    id: typeof board.id === 'string' && board.id.length > 0 ? board.id : createId('board'),
    name: typeof board.name === 'string' && board.name.trim().length > 0 ? board.name.trim() : fallbackName,
    createdAt: typeof board.createdAt === 'string' ? board.createdAt : now,
    updatedAt: typeof board.updatedAt === 'string' ? board.updatedAt : now,
    nodes,
    edges,
  };
}

export function ensureSingleSelected(nodes: FlowNode[], selectedId: string | null): FlowNode[] {
  return nodes.map((node) => {
    const nextSelected = selectedId !== null && node.id === selectedId;

    if (node.selected === nextSelected) {
      return node;
    }

    return {
      ...node,
      selected: nextSelected,
    };
  });
}

export function normalizeNodeColor(color: unknown): FlowNodeColor {
  return VALID_COLORS.includes(color as FlowNodeColor) ? (color as FlowNodeColor) : 'nebula';
}

export function normalizeNodeStatus(status: unknown): FlowNodeStatus {
  return VALID_STATUSES.includes(status as FlowNodeStatus) ? (status as FlowNodeStatus) : 'idea';
}

function normalizeNode(input: unknown, index: number): FlowNode {
  const node = isRecord(input) ? input : {};
  const data = isRecord(node.data) ? node.data : {};

  return {
    id: typeof node.id === 'string' && node.id.length > 0 ? node.id : createId(`import-node-${index}`),
    type: 'glass',
    position: normalizePosition(node.position),
    selected: Boolean(node.selected),
    data: createNodeData(typeof data.label === 'string' && data.label.trim().length > 0 ? data.label : 'Untitled', {
      note: typeof data.note === 'string' ? data.note : '',
      tags: normalizeTagList(data.tags),
      color: normalizeNodeColor(data.color),
      status: normalizeNodeStatus(data.status),
    }),
    style: {
      width: DEFAULT_NODE_WIDTH,
      minHeight: DEFAULT_NODE_HEIGHT,
    },
  };
}

function normalizeEdge(input: unknown, index: number): FlowEdge {
  const edge = isRecord(input) ? input : {};

  return {
    id: typeof edge.id === 'string' && edge.id.length > 0 ? edge.id : createId(`edge-${index}`),
    source: typeof edge.source === 'string' ? edge.source : '',
    target: typeof edge.target === 'string' ? edge.target : '',
    animated: false,
  };
}

function normalizePosition(position: unknown): { x: number; y: number } {
  const candidate = isRecord(position) ? position : {};

  return {
    x: typeof candidate.x === 'number' ? candidate.x : 0,
    y: typeof candidate.y === 'number' ? candidate.y : 0,
  };
}

function normalizeTagList(tags: unknown): string[] {
  if (!Array.isArray(tags)) {
    return [];
  }

  return tags
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function cloneValue<T>(value: T): T {
  return structuredClone(value);
}
