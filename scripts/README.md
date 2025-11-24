# Database Restoration Scripts

## Quick Start

### Restore Supabase Database

```bash
./scripts/restore-database.sh
```

This automated script will:
1. ✅ Verify PostgreSQL installation
2. ✅ Check backup file exists and decompress if needed
3. ℹ️ Prompt for Supabase connection string
4. ⚡ Execute database restoration
5. ✅ Verify completion and provide next steps

## Prerequisites

Before running the restoration script, ensure you have:

1. **Supabase Project Ready**
   - Created new project or selected existing one
   - Database password has been reset
   - Waited 2-5 minutes for password propagation

2. **Connection Information**
   - Session Pooler connection string from Supabase Dashboard
   - Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`

3. **Environment Variables Ready**
   - Supabase URL: `https://[PROJECT-REF].supabase.co`
   - Supabase Anon Key: From Settings → API in Supabase Dashboard

## What the Script Does

The restoration script (`restore-database.sh`):

- **Checks PostgreSQL**: Verifies `psql` is installed (supports both system and Homebrew installations)
- **Validates Backup**: Ensures backup file exists, decompresses if needed
- **Interactive Prompts**: Asks for connection string securely
- **Executes Restoration**: Runs `psql` with proper error handling
- **Provides Feedback**: Shows success/failure with helpful messages
- **Next Steps Guidance**: Tells you what to do after restoration

## Expected Output

### Success

```
=== Supabase Database Restoration Script ===

✓ Found PostgreSQL 15 (Homebrew installation)
✓ Backup file found (192K)

=== Connection Information Required ===
Please provide your Supabase connection details:

Enter Supabase connection string (Session Pooler): [your-connection-string]

=== Starting Database Restoration ===
This may take 1-2 minutes...

[... restoration output ...]

=== Database Restoration Completed ===

Note: Some 'object already exists' errors are normal.
These occur because Supabase pre-creates default schema objects.

Next steps:
1. Update your .env.local file with Supabase credentials
2. Verify the restoration by checking tables in Supabase Dashboard
3. Test the application connection with: npm run dev
```

### Common Errors (and why they're OK)

These errors are **EXPECTED** and can be safely ignored:

```
ERROR: role "postgres" already exists
ERROR: schema "public" already exists
ERROR: extension "uuid-ossp" already exists
```

## After Restoration

1. **Create `.env.local`** file in project root:

```bash
# Copy from template
cp .env.sample .env.local

# Edit with your actual values
nano .env.local  # or use your preferred editor
```

2. **Add Supabase credentials** to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ACTUAL-ANON-KEY]
```

3. **Verify restoration**:

```bash
# Test application connection
npm run dev

# Check console - should NOT see "Using mock client" warning
```

## Troubleshooting

### "psql: command not found"

**Solution**: Install PostgreSQL:

```bash
brew install postgresql@15
```

### "Wrong password" error

**Solution**:
1. Wait 2-5 more minutes (password reset takes time to propagate)
2. Verify you copied the password correctly
3. Try resetting the password again in Supabase Dashboard

### "Backup file not found"

**Solution**: The script will attempt to decompress automatically, but you can also do it manually:

```bash
cd supabase
gunzip -k db_cluster-30-07-2025@06-58-24.backup.gz
```

### Connection timeout

**Solution**:
1. Check your internet connection
2. Verify Supabase project is active (not paused)
3. Try using direct connection instead of session pooler

## Manual Restoration

If you prefer to restore manually without the script:

```bash
# Decompress backup (if not already done)
cd supabase
gunzip -k db_cluster-30-07-2025@06-58-24.backup.gz

# Run restoration
/opt/homebrew/opt/postgresql@15/bin/psql \
  -d "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" \
  -f db_cluster-30-07-2025@06-58-24.backup
```

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env.local` to git (already in `.gitignore`)
- Keep database passwords secure
- Don't share connection strings publicly
- Use environment variables for all credentials

## Resources

- **Full Documentation**: See `specs/supabase-restoration-log.md`
- **Supabase Docs**: https://supabase.com/docs/guides/platform/migrating-within-supabase
- **PostgreSQL Docs**: https://www.postgresql.org/docs/current/app-psql.html
