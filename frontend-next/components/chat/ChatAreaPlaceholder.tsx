"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function ChatAreaPlaceholder() {
  return (
    <div className="flex-1 flex flex-col h-full bg-muted/10">
      {/* Sidebar trigger at top-left */}
      <div className="p-2">
        <SidebarTrigger className="-ml-1" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl w-full space-y-8">
        {/* Empty State */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">
            Dual AI Chat Interface
          </h2>
          <p className="text-muted-foreground">
            Select models below and start a conversation. Compare responses from two different AI models side by side.
          </p>
        </div>

        {/* Model Selectors */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Left Model</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select model..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4 Optimized</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4 Optimized Mini</SelectItem>
                <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash</SelectItem>
                <SelectItem value="llama-3.3-70b-versatile">LLaMA 3.3 70B</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Right Model</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select model..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4 Optimized</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4 Optimized Mini</SelectItem>
                <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash</SelectItem>
                <SelectItem value="llama-3.3-70b-versatile">LLaMA 3.3 70B</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Info Message */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Full chat interface coming in Phase 4</p>
          <p className="mt-1">Create or select a session from the left sidebar to begin</p>
        </div>
      </div>
      </div>
    </div>
  );
}
