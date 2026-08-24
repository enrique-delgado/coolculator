// The single place the API base URL is defined — everything else in the
// app imports API_BASE_URL from here, never `import.meta.env` (or
// `window.__COOLCULATOR_CONFIG__`) directly.
//
// Two mechanisms, in priority order:
//  1. window.__COOLCULATOR_CONFIG__.API_BASE_URL — set at *container
//     startup* by the Docker image's entrypoint (see
//     docker/runtime-config.template.js + docker/docker-entrypoint.d/), so
//     one built image can point at a different backend per environment
//     without a rebuild. Vite bakes VITE_API_BASE_URL in at *build* time,
//     which alone would defeat the point of shipping a single Docker image.
//  2. import.meta.env.VITE_API_BASE_URL — the build-time value, used for
//     `npm run dev`/`vite build` outside Docker (Render, a plain static
//     host, or local dev), and as the fallback if no runtime config was
//     injected.
export const API_BASE_URL: string =
  window.__COOLCULATOR_CONFIG__?.API_BASE_URL || import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
  // Fail loudly at startup rather than let every API call fail later with
  // a confusing "fetch failed" — this is a build/deploy misconfiguration,
  // not a runtime condition to recover from.
  throw new Error("VITE_API_BASE_URL is not set. Configure it in .env (see .env.example).");
}
