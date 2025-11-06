# Optimistic UI Fix - Manual Cache Updates

**Date:** November 8, 2025  
**Issue:** Optimistic updates not showing  
**Status:** ✅ Fixed

---

## Problem

After removing the duplicate `savePrompt` call, the optimistic update stopped working because:

- We only call `savePrompt.mutateAsync()` AFTER getting LLM responses (5-30 seconds)
- The `onMutate` hook only fires when mutation is called
- Result: User sees nothing for 5-30 seconds, then everything appears at once

---

## Solution

**Manually update React Query cache** in `DualChatView.tsx` BEFORE calling the LLM APIs:

### Flow

1. **Immediate (0ms):** Manually add user message to cache

   ```typescript
   queryClient.setQueryData(queryKey, (old) => [...old, optimisticMessage]);
   ```

2. **Background (5-30s):** Send to LLM APIs and wait for responses

3. **Update (after responses):** Update cache with real responses

   ```typescript
   queryClient.setQueryData(queryKey, (old) => {
     // Replace optimistic message with real data
   });
   ```

4. **Save (after update):** Call `savePrompt.mutateAsync()` to persist to backend

5. **Refetch (after save):** React Query refetches to ensure consistency

---

## Changes

### 1. `DualChatView.tsx`

**Added:**

- Import `useQueryClient` and `promptKeys`
- Manual optimistic update BEFORE sending to LLMs
- Manual update with real responses AFTER LLMs respond
- Rollback on error (remove optimistic message)

**Code:**

```typescript
// STEP 1: Add user message immediately
const optimisticMessage: Prompt = {
  prompt_id: 'temp-' + Date.now(),
  prompt_text: message,
  llm_responses: [], // Empty initially
  // ...
};
queryClient.setQueryData(queryKey, old => [...old, optimisticMessage]);

// STEP 2: Send to LLMs (background)
const responses = await Promise.allSettled([...]);

// STEP 3: Update with real responses
queryClient.setQueryData(queryKey, old => {
  const lastMessage = old[old.length - 1];
  if (lastMessage?.prompt_text === message) {
    return [...old.slice(0, -1), { ...lastMessage, llm_responses: responses }];
  }
  return old;
});

// STEP 4: Save to backend
await savePrompt.mutateAsync({ ... });
```

### 2. `usePrompts.ts`

**Changed:**

- **Disabled `onMutate` hook** (no automatic optimistic updates)
- Optimistic updates now handled manually in `DualChatView`
- `onSuccess` still invalidates cache and triggers refetch
- `onError` just logs error (rollback handled manually)

**Reason:**

- Avoid duplicate messages (one from onMutate, one from manual update)
- Single source of truth for optimistic updates
- Full control over cache updates

---

## Benefits

✅ **User message appears instantly** (manual cache update)  
✅ **Loading indicators show** while waiting for responses  
✅ **Responses appear** when ready (manual cache update)  
✅ **No duplicates** (single cache update per message)  
✅ **Error rollback** (remove optimistic message on failure)  
✅ **Backend sync** (savePrompt ensures data persisted)

---

## Testing

- [ ] Send message → User message appears instantly
- [ ] Wait → Loading dots appear below user message
- [ ] Wait → Responses appear when ready
- [ ] Check → Only ONE user message visible
- [ ] Simulate error → User message removed on failure
- [ ] Check backend → Message saved correctly

---

## Why Manual Updates?

**Alternative:** Use React Query's `onMutate` hook

**Problem with `onMutate`:**

- Only fires when mutation is called
- We call mutation AFTER getting responses (too late)
- Can't split optimistic update from backend save

**Why manual updates work:**

- Full control over timing
- Update cache BEFORE calling LLM APIs
- Update cache AGAIN with real responses
- Call mutation only for backend persistence

---

## Code Flow

```
User clicks Send
  ↓
handleSend(message)
  ↓
[MANUAL] queryClient.setQueryData(...optimisticMessage)
  ↓
Chat re-renders with user message visible ✅
  ↓
[BACKGROUND] Promise.allSettled([sendChat left, sendChat right])
  ↓
5-30 seconds pass... (loading indicators visible)
  ↓
Responses arrive
  ↓
[MANUAL] queryClient.setQueryData(...update responses)
  ↓
Chat re-renders with responses visible ✅
  ↓
[BACKEND] savePrompt.mutateAsync(...)
  ↓
onSuccess → invalidateQueries → refetch
  ↓
Chat re-renders with real backend data ✅
```

---

**Status:** ✅ Fixed and ready for testing  
**Try it:** Send a message - you should see it appear instantly!
