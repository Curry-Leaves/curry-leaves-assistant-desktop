# Contributing to Curry Leaves — Desktop

Thanks for your interest in improving the Curry Leaves desktop shell! This repo is a
thin [Electron](https://www.electronjs.org/) shell — it owns only the native seams a
browser can't (spawning the Python backend, the app window, native notifications, and
the ⌘R record hotkey). Most product behavior lives in the sibling repos:

| Repo | What it is |
| --- | --- |
| [`curry-leaves-assistant`](https://github.com/Curry-Leaves/curry-leaves-assistant) | FastAPI backend + agent pool |
| [`curry-leaves-assistant-web`](https://github.com/Curry-Leaves/curry-leaves-assistant-web) | Shared React web UI |
| [`curry-leaves-assistant-desktop`](https://github.com/Curry-Leaves/curry-leaves-assistant-desktop) | This repo — the Electron desktop shell |

If your change is really about the UI or the backend, it likely belongs in one of those
repos instead. When in doubt, open an issue first.

## Ground rules

- By contributing, you agree that your contributions are licensed under the project's
  [LICENSE](LICENSE) (MIT with the [Commons Clause](https://commonsclause.com/) condition).
- Be respectful. This project follows our [Code of Conduct](CODE_OF_CONDUCT.md).
- Keep changes focused. One logical change per pull request.

## Getting set up

Clone the three repos **next to each other**, then follow the [README](README.md):

```bash
git clone https://github.com/Curry-Leaves/curry-leaves-assistant.git
git clone https://github.com/Curry-Leaves/curry-leaves-assistant-web.git
git clone https://github.com/Curry-Leaves/curry-leaves-assistant-desktop.git

cd curry-leaves-assistant-desktop
./start.sh          # sets up the backend venv, then launches Electron
```

## Making a change

1. **Open an issue** describing the bug or feature before large changes, so we can agree
   on the approach.
2. **Branch** from `main`: `git checkout -b my-change`.
3. **Keep the shell thin.** New product logic generally belongs in the web or backend
   repo, not here. This shell should stay a thin native adapter.
4. **Build it.** Confirm the app still starts and packages:
   ```bash
   npm start           # electron-forge start
   npm run make        # electron-forge make → out/
   ```
5. **Write clear commits.** Use present-tense, imperative subject lines
   (`fix: wait for backend readiness line before connecting`).
6. **Update docs.** If behavior or setup changes, update the [README](README.md) and, for
   user-facing changes, add an entry to [CHANGELOG.md](CHANGELOG.md).

## Opening a pull request

- Target the `main` branch.
- Describe **what** changed and **why**. Link the issue it closes.
- Note how you verified the change (started the app, ran a build, etc.).
- Small, reviewable PRs get merged faster.

## Reporting bugs & requesting features

Use the [issue templates](.github/ISSUE_TEMPLATE/) when filing:

- **Bug report** — for something that's broken.
- **Feature request** — for something you'd like added.

For **security issues**, do **not** open a public issue — see our
[Security Policy](SECURITY.md).

## Questions

Open a [discussion or issue](https://github.com/Curry-Leaves/curry-leaves-assistant-desktop/issues)
or reach the maintainers at `curry_leaves_ai@yahoo.com`.
