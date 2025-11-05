#!/usr/bin/env python3
"""
Migration script to increase daily quota limit from 10,000 to 100,000 tokens.

This script updates all existing user quotas to the new limit.

Usage:
    python migrate_increase_quota_limit.py
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ Error: DATABASE_URL environment variable not set")
    sys.exit(1)

# Create engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def migrate():
    """Update all user quotas to new limit (100,000)"""
    db = SessionLocal()

    try:
        print("🔄 Starting quota limit migration...")
        print(
            f"📊 Database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'localhost'}")

        # Update all existing quotas
        result = db.execute(
            text("UPDATE quotas SET daily_limit = 100000 WHERE daily_limit = 10000")
        )
        db.commit()

        updated_count = result.rowcount
        print(f"✅ Updated {updated_count} user quotas to 100,000 tokens")

        # Verify the update
        verify_result = db.execute(
            text("SELECT COUNT(*) as count FROM quotas WHERE daily_limit = 100000")
        )
        total_with_new_limit = verify_result.scalar()
        print(
            f"✅ Verified: {total_with_new_limit} users now have 100,000 token limit")

        # Show old limit users (should be 0)
        old_limit_result = db.execute(
            text("SELECT COUNT(*) as count FROM quotas WHERE daily_limit = 10000")
        )
        old_limit_count = old_limit_result.scalar()
        if old_limit_count > 0:
            print(
                f"⚠️ Warning: {old_limit_count} users still have old 10,000 limit")
        else:
            print("✅ All users migrated successfully!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error during migration: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("Daily Quota Limit Migration: 10,000 → 100,000 tokens")
    print("=" * 60)

    # Confirm before running
    confirm = input("\nDo you want to proceed? (yes/no): ").strip().lower()
    if confirm not in ["yes", "y"]:
        print("❌ Migration cancelled")
        sys.exit(0)

    migrate()

    print("\n" + "=" * 60)
    print("✅ Migration completed successfully!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Restart Backend-da service")
    print("2. New users will automatically get 100,000 token quota")
    print("3. Existing users now have updated quotas")
