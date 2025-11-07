# Optimistic Chat UI Implementation Plan

**Date:** November 8, 2025  
**Branch:** `llm-streaming-fix`  
**Status:** Planning Phase

---

## Problem Statement

Currently, when a user sends a chat message:

1. User types message and clicks Send
2. Input field clears
3. **Nothing appears in the chat UI** (long wait)
4. Loading indicators appear for both models
5. After backend responses arrive (5-30 seconds), messages finally appear

This creates a poor UX where users have no immediate feedback that their message was received.

---

## Desired Behavior (Optimistic UI)

When a user sends a chat message:

1. User types message and clicks Send
2. Input field clears
3. **User message appears IMMEDIATELY in both chat areas** (optimistic)
4. Loading indicators appear below user message
5. As backend responses arrive, they replace the loading indicators

If the request fails:

- User message stays visible
- Error message appears instead of assistant response
- User can retry

---

## Current Architecture Analysis

### Message Flow

```
ChatInput (user input)
  ↓
DualChatView.handleSend()
  ↓
useSendChat() × 2 (parallel API calls)
  ↓
useSavePrompt() (saves to backend)
  ↓
React Query invalidates promptKeys.list(sessionId)
  ↓
useChatHistory() refetches
  ↓
leftMessages/rightMessages computed in useMemo()
  ↓
ChatArea displays messages
```

### Key Components

1. **DualChatView.tsx** (`components/chat/DualChatView.tsx`)

   - Main container for dual chat
   - `handleSend()` function (line 153-317)
   - `leftMessages`/`rightMessages` computed from prompts (line 103-142)
   - Current state: NO local optimistic messages

2. **ChatInput.tsx** (`components/chat/ChatInput.tsx`)

   - Input field and send button
   - Calls `onSend(message)` prop
   - Clears input after send

3. **ChatArea.tsx** (`components/chat/ChatArea.tsx`)

   - Renders message list
   - Displays loading indicator when `isLoading={true}`
   - Displays error when `error` prop is set

4. **useSavePrompt()** (`lib/hooks/usePrompts.ts`, line 54-100)
   - **Already has optimistic update logic!**
   - `onMutate`: Adds temporary message to cache
   - `onError`: Rolls back on failure
   - `onSuccess`: Refetches real data

---

## Solution Design

### Approach: Leverage Existing Optimistic Logic in `useSavePrompt()`

The good news: **`useSavePrompt()` already implements optimistic updates!** (line 60-77)

However, the issue is:

1. `DualChatView` calls `sendChat.mutateAsync()` **first** (to get LLM responses)
2. Then calls `savePrompt.mutateAsync()` **after** responses arrive
3. So the optimistic update in `useSavePrompt()` only happens AFTER we have responses

### Fix: Two-Step Optimistic Update

We need to split the logic:

**Step 1: Immediately add user message (optimistic)**

- Call `useSavePrompt()` with partial data (user message only, no responses)
- This triggers optimistic update in React Query cache
- User sees their message instantly

**Step 2: Update with LLM responses when ready**

- Call `sendChat()` for both models (parallel)
- When responses arrive, call `useSavePrompt()` again with full data
- React Query merges the responses into existing message

---

## Implementation Steps

### Step 1: Modify `DualChatView.handleSend()` ✅

**File:** `components/chat/DualChatView.tsx`

**Current flow (line 153-317):**

```typescript
const handleSend = async (message: string) => {
  // ...validation checks...

  setIsLoadingLeft(true);
  setIsLoadingRight(true);

  try {
    // Send to both models in parallel
    const [leftResponse, rightResponse] = await Promise.allSettled([...]);

    // Collect responses
    const responses: string[] = [];

    // Save prompt with responses
    await savePrompt.mutateAsync({
      session_id: sessionId,
      prompt_text: message,
      llm_responses: responses,
      tokens_used: totalTokens,
    });
  } finally {
    setIsLoadingLeft(false);
    setIsLoadingRight(false);
  }
};
```

**New flow (optimistic):**

```typescript
const handleSend = async (message: string) => {
  // ...validation checks...

  // STEP 1: IMMEDIATELY add user message (optimistic)
  // This will trigger React Query optimistic update and user sees their message instantly
  const optimisticPrompt = savePrompt.mutateAsync({
    session_id: sessionId,
    prompt_text: message,
    llm_responses: [], // Empty responses initially
    tokens_used: 0, // No tokens yet
  });

  setIsLoadingLeft(true);
  setIsLoadingRight(true);

  try {
    // STEP 2: Send to both models in parallel (background)
    const [leftResponse, rightResponse] = await Promise.allSettled([...]);

    // Collect responses and token counts
    const responses: string[] = [];
    let totalTokens = 0;

    // ...handle responses...

    // STEP 3: Save prompt with REAL responses (updates optimistic entry)
    // React Query will merge this with the optimistic update
    await savePrompt.mutateAsync({
      session_id: sessionId,
      prompt_text: message,
      llm_responses: responses,
      tokens_used: totalTokens,
    });

  } catch (error) {
    // ...error handling...
  } finally {
    setIsLoadingLeft(false);
    setIsLoadingRight(false);
  }
};
```

### Step 2: Update `useSavePrompt()` Optimistic Logic ✅

**File:** `lib/hooks/usePrompts.ts`

**Current optimistic update (line 60-77):**

```typescript
onMutate: async (newPrompt: CreatePromptRequest) => {
  // ...cancel queries...

  // Optimistically add to history
  queryClient.setQueryData<Prompt[]>(queryKey, (old: Prompt[] | undefined) => [
    ...(old || []),
    {
      prompt_id: 'temp-' + Date.now(),
      user_id: 'temp',
      session_id: newPrompt.session_id,
      prompt_text: newPrompt.prompt_text,
      llm_responses: newPrompt.llm_responses,
      timestamp: new Date().toISOString(),
    },
  ]);

  return { previousHistory, sessionId: newPrompt.session_id };
},
```

**Issue:** This always APPENDS a new message. We need to UPDATE existing optimistic message if it already exists.

**Fix:** Check if optimistic message exists, update it instead of appending:

```typescript
onMutate: async (newPrompt: CreatePromptRequest) => {
  // ...cancel queries...

  // Snapshot previous value
  const previousHistory = queryClient.getQueryData<Prompt[]>(queryKey);

  // Check if this is an update to an existing optimistic message
  queryClient.setQueryData<Prompt[]>(queryKey, (old: Prompt[] | undefined) => {
    if (!old) {
      return [{
        prompt_id: 'temp-' + Date.now(),
        user_id: 'temp',
        session_id: newPrompt.session_id,
        prompt_text: newPrompt.prompt_text,
        llm_responses: newPrompt.llm_responses,
        timestamp: new Date().toISOString(),
      }];
    }

    // Find last message with matching prompt_text (optimistic update)
    const lastIndex = old.length - 1;
    const lastMessage = old[lastIndex];

    if (lastMessage && lastMessage.prompt_text === newPrompt.prompt_text) {
      // Update existing optimistic message
      return [
        ...old.slice(0, lastIndex),
        {
          ...lastMessage,
          llm_responses: newPrompt.llm_responses,
        },
      ];
    } else {
      // Add new optimistic message
      return [
        ...old,
        {
          prompt_id: 'temp-' + Date.now(),
          user_id: 'temp',
          session_id: newPrompt.session_id,
          prompt_text: newPrompt.prompt_text,
          llm_responses: newPrompt.llm_responses,
          timestamp: new Date().toISOString(),
        },
      ];
    }
  });

  return { previousHistory, sessionId: newPrompt.session_id };
},
```

### Step 3: Handle Loading States During Streaming ✅

**Current:** `isLoadingLeft`/`isLoadingRight` are set when sending request.

**Enhancement:** Display loading indicator BELOW user message while waiting for responses.

**File:** `components/chat/ChatArea.tsx`

Add a loading message placeholder when `isLoading={true}` and last message is user message:

```tsx
{
  messages.map((msg) => <ChatMessage key={msg.id} message={msg} />);
}

{
  /* Show loading indicator if waiting for assistant response */
}
{
  isLoading && messages[messages.length - 1]?.role === "user" && (
    <div className='flex items-start gap-3'>
      <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground'>
        <Bot className='h-4 w-4' />
      </div>
      <div className='flex-1 space-y-2'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>Assistant ({model})</span>
          <Loader2 className='h-3 w-3 animate-spin' />
        </div>
        <div className='rounded-lg bg-muted p-3'>
          <div className='flex gap-1'>
            <div className='h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse' />
            <div className='h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse delay-75' />
            <div className='h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse delay-150' />
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Benefits

1. **Instant Feedback:** User sees their message immediately
2. **Progressive Enhancement:** Responses appear as they arrive
3. **Error Handling:** If request fails, user message stays visible with error
4. **No Local State:** Leverages React Query optimistic updates (single source of truth)
5. **Consistent with Best Practices:** Uses React Query's built-in optimistic update pattern

---

## Testing Checklist

- [ ] User message appears instantly when Send clicked
- [ ] Loading indicator appears below user message
- [ ] Left model response appears when ready
- [ ] Right model response appears when ready
- [ ] If one model fails, error shows for that side only
- [ ] If both fail, user message stays with errors
- [ ] Optimistic update rolls back on complete failure
- [ ] Token usage updates after responses saved
- [ ] Quota card refreshes correctly
- [ ] No duplicate messages in history

---

## Rollout Plan

1. Create feature branch: `llm-streaming-fix` ✅
2. Implement changes in order:
   - Step 1: Modify `DualChatView.handleSend()`
   - Step 2: Update `useSavePrompt()` optimistic logic
   - Step 3: Add loading placeholders in `ChatArea`
3. Test locally with all three providers (OpenAI, Gemini, Groq)
4. Test error scenarios (network failure, quota exceeded)
5. Create PR with detailed description
6. Deploy to Vercel preview environment
7. Final QA and merge to main

---

## Potential Issues & Solutions

### Issue 1: Duplicate messages if `savePrompt()` called twice

**Solution:** Use unique temp ID for optimistic message, check if message with same `prompt_text` exists before appending.

### Issue 2: Race condition if responses arrive before optimistic save completes

**Solution:** `await` optimistic save before sending to models, ensures message exists in cache first.

### Issue 3: Loading indicator shows indefinitely if response never arrives

**Solution:** Add timeout logic in `DualChatView.handleSend()` (e.g., 60 seconds), show error if timeout.

---

## Timeline

- **Planning:** 30 minutes ✅ (this document)
- **Implementation:** 2 hours
  - Step 1: 45 minutes
  - Step 2: 45 minutes
  - Step 3: 30 minutes
- **Testing:** 1 hour
- **PR & Deployment:** 30 minutes
- **Total:** ~4 hours

---

## Next Steps

1. Review this plan with team (if applicable)
2. Begin implementation starting with Step 1
3. Test each step incrementally
4. Document any deviations from plan

---

**Last Updated:** November 8, 2025  
**Status:** Ready for Implementation
