"use client";

import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChatArea, ChatAreaSkeleton } from "./ChatArea";
import { ChatInput } from "./ChatInput";
import { useChatStore } from "@/lib/stores/chatStore";
import { usePromptsStore } from "@/lib/stores/promptsStore";
import { useChatHistory, useSavePrompt, promptKeys } from "@/lib/hooks/usePrompts";
import { useSendChat } from "@/lib/hooks/useChat";
import { useUpdateSession, useSession } from "@/lib/hooks/useSessions";
import { useSystemPrompts, useQuota } from "@/lib/hooks";
import { toast } from "sonner";
import type { Prompt } from "@/lib/api/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  model?: string; // For assistant messages, which model generated it
}

interface DualChatViewProps {
  sessionId: string | null;
}

/**
 * Truncate text to a maximum length and add ellipsis
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

export function DualChatView({ sessionId }: DualChatViewProps) {
  const { leftModel, rightModel, setLeftModel, setRightModel } = useChatStore();
  const { getSelectedSystemPromptTexts } = usePromptsStore();
  const [isLoadingLeft, setIsLoadingLeft] = useState(false);
  const [isLoadingRight, setIsLoadingRight] = useState(false);
  const [errorLeft, setErrorLeft] = useState<string | undefined>();
  const [errorRight, setErrorRight] = useState<string | undefined>();
  const [hasShownWarning, setHasShownWarning] = useState(false);

  // React Query hooks
  const queryClient = useQueryClient();
  const sendChat = useSendChat();
  const savePrompt = useSavePrompt();
  const updateSession = useUpdateSession();

  // Fetch current session info for breadcrumb
  const { data: currentSession } = useSession(sessionId);

  // Fetch system prompts for context
  const { data: systemPrompts } = useSystemPrompts();

  // Fetch user quota for enforcement
  const { data: quota } = useQuota();

  // Calculate quota percentage
  const quotaPercentage = quota
    ? Math.round((quota.used_today / quota.daily_limit) * 100)
    : 0;

  const isQuotaExceeded = quotaPercentage >= 100;
  const isQuotaNearLimit = quotaPercentage >= 80 && quotaPercentage < 100;

  // Show warning toast when quota reaches 80% (only once per session)
  useEffect(() => {
    if (isQuotaNearLimit && !hasShownWarning && quota) {
      toast.warning("Quota Warning", {
        description: `You've used ${quota.used_today.toLocaleString()} of ${quota.daily_limit.toLocaleString()} tokens (${quotaPercentage}%). Your quota resets daily.`,
        duration: 10000,
      });
      setHasShownWarning(true);
    }
  }, [isQuotaNearLimit, hasShownWarning, quota, quotaPercentage]);

  // Fetch chat history for current session (React Query manages caching)
  const { data: prompts, isLoading: isLoadingHistory } = useChatHistory(
    sessionId || ""
  );

  // Debug: Log prompts data
  console.log('📝 Chat history data:', {
    sessionId,
    promptsCount: prompts?.length || 0,
    prompts: prompts?.map(p => ({
      id: p.prompt_id,
      text: p.prompt_text.slice(0, 30),
      responsesCount: p.llm_responses?.length || 0,
      responses: p.llm_responses,
    })),
  });

  // Convert prompts to messages (compute once per prompts change)
  // This is the source of truth for chat history - no local state needed!
  const { leftMessages, rightMessages } = useMemo(() => {
    if (!prompts || prompts.length === 0) {
      return { leftMessages: [], rightMessages: [] };
    }

    // Sort prompts by timestamp (oldest first) to ensure chronological order
    const sortedPrompts = [...prompts].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    // Build message arrays from prompts
    const leftMsgs: Message[] = [];
    const rightMsgs: Message[] = [];

    sortedPrompts.forEach((prompt: Prompt) => {
      // Add user message to both chats
      const userMsg: Message = {
        id: `user-${prompt.prompt_id}`,
        role: "user",
        content: prompt.prompt_text,
        timestamp: new Date(prompt.timestamp),
      };
      leftMsgs.push(userMsg);
      rightMsgs.push(userMsg);

      // Add assistant responses if available
      if (prompt.llm_responses && prompt.llm_responses.length > 0) {
        // First response goes to left chat
        if (prompt.llm_responses[0]) {
          leftMsgs.push({
            id: `assistant-left-${prompt.prompt_id}`,
            role: "assistant",
            content: prompt.llm_responses[0],
            timestamp: new Date(prompt.timestamp),
            model: leftModel, // TODO: Store actual model used
          });
        }
        // Second response goes to right chat (if dual chat)
        if (prompt.llm_responses[1]) {
          rightMsgs.push({
            id: `assistant-right-${prompt.prompt_id}`,
            role: "assistant",
            content: prompt.llm_responses[1],
            timestamp: new Date(prompt.timestamp),
            model: rightModel, // TODO: Store actual model used
          });
        }
      }
    });

    return { leftMessages: leftMsgs, rightMessages: rightMsgs };
  }, [prompts, leftModel, rightModel]);

  // Debug: Log converted messages
  console.log('💬 Converted messages:', {
    leftCount: leftMessages.length,
    rightCount: rightMessages.length,
    leftMessages,
    rightMessages,
  });

  // Single handler that sends to BOTH models simultaneously
  const handleSend = async (message: string) => {
    if (!sessionId) {
      console.error("Cannot send message without session ID");
      return;
    }

    // Check quota before sending
    if (isQuotaExceeded) {
      toast.error("Quota Exceeded", {
        description: "You've reached your daily quota limit. Your quota will reset in 24 hours.",
        duration: 10000,
      });
      return;
    }

    // STEP 1: IMMEDIATELY add user message to cache (optimistic update)
    // This makes the message appear instantly before LLM responses arrive
    const queryKey = promptKeys.list(sessionId);
    const optimisticMessage: Prompt = {
      prompt_id: 'temp-' + Date.now(),
      user_id: 'temp',
      session_id: sessionId,
      prompt_text: message,
      llm_responses: [], // Empty initially - will be filled when responses arrive
      timestamp: new Date().toISOString(),
    };

    console.log('💬 Adding optimistic user message to cache');
    queryClient.setQueryData<Prompt[]>(queryKey, (old: Prompt[] | undefined) => {
      return [...(old || []), optimisticMessage];
    });

    setIsLoadingLeft(true);
    setIsLoadingRight(true);
    setErrorLeft(undefined);
    setErrorRight(undefined);

    try {
      // Auto-update session title if this is the first message
      const isFirstMessage = !prompts || prompts.length === 0;
      if (isFirstMessage && currentSession) {
        const title = truncate(message, 50); // First 50 chars
        updateSession.mutate({
          sessionId,
          data: { title },
        });
      }

      // Get selected system prompts
      const selectedSystemPrompts = getSelectedSystemPromptTexts(systemPrompts || []);
      console.log('📝 Selected system prompts:', selectedSystemPrompts);

      // STEP 2: Send to both models in parallel (background)
      const [leftResponse, rightResponse] = await Promise.allSettled([
        sendChat.mutateAsync({
          question: message,
          model: leftModel as import("@/lib/api/types").ModelName,
          session_id: sessionId,
          chat_history: [], // TODO: Build chat history from messages if needed
          system_prompts: selectedSystemPrompts,
        }),
        sendChat.mutateAsync({
          question: message,
          model: rightModel as import("@/lib/api/types").ModelName,
          session_id: sessionId,
          chat_history: [], // TODO: Build chat history from messages if needed
          system_prompts: selectedSystemPrompts,
        }),
      ]);

      // Collect responses and token counts
      const responses: string[] = [];
      let totalTokens = 0;

      // DEBUG: Log raw responses
      console.log('🔍 Raw LLM responses:', {
        left: {
          status: leftResponse.status,
          value: leftResponse.status === 'fulfilled' ? leftResponse.value : null,
          reason: leftResponse.status === 'rejected' ? leftResponse.reason : null,
        },
        right: {
          status: rightResponse.status,
          value: rightResponse.status === 'fulfilled' ? rightResponse.value : null,
          reason: rightResponse.status === 'rejected' ? rightResponse.reason : null,
        },
      });

      // Handle left model response
      if (leftResponse.status === "fulfilled") {
        // Extract token usage (works for OpenAI, Gemini, Groq)
        const usage = leftResponse.value.usage;
        console.log('🔍 Left model usage object:', usage);
        if (usage) {
          const tokens = usage.total_tokens || usage.total_token_count || 0;
          totalTokens += tokens;
          console.log(`🔢 Left model tokens: ${tokens} (total_tokens: ${usage.total_tokens}, total_token_count: ${usage.total_token_count})`);
        } else {
          console.warn('⚠️ Left model has NO usage data');
        }

        if (leftResponse.value.answer) {
          console.log('✅ Left model response:', leftResponse.value.answer.slice(0, 100));
          responses.push(leftResponse.value.answer);
        } else if (leftResponse.value.error_message) {
          console.error('❌ Left model returned error:', leftResponse.value.error_message);
          setErrorLeft(leftResponse.value.error_message);
          responses.push(""); // Empty response for error
        } else {
          console.warn('⚠️ Left model returned null answer (no error)');
          responses.push(""); // Empty response for null answer
        }
      } else {
        console.error('❌ Left model promise rejected:', leftResponse.reason);
        setErrorLeft(leftResponse.reason?.message || "Failed to get response from left model");
        responses.push(""); // Placeholder for failed response
      }

      // Handle right model response
      if (rightResponse.status === "fulfilled") {
        // Extract token usage (works for OpenAI, Gemini, Groq)
        const usage = rightResponse.value.usage;
        console.log('🔍 Right model usage object:', usage);
        if (usage) {
          const tokens = usage.total_tokens || usage.total_token_count || 0;
          totalTokens += tokens;
          console.log(`🔢 Right model tokens: ${tokens} (total_tokens: ${usage.total_tokens}, total_token_count: ${usage.total_token_count})`);
        } else {
          console.warn('⚠️ Right model has NO usage data');
        }

        if (rightResponse.value.answer) {
          console.log('✅ Right model response:', rightResponse.value.answer.slice(0, 100));
          responses.push(rightResponse.value.answer);
        } else if (rightResponse.value.error_message) {
          console.error('❌ Right model returned error:', rightResponse.value.error_message);
          setErrorRight(rightResponse.value.error_message);
          responses.push(""); // Empty response for error
        } else {
          console.warn('⚠️ Right model returned null answer (no error)');
          responses.push(""); // Empty response for null answer
        }
      } else {
        console.error('❌ Right model promise rejected:', rightResponse.reason);
        setErrorRight(rightResponse.reason?.message || "Failed to get response from right model");
        responses.push(""); // Ensure we have 2 elements
      }

      console.log('📦 Responses to save:', {
        count: responses.length,
        hasLeft: responses[0]?.length > 0,
        hasRight: responses[1]?.length > 0,
        leftPreview: responses[0]?.slice(0, 50),
        rightPreview: responses[1]?.slice(0, 50),
        totalTokens,
      });

      // STEP 3: Update optimistic message with real responses
      // First, update the cache manually (replace empty llm_responses with real data)
      console.log('🔄 Updating optimistic message with real responses');
      queryClient.setQueryData<Prompt[]>(queryKey, (old: Prompt[] | undefined) => {
        if (!old || old.length === 0) return old;
        
        // Find and update the optimistic message (last message with matching text)
        const lastMessage = old[old.length - 1];
        if (lastMessage && lastMessage.prompt_text === message) {
          return [
            ...old.slice(0, -1),
            {
              ...lastMessage,
              llm_responses: responses, // Update with real responses
            },
          ];
        }
        return old;
      });

      // STEP 4: Save to backend (this will trigger onSuccess and refetch)
      // We skip the onMutate hook by updating cache manually above
      await savePrompt.mutateAsync({
        session_id: sessionId,
        prompt_text: message,
        llm_responses: responses, // Array of [leftResponse, rightResponse]
        tokens_used: totalTokens, // Total tokens used by both models
      });

      console.log(`✅ Successfully saved prompt with dual responses (${totalTokens} tokens used)`);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to send message";
      setErrorLeft(errorMsg);
      setErrorRight(errorMsg);
      
      // Rollback: Remove optimistic message on error
      console.log('❌ Error occurred, rolling back optimistic update');
      queryClient.setQueryData<Prompt[]>(queryKey, (old: Prompt[] | undefined) => {
        if (!old || old.length === 0) return old;
        // Remove the last message if it matches our optimistic message
        const lastMessage = old[old.length - 1];
        if (lastMessage && lastMessage.prompt_text === message && lastMessage.prompt_id.startsWith('temp-')) {
          return old.slice(0, -1);
        }
        return old;
      });
    } finally {
      setIsLoadingLeft(false);
      setIsLoadingRight(false);
    }
  };

  if (!sessionId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">No session selected</p>
          <p className="mt-2 text-sm">
            Create a new session or select an existing one to start chatting
          </p>
        </div>
      </div>
    );
  }

  if (isLoadingHistory) {
    return (
      <div className="grid h-full grid-cols-2 gap-4">
        <ChatAreaSkeleton />
        <ChatAreaSkeleton />
      </div>
    );
  }

  const isLoading = isLoadingLeft || isLoadingRight;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Dual chat areas - grid takes remaining space */}
      {/* CRITICAL: grid has flex-1 min-h-0 but NO overflow-hidden! */}
      <div className="grid flex-1 grid-cols-2 gap-4 p-4 min-h-0">
        <ChatArea
          model={leftModel}
          messages={leftMessages}
          isLoading={isLoadingLeft}
          error={errorLeft}
          onModelChange={setLeftModel}
          excludeModel={rightModel}
        />
        <ChatArea
          model={rightModel}
          messages={rightMessages}
          isLoading={isLoadingRight}
          error={errorRight}
          onModelChange={setRightModel}
          excludeModel={leftModel}
        />
      </div>

      {/* Single input at bottom - fixed position */}
      <div className="shrink-0 border-t bg-background">
        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          placeholder={`Ask ${leftModel} and ${rightModel}...`}
        />
      </div>
    </div>
  );
}
