# syntax=docker/dockerfile:1

# One Dockerfile for every Next.js app in the monorepo. Pick the app with
# the APP build arg (the folder name under apps/):
#
#   docker build -t tau-web .
#   docker build --build-arg APP=admin -t tau-admin .
#
#   docker run -p 3000:3000 tau-web
#   docker run -p 3001:3000 tau-admin
#
# Each app builds with `output: "standalone"`, so the runtime image carries
# only the traced server files, not the whole node_modules tree.

ARG NODE_VERSION=22-alpine

# ---- deps: install the whole workspace from the lockfile ----
FROM node:${NODE_VERSION} AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps ./apps
COPY packages ./packages
# Only package.json files matter for install; drop sources to keep this
# layer cached until a manifest or the lockfile changes.
RUN find apps packages -mindepth 2 -not -name package.json -not -type d -delete
RUN npm ci

# ---- builder: compile the selected app ----
FROM node:${NODE_VERSION} AS builder
ARG APP=web
WORKDIR /repo
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
RUN npm run build --workspace apps/${APP}

# ---- runner: minimal production image ----
FROM node:${NODE_VERSION} AS runner
ARG APP=web
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    APP=${APP}

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

# Standalone output mirrors the monorepo layout (tracing root is the repo
# root), so the server lives at apps/<APP>/server.js. Static assets and
# public/ are not traced and must be copied next to it.
COPY --from=builder --chown=nextjs:nodejs /repo/apps/${APP}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /repo/apps/${APP}/.next/static ./apps/${APP}/.next/static
COPY --from=builder --chown=nextjs:nodejs /repo/apps/${APP}/public ./apps/${APP}/public

USER nextjs
EXPOSE 3000
CMD ["sh", "-c", "exec node apps/${APP}/server.js"]
