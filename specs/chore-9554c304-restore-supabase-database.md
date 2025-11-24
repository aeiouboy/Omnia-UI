# Chore: Restore Supabase Database from Backup

## Metadata
adw_id: `9554c304`
prompt: `Restore Supabase database from backup following the official guide at https://supabase.com/docs/guides/platform/migrating-within-supabase/dashboard-restore. Use the backup file at supabase/db_cluster-30-07-2025@06-58-24.backup.gz`

## Chore Description
This chore involves restoring a Supabase database from a compressed backup file (28KB gzipped, ~196KB uncompressed) dated July 30, 2025. The restoration process requires decompressing the backup file, setting up proper database credentials, and using PostgreSQL's `psql` command-line tool to restore the database to a Supabase project. This is critical for recovering the production database state including escalation history, order data, and other application tables.

## Relevant Files

### Existing Files
- **supabase/db_cluster-30-07-2025@06-58-24.backup.gz** - The compressed backup file (28KB) containing the database snapshot to be restored
- **src/lib/supabase.ts** - Supabase client configuration that needs proper environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY) to connect to the restored database
- **.env.sample** - Sample environment file that needs to be updated with Supabase credentials after restoration
- **supabase/migrations/*.sql** - Existing migration files that document the current database schema structure

### New Files
- **.env.local** - Local environment file to store the new Supabase project credentials (URL, anon key, database password)
- **supabase/db_cluster-30-07-2025@06-58-24.backup** - Decompressed backup file (will be created during restoration process)
- **specs/supabase-restoration-log.md** - Documentation of the restoration process, connection details, and any issues encountered

## Step by Step Tasks
IMPORTANT: Execute every step in order, top to bottom.

### 1. Verify Prerequisites and Tools
- Check that PostgreSQL and psql are installed on the system (version 15+ recommended)
- Verify psql version: `psql --version`
- Confirm backup file exists and is accessible: `ls -lh supabase/db_cluster-30-07-2025@06-58-24.backup.gz`
- Check current working directory is project root: `/Users/tachongrak/Projects/omnia/Omnia-UI`

### 2. Create New Supabase Project
- Navigate to https://supabase.com/dashboard
- Create a new Supabase project or identify the target project for restoration
- Configure necessary extensions and webhooks before restoration
- Record the project name, region, and database identifier
- Document project URL and initial setup details

### 3. Obtain Database Connection String
- Access the Supabase project dashboard
- Click "Connect" button to view connection options
- Copy the **Session Pooler** connection string (recommended for restoration)
  - Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
- If IPv6/IPv4 add-on is available, direct connection string can also be used
- Save connection string securely (do NOT commit to git)

### 4. Reset Database Password
- Navigate to Database Settings in Supabase dashboard
- Click "Reset Database Password" and generate a new secure password
- Copy and save the new password securely
- **IMPORTANT**: Wait 2-5 minutes for the password reset to propagate through Supabase infrastructure
- Test connection before proceeding to ensure password is active

### 5. Decompress Backup File
- Navigate to the supabase directory: `cd supabase`
- Decompress the backup file: `gunzip -k db_cluster-30-07-2025@06-58-24.backup.gz`
  - The `-k` flag keeps the original .gz file for safety
- Verify decompressed file exists: `ls -lh db_cluster-30-07-2025@06-58-24.backup`
- Confirm file size is approximately 196KB (uncompressed)

### 6. Execute Database Restoration
- Run the psql restoration command from the supabase directory:
  ```bash
  psql -d "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" -f db_cluster-30-07-2025@06-58-24.backup
  ```
- Replace `[PROJECT-REF]`, `[PASSWORD]`, and `[REGION]` with actual values from step 3 and 4
- **Expected behavior**: Some "object already exists" errors are normal and can be safely ignored (these are default Supabase schema objects)
- Monitor output for critical errors (authentication failures, connection errors, constraint violations)
- Restoration should complete in under 2 minutes for a 196KB backup

### 7. Handle Common Issues
- **GSSAPI connection errors**: Upgrade to latest PostgreSQL version and reinstall completely
- **"Wrong password" errors**: Wait additional 2-3 minutes for password reset to propagate, then retry
- **"Object already exists" errors**: These are expected and safe to ignore (Supabase creates default schema objects)
- **Timeout errors**: Check network connectivity and Supabase project status
- **SSL/TLS errors**: Ensure psql is using SSL by adding `?sslmode=require` to connection string

### 8. Configure Environment Variables
- Create `.env.local` file in project root (if it doesn't exist)
- Add Supabase credentials to `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
  SUPABASE_DATABASE_PASSWORD=[YOUR-DB-PASSWORD]
  ```
- Get the anon key from Supabase Dashboard → Settings → API
- Ensure `.env.local` is in `.gitignore` to prevent credential leakage
- Update `.env.sample` with placeholder format (without actual credentials)

### 9. Verify Database Restoration
- Test Supabase connection using the Supabase Dashboard SQL Editor
- Run verification query: `SELECT COUNT(*) FROM escalation_history;`
- Check for expected tables: `\dt` in psql or use Supabase Table Editor
- Verify data integrity by checking a few sample records from key tables
- Confirm timestamps are correct and match the backup date (July 30, 2025)
- Test application connection by running: `npm run dev` and checking console for Supabase connection logs

### 10. Manual Configuration of Non-Transferrable Items
- **Edge Functions**: Redeploy any Edge Functions that were in the original project
- **Auth Settings**: Reconfigure authentication providers and API keys in Supabase Dashboard
- **Realtime Configuration**: Re-enable Realtime for tables that need it (check original project settings)
- **Database Extensions**: Verify and re-enable any extensions used (pg_stat_statements, pgcrypto, etc.)
- **Read Replicas**: Reconfigure if the original project used read replicas

### 11. Update Application Configuration
- Verify `src/lib/supabase.ts` properly reads environment variables
- Test that the mock client is NOT being used (check for "Supabase credentials missing" warning in console)
- Update any hardcoded Supabase URLs or references in the codebase
- Clear any cached credentials or old connection strings from browser/app cache

### 12. Document Restoration Process
- Create restoration log at `specs/supabase-restoration-log.md`
- Document new project details (project ID, region, connection info)
- Record any issues encountered and how they were resolved
- Note the restoration completion time and verification results
- Include rollback procedure in case restoration needs to be reverted

## Validation Commands
Execute these commands to validate the chore is complete:

### 1. Verify Backup File Decompression
```bash
ls -lh supabase/db_cluster-30-07-2025@06-58-24.backup
```
Expected: File exists and is approximately 196KB

### 2. Test PostgreSQL Connection
```bash
psql -d "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres" -c "SELECT version();"
```
Expected: Returns PostgreSQL version information without errors

### 3. Verify Database Tables Exist
```bash
psql -d "[CONNECTION-STRING]" -c "\dt"
```
Expected: Shows list of tables including: escalation_history, orders, products, inventory_items, etc.

### 4. Check Escalation History Data
```bash
psql -d "[CONNECTION-STRING]" -c "SELECT COUNT(*) FROM escalation_history;"
```
Expected: Returns count of escalation records (should be > 0 if data exists in backup)

### 5. Test Application Database Connection
```bash
npm run dev
```
Expected: Development server starts without "Supabase credentials missing" warning in console

### 6. Verify Environment Variables Loaded
```bash
grep -E "NEXT_PUBLIC_SUPABASE_(URL|ANON_KEY)" .env.local
```
Expected: Both variables are set with actual values (not empty)

### 7. Validate Supabase Client Initialization
```bash
npm run dev
# Open browser to http://localhost:3000
# Check browser console - should NOT see "Using mock client" message
```
Expected: Real Supabase client initialized successfully

## Notes

### Security Considerations
- **NEVER commit database passwords or connection strings to git**
- Ensure `.env.local` is listed in `.gitignore`
- Use environment variables for all sensitive credentials
- Consider using Supabase's RLS (Row Level Security) policies after restoration

### Backup Safety
- The decompression step uses `-k` flag to keep the original .gz file
- Do NOT delete the backup file after restoration completes
- Consider creating an additional backup immediately after successful restoration
- Store backup files in secure, off-site location

### Expected "Object Already Exists" Errors
The following errors during restoration are NORMAL and can be ignored:
- `ERROR: role "postgres" already exists`
- `ERROR: schema "public" already exists`
- `ERROR: extension "uuid-ossp" already exists`
- These occur because Supabase pre-creates these objects in new projects

### Restoration Time Estimates
- Decompression: < 5 seconds
- Database password reset propagation: 2-5 minutes
- Actual data restoration: 30-90 seconds
- Total estimated time: 5-10 minutes (excluding project creation)

### Troubleshooting Resources
- Official Supabase Docs: https://supabase.com/docs/guides/platform/migrating-within-supabase/dashboard-restore
- PostgreSQL psql Documentation: https://www.postgresql.org/docs/current/app-psql.html
- Supabase Community Support: https://github.com/supabase/supabase/discussions
