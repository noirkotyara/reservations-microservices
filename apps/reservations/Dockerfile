# =============================================================================
# Multi-stage Dockerfile for Reservations Service
# =============================================================================
# Usage:
#   Development: docker build --target development -t reservations:dev .
#   Production:  docker build --target production -t reservations:prod .
# =============================================================================

# -----------------------------------------------------------------------------
# Base stage: Common setup for all environments
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

WORKDIR /app

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package management files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY nest-cli.json tsconfig*.json ./

# -----------------------------------------------------------------------------
# Dependencies stage: Install all dependencies (dev + prod)
# -----------------------------------------------------------------------------
FROM base AS dependencies

# Copy workspace structure
COPY libs ./libs
COPY apps ./apps

# Install all dependencies (including devDependencies)
RUN pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# Development stage: For local development with hot-reload
# -----------------------------------------------------------------------------
FROM dependencies AS development

# Copy source code (will be overridden by volume mount in docker-compose)
COPY src ./src

# Expose application port and debugger port
EXPOSE 3000 9229

# Set development environment
ENV NODE_ENV=development

# Start application in development mode with watch
CMD ["pnpm", "run", "start:debug", "reservations"]

# -----------------------------------------------------------------------------
# Builder stage: Build the application for production
# -----------------------------------------------------------------------------
FROM dependencies AS builder

# Copy source code
COPY src ./src

# Build the application
RUN pnpm run build reservations

# Prune development dependencies
RUN pnpm prune --prod --no-optional

# -----------------------------------------------------------------------------
# Production stage: Optimized production image
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy only necessary files for runtime
COPY --chown=nestjs:nodejs package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy production dependencies and built application from builder
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copy only the package.json files for workspace structure (needed for pnpm)
COPY --from=builder --chown=nestjs:nodejs /app/apps/reservations/package.json ./apps/reservations/package.json
COPY --from=builder --chown=nestjs:nodejs /app/libs/common/package.json ./libs/common/package.json

# Switch to non-root user
USER nestjs

# Expose application port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "dist/apps/reservations/main"]

