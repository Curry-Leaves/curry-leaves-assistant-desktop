import path from 'node:path';
import os from 'node:os';
import { app } from 'electron';

/** Hand-editable data dir shared with the backend: ~/.curry-leaves */
export const DATA_DIR = path.join(os.homedir(), '.curry-leaves');
export const SERVICE_PID_PATH = path.join(DATA_DIR, 'service.pid');

/**
 * Fixed port for the app's backend (overridable via CURRY_LEAVES_PORT). Pinning it — rather
 * than letting the backend pick a random free port — means a plain browser tab can reach the
 * same backend at a known URL (http://127.0.0.1:5177), matching web-mode's default so both
 * clients share one backend + one ~/.curry-leaves (same PIN, live cross-client mirroring).
 */
export const BACKEND_PORT = process.env.CURRY_LEAVES_PORT || '5177';

/**
 * The Curry Leaves backend now lives in the sibling `curry-leaves-assistant` repo (dev)
 * or is bundled under resources/ (packaged). Overridable via CURRY_LEAVES_ASSISTANT_DIR
 * so a checkout in a non-default location still works.
 */
function assistantRepoDir(): string {
  return process.env.CURRY_LEAVES_ASSISTANT_DIR
    || path.join(app.getAppPath(), '..', 'curry-leaves-assistant');
}

/** Location of the Python backend source (dev) or bundled runtime (packaged). */
export function pythonDir(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'python')
    : path.join(assistantRepoDir(), 'src', 'curry_leaves_assistant');
}

/** The venv lives at the assistant repo root in dev (see this repo's start.sh). */
export function venvDir(): string {
  return app.isPackaged
    ? path.join(pythonDir(), '.venv')
    : path.join(assistantRepoDir(), '.venv');
}

/** The venv interpreter we run the backend with in dev. */
export function pythonBin(): string {
  const dir = venvDir();
  return process.platform === 'win32'
    ? path.join(dir, 'Scripts', 'python.exe')
    : path.join(dir, 'bin', 'python');
}
