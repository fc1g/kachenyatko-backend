FROM node:23-alpine AS base

WORKDIR /usr/src/app

FROM base AS deps

COPY package.json pnpm-*.yaml ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json

RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM deps AS dev

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

COPY apps/gateway apps/gateway
COPY libs libs

EXPOSE 3002

CMD ["pnpm", "start:dev", "gateway"]

FROM deps AS builder

COPY apps/gateway apps/gateway
COPY libs libs

RUN pnpm build

FROM node:23-alpine AS runner

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/pnpm-*.yaml ./
COPY --from=builder /usr/src/app/tsconfig.json ./tsconfig.json
COPY --from=builder /usr/src/app/nest-cli.json ./nest-cli.json

COPY --from=builder /usr/src/app/dist ./dist

RUN corepack enable pnpm && pnpm install --prod --frozen-lockfile

EXPOSE 3002

CMD ["node", "dist/apps/gateway/main.js"]