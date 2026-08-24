#!/bin/sh
# Regenerates runtime-config.js from the API_BASE_URL environment variable
# every time the container starts — this is what lets one built image point
# at a different backend per environment (see src/config/env.ts).
#
# Dropped into /docker-entrypoint.d/: the official nginx image's own
# entrypoint runs every executable script there, in order, before starting
# nginx — no custom ENTRYPOINT needed.
set -eu

: "${API_BASE_URL:?API_BASE_URL must be set (see the Dockerfile's default and docker-compose.yml)}"

envsubst '${API_BASE_URL}' \
  < /usr/share/nginx/html/runtime-config.template.js \
  > /usr/share/nginx/html/runtime-config.js
