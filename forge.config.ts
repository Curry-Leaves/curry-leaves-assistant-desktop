import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'Curry Leaves',
    // Linux .deb/.rpm makers require a lowercase, space-free binary name; without
    // this the executable is "curry-leaves-assistant-desktop" inside a "Curry Leaves"
    // folder and the makers can't find it. Keep it stable across platforms.
    executableName: 'curry-leaves',
    appBundleId: 'ai.curryleaves.desktop',
    // App icon. Path is extensionless — electron-packager appends .icns on macOS
    // and .ico on Windows. (Linux gets its icon from the maker options below.)
    icon: 'assets/icons/icon',
  },
  rebuildConfig: {},
  // One maker per platform family. electron-forge only runs the makers whose
  // platform matches the host, so a macOS runner emits the ZIP(s), a Windows
  // runner the Squirrel installer, a Linux runner the .deb/.rpm — see the
  // release CI matrix (.github/workflows/release.yml) which builds all three.
  makers: [
    // macOS + a cross-platform fallback: ZIP for darwin, win32, and linux.
    new MakerZIP({}, ['darwin', 'win32', 'linux']),
    // Windows: Squirrel .exe installer + auto-update feed. setupIcon is the
    // installer's own icon; the app icon comes from packagerConfig.icon (.ico).
    new MakerSquirrel({
      name: 'CurryLeaves',
      setupExe: 'CurryLeavesSetup.exe',
      setupIcon: 'assets/icons/icon.ico',
      iconUrl: 'https://raw.githubusercontent.com/Curry-Leaves/curry-leaves-assistant-desktop/main/assets/icons/icon.ico',
    }),
    // Linux: Debian and RPM packages. These makers take an explicit .png icon.
    new MakerDeb({ options: { name: 'curry-leaves', productName: 'Curry Leaves', icon: 'assets/icons/icon.png' } }),
    new MakerRpm({ options: { name: 'curry-leaves', productName: 'Curry Leaves', icon: 'assets/icons/icon.png' } }),
  ],
  plugins: [
    new VitePlugin({
      build: [
        { entry: 'src/electron/main.ts', config: 'vite.main.config.ts', target: 'main' },
        { entry: 'src/electron/preload.ts', config: 'vite.preload.config.ts', target: 'preload' },
      ],
      renderer: [{ name: 'main_window', config: 'vite.renderer.config.mts' }],
    }),
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
