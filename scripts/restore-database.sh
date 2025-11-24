#!/bin/bash

# Supabase Database Restoration Script
# This script helps restore the Supabase database from backup

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Supabase Database Restoration Script ===${NC}\n"

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    # Check for Homebrew installation
    if [ -f "/opt/homebrew/opt/postgresql@15/bin/psql" ]; then
        PSQL_CMD="/opt/homebrew/opt/postgresql@15/bin/psql"
        echo -e "${GREEN}✓ Found PostgreSQL 15 (Homebrew installation)${NC}"
    else
        echo -e "${RED}✗ psql not found. Please install PostgreSQL first.${NC}"
        echo -e "Run: brew install postgresql@15"
        exit 1
    fi
else
    PSQL_CMD="psql"
    echo -e "${GREEN}✓ PostgreSQL is installed${NC}"
fi

# Verify backup file exists
BACKUP_FILE="supabase/db_cluster-30-07-2025@06-58-24.backup"
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${YELLOW}⚠ Backup file not found. Attempting to decompress...${NC}"
    if [ -f "${BACKUP_FILE}.gz" ]; then
        gunzip -k "${BACKUP_FILE}.gz"
        echo -e "${GREEN}✓ Backup file decompressed${NC}"
    else
        echo -e "${RED}✗ Backup file not found: ${BACKUP_FILE}.gz${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Backup file found ($(ls -lh $BACKUP_FILE | awk '{print $5}'))${NC}"
fi

echo ""
echo -e "${YELLOW}=== Connection Information Required ===${NC}"
echo -e "Please provide your Supabase connection details:"
echo ""

# Get connection string from user
read -p "Enter Supabase connection string (Session Pooler): " CONNECTION_STRING

if [ -z "$CONNECTION_STRING" ]; then
    echo -e "${RED}✗ Connection string is required${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}=== Starting Database Restoration ===${NC}"
echo -e "This may take 1-2 minutes..."
echo ""

# Execute restoration
if $PSQL_CMD -d "$CONNECTION_STRING" -f "$BACKUP_FILE"; then
    echo ""
    echo -e "${GREEN}=== Database Restoration Completed ===${NC}"
    echo ""
    echo -e "${YELLOW}Note: Some 'object already exists' errors are normal.${NC}"
    echo -e "${YELLOW}These occur because Supabase pre-creates default schema objects.${NC}"
    echo ""
    echo -e "${GREEN}Next steps:${NC}"
    echo "1. Update your .env.local file with Supabase credentials"
    echo "2. Verify the restoration by checking tables in Supabase Dashboard"
    echo "3. Test the application connection with: npm run dev"
else
    echo ""
    echo -e "${RED}=== Database Restoration Failed ===${NC}"
    echo ""
    echo -e "${YELLOW}Common issues:${NC}"
    echo "- Wrong password: Wait 2-5 minutes after resetting password"
    echo "- Connection error: Check your network and Supabase project status"
    echo "- SSL error: Ensure connection string includes SSL mode"
    exit 1
fi
