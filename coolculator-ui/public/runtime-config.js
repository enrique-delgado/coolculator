// No-op default for non-Docker contexts (local dev, `vite build`, Render,
// any plain static host) — src/config/env.ts falls back to the build-time
// VITE_API_BASE_URL whenever this is empty.
//
// Inside the Docker image, this exact file is regenerated at container
// startup from docker/runtime-config.template.js (see
// docker/docker-entrypoint.d/), so one built image can point at a
// different backend per environment without a rebuild.
window.__COOLCULATOR_CONFIG__ = window.__COOLCULATOR_CONFIG__ || {};
