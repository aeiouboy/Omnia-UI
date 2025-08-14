#!/bin/bash

# RIS OMS NestJS Backend Docker Deployment Script
# Build and deploy NestJS API backend using Docker

set -e

echo "🐳 Starting RIS OMS NestJS Backend Docker Deployment..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
DOCKER_IMAGE="ris-oms-backend"
DOCKER_TAG="${1:-latest}"
CONTAINER_NAME="ris-oms-backend-prod"
CONTAINER_PORT="3001"
HOST_PORT="3001"

print_status "Building Docker image: $DOCKER_IMAGE:$DOCKER_TAG"

# Create optimized Dockerfile for NestJS if it doesn't exist
if [ ! -f "Dockerfile" ]; then
    print_status "Creating production Dockerfile for NestJS..."
    cat > Dockerfile << 'EOF'
# Multi-stage build for NestJS production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set production environment
ENV NODE_ENV=production

# Build the NestJS application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json

USER nestjs

EXPOSE 3001

ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "dist/src/main"]
EOF
    print_status "Dockerfile created"
fi

# Build Docker image
print_status "Building Docker image..."
docker build -t $DOCKER_IMAGE:$DOCKER_TAG .

# Stop existing container if running
if docker ps -q -f name=$CONTAINER_NAME | grep -q .; then
    print_warning "Stopping existing container: $CONTAINER_NAME"
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Run new container
print_status "Starting new container: $CONTAINER_NAME"
docker run -d \
    --name $CONTAINER_NAME \
    --restart unless-stopped \
    -p $HOST_PORT:$CONTAINER_PORT \
    --env-file .env.example \
    $DOCKER_IMAGE:$DOCKER_TAG

# Wait for container to be ready
print_status "Waiting for container to be ready..."
sleep 15

# Health check
if curl -f http://localhost:$HOST_PORT/health >/dev/null 2>&1; then
    print_status "✅ Deployment successful! NestJS API is running at http://localhost:$HOST_PORT"
    print_status "📖 API Documentation: http://localhost:$HOST_PORT/docs"
else
    print_warning "⚠️ Container is running but health check failed"
    print_status "Check container logs: docker logs $CONTAINER_NAME"
fi

echo ""
print_status "NestJS Backend Docker deployment completed!"
echo "Container: $CONTAINER_NAME"
echo "Image: $DOCKER_IMAGE:$DOCKER_TAG"
echo "API: http://localhost:$HOST_PORT"
echo "Docs: http://localhost:$HOST_PORT/docs"
echo "Health: http://localhost:$HOST_PORT/health"
echo ""
echo "Useful commands:"
echo "- View logs: docker logs -f $CONTAINER_NAME"
echo "- Stop container: docker stop $CONTAINER_NAME"
echo "- Remove container: docker rm $CONTAINER_NAME"
echo "- Shell into container: docker exec -it $CONTAINER_NAME sh"
echo ""
echo "API Endpoints:"
echo "- Orders: http://localhost:$HOST_PORT/api/v1/orders"
echo "- Dashboard: http://localhost:$HOST_PORT/api/v1/dashboard/summary"
echo "- WebSocket: ws://localhost:$HOST_PORT"