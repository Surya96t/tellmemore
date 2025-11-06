#!/usr/bin/env python3
"""
Migration script to add tokens_used column to prompts table.

This migration adds the tokens_used column to track token usage per prompt,
which is used to automatically update user quotas.

Usage:
    python migrate_add_tokens_used.py
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


def run_migration():
    """Add tokens_used column to prompts table."""

    print("🔧 Starting migration: Add tokens_used to prompts table")

    # Create database engine
    engine = create_engine(DATABASE_URL)

    try:
        with engine.connect() as conn:
            # Check if column already exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='prompts' AND column_name='tokens_used'
            """))

            if result.fetchone():
                print(
                    "✅ Column 'tokens_used' already exists in prompts table. Skipping migration.")
                return

            # Add the column
            print("📝 Adding tokens_used column to prompts table...")
            conn.execute(text("""
                ALTER TABLE prompts 
                ADD COLUMN tokens_used INTEGER DEFAULT 0 NOT NULL
            """))
            conn.commit()

            print("✅ Migration completed successfully!")
            print("   - Added tokens_used column (INTEGER, default 0, NOT NULL)")
            print("   - All existing prompts now have tokens_used = 0")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise
    finally:
        engine.dispose()


if __name__ == "__main__":
    run_migration()
