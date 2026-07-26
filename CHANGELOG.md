# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-26

Initial public release of the Curry Leaves desktop shell.

### Added

- Thin [Electron](https://www.electronjs.org/) shell for Curry Leaves that owns
  only the native seams a browser can't:
  - spawns the Python FastAPI backend and waits for its
    `CURRY_LEAVES_LISTENING <host>:<port>` readiness line before connecting;
  - the app window and native OS notifications;
  - the ⌘R record hotkey.
- Single-sourced renderer: the shell consumes the **prebuilt** static bundle
  published as `curry-leaves-assistant-web` on npm — the exact same `dist/` the
  Python backend serves and pip-installs — so the desktop app, the web
  deployment, and the pip install render byte-for-byte the same UI, and the
  shell builds with no sibling checkout (works on any CI runner).
- Fixed backend port (`5177`, overridable via `CURRY_LEAVES_PORT`) shared with
  web mode so a browser tab and the desktop app reach one backend and one
  `~/.curry-leaves`.
- `start.sh` dev launcher that sets up the backend venv in the sibling repo and
  starts Electron.
- `electron-forge` (Vite plugin) build with security fuses enabled
  (`contextIsolation`, `nodeIntegration: false`, ASAR integrity, cookie
  encryption).
- **Cross-platform distributables**, built per-OS in CI
  (`.github/workflows/release.yml`) and attached to the GitHub Release:
  - macOS — `.zip` for Apple Silicon (arm64) **and** Intel (x64);
  - Windows — Squirrel `.exe` installer + `.zip`;
  - Linux — `.deb`, `.rpm`, and `.zip`.
- Application icon on every platform (`.icns` / `.ico` / `.png` under
  `assets/icons/`, wired through `forge.config.ts`).
- `publish.sh` release helper: validates the tree/CHANGELOG, creates the GitHub
  Release, and pushes the `v<version>` tag to trigger the cross-platform build
  matrix (with a `--local` fallback to build on the current machine).

[1.0.0]: https://github.com/Curry-Leaves/curry-leaves-assistant-desktop/releases/tag/v1.0.0
