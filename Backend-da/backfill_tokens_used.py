#!/usr/bin/env python3
"""
One-time script to backfill tokens_used for existing prompts.

This script:
1. Fetches all prompts with tokens_used = 0 or NULL
2. Estimates token count based on llm_responses length
3. Updates prompts table with estimated tokens_used
4. Updates user quotas accordingly

Usage:
    python backfill_tokens_used.py [--dry-run]

Options:
    --dry-run    Show what would be updated without making changes
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found in environment")
    sys.exit(1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def estimate_tokens(text: str) -> int:
    """
    Estimate token count from text length.

    Rule of thumb: 1 token ≈ 4 characters for English text
    This is a rough estimate; actual tokenization varies by model.

    Args:
        text: The text to estimate tokens for

    Returns:
        Estimated token count
    """
    if not text:
        return 0

    # Average: 1 token per 4 characters
    # Add 10% buffer for safety
    estimated = int(len(text) / 4 * 1.1)

    # Minimum 10 tokens for any non-empty response
    return max(10, estimated)


def backfill_tokens(dry_run: bool = False):
    """
    Backfill tokens_used for existing prompts.

    Args:
        dry_run: If True, only print what would be updated without making changes
    """
    db = SessionLocal()

    try:
        # Fetch all prompts with missing or zero tokens_used
        query = text("""
            SELECT 
                prompt_id, 
                user_id, 
                session_id, 
                prompt_text, 
                llm_responses, 
                tokens_used
            FROM prompts
            WHERE tokens_used IS NULL OR tokens_used = 0
            ORDER BY timestamp DESC
        """)

        result = db.execute(query)
        prompts = result.fetchall()

        if not prompts:
            print("✅ No prompts need token backfill!")
            return

        print(f"📊 Found {len(prompts)} prompts with missing token counts")
        print()

        # Track totals
        total_prompts = len(prompts)
        total_tokens = 0
        user_token_deltas = {}  # user_id -> total tokens to add

        # Process each prompt
        for idx, prompt in enumerate(prompts, 1):
            prompt_id = prompt.prompt_id
            user_id = prompt.user_id
            prompt_text = prompt.prompt_text or ""
            llm_responses = prompt.llm_responses or []

            # Estimate tokens from prompt + all responses
            prompt_tokens = estimate_tokens(prompt_text)
            response_tokens = sum(estimate_tokens(response)
                                  for response in llm_responses)
            total_prompt_tokens = prompt_tokens + response_tokens

            total_tokens += total_prompt_tokens

            # Track per-user deltas for quota updates
            if user_id not in user_token_deltas:
                user_token_deltas[user_id] = 0
            user_token_deltas[user_id] += total_prompt_tokens

            if dry_run:
                print(f"[{idx}/{total_prompts}] Would update prompt {prompt_id}")
                print(
                    f"  Prompt: {len(prompt_text)} chars → ~{prompt_tokens} tokens")
                print(
                    f"  Responses: {len(llm_responses)} × {[len(r) for r in llm_responses]} chars → ~{response_tokens} tokens")
                print(f"  Total: {total_prompt_tokens} tokens")
                print()
            else:
                # Update prompt with estimated tokens
                update_query = text("""
                    UPDATE prompts
                    SET tokens_used = :tokens_used
                    WHERE prompt_id = :prompt_id
                """)
                db.execute(update_query, {
                    "tokens_used": total_prompt_tokens,
                    "prompt_id": prompt_id
                })

                if idx % 10 == 0:
                    print(f"✅ Updated {idx}/{total_prompts} prompts...")

        if not dry_run:
            print(f"✅ Updated all {total_prompts} prompts")
            print()

        # Update user quotas
        print(f"📊 User quota updates:")
        print()

        for user_id, tokens in user_token_deltas.items():
            if dry_run:
                print(f"Would add {tokens:,} tokens to user {user_id}'s quota")
            else:
                # Update quota
                update_quota_query = text("""
                    UPDATE quotas
                    SET used_today = used_today + :tokens
                    WHERE user_id = :user_id
                """)
                db.execute(update_quota_query, {
                    "tokens": tokens,
                    "user_id": user_id
                })
                print(f"✅ Added {tokens:,} tokens to user {user_id}'s quota")

        if not dry_run:
            db.commit()
            print()
            print("✅ All changes committed to database!")

        print()
        print("=" * 60)
        print("SUMMARY")
        print("=" * 60)
        print(f"Total prompts processed: {total_prompts:,}")
        print(f"Total tokens estimated: {total_tokens:,}")
        print(f"Users affected: {len(user_token_deltas)}")
        print(
            f"Mode: {'DRY RUN (no changes made)' if dry_run else 'LIVE (changes committed)'}")
        print("=" * 60)

    except Exception as e:
        db.rollback()
        print(f"❌ ERROR: {e}")
        raise
    finally:
        db.close()


def main():
    """Main entry point."""
    dry_run = "--dry-run" in sys.argv

    if dry_run:
        print("🔍 DRY RUN MODE - No changes will be made")
        print()
    else:
        print("⚠️  LIVE MODE - Changes will be committed to database")
        print()
        response = input("Are you sure you want to proceed? (yes/no): ")
        if response.lower() != "yes":
            print("Aborted.")
            return
        print()

    backfill_tokens(dry_run=dry_run)


if __name__ == "__main__":
    main()
