# Legacy User Migration to Clerk - README

**Purpose:** Migrate existing password-based users to Clerk authentication  
**Script:** `migrate_legacy_users_to_clerk.py`  
**Status:** ⏸️ Ready to run (pending approval)

---

## Overview

This script migrates legacy users (those with `password_hash` but no `clerk_user_id`) to Clerk authentication. It uses a **gradual migration strategy** to minimize disruption.

---

## Current State

**Database Statistics:**
- **Total Users:** 44
- **Clerk Users:** 8 (18%)
- **Legacy Users:** 36 (82%) ⬅️ Need migration
- **Users with Passwords:** 36

**Migration Target:** 36 legacy users

---

## Migration Strategy

### Gradual Migration (Implemented)

1. **Create Clerk Accounts**
   - For each legacy user, create a Clerk account
   - Use existing email and name from database
   - Skip password requirement (user sets on first login)

2. **Link Clerk ID**
   - Update `users.clerk_user_id` with new Clerk user ID
   - Preserve `password_hash` as fallback (optional cleanup later)

3. **Send Email Invites**
   - Clerk sends email to user to complete setup
   - User clicks link, sets password, verifies email
   - User can now log in via Clerk

4. **Fallback Authentication**
   - During transition, users can still use legacy password auth
   - Once user completes Clerk setup, Clerk auth takes precedence
   - Password hash can be removed after user migrates

---

## Prerequisites

### 1. Install Dependencies

```bash
cd Backend-da
pip install clerk-backend-api python-dotenv sqlalchemy psycopg2-binary
```

### 2. Set Environment Variables

**Required in `.env`:**

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db

# Clerk API
CLERK_SECRET_KEY=sk_test_...
CLERK_ISSUER_URL=https://clerk.your-domain.com

# Optional: Redirect URL for invites
CLERK_INVITE_REDIRECT_URL=https://your-app.com/welcome
```

### 3. Verify Clerk Access

Test that Clerk API credentials work:

```bash
python -c "from clerk_backend_api import Clerk; import os; from dotenv import load_dotenv; load_dotenv(); clerk = Clerk(bearer_auth=os.getenv('CLERK_SECRET_KEY')); print('✅ Clerk API connected')"
```

---

## Usage

### Dry Run (Preview Changes)

**Recommended first step** - preview what will happen without making changes:

```bash
python migrate_legacy_users_to_clerk.py --dry-run
```

**Output:**
```
🔄 Legacy User → Clerk Migration Script
================================================================================
🔍 DRY RUN MODE - No changes will be made

📊 Fetching legacy users...
Found 36 legacy user(s) to migrate

[1/36] 📧 Migrating: steve <vesijip874@ampdial.com>
   Internal ID: 4e15502b-d21d-4200-93d0-608b8d31efd2
   Created: 2025-10-08 19:03:03
   🔍 DRY RUN - No changes made
   
[2/36] 📧 Migrating: Arun KC <kecy890@gmail.com>
   ...
   
📊 Migration Summary
================================================================================
Total users processed:     36
Successfully migrated:     36
Failed migrations:         0
================================================================================
🔍 DRY RUN - No changes were made
Run without --dry-run to execute migration
```

### Migrate All Legacy Users

**Execute full migration:**

```bash
python migrate_legacy_users_to_clerk.py
```

**Output:**
```
🔄 Legacy User → Clerk Migration Script
================================================================================

📊 Fetching legacy users...
Found 36 legacy user(s) to migrate

[1/36] 📧 Migrating: steve <vesijip874@ampdial.com>
   Internal ID: 4e15502b-d21d-4200-93d0-608b8d31efd2
   Created: 2025-10-08 19:03:03
   1️⃣ Creating Clerk account...
   ✅ Clerk user created: user_34xyz...
   2️⃣ Linking Clerk ID to internal user...
   ✅ Clerk ID linked successfully
   3️⃣ Sending email invite...
   ✅ Email invite sent
   ✅ Migration complete for this user
   
[2/36] 📧 Migrating: Arun KC <kecy890@gmail.com>
   ...
   
📊 Migration Summary
================================================================================
Total users processed:     36
Successfully migrated:     36
Failed migrations:         0
================================================================================
```

### Migrate Single User

**Test with one user first:**

```bash
python migrate_legacy_users_to_clerk.py --email vesijip874@ampdial.com
```

---

## What Happens to Users?

### During Migration

1. **Clerk Account Created:**
   - User receives email from Clerk
   - Email contains invite link to complete setup
   - User clicks link, sets password, verifies email

2. **Database Updated:**
   - `users.clerk_user_id` set to new Clerk user ID
   - `users.password_hash` **retained** as fallback
   - All relationships (`chat_sessions`, `prompts`, etc.) **unchanged**

3. **User Experience:**
   - User can still log in with legacy password (fallback)
   - Once Clerk setup complete, Clerk auth takes precedence
   - No data loss, no broken sessions

### After Migration

**User logs in:**
1. Frontend shows Clerk login page
2. User enters email + password (set during invite)
3. Clerk validates credentials
4. Frontend receives Clerk JWT
5. Backend validates JWT, extracts `clerk_user_id`
6. Backend looks up user by `clerk_user_id`
7. User sees their existing data (sessions, prompts, etc.)

**Legacy password still works (during transition):**
- If user hasn't completed Clerk setup, they can use legacy password
- Backend falls back to password validation
- Gradual transition allows time for all users to migrate

---

## Database Changes

### Before Migration

```sql
-- Legacy User
SELECT user_id, email, clerk_user_id, password_hash
FROM users
WHERE email = 'vesijip874@ampdial.com';

-- Result:
-- user_id: 4e15502b-d21d-4200-93d0-608b8d31efd2
-- email: vesijip874@ampdial.com
-- clerk_user_id: NULL  ⬅️ No Clerk ID
-- password_hash: $2b$12$...  ⬅️ Password hash
```

### After Migration

```sql
-- Migrated User
SELECT user_id, email, clerk_user_id, password_hash
FROM users
WHERE email = 'vesijip874@ampdial.com';

-- Result:
-- user_id: 4e15502b-d21d-4200-93d0-608b8d31efd2  ⬅️ Unchanged
-- email: vesijip874@ampdial.com                  ⬅️ Unchanged
-- clerk_user_id: user_34xyz...                   ⬅️ New Clerk ID
-- password_hash: $2b$12$...                      ⬅️ Retained (fallback)
```

**All relationships intact:**
```sql
-- User's sessions still work
SELECT session_id, title
FROM chat_sessions
WHERE user_id = '4e15502b-d21d-4200-93d0-608b8d31efd2';
-- ✅ All sessions intact

-- User's prompts still work
SELECT prompt_id, prompt_text
FROM prompts
WHERE user_id = '4e15502b-d21d-4200-93d0-608b8d31efd2';
-- ✅ All prompts intact
```

---

## Error Handling

### Common Errors

**1. Email Already Exists in Clerk**

```
❌ Failed to create Clerk user: Email already in use
```

**Solution:**
- User already has a Clerk account
- Manually link Clerk ID in database, or
- Skip this user (already migrated externally)

**2. Database Connection Error**

```
❌ ERROR: DATABASE_URL not found in environment variables
```

**Solution:**
- Ensure `.env` file exists in `Backend-da/`
- Verify `DATABASE_URL` is set correctly

**3. Clerk API Error**

```
❌ Failed to create Clerk user: Invalid API key
```

**Solution:**
- Verify `CLERK_SECRET_KEY` is correct
- Check Clerk dashboard for API key status

**4. Email Invite Fails**

```
⚠️  Failed to send invite: Clerk email service unavailable
ℹ️  User can still log in via Clerk dashboard
```

**Solution:**
- User account created successfully
- Invite email not sent (Clerk service issue)
- User can still complete setup via Clerk dashboard

---

## Rollback Procedure

**If migration fails or needs to be reversed:**

### 1. Remove Clerk IDs from Database

```sql
-- Remove all Clerk IDs (reset to legacy state)
UPDATE users
SET clerk_user_id = NULL
WHERE clerk_user_id IS NOT NULL
AND password_hash IS NOT NULL;
```

### 2. Delete Clerk Users (Optional)

```python
from clerk_backend_api import Clerk
import os
from dotenv import load_dotenv

load_dotenv()
clerk = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))

# List all users and delete
users = clerk.users.list()
for user in users:
    clerk.users.delete(user_id=user.id)
```

### 3. Restart Backend-da

```bash
# Restart to clear any cached Clerk data
systemctl restart backend-da
```

---

## Testing

### Pre-Migration Testing

**1. Test with Dry Run:**
```bash
python migrate_legacy_users_to_clerk.py --dry-run
```

**2. Test with One User:**
```bash
python migrate_legacy_users_to_clerk.py --email test@example.com
```

**3. Verify Database:**
```sql
-- Check if Clerk ID was linked
SELECT email, clerk_user_id
FROM users
WHERE email = 'test@example.com';
```

**4. Test Login:**
- Log in via Clerk (frontend)
- Verify user sees their existing data
- Verify sessions/prompts intact

### Post-Migration Testing

**1. Verify Migration Count:**
```sql
-- Should match 36 (number of legacy users)
SELECT COUNT(*) FROM users WHERE clerk_user_id IS NOT NULL;
```

**2. Check for Failed Migrations:**
```sql
-- Should be 0
SELECT COUNT(*) FROM users WHERE clerk_user_id IS NULL AND password_hash IS NOT NULL;
```

**3. Test User Login:**
- Have test user log in via Clerk
- Verify data persists
- Verify legacy password fallback works (during transition)

---

## Monitoring

**After migration, monitor:**

1. **Clerk Dashboard:**
   - Total users (should match database count)
   - Failed login attempts
   - Email delivery status

2. **Backend Logs:**
   - Clerk JWT validation errors
   - User lookup errors
   - Authentication failures

3. **Database:**
   - Users without Clerk ID (should decrease over time)
   - Password hash cleanup (optional post-migration)

---

## Cleanup (Optional, Post-Migration)

**After all users have migrated and verified:**

### Remove Password Hashes

```sql
-- Remove password hashes for Clerk users
UPDATE users
SET password_hash = NULL
WHERE clerk_user_id IS NOT NULL;
```

**⚠️ WARNING:** Only do this after:
- All users have completed Clerk setup
- All users have successfully logged in via Clerk
- Fallback authentication is no longer needed

### Disable Legacy Auth Endpoints

**In `Backend-da/backendApp/api/auth.py`:**

```python
# Comment out or remove legacy password auth endpoints
# @router.post("/login")
# async def login_legacy(...)
```

---

## Next Steps

1. **Run Dry Run:**
   ```bash
   python migrate_legacy_users_to_clerk.py --dry-run
   ```

2. **Test with One User:**
   ```bash
   python migrate_legacy_users_to_clerk.py --email test@example.com
   ```

3. **Verify Test User:**
   - Check database for Clerk ID
   - Have test user log in via Clerk
   - Verify data intact

4. **Run Full Migration:**
   ```bash
   python migrate_legacy_users_to_clerk.py
   ```

5. **Monitor Progress:**
   - Check Clerk dashboard for new users
   - Monitor backend logs for errors
   - Assist users with setup issues

6. **Cleanup (Optional):**
   - Remove password hashes after 100% migration
   - Disable legacy auth endpoints
   - Update documentation

---

## Support

**For issues or questions:**

1. Check `CLERK_INTEGRATION_STATUS.md` for current state
2. Review `CLERK_USER_MIGRATION_GUIDE.md` for strategies
3. Check Backend-da logs: `Backend-da/backend-da.log`
4. Contact development team

---

**Last Updated:** November 5, 2025  
**Status:** Ready for testing and deployment
