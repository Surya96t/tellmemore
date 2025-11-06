"""
One-Time Migration Script: Link Legacy Users to Clerk

This script migrates existing password-based users to Clerk authentication
using the gradual migration strategy.

Strategy:
- Creates Clerk accounts for legacy users
- Links Clerk user ID to existing internal user record
- Preserves password hash as fallback during transition
- Sends email invites for users to verify and complete setup

Usage:
    # Dry run (preview changes, don't execute)
    python migrate_legacy_users_to_clerk.py --dry-run
    
    # Execute migration
    python migrate_legacy_users_to_clerk.py
    
    # Migrate specific user
    python migrate_legacy_users_to_clerk.py --email user@example.com

Requirements:
    pip install clerk-backend-api python-dotenv sqlalchemy psycopg2-binary

Environment Variables:
    DATABASE_URL - Postgres connection string
    CLERK_SECRET_KEY - Clerk secret key
    CLERK_ISSUER_URL - Clerk issuer URL (optional, for validation)
"""

import os
import sys
import argparse
from typing import List, Optional
from datetime import datetime
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Import Clerk SDK (install: pip install clerk-backend-api)
try:
    from clerk_backend_api import Clerk
except ImportError:
    print("❌ ERROR: clerk-backend-api not installed")
    print("Install with: pip install clerk-backend-api")
    sys.exit(1)


# Load environment variables
load_dotenv()

# Configuration
DATABASE_URL = os.getenv("DATABASE_URL")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_ISSUER_URL = os.getenv("CLERK_ISSUER_URL")

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found in environment variables")
    sys.exit(1)

if not CLERK_SECRET_KEY:
    print("❌ ERROR: CLERK_SECRET_KEY not found in environment variables")
    sys.exit(1)


class ClerkMigrator:
    """Handles migration of legacy users to Clerk authentication"""

    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run
        self.engine = create_engine(DATABASE_URL)
        self.clerk = Clerk(bearer_auth=CLERK_SECRET_KEY)
        self.stats = {
            "total": 0,
            "already_migrated": 0,
            "newly_migrated": 0,
            "failed": 0,
        }

    def get_legacy_users(self, email: Optional[str] = None) -> List[dict]:
        """Get users without Clerk ID (legacy password-based users)"""
        with self.engine.connect() as conn:
            if email:
                query = text("""
                    SELECT user_id, name, email, password_hash, created_at
                    FROM users
                    WHERE clerk_user_id IS NULL
                    AND email = :email
                """)
                result = conn.execute(query, {"email": email})
            else:
                query = text("""
                    SELECT user_id, name, email, password_hash, created_at
                    FROM users
                    WHERE clerk_user_id IS NULL
                    ORDER BY created_at ASC
                """)
                result = conn.execute(query)

            users = []
            for row in result:
                users.append({
                    "user_id": str(row[0]),
                    "name": row[1],
                    "email": row[2],
                    "has_password": row[3] is not None,
                    "created_at": row[4],
                })
            return users

    def create_clerk_user(self, user: dict) -> Optional[str]:
        """
        Create a Clerk user account and return the Clerk user ID.

        Args:
            user: User dict with name, email, etc.

        Returns:
            Clerk user ID (e.g., user_34wx...) or None if failed
        """
        try:
            # Split name into first and last name
            name_parts = user["name"].split() if user["name"] else ["User"]
            first_name = name_parts[0]
            last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""
            
            # Create Clerk user with email
            clerk_user = self.clerk.users.create(
                email_address=[user["email"]],
                first_name=first_name,
                last_name=last_name,
                skip_password_checks=True,  # User will set password via invite
                skip_password_requirement=True,  # Allow passwordless login initially
            )

            # Return Clerk user ID
            return clerk_user.id

        except Exception as e:
            print(f"  ❌ Failed to create Clerk user: {e}")
            return None

    def link_clerk_id_to_user(self, user_id: str, clerk_user_id: str) -> bool:
        """
        Link Clerk user ID to internal user record.

        Args:
            user_id: Internal UUID
            clerk_user_id: Clerk user ID

        Returns:
            True if successful, False otherwise
        """
        try:
            with self.engine.connect() as conn:
                query = text("""
                    UPDATE users
                    SET clerk_user_id = :clerk_user_id
                    WHERE user_id = :user_id
                """)
                conn.execute(
                    query, {"clerk_user_id": clerk_user_id, "user_id": user_id}
                )
                conn.commit()
                return True
        except Exception as e:
            print(f"  ❌ Failed to link Clerk ID: {e}")
            return False

    def send_clerk_invite(self, clerk_user_id: str) -> bool:
        """
        Send Clerk email invite to user to complete setup.

        Args:
            clerk_user_id: Clerk user ID

        Returns:
            True if successful, False otherwise
        """
        try:
            # Create invitation
            invitation = self.clerk.invitations.create(
                email_address=clerk_user_id,  # Clerk will look up email
                redirect_url=os.getenv(
                    "CLERK_INVITE_REDIRECT_URL", "https://your-app.com/welcome"
                ),
            )
            return True
        except Exception as e:
            print(f"  ⚠️  Failed to send invite: {e}")
            print(f"  ℹ️  User can still log in via Clerk dashboard")
            return False

    def migrate_user(self, user: dict) -> bool:
        """
        Migrate a single user to Clerk.

        Steps:
        1. Create Clerk user account
        2. Link Clerk ID to internal user record
        3. Send email invite (optional)

        Args:
            user: User dict

        Returns:
            True if successful, False otherwise
        """
        print(f"\n📧 Migrating: {user['name']} <{user['email']}>")
        print(f"   Internal ID: {user['user_id']}")
        print(f"   Created: {user['created_at']}")

        if self.dry_run:
            print("   🔍 DRY RUN - No changes made")
            return True

        # Step 1: Create Clerk user
        print("   1️⃣ Creating Clerk account...")
        clerk_user_id = self.create_clerk_user(user)
        if not clerk_user_id:
            print("   ❌ FAILED: Could not create Clerk account")
            return False

        print(f"   ✅ Clerk user created: {clerk_user_id}")

        # Step 2: Link Clerk ID to internal user
        print("   2️⃣ Linking Clerk ID to internal user...")
        if not self.link_clerk_id_to_user(user["user_id"], clerk_user_id):
            print("   ❌ FAILED: Could not link Clerk ID")
            # TODO: Delete Clerk user to avoid orphaned accounts
            return False

        print("   ✅ Clerk ID linked successfully")

        # Step 3: Send email invite
        print("   3️⃣ Sending email invite...")
        if self.send_clerk_invite(clerk_user_id):
            print("   ✅ Email invite sent")
        else:
            print("   ⚠️  Email invite not sent (user can still log in)")

        print("   ✅ Migration complete for this user")
        return True

    def run(self, email: Optional[str] = None):
        """
        Run the migration process.

        Args:
            email: Optional email to migrate only one user
        """
        print("=" * 80)
        print("🔄 Legacy User → Clerk Migration Script")
        print("=" * 80)

        if self.dry_run:
            print("\n🔍 DRY RUN MODE - No changes will be made\n")

        # Get legacy users
        print("\n📊 Fetching legacy users...")
        users = self.get_legacy_users(email)
        self.stats["total"] = len(users)

        if not users:
            print("✅ No legacy users found! All users are on Clerk.")
            return

        print(f"Found {len(users)} legacy user(s) to migrate\n")

        # Migrate each user
        for i, user in enumerate(users, 1):
            print(f"\n[{i}/{len(users)}]", end=" ")
            if self.migrate_user(user):
                self.stats["newly_migrated"] += 1
            else:
                self.stats["failed"] += 1

        # Print summary
        print("\n" + "=" * 80)
        print("📊 Migration Summary")
        print("=" * 80)
        print(f"Total users processed:     {self.stats['total']}")
        print(f"Successfully migrated:     {self.stats['newly_migrated']}")
        print(f"Failed migrations:         {self.stats['failed']}")
        print("=" * 80)

        if self.dry_run:
            print("\n🔍 DRY RUN - No changes were made")
            print("Run without --dry-run to execute migration")


def main():
    parser = argparse.ArgumentParser(
        description="Migrate legacy users to Clerk authentication"
    )
    parser.add_argument(
        "--dry-run", action="store_true", help="Preview changes without executing"
    )
    parser.add_argument(
        "--email", type=str, help="Migrate only one user by email"
    )

    args = parser.parse_args()

    # Run migration
    migrator = ClerkMigrator(dry_run=args.dry_run)
    migrator.run(email=args.email)


if __name__ == "__main__":
    main()
