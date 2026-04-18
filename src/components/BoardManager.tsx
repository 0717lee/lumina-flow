import { Download, FolderPlus, Layers3, Trash2, Upload } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import { clsx } from 'clsx';
import useFlowStore, { selectActiveBoard } from '@/store/flowStore';
import { useFlowUiStore } from '@/store/uiStore';
import { useToastStore } from '@/store/toastStore';
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
  const pushToast = useToastStore((state) => state.push);
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
      pushToast({
        tone: 'success',
        message: t.toastImportSuccess.replace('{count}', String(importedBoards.length)),
      });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      pushToast({ tone: 'error', message: t.toastImportError.replace('{reason}', reason) });
    } finally {
      event.target.value = '';
    }
  };

  const handleDeleteBoard = (boardId: string, name: string): void => {
    const snapshot = useFlowStore.getState().boards.find((board) => board.id === boardId);

    deleteBoard(boardId);
    resetCanvasUi();

    if (!snapshot || boards.length <= 1) {
      pushToast({ tone: 'info', message: t.toastBoardDeleted.replace('{name}', name) });
      return;
    }

    pushToast({
      tone: 'info',
      message: t.toastBoardDeleted.replace('{name}', name),
      actionLabel: t.toastUndo,
      onAction: () => {
        useFlowStore.getState().importBoards([snapshot]);
        useFlowStore.getState().setActiveBoard(snapshot.id);
      },
    });
  };

  return (
    <aside
      role="complementary"
      aria-label={t.workspace}
      className={clsx(
        'absolute bottom-0 left-0 right-0 z-50 h-[calc(100vh-8rem)] overflow-y-auto rounded-t-[28px] p-4 transition-all duration-300 lumina-panel md:top-40 md:left-6 md:right-auto md:h-auto md:max-h-[calc(100vh-11rem)] md:w-72 md:rounded-[28px] lg:w-80',
        workspaceOpen
          ? 'translate-y-0 opacity-100 pointer-events-auto md:translate-x-0'
          : 'translate-y-full opacity-0 pointer-events-none md:-translate-x-6 md:translate-y-0',
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
          className="p-2 rounded-full border border-space-700 bg-space-900 text-nebula-400 hover:border-nebula-500 hover:bg-space-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-500/80 focus-visible:ring-offset-1 focus-visible:ring-offset-space-900"
          title={t.newBoard}
          aria-label={t.newBoard}
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
          {t.boardStats.replace('{nodes}', String(activeBoard.nodes.length)).replace('{edges}', String(activeBoard.edges.length))}
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
                className="flex-1 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-nebula-500/80 focus-visible:ring-offset-1 focus-visible:ring-offset-space-900"
              >
                <p className="text-sm font-medium text-starlight-100 truncate">{board.name}</p>
                <p className="mt-1 text-[11px] text-starlight-400">
                  {t.boardStats.replace('{nodes}', String(board.nodes.length)).replace('{edges}', String(board.edges.length))}
                </p>
              </button>
              <button
                onClick={() => handleDeleteBoard(board.id, board.name)}
                className="p-2 rounded-full text-starlight-400 hover:text-red-400 hover:bg-red-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-500 focus-visible:ring-offset-2 focus-visible:ring-offset-space-800"
                title={t.deleteBoard}
                aria-label={`${t.deleteBoard}: ${board.name}`}
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
          className="flex items-center justify-center gap-2 rounded-2xl border border-space-700 bg-space-900 px-3 py-3 text-sm text-starlight-100 hover:border-nebula-500 hover:text-nebula-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-500/80 focus-visible:ring-offset-1 focus-visible:ring-offset-space-900"
          aria-label={t.importJson}
        >
          <Upload size={16} />
          {t.importJson}
        </button>
        <button
          onClick={() => downloadJsonFile(activeBoard.name, buildBoardExport(activeBoard))}
          className="flex items-center justify-center gap-2 rounded-2xl border border-space-700 bg-space-900 px-3 py-3 text-sm text-starlight-100 hover:border-nebula-500 hover:text-nebula-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-500/80 focus-visible:ring-offset-1 focus-visible:ring-offset-space-900"
          aria-label={t.exportBoardJson}
        >
          <Download size={16} />
          {t.exportBoardJson}
        </button>
        <button
          onClick={() => downloadJsonFile('lumina-flow-workspace', buildWorkspaceExport(boards, activeBoardId))}
          className="col-span-2 flex items-center justify-center gap-2 rounded-2xl border border-space-700 bg-space-900 px-3 py-3 text-sm text-starlight-100 hover:border-nebula-500 hover:text-nebula-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nebula-500/80 focus-visible:ring-offset-1 focus-visible:ring-offset-space-900"
          aria-label={t.exportWorkspaceJson}
        >
          <Download size={16} />
          {t.exportWorkspaceJson}
        </button>
      </div>

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
