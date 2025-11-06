"use client";

import { useUiStore } from "@/lib/stores/uiStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuotaCard } from "@/components/quota/QuotaCard";
import { SystemPromptsCard } from "@/components/prompts/SystemPromptsCard";
import { UserPromptsCard } from "@/components/prompts/UserPromptsCard";
import { PanelRightClose, PanelRightOpen } from "lucide-react";

interface RightSidebarProps {
  collapsed: boolean;
}

export function RightSidebar({ collapsed }: RightSidebarProps) {
  const { toggleRightSidebar } = useUiStore();

  return (
    <aside
      className={`bg-background border-l border-border transition-all duration-300 ${
        collapsed ? "w-16" : "w-80"
      }`}
    >
      {/* Toggle Button */}
      <div className="p-4 flex justify-start border-b border-border">
        <Button variant="ghost" size="icon" onClick={toggleRightSidebar}>
          {collapsed ? (
            <PanelRightOpen className="h-5 w-5" />
          ) : (
            <PanelRightClose className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar Content */}
      {!collapsed && (
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-4 space-y-6">
            <QuotaCard />
            <SystemPromptsCard />
            <UserPromptsCard />
          </div>
        </ScrollArea>
      )}
    </aside>
  );
}
