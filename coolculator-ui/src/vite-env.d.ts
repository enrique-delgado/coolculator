/// <reference types="vite/client" />

// Injected by vite.config.ts's `define` from package.json — the frontend
// version shown in the About panel.
declare const __APP_VERSION__: string;

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_AUTHOR_NAME: string;
  readonly VITE_AUTHOR_EMAIL: string;
  readonly VITE_GITHUB_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Set at container startup by the Docker image's entrypoint script — see
// src/config/env.ts for why this takes priority over the build-time env.
interface Window {
  __COOLCULATOR_CONFIG__?: {
    API_BASE_URL?: string;
  };
}
