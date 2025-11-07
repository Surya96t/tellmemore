# Fix: Backend Responses Not Showing in Frontend

**Date:** January 30, 2025  
**Issue:** User messages appear instantly, but assistant responses don't show up even though backend saves them correctly  
**Root Cause:** React Query cache observation disabled by `refetchOnMount: false`

---

## Problem

### Symptoms

1. ✅ User sends message → appears instantly (optimistic update works)
2. ✅ Both models respond (console shows responses)
3. ✅ Responses saved to backend (verified in logs and DB)
4. ❌ Responses **don't appear in UI** after save completes
5. ❌ Only shows up after manual page refresh

### Backend Logs (Correct)

```
✅ Prompt saved successfully {
  promptId: '018fae73-ab39-7e40-942a-db0d1fcfa6a5',
  responsesCount: 2,
  responses: [
    'User message goes here... [full response text]',
    'User message goes here... [full response text]'
  ]
}
```

### Frontend Logs (Incorrect)

```
📝 Chat history data: {
  sessionId: '018fae73-a94d-767a-8cd2-1daa3f7d43bb',
  promptsCount: 1,
  prompts: [
    {
      id: '018fae73-ab39-7e40-942a-db0d1fcfa6a5',
      text: 'User message goes here',
      responsesCount: 0,  // ❌ Should be 2!
      responses: []       // ❌ Should have 2 responses!
    }
  ]
}
```

---

## Root Cause

The `useChatHistory` query was configured with `refetchOnMount: false`:

```typescript
// ❌ BROKEN: Query doesn't observe cache updates
export function useChatHistory(sessionId: string | null) {
  return useQuery({
    queryKey: promptKeys.list(sessionId!),
    queryFn: () => apiClient.prompts.list(sessionId!),
    enabled: !!sessionId,
    staleTime: Infinity,
    refetchOnMount: false, // ❌ This breaks cache observation!
    // ...
  });
}
```

### Why This Breaks

React Query's cache observation works like this:

1. **With `refetchOnMount: false`**:

   - Query doesn't mount with an active network lifecycle
   - Cache observer is not properly established
   - `setQueryData` updates the cache, but component doesn't re-render
   - Component keeps showing old data from closure

2. **With `refetchOnMount: true` (default) + `staleTime: Infinity`**:
   - Query mounts and checks cache
   - Sees data is not stale (due to `staleTime: Infinity`)
   - Doesn't make network request
   - **BUT** establishes proper cache observation
   - `setQueryData` updates trigger component re-render ✅

---

## The Fix

### Code Change

```typescript
// ✅ FIXED: Query observes cache updates correctly
export function useChatHistory(sessionId: string | null) {
  return useQuery({
    queryKey: promptKeys.list(sessionId!),
    queryFn: () => apiClient.prompts.list(sessionId!),
    enabled: !!sessionId, // Only fetch if sessionId provided
    staleTime: Infinity, // Never consider data stale (prevents auto-refetch)
    gcTime: 300_000, // Keep in cache for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    // NOTE: refetchOnMount defaults to true, but staleTime:Infinity prevents actual network request
    // This ensures query stays "active" and observes manual cache updates via setQueryData
    refetchOnReconnect: false, // Don't refetch on network reconnect
    // CRITICAL: Enable placeholderData to show cache immediately on mount
    placeholderData: (previousData) => previousData,
  });
}
```

### Key Points

1. **Removed `refetchOnMount: false`** (use default `true`)
2. **Kept `staleTime: Infinity`** to prevent network requests
3. **Added `placeholderData`** to show cache data immediately
4. **Added comments** explaining why this config works

---

## How It Works Now

### Flow After Fix

1. **User sends message**:

   ```typescript
   // STEP 1: Optimistic user message added to cache
   queryClient.setQueryData(queryKey, (old) => [
     ...old,
     { prompt_id: "temp-123", prompt_text: "Hello", llm_responses: [] },
   ]);
   // ✅ Component re-renders → user message appears instantly
   ```

2. **LLM responses arrive**:

   ```typescript
   // STEP 2: Optimistic responses added to cache
   queryClient.setQueryData(queryKey, (old) => {
     const lastMsg = old[old.length - 1];
     return [
       ...old.slice(0, -1),
       { ...lastMsg, llm_responses: ["Response 1", "Response 2"] },
     ];
   });
   // ✅ Component re-renders → responses appear
   ```

3. **Backend save completes**:
   ```typescript
   // STEP 3: Replace temp ID with real ID (preserve responses)
   queryClient.setQueryData(queryKey, (old) => {
     const tempIndex = old.findIndex((m) => m.prompt_id.startsWith("temp-"));
     return [
       ...old.slice(0, tempIndex),
       { ...backendData }, // Real ID, timestamp, responses
       ...old.slice(tempIndex + 1),
     ];
   });
   // ✅ Component re-renders → final data shown
   ```

### Before vs After

| Step          | Before (Broken)    | After (Fixed)     |
| ------------- | ------------------ | ----------------- |
| User message  | ✅ Shows           | ✅ Shows          |
| LLM responses | ✅ Shows           | ✅ Shows          |
| Backend save  | ❌ No re-render    | ✅ Re-renders     |
| Final state   | ❌ Empty responses | ✅ Full responses |

---

## React Query Best Practices

### ✅ DO: Use `staleTime` to prevent refetches

```typescript
staleTime: Infinity; // Data never goes stale
```

This prevents unnecessary network requests while still allowing cache observation.

### ❌ DON'T: Use `refetchOnMount: false` with manual cache updates

```typescript
refetchOnMount: false; // ❌ Breaks cache observation!
```

This prevents the query from properly observing cache changes.

### ✅ DO: Use `placeholderData` for instant cache display

```typescript
placeholderData: (previousData) => previousData;
```

This shows cached data immediately on mount (before query resolves).

---

## Testing

### Before Fix

1. Send message → user message shows ✅
2. Wait for responses → responses show ✅
3. Wait for save → **responses disappear** ❌
4. Refresh page → responses show again ✅

### After Fix

1. Send message → user message shows ✅
2. Wait for responses → responses show ✅
3. Wait for save → **responses stay visible** ✅
4. No refresh needed ✅

---

## Files Changed

- `/frontend-next/lib/hooks/usePrompts.ts`
  - Removed `refetchOnMount: false` from `useChatHistory`
  - Added `placeholderData` for instant cache display
  - Added detailed comments explaining config

---

## Related Fixes

1. **OPTIMISTIC_CHAT_UI_PLAN.md** - Original optimistic UI plan
2. **DUPLICATE_MESSAGE_FIX.md** - Fixed duplicate messages
3. **MESSAGE_FLICKER_ORDER_FIX.md** - Fixed message order and flicker
4. **PRESERVE_MANUAL_UPDATES_FIX.md** - Preserved streaming responses
5. **FINAL_FLICKER_FIX.md** - Removed all cache invalidations
6. **RESPONSES_NOT_SHOWING_FIX.md** - This fix (cache observation)

---

## Lessons Learned

1. **`staleTime` prevents refetches, not cache observation**

   - Use `staleTime: Infinity` to prevent network requests
   - Don't disable `refetchOnMount` unless you know what you're doing

2. **Cache observation requires active query**

   - Query must "mount" to establish observer
   - `setQueryData` only triggers re-render if query is observing

3. **Placeholders are your friend**

   - Use `placeholderData` to show cache immediately
   - Prevents flash of loading state

4. **Read React Query docs carefully**
   - Many options interact in non-obvious ways
   - Test your assumptions!

---

**Status:** ✅ Fixed  
**Date:** January 30, 2025  
**Next:** Final QA and production deployment
