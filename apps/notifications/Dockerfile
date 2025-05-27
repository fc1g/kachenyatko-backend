FROM node:23-alpine AS base

WORKDIR /usr/src/app

RUN apk update && apk add --no-cache curl
RUN corepack enable pnpm

FROM base AS deps

# Root
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.json nest-cli.json ./

# Notifications package
COPY apps/notifications/package.json apps/notifications/
COPY apps/notifications/pnpm-lock.yaml apps/notifications/

RUN pnpm install --frozen-lockfile

FROM deps AS dev

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

COPY apps/notifications apps/notifications
COPY libs libs
COPY proto proto
  
CMD ["pnpm", "start:dev", "notifications"]

FROM deps AS builder

COPY apps/notifications apps/notifications
COPY libs libs
COPY proto proto

RUN pnpm build notifications

FROM node:23-alpine AS runner

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ENV HUSKY=0

RUN corepack enable pnpm

COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/pnpm-workspace.yaml ./
COPY --from=builder /usr/src/app/apps/notifications/package.json apps/notifications/package.json
COPY --from=builder /usr/src/app/apps/notifications/pnpm-lock.yaml apps/notifications/pnpm-lock.yaml

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/proto ./proto

RUN pnpm install --prod --ignore-scripts --frozen-lockfile

CMD ["node", "dist/apps/notifications/main.js"]