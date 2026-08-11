FROM bun:1.3 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

RUN bun install

# Copy source
COPY apps/backend ./apps/backend
COPY packages/database ./packages/database
COPY packages/shared ./packages/shared

EXPOSE 4000
CMD ["bun", "run", "apps/backend/src/index.ts"]
