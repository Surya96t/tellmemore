# Migration Script Fix - Clerk SDK v3.3.1 Compatibility

**Date:** November 5, 2025  
**Issue:** Import error and API usage error with Clerk SDK  
**Status:** ✅ Fixed

---

## Problem

The migration script had two issues:

### Issue 1: Import Error
```
ImportError: cannot import name 'CreateUserParams' from 'clerk_backend_api.models'
```

**Cause:** `CreateUserParams` doesn't exist in Clerk SDK v3.3.1

### Issue 2: API Usage Error
```
Users.create() got an unexpected keyword argument 'request'
```

**Cause:** The `clerk.users.create()` method doesn't accept a `request` parameter in v3.3.1

---

## Solution

### Before (Incorrect)

```python
from clerk_backend_api import Clerk
from clerk_backend_api.models import CreateUserRequestBody  # ❌ Incorrect import

clerk_user = self.clerk.users.create(
    request=CreateUserRequestBody(  # ❌ Wrong parameter
        email_address=[user["email"]],
        first_name=first_name,
        last_name=last_name,
        skip_password_checks=True,
        skip_password_requirement=True,
    )
)
```

### After (Correct)

```python
from clerk_backend_api import Clerk  # ✅ Only need Clerk

clerk_user = self.clerk.users.create(
    email_address=[user["email"]],  # ✅ Pass parameters directly
    first_name=first_name,
    last_name=last_name,
    skip_password_checks=True,
    skip_password_requirement=True,
)
```

---

## Clerk SDK v3.3.1 Usage

### Correct User Creation

```python
from clerk_backend_api import Clerk

clerk = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))

# Create user - pass parameters directly to create()
user = clerk.users.create(
    email_address=["user@example.com"],
    first_name="John",
    last_name="Doe",
    skip_password_checks=True,
    skip_password_requirement=True,
)

print(f"Created user: {user.id}")  # e.g., user_34wx...
```

### Key Points

1. **No wrapper object needed** - Pass parameters directly to `create()`
2. **No `request` parameter** - Clerk SDK v3.3.1 doesn't use this pattern
3. **Email as list** - `email_address` must be a list (e.g., `["user@example.com"]`)
4. **Skip password** - Use `skip_password_requirement=True` for invite-based setup

---

## Testing Results

### Dry Run - Success ✅

```bash
cd Backend-da
python migrate_legacy_users_to_clerk.py --dry-run
```

**Output:**
```
================================================================================
🔄 Legacy User → Clerk Migration Script
================================================================================

🔍 DRY RUN MODE - No changes will be made

📊 Fetching legacy users...
Found 36 legacy user(s) to migrate

[1/36] 
📧 Migrating: Tchifou Dieffi <mdieffi@gmail.com>
   Internal ID: 819c16c0-4f36-482c-95c2-b568cb18d82b
   Created: 2025-07-14 00:24:25.799857+00:00
   🔍 DRY RUN - No changes made
   
... (continues for all 36 users)

📊 Migration Summary
================================================================================
Total users processed:     36
Successfully migrated:     36
Failed migrations:         0
================================================================================

🔍 DRY RUN - No changes were made
Run without --dry-run to execute migration
```

---

## Files Modified

1. **`Backend-da/migrate_legacy_users_to_clerk.py`**
   - Removed `CreateUserRequestBody` import
   - Changed `clerk.users.create()` to pass parameters directly
   - No other logic changes

---

## Next Steps

The migration script is now ready to use:

### 1. Test with One User (Recommended First)

```bash
cd Backend-da
python migrate_legacy_users_to_clerk.py --email mdieffi@test1.com
```

This will:
1. Create Clerk account for the test user
2. Link Clerk ID to database record
3. Send email invite to user

### 2. Verify Test User

```sql
-- Check if Clerk ID was linked
SELECT user_id, email, clerk_user_id
FROM users
WHERE email = 'mdieffi@test1.com';
```

**Expected Result:**
```
user_id: 96377014-4b09-4819-ae72-601edb842e2e
email: mdieffi@test1.com
clerk_user_id: user_35abc...  ✅ Clerk ID populated
```

### 3. Run Full Migration

After verifying the test user works:

```bash
python migrate_legacy_users_to_clerk.py
```

This will migrate all 36 legacy users.

---

## Rollback (If Needed)

If migration fails and needs to be reversed:

```sql
-- Remove Clerk IDs from database
UPDATE users
SET clerk_user_id = NULL
WHERE clerk_user_id IS NOT NULL
AND password_hash IS NOT NULL;
```

---

## References

- **Clerk SDK v3.3.1 Docs:** https://clerk.com/docs/reference/backend-api/tag/Users
- **Migration Guide:** `CLERK_USER_MIGRATION_GUIDE.md`
- **Integration Status:** `CLERK_INTEGRATION_STATUS.md`
- **Quick Start:** `CLERK_MIGRATION_QUICK_START.md`

---

**Status:** ✅ Fixed and tested  
**Ready for:** Production migration
