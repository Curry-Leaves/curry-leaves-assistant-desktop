import { app, BrowserWindow, ipcMain, Notification } from 'electron';
import started from 'electron-squirrel-startup';
import { createWindow, getMainWindow } from './window';
import { backend } from './backendManager';

if (started) app.quit();

app.commandLine.appendSwitch('disable-features', 'Autofill');

// ─── IPC: the only native seams the renderer needs ────────────────────────────
// Everything else is HTTP+SSE against the backend URL.
ipcMain.handle('backend:url', () => backend.getUrl());
ipcMain.handle('app:version', () => app.getVersion());

// Native OS notification, fired by the renderer (reminders due, agent waiting on you…).
// Routed through the main process (rather than the renderer's web Notification API)
// because an unsigned/dev Electron build often isn't registered with the OS notification
// center, so web Notifications silently no-op; Electron's own API works regardless.
// A click focuses the window and echoes the notification's tag back to the renderer,
// which routes it to the matching action (see renderer/notify.ts).
ipcMain.handle('notify', (_e, title: string, body?: string, tag?: string) => {
  if (!Notification.isSupported()) return;
  const n = new Notification({ title, body });
  n.on('click', () => {
    const win = getMainWindow();
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
    win.webContents.send('notify:click', tag ?? null);
  });
  n.show();
});

app.on('ready', async () => {
  // Start the window immediately; the renderer polls backend:url until ready.
  createWindow();
  try {
    const url = await backend.start();
    getMainWindow()?.webContents.send('backend:ready', url);
    console.log('[curry-leaves] backend ready at', url);
  } catch (err) {
    console.error('[curry-leaves] backend failed to start:', err);
    getMainWindow()?.webContents.send('backend:error', String(err));
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') { backend.stop(); app.quit(); }
});
app.on('before-quit', () => backend.stop());
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
