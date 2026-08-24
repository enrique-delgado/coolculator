# syntax=docker/dockerfile:1

# ---- Build stage ----------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /src

# Cache npm install in its own layer, separate from source changes.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# The build-time VITE_API_BASE_URL baked in here only matters if
# runtime-config.js's override (see below) is ever absent — harmless either
# way, since API_BASE_URL always wins when the container starts.
RUN npm run build

# ---- Runtime stage ----------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

COPY --from=builder /src/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/runtime-config.template.js /usr/share/nginx/html/runtime-config.template.js
COPY docker/docker-entrypoint.d/20-coolculator-runtime-config.sh /docker-entrypoint.d/20-coolculator-runtime-config.sh
RUN chmod +x /docker-entrypoint.d/20-coolculator-runtime-config.sh

# Sane default so `docker run` with no -e still works; docker-compose.yml
# overrides this to the value that's actually reachable from the browser
# (see its comment on why that can't be the internal service name).
ENV API_BASE_URL=http://localhost:8080

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1
# 127.0.0.1, not "localhost": this nginx image doesn't listen on IPv6 in
# every environment, and "localhost" can resolve to ::1 first — found by
# actually running this container rather than assuming.

# No custom ENTRYPOINT/CMD needed — inherited from the nginx base image,
# which runs every script in /docker-entrypoint.d/ (ours included) before
# starting nginx in the foreground.
