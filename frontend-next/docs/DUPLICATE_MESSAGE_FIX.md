# Duplicate Message Fix

**Date:** November 8, 2025  
**Issue:** Duplicate user messages appearing in chat  
**Status:** ✅ Fixed

---

## Problem

When sending a message, users saw **duplicate** "hello" messages in the chat:

- First "hello" appeared immediately (optimistic)
- Second "hello" appeared after backend response
- Only ONE message was actually saved to backend

---

## Root Cause

The issue was in our optimistic update strategy in `DualChatView.tsx`:

```typescript
// WRONG: Called savePrompt.mutate() TWICE
// Step 1: Optimistic save (empty responses)
savePrompt.mutate({
  prompt_text: message,
  llm_responses: [],
});

// Step 2: Real save (with responses)
await savePrompt.mutateAsync({
  prompt_text: message,
  llm_responses: [leftResponse, rightResponse],
});
```

**What happened:**

1. First `mutate()` call added optimistic message to cache
2. Second `mutateAsync()` call triggered backend save
3. Both calls triggered `onSuccess` → `invalidateQueries()`
4. React Query refetched from backend (only ONE message exists)
5. But the optimistic message from step 1 was still in cache
6. Result: **Two messages shown** (one optimistic, one real)

---

## Solution

**Call `savePrompt` only ONCE**, but use React Query's built-in optimistic update in `onMutate`:

```typescript
// CORRECT: Call savePrompt.mutateAsync() ONCE
await savePrompt.mutateAsync({
  session_id: sessionId,
  prompt_text: message,
  llm_responses: responses, // Real responses
  tokens_used: totalTokens,
});
```

The `onMutate` hook in `useSavePrompt()` handles the optimistic update:

```typescript
onMutate: async (newPrompt) => {
  // Add message to cache immediately (optimistic)
  queryClient.setQueryData(queryKey, (old) => [
    ...(old || []),
    {
      prompt_id: "temp-" + Date.now(),
      prompt_text: newPrompt.prompt_text,
      llm_responses: newPrompt.llm_responses, // Initially empty, later filled
      // ...
    },
  ]);
};
```

---

## Changes Made

### 1. `components/chat/DualChatView.tsx`

**Before:**

```typescript
// Step 1: Optimistic save
savePrompt.mutate({
  /* empty responses */
});

// Step 2: Real save
await savePrompt.mutateAsync({
  /* real responses */
});
```

**After:**

```typescript
// Single save with real responses
// Optimistic update handled by React Query's onMutate
await savePrompt.mutateAsync({
  session_id: sessionId,
  prompt_text: message,
  llm_responses: responses,
  tokens_used: totalTokens,
});
```

### 2. `lib/hooks/usePrompts.ts`

**Before:**

```typescript
onMutate: async (newPrompt) => {
  // Complex logic to check if updating existing message
  if (lastMessage?.prompt_text === newPrompt.prompt_text) {
    // Update existing
  } else {
    // Add new
  }
};
```

**After:**

```typescript
onMutate: async (newPrompt) => {
  // Simple: Always add new message
  // React Query handles de-duplication when backend responds
  return [...(old || []), newMessage];
};
```

---

## How It Works Now

1. **User sends message:**

   - Input clears immediately
   - `savePrompt.mutateAsync()` called

2. **`onMutate` fires (before API call):**

   - Message added to React Query cache
   - User sees their message **instantly**
   - Loading indicators appear

3. **API call to backend:**

   - LLM responses generated (5-30 seconds)
   - Backend saves ONE message with responses

4. **`onSuccess` fires (after API call):**
   - `invalidateQueries()` triggers refetch
   - React Query fetches from backend (ONE message)
   - Cache updates with real data
   - Loading indicators disappear
   - Assistant responses appear

**Result:** User sees ONE message (optimistically added, then replaced with real data)

---

## Testing

- [x] Send single message → ONE user message appears
- [x] Send message → Loading indicators show
- [x] Send message → Responses appear correctly
- [x] Send rapid messages → No duplicates
- [x] Check backend logs → Only ONE message saved per send

---

## Key Takeaway

**Don't call mutation twice!** React Query's optimistic updates work best when you:

1. Call mutation **once** with final data
2. Use `onMutate` to add optimistic entry
3. Use `onSuccess` to replace with real data
4. Use `onError` to rollback on failure

---

**Status:** ✅ Fixed  
**Verified:** Local testing passed  
**Ready for:** Production deployment
