FROM node:23-alpine AS base

WORKDIR /usr/src/app

RUN apk update && apk add --no-cache curl
RUN corepack enable pnpm

FROM base AS deps

# Root
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.json nest-cli.json ./

# Gateway package
# COPY apps/gateway/package.json apps/gateway/

RUN pnpm install --frozen-lockfile

FROM deps AS dev

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

COPY apps/gateway apps/gateway
COPY libs libs

EXPOSE 3005

CMD ["pnpm", "start:dev", "gateway"]

FROM deps AS builder

COPY apps/gateway apps/gateway
COPY libs libs

RUN pnpm build gateway

FROM node:23-alpine AS runner

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ENV HUSKY=0

RUN corepack enable pnpm

COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/pnpm-workspace.yaml ./
# COPY --from=builder /usr/src/app/apps/gateway/package.json apps/gateway/package.json

COPY --from=builder /usr/src/app/dist ./dist

RUN pnpm install --prod --ignore-scripts --frozen-lockfile

EXPOSE 3005

CMD ["node", "dist/apps/gateway/main.js"]