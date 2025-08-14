#!/bin/bash

# RIS OMS Production Build Script
# This script builds the application for production deployment

set -e  # Exit on any error

echo "🚀 Starting RIS OMS Production Build..."

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
    print_error "package.json not found. Are you in the project root?"
    exit 1
fi

if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found. Using .env if available."
fi

print_status "Installing production dependencies..."
npm ci --only=production

print_status "Running TypeScript type checking..."
npm run typecheck

print_status "Running ESLint..."
npm run lint

print_status "Building application for production..."
NODE_ENV=production npm run build:production

print_status "Checking build output..."
if [ ! -d ".next" ]; then
    print_error "Build failed - .next directory not found"
    exit 1
fi

# Calculate build size
BUILD_SIZE=$(du -sh .next | cut -f1)
print_status "Build completed successfully! Build size: $BUILD_SIZE"

# Optional: Run security audit
if command -v npm &> /dev/null; then
    print_status "Running security audit..."
    npm audit --production || print_warning "Security audit found issues"
fi

echo ""
print_status "✅ Production build completed successfully!"
print_status "📁 Build output available in .next directory"
print_status "🚀 Ready for deployment!"

echo ""
echo "Next steps:"
echo "1. Deploy to your hosting platform"
echo "2. Set up environment variables in production"
echo "3. Configure monitoring and logging"
echo "4. Run health checks after deployment"