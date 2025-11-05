import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Chat Store
 * 
 * Manages ONLY:
 * - Current input text (ephemeral, not persisted)
 * - Model selections (persisted to localStorage)
 * 
 * Chat history is managed by React Query (useChatHistory hook).
 * Messages are fetched from Backend-da and cached automatically.
 */
interface ChatState {
  // Current input (ephemeral, cleared after send)
  currentInput: string;
  setInput: (input: string) => void;
  clearInput: () => void;

  // Selected models (persisted to localStorage)
  leftModel: string;
  rightModel: string;
  setLeftModel: (model: string) => void;
  setRightModel: (model: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      // Input state (not persisted)
      currentInput: "",
      setInput: (input) => set({ currentInput: input }),
      clearInput: () => set({ currentInput: "" }),

      // Model selection (persisted to localStorage)
      // Default models: gpt-5 (OpenAI flagship) and gemini-2.5-flash (Google fast model)
      leftModel: "gpt-5",
      rightModel: "gemini-2.5-flash",
      setLeftModel: (model) => set({ leftModel: model }),
      setRightModel: (model) => set({ rightModel: model }),
    }),
    {
      name: "tellmemore-chat-state",
      // Only persist model selections, NOT input
      partialize: (state) => ({
        leftModel: state.leftModel,
        rightModel: state.rightModel,
      }),
    }
  )
);
