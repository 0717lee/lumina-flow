import { create } from 'zustand';

type FlowUiState = {
  selectedNodeId: string | null;
  spotlightNodeIds: string[];
  highlightedNodeIds: string[];
  pendingFocusNodeId: string | null;
  workspaceOpen: boolean;
  inspectorOpen: boolean;
  searchFocusNonce: number;
  helpOverlayOpen: boolean;
  setSelection: (nodeId: string | null, connectedNodeIds?: string[]) => void;
  setHighlightedNodeIds: (nodeIds: string[]) => void;
  requestNodeFocus: (nodeId: string | null) => void;
  clearPendingFocus: () => void;
  setWorkspaceOpen: (isOpen: boolean) => void;
  setInspectorOpen: (isOpen: boolean) => void;
  requestSearchFocus: () => void;
  setHelpOverlayOpen: (isOpen: boolean) => void;
  resetCanvasUi: () => void;
};

export const useFlowUiStore = create<FlowUiState>((set) => ({
  selectedNodeId: null,
  spotlightNodeIds: [],
  highlightedNodeIds: [],
  pendingFocusNodeId: null,
  workspaceOpen: false,
  inspectorOpen: false,
  searchFocusNonce: 0,
  helpOverlayOpen: false,
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
  requestSearchFocus: () =>
    set((state) => ({
      searchFocusNonce: state.searchFocusNonce + 1,
    })),
  setHelpOverlayOpen: (isOpen) =>
    set({
      helpOverlayOpen: isOpen,
    }),
  resetCanvasUi: () =>
    set({
      selectedNodeId: null,
      spotlightNodeIds: [],
      highlightedNodeIds: [],
      pendingFocusNodeId: null,
    }),
}));
