# syntax=docker/dockerfile:1

# Multi-stage build producing a minimal production image from Next.js'
# standalone output. Debian "slim" (glibc) is used rather than Alpine for the
# widest native-module compatibility (tesseract.js WASM, optional canvas).

FROM node:22-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1

# ---- Install dependencies (cached unless lockfile changes) ----
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build the app ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

# ---- Runtime image ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Run as an unprivileged user.
RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nextjs

# Copy the standalone server + the assets it can't inline.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# The standalone build emits server.js; it honors PORT / HOSTNAME.
CMD ["node", "server.js"]
