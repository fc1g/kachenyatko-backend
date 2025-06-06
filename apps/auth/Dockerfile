FROM node:23-alpine AS base

WORKDIR /usr/src/app

RUN apk update && apk add --no-cache curl
RUN corepack enable pnpm

FROM base AS deps

# Root
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.json nest-cli.json ./

# Auth package
COPY apps/auth/package.json apps/auth/
COPY apps/auth/pnpm-lock.yaml apps/auth/

RUN pnpm install --frozen-lockfile

FROM deps AS dev

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

COPY apps/auth apps/auth
COPY libs libs
COPY proto proto

EXPOSE 3002

CMD ["pnpm", "start:dev", "auth"]

FROM deps AS builder

COPY apps/auth apps/auth
COPY libs libs
COPY proto proto

RUN pnpm build auth

FROM node:23-alpine AS runner

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ENV HUSKY=0

RUN corepack enable pnpm

COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/pnpm-workspace.yaml ./
COPY --from=builder /usr/src/app/apps/auth/package.json apps/auth/package.json
COPY --from=builder /usr/src/app/apps/auth/pnpm-lock.yaml apps/auth/pnpm-lock.yaml

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/proto ./proto

RUN pnpm install --prod --ignore-scripts --frozen-lockfile

EXPOSE 3002

CMD ["node", "dist/apps/auth/main.js"]