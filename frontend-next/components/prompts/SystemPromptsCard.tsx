"use client";

import { useSystemPrompts } from "@/lib/hooks";
import type { SystemPrompt } from "@/lib/api/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { usePromptsStore } from "@/lib/stores/promptsStore";

export function SystemPromptsCard() {
  const { data: prompts, isLoading, error } = useSystemPrompts();
  const { selectedSystemPrompts, toggleSystemPrompt } = usePromptsStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary flex items-center justify-between">
          <span>System Prompts</span>
          <Badge variant="secondary">{prompts?.length || 0}</Badge>
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
            Failed to load system prompts
          </p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-2 pr-4">
              {prompts?.map((prompt: SystemPrompt) => (
                <div
                  key={prompt.prompt_id}
                  className="flex items-start space-x-2 p-2 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => toggleSystemPrompt(prompt.prompt_id)}
                >
                  <Checkbox
                    checked={selectedSystemPrompts.has(prompt.prompt_id)}
                    onCheckedChange={() => toggleSystemPrompt(prompt.prompt_id)}
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-muted-foreground line-clamp-3">
                      {prompt.prompt_text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
