"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { QuotaCard } from "@/components/quota/QuotaCard";
import { SystemPromptsCard } from "@/components/prompts/SystemPromptsCard";
import { UserPromptsCard } from "@/components/prompts/UserPromptsCard";
import { Button } from "@/components/ui/button";
import { PanelRight } from "lucide-react";

interface PromptsSheetProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PromptsSheet({ trigger, open, onOpenChange }: PromptsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" title="Toggle prompts panel">
            <PanelRight className="h-4 w-4" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Dashboard</SheetTitle>
          <SheetDescription>
            View your daily quota, system prompts, and custom prompts
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-auto px-4 space-y-6">
          <QuotaCard />
          <SystemPromptsCard />
          <UserPromptsCard />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Keep old name for backward compatibility during migration
export const AppRightSidebar = PromptsSheet;
