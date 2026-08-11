FROM bun:1.3 AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb* ./
COPY apps/web/package.json ./apps/web/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

RUN bun install

# Copy source
COPY apps/web ./apps/web
COPY packages/database ./packages/database
COPY packages/shared ./packages/shared

# Build
WORKDIR /app/apps/web
ENV NEXT_TELEMETRY_DISABLED 1
RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "start"]
