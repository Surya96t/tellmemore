import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  // Fullscreen mode
  isFullscreen: boolean;
  toggleFullscreen: () => void;

  // Sidebar collapsed states
  leftSidebarCollapsed: boolean;
  rightSidebarCollapsed: boolean;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;

  // Appearance preferences
  fontSize: number; // Font size in pixels (default: 14)
  setFontSize: (size: number) => void;

  // Default model preferences
  defaultLeftModel: string;
  defaultRightModel: string;
  setDefaultLeftModel: (modelId: string) => void;
  setDefaultRightModel: (modelId: string) => void;

  // Notification preferences
  enableNotifications: boolean;
  toggleNotifications: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      // Fullscreen state
      isFullscreen: false,

      toggleFullscreen: () =>
        set((state) => {
          const newFullscreen = !state.isFullscreen;

          // Apply fullscreen to document
          if (typeof document !== "undefined") {
            if (newFullscreen) {
              document.documentElement.requestFullscreen?.();
            } else {
              document.exitFullscreen?.();
            }
          }

          return { isFullscreen: newFullscreen };
        }),

      // Sidebar states
      leftSidebarCollapsed: false,
      rightSidebarCollapsed: false,

      toggleLeftSidebar: () =>
        set((state) => ({
          leftSidebarCollapsed: !state.leftSidebarCollapsed,
        })),

      toggleRightSidebar: () =>
        set((state) => ({
          rightSidebarCollapsed: !state.rightSidebarCollapsed,
        })),

      // Appearance preferences
      fontSize: 14, // Default 14px

      setFontSize: (size: number) =>
        set(() => ({
          fontSize: Math.max(12, Math.min(20, size)), // Clamp between 12-20px
        })),

      // Default model preferences
      defaultLeftModel: "gpt-4o",
      defaultRightModel: "gemini-2.0-flash-exp",

      setDefaultLeftModel: (modelId: string) =>
        set(() => ({
          defaultLeftModel: modelId,
        })),

      setDefaultRightModel: (modelId: string) =>
        set(() => ({
          defaultRightModel: modelId,
        })),

      // Notification preferences
      enableNotifications: true,

      toggleNotifications: () =>
        set((state) => ({
          enableNotifications: !state.enableNotifications,
        })),
    }),
    {
      name: "tellmemore-ui-preferences",
    }
  )
);
