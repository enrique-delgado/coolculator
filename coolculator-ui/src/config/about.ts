// Identity/link facts for the About panel — language-independent (a name,
// email, and URL mean the same thing in every locale), so these live here
// rather than in the i18n locale files. Sourced from env vars so they're
// set once per deployment rather than hardcoded.
export const AUTHOR_NAME = import.meta.env.VITE_AUTHOR_NAME || "";
export const AUTHOR_EMAIL = import.meta.env.VITE_AUTHOR_EMAIL || "";
export const GITHUB_URL = import.meta.env.VITE_GITHUB_URL || "";

// Frontend version — injected at build time from package.json via
// vite.config.ts's `define` (see src/vite-env.d.ts for the declaration).
export const FRONTEND_VERSION = __APP_VERSION__;
