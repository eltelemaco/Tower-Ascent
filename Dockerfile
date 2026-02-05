# Tower Rescue - Production image (static Expo build + Express server)
# Node 22 required: build script uses fs.globSync and modern fetch

# -----------------------------------------------------------------------------
# Stage 1: Build static Expo bundles and server bundle
# -----------------------------------------------------------------------------
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source (client, server, shared, assets, scripts, config)
COPY . .

# Build static Expo assets (Metro + bundle download). Domain used for asset URLs in the app.
ENV EXPO_PUBLIC_DOMAIN=localhost
RUN npm run expo:static:build

# Web build for browser: game loads at / instead of Expo Go landing
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