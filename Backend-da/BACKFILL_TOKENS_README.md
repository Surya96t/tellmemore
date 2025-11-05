# Token Usage Backfill Script

## Purpose

This script retroactively calculates and updates `tokens_used` for all existing prompts in the database that have missing or zero token counts.

## How It Works

1. **Finds prompts** with `tokens_used = 0` or `NULL`
2. **Estimates tokens** based on text length using the rule: **1 token ≈ 4 characters**
   - Estimates tokens for both the user prompt and all LLM responses
   - Adds 10% buffer for accuracy
   - Minimum 10 tokens for any non-empty text
3. **Updates prompts table** with estimated `tokens_used`
4. **Updates user quotas** by adding the estimated tokens to `used_today`

## Token Estimation Method

The script uses a simple character-based estimation:

```python
estimated_tokens = int(len(text) / 4 * 1.1)  # 1 token per 4 chars + 10% buffer
```

This is a **rough approximation**. Actual tokenization varies by model:

- OpenAI GPT models: Uses tiktoken (varies by model)
- Google Gemini: Uses SentencePiece
- Groq LLaMA: Uses LLaMA tokenizer

The 4-character rule is a reasonable average for English text.

## Usage

### Dry Run (Recommended First)

Preview what would be updated **without making any changes**:

```bash
cd Backend-da
python backfill_tokens_used.py --dry-run
```

**Output:**

```
🔍 DRY RUN MODE - No changes will be made

📊 Found 150 prompts with missing token counts

[1/150] Would update prompt a1b2c3d4-...
  Prompt: 45 chars → ~13 tokens
  Responses: 2 × [523, 612] chars → ~313 tokens
  Total: 326 tokens

[2/150] Would update prompt e5f6g7h8-...
  Prompt: 28 chars → ~10 tokens
  Responses: 2 × [401, 389] chars → ~217 tokens
  Total: 227 tokens

...

📊 User quota updates:

Would add 12,453 tokens to user 1adb64ac-...'s quota
Would add 8,921 tokens to user 2bdc75bd-...'s quota

============================================================
SUMMARY
============================================================
Total prompts processed: 150
Total tokens estimated: 48,920
Users affected: 5
Mode: DRY RUN (no changes made)
============================================================
```

### Live Run (Apply Changes)

After reviewing the dry run, apply the changes:

```bash
python backfill_tokens_used.py
```

**You will be prompted to confirm:**

```
⚠️  LIVE MODE - Changes will be committed to database

Are you sure you want to proceed? (yes/no): yes
```

**Output:**

```
📊 Found 150 prompts with missing token counts

✅ Updated 10/150 prompts...
✅ Updated 20/150 prompts...
...
✅ Updated all 150 prompts

📊 User quota updates:

✅ Added 12,453 tokens to user 1adb64ac-...'s quota
✅ Added 8,921 tokens to user 2bdc75bd-...'s quota

✅ All changes committed to database!

============================================================
SUMMARY
============================================================
Total prompts processed: 150
Total tokens estimated: 48,920
Users affected: 5
Mode: LIVE (changes committed)
============================================================
```

## When to Run This Script

1. **After migration** - Run once after adding the `tokens_used` column
2. **After data import** - If importing old prompts without token counts
3. **Periodic cleanup** - If you notice prompts with missing token counts

## Safety Features

- ✅ **Dry run mode** - Preview changes before applying
- ✅ **Confirmation prompt** - Requires "yes" to proceed with live run
- ✅ **Rollback on error** - Database transaction rolled back if any error occurs
- ✅ **Progress tracking** - Shows progress every 10 prompts
- ✅ **Detailed logging** - See exactly what's being updated

## What Gets Updated

### Prompts Table

```sql
UPDATE prompts
SET tokens_used = <estimated_tokens>
WHERE tokens_used IS NULL OR tokens_used = 0;
```

### Quotas Table

```sql
UPDATE quotas
SET used_today = used_today + <total_user_tokens>
WHERE user_id = <user_id>;
```

## Environment Requirements

**Required environment variable:**

```bash
DATABASE_URL=postgresql://user:pass@host:port/database
```

**Python dependencies:**

```bash
pip install sqlalchemy psycopg2-binary python-dotenv
```

## Example Scenarios

### Scenario 1: No prompts need backfill

```bash
$ python backfill_tokens_used.py --dry-run
✅ No prompts need token backfill!
```

### Scenario 2: 10 prompts need backfill

```bash
$ python backfill_tokens_used.py
⚠️  LIVE MODE - Changes will be committed to database

Are you sure you want to proceed? (yes/no): yes

📊 Found 10 prompts with missing token counts

✅ Updated all 10 prompts

📊 User quota updates:
✅ Added 2,543 tokens to user 1adb64ac-...'s quota

✅ All changes committed to database!

============================================================
SUMMARY
============================================================
Total prompts processed: 10
Total tokens estimated: 2,543
Users affected: 1
Mode: LIVE (changes committed)
============================================================
```

## Troubleshooting

### Error: DATABASE_URL not found

```bash
❌ ERROR: DATABASE_URL not found in environment
```

**Solution:** Add `DATABASE_URL` to your `.env` file

### Error: Database connection failed

**Solution:** Check that your database is running and credentials are correct

### Error: Permission denied

**Solution:** Make sure the script is executable:

```bash
chmod +x backfill_tokens_used.py
```

## Notes

- The script processes prompts in descending timestamp order (newest first)
- Only prompts with `tokens_used = 0` or `NULL` are updated
- Prompts with existing token counts are **not** modified
- The script commits all changes in a single transaction (all or nothing)

## Future Improvements

For more accurate token counting, consider:

1. Using actual tokenizers (tiktoken for OpenAI, SentencePiece for Gemini)
2. Storing model name in prompts table to use model-specific tokenizers
3. Re-running with actual LLM APIs to get exact token counts

---

**Last Updated:** November 3, 2025  
**Status:** Ready to use  
**Version:** 1.0
