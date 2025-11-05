"""
Database migration: Add clerk_user_id column to users table

This migration adds Clerk authentication support to existing users table.

Run this migration BEFORE restarting the Backend-da server.

Usage:
    python migrate_add_clerk_user_id.py
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found in environment variables")
    print("Please set DATABASE_URL in your .env file")
    sys.exit(1)


def migrate():
    """Add clerk_user_id column to users table"""

    try:
        # Create database engine
        engine = create_engine(DATABASE_URL)

        print("🔄 Starting migration...")
        print(
            f"📊 Database: {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'local'}")

        with engine.connect() as conn:
            # Check if column already exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND column_name = 'clerk_user_id'
            """))

            if result.fetchone():
                print("✅ clerk_user_id column already exists. No migration needed.")
                return

            # Add the column
            print("📝 Adding clerk_user_id column...")
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN clerk_user_id VARCHAR UNIQUE
            """))
            conn.commit()

            # Make password_hash nullable (for Clerk users)
            print("📝 Making password_hash nullable...")
            conn.execute(text("""
                ALTER TABLE users 
                ALTER COLUMN password_hash DROP NOT NULL
            """))
            conn.commit()

            print("✅ Migration completed successfully!")
            print("\nChanges made:")
            print("  1. Added clerk_user_id VARCHAR UNIQUE column")
            print("  2. Made password_hash nullable")
            print("\nYou can now restart the Backend-da server.")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    migrate()
