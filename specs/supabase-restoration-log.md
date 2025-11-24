# Supabase Database Restoration Log

**Date**: 2025-11-24
**Backup File**: `supabase/db_cluster-30-07-2025@06-58-24.backup.gz` (28KB compressed, 192KB uncompressed)
**Status**: Ready for Restoration

---

## Prerequisites Completed ✅

### 1. PostgreSQL Installation
- **Version**: PostgreSQL 15.15 (Homebrew)
- **Location**: `/opt/homebrew/opt/postgresql@15/bin/psql`
- **Installation Date**: 2025-11-24
- **Status**: ✅ Verified and working

### 2. Backup File Preparation
- **Original File**: `supabase/db_cluster-30-07-2025@06-58-24.backup.gz` (28KB)
- **Decompressed File**: `supabase/db_cluster-30-07-2025@06-58-24.backup` (192KB)
- **Status**: ✅ Decompressed and ready

### 3. Environment Configuration
- **`.gitignore`**: ✅ Configured to ignore `.env*` files
- **`.env.sample`**: ✅ Exists (needs Supabase variables added)
- **`src/lib/supabase.ts`**: ✅ Configured with mock client fallback

---

## Required Manual Steps

### Step 1: Create/Select Supabase Project

Please complete these steps in the Supabase Dashboard:

1. Navigate to: https://supabase.com/dashboard
2. Create a new project or select existing project
3. Record the following information:

```
Project Name: _____________________
Project Region: _____________________
Project Reference ID: _____________________
Project URL: https://[PROJECT-REF].supabase.co
```

### Step 2: Reset Database Password

1. Go to: **Database Settings** in Supabase Dashboard
2. Click: **"Reset Database Password"**
3. Copy and save the new password securely
4. **⚠️ IMPORTANT**: Wait 2-5 minutes for password propagation

### Step 3: Get Connection Details

Retrieve the following from Supabase Dashboard:

#### A. Session Pooler Connection String
- Location: Click **"Connect"** button → **"Session Pooler"**
- Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
- **Action**: Replace `[PASSWORD]` with the new password from Step 2

#### B. Supabase Anon Key
- Location: **Settings** → **API** → **Project API keys**
- Copy: **anon/public** key

---

## Restoration Execution

### Option 1: Using Automated Script (Recommended)

Run the restoration script from the project root:

```bash
./scripts/restore-database.sh
```

The script will:
1. ✅ Verify PostgreSQL installation
2. ✅ Check backup file exists
3. ℹ️ Prompt for connection string
4. ⚡ Execute restoration
5. ✅ Verify completion

### Option 2: Manual Restoration

If you prefer manual restoration, use this command:

```bash
/opt/homebrew/opt/postgresql@15/bin/psql \
  -d "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" \
  -f supabase/db_cluster-30-07-2025@06-58-24.backup
```

**Replace**:
- `[PROJECT-REF]` - Your Supabase project reference ID
- `[PASSWORD]` - Your database password from Step 2
- `[REGION]` - Your project region (e.g., ap-southeast-1)

---

## Expected Output

### Normal Behavior

You may see these **EXPECTED** errors (safe to ignore):

```
ERROR: role "postgres" already exists
ERROR: schema "public" already exists
ERROR: extension "uuid-ossp" already exists
ERROR: extension "pg_stat_statements" already exists
```

These occur because Supabase pre-creates default schema objects.

### Success Indicators

Look for:
- Multiple `CREATE TABLE` statements
- `INSERT 0 X` messages (where X is number of rows)
- Final message indicating completion
- No authentication or connection errors

---

## Post-Restoration Configuration

### Step 4: Update Environment Variables

Create `.env.local` file in project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]

# External API Configuration (keep existing values)
API_BASE_URL=https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1
PARTNER_CLIENT_ID=testpocorderlist
PARTNER_CLIENT_SECRET=xitgmLwmp

# MS Teams Integration (optional)
NEXT_PUBLIC_MS_TEAMS_WEBHOOK_URL=[YOUR-TEAMS-WEBHOOK]
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 5: Verify Database Restoration

#### A. Check via Supabase Dashboard

1. Go to: **Table Editor** in Supabase Dashboard
2. Verify tables exist:
   - `escalation_history`
   - `orders` (if exists in backup)
   - Other application tables

#### B. Check via SQL Editor

Run this query in Supabase SQL Editor:

```sql
-- Check escalation history
SELECT COUNT(*) as escalation_count FROM escalation_history;

-- List all tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

#### C. Test Application Connection

```bash
npm run dev
```

**Expected**:
- ✅ Server starts without errors
- ✅ **NO** "Supabase credentials missing" warning in console
- ✅ Real Supabase client initialized (not mock client)

---

## Verification Checklist

- [ ] PostgreSQL 15+ installed
- [ ] Backup file decompressed (192KB)
- [ ] Supabase project created/selected
- [ ] Database password reset and propagated (waited 2-5 minutes)
- [ ] Connection string obtained
- [ ] Anon key obtained
- [ ] Database restoration executed
- [ ] `.env.local` created with credentials
- [ ] Application connects to Supabase (no mock client warning)
- [ ] Tables visible in Supabase Dashboard
- [ ] Data accessible via queries

---

## Troubleshooting

### Issue: "Wrong Password" Error

**Solution**:
1. Confirm you waited 2-5 minutes after password reset
2. Try resetting password again
3. Ensure no special characters need escaping in connection string

### Issue: GSSAPI Connection Error

**Solution**:
1. Update PostgreSQL to latest version: `brew upgrade postgresql@15`
2. Or use direct connection instead of pooler

### Issue: Mock Client Still Being Used

**Check**:
1. `.env.local` exists in project root
2. Environment variables are correctly named (with `NEXT_PUBLIC_` prefix)
3. No typos in variable names
4. Restart development server after adding env vars

### Issue: "Object Already Exists" Errors

**Status**: ✅ **NORMAL** - Safe to ignore

These errors are expected because Supabase creates default schema objects.

---

## Rollback Procedure

If restoration needs to be reverted:

1. **Option A**: Reset the database via Supabase Dashboard
   - Settings → Database → Database Settings → Reset Database

2. **Option B**: Create new Supabase project and start fresh

3. **Backup Files**: Original compressed backup is preserved at:
   - `supabase/db_cluster-30-07-2025@06-58-24.backup.gz`

---

## Restoration Details

**To be filled after successful restoration:**

```
Restoration Date/Time: _____________________
Project Reference ID: _____________________
Project Region: _____________________
Restoration Duration: _____________________
Tables Restored: _____________________
Row Count (escalation_history): _____________________
Any Issues Encountered: _____________________
Resolution Steps: _____________________
```

---

## Security Notes

⚠️ **CRITICAL SECURITY REMINDERS**:

1. **NEVER commit** `.env.local` to git (already in `.gitignore`)
2. **NEVER commit** database passwords or connection strings
3. Store credentials securely (password manager recommended)
4. Rotate database password periodically
5. Use Row Level Security (RLS) policies in Supabase
6. Keep backup files in secure, off-site location

---

## Additional Resources

- **Supabase Docs**: https://supabase.com/docs/guides/platform/migrating-within-supabase/dashboard-restore
- **PostgreSQL psql**: https://www.postgresql.org/docs/current/app-psql.html
- **Supabase Support**: https://github.com/supabase/supabase/discussions

---

## Next Steps After Restoration

1. **Configure Auth Providers** (if needed):
   - Authentication → Providers → Configure OAuth

2. **Enable Realtime** (if needed):
   - Database → Replication → Enable for specific tables

3. **Deploy Edge Functions** (if needed):
   - Edge Functions → Deploy functions from original project

4. **Configure Extensions** (if needed):
   - Database → Extensions → Enable required extensions

5. **Setup Read Replicas** (if needed):
   - Database → Read Replicas → Configure

6. **Test Application**:
   - Run full application test suite
   - Verify all features work with restored data
   - Check escalation system functionality

---

**Status**: 🟡 Awaiting user input for connection details and restoration execution
