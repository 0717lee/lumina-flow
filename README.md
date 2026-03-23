# Lumina Flow - Spatial Thought Engine

**English** | [简体中文](./README.zh-CN.md)

**Lumina Flow** is a spatial mind-mapping app for capturing ideas, branching thoughts, and reorganizing complex topics on an infinite canvas. It pairs a polished glass-inspired interface with fast keyboard-first interactions, persistent local storage, and lightweight export tools.

![Lumina Flow Preview](/preview.png)

## Key Features

- **Infinite spatial canvas**
  Build ideas on a large freeform board powered by React Flow with smooth pan, zoom, and connection editing.

- **Focused thinking mode**
  Selecting a node dims unrelated content so the active idea and its direct relationships stay readable.

- **Smart structure tools**
  Use auto-layout to reorganize messy graphs, or create child and sibling nodes quickly with keyboard shortcuts.

- **Multi-board workspace**
  Manage multiple boards in one local workspace, rename them, switch between them, and keep progress persisted in the browser.

- **Richer node metadata**
  Each node supports a title, note, tags, color, and status so the map works for both brainstorming and lightweight planning.

- **Portable exports**
  Export the current view or the full board as PNG, and import/export boards or whole workspaces as JSON.

- **Adaptive theming and localization**
  Supports Light, Dark, and System themes, plus English and Simplified Chinese UI.

## Keyboard Shortcuts

- `Tab`: create a child node from the selected node
- `Enter`: create a sibling node
- `Backspace` / `Delete`: remove the selected node
- `Ctrl/Cmd + Z`: undo
- `Shift + Ctrl/Cmd + Z`: redo

## Tech Stack

- **Framework**: React 19 + Vite
- **Core Canvas**: React Flow (`@xyflow/react`)
- **State Management**: Zustand
- **Styling**: Tailwind CSS + custom design tokens
- **Graph Layout**: Dagre
- **Export**: `html-to-image`
- **Icons**: Lucide React

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/0717lee/lumina-flow.git
   cd lumina-flow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   Note: Node.js `18+` is recommended.

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## How to Use

- Double-click empty canvas space to create a node.
- Drag handles between nodes to create connections.
- Double-click a node title to edit it inline.
- Open the inspector to edit notes, tags, color, and status.
- Use the workspace panel to create boards or import/export JSON.
- Use the bottom toolbar to switch theme, undo/redo, and export PNG snapshots.

## License

MIT License.
