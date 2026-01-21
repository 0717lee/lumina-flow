import { ReactFlow, Background, useReactFlow, MiniMap, BackgroundVariant, useOnSelectionChange } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import useFlowStore from '@/store/flowStore';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect } from 'react';
import { translations } from '@/i18n/translations';
import { Plus, Minus, Maximize, Workflow } from 'lucide-react';
import { getLayoutedElements } from '@/utils/layout';

import GlassNode from '@/nodes/GlassNode';

const nodeTypes = {
    glass: GlassNode,
};

export default function FlowCanvas() {
    const { nodes, edges, onNodesChange, onEdgesChange, onConnect, setNodes, addNode, language, theme } = useFlowStore();
    const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow();
    const t = translations[language];

    // Update spotlight when selection changes
    useOnSelectionChange({
        onChange: ({ nodes: selectedNodes }) => {
            const ids = new Set(selectedNodes.map(n => n.id));

            // Calculate connected nodes if a node is selected
            if (ids.size > 0) {
                const connectedParams = new Set<string>();
                ids.forEach(id => {
                    connectedParams.add(id);
                    // Find neighbors
                    edges.forEach(edge => {
                        if (edge.source === id) connectedParams.add(edge.target);
                        if (edge.target === id) connectedParams.add(edge.source);
                    });
                });

                // Update nodes 'dimmed' status
                setNodes(nodes.map(node => ({
                    ...node,
                    data: {
                        ...node.data,
                        dimmed: !connectedParams.has(node.id)
                    }
                })));
            } else {
                // Reset if nothing selected - Only loop if needed to avoid infinite loop provided setNodes is stable
                // Check if any node is currently dimmed to avoid redundant updates
                const hasDimmed = nodes.some(n => (n.data as any).dimmed);
                if (hasDimmed) {
                    setNodes(nodes.map(node => ({
                        ...node,
                        data: {
                            ...node.data,
                            dimmed: false
                        }
                    })));
                }
            }
        },
    });

    // --- Auto Layout Logic ---
    const onLayout = useCallback(() => {
        const { nodes: layoutedNodes } = getLayoutedElements(
            nodes,
            edges
        );
        setNodes([...layoutedNodes]);
        window.requestAnimationFrame(() => fitView({ duration: 800 }));
    }, [nodes, edges, setNodes, fitView]);


    // Determine effective theme for grid color
    const effectiveTheme = theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;

    // Higher contrast colors for "feeling" the grid
    const gridColor = effectiveTheme === 'light' ? '#64748b' : '#818cf8'; // Slate-500 or Lighter Indigo

    // Initialize with some data if empty
    useEffect(() => {
        if (nodes.length === 0) {
            const initialNodes: Node[] = [
                { id: '1', position: { x: 0, y: 0 }, data: { label: t.doubleClick }, type: 'glass' },
            ];
            setNodes(initialNodes);
        }
    }, [nodes.length, setNodes, t.doubleClick]);

    const onPaneDoubleClick = useCallback(
        (event: React.MouseEvent) => {
            const position = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: `${Date.now()}`,
                type: 'glass',
                position,
                data: { label: t.newNode },
            };

            addNode(newNode);
        },
        [screenToFlowPosition, addNode, t.newNode],
    );

    return (
        <div
            className="w-full h-full bg-space-950"
            onDoubleClick={onPaneDoubleClick}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                zoomOnDoubleClick={false}
                fitView
                className="touch-none"
                minZoom={0.5}
                maxZoom={2}
                defaultEdgeOptions={{
                    type: 'default',
                    animated: true,
                    style: { stroke: '#6366f1', strokeWidth: 2 },
                }}
                proOptions={{ hideAttribution: true }}
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    color={gridColor}
                    gap={24}
                    size={3} // Increased size
                    className="opacity-40 transition-colors duration-300" // Increased opacity
                />
                <MiniMap
                    className="!bg-space-800 !border-space-700 !rounded-lg"
                    nodeColor="#6366f1"
                    maskColor="rgba(5, 5, 8, 0.8)"
                    ariaLabel={t.miniMap}
                    title={t.miniMap} // Visual tooltip
                />
                <div className="absolute bottom-6 left-6 z-50 flex flex-col gap-1 bg-space-800 border border-space-700 rounded-lg p-1 shadow-lg">
                    <button
                        onClick={() => zoomIn()}
                        className="p-2 text-nebula-400 hover:bg-space-700 rounded transition-colors"
                        title={t.zoomIn}
                    >
                        <Plus size={16} />
                    </button>
                    <div className="h-px w-full bg-space-700" />
                    <button
                        onClick={() => zoomOut()}
                        className="p-2 text-nebula-400 hover:bg-space-700 rounded transition-colors"
                        title={t.zoomOut}
                    >
                        <Minus size={16} />
                    </button>
                    <div className="h-px w-full bg-space-700" />
                    <button
                        onClick={() => fitView()}
                        className="p-2 text-nebula-400 hover:bg-space-700 rounded transition-colors"
                        title={t.fitView}
                    >
                        <Maximize size={16} />
                    </button>
                    <div className="h-px w-full bg-space-700" />
                    <button
                        onClick={onLayout}
                        className="p-2 text-nebula-400 hover:bg-space-700 rounded transition-colors"
                        title={t.autoLayout}
                    >
                        <Workflow size={16} />
                    </button>
                </div>
            </ReactFlow>

            {/* Overlay UI Layer */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none bg-space-gradient opacity-50 mix-blend-overlay" />
        </div>
    );
}
