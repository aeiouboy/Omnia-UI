#!/bin/bash

# RIS OMS NestJS Backend Health Check Script
# Verifies NestJS API health and all endpoints

set -e

echo "🏥 RIS OMS NestJS Backend Health Check..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Configuration
BASE_URL="${1:-http://localhost:3001}"
TIMEOUT=10
FAILED_CHECKS=0

# Function to check HTTP endpoint
check_endpoint() {
    local endpoint="$1"
    local expected_status="${2:-200}"
    local description="$3"
    
    echo -n "Checking $description... "
    
    if response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$BASE_URL$endpoint" 2>/dev/null); then
        if [ "$response" = "$expected_status" ]; then
            print_status "$description (HTTP $response)"
        else
            print_error "$description (HTTP $response, expected $expected_status)"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        fi
    else
        print_error "$description (Connection failed)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

# Function to check API endpoint with JSON response
check_api_endpoint() {
    local endpoint="$1"
    local description="$2"
    
    echo -n "Checking $description... "
    
    if response=$(curl -s --max-time $TIMEOUT "$BASE_URL$endpoint" 2>/dev/null); then
        if echo "$response" | python3 -m json.tool >/dev/null 2>&1; then
            print_status "$description (Valid JSON)"
        else
            print_warning "$description (Invalid JSON response)"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        fi
    else
        print_error "$description (Connection failed)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

echo "🌐 Base URL: $BASE_URL"
echo ""

# Basic health checks
print_status "Starting NestJS API health checks..."

# Core endpoints
check_endpoint "/health" 200 "Health endpoint"
check_endpoint "/docs" 200 "API documentation"

# RIS OMS API endpoints
check_api_endpoint "/api/v1/orders" "Orders API"
check_api_endpoint "/api/v1/orders/counts" "Order counts API"
check_api_endpoint "/api/v1/dashboard/summary" "Dashboard summary API"
check_endpoint "/api/v1/notifications/escalations" 200 "Escalations API"

# Database connectivity check
echo -n "Checking database connectivity... "
if response=$(curl -s --max-time $TIMEOUT "$BASE_URL/health" 2>/dev/null); then
    if echo "$response" | grep -q "database.*healthy\|ok\|up" 2>/dev/null; then
        print_status "Database connection healthy"
    else
        print_warning "Database connection status unclear"
    fi
else
    print_error "Cannot check database status"
fi

# WebSocket connectivity (basic check)
echo -n "Checking WebSocket server... "
if command -v wscat &> /dev/null; then
    if timeout 5s wscat -c "$BASE_URL" --no-check </dev/null >/dev/null 2>&1; then
        print_status "WebSocket server responding"
    else
        print_warning "WebSocket server not responding (may be normal if not configured)"
    fi
else
    print_warning "wscat not installed - skipping WebSocket check"
fi

# External API connectivity check
print_status "Checking external dependencies..."
echo -n "Checking Central Group API connectivity... "
if curl -s --max-time $TIMEOUT "https://dev-pmpapis.central.co.th" >/dev/null 2>&1; then
    print_status "External API reachable"
else
    print_warning "External API may be unreachable"
fi

# Performance check
echo ""
print_status "Performance check..."
echo -n "Measuring API response time... "

if command -v curl &> /dev/null; then
    RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" --max-time $TIMEOUT "$BASE_URL/health" 2>/dev/null || echo "timeout")
    
    if [ "$RESPONSE_TIME" != "timeout" ]; then
        RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc -l 2>/dev/null || echo "unknown")
        if (( $(echo "$RESPONSE_TIME < 1.0" | bc -l 2>/dev/null) )); then
            print_status "Response time: ${RESPONSE_MS}ms (Excellent)"
        elif (( $(echo "$RESPONSE_TIME < 3.0" | bc -l 2>/dev/null) )); then
            print_warning "Response time: ${RESPONSE_MS}ms (Acceptable)"
        else
            print_error "Response time: ${RESPONSE_MS}ms (Slow)"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        fi
    else
        print_error "Response time check timed out"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
fi

# Memory check (if container)
if command -v docker &> /dev/null && docker ps --format "table {{.Names}}" | grep -q "ris-oms-backend"; then
    echo -n "Checking container memory usage... "
    MEMORY_USAGE=$(docker stats --no-stream --format "{{.MemPerc}}" ris-oms-backend-prod 2>/dev/null | sed 's/%//')
    if [ ! -z "$MEMORY_USAGE" ]; then
        if (( $(echo "$MEMORY_USAGE < 80" | bc -l 2>/dev/null) )); then
            print_status "Memory usage: ${MEMORY_USAGE}% (Good)"
        else
            print_warning "Memory usage: ${MEMORY_USAGE}% (High)"
        fi
    fi
fi

# Summary
echo ""
echo "📊 NestJS Backend Health Check Summary:"
echo "======================================="

if [ $FAILED_CHECKS -eq 0 ]; then
    print_status "All health checks passed! 🎉"
    echo "NestJS API backend is healthy and ready for production use."
    echo ""
    echo "🔗 Available Endpoints:"
    echo "- API Documentation: $BASE_URL/docs"
    echo "- Health Check: $BASE_URL/health"
    echo "- Orders API: $BASE_URL/api/v1/orders"
    echo "- Dashboard API: $BASE_URL/api/v1/dashboard/summary"
    echo "- WebSocket: ws://$(echo $BASE_URL | sed 's/http[s]*:\/\///')"
    exit 0
else
    print_error "$FAILED_CHECKS check(s) failed"
    echo "Please review the failed checks before proceeding to production."
    echo ""
    echo "Common troubleshooting:"
    echo "1. Check if the NestJS server is running: npm run start:prod"
    echo "2. Verify database connection and migrations"
    echo "3. Check environment variables configuration"
    echo "4. Review server logs for errors"
    exit 1
fi