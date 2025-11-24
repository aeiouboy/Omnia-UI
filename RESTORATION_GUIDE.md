# 🔄 Supabase Database Restoration - Quick Start Guide

**Status**: ✅ Prerequisites Complete | 🎯 Ready for Restoration

---

## ✅ What's Been Done

1. ✅ **PostgreSQL 15.15 Installed** (Homebrew)
2. ✅ **Backup File Decompressed** (192KB ready)
3. ✅ **Restoration Script Created** (`scripts/restore-database.sh`)
4. ✅ **Documentation Complete** (`specs/supabase-restoration-log.md`)
5. ✅ **Environment Template Updated** (`.env.sample`)

---

## 🎯 Your Next Steps (Required)

### Step 1: Prepare Supabase Project (5 minutes)

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Create new project** (or select existing):
   - Choose a project name
   - Select region (recommend: `ap-southeast-1` for Asia)
   - Generate strong database password
3. **Wait for project to finish initializing** (1-2 minutes)

### Step 2: Reset Database Password (3 minutes)

1. In your Supabase project, go to: **Settings** → **Database**
2. Scroll to **Database Password** section
3. Click **"Reset Database Password"**
4. **Copy the new password** and save it securely
5. ⚠️ **WAIT 2-5 MINUTES** for password to propagate (this is critical!)

### Step 3: Get Connection String (1 minute)

1. Click the **"Connect"** button in Supabase Dashboard
2. Select **"Session Pooler"** tab
3. Copy the connection string:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
4. **Replace `[PASSWORD]`** with the password from Step 2

### Step 4: Run Restoration Script (2 minutes)

```bash
# From project root directory
./scripts/restore-database.sh
```

When prompted, paste your connection string from Step 3.

**Expected Output**:
- ✅ PostgreSQL verification
- ✅ Backup file check
- ⚡ Restoration progress
- ✅ Success message

**Note**: You may see "object already exists" errors - these are **NORMAL** and safe to ignore.

### Step 5: Get API Keys (1 minute)

1. In Supabase Dashboard, go to: **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://[PROJECT-REF].supabase.co`
   - **anon/public key**: The long string under "Project API keys"

### Step 6: Configure Environment Variables (2 minutes)

```bash
# Create .env.local file
cp .env.sample .env.local

# Edit with your actual values
nano .env.local  # or use your preferred editor
```

Update these lines in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ACTUAL-ANON-KEY]
```

Keep the existing API configuration:
```bash
API_BASE_URL=https://dev-pmpapis.central.co.th/pmp/v2/grabmart/v1
PARTNER_CLIENT_ID=testpocorderlist
PARTNER_CLIENT_SECRET=xitgmLwmp
```

### Step 7: Verify Everything Works (1 minute)

```bash
# Start development server
npm run dev
```

**Check for SUCCESS**:
- ✅ Server starts without errors
- ✅ **NO** "Supabase credentials missing" warning in console
- ✅ Open http://localhost:3000 in browser
- ✅ Dashboard loads with real data (not mock data)

**Verify in Supabase Dashboard**:
1. Go to **Table Editor**
2. Check that `escalation_history` table exists
3. Run this query in **SQL Editor**:
   ```sql
   SELECT COUNT(*) FROM escalation_history;
   ```

---

## 📋 Quick Reference

### Files Created

- ✅ `scripts/restore-database.sh` - Automated restoration script
- ✅ `scripts/README.md` - Detailed script documentation
- ✅ `specs/supabase-restoration-log.md` - Complete restoration guide
- ✅ `.env.sample` - Updated with Supabase configuration template
- ✅ `supabase/db_cluster-30-07-2025@06-58-24.backup` - Decompressed backup file

### Important Commands

```bash
# Run restoration
./scripts/restore-database.sh

# Test application
npm run dev

# Check PostgreSQL version
/opt/homebrew/opt/postgresql@15/bin/psql --version

# Verify backup file
ls -lh supabase/db_cluster-30-07-2025@06-58-24.backup
```

---

## 🚨 Troubleshooting

### "Wrong password" error
**Solution**: Wait 2-5 more minutes. Password reset needs time to propagate.

### Still seeing "Using mock client" warning
**Solution**:
1. Check `.env.local` exists in project root
2. Verify variable names are exact: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Restart development server: Stop and run `npm run dev` again

### Connection timeout
**Solution**:
1. Check internet connection
2. Verify Supabase project is active (not paused)
3. Try resetting database password again

---

## ⏱️ Estimated Time

- **Supabase Setup**: 5 minutes
- **Password Reset + Wait**: 5-7 minutes
- **Restoration**: 2 minutes
- **Configuration**: 3 minutes
- **Verification**: 1 minute

**Total**: ~15-20 minutes

---

## 🔒 Security Reminders

- ✅ `.env.local` is already in `.gitignore` (won't be committed)
- ❌ **NEVER** commit database passwords or connection strings
- ✅ Store credentials in password manager
- ✅ Original backup file preserved at: `supabase/db_cluster-30-07-2025@06-58-24.backup.gz`

---

## 📚 Additional Resources

- **Detailed Guide**: `specs/supabase-restoration-log.md`
- **Script Documentation**: `scripts/README.md`
- **Supabase Docs**: https://supabase.com/docs/guides/platform/migrating-within-supabase
- **PostgreSQL Docs**: https://www.postgresql.org/docs/current/app-psql.html

---

## ✅ Success Checklist

- [ ] Supabase project created/selected
- [ ] Database password reset and propagated (waited 5 minutes)
- [ ] Connection string obtained
- [ ] Restoration script executed successfully
- [ ] `.env.local` created with credentials
- [ ] Application starts without mock client warning
- [ ] Tables visible in Supabase Dashboard
- [ ] Can query data via SQL Editor

---

**Ready?** Start with Step 1 above! 🚀

For questions or issues, see the troubleshooting section or check the detailed documentation in `specs/supabase-restoration-log.md`.
