"use client";

import { useSessions } from "@/lib/hooks";
import { useUiStore } from "@/lib/stores/uiStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { NewSessionButton } from "./NewSessionButton";
import { SessionGroup } from "./SessionGroup";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface SessionSidebarProps {
  collapsed: boolean;
}

export function SessionSidebar({ collapsed }: SessionSidebarProps) {
  const { toggleLeftSidebar } = useUiStore();
  const { data: sessions, isLoading, error } = useSessions();

  // Group sessions by date (7 days, 30 days)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const sessions7Days = sessions?.filter(
    (s) => new Date(s.created_at) >= sevenDaysAgo
  );
  const sessions30Days = sessions?.filter(
    (s) =>
      new Date(s.created_at) < sevenDaysAgo &&
      new Date(s.created_at) >= thirtyDaysAgo
  );

  return (
    <aside
      className={`bg-white border-r transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Toggle Button */}
      <div className="p-3 flex justify-end">
        <Button variant="ghost" size="icon" onClick={toggleLeftSidebar}>
          {collapsed ? (
            <PanelLeftOpen className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar Content (hidden when collapsed) */}
      {!collapsed && (
        <div className="px-3 pb-3 flex flex-col gap-4">
          {/* New Session Button */}
          <NewSessionButton />

          {/* Sessions List */}
          <ScrollArea className="flex-1 h-[calc(100vh-200px)]">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : error ? (
              <p className="text-center text-sm text-muted-foreground">
                Failed to load sessions
              </p>
            ) : sessions?.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                No sessions yet. Create one!
              </p>
            ) : (
              <>
                <SessionGroup
                  title="Previous 7 Days"
                  sessions={sessions7Days || []}
                />
                <SessionGroup
                  title="Previous 30 Days"
                  sessions={sessions30Days || []}
                />
              </>
            )}
          </ScrollArea>
        </div>
      )}
    </aside>
  );
}
