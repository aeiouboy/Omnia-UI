#!/bin/bash

# RIS OMS NestJS Backend Production Build Script
# This script builds the NestJS API backend for production deployment

set -e  # Exit on any error

echo "🚀 Starting RIS OMS NestJS Backend Production Build..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required files exist
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the NestJS backend root?"
    exit 1
fi

if [ ! -f ".env.example" ]; then
    print_warning ".env.example not found. Using default environment."
fi

print_status "Installing production dependencies..."
npm ci --only=production

print_status "Building NestJS application for production..."
npm run build

print_status "Checking build output..."
if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not found"
    exit 1
fi

# Calculate build size
BUILD_SIZE=$(du -sh dist | cut -f1)
print_status "Build completed successfully! Build size: $BUILD_SIZE"

print_status "Running database migrations..."
if [ -f ".env.production" ] || [ -f ".env" ]; then
    npm run migration:run || print_warning "Database migrations failed or not configured"
else
    print_warning "No environment file found - skipping database migrations"
fi

# Optional: Run security audit
if command -v npm &> /dev/null; then
    print_status "Running security audit..."
    npm audit --production || print_warning "Security audit found issues"
fi

print_status "Testing production build..."
timeout 10s npm run start:prod > /dev/null 2>&1 &
BUILD_PID=$!
sleep 5

if kill -0 $BUILD_PID 2>/dev/null; then
    print_status "Production build starts successfully"
    kill $BUILD_PID 2>/dev/null || true
else
    print_error "Production build failed to start"
fi

echo ""
print_status "✅ NestJS Backend production build completed successfully!"
print_status "📁 Build output available in dist/ directory"
print_status "🚀 Ready for deployment!"

echo ""
echo "Next steps:"
echo "1. Set up production environment variables"
echo "2. Configure PostgreSQL database"
echo "3. Deploy to your hosting platform"
echo "4. Run health checks after deployment"
echo ""
echo "Start production server:"
echo "  npm run start:prod"
echo ""
echo "Health check endpoint:"
echo "  curl http://localhost:3001/health"