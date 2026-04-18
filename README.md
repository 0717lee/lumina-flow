# Lumina Flow

**English** | [简体中文](./README.zh-CN.md)

**Lumina Flow** is a spatial mind-mapping app for capturing ideas, branching thoughts, and reorganizing complex topics on an infinite canvas. It pairs a polished glass-inspired interface with fast keyboard-first interactions, persistent local storage, and lightweight export tools.

![Lumina Flow Preview](/preview-en.png)

## Key Features

- **Infinite spatial canvas**
  Build ideas on a large freeform board powered by React Flow with smooth pan, zoom, and connection editing.

- **Focused thinking mode**
  Selecting a node dims unrelated content so the active idea and its direct relationships stay readable.

- **Smart structure tools**
  Use auto-layout to reorganize messy graphs, or create child and sibling nodes quickly with keyboard shortcuts.

- **Multi-board workspace**
  Manage multiple boards in one local workspace, rename them, switch between them, and keep progress persisted in the browser.

- **Command-style search and shortcut help**
  Jump into search with `/` or `Ctrl/Cmd + K`, match node titles, notes, and tags, navigate results from the keyboard, and open an in-app shortcut overlay with `?`.

- **Richer node metadata**
  Each node supports a title, note, tags, color, and status so the map works for both brainstorming and lightweight planning.

- **Safer feedback and undo**
  Imports and destructive actions surface toast feedback, and recently deleted boards or nodes can be restored immediately with undo.

- **Portable exports**
  Export the current view or the full board as PNG, and import/export boards or whole workspaces as JSON.

- **Adaptive theming, localization, and responsive panels**
  Supports Light, Dark, and System themes, plus English and Simplified Chinese UI. On smaller screens, the workspace and inspector switch to mobile-friendly drawers.

## Keyboard Shortcuts

- `Tab`: create a child node from the selected node
- `Enter`: create a sibling node
- `Backspace` / `Delete`: remove the selected node
- `Ctrl/Cmd + Z`: undo
- `Shift + Ctrl/Cmd + Z`: redo
- `/`: focus search
- `Ctrl/Cmd + K`: focus search
- `?`: open the shortcut help overlay
- `Arrow Up` / `Arrow Down`: move through search results
- `Enter` in search: jump to the active result
- `Escape`: close search or help overlay

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
- An empty board shows a lightweight guide so first-time users know how to start.
- Drag handles between nodes to create connections.
- Double-click a node title to edit it inline.
- Open the inspector to edit notes, tags, color, and status.
- Use search to find nodes by title, note, or tags, then navigate matches from the keyboard.
- Use the workspace panel to create boards or import/export JSON.
- Deleting a node or board shows a toast with a quick undo action.
- Use the bottom toolbar to switch theme, undo/redo, and export PNG snapshots.
- On smaller screens, the workspace and inspector open as bottom drawers so the canvas stays usable.

## License

MIT License.
