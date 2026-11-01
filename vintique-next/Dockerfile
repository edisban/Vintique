FROM node:22-slim AS base
# Prisma's query engine needs OpenSSL
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
# Placeholder so Better Auth can load during the build; the real secret is set at runtime
RUN BETTER_AUTH_SECRET=build-only-placeholder-not-used-at-runtime npm run build

FROM base AS runner
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
# Prisma CLI to apply migrations on start; keep in sync with the prisma version in package.json
ARG PRISMA_VERSION=5.22.0
RUN npm install -g prisma@${PRISMA_VERSION} && npm cache clean --force
# Standalone output: server.js plus only the node_modules it needs
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=node:node /app/prisma ./prisma
# Run as the unprivileged user that ships with the Node image
USER node
EXPOSE 3000
CMD ["sh", "-c", "prisma migrate deploy && node server.js"]
