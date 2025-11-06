"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DeleteSessionDialog } from "./DeleteSessionDialog";
import { useUpdateSession } from "@/lib/hooks/useSessions";
import { toast } from "sonner";
import type { ChatSession } from "@/lib/api/types";

interface SessionItemProps {
  session: ChatSession;
}

export function SessionItem({ session }: SessionItemProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(session.title);
  const updateSession = useUpdateSession();

  const handleClick = () => {
    if (!isEditing) {
      router.push(`/dashboard/${session.session_id}`);
    }
  };

  const handleSave = async () => {
    if (!editedTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      await updateSession.mutateAsync({
        sessionId: session.session_id,
        data: { title: editedTitle.trim() },
      });
      toast.success("Session renamed");
      setIsEditing(false);
    } catch {
      toast.error("Failed to rename session");
      setEditedTitle(session.title); // Reset on error
    }
  };

  const handleCancel = () => {
    setEditedTitle(session.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  // Show tooltip if title is longer than 30 chars (sidebar display limit)
  const shouldShowTooltip = session.title.length > 30;

  return (
    <li className="group relative">
      {isEditing ? (
        // Edit mode
        <div className="flex items-center gap-1 px-2 py-1.5">
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-8 text-sm flex-1"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSave();
            }}
            className="p-1.5 hover:bg-primary/10 rounded"
            disabled={updateSession.isPending}
            aria-label="Save changes"
          >
            <Check className="h-4 w-4 text-green-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCancel();
            }}
            className="p-1.5 hover:bg-destructive/10 rounded"
            aria-label="Cancel"
          >
            <X className="h-4 w-4 text-destructive" />
          </button>
        </div>
      ) : (
        // View mode
        <div className="flex items-center gap-1 w-full">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex-1 justify-start text-left font-normal"
                  onClick={handleClick}
                >
                  <span className="truncate">{session.title}</span>
                </Button>
              </TooltipTrigger>
              {shouldShowTooltip && (
                <TooltipContent side="right">
                  <p className="max-w-xs">{session.title}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          {/* Action buttons - visible for testing */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* Rename button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1.5 hover:bg-primary/10 rounded border border-primary"
              aria-label="Rename session"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>

            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteDialogOpen(true);
              }}
              className="p-1.5 hover:bg-destructive/10 rounded border border-destructive"
              aria-label="Delete session"
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <DeleteSessionDialog
        sessionId={session.session_id}
        sessionTitle={session.title}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </li>
  );
}
