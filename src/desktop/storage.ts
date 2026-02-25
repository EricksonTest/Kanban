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
const BOARD_BACKUP_FILE_NAME = "board.backup.json";
const CORRUPTED_BOARD_FILE_PREFIX = "board.corrupt";

type JsonRecord = Record<string, unknown>;

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

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function parseCard(input: unknown): Card | null {
  if (!isRecord(input)) {
    return null;
  }

  const {
    id,
    title,
    status,
    priority,
    tags,
    notes,
    links,
    evidenceCaptured,
    createdAt,
    blockedReason,
    evidenceNotes,
    assignee,
    dueDate,
  } = input;

  const validStatuses = new Set(["not-started", "in-progress", "blocked", "done"]);
  const validPriorities = new Set(["low", "medium", "high"]);

  if (
    typeof id !== "string" ||
    typeof title !== "string" ||
    typeof status !== "string" ||
    !validStatuses.has(status) ||
    typeof priority !== "string" ||
    !validPriorities.has(priority) ||
    !isStringArray(tags) ||
    typeof notes !== "string" ||
    !Array.isArray(links) ||
    !links.every(
      (link) =>
        isRecord(link) &&
        typeof link.id === "string" &&
        typeof link.label === "string" &&
        typeof link.url === "string",
    ) ||
    typeof evidenceCaptured !== "boolean" ||
    typeof createdAt !== "number" ||
    !Number.isFinite(createdAt)
  ) {
    return null;
  }

  return {
    id,
    title,
    status,
    priority,
    tags: [...tags],
    notes,
    links: links.map((link) => ({
      id: (link as JsonRecord).id as string,
      label: (link as JsonRecord).label as string,
      url: (link as JsonRecord).url as string,
    })),
    evidenceCaptured,
    createdAt,
    blockedReason: optionalString(blockedReason),
    evidenceNotes: optionalString(evidenceNotes),
    assignee: optionalString(assignee),
    dueDate: optionalString(dueDate),
  };
}

function parseCards(input: unknown): Card[] | null {
  if (!Array.isArray(input)) {
    return null;
  }

  const parsedCards: Card[] = [];
  for (const item of input) {
    const parsedCard = parseCard(item);
    if (!parsedCard) {
      return null;
    }
    parsedCards.push(parsedCard);
  }

  return parsedCards;
}

function parseBoardText(raw: string, fallbackBoardName: string): BoardState | null {
  try {
    const parsed = JSON.parse(raw);
    return parseBoardPayload(parsed, fallbackBoardName);
  } catch {
    return null;
  }
}

async function readAppDataTextFile(fileName: string): Promise<string | null> {
  try {
    const { readTextFile } = await import("@tauri-apps/plugin-fs");
    return await readTextFile(fileName, { baseDir: BaseDirectory.AppData });
  } catch {
    return null;
  }
}

async function writeAppDataTextFile(fileName: string, payload: string): Promise<void> {
  const { writeTextFile } = await import("@tauri-apps/plugin-fs");
  await writeTextFile(fileName, payload, {
    baseDir: BaseDirectory.AppData,
    create: true,
  });
}

async function quarantineCorruptedPrimaryBoardFile(): Promise<void> {
  if (!isTauri()) {
    return;
  }

  try {
    const { rename } = await import("@tauri-apps/plugin-fs");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    await rename(BOARD_FILE_NAME, `${CORRUPTED_BOARD_FILE_PREFIX}-${timestamp}.json`, {
      oldPathBaseDir: BaseDirectory.AppData,
      newPathBaseDir: BaseDirectory.AppData,
    });
  } catch {
    // Best effort only; load should still continue to fallback behavior.
  }
}

async function readPersistedPayload(): Promise<string | null> {
  if (!isTauri()) {
    const storage = getLocalStorage();
    return storage?.getItem(WEB_STORAGE_KEY) ?? null;
  }

  return readAppDataTextFile(BOARD_FILE_NAME);
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

  await writeAppDataTextFile(BOARD_FILE_NAME, payload);
  // Keep a last-known-good copy for recovery if board.json becomes corrupted.
  await writeAppDataTextFile(BOARD_BACKUP_FILE_NAME, payload);
}

export function parseBoardPayload(
  payload: unknown,
  fallbackBoardName: string,
): BoardState | null {
  if (Array.isArray(payload)) {
    const parsedCards = parseCards(payload);
    if (!parsedCards) {
      return null;
    }

    return {
      boardName: fallbackBoardName,
      cards: parsedCards,
    };
  }

  if (!isRecord(payload)) {
    return null;
  }

  const parsedCards = parseCards(payload.cards);
  if (!parsedCards) {
    return null;
  }

  const boardName =
    typeof payload.boardName === "string" && payload.boardName.trim()
      ? payload.boardName.trim()
      : fallbackBoardName;

  return {
    boardName,
    cards: parsedCards,
  };
}

export async function loadBoard(
  fallbackBoardName: string,
): Promise<BoardState | null> {
  if (!isTauri()) {
    const raw = await readPersistedPayload();
    if (!raw) {
      return null;
    }

    return parseBoardText(raw, fallbackBoardName);
  }

  const primaryRaw = await readAppDataTextFile(BOARD_FILE_NAME);
  if (primaryRaw) {
    const parsedPrimary = parseBoardText(primaryRaw, fallbackBoardName);
    if (parsedPrimary) {
      return parsedPrimary;
    }
  }

  const backupRaw = await readAppDataTextFile(BOARD_BACKUP_FILE_NAME);
  if (!backupRaw) {
    if (primaryRaw) {
      await quarantineCorruptedPrimaryBoardFile();
    }
    return null;
  }

  const parsedBackup = parseBoardText(backupRaw, fallbackBoardName);
  if (!parsedBackup) {
    if (primaryRaw) {
      await quarantineCorruptedPrimaryBoardFile();
    }
    return null;
  }

  if (primaryRaw) {
    await quarantineCorruptedPrimaryBoardFile();
  }

  // Restore primary file from backup so subsequent launches recover immediately.
  try {
    await writeAppDataTextFile(BOARD_FILE_NAME, backupRaw);
  } catch {
    // Recovery succeeded in memory even if rewrite fails.
  }

  return parsedBackup;
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
