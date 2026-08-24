// Template for public/runtime-config.js's Docker-runtime replacement — see
// docker-entrypoint.d/20-coolculator-runtime-config.sh, which runs
// `envsubst` over this at container startup. Never loaded directly.
window.__COOLCULATOR_CONFIG__ = {
  API_BASE_URL: "${API_BASE_URL}",
};
