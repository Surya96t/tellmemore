import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Prompts Store
 * 
 * Manages selected system and user prompts for chat context.
 * Selected prompts are persisted to localStorage.
 */
interface PromptsState {
  // Selected system prompt IDs (for chat context)
  selectedSystemPrompts: Set<string>;
  toggleSystemPrompt: (promptId: string) => void;
  clearSystemPrompts: () => void;

  // Selected user prompt IDs (for chat context)
  selectedUserPrompts: Set<string>;
  toggleUserPrompt: (promptId: string) => void;
  clearUserPrompts: () => void;

  // Get selected prompt texts (for sending to backend)
  getSelectedSystemPromptTexts: (allPrompts: Array<{ prompt_id: string; prompt_text: string }>) => string[];
  getSelectedUserPromptTexts: (allPrompts: Array<{ prompt_id: string; prompt_text: string }>) => string[];
}

export const usePromptsStore = create<PromptsState>()(
  persist(
    (set, get) => ({
      selectedSystemPrompts: new Set(),
      selectedUserPrompts: new Set(),

      toggleSystemPrompt: (promptId) =>
        set((state) => {
          const next = new Set(state.selectedSystemPrompts);
          if (next.has(promptId)) {
            next.delete(promptId);
          } else {
            next.add(promptId);
          }
          return { selectedSystemPrompts: next };
        }),

      clearSystemPrompts: () => set({ selectedSystemPrompts: new Set() }),

      toggleUserPrompt: (promptId) =>
        set((state) => {
          const next = new Set(state.selectedUserPrompts);
          if (next.has(promptId)) {
            next.delete(promptId);
          } else {
            next.add(promptId);
          }
          return { selectedUserPrompts: next };
        }),

      clearUserPrompts: () => set({ selectedUserPrompts: new Set() }),

      getSelectedSystemPromptTexts: (allPrompts) => {
        const selected = get().selectedSystemPrompts;
        return allPrompts
          .filter((p) => selected.has(p.prompt_id))
          .map((p) => p.prompt_text);
      },

      getSelectedUserPromptTexts: (allPrompts) => {
        const selected = get().selectedUserPrompts;
        return allPrompts
          .filter((p) => selected.has(p.prompt_id))
          .map((p) => p.prompt_text);
      },
    }),
    {
      name: "tellmemore-prompts-state",
      // Custom serializer for Sets
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            state: {
              ...parsed.state,
              selectedSystemPrompts: new Set(parsed.state.selectedSystemPrompts || []),
              selectedUserPrompts: new Set(parsed.state.selectedUserPrompts || []),
            },
          };
        },
        setItem: (name, value) => {
          const toStore = {
            state: {
              ...value.state,
              selectedSystemPrompts: Array.from(value.state.selectedSystemPrompts),
              selectedUserPrompts: Array.from(value.state.selectedUserPrompts),
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
