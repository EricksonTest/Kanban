# Royal Kanban Design Document

## Owner
- Author: Erickson
- Product Brand: Royal Kanban

## Product Intent
Royal Kanban is a desktop-first Kanban board for personal task flow and lightweight project tracking.

Primary goals:
- Fast capture and movement of tasks
- Reliable local persistence (works offline)
- Native Windows install and launch experience
- Minimal operational overhead (no backend required)

## Branding Direction

### Brand Name
- `Royal Kanban`

### Brand Theme (Current Direction)
Inspired by a royal wax seal aesthetic:
- Deep crimson / oxblood reds
- Embossed / crafted / formal feel
- Premium but functional desktop workflow

### Visual Principles
- Strong contrast and clear hierarchy
- Decorative branding only where it does not reduce usability
- Productivity-first interactions (speed > ornament)

## Core User Experience

### Primary Workflow
1. Open app
2. Quick-add or edit tasks
3. Drag cards across status columns
4. Filter/search active work
5. Close app without losing state

### Current Core Features
- Editable board title
- Quick add
- Search and filter bar
- Four status columns:
  - Not Started
  - In Progress
  - Blocked
  - Done
- Drag-and-drop card movement
- Card detail drawer
- Import/export JSON
- Desktop local persistence with recovery backup

## Desktop Architecture

### Stack
- Frontend: React + Vite + TypeScript
- Desktop shell: Tauri v2
- Native packaging: MSI + NSIS EXE bundles

### Adapters
Desktop-specific logic is isolated under `src/desktop/`:
- `storage.ts`
  - Local persistence
  - Tauri FS integration
  - Validation and backup recovery
- `fileDialogs.ts`
  - Native open/save dialogs on Tauri
  - Browser fallback for web mode

## Data Model (Board Persistence)

### Persisted Board
- `boardName`
- `cards[]`
- `schemaVersion`
- `savedAt`

### Card Fields (Current)
- `id`, `title`, `status`, `priority`
- `tags`, `notes`, `links`
- `blockedReason`
- `evidenceCaptured`, `evidenceNotes`
- `assignee`, `dueDate`
- `createdAt`

## Persistence and Reliability

### Primary File
- `%APPDATA%\com.erickson.royalkanban\board.json`

### Backup File
- `%APPDATA%\com.erickson.royalkanban\board.backup.json`

### Recovery Strategy
- Validate JSON and card shape on load
- If primary file is corrupted:
  - Attempt backup restore
  - Quarantine corrupted file with timestamped filename
  - Rewrite primary from backup (best effort)

## Packaging and Distribution

### Current Build Outputs
- `.msi` installer
- `.exe` NSIS installer

### Release Goal
- Unsiged local builds now
- Signed releases later (recommended before broad distribution)

## Desktop Metadata (Current)
- Product name: `Royal Kanban`
- App identifier: `com.erickson.royalkanban`
- Default window: `1440x900`
- Min window: `1100x680`

## Near-Term Design/UX Improvements

### Branding Pass
- Replace default Tauri icons with Royal Kanban icon set
- Apply brand palette and accent styles in UI theme
- Optional splash / title treatments consistent with seal motif

### Usability Pass
- Keyboard accelerators (Ctrl+N, Ctrl+F)
- Save/import/export confirmations
- Empty states and first-run onboarding tips

### Safety/Trust Pass
- Import validation error details
- Explicit restore-from-backup notification
- Optional local snapshots/history

## Non-Goals (Current Phase)
- Cloud sync
- Multi-user collaboration
- Server-backed auth
- Real-time shared boards

## Success Criteria
- Installs on Windows via MSI/EXE
- Launches reliably as a native app
- Persists data across restarts
- Supports import/export with native dialogs
- Reflects Royal Kanban branding in metadata and future visual assets
