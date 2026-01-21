import dagre from 'dagre';
import { Position } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        // Determine dimensions. GlassNodes usually have a minimum width/height.
        // If we can't dynamic measure, we estimate.
        dagreGraph.setNode(node.id, { width: 200, height: 80 });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches React Flow's anchor point.
        // Actually dagre node position is center. React Flow default is top left.
        // Let's adjust.
        return {
            ...node,
            targetPosition: isHorizontal ? Position.Left : Position.Top,
            sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
            // We explicitly create a new object to force position update
            position: {
                x: nodeWithPosition.x - 200 / 2,
                y: nodeWithPosition.y - 80 / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};
