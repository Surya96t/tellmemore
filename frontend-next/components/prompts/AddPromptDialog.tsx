"use client";

import { useCreateUserPrompt } from "@/lib/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

interface AddPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPromptDialog({ open, onOpenChange }: AddPromptDialogProps) {
  const [promptText, setPromptText] = useState("");
  const createPrompt = useCreateUserPrompt();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!promptText.trim()) {
      toast.error("Prompt text cannot be empty");
      return;
    }

    try {
      await createPrompt.mutateAsync({ prompt_text: promptText });
      toast.success("Prompt created successfully");
      setPromptText("");
      onOpenChange(false);
    } catch {
      toast.error("Failed to create prompt");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Prompt</DialogTitle>
          <DialogDescription>
            Add a custom prompt to your library. You can use it later in your chats.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prompt-text">Prompt Text</Label>
              <Textarea
                id="prompt-text"
                placeholder="Enter your prompt text..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={6}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createPrompt.isPending}>
              {createPrompt.isPending ? "Creating..." : "Create Prompt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
