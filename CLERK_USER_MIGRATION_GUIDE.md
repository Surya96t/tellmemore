# Clerk User Migration Guide: TellMeMore

**Created:** November 5, 2025  
**Purpose:** Migrate existing PostgreSQL users to Clerk authentication  
**Status:** Implementation Ready

---

## Overview

This guide provides a complete strategy for migrating existing TellMeMore users from the PostgreSQL database to Clerk authentication while preserving all user data, sessions, and chat history.

---

## Current State Analysis

### Existing Database Schema

Based on your Backend-da configuration:

```sql
-- Current users table (pre-Clerk)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR,
    created_at TIMESTAMP,
    tokens_used INTEGER DEFAULT 0,
    -- Other fields...
);
```

### Target Schema (Post-Clerk)

```sql
-- Updated users table (with Clerk)
CREATE TABLE users (
    id UUID PRIMARY KEY,                    -- Keep existing ID
    clerk_user_id VARCHAR UNIQUE NOT NULL,  -- New: Clerk user ID
    email VARCHAR UNIQUE NOT NULL,
    created_at TIMESTAMP,
    tokens_used INTEGER DEFAULT 0,
    migrated_at TIMESTAMP,                  -- Track migration date
    -- Remove: hashed_password (handled by Clerk)
);
```

---

## Migration Strategy

### Option 1: Gradual Migration (Recommended for Production)

**Best for:** Live systems with active users

#### Approach:

1. **Phase 1:** Add Clerk support alongside existing auth
2. **Phase 2:** Create Clerk accounts for existing users (without forcing password reset)
3. **Phase 3:** Gradually migrate users on their next login
4. **Phase 4:** Eventually deprecate old auth system

#### Pros:

- ✅ Zero downtime
- ✅ Users don't need to reset passwords
- ✅ Can rollback if issues occur
- ✅ Transparent to users

#### Cons:

- ⏳ Takes longer to complete
- 🔧 More complex implementation

---

### Option 2: Bulk Migration (Fast, Requires Maintenance Window)

**Best for:** Development/staging or small user bases

#### Approach:

1. Schedule maintenance window
2. Create all Clerk users programmatically
3. Update database with `clerk_user_id` mappings
4. Force all users to verify email on next login

#### Pros:

- ✅ Fast migration
- ✅ Simpler to implement
- ✅ Clean cutover

#### Cons:

- ⚠️ Requires downtime
- ⚠️ Users must verify email
- ⚠️ No easy rollback

---

## Implementation: Option 1 (Gradual Migration)

### Step 1: Database Schema Update

Create migration script:

```python
# Backend-da/migrations/add_clerk_user_id.py
"""
Add clerk_user_id column to users table
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    # Add clerk_user_id column (nullable initially)
    op.add_column('users', sa.Column('clerk_user_id', sa.String(), nullable=True))
    op.add_column('users', sa.Column('migrated_at', sa.DateTime(), nullable=True))

    # Add unique constraint (after migration complete)
    # op.create_unique_constraint('uq_users_clerk_user_id', 'users', ['clerk_user_id'])

    # Add index for faster lookups
    op.create_index('idx_users_clerk_user_id', 'users', ['clerk_user_id'])

def downgrade():
    op.drop_index('idx_users_clerk_user_id', table_name='users')
    op.drop_column('users', 'migrated_at')
    op.drop_column('users', 'clerk_user_id')
```

Run migration:

```bash
cd Backend-da
alembic revision --autogenerate -m "Add clerk_user_id to users"
alembic upgrade head
```

---

### Step 2: Create Clerk Users Programmatically

Create a migration script to bulk-create Clerk users:

```python
# Backend-da/migrate_users_to_clerk.py
"""
Migrate existing users to Clerk authentication
"""
import os
import asyncio
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from clerk_backend_api import Clerk
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Clerk client
clerk = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

async def migrate_user(user):
    """
    Migrate a single user to Clerk

    Args:
        user: User object from database

    Returns:
        tuple: (success: bool, clerk_user_id: str | None, error: str | None)
    """
    try:
        # Check if user already migrated
        if user.clerk_user_id:
            logger.info(f"User {user.email} already migrated (Clerk ID: {user.clerk_user_id})")
            return True, user.clerk_user_id, None

        # Create user in Clerk
        # Note: We use externalId to map to existing user ID
        clerk_user = clerk.users.create(
            email_address=[user.email],
            external_id=str(user.id),  # Map to existing UUID
            skip_password_requirement=True,  # Don't require password initially
            public_metadata={
                "migrated_from_legacy": True,
                "legacy_user_id": str(user.id),
                "migration_date": datetime.utcnow().isoformat()
            },
            private_metadata={
                "tokens_used": user.tokens_used,
                "original_created_at": user.created_at.isoformat() if user.created_at else None
            },
            created_at=user.created_at.isoformat() if user.created_at else None
        )

        logger.info(f"✅ Created Clerk user for {user.email} (Clerk ID: {clerk_user.id})")
        return True, clerk_user.id, None

    except Exception as e:
        error_msg = f"Failed to migrate {user.email}: {str(e)}"
        logger.error(error_msg)
        return False, None, error_msg


async def update_user_clerk_id(session: Session, user_id: str, clerk_user_id: str):
    """Update user record with Clerk ID"""
    try:
        from backendApp.models.user import User

        user = session.query(User).filter(User.id == user_id).first()
        if user:
            user.clerk_user_id = clerk_user_id
            user.migrated_at = datetime.utcnow()
            session.commit()
            logger.info(f"✅ Updated database for user {user.email}")
            return True
        return False
    except Exception as e:
        logger.error(f"Database update failed for user {user_id}: {str(e)}")
        session.rollback()
        return False


async def migrate_all_users(dry_run=True):
    """
    Migrate all users to Clerk

    Args:
        dry_run: If True, only log what would be done (don't actually create users)
    """
    with Session(engine) as session:
        from backendApp.models.user import User

        # Get all users without clerk_user_id
        users = session.query(User).filter(User.clerk_user_id == None).all()

        logger.info(f"Found {len(users)} users to migrate")

        if dry_run:
            logger.info("🔍 DRY RUN MODE - No changes will be made")
            for user in users:
                logger.info(f"Would migrate: {user.email} (ID: {user.id})")
            return

        success_count = 0
        fail_count = 0
        errors = []

        for i, user in enumerate(users, 1):
            logger.info(f"Migrating {i}/{len(users)}: {user.email}")

            success, clerk_user_id, error = await migrate_user(user)

            if success and clerk_user_id:
                # Update database
                if await update_user_clerk_id(session, user.id, clerk_user_id):
                    success_count += 1
                else:
                    fail_count += 1
                    errors.append(f"{user.email}: Database update failed")
            else:
                fail_count += 1
                if error:
                    errors.append(error)

            # Rate limiting: Clerk limits 100 req/10s (dev) or 1000 req/10s (prod)
            # Sleep briefly to avoid hitting rate limits
            if i % 50 == 0:
                logger.info("Sleeping 10 seconds to avoid rate limits...")
                await asyncio.sleep(10)

        logger.info(f"\n{'='*60}")
        logger.info(f"Migration Complete!")
        logger.info(f"✅ Success: {success_count}")
        logger.info(f"❌ Failed: {fail_count}")

        if errors:
            logger.error(f"\nErrors:")
            for error in errors:
                logger.error(f"  - {error}")


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Migrate users to Clerk")
    parser.add_argument("--dry-run", action="store_true", help="Dry run mode (no changes)")
    parser.add_argument("--email", type=str, help="Migrate specific user by email")

    args = parser.parse_args()

    if args.email:
        # Migrate single user
        with Session(engine) as session:
            from backendApp.models.user import User
            user = session.query(User).filter(User.email == args.email).first()
            if user:
                success, clerk_id, error = asyncio.run(migrate_user(user))
                if success:
                    asyncio.run(update_user_clerk_id(session, user.id, clerk_id))
            else:
                logger.error(f"User not found: {args.email}")
    else:
        # Migrate all users
        asyncio.run(migrate_all_users(dry_run=args.dry_run))
```

---

### Step 3: Update Backend-da Authentication Logic

Update `dependencies.py` to handle both legacy and Clerk users:

```python
# Backend-da/backendApp/dependencies.py

async def get_current_user_claims(request: Request):
    """
    Get current user from Clerk JWT or legacy session
    Supports gradual migration
    """
    # Try Clerk authentication first
    try:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

            # Verify Clerk JWT
            claims = verify_clerk_jwt(token)
            clerk_user_id = claims.get("sub")

            # Find user by clerk_user_id
            user = await get_user_by_clerk_id(clerk_user_id)

            if user:
                return {
                    "user_id": str(user.id),
                    "clerk_user_id": clerk_user_id,
                    "email": user.email,
                    "migrated": True
                }
            else:
                # User exists in Clerk but not in our DB
                # This shouldn't happen, but handle gracefully
                raise HTTPException(status_code=401, detail="User not found")
    except Exception as e:
        logger.warning(f"Clerk auth failed: {e}")

    # Fallback to legacy session authentication (deprecated)
    # TODO: Remove after migration complete
    session_token = request.cookies.get("session_token")
    if session_token:
        user = await get_user_by_legacy_session(session_token)
        if user:
            return {
                "user_id": str(user.id),
                "clerk_user_id": None,
                "email": user.email,
                "migrated": False,
                "legacy_auth": True  # Flag for migration prompt
            }

    raise HTTPException(status_code=401, detail="Not authenticated")


async def get_user_by_clerk_id(clerk_user_id: str):
    """Get user from database by Clerk user ID"""
    with Session(engine) as session:
        return session.query(User).filter(User.clerk_user_id == clerk_user_id).first()
```

---

### Step 4: Handle User Login Flow

Update login to migrate users on first Clerk login:

```python
# Backend-da/backendApp/api/v1/auth.py

@router.post("/clerk-login-callback")
async def clerk_login_callback(request: Request):
    """
    Handle user login from Clerk
    If user exists but not migrated, link accounts
    """
    claims = await get_current_user_claims(request)
    clerk_user_id = claims.get("clerk_user_id")
    email = claims.get("email")

    with Session(engine) as session:
        # Check if user exists by email but no clerk_user_id
        user = session.query(User).filter(User.email == email).first()

        if user and not user.clerk_user_id:
            # User exists but not migrated - link accounts
            user.clerk_user_id = clerk_user_id
            user.migrated_at = datetime.utcnow()
            session.commit()

            logger.info(f"✅ Linked existing user {email} to Clerk ID {clerk_user_id}")

        return {"status": "success", "migrated": bool(user and user.migrated_at)}
```

---

### Step 5: Run Migration

#### Test Migration (Dry Run)

```bash
cd Backend-da
python migrate_users_to_clerk.py --dry-run
```

#### Migrate Single User (Test)

```bash
python migrate_users_to_clerk.py --email test@example.com
```

#### Migrate All Users

```bash
# Backup database first!
pg_dump $DATABASE_URL > backup_before_migration.sql

# Run migration
python migrate_users_to_clerk.py
```

---

## Implementation: Option 2 (Bulk Migration with Password Hashes)

If you have access to password hashes and want a faster migration:

```python
# Backend-da/bulk_migrate_with_passwords.py

async def migrate_user_with_password(user):
    """
    Migrate user preserving password hash
    Requires password_hasher to be one of Clerk's supported algorithms
    """
    try:
        # Assuming bcrypt hashes (common)
        clerk_user = clerk.users.create(
            email_address=[user.email],
            external_id=str(user.id),
            password_digest=user.hashed_password,  # Pass existing hash
            password_hasher="bcrypt",              # Specify hash algorithm
            public_metadata={
                "migrated_from_legacy": True,
                "migration_date": datetime.utcnow().isoformat()
            }
        )

        return True, clerk_user.id, None
    except Exception as e:
        return False, None, str(e)
```

**Supported Password Hashers:**

- `bcrypt` (most common)
- `pbkdf2_sha256`
- `argon2i` / `argon2id`
- `scrypt_firebase`
- `md5` (insecure, auto-migrated to bcrypt)
- See Clerk docs for full list

---

## Post-Migration Tasks

### 1. Update Frontend-next

Remove legacy authentication, use only Clerk:

```typescript
// frontend-next/lib/api-client.ts

// Old: Mixed auth
export async function getAuthHeaders() {
  // Check legacy session first
  const legacyToken = getLegacySessionToken();
  if (legacyToken) {
    return { Authorization: `Legacy ${legacyToken}` };
  }

  // Use Clerk
  const clerk = await clerkClient();
  const token = await clerk.session.getToken();
  return { Authorization: `Bearer ${token}` };
}

// New: Clerk only
export async function getAuthHeaders() {
  const clerk = await clerkClient();
  const token = await clerk.session.getToken();
  return { Authorization: `Bearer ${token}` };
}
```

### 2. Add Migration Status Endpoint

```python
# Backend-da/backendApp/api/v1/admin.py

@router.get("/migration-status")
async def get_migration_status(current_user: dict = Depends(require_admin)):
    """Get migration status for all users"""
    with Session(engine) as session:
        total_users = session.query(User).count()
        migrated_users = session.query(User).filter(User.clerk_user_id != None).count()

        return {
            "total_users": total_users,
            "migrated_users": migrated_users,
            "not_migrated": total_users - migrated_users,
            "migration_percentage": (migrated_users / total_users * 100) if total_users > 0 else 0
        }
```

### 3. Cleanup Old Authentication Code

After 100% migration:

1. ✅ Remove `hashed_password` column
2. ✅ Remove legacy session handling
3. ✅ Remove old auth endpoints
4. ✅ Make `clerk_user_id` NOT NULL
5. ✅ Add unique constraint on `clerk_user_id`

```sql
-- Final cleanup (after migration complete)
ALTER TABLE users DROP COLUMN hashed_password;
ALTER TABLE users ALTER COLUMN clerk_user_id SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT uq_users_clerk_user_id UNIQUE (clerk_user_id);
```

---

## Monitoring & Rollback

### Monitor Migration Progress

```bash
# Check migration status
psql $DATABASE_URL -c "
  SELECT
    COUNT(*) as total_users,
    COUNT(clerk_user_id) as migrated_users,
    COUNT(*) - COUNT(clerk_user_id) as pending_users
  FROM users;
"
```

### Rollback Plan

If migration fails:

```sql
-- Rollback database changes
ALTER TABLE users DROP COLUMN clerk_user_id;
ALTER TABLE users DROP COLUMN migrated_at;

-- Re-enable legacy authentication in code
-- Restore from backup if needed
```

---

## Testing Checklist

- [ ] Test migration script in development
- [ ] Verify Clerk users created successfully
- [ ] Test login with migrated user
- [ ] Verify chat history preserved
- [ ] Test quota tracking still works
- [ ] Verify session management
- [ ] Test password reset flow
- [ ] Check all API endpoints work
- [ ] Test mobile responsiveness
- [ ] Monitor error logs

---

## Timeline Estimate

### Option 1 (Gradual Migration)

- **Setup:** 1-2 days
- **Testing:** 2-3 days
- **Rollout:** 1-2 weeks (gradual)
- **Total:** 2-3 weeks

### Option 2 (Bulk Migration)

- **Setup:** 1 day
- **Testing:** 1-2 days
- **Migration:** 1 day (maintenance window)
- **Total:** 3-4 days

---

## Next Steps

1. ✅ **Read this guide thoroughly**
2. **Choose migration strategy** (Option 1 recommended)
3. **Backup database** (critical!)
4. **Test in development** environment first
5. **Run dry-run** migration script
6. **Migrate test users** manually
7. **Roll out to production** gradually
8. **Monitor** for issues
9. **Clean up** old code after 100% migration

---

## Support & References

- **Clerk Migration Docs:** https://clerk.com/docs/guides/development/migrating
- **Clerk Backend API:** https://clerk.com/docs/reference/backend-api
- **Webhooks Guide:** https://clerk.com/docs/guides/development/webhooks/syncing
- **createUser() Reference:** https://clerk.com/docs/reference/backend/user/create-user

---

**Last Updated:** November 5, 2025  
**Status:** Ready for Implementation  
**Recommended Approach:** Option 1 (Gradual Migration)
