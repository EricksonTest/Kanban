# Royal Kanban Windows Desktop Installation Guide

## Overview
Royal Kanban is packaged as a native Windows desktop app using Tauri.

This guide covers:
- End-user installation on a Windows desktop
- Developer/build prerequisites (if building from source)
- Where to launch the app from

## Install Options (Windows)

### Option 1: Installer (Recommended)
Use one of the generated installers from:
- `src-tauri/target/release/bundle/msi/`
- `src-tauri/target/release/bundle/nsis/`

Typical files:
- `Royal Kanban_0.0.1_x64_en-US.msi`
- `Royal Kanban_0.0.1_x64-setup.exe`

Steps:
1. Download the `.msi` or `.exe` installer.
2. Run the installer.
3. Complete the setup wizard.
4. Launch `Royal Kanban` from the Start Menu.

### Option 2: Portable/Direct Binary (Advanced)
If you build locally, you can run the binary directly:
- `src-tauri/target/release/royal-kanban.exe`

This does not perform an installation and may not create Start Menu entries.

## Where To Open The App From

### During development
Run:
```powershell
npm run tauri dev
```

### After building from source
Open:
- `src-tauri/target/release/royal-kanban.exe`

### After installing with the installer
Open from:
- Start Menu: `Royal Kanban`
- Desktop shortcut (if created during install)

Note: The exact installed path can vary by installer type and user choices.

## Runtime Prerequisites (End Users)

- Windows 10 or Windows 11 (64-bit recommended)
- Microsoft WebView2 Runtime
  - Usually already installed on Windows 11
  - If missing, the app may not launch until WebView2 is installed

## Build Prerequisites (Developers / CI)

Required to build installers from source:
- Node.js + npm
- Rust toolchain (`rustup`, `cargo`)
- Microsoft Visual Studio 2022 Build Tools (C++ workload)
- WebView2 Runtime (for local testing; usually present)

## Build From Source (Windows)

From the repository root:

```powershell
npm install
npm run tauri build
```

Artifacts will be generated in:
- `src-tauri/target/release/bundle/`

## Data Storage Location

Royal Kanban stores board data locally in AppData:
- `%APPDATA%\com.erickson.royalkanban\board.json`

Backup file:
- `%APPDATA%\com.erickson.royalkanban\board.backup.json`

## Troubleshooting

### App does not start
- Confirm WebView2 Runtime is installed.
- If built from source, confirm Rust and MSVC Build Tools are installed.

### `tauri dev` fails with cargo-related errors
- Open a new terminal (or reboot if tools were just installed).
- Verify:
```powershell
cargo --version
```

### Installer build fails
- Ensure the C++ Build Tools workload is installed.
- Re-run:
```powershell
npm run tauri build
```
