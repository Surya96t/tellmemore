"use client";

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
import { useDeleteSession } from "@/lib/hooks/useSessions";
import { toast } from "sonner";

interface DeleteSessionDialogProps {
  sessionId: string;
  sessionTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteSessionDialog({
  sessionId,
  sessionTitle,
  open,
  onOpenChange,
}: DeleteSessionDialogProps) {
  const deleteSession = useDeleteSession();

  const handleDelete = async () => {
    try {
      await deleteSession.mutateAsync(sessionId);
      toast.success("Session deleted");
      onOpenChange(false);
    } catch {
      toast.error("Failed to delete session");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Session?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &ldquo;{sessionTitle}&rdquo;? This
            action cannot be undone and all chat history will be permanently
            deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleteSession.isPending}
          >
            {deleteSession.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
