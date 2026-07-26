import { defineConfig } from 'vite';
import { createRequire } from 'node:module';
import { cpSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The React UI is single-sourced and published to npm as `curry-leaves-assistant-web`.
// That package ships a *prebuilt* static bundle (its `dist/`) — the exact same bundle the
// Python backend serves and pip-installs. The desktop shell consumes that same dist/ so the
// app, the web deployment, and the pip install all render byte-for-byte the same UI, and so
// this repo builds with no sibling checkout (works on any CI runner from the npm package).
const require = createRequire(import.meta.url);
const uiPkg = require.resolve('curry-leaves-assistant-web/package.json');
const uiDist = path.join(path.dirname(uiPkg), 'dist');

// Stage the prebuilt bundle into a local dir OUTSIDE node_modules and use that as Vite's
// root. Using node_modules directly as `root` makes forge's outDir resolve back inside
// node_modules, so the renderer never lands in .vite/renderer and the packaged app ships
// no UI. Staging locally keeps the emitted renderer where electron-forge expects it.
const here = path.dirname(fileURLToPath(import.meta.url));
const stage = path.join(here, '.ui-stage');
rmSync(stage, { recursive: true, force: true });
cpSync(uiDist, stage, { recursive: true });

// forge's Vite plugin normally derives the renderer outDir from `root`; since our root is a
// staging dir, pin outDir to the project's .vite/renderer/<name> where the packager looks.
const outDir = path.join(here, '.vite', 'renderer', 'main_window');

// https://vitejs.dev/config
export default defineConfig({
  root: stage,
  // Electron loads the renderer over file://, so assets must be referenced relatively
  // (./assets/…) instead of absolutely (/assets/…, which would resolve to the FS root).
  base: './',
  build: {
    outDir,
    emptyOutDir: true,
    // Don't re-minify an already-minified bundle; just copy/rewrite it for file://.
    minify: false,
    // The prebuilt bundle already inlines what it wants; keep its hashed assets as files.
    assetsInlineLimit: 0,
  },
});
