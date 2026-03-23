import { create } from 'zustand';

type FlowUiState = {
  selectedNodeId: string | null;
  spotlightNodeIds: string[];
  highlightedNodeIds: string[];
  pendingFocusNodeId: string | null;
  workspaceOpen: boolean;
  inspectorOpen: boolean;
  setSelection: (nodeId: string | null, connectedNodeIds?: string[]) => void;
  setHighlightedNodeIds: (nodeIds: string[]) => void;
  requestNodeFocus: (nodeId: string | null) => void;
  clearPendingFocus: () => void;
  setWorkspaceOpen: (isOpen: boolean) => void;
  setInspectorOpen: (isOpen: boolean) => void;
  resetCanvasUi: () => void;
};

export const useFlowUiStore = create<FlowUiState>((set) => ({
  selectedNodeId: null,
  spotlightNodeIds: [],
  highlightedNodeIds: [],
  pendingFocusNodeId: null,
  workspaceOpen: false,
  inspectorOpen: false,
  setSelection: (nodeId, connectedNodeIds = []) =>
    set({
      selectedNodeId: nodeId,
      spotlightNodeIds: nodeId ? connectedNodeIds : [],
    }),
  setHighlightedNodeIds: (nodeIds) =>
    set({
      highlightedNodeIds: nodeIds,
    }),
  requestNodeFocus: (nodeId) =>
    set({
      pendingFocusNodeId: nodeId,
    }),
  clearPendingFocus: () =>
    set({
      pendingFocusNodeId: null,
    }),
  setWorkspaceOpen: (isOpen) =>
    set({
      workspaceOpen: isOpen,
    }),
  setInspectorOpen: (isOpen) =>
    set({
      inspectorOpen: isOpen,
    }),
  resetCanvasUi: () =>
    set({
      selectedNodeId: null,
      spotlightNodeIds: [],
      highlightedNodeIds: [],
      pendingFocusNodeId: null,
    }),
}));
