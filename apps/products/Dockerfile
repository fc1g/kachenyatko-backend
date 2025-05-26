FROM node:23-alpine AS base

WORKDIR /usr/src/app

RUN apk update && apk add --no-cache curl
RUN corepack enable pnpm

FROM base AS deps

# Root
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.json nest-cli.json ./

# Products package
COPY apps/products/package.json apps/products/
COPY apps/products/pnpm-lock.yaml apps/products/

RUN pnpm install --frozen-lockfile

FROM deps AS dev

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

COPY apps/products apps/products
COPY libs libs

EXPOSE 3001

CMD ["pnpm", "start:dev", "products"]

FROM deps AS builder

COPY apps/products apps/products
COPY libs libs

RUN pnpm build products

FROM node:23-alpine AS runner

WORKDIR /usr/src/app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ENV HUSKY=0

RUN corepack enable pnpm

COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/pnpm-lock.yaml ./
COPY --from=builder /usr/src/app/pnpm-workspace.yaml ./
COPY --from=builder /usr/src/app/apps/products/package.json apps/products/package.json

COPY --from=builder /usr/src/app/dist ./dist

RUN pnpm install --prod --ignore-scripts --frozen-lockfile

EXPOSE 3001

CMD ["node", "dist/apps/products/main.js"]