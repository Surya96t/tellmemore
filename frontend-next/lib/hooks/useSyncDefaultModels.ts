/**
 * Sync Chat Models with Settings
 * 
 * This hook ensures that when a user changes their default model preferences
 * in settings, those defaults are applied to new chat sessions.
 */
import { useEffect } from "react";
import { useChatStore } from "@/lib/stores/chatStore";
import { useUiStore } from "@/lib/stores/uiStore";

export function useSyncDefaultModels() {
  const { defaultLeftModel, defaultRightModel } = useUiStore();
  const { setLeftModel, setRightModel, leftModel, rightModel } = useChatStore();

  useEffect(() => {
    // Only sync if chatStore models haven't been set yet (first load)
    // or if user explicitly changed settings
    const isFirstLoad = leftModel === "gpt-5" && rightModel === "gemini-2.5-flash";
    
    if (isFirstLoad) {
      setLeftModel(defaultLeftModel);
      setRightModel(defaultRightModel);
    }
  }, [defaultLeftModel, defaultRightModel, leftModel, rightModel, setLeftModel, setRightModel]);
}
