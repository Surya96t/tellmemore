"use client";

import { useState, useEffect, useRef } from "react";
import { Maximize, Minimize, Search, PanelRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { useUiStore } from "@/lib/stores/uiStore";
import { PromptsSheet } from "@/components/sidebar/AppRightSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSession } from "@/lib/hooks/useSessions";
import { GlobalSearchDropdown } from "@/components/search/GlobalSearchDropdown";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DashboardHeaderProps {
  sessionId?: string;
}

export function DashboardHeader({ sessionId }: DashboardHeaderProps) {
  const { isFullscreen, toggleFullscreen } = useUiStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [promptsSheetOpen, setPromptsSheetOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch session data to get title
  const { data: currentSession } = useSession(sessionId || null);
  const sessionTitle = currentSession?.title || "New Chat";

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        e.stopPropagation();
        searchInputRef.current?.focus();
        return;
      }
      
      // Cmd/Ctrl + / to toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        e.stopPropagation();
        document.querySelector<HTMLButtonElement>('[data-sidebar="trigger"]')?.click();
        return;
      }
      
      // Cmd/Ctrl + B to toggle prompts sheet
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        e.stopPropagation();
        setPromptsSheetOpen(prev => !prev);
        return;
      }
      
      // Esc to clear search/blur
      if (e.key === 'Escape') {
        if (searchFocused) {
          e.preventDefault();
          e.stopPropagation();
          setSearchQuery("");
          searchInputRef.current?.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchFocused]);

  return (
    <header className="flex h-14 w-full shrink-0 items-center gap-3 border-b px-4 bg-background">
      {/* Mobile Search Mode - Full width search bar */}
      {mobileSearchOpen ? (
        <div className="flex items-center gap-2 w-full sm:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => {
                setSearchFocused(false);
                if (!searchQuery) {
                  setMobileSearchOpen(false);
                }
              }}
              className="pl-10"
              autoFocus
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setMobileSearchOpen(false);
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <>
          {/* Left: Sidebar Trigger + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <SidebarTrigger className="-ml-1" data-sidebar="trigger" />
            
            {sessionTitle && sessionId && (
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <BreadcrumbPage className="font-medium text-sm truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px] lg:max-w-[500px]">
                            {sessionTitle}
                          </BreadcrumbPage>
                        </TooltipTrigger>
                        {sessionTitle.length > 30 && (
                          <TooltipContent side="bottom" className="max-w-[400px] wrap-break-word">
                            <p>{sessionTitle}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Center: Global Search (responsive width, hidden on mobile) */}
          <div className="relative hidden sm:block w-full sm:w-64 md:w-80 lg:w-96 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => {
                // Delay blur to allow clicking on dropdown
                setTimeout(() => setSearchFocused(false), 200);
              }}
              className="pl-10 pr-24"
            />
            {!searchFocused && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                <Kbd className="text-xs">⌘</Kbd>
                <span>/</span>
                <Kbd className="text-xs">Ctrl</Kbd>
                <Kbd className="text-xs">K</Kbd>
              </div>
            )}
            
            {/* Search dropdown */}
            <GlobalSearchDropdown
              query={searchQuery}
              isOpen={searchFocused}
              onClose={() => {
                setSearchQuery("");
                setSearchFocused(false);
                searchInputRef.current?.blur();
              }}
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right: Search (mobile only) + Settings + Fullscreen + Prompts Sheet */}
          <div className="flex items-center gap-2">
            {/* Mobile search button - shows on small screens */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileSearchOpen(true)}
              className="sm:hidden"
              title="Search (⌘/Ctrl+K)"
            >
              <Search className="h-4 w-4" />
            </Button>
            
            {/* Settings Button */}
            <Link href="/settings/profile">
              <Button
                variant="ghost"
                size="icon"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="h-4 w-4" />
              ) : (
                <Maximize className="h-4 w-4" />
              )}
            </Button>
            <PromptsSheet 
              open={promptsSheetOpen}
              onOpenChange={setPromptsSheetOpen}
              trigger={
                <Button 
                  variant="ghost" 
                  size="icon" 
                  title="Toggle prompts panel (⌘/Ctrl+B)"
                >
                  <PanelRight className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        </>
      )}
    </header>
  );
}
