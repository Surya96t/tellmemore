# Flicker Fix - Preserve Manual Cache Updates

**Date:** November 8, 2025  
**Issue:** Message still disappears/reappears even after fixing invalidateQueries  
**Status:** ✅ Fixed

---

## Problem

Even after replacing `invalidateQueries` with `setQueryData`, the message was still flickering because:

1. **Step 3 (DualChatView):** Manual cache update adds responses to temp message

   ```
   Cache: [tempMsg with llm_responses: [left, right]]
   ```

2. **Step 4 (onSuccess):** Replaces temp message with backend data

   ```
   Cache: [backendMsg with llm_responses: [left, right]]
   ```

3. **Result:** React detects cache change and re-renders, causing brief flicker

---

## Root Cause

The `onSuccess` handler was **blindly replacing** the temp message with backend data, even though the temp message already had the responses filled in from our manual update.

This caused unnecessary re-renders and flickering.

---

## Solution

**Preserve manually updated responses** when replacing temp ID with real ID:

```typescript
onSuccess: (data: Prompt, variables) => {
  queryClient.setQueryData(queryKey, (old) => {
    const tempMessage = old.find(
      (msg) => msg.prompt_text === variables.prompt_text
    );

    // If temp message already has responses, keep them!
    const finalMessage: Prompt = {
      ...data, // Use real ID and timestamp from backend
      llm_responses:
        tempMessage.llm_responses?.length > 0
          ? tempMessage.llm_responses // Keep manual update
          : data.llm_responses, // Fall back to backend
    };

    return [...old.slice(0, index), finalMessage, ...old.slice(index + 1)];
  });
};
```

---

## Key Insight

**Only update what's necessary:**

- ✅ Update `prompt_id` (temp → real)
- ✅ Update `timestamp` (temp → real)
- ✅ Update `user_id` (temp → real)
- ❌ **Don't** update `llm_responses` if already filled

This prevents unnecessary re-renders and flickering.

---

## Flow Now

```
1. User sends message
   Cache: []

2. Manual optimistic update
   Cache: [{ prompt_id: 'temp-123', llm_responses: [] }]
   UI: User message visible ✅

3. LLM responses arrive, manual update
   Cache: [{ prompt_id: 'temp-123', llm_responses: ['left', 'right'] }]
   UI: User message + responses visible ✅

4. Backend save completes, onSuccess runs
   Cache: [{ prompt_id: 'real-456', llm_responses: ['left', 'right'] }]
                    ☝️ Only ID changed, responses preserved
   UI: Same content, no flicker ✅
```

---

## Testing

Send a message and observe:

- [x] Message appears instantly
- [x] Loading indicators show
- [x] Responses appear smoothly
- [x] **No flicker** when backend save completes
- [x] Message stays visible throughout entire flow

---

**Status:** ✅ Fixed - No more flickering!
