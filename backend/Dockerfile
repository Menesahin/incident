# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Stage 2: Build
FROM deps AS build
COPY . .
RUN pnpm build

# Stage 3: Production
FROM node:22-alpine AS production
RUN apk add --no-cache curl
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
USER appuser
HEALTHCHECK --interval=15s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1
EXPOSE 3000
CMD ["node", "dist/main.js"]
