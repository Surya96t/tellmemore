# Message Flicker & Ordering Fixes

**Date:** November 8, 2025  
**Issues:**

1. Message disappears and reappears (flicker)
2. Latest message appears on top instead of bottom

**Status:** ✅ Fixed

---

## Issue 1: Message Flicker (Disappear & Reappear)

### Problem

User message appears → disappears → reappears because:

1. Manual cache update adds optimistic message
2. `savePrompt.mutateAsync()` succeeds
3. `onSuccess` calls `invalidateQueries()`
4. React Query **refetches** from backend
5. During refetch, cache is cleared (message disappears)
6. After refetch, real data appears (message reappears)

### Root Cause

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: promptKeys.list(sessionId) });
  // ☝️ This causes refetch and temporary cache clear
};
```

### Solution

**Replace `invalidateQueries` with direct `setQueryData`**

Instead of triggering a refetch, we directly update the cache with the real backend data:

```typescript
onSuccess: (data: Prompt, variables) => {
  // Replace temp message with real backend data
  queryClient.setQueryData(queryKey, (old) => {
    const lastMessage = old[old.length - 1];
    if (lastMessage?.prompt_id.startsWith("temp-")) {
      return [...old.slice(0, -1), data]; // Replace temp with real
    }
    return [...old, data];
  });
};
```

**Benefits:**

- ✅ No refetch = no flicker
- ✅ Instant update with real data
- ✅ Smooth user experience
- ✅ Still updates quota cache (still invalidated)

---

## Issue 2: Message Order (Latest on Top)

### Problem

New messages appeared at the **top** instead of **bottom** because:

- Backend returns prompts in **descending order** (newest first)
- Or cache updates were prepending instead of appending

### Root Cause

Prompts from backend are not guaranteed to be in chronological order.

### Solution

**Sort prompts by timestamp before converting to messages**

```typescript
const sortedPrompts = [...prompts].sort((a, b) => {
  return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
});
// ☝️ Oldest first (ascending order)
```

**Benefits:**

- ✅ Messages always appear in chronological order
- ✅ Newest messages at bottom (standard chat UX)
- ✅ Works regardless of backend sort order
- ✅ Handles out-of-order cache updates

---

## Files Modified

### 1. `lib/hooks/usePrompts.ts`

**Changed:**

```diff
onSuccess: (data: Prompt, variables: CreatePromptRequest) => {
-  // Refetch chat history to get real data
-  queryClient.invalidateQueries({ queryKey: promptKeys.list(variables.session_id) });
+  // Update cache directly with real backend data (no refetch)
+  queryClient.setQueryData(queryKey, (old) => {
+    const lastMessage = old[old.length - 1];
+    if (lastMessage?.prompt_id.startsWith('temp-')) {
+      return [...old.slice(0, -1), data]; // Replace temp with real
+    }
+    return [...old, data];
+  });

  // Still invalidate quota cache
  queryClient.invalidateQueries({ queryKey: ['quota'] });
}
```

### 2. `components/chat/DualChatView.tsx`

**Changed:**

```diff
const { leftMessages, rightMessages } = useMemo(() => {
  if (!prompts || prompts.length === 0) {
    return { leftMessages: [], rightMessages: [] };
  }

+ // Sort prompts by timestamp (oldest first) for chronological order
+ const sortedPrompts = [...prompts].sort((a, b) => {
+   return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
+ });

- prompts.forEach((prompt) => { ... });
+ sortedPrompts.forEach((prompt) => { ... });
}, [prompts, leftModel, rightModel]);
```

---

## How It Works Now

### User Flow (No Flicker)

1. **User sends message** → Manual cache update (optimistic)
2. **Message appears** instantly at bottom
3. **Loading indicators** show
4. **LLM responses arrive** → Manual cache update (real responses)
5. **Responses appear** smoothly
6. **Backend save completes** → Direct cache update (no refetch!)
7. **Temp ID replaced** with real backend ID
8. **No flicker** - message stays visible throughout

### Message Order Flow

1. **Backend returns** prompts (any order)
2. **Frontend sorts** by timestamp (oldest first)
3. **Messages rendered** in chronological order
4. **New messages** always appear at bottom
5. **Auto-scroll** works correctly

---

## Testing Checklist

- [x] Send message → No flicker (message stays visible)
- [x] Send message → Appears at bottom (not top)
- [x] Send multiple messages → All appear in chronological order
- [x] Reload page → Messages still in correct order
- [x] Loading indicators → Show correctly below user message
- [x] Responses → Appear smoothly without flicker

---

## Technical Details

### Why Direct Cache Update?

**Before (with invalidateQueries):**

```
Cache: [msg1, msg2, tempMsg]
  ↓
invalidateQueries()
  ↓
Cache: [] (cleared during refetch)
  ↓
Refetch from backend
  ↓
Cache: [msg1, msg2, realMsg]
```

**Result:** Message disappears during refetch

**After (with setQueryData):**

```
Cache: [msg1, msg2, tempMsg]
  ↓
setQueryData(replace tempMsg with realMsg)
  ↓
Cache: [msg1, msg2, realMsg]
```

**Result:** Message stays visible, just ID changes

### Why Sort Client-Side?

- Backend sort order may change
- Cache updates may arrive out of order
- Optimistic messages may have temp timestamps
- Client-side sort ensures consistency
- Minimal performance impact (messages are small arrays)

---

## Performance Impact

**Before:**

- Extra backend request on every message (refetch)
- Network latency for refetch (100-500ms)
- Visual flicker during refetch

**After:**

- No extra backend requests
- Instant cache update
- Smooth, flicker-free experience
- Sorting overhead: O(n log n) where n = message count (~10-100)

---

**Status:** ✅ Both issues fixed  
**Test:** Send a message - it should appear at the bottom and stay visible throughout!
