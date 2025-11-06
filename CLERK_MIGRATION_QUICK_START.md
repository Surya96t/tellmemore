# Clerk Migration - Quick Start Guide

**Last Updated:** November 5, 2025  
**Status:** ⏸️ Ready to Execute

---

## TL;DR

- **36 out of 44 users** need to be migrated from password auth to Clerk
- Schema is ready ✅ (`clerk_user_id` column exists)
- Code is ready ✅ (Clerk integration complete)
- Migration script is ready ✅ (`migrate_legacy_users_to_clerk.py`)
- **Next step:** Run migration script

---

## Quick Reference

### Files to Review

1. **`CLERK_INTEGRATION_STATUS.md`** - Current state, database stats, detailed analysis
2. **`CLERK_USER_MIGRATION_GUIDE.md`** - Migration strategies, code samples, best practices
3. **`Backend-da/migrate_legacy_users_to_clerk.py`** - Migration script
4. **`Backend-da/MIGRATION_SCRIPT_README.md`** - Usage guide for migration script

### Key Statistics

| Metric | Value |
|--------|-------|
| Total Users | 44 |
| Clerk Users | 8 (18%) |
| Legacy Users | **36 (82%)** ⬅️ Need migration |
| Users with Passwords | 36 |

### Database Schema

```sql
-- Users table (after schema migration)
CREATE TABLE users (
  user_id UUID PRIMARY KEY,              -- Internal ID (for relationships)
  clerk_user_id VARCHAR UNIQUE NULL,     -- Clerk user ID (for auth)
  email VARCHAR UNIQUE NOT NULL,
  password_hash TEXT NULL,               -- Nullable (for Clerk users)
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);
```

**✅ Schema migration complete** (`migrate_add_clerk_user_id.py` already run)

---

## Migration Process

### Step 1: Review Current State

```bash
# Check database statistics
psql $DATABASE_URL -c "
  SELECT 
    COUNT(*) as total,
    COUNT(clerk_user_id) as with_clerk,
    COUNT(*) - COUNT(clerk_user_id) as without_clerk
  FROM users;
"
```

**Expected Output:**
```
 total | with_clerk | without_clerk
-------+------------+---------------
    44 |          8 |            36
```

### Step 2: Dry Run Migration

```bash
cd Backend-da
python migrate_legacy_users_to_clerk.py --dry-run
```

**This previews changes without executing them.**

### Step 3: Test with One User

```bash
python migrate_legacy_users_to_clerk.py --email test@example.com
```

**Verify:**
1. Clerk account created (check Clerk dashboard)
2. Database updated (`clerk_user_id` populated)
3. User receives email invite
4. User can log in via Clerk

### Step 4: Migrate All Users

```bash
python migrate_legacy_users_to_clerk.py
```

**Monitor:**
- Clerk dashboard for new users
- Backend logs for errors
- Email delivery status

### Step 5: Verify Migration

```bash
# Check migration success
psql $DATABASE_URL -c "
  SELECT 
    COUNT(*) as total,
    COUNT(clerk_user_id) as with_clerk,
    COUNT(*) - COUNT(clerk_user_id) as without_clerk
  FROM users;
"
```

**Expected Output (after migration):**
```
 total | with_clerk | without_clerk
-------+------------+---------------
    44 |         44 |             0  ⬅️ All migrated!
```

---

## What Happens to Users?

### Before Migration
- User logs in with email + password
- Backend validates `password_hash` with bcrypt
- User ID: `4e15502b-...` (UUID)
- Clerk ID: `NULL`

### After Migration
- User receives email from Clerk with invite link
- User clicks link, sets password, verifies email
- User logs in via Clerk (frontend shows Clerk login)
- Backend validates Clerk JWT, extracts `clerk_user_id`
- User sees all existing data (sessions, prompts, etc.)

### User Data Preserved
- ✅ All sessions intact (`chat_sessions.user_id` unchanged)
- ✅ All prompts intact (`prompts.user_id` unchanged)
- ✅ All quotas intact (`quotas.user_id` unchanged)
- ✅ All audit logs intact (`audit_logs.user_id` unchanged)

**Why?** Because all relationships use the internal `user_id` (UUID), not `clerk_user_id`.

---

## Dual ID System

### Internal User ID (UUID)
- **Purpose:** Primary key for all database relationships
- **Example:** `4e15502b-d21d-4200-93d0-608b8d31efd2`
- **Used by:** All foreign keys (`chat_sessions.user_id`, etc.)
- **Lifetime:** Permanent (never changes)

### Clerk User ID (String)
- **Purpose:** Authentication and identity verification
- **Example:** `user_34wxRu7bigC1CheiuB21mfURSor`
- **Used by:** JWT validation, user lookup on login
- **Lifetime:** Permanent (set once during migration)

---

## Authentication Flow

### Clerk Auth (After Migration)

1. User logs in via Clerk (frontend)
2. Frontend receives Clerk JWT
3. Frontend sends JWT to Backend-da in `Authorization` header
4. Backend validates JWT with Clerk SDK
5. Backend extracts `clerk_user_id` from JWT claims
6. Backend looks up user by `clerk_user_id`
7. Backend returns internal `user_id`
8. All operations scoped to `user_id`

### Legacy Auth (Fallback, During Transition)

1. User logs in with email + password (legacy endpoint)
2. Backend validates `password_hash` with bcrypt
3. Backend returns legacy JWT with `user_id`
4. All operations scoped to `user_id`

**Note:** Legacy auth can be disabled after all users migrate.

---

## Rollback Procedure

**If migration fails:**

### 1. Remove Clerk IDs

```sql
UPDATE users
SET clerk_user_id = NULL
WHERE password_hash IS NOT NULL;
```

### 2. Delete Clerk Users (Optional)

```python
from clerk_backend_api import Clerk
clerk = Clerk(bearer_auth="sk_test_...")
for user in clerk.users.list():
    clerk.users.delete(user_id=user.id)
```

### 3. Restart Backend

```bash
systemctl restart backend-da
```

---

## Common Issues

### Issue: Email already exists in Clerk

**Cause:** User already has a Clerk account (created externally)

**Solution:**
1. Check Clerk dashboard for user
2. Manually link `clerk_user_id` in database
3. Skip this user in migration script

### Issue: Clerk API key invalid

**Cause:** `CLERK_SECRET_KEY` incorrect or expired

**Solution:**
1. Verify key in Clerk dashboard
2. Update `.env` file
3. Restart migration script

### Issue: Email invite not sent

**Cause:** Clerk email service unavailable

**Solution:**
- User account still created successfully
- User can complete setup via Clerk dashboard
- Resend invite manually if needed

---

## Post-Migration Cleanup (Optional)

**After all users have migrated and verified:**

### Remove Password Hashes

```sql
UPDATE users
SET password_hash = NULL
WHERE clerk_user_id IS NOT NULL;
```

**⚠️ WARNING:** Only do this after:
- All users have completed Clerk setup
- All users have logged in via Clerk successfully
- Fallback auth is no longer needed

### Disable Legacy Auth

**In `Backend-da/backendApp/api/auth.py`:**

```python
# Remove or comment out legacy password endpoints
# @router.post("/login")
# async def login_legacy(...)
```

---

## Next Actions

### Immediate

1. **Run dry run:**
   ```bash
   python migrate_legacy_users_to_clerk.py --dry-run
   ```

2. **Test with one user:**
   ```bash
   python migrate_legacy_users_to_clerk.py --email test@example.com
   ```

3. **Verify test user:**
   - Check database for Clerk ID
   - Have user log in via Clerk
   - Verify data intact

### Short-term

1. **Run full migration:**
   ```bash
   python migrate_legacy_users_to_clerk.py
   ```

2. **Monitor progress:**
   - Clerk dashboard (new users)
   - Backend logs (errors)
   - Email delivery (invites sent)

3. **Assist users:**
   - Help with Clerk setup
   - Troubleshoot login issues
   - Answer migration questions

### Long-term (Post-Migration)

1. **Cleanup:**
   - Remove password hashes (optional)
   - Disable legacy auth endpoints
   - Update documentation

2. **Monitor:**
   - Login success rate
   - Clerk errors
   - User feedback

---

## Documentation

- **Detailed Status:** `CLERK_INTEGRATION_STATUS.md`
- **Migration Strategies:** `CLERK_USER_MIGRATION_GUIDE.md`
- **Script Usage:** `Backend-da/MIGRATION_SCRIPT_README.md`
- **Schema Migration:** `Backend-da/migrate_add_clerk_user_id.py`
- **User Migration:** `Backend-da/migrate_legacy_users_to_clerk.py`

---

## Summary

| Status | Item |
|--------|------|
| ✅ Complete | Database schema (clerk_user_id column) |
| ✅ Complete | Backend code (Clerk integration) |
| ✅ Complete | Migration script (ready to run) |
| ⏸️ Pending | Execute migration (36 users) |
| ⏸️ Pending | User testing and verification |
| ⏸️ Pending | Cleanup (remove password hashes) |

**Next Step:** Run `python migrate_legacy_users_to_clerk.py --dry-run`

---

**Last Updated:** November 5, 2025  
**Status:** Ready for Phase 9 (User Migration)
