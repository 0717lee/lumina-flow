import { Download, FolderPlus, Layers3, Trash2, Upload } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import { clsx } from 'clsx';
import useFlowStore, { selectActiveBoard } from '@/store/flowStore';
import { useFlowUiStore } from '@/store/uiStore';
import { translations } from '@/i18n/translations';
import { buildBoardExport, buildWorkspaceExport, downloadJsonFile, parseImportedBoards } from '@/utils/serialization';

export default function BoardManager() {
  const boards = useFlowStore((state) => state.boards);
  const activeBoardId = useFlowStore((state) => state.activeBoardId);
  const activeBoard = useFlowStore(selectActiveBoard);
  const language = useFlowStore((state) => state.language);
  const createBoard = useFlowStore((state) => state.createBoard);
  const deleteBoard = useFlowStore((state) => state.deleteBoard);
  const renameBoard = useFlowStore((state) => state.renameBoard);
  const setActiveBoard = useFlowStore((state) => state.setActiveBoard);
  const importBoards = useFlowStore((state) => state.importBoards);
  const workspaceOpen = useFlowUiStore((state) => state.workspaceOpen);
  const setWorkspaceOpen = useFlowUiStore((state) => state.setWorkspaceOpen);
  const resetCanvasUi = useFlowUiStore((state) => state.resetCanvasUi);
  const inputRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const t = translations[language];

  const handleImport = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const importedBoards = parseImportedBoards(raw, language, boards.length + 1);

      importBoards(importedBoards);
      resetCanvasUi();
      setNotice(t.importSuccess);
    } catch {
      setNotice(t.importError);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <aside
      className={clsx(
        'absolute top-40 left-6 z-50 w-80 max-h-[calc(100vh-11rem)] overflow-y-auto rounded-[28px] p-4 transition-all duration-300 lumina-panel',
        workspaceOpen ? 'translate-x-0 opacity-100 pointer-events-auto' : '-translate-x-6 opacity-0 pointer-events-none',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-starlight-100">
            <Layers3 size={16} className="text-nebula-400" />
            <span className="font-semibold">{t.workspace}</span>
          </div>
          <p className="mt-1 text-xs text-starlight-400 leading-5">{t.activeBoardHint}</p>
        </div>
        <button
          onClick={() => {
            createBoard();
            setWorkspaceOpen(true);
            resetCanvasUi();
          }}
          className="p-2 rounded-full border border-space-700 bg-space-900 text-nebula-400 hover:border-nebula-500 hover:bg-space-700 transition-colors"
          title={t.newBoard}
        >
          <FolderPlus size={16} />
        </button>
      </div>

      <div className="mt-4 lumina-surface p-3">
        <p className="text-[11px] uppercase tracking-[0.28em] text-starlight-400">{t.activeBoard}</p>
        <BoardNameField
          key={activeBoard.id}
          boardId={activeBoard.id}
          initialName={activeBoard.name}
          label={t.boardName}
          onRename={renameBoard}
        />
        <p className="mt-2 text-xs text-starlight-400">
          {activeBoard.nodes.length} nodes · {activeBoard.edges.length} edges
        </p>
      </div>

      <div className="mt-4 space-y-2 max-h-56 overflow-y-auto">
        {boards.map((board) => (
          <div
            key={board.id}
            className={
              board.id === activeBoardId
                ? 'rounded-2xl border border-space-700 bg-space-900 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.24),inset_0_1px_0_rgba(255,255,255,0.03)]'
                : 'lumina-surface'
            }
          >
            <div className="flex items-center gap-2 px-3 py-2.5">
              <button
                onClick={() => {
                  setActiveBoard(board.id);
                  setWorkspaceOpen(false);
                  resetCanvasUi();
                }}
                className="flex-1 text-left outline-none"
              >
                <p className="text-sm font-medium text-starlight-100 truncate">{board.name}</p>
                <p className="mt-1 text-[11px] text-starlight-400">
                  {board.nodes.length} nodes · {board.edges.length} edges
                </p>
              </button>
              <button
                onClick={() => {
                  deleteBoard(board.id);
                  resetCanvasUi();
                }}
                className="p-2 rounded-full text-starlight-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title={t.deleteBoard}
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-2xl border border-space-700 bg-space-900 px-3 py-3 text-sm text-starlight-100 hover:border-nebula-500 hover:text-nebula-400 transition-colors"
        >
          <Upload size={16} />
          {t.importJson}
        </button>
        <button
          onClick={() => downloadJsonFile(activeBoard.name, buildBoardExport(activeBoard))}
          className="flex items-center justify-center gap-2 rounded-2xl border border-space-700 bg-space-900 px-3 py-3 text-sm text-starlight-100 hover:border-nebula-500 hover:text-nebula-400 transition-colors"
        >
          <Download size={16} />
          {t.exportBoardJson}
        </button>
        <button
          onClick={() => downloadJsonFile('lumina-flow-workspace', buildWorkspaceExport(boards, activeBoardId))}
          className="col-span-2 flex items-center justify-center gap-2 rounded-2xl border border-space-700 bg-space-900 px-3 py-3 text-sm text-starlight-100 hover:border-nebula-500 hover:text-nebula-400 transition-colors"
        >
          <Download size={16} />
          {t.exportWorkspaceJson}
        </button>
      </div>

      {notice ? <p className="mt-3 text-xs text-starlight-400">{notice}</p> : null}

      <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
    </aside>
  );
}

function BoardNameField(props: {
  boardId: string;
  initialName: string;
  label: string;
  onRename: (boardId: string, name: string) => void;
}) {
  const [value, setValue] = useState(props.initialName);

  const commit = (): void => {
    props.onRename(props.boardId, value);
  };

  return (
    <div className="mt-3">
      <label className="text-xs text-starlight-400">{props.label}</label>
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
          }
        }}
        className="mt-2 lumina-field"
      />
    </div>
  );
}
