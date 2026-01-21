import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
} from '@xyflow/react';
import type {
    Edge,
    Node,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
} from '@xyflow/react';

type FlowState = {
    nodes: Node[];
    edges: Edge[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: OnConnect;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    addNode: (node: Node) => void;
    updateNodeLabel: (id: string, label: string) => void;
    deleteNode: (id: string) => void;
    language: 'en' | 'zh';
    toggleLanguage: () => void;
    theme: 'dark' | 'light' | 'system';
    setTheme: (theme: 'dark' | 'light' | 'system') => void;
};

const useFlowStore = create<FlowState>()(
    persist(
        (set, get) => ({
            nodes: [],
            edges: [],
            onNodesChange: (changes) => {
                set({
                    nodes: applyNodeChanges(changes, get().nodes),
                });
            },
            onEdgesChange: (changes) => {
                set({
                    edges: applyEdgeChanges(changes, get().edges),
                });
            },
            onConnect: (connection) => {
                set({
                    edges: addEdge(connection, get().edges),
                });
            },
            setNodes: (nodes) => set({ nodes }),
            setEdges: (edges) => set({ edges }),
            addNode: (node: Node) => set({ nodes: [...get().nodes, node] }),
            updateNodeLabel: (id, label) => {
                set({
                    nodes: get().nodes.map((node) => {
                        if (node.id === id) {
                            return { ...node, data: { ...node.data, label } };
                        }
                        return node;
                    }),
                });
            },
            deleteNode: (id) => {
                set({
                    nodes: get().nodes.filter((node) => node.id !== id),
                    edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id),
                });
            },
            language: 'zh', // Default to Chinese as requested
            toggleLanguage: () => set((state) => ({ language: state.language === 'en' ? 'zh' : 'en' })),
            theme: 'dark',
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: 'lumina-flow-storage',
        }
    )
);

export default useFlowStore;
