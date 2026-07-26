# Roadmap

This roadmap tracks planned work for the **Curry Leaves desktop shell**. It reflects
current intent, not commitments — priorities and timing may change. Product features
that live in the UI or backend are tracked in their own repos:
[web UI](https://github.com/Curry-Leaves/curry-leaves-assistant-web) ·
[backend](https://github.com/Curry-Leaves/curry-leaves-assistant).

## Shipped

- **v1.0.0** — Initial public release. Thin Electron shell that spawns the Python
  backend, hosts the single-sourced React UI, adds native notifications and the ⌘R
  record hotkey, with `electron-forge` (Vite) builds and security fuses enabled.
  See [CHANGELOG.md](CHANGELOG.md).

## Near term

- **Bundle the Python backend into the app.** Package the backend runtime under
  `resources/python` so a packaged build runs standalone, without a sibling checkout
  or a dev `.venv`. (`paths.ts` already expects this layout when `app.isPackaged`.)
- **Cross-platform makers.** Add Windows and Linux distributables alongside the macOS
  ZIP maker (e.g. Squirrel/`.exe`, `.deb`/`.rpm`, AppImage).
- **Code signing & notarization.** Sign and notarize macOS builds; sign Windows builds.

## Mid term

- **Auto-update.** Wire up an update channel so installed apps can update themselves.
- **First-run experience.** Friendlier onboarding when the backend isn't yet set up,
  with clear diagnostics if the readiness line never arrives.
- **Tray / background mode.** Optional menu-bar/tray presence so recording and
  notifications work without a foreground window.

## Later / exploring

- **Deeper OS integration** — global shortcuts beyond ⌘R, richer notification actions.
- **Telemetry (opt-in).** Anonymous crash and health reporting to catch shell-level
  regressions, strictly opt-in.

## How to influence the roadmap

Open an [issue](https://github.com/Curry-Leaves/curry-leaves-assistant-desktop/issues)
or a feature request, or see [CONTRIBUTING.md](CONTRIBUTING.md). Feedback and PRs are
welcome.
