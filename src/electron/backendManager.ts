import { spawn, ChildProcess } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from 'node:fs';
import { DATA_DIR, SERVICE_PID_PATH, BACKEND_PORT, pythonBin } from './paths';

/**
 * Spawns the Python FastAPI backend from source (dev) and resolves with its URL
 * once it prints the readiness line `CURRY_LEAVES_LISTENING <host>:<port>` on stdout.
 * Thin by design — IPC/native shell only; everything else is HTTP+SSE.
 */
export class BackendManager {
  private process: ChildProcess | null = null;
  private url: string | null = null;
  onClose: (() => void) | null = null;

  private killStale(): void {
    try {
      const pid = parseInt(readFileSync(SERVICE_PID_PATH, 'utf-8').trim(), 10);
      if (pid > 0) process.kill(pid, 'SIGKILL');
    } catch { /* not running */ }
    try { unlinkSync(SERVICE_PID_PATH); } catch { /* ignore */ }
  }

  start(): Promise<string> {
    if (this.process) { try { this.process.kill('SIGKILL'); } catch { /* ignore */ } }
    mkdirSync(DATA_DIR, { recursive: true });
    this.killStale();

    return new Promise((resolve, reject) => {
      const bin = pythonBin();
      if (!existsSync(bin)) {
        reject(new Error(
          `Python venv not found at ${bin}\nRun ./start.sh once to set it up ` +
          `(creates the venv and installs curry-leaves-assistant + the curry-leaves kernel)`
        ));
        return;
      }

      // Module invocation (-m), not a script path: the backend is an installed
      // package (`pip install -e .`), so this works regardless of cwd.
      this.process = spawn(bin, ['-u', '-m', 'curry_leaves_assistant.app'], {
        env: { ...process.env, CURRY_LEAVES_DIR: DATA_DIR, CURRY_LEAVES_PORT: BACKEND_PORT, PYTHONUNBUFFERED: '1' },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      if (this.process.pid) {
        try { writeFileSync(SERVICE_PID_PATH, String(this.process.pid)); } catch { /* ignore */ }
      }

      this.process.stdout?.on('data', (data: Buffer) => {
        const text = data.toString();
        const match = text.match(/CURRY_LEAVES_LISTENING\s+([\d.]+):(\d+)/);
        if (match && !this.url) {
          this.url = `http://${match[1]}:${match[2]}`;
          resolve(this.url);
        }
        process.stdout.write(`[backend] ${text}`);
      });
      this.process.stderr?.on('data', (d: Buffer) => process.stderr.write(`[backend] ${d}`));
      this.process.on('close', () => { this.process = null; this.url = null; this.onClose?.(); });
      this.process.on('error', (err) => reject(new Error(`Failed to start backend: ${err.message}`)));

      setTimeout(() => { if (!this.url) reject(new Error('Backend timed out (45s)')); }, 45_000);
    });
  }

  stop(): void {
    if (this.process) { try { this.process.kill('SIGKILL'); } catch { /* ignore */ } this.process = null; }
    try { unlinkSync(SERVICE_PID_PATH); } catch { /* ignore */ }
  }

  getUrl(): string | null { return this.url; }
}

export const backend = new BackendManager();
