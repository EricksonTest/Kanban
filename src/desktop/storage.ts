import { isTauri } from "@tauri-apps/api/core";
import { BaseDirectory } from "@tauri-apps/api/path";
import type { Card } from "../app/types";

export interface BoardState {
  boardName: string;
  cards: Card[];
}

interface PersistedBoardFile extends BoardState {
  schemaVersion: number;
  savedAt: number;
}

const WEB_STORAGE_KEY = "kanban.board.v1";
const BOARD_FILE_NAME = "board.json";

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

async function readPersistedPayload(): Promise<string | null> {
  if (!isTauri()) {
    const storage = getLocalStorage();
    return storage?.getItem(WEB_STORAGE_KEY) ?? null;
  }

  try {
    const { readTextFile } = await import("@tauri-apps/plugin-fs");
    return await readTextFile(BOARD_FILE_NAME, { baseDir: BaseDirectory.AppData });
  } catch {
    // First launch or unreadable file falls back to defaults/import flow.
    return null;
  }
}

async function writePersistedPayload(payload: string): Promise<void> {
  if (!isTauri()) {
    const storage = getLocalStorage();
    if (!storage) {
      return;
    }

    storage.setItem(WEB_STORAGE_KEY, payload);
    return;
  }

  const { writeTextFile } = await import("@tauri-apps/plugin-fs");
  await writeTextFile(BOARD_FILE_NAME, payload, {
    baseDir: BaseDirectory.AppData,
    create: true,
  });
}

export function parseBoardPayload(
  payload: unknown,
  fallbackBoardName: string,
): BoardState | null {
  if (Array.isArray(payload)) {
    return {
      boardName: fallbackBoardName,
      cards: payload as Card[],
    };
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Partial<PersistedBoardFile> & {
    boardName?: unknown;
    cards?: unknown;
  };

  if (!Array.isArray(record.cards)) {
    return null;
  }

  const boardName =
    typeof record.boardName === "string" && record.boardName.trim()
      ? record.boardName.trim()
      : fallbackBoardName;

  return {
    boardName,
    cards: record.cards as Card[],
  };
}

export async function loadBoard(
  fallbackBoardName: string,
): Promise<BoardState | null> {
  const raw = await readPersistedPayload();
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return parseBoardPayload(parsed, fallbackBoardName);
  } catch {
    return null;
  }
}

export async function saveBoard(board: BoardState): Promise<void> {
  const payload: PersistedBoardFile = {
    schemaVersion: 1,
    boardName: board.boardName,
    cards: board.cards,
    savedAt: Date.now(),
  };

  await writePersistedPayload(JSON.stringify(payload));
}
