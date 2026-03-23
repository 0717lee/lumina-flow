import dagre from 'dagre';
import { Position } from '@xyflow/react';
import type { FlowEdge, FlowNode } from '@/types/flow';

const DEFAULT_NODE_WIDTH = 220;
const DEFAULT_NODE_HEIGHT = 132;

export function getLayoutedElements(nodes: FlowNode[], edges: FlowEdge[], direction: 'TB' | 'LR' = 'TB') {
  const graph = new dagre.graphlib.Graph();
  const isHorizontal = direction === 'LR';

  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: direction,
    ranksep: 120,
    nodesep: 56,
    marginx: 32,
    marginy: 32,
  });

  nodes.forEach((node) => {
    const width =
      node.measured?.width ??
      (typeof node.style?.width === 'number' ? node.style.width : DEFAULT_NODE_WIDTH);
    const height =
      node.measured?.height ??
      (typeof node.style?.minHeight === 'number' ? node.style.minHeight : DEFAULT_NODE_HEIGHT);

    graph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = graph.node(node.id);
    const width =
      node.measured?.width ??
      (typeof node.style?.width === 'number' ? node.style.width : DEFAULT_NODE_WIDTH);
    const height =
      node.measured?.height ??
      (typeof node.style?.minHeight === 'number' ? node.style.minHeight : DEFAULT_NODE_HEIGHT);

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
