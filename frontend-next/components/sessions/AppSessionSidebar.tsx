"use client";

import { useState } from "react";
import { useSessions, useUpdateSession, useDeleteSession } from "@/lib/hooks";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarHeader,
  SidebarRail,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { MessageSquarePlus, Calendar, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useCreateSession } from "@/lib/hooks";
import { toast } from "sonner";
import { UserButton } from "@clerk/nextjs";
import type { ChatSession } from "@/lib/api/types";
import Image from "next/image";

function groupSessionsByDate(sessions: ChatSession[]) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const today: ChatSession[] = [];
  const last7Days: ChatSession[] = [];
  const last30Days: ChatSession[] = [];
  const older: ChatSession[] = [];

  sessions.forEach((session) => {
    const createdAt = new Date(session.created_at);
    const isToday = createdAt.toDateString() === now.toDateString();

    if (isToday) {
      today.push(session);
    } else if (createdAt > sevenDaysAgo) {
      last7Days.push(session);
    } else if (createdAt > thirtyDaysAgo) {
      last30Days.push(session);
    } else {
      older.push(session);
    }
  });

  return { today, last7Days, last30Days, older };
}

export function AppSessionSidebar() {
  const { data: sessions, isLoading, error } = useSessions();
  const createSession = useCreateSession();
  const updateSession = useUpdateSession();
  const deleteSession = useDeleteSession();

  // State for rename dialog
  const [renamingSession, setRenamingSession] = useState<ChatSession | null>(null);
  const [newTitle, setNewTitle] = useState("");

  // State for delete confirmation dialog
  const [deletingSession, setDeletingSession] = useState<ChatSession | null>(null);

  // Sort sessions by created_at descending (newest first) as a fallback
  const sortedSessions = sessions
    ? [...sessions].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : [];

  const grouped = groupSessionsByDate(sortedSessions);

  const handleNewSession = async () => {
    try {
      await createSession.mutateAsync({ title: "New Chat Session" });
      toast.success("New session created");
    } catch {
      toast.error("Failed to create session");
    }
  };

  const handleRenameClick = (session: ChatSession) => {
    setRenamingSession(session);
    setNewTitle(session.title);
  };

  const handleRenameConfirm = async () => {
    if (!renamingSession || !newTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      await updateSession.mutateAsync({
        sessionId: renamingSession.session_id,
        data: { title: newTitle.trim() },
      });
      toast.success("Session renamed");
      setRenamingSession(null);
      setNewTitle("");
    } catch {
      toast.error("Failed to rename session");
    }
  };

  const handleDeleteClick = (session: ChatSession) => {
    setDeletingSession(session);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSession) return;

    try {
      await deleteSession.mutateAsync(deletingSession.session_id);
      toast.success("Session deleted");
      setDeletingSession(null);
    } catch {
      toast.error("Failed to delete session");
    }
  };

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar">
      <SidebarHeader className="border-b">
        <div className="flex flex-col gap-3 px-4 py-3">
          {/* Logo and Title */}
          <div className="flex items-center gap-2">
            <Image
              src="/db_logo.jpg"
              alt="TellMeMore"
              width={28}
              height={28}
              className="rounded"
            />
            <span className="text-lg font-semibold">TellMeMore</span>
          </div>
          
          {/* New Session Button */}
          <Button
            onClick={handleNewSession}
            disabled={createSession.isPending}
            className="w-full gap-2"
            size="default"
            variant="default"
          >
            <MessageSquarePlus className="h-4 w-4" />
            <span>New Session</span>
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {isLoading ? (
          <div className="space-y-2 px-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : error ? (
          <div className="px-2 py-4 text-sm text-muted-foreground">
            Failed to load sessions
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <div className="px-2 py-4 text-sm text-muted-foreground text-center">
            No sessions yet. Create one to get started!
          </div>
        ) : (
          <>
            {grouped?.today && grouped.today.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>Today</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {grouped.today.map((session) => (
                      <SidebarMenuItem key={session.session_id}>
                        <SidebarMenuButton asChild>
                          <a href={`/dashboard?session=${session.session_id}`}>
                            <Calendar className="h-4 w-4" />
                            <span className="truncate">{session.title}</span>
                          </a>
                        </SidebarMenuButton>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuAction showOnHover>
                              <MoreHorizontal />
                              <span className="sr-only">More</span>
                            </SidebarMenuAction>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" align="start">
                            <DropdownMenuItem onClick={() => handleRenameClick(session)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Rename</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteClick(session)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {grouped?.last7Days && grouped.last7Days.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>Last 7 Days</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {grouped.last7Days.map((session) => (
                      <SidebarMenuItem key={session.session_id}>
                        <SidebarMenuButton asChild>
                          <a href={`/dashboard?session=${session.session_id}`}>
                            <Calendar className="h-4 w-4" />
                            <span className="truncate">{session.title}</span>
                          </a>
                        </SidebarMenuButton>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuAction showOnHover>
                              <MoreHorizontal />
                              <span className="sr-only">More</span>
                            </SidebarMenuAction>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" align="start">
                            <DropdownMenuItem onClick={() => handleRenameClick(session)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Rename</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteClick(session)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {grouped?.last30Days && grouped.last30Days.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>Last 30 Days</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {grouped.last30Days.map((session) => (
                      <SidebarMenuItem key={session.session_id}>
                        <SidebarMenuButton asChild>
                          <a href={`/dashboard?session=${session.session_id}`}>
                            <Calendar className="h-4 w-4" />
                            <span className="truncate">{session.title}</span>
                          </a>
                        </SidebarMenuButton>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuAction showOnHover>
                              <MoreHorizontal />
                              <span className="sr-only">More</span>
                            </SidebarMenuAction>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" align="start">
                            <DropdownMenuItem onClick={() => handleRenameClick(session)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Rename</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteClick(session)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}

            {grouped?.older && grouped.older.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>Older</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {grouped.older.map((session) => (
                      <SidebarMenuItem key={session.session_id}>
                        <SidebarMenuButton asChild>
                          <a href={`/dashboard?session=${session.session_id}`}>
                            <Calendar className="h-4 w-4" />
                            <span className="truncate">{session.title}</span>
                          </a>
                        </SidebarMenuButton>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuAction showOnHover>
                              <MoreHorizontal />
                              <span className="sr-only">More</span>
                            </SidebarMenuAction>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent side="right" align="start">
                            <DropdownMenuItem onClick={() => handleRenameClick(session)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Rename</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteClick(session)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg"
              asChild
            >
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={(e) => {
                  // Trigger UserButton click
                  const userButton = e.currentTarget.querySelector('button');
                  if (userButton) {
                    userButton.click();
                  }
                }}
              >
                {/* Clerk UserButton - client-only to prevent hydration mismatch */}
                {typeof window !== 'undefined' && <UserButton afterSignOutUrl="/" />}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium truncate">User Account</span>
                  <span className="text-xs text-muted-foreground">Manage profile</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />

      {/* Rename Dialog */}
      <AlertDialog open={!!renamingSession} onOpenChange={(open) => !open && setRenamingSession(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Session</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new title for this session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Session title"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleRenameConfirm();
              }
            }}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRenamingSession(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRenameConfirm}>
              Rename
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingSession} onOpenChange={(open) => !open && setDeletingSession(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deletingSession?.title}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingSession(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sidebar>
  );
}
