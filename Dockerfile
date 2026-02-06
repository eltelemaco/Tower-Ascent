# Tower Rescue - Production image (static Expo build + Express server)
# Node 22 required: build script uses fs.globSync and modern fetch
#
# Build for production at https://n8n.telemaco.com.mx/tower:
#   docker build \
#     --build-arg EXPO_PUBLIC_DOMAIN=https://n8n.telemaco.com.mx/tower \
#     --build-arg BASE_PATH=/tower \
#     -t tower-rescue .
#
# Run: docker run -p 5000:5000 tower-rescue
# Then put the app behind a reverse proxy so https://n8n.telemaco.com.mx/tower proxies to http://container:5000/tower

# -----------------------------------------------------------------------------
# Stage 1: Build static Expo bundles and server bundle
# -----------------------------------------------------------------------------
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install dependencies
# --omit=optional: skip optional deps that often fail on Linux (e.g. fsevents)
COPY package.json package-lock.json ./
RUN npm ci --omit=optional

# Copy source (client, server, shared, assets, scripts, config)
COPY . .

# Production URL including path (e.g. https://n8n.telemaco.com.mx/tower). Pass at build time:
#   docker build --build-arg EXPO_PUBLIC_DOMAIN=https://n8n.telemaco.com.mx/tower -t tower-rescue .
ARG EXPO_PUBLIC_DOMAIN=localhost
ENV EXPO_PUBLIC_DOMAIN=${EXPO_PUBLIC_DOMAIN}

# Base path to mount the app at (e.g. /tower). Derive from EXPO_PUBLIC_DOMAIN path or set explicitly.
ARG BASE_PATH=
ENV BASE_PATH=${BASE_PATH}

# Build static Expo assets (Metro + bundle download). Asset URLs use EXPO_PUBLIC_DOMAIN (full URL with path).
RUN npm run expo:static:build

# When BASE_PATH is set, set Expo web baseUrl so assets load from the subpath (e.g. /tower).
RUN node -e "const fs=require('fs'); const p=require('./app.json'); if (process.env.BASE_PATH) { p.expo.experiments = p.expo.experiments || {}; p.expo.experiments.baseUrl = process.env.BASE_PATH; fs.writeFileSync('app.json', JSON.stringify(p, null, 2)); }"

# Web build for browser: game loads at / or at BASE_PATH when set
RUN npx expo export --platform web

# Bundle Express server with esbuild
RUN npm run server:build

# -----------------------------------------------------------------------------
# Stage 2: Production runtime
# -----------------------------------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Production URL and base path (for CORS and mounting app at subpath). Pass at build time.
ARG EXPO_PUBLIC_DOMAIN=
ARG BASE_PATH=
ENV EXPO_PUBLIC_DOMAIN=${EXPO_PUBLIC_DOMAIN}
ENV BASE_PATH=${BASE_PATH}

# Install production dependencies only (server bundle uses --packages=external)
COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

# Copy built server
COPY --from=builder /app/server_dist ./server_dist

# Copy static Expo build (manifests + timestamped bundles/assets)
COPY --from=builder /app/static-build ./static-build

# Copy web build (game loads at / in browser)
COPY --from=builder /app/dist ./dist

# Copy assets and server template (landing page, app name)
COPY --from=builder /app/assets ./assets
COPY --from=builder /app/server/templates ./server/templates
COPY --from=builder /app/app.json ./app.json

EXPOSE 5000

CMD ["node", "server_dist/index.js"]