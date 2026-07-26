import { contextBridge, ipcRenderer } from 'electron';

/** Minimal native bridge. Backend interaction happens over HTTP+SSE in the renderer. */
contextBridge.exposeInMainWorld('curryLeaves', {
  getBackendUrl: (): Promise<string | null> => ipcRenderer.invoke('backend:url'),
  getAppVersion: (): Promise<string> => ipcRenderer.invoke('app:version'),
  onBackendReady: (cb: (url: string) => void) =>
    ipcRenderer.on('backend:ready', (_e, url: string) => cb(url)),
  onBackendError: (cb: (msg: string) => void) =>
    ipcRenderer.on('backend:error', (_e, msg: string) => cb(msg)),
  onToggleRecording: (cb: () => void) =>
    ipcRenderer.on('app:toggle-recording', () => cb()),
  notify: (title: string, body?: string, tag?: string): Promise<void> => ipcRenderer.invoke('notify', title, body, tag),
  onNotifyClick: (cb: (tag: string | null) => void) =>
    ipcRenderer.on('notify:click', (_e, tag: string | null) => cb(tag)),
});
