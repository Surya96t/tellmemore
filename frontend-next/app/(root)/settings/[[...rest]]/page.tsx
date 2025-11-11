"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Lazy load SettingsTabs for better performance
const SettingsTabs = dynamic(
  () => import("@/components/settings/SettingsTabs").then(mod => ({ default: mod.SettingsTabs })),
  {
    loading: () => (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 sticky top-0 z-10">
        <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            title="Back to Dashboard"
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Title */}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
              Settings
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              Manage your account settings and preferences
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="w-full max-w-3xl sm:max-w-4xl lg:max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <SettingsTabs />
        </div>
      </div>
    </div>
  );
}
