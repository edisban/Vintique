FROM node:22 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
# Placeholder so Better Auth can load during the build; the real secret is set at runtime
RUN BETTER_AUTH_SECRET=build-only-placeholder-not-used-at-runtime npm run build

FROM node:22 AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
# Apply pending migrations, then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
