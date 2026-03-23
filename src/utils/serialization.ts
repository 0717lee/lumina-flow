import type { FlowBoard, FlowLanguage } from '@/types/flow';
import { createBoardName, normalizeBoard } from '@/utils/flowData';

type FlowBoardExport = {
  version: 1;
  exportedAt: string;
  board: FlowBoard;
};

type FlowWorkspaceExport = {
  version: 1;
  exportedAt: string;
  activeBoardId: string;
  boards: FlowBoard[];
};

export function buildBoardExport(board: FlowBoard): FlowBoardExport {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    board,
  };
}

export function buildWorkspaceExport(boards: FlowBoard[], activeBoardId: string): FlowWorkspaceExport {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    activeBoardId,
    boards,
  };
}

export function downloadJsonFile(filename: string, payload: unknown): void {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${sanitizeFilename(filename)}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

export function parseImportedBoards(raw: string, language: FlowLanguage, startIndex: number): FlowBoard[] {
  const parsed = JSON.parse(raw) as unknown;
  const boards = extractBoards(parsed);

  return boards.map((board, index) => normalizeBoard(board, createBoardName(language, startIndex + index)));
}

function extractBoards(input: unknown): unknown[] {
  if (Array.isArray(input)) {
    return input;
  }

  if (isRecord(input) && Array.isArray(input.boards)) {
    return input.boards;
  }

  if (isRecord(input) && isRecord(input.board)) {
    return [input.board];
  }

  if (isRecord(input) && Array.isArray(input.nodes) && Array.isArray(input.edges)) {
    return [input];
  }

  throw new Error('Unsupported import format.');
}

function sanitizeFilename(input: string): string {
  return input.trim().replace(/[<>:"/\\|?*]/g, '-').replace(/\s+/g, '-').toLowerCase() || 'lumina-flow';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
