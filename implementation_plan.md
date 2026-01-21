# Implementation Plan - Advanced Features

## Goal
Implement "Smart Auto-Layout" to organize nodes automatically and "Spotlight Mode" to focus on selected nodes by dimming others.

## User Review Required
> [!NOTE]
> Auto-layout will use `dagre` for hierarchical arrangement. Spotlight mode will visually dim all nodes except the selected one and its direct connections.

## Proposed Changes

### Dependencies
- Install `dagre` and `@types/dagre` for graph layout algorithms.

### Component: Auto-Layout
- **[NEW] `src/utils/layout.ts`**:
    - Implement `getLayoutedElements` function using `dagre`.
    - Support 'TB' (Top-Bottom) and 'LR' (Left-Right) directions.
- **[MODIFY] `src/components/FlowCanvas.tsx`**:
    - Add "Layout" button to `CustomControls` (using `Workflow` or `GitGraph` icon).
    - invoke layout function on click.

### Component: Spotlight Mode
- **[MODIFY] `src/store/flowStore.ts`**:
    - Manage "dimmed" state logic or handle it in component.
- **[MODIFY] `src/components/FlowCanvas.tsx`**:
    - Listen for selection changes (`onSelectionChange`).
    - Calculate connected nodes (Incoming/Outgoing).
    - Update nodes data with `dimmed` flag.
- **[MODIFY] `src/nodes/GlassNode.tsx`**:
    - Use `data.dimmed` to apply opacity styles (`opacity-30` vs `opacity-100`).

- **[MODIFY] `src/i18n/translations.ts`**:
    - Add strings: "Auto Layout".

## Verification Plan
### Automated Tests
- None.

### Manual Verification
- **Auto-Layout**: Create a messy graph -> Click Layout -> specific hierarchical structure appears.
- **Spotlight**: Select a node -> Check unrelated nodes fade out -> Click canvas -> All nodes restore opacity.
