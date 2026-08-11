FROM oven/bun:1.2-alpine AS base
WORKDIR /app

# Copy root and workspace package files
COPY package.json bun.lock* ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN bun install

# Copy source code
COPY apps/backend ./apps/backend
COPY packages/database ./packages/database
COPY packages/shared ./packages/shared

# Generate Prisma Client for database package
RUN cd packages/database && bunx prisma generate

EXPOSE 4000
ENV PORT=4000
ENV NODE_ENV=production

CMD ["bun", "run", "apps/backend/src/index.ts"]
