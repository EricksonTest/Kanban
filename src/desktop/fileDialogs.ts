import { isTauri } from "@tauri-apps/api/core";

const JSON_FILTERS = [{ name: "JSON", extensions: ["json"] }];

function makeTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function slugifyBoardName(boardName: string) {
  const normalized = boardName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return normalized.replace(/^-+|-+$/g, "") || "kanban-board";
}

function buildExportFileName(boardName: string) {
  return `${slugifyBoardName(boardName)}-${makeTimestamp()}.json`;
}

function downloadJsonInBrowser(fileName: string, payload: string) {
  const dataBlob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function readJsonFromBrowserPicker(): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";

    let settled = false;
    const finish = (value: string | null) => {
      if (settled) {
        return;
      }
      settled = true;
      window.removeEventListener("focus", onWindowFocus);
      resolve(value);
    };

    const onWindowFocus = () => {
      // If the picker closes without a change event, treat it as cancel.
      window.setTimeout(() => finish(null), 0);
    };

    window.addEventListener("focus", onWindowFocus, { once: true });

    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        finish(null);
        return;
      }

      const reader = new FileReader();
      reader.onerror = () => reject(reader.error ?? new Error("Failed to read file"));
      reader.onload = () => finish(String(reader.result ?? ""));
      reader.readAsText(file);
    };

    input.click();
  });
}

export async function exportBoardJsonFile(
  boardName: string,
  payload: string,
): Promise<boolean> {
  const fileName = buildExportFileName(boardName);

  if (!isTauri()) {
    downloadJsonInBrowser(fileName, payload);
    return true;
  }

  const [{ save }, { writeTextFile }] = await Promise.all([
    import("@tauri-apps/plugin-dialog"),
    import("@tauri-apps/plugin-fs"),
  ]);

  const selectedPath = await save({
    title: "Export Kanban Board",
    filters: JSON_FILTERS,
    defaultPath: fileName,
  });

  if (!selectedPath) {
    return false;
  }

  await writeTextFile(selectedPath, payload);
  return true;
}

export async function importBoardJsonFile(): Promise<string | null> {
  if (!isTauri()) {
    return readJsonFromBrowserPicker();
  }

  const [{ open }, { readTextFile }] = await Promise.all([
    import("@tauri-apps/plugin-dialog"),
    import("@tauri-apps/plugin-fs"),
  ]);

  const selectedPath = await open({
    title: "Import Kanban Board",
    multiple: false,
    directory: false,
    filters: JSON_FILTERS,
  });

  if (!selectedPath || Array.isArray(selectedPath)) {
    return null;
  }

  return readTextFile(selectedPath);
}
