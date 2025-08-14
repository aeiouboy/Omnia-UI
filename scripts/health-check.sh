#!/bin/bash

# RIS OMS Health Check Script
# Verifies application health and dependencies

set -e

echo "🏥 RIS OMS Health Check..."

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
BASE_URL="${1:-http://localhost:3000}"
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
        if echo "$response" | jq . >/dev/null 2>&1; then
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
print_status "Starting health checks..."

# Check main application
check_endpoint "/" 200 "Main application"

# Check API endpoints
check_endpoint "/api/orders" 200 "Orders API"
check_api_endpoint "/api/orders/counts" "Order counts API"
check_endpoint "/api/escalations" 200 "Escalations API"

# Check if jq is available for JSON parsing
if ! command -v jq &> /dev/null; then
    print_warning "jq not installed - skipping detailed API response validation"
fi

# Check database connectivity (if health endpoint exists)
if check_endpoint "/api/health" 200 "Health endpoint" 2>/dev/null; then
    echo -n ""
fi

# Check external API connectivity
print_status "Checking external dependencies..."

# Check if external API is reachable
echo -n "Checking external API connectivity... "
if curl -s --max-time $TIMEOUT "https://dev-pmpapis.central.co.th" >/dev/null 2>&1; then
    print_status "External API reachable"
else
    print_warning "External API may be unreachable"
fi

# Performance check
echo ""
print_status "Performance check..."
echo -n "Measuring response time... "

if command -v curl &> /dev/null; then
    RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" --max-time $TIMEOUT "$BASE_URL" 2>/dev/null || echo "timeout")
    
    if [ "$RESPONSE_TIME" != "timeout" ]; then
        RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc -l 2>/dev/null || echo "unknown")
        if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l 2>/dev/null) )); then
            print_status "Response time: ${RESPONSE_MS}ms (Good)"
        elif (( $(echo "$RESPONSE_TIME < 5.0" | bc -l 2>/dev/null) )); then
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

# Summary
echo ""
echo "📊 Health Check Summary:"
echo "========================"

if [ $FAILED_CHECKS -eq 0 ]; then
    print_status "All health checks passed! 🎉"
    echo "Application is healthy and ready for production use."
    exit 0
else
    print_error "$FAILED_CHECKS check(s) failed"
    echo "Please review the failed checks before proceeding to production."
    exit 1
fi