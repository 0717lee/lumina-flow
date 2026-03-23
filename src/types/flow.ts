import type { Edge, Node, XYPosition } from '@xyflow/react';

export type FlowTheme = 'dark' | 'light' | 'system';
export type FlowLanguage = 'en' | 'zh';
export type FlowNodeStatus = 'idea' | 'question' | 'todo' | 'done';
export type FlowNodeColor = 'nebula' | 'sun' | 'mint' | 'rose';

export type FlowNodeData = {
  label: string;
  note: string;
  tags: string[];
  color: FlowNodeColor;
  status: FlowNodeStatus;
};

export type FlowNode = Node<FlowNodeData, 'glass'>;
export type FlowEdge = Edge;

export type FlowGraphSnapshot = {
  nodes: FlowNode[];
  edges: FlowEdge[];
};

export type FlowBoard = FlowGraphSnapshot & {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateNodeInput = {
  label: string;
  position: XYPosition;
  note?: string;
  tags?: string[];
  color?: FlowNodeColor;
  status?: FlowNodeStatus;
  selected?: boolean;
};

export const FLOW_NODE_COLORS: FlowNodeColor[] = ['nebula', 'sun', 'mint', 'rose'];
export const FLOW_NODE_STATUSES: FlowNodeStatus[] = ['idea', 'question', 'todo', 'done'];
