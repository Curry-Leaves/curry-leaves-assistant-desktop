import { BrowserWindow, shell } from 'electron';
import path from 'node:path';

let _mainWindow: BrowserWindow | null = null;
export function getMainWindow(): BrowserWindow | null { return _mainWindow; }

export function createWindow(): void {
  const win = new BrowserWindow({
    width: 1400,
    height: 812,
    minWidth: 900,
    minHeight: 520,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#F7F4EE', // matches bg oklch(0.972 0.012 82)
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      spellcheck: false,
    },
  });

  _mainWindow = win;
  win.once('ready-to-show', () => win.show());

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  win.on('closed', () => { _mainWindow = null; });

  // `target="_blank"` links (e.g. credits on the login screen) should open in the
  // user's default browser, not spawn a new Electron window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  // Cmd/Ctrl+R toggles recording instead of reloading the renderer
  win.webContents.on('before-input-event', (event, input) => {
    if ((input.meta || input.control) && input.key.toLowerCase() === 'r' && !input.shift && !input.alt) {
      event.preventDefault();
      win.webContents.send('app:toggle-recording');
    }
  });
}

// Vite-injected globals
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;
