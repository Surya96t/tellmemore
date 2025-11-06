"use client";

import { useUserPrompts, useDeleteUserPrompt } from "@/lib/hooks";
import type { UserPrompt } from "@/lib/api/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { AddPromptDialog } from "./AddPromptDialog";
import { usePromptsStore } from "@/lib/stores/promptsStore";
import { useChatStore } from "@/lib/stores/chatStore";

export function UserPromptsCard() {
  const { data: prompts, isLoading, error } = useUserPrompts();
  const deletePrompt = useDeleteUserPrompt();
  const { selectedUserPrompts, toggleUserPrompt } = usePromptsStore();
  const { setInput } = useChatStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handlePromptClick = (promptText: string, e: React.MouseEvent) => {
    // Insert prompt text into chat input
    setInput(promptText);
    e.stopPropagation();
  };

  const handleDelete = async (promptId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this prompt?")) {
      await deletePrompt.mutateAsync(promptId);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center justify-between">
            <span>My Prompts</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{prompts?.length || 0}</Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : error ? (
            <p className="text-sm text-muted-foreground">
              Failed to load prompts
            </p>
          ) : prompts && prompts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-2">
                No custom prompts yet
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Create your first prompt
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pr-4">
                {prompts?.map((prompt: UserPrompt) => (
                  <div
                    key={prompt.prompt_id}
                    className="flex items-start space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer group"
                    onClick={(e) => handlePromptClick(prompt.prompt_text, e)}
                  >
                    <Checkbox
                      checked={selectedUserPrompts.has(prompt.prompt_id)}
                      onCheckedChange={() => toggleUserPrompt(prompt.prompt_id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1 space-y-1 min-w-0">
                      <p className="text-xs text-muted-foreground line-clamp-3 wrap-break-word">
                        {prompt.prompt_text}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      onClick={(e) => handleDelete(prompt.prompt_id, e)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <AddPromptDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </>
  );
}
