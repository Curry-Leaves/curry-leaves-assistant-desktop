<p align="center">
  <img src="assets/logo.png" alt="Curry Leaves logo" width="128" height="128">
</p>

<h1 align="center">Curry Leaves — Desktop</h1>

<p align="center">A thin Electron shell for Curry Leaves — spawns the Python backend and hosts the shared React UI.</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT%20%2B%20Commons%20Clause-blue.svg" alt="license: MIT + Commons Clause"></a>
  <a href="https://www.electronjs.org/"><img src="https://img.shields.io/badge/Electron-37-47848f.svg?logo=electron&logoColor=white" alt="Electron 37"></a>
  <a href="https://vitejs.dev"><img src="https://img.shields.io/badge/Vite-5-646cff.svg?logo=vite&logoColor=white" alt="Vite 5"></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-3178c6.svg?logo=typescript&logoColor=white" alt="TypeScript 5"></a>
  <a href="https://github.com/Curry-Leaves/curry-leaves-assistant-desktop"><img src="https://img.shields.io/badge/github-repo-181717.svg?logo=github" alt="GitHub repo"></a>
</p>

<p align="center">
  <a href="https://ilayanambi.com/curryleaves">Docs</a> ·
  <a href="#develop">Develop</a> ·
  <a href="#build-a-distributable">Build</a> ·
  <a href="#related-repositories">Related repos</a> ·
  <a href="https://github.com/Curry-Leaves/curry-leaves-assistant-web">Web UI</a> ·
  <a href="https://github.com/Curry-Leaves/curry-leaves-assistant">Backend</a>
</p>

---

A thin [Electron](https://www.electronjs.org/) shell for **Curry Leaves**, the voice &
meeting assistant. It owns only what a browser can't:

- spawning the Python backend ([`src/electron/backendManager.ts`](src/electron/backendManager.ts)),
- the app window and native OS notifications,
- the ⌘R record hotkey.

Everything else — the FastAPI backend, the agent pool, and the **React web UI** — lives in
sibling repos. This shell builds that same UI (single-sourced, no copy here) and spawns that
same backend, so the desktop app and the web/pip deployment stay in lockstep.

📖 **Documentation:** [ilayanambi.com/curryleaves](https://ilayanambi.com/curryleaves)

## Installing on macOS

The macOS builds are **not yet code-signed or notarized by Apple**, so the first time you open
a downloaded build, macOS Gatekeeper may say:

> **"Curry Leaves" is damaged and can't be opened. You should move it to the Trash.**

The app is **not** damaged — this is Gatekeeper blocking an unsigned app that carries the
"downloaded from the internet" quarantine flag. To open it, remove the quarantine flag after
unzipping the app into `/Applications` (or wherever you keep it):

```bash
xattr -dr com.apple.quarantine "/Applications/Curry Leaves.app"
```

Then launch it normally. (On some macOS versions you can instead **right-click the app → Open →
Open** to bypass the warning, but the `xattr` command is the reliable fix on Apple Silicon.)

> Signing + notarization is a planned follow-up so downloads open with no warning.

## Related repositories

| Repo | What it is |
| --- | --- |
| [`curry-leaves-assistant`](https://github.com/Curry-Leaves/curry-leaves-assistant) | FastAPI backend + agent pool (the Python service this shell spawns) |
| [`curry-leaves-assistant-web`](https://github.com/Curry-Leaves/curry-leaves-assistant-web) | Shared React web UI (published to npm; this shell bundles its prebuilt `dist/`) |
| [`curry-leaves-assistant-desktop`](https://github.com/Curry-Leaves/curry-leaves-assistant-desktop) | This repo — the Electron desktop shell |

## Layout

```
curry-leaves-assistant/            ← FastAPI backend (sibling repo, dev only)
curry-leaves-assistant-desktop/    ← this repo
  src/electron/                    Electron main, preload, window, backend manager
  forge.config.ts                  electron-forge makers (macOS/Windows/Linux) + fuses
  vite.renderer.config.mts         bundles the prebuilt UI from the npm package's dist/
  vite.main.config.ts
  vite.preload.config.ts
  start.sh                         dev launcher
  publish.sh                       release helper (tags → CI builds all OSes)
  .github/workflows/release.yml    cross-platform release build matrix
```

## Prerequisites

The **UI** is a normal npm dependency (`curry-leaves-assistant-web`) — its prebuilt `dist/` is
pulled from npm, so **no UI checkout is needed** to build this shell. For a full dev run you
also need the **backend** repo next to this one (it's spawned at runtime, not bundled yet):

```bash
git clone https://github.com/Curry-Leaves/curry-leaves-assistant-desktop.git
git clone https://github.com/Curry-Leaves/curry-leaves-assistant.git   # backend (dev run)
```

The backend defaults to `../curry-leaves-assistant` (override with `CURRY_LEAVES_ASSISTANT_DIR`).

## Develop

```bash
./start.sh          # sets up the backend venv in the sibling repo, then launches Electron
# or, once set up:
npm install
npm start           # electron-forge start
```

[`start.sh`](start.sh) delegates Python venv setup to the assistant repo's `scripts/_setup.sh`,
then runs `electron-forge start`. Electron spawns the backend and waits for its
`CURRY_LEAVES_LISTENING <host>:<port>` readiness line before connecting.

## Build a distributable

```bash
npm run make                 # electron-forge make → out/make (this host's OS/arch)
npm run make -- --arch=x64   # cross-build a specific arch (e.g. Intel from Apple Silicon)
```

`make` produces the installer for the OS it runs on — macOS `.zip`, Windows Squirrel `.exe`,
Linux `.deb`/`.rpm`. Electron installers can't be cross-compiled across OSes, so all-platform
builds happen in CI (see [Release](#release)).

> Packaging the Python backend into the app bundle is a follow-up:
> [`paths.ts`](src/electron/paths.ts) expects the bundled runtime under `resources/python`
> when `app.isPackaged`. For now the dev flow spawns the backend from the sibling repo's `.venv`.

## Release

This is an end-user Electron app, not an npm library — a release is a **GitHub Release** with
per-OS installers attached, not `npm publish`. Because Electron installers must be built on
their target OS, the build runs in CI across a macOS + Windows + Linux matrix
([`.github/workflows/release.yml`](.github/workflows/release.yml)), covering:

- **macOS** — `.zip` for Apple Silicon (arm64) and Intel (x64)
- **Windows** — Squirrel `.exe` installer + `.zip`
- **Linux** — `.deb`, `.rpm`, and `.zip`

[`publish.sh`](publish.sh) drives it:

```bash
# 1. bump "version" in package.json and stamp CHANGELOG.md, then commit.
./publish.sh --dry-run   # validate the tree/CHANGELOG and preview the release notes
./publish.sh             # create the GitHub Release + push the tag → CI builds every OS
./publish.sh --local     # fallback: build on THIS machine and upload (only this host's arch)
```

It refuses to release from a dirty tree, over an existing release tag, or without a matching
CHANGELOG entry, then creates the Release and pushes the `v<version>` tag — which triggers the
CI matrix to build and attach each platform's artifacts. Requires the
[GitHub CLI](https://cli.github.com) (`gh`, installed and authenticated).

## Environment variables

- `CURRY_LEAVES_ASSISTANT_DIR` — path to the backend repo (default: `../curry-leaves-assistant`).
- `CURRY_LEAVES_PORT` — fixed backend port (default `5177`), shared with web mode so a browser
  tab and the desktop app can reach one backend + one `~/.curry-leaves`.
- `CURRY_LEAVES_KERNEL_DIR`, `CURRY_LEAVES_MEMORY_DIR` — editable kernel/memory checkouts.

## License

Curry Leaves is released under the MIT License with the [Commons Clause](https://commonsclause.com/)
condition (no selling the software). See [LICENSE](LICENSE) for the full terms.
